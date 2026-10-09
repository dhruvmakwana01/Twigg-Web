/* =========================================================
   TWIGG LOOP PAGE — JAVASCRIPT

   How it works:
   1. The Home Page sends the clicked card's id in the URL:
          loop.html?card=7
   2. This file reads the content from the SHARED media data
      (../shared/media-data.js), renders that item as the large
      FEATURED card and fills the Pinterest grid with every
      other Loop item in a freshly shuffled order.
   3. Clicking a grid card makes it the new featured card, and
      the recommendations are shuffled again. The card you just
      left is NOT placed at the top of the recommendations.
   4. Every Loop page (history entry) remembers its own featured
      card, grid order and scroll position, so going back to a
      Loop page returns to the exact spot, with no scroll-up
      animation.
   5. The latest Loop position is also saved so Home can send
      the user back here (Home ↔ Loop behave as one experience).
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SHARED KEYS (same keys the Home Page uses)
    ===================================================== */

    const HOME_RATIO_KEY = "twigg_home_ratios";
    const MUTE_KEY = "twigg_shared_muted";

    /* Latest Loop position (read by Home) */
    const LOOP_STATE_KEY = "twigg_loop_state";

    /* Position of EACH Loop page (history entry) */
    const LOOP_ENTRIES_KEY = "twigg_loop_entries";


    /* =====================================================
       MEDIA (from the shared data source)
    ===================================================== */

    const Media = window.TwiggMedia;

    if (!Media) {

        console.error(
            "Twigg: ../shared/media-data.js must load before loop.js"
        );

        return;
    }

    const FEED = Media.getFeed("loop");

    if (!FEED.length) {
        return;
    }

    const FEED_IDS = FEED.map(item => item.id);
    const FEED_SET = new Set(FEED_IDS);


    function getItem(id) {

        const media = Media.getById(id);

        return {
            id,
            type: media.type,
            src: media.src,
            thumbnail: media.thumbnail,
            alt: media.title,
            name: media.creator.name,
            profileImage: media.creator.profileImage,
            category: media.category,
            rating: media.rating,
            reviews: media.reviews
        };
    }


    function esc(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }


    /* =====================================================
       ICONS
    ===================================================== */

    const ICONS = {

        muted: `
            <svg viewBox="0 0 24 24">
                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                <path d="M16 9c1 1 1 5 0 6"></path>
            </svg>
        `,

        unmuted: `
            <svg viewBox="0 0 24 24">
                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                <path d="M16 8c2 2 2 6 0 8"></path>
                <path d="M19 5c3 3 3 11 0 14"></path>
            </svg>
        `,

        saved: `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h12v16l-6-4-6 4z"></path>
            </svg>
        `,

        unsaved: `
            <svg viewBox="0 0 24 24">
                <path d="M6 4h12v16l-6-4-6 4z"></path>
            </svg>
        `,

        fullscreen: `
            <svg viewBox="0 0 24 24">
                <path d="M8 3H3v5"></path>
                <path d="M16 3h5v5"></path>
                <path d="M8 21H3v-5"></path>
                <path d="M16 21h5v-5"></path>
            </svg>
        `,

        exitFullscreen: `
            <svg viewBox="0 0 24 24">
                <path d="M9 3v6H3"></path>
                <path d="M15 3v6h6"></path>
                <path d="M9 21v-6H3"></path>
                <path d="M15 21v-6h6"></path>
            </svg>
        `,

        like: `
            <svg viewBox="0 0 24 24">
                <path d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z"></path>
            </svg>
        `,

        save: `
            <svg viewBox="0 0 24 24">
                <path d="M6 4h12v16l-6-4-6 4z"></path>
            </svg>
        `,

        share: `
            <svg viewBox="0 0 24 24">
                <path d="M12 16V4"></path>
                <path d="M7 9l5-5 5 5"></path>
                <path d="M5 13v6h14v-6"></path>
            </svg>
        `,

        report: `
            <svg viewBox="0 0 24 24">
                <path d="M6 3v18"></path>
                <path d="M6 4h11l-2.5 4L17 12H6"></path>
            </svg>
        `,

        star: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z"></path>
            </svg>
        `,

        play: `
            <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"></path>
            </svg>
        `
    };


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const mainEl = document.querySelector(".main");
    const featureEl = document.getElementById("loopFeature");
    const gridEl = document.getElementById("loopGrid");
    const toastEl = document.getElementById("loopToast");

    if (!mainEl || !featureEl || !gridEl) {
        return;
    }


    /* =====================================================
       STATE
    ===================================================== */

    let featuredId = null;
    let featuredEls = null;

    let hoveredVideo = null;

    /* Grid cards are created once and re-ordered, not rebuilt */
    const cardCache = new Map();

    /* Identifies THIS Loop page (history entry) */
    let currentKey = null;

    const savedIds = new Set();
    const likedIds = new Set();
    const reportedIds = new Set();


    /* =====================================================
       NAVIGATION TYPE
       (reload = fresh feed, back_forward = restore)
    ===================================================== */

    const navEntry =
        performance.getEntriesByType("navigation")[0];

    const navType =
        navEntry
            ? navEntry.type
            : "navigate";

    const isLoopReload =
        navType === "reload";


    /* =====================================================
       PER-PAGE POSITIONS (one per Loop page / history entry)
    ===================================================== */

    let entries = {};

    if (!isLoopReload) {

        try {

            entries = JSON.parse(
                sessionStorage.getItem(LOOP_ENTRIES_KEY) || "{}"
            ) || {};

        } catch {

            entries = {};
        }
    }


    function persistEntries() {

        try {

            sessionStorage.setItem(
                LOOP_ENTRIES_KEY,
                JSON.stringify(entries)
            );

        } catch {}
    }


    function newKey() {

        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 7)
        );
    }


    /* =====================================================
       ASPECT RATIOS
    ===================================================== */

    let ratios = {};

    try {

        ratios = JSON.parse(
            sessionStorage.getItem(HOME_RATIO_KEY) || "{}"
        ) || {};

    } catch {

        ratios = {};
    }


    function rememberRatio(id, ratio) {

        ratios[id] = ratio;

        try {

            sessionStorage.setItem(
                HOME_RATIO_KEY,
                JSON.stringify(ratios)
            );

        } catch {}
    }


    /*
       Portrait / vertical media (height greater than width)
       gets the info + actions on the RIGHT of the media on
       desktop/tablet (CSS keeps mobile on the bottom bar).
    */

    function updateOrientation(wrap, ratio) {

        wrap.classList.toggle(
            "is-portrait",
            Number.isFinite(ratio) &&
            ratio > 0 &&
            ratio < 0.999
        );
    }


    /* =====================================================
       SHARED MUTE STATE
    ===================================================== */

    let sharedMuted = true;

    try {

        sharedMuted =
            sessionStorage.getItem(MUTE_KEY) !== "false";

    } catch {

        sharedMuted = true;
    }


    function setSharedMuted(value) {

        sharedMuted = value;

        try {

            sessionStorage.setItem(
                MUTE_KEY,
                String(value)
            );

        } catch {}
    }


    function safePlay(video) {

        const promise = video.play();

        if (promise && promise.catch) {

            promise.catch(() => {

                if (!video.muted) {

                    video.muted = true;

                    setSharedMuted(true);

                    refreshMuteUI();

                    video.play().catch(() => {});
                }
            });
        }
    }


    function refreshMuteUI() {

        const icon =
            sharedMuted
                ? ICONS.muted
                : ICONS.unmuted;

        gridEl
            .querySelectorAll(".unmute-button")
            .forEach(button => {

                button.innerHTML = icon;
            });

        if (featuredEls && featuredEls.muteBtn) {

            featuredEls.muteBtn.innerHTML = icon;

            featuredEls.muteBtn.setAttribute(
                "aria-label",
                sharedMuted ? "Unmute" : "Mute"
            );
        }
    }


    function silenceFeatured(silence) {

        if (!featuredEls || !featuredEls.video) {
            return;
        }

        featuredEls.video.muted =
            silence ? true : sharedMuted;
    }


    /* =====================================================
       SMALL HELPERS
    ===================================================== */

    function shuffle(list) {

        const copy = list.slice();

        for (let i = copy.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    }


    /*
       RECOMMENDATIONS

       A fresh random order of every Loop item except the one
       being featured. The card the user was just looking at
       is moved into the second half of the list, so it never
       shows up again immediately under the new card.
    */

    function buildRecommendationOrder(currentId, previousId) {

        const order =
            shuffle(
                FEED_IDS.filter(id => id !== currentId)
            );

        if (
            previousId !== null &&
            previousId !== currentId
        ) {

            const index = order.indexOf(previousId);

            if (index !== -1) {

                order.splice(index, 1);

                const min =
                    Math.ceil(order.length / 2);

                const position =
                    min +
                    Math.floor(
                        Math.random() *
                        (order.length - min + 1)
                    );

                order.splice(position, 0, previousId);
            }
        }

        return order;
    }


    function buildUrl(id) {

        return `?card=${id}`;
    }


    function readIdFromUrl() {

        const raw =
            new URLSearchParams(location.search).get("card");

        if (raw === null || raw === "") {
            return null;
        }

        const id = Number(raw);

        return (
            Number.isInteger(id) &&
            FEED_SET.has(id)
        )
            ? id
            : null;
    }


    /*
       Jump instantly to a scroll position, ignoring any
       CSS smooth scrolling. No animation, no visible travel.
    */

    function jumpScroll(y) {

        const previous =
            mainEl.style.scrollBehavior;

        mainEl.style.scrollBehavior = "auto";

        mainEl.scrollTop = y;

        mainEl.style.scrollBehavior = previous;
    }


    let toastTimer = null;

    function toast(message) {

        if (!toastEl) {
            return;
        }

        toastEl.textContent = message;

        toastEl.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer =
            setTimeout(() => {

                toastEl.classList.remove("show");

            }, 1800);
    }


    async function shareItem(id) {

        const url =
            new URL(location.href);

        url.search = "";

        url.searchParams.set("card", String(id));

        if (navigator.share) {

            try {

                await navigator.share({
                    title: "Twigg",
                    text: "Check out this creative work on Twigg.",
                    url: url.href
                });

            } catch {
                /* User cancelled sharing. */
            }

            return;
        }

        try {

            await navigator.clipboard.writeText(url.href);

            toast("Link copied!");

        } catch {

            toast("Share is not supported in this browser.");
        }
    }


    /* =====================================================
       LOOP POSITION: SAVE / READ / CLEAR

       Saved: featured card, the exact grid order, and the
       scroll position.

       - LOOP_STATE_KEY  = latest position (Home reads it)
       - entries[key]    = position of THIS Loop page, so each
                           Loop page restores its own scroll
    ===================================================== */

    let loopRestoring = false;
    let leavingForHome = false;


    function clearLoopState() {

        try {

            sessionStorage.removeItem(LOOP_STATE_KEY);

        } catch {}
    }


    function saveLoopState() {

        if (
            loopRestoring ||
            leavingForHome ||
            featuredId === null
        ) {
            return;
        }

        const state = {
            featuredId,
            gridOrder:
                Array.from(gridEl.children)
                    .map(card => Number(card.dataset.cardId)),
            scrollTop: mainEl.scrollTop
        };

        try {

            sessionStorage.setItem(
                LOOP_STATE_KEY,
                JSON.stringify(state)
            );

        } catch {}

        if (currentKey) {

            entries[currentKey] = state;

            persistEntries();
        }
    }


    function sanitizeState(state) {

        if (
            !state ||
            !Number.isInteger(state.featuredId) ||
            !FEED_SET.has(state.featuredId)
        ) {
            return null;
        }

        let order = null;

        if (
            Array.isArray(state.gridOrder) &&
            state.gridOrder.length === FEED_IDS.length - 1 &&
            new Set(state.gridOrder).size === state.gridOrder.length &&
            state.gridOrder.every(
                id =>
                    Number.isInteger(id) &&
                    FEED_SET.has(id) &&
                    id !== state.featuredId
            )
        ) {
            order = state.gridOrder;
        }

        const y = Number(state.scrollTop);

        return {
            featuredId: state.featuredId,
            gridOrder: order,
            scrollTop:
                Number.isFinite(y) && y >= 0
                    ? y
                    : 0
        };
    }


    function readLoopState() {

        try {

            const raw =
                sessionStorage.getItem(LOOP_STATE_KEY);

            return raw
                ? sanitizeState(JSON.parse(raw))
                : null;

        } catch {

            return null;
        }
    }


    function readEntry(key) {

        return (key && entries[key])
            ? sanitizeState(entries[key])
            : null;
    }


    /*
       Restore a saved scroll position without any visible
       scrolling. Try instantly; if the page is not tall
       enough yet, hide it briefly, keep retrying as layout
       settles, then reveal it exactly at the saved position.
    */

    function restoreLoopScroll(y) {

        if (!y) {

            jumpScroll(0);

            return;
        }

        const reached = () =>
            Math.abs(mainEl.scrollTop - y) <= 2;

        jumpScroll(y);

        if (reached()) {

            saveLoopState();

            return;
        }

        loopRestoring = true;

        mainEl.style.visibility = "hidden";

        let watcher = null;
        let revealTimer = null;
        let finishTimer = null;
        let finished = false;

        const userEvents = [
            "wheel",
            "touchstart",
            "keydown",
            "mousedown"
        ];

        const reveal = () => {

            mainEl.style.visibility = "";
        };

        const finish = () => {

            if (finished) {
                return;
            }

            finished = true;

            loopRestoring = false;

            reveal();

            if (watcher) {
                watcher.disconnect();
                watcher = null;
            }

            clearTimeout(revealTimer);
            clearTimeout(finishTimer);

            userEvents.forEach(type => {

                window.removeEventListener(type, finish);
            });

            saveLoopState();
        };

        const attempt = () => {

            jumpScroll(y);

            if (reached()) {
                finish();
            }
        };

        if ("ResizeObserver" in window) {

            watcher = new ResizeObserver(attempt);

            watcher.observe(gridEl);
            watcher.observe(featureEl);
        }

        userEvents.forEach(type => {

            window.addEventListener(
                type,
                finish,
                { passive: true }
            );
        });

        const onLoaded = () => {

            attempt();

            reveal();
        };

        if (document.readyState === "complete") {

            onLoaded();

        } else {

            window.addEventListener(
                "load",
                onLoaded,
                { once: true }
            );
        }

        /* Safety nets */

        revealTimer =
            setTimeout(() => {

                jumpScroll(y);

                reveal();

            }, 1500);

        finishTimer =
            setTimeout(finish, 3500);
    }


    /* =====================================================
       SAVE STATE SYNC
    ===================================================== */

    function renderSaveState() {

        gridEl
            .querySelectorAll(".media-card")
            .forEach(card => {

                const button =
                    card.querySelector(".save-button");

                if (!button) {
                    return;
                }

                const on =
                    savedIds.has(Number(card.dataset.cardId));

                button.classList.toggle("saved", on);

                button.innerHTML =
                    on
                        ? ICONS.saved
                        : ICONS.unsaved;
            });

        if (featuredEls && featuredEls.saveBtn) {

            featuredEls.saveBtn.classList.toggle(
                "is-saved",
                savedIds.has(featuredId)
            );
        }
    }


    /* =====================================================
       ASPECT RATIO + THUMBNAIL
    ===================================================== */

    function setCardRatio(card, id, width, height) {

        if (!width || !height) {
            return;
        }

        const ratio = width / height;

        if (!Number.isFinite(ratio) || ratio <= 0) {
            return;
        }

        card.style.setProperty(
            "--media-ratio",
            String(ratio)
        );

        rememberRatio(id, ratio);
    }


    function bindImageRatio(card, id, image) {

        const update = () => {

            setCardRatio(
                card,
                id,
                image.naturalWidth,
                image.naturalHeight
            );
        };

        if (image.complete) {

            update();

        } else {

            image.addEventListener(
                "load",
                update,
                { once: true }
            );
        }

        image.addEventListener(
            "error",
            () => {

                card.style.removeProperty("--media-ratio");
            },
            { once: true }
        );
    }


    function makePoster(video) {

        if (
            !video.videoWidth ||
            !video.videoHeight ||
            video.poster
        ) {
            return;
        }

        try {

            const canvas = document.createElement("canvas");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                return;
            }

            const capture = () => {

                try {

                    context.drawImage(
                        video,
                        0,
                        0,
                        video.videoWidth,
                        video.videoHeight
                    );

                    video.poster =
                        canvas.toDataURL("image/jpeg", 0.88);

                } catch {
                    /* Canvas extraction can be blocked. */
                }
            };

            if (Math.abs(video.currentTime) < 0.01) {

                capture();

                return;
            }

            video.addEventListener(
                "seeked",
                capture,
                { once: true }
            );

            video.currentTime = 0;

        } catch {
            /* Thumbnail generation is optional. */
        }
    }


    function bindVideoRatio(card, id, video) {

        const update = () => {

            setCardRatio(
                card,
                id,
                video.videoWidth,
                video.videoHeight
            );
        };

        video.addEventListener("loadedmetadata", update);

        video.addEventListener(
            "loadeddata",
            () => {

                update();

                makePoster(video);
            },
            { once: true }
        );

        if (video.readyState >= 1) {
            update();
        }

        if (video.readyState >= 2) {
            update();
            makePoster(video);
        }

        video.load();
    }


    /* =====================================================
       GRID VIDEO BEHAVIOUR
    ===================================================== */

    function bindGridVideo(card, video, muteButton) {

        const indicator = document.createElement("div");

        indicator.className = "video-indicator";

        indicator.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5.5v13l10-6.5-10-6.5z"></path>
            </svg>
        `;

        card.appendChild(indicator);

        video.muted = true;

        if (muteButton) {

            muteButton.innerHTML =
                sharedMuted
                    ? ICONS.muted
                    : ICONS.unmuted;
        }


        card.addEventListener("mouseenter", () => {

            indicator.classList.add("hidden");

            hoveredVideo = video;

            silenceFeatured(true);

            video.muted = sharedMuted;

            gridEl
                .querySelectorAll("video")
                .forEach(other => {

                    if (other !== video) {
                        other.muted = true;
                    }
                });

            refreshMuteUI();

            safePlay(video);
        });


        card.addEventListener("mouseleave", () => {

            indicator.classList.remove("hidden");

            if (hoveredVideo === video) {
                hoveredVideo = null;
            }

            video.pause();

            video.currentTime = 0;

            video.muted = true;

            silenceFeatured(false);
        });


        if (muteButton) {

            muteButton.addEventListener("click", event => {

                event.stopPropagation();

                setSharedMuted(!sharedMuted);

                video.muted = sharedMuted;

                refreshMuteUI();

                if (!sharedMuted) {
                    safePlay(video);
                }
            });
        }
    }


    /* =====================================================
       GRID CARD PROFILE
    ===================================================== */

    function addCardProfile(card, item) {

        const profile = document.createElement("div");

        profile.className = "card-profile";

        let avatar;

        if (item.profileImage) {

            avatar = document.createElement("img");

            avatar.className = "card-profile-image";

            avatar.src = item.profileImage;
            avatar.alt = item.name;
            avatar.loading = "lazy";

        } else {

            avatar = document.createElement("div");

            avatar.className = "card-profile-initial";

            avatar.textContent =
                item.name.charAt(0).toUpperCase();
        }

        const label = document.createElement("span");

        label.className = "card-profile-name";

        label.textContent = item.name;

        profile.appendChild(avatar);
        profile.appendChild(label);

        card.appendChild(profile);
    }


    /* =====================================================
       CREATE A GRID CARD
    ===================================================== */

    function createGridCard(id, lazy) {

        const item = getItem(id);
        const isVideo = item.type === "video";

        const card = document.createElement("article");

        card.className = "media-card";

        card.dataset.cardId = String(id);

        if (ratios[id]) {

            card.style.setProperty(
                "--media-ratio",
                String(ratios[id])
            );
        }


        /* ---------- media ---------- */

        let media;

        if (isVideo) {

            media = document.createElement("video");

            media.muted = true;
            media.loop = true;
            media.playsInline = true;

            media.setAttribute("muted", "");
            media.setAttribute("loop", "");
            media.setAttribute("playsinline", "");

            media.preload = lazy ? "metadata" : "auto";

            if (item.thumbnail) {
                media.poster = item.thumbnail;
            }

            const source = document.createElement("source");

            source.src =
                item.src + (lazy ? "#t=0.001" : "");

            source.type = "video/mp4";

            media.appendChild(source);

        } else {

            media = document.createElement("img");

            media.src = item.src;
            media.alt = item.alt;
            media.loading = "lazy";
        }

        card.appendChild(media);


        /* ---------- action buttons ---------- */

        const actions = document.createElement("div");

        actions.className = "media-actions";

        actions.innerHTML = `
            ${isVideo ? `
                <button class="action-button unmute-button" type="button" aria-label="Unmute video">
                    ${ICONS.muted}
                </button>
            ` : ""}

            <button class="action-button save-button" type="button" aria-label="Save">
                ${savedIds.has(id) ? ICONS.saved : ICONS.unsaved}
            </button>

            <button class="action-button share-button" type="button" aria-label="Share">
                ${ICONS.share}
            </button>
        `;

        card.appendChild(actions);


        const saveButton =
            actions.querySelector(".save-button");

        const shareButton =
            actions.querySelector(".share-button");

        const muteButton =
            actions.querySelector(".unmute-button");

        saveButton.classList.toggle(
            "saved",
            savedIds.has(id)
        );


        /* ---------- ratio + video logic ---------- */

        if (isVideo) {

            bindVideoRatio(card, id, media);

            bindGridVideo(card, media, muteButton);

        } else {

            bindImageRatio(card, id, media);
        }


        /* ---------- save / share ---------- */

        saveButton.addEventListener("click", event => {

            event.stopPropagation();

            if (savedIds.has(id)) {
                savedIds.delete(id);
            } else {
                savedIds.add(id);
            }

            renderSaveState();
        });

        shareButton.addEventListener("click", event => {

            event.stopPropagation();

            shareItem(id);
        });


        /* ---------- profile overlay ---------- */

        addCardProfile(card, item);


        /* ---------- click: becomes featured ---------- */

        card.addEventListener("click", () => {

            setFeatured(id, { push: true });
        });


        return card;
    }


    /* =====================================================
       FINITE GRID

       Every Loop card appears exactly once, except the
       featured card. There is intentionally NO infinite
       scrolling.

       Cards are created once and cached; reshuffling just
       re-orders the existing elements (no reloading of
       media, so the refresh stays smooth).
    ===================================================== */

    function renderGrid(order, animate) {

        const ids =
            order ||
            buildRecommendationOrder(featuredId, null);

        const wanted = new Set(ids);

        Array.from(gridEl.children).forEach(card => {

            if (!wanted.has(Number(card.dataset.cardId))) {
                card.remove();
            }
        });

        const fragment =
            document.createDocumentFragment();

        ids.forEach(id => {

            let card = cardCache.get(id);

            if (!card) {

                card = createGridCard(id, false);

                cardCache.set(id, card);
            }

            fragment.appendChild(card);
        });

        gridEl.appendChild(fragment);

        if (animate) {

            gridEl.classList.remove("loop-grid-refresh");

            void gridEl.offsetWidth;

            gridEl.classList.add("loop-grid-refresh");
        }
    }


    /* =====================================================
       FULL-SCREEN HELPERS
    ===================================================== */

    function realFullscreenElement() {

        return (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            null
        );
    }


    function isFeaturedFullscreen() {

        if (!featuredEls) {
            return false;
        }

        return (
            realFullscreenElement() === featuredEls.media ||
            featuredEls.media.classList.contains(
                "loop-fs-fallback"
            )
        );
    }


    function setFullscreenIcon(active) {

        if (!featuredEls || !featuredEls.fsBtn) {
            return;
        }

        featuredEls.fsBtn.innerHTML =
            active
                ? ICONS.exitFullscreen
                : ICONS.fullscreen;

        featuredEls.fsBtn.setAttribute(
            "aria-label",
            active
                ? "Exit fullscreen"
                : "Enter fullscreen"
        );
    }


    function exitFallbackFullscreen() {

        if (!featuredEls) {
            return;
        }

        featuredEls.media.classList.remove(
            "loop-fs-fallback"
        );

        setFullscreenIcon(false);
    }


    async function toggleFullscreen() {

        if (!featuredEls) {
            return;
        }

        const media = featuredEls.media;
        const video = featuredEls.video;

        if (media.classList.contains("loop-fs-fallback")) {

            exitFallbackFullscreen();

            return;
        }

        if (realFullscreenElement()) {

            try {

                if (document.exitFullscreen) {

                    await document.exitFullscreen();

                } else if (document.webkitExitFullscreen) {

                    document.webkitExitFullscreen();
                }

            } catch {}

            return;
        }

        const request =
            media.requestFullscreen ||
            media.webkitRequestFullscreen;

        if (request) {

            try {

                await request.call(media);

                setFullscreenIcon(true);

            } catch {

                media.classList.add("loop-fs-fallback");

                setFullscreenIcon(true);
            }

            return;
        }

        if (video && video.webkitEnterFullscreen) {

            try {

                video.webkitEnterFullscreen();

                return;

            } catch {}
        }

        media.classList.add("loop-fs-fallback");

        setFullscreenIcon(true);
    }


    function onFullscreenChange() {

        if (!featuredEls) {
            return;
        }

        setFullscreenIcon(
            realFullscreenElement() === featuredEls.media
        );
    }


    document.addEventListener(
        "fullscreenchange",
        onFullscreenChange
    );

    document.addEventListener(
        "webkitfullscreenchange",
        onFullscreenChange
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                featuredEls &&
                featuredEls.media.classList.contains(
                    "loop-fs-fallback"
                )
            ) {

                exitFallbackFullscreen();
            }
        }
    );


    /* =====================================================
       FEATURED CARD
    ===================================================== */

    function teardownFeatured() {

        if (!featuredEls) {
            return;
        }

        if (realFullscreenElement() === featuredEls.media) {

            try {

                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }

            } catch {}
        }

        if (featuredEls.observer) {
            featuredEls.observer.disconnect();
        }

        if (featuredEls.video) {
            featuredEls.video.pause();
        }

        featuredEls = null;
    }


    function renderFeatured(id) {

        teardownFeatured();

        const item = getItem(id);
        const isVideo = item.type === "video";

        const wrap = document.createElement("article");

        wrap.className = "loop-featured";

        wrap.dataset.cardId = String(id);

        if (ratios[id]) {

            wrap.style.setProperty(
                "--media-ratio",
                String(ratios[id])
            );

            /* Known ratio: choose the right layout immediately */
            updateOrientation(wrap, ratios[id]);
        }

        const mediaHtml =
            isVideo
                ? `
                    <video class="loop-video" muted loop playsinline preload="auto"${item.thumbnail ? ` poster="${esc(item.thumbnail)}"` : ""}>
                        <source src="${esc(item.src)}" type="video/mp4">
                    </video>
                  `
                : `
                    <img class="loop-image"
                         src="${esc(item.src.replace("w=900", "w=1600"))}"
                         alt="${esc(item.alt)}">
                  `;

        wrap.innerHTML = `

            <div class="loop-media ${isVideo ? "is-video" : "is-image"}">

                ${mediaHtml}

                <div class="loop-media-controls">

                    ${isVideo ? `
                        <button type="button" class="loop-ctrl loop-mute-btn"
                                aria-label="Unmute">
                            ${sharedMuted ? ICONS.muted : ICONS.unmuted}
                        </button>
                    ` : ""}

                    <button type="button" class="loop-ctrl loop-fs-btn"
                            aria-label="Enter fullscreen">
                        ${ICONS.fullscreen}
                    </button>

                </div>

                ${isVideo ? `
                    <div class="loop-play-indicator">
                        ${ICONS.play}
                    </div>

                    <div class="loop-progress" aria-label="Video progress">
                        <div class="loop-progress-track">
                            <div class="loop-progress-fill"></div>
                        </div>
                    </div>
                ` : ""}

            </div>

            <div class="loop-info">

                <div class="loop-creator">

                    <div class="loop-avatar" aria-hidden="true">
                        ${esc(item.name.charAt(0).toUpperCase())}
                    </div>

                    <div class="loop-creator-text">

                        <div class="loop-name">${esc(item.name)}</div>

                        <div class="loop-category">${esc(item.category)}</div>

                        <div class="loop-rating">

                            <div class="loop-stars">
                                ${ICONS.star.repeat(5)}
                            </div>

                            <span class="loop-rating-value">${esc(item.rating)}</span>

                            <span class="loop-review-count">(${esc(item.reviews)} reviews)</span>

                        </div>

                    </div>

                </div>

                <div class="loop-actions">

                    <button type="button"
                            class="loop-action-btn loop-like-btn ${likedIds.has(id) ? "is-liked" : ""}"
                            aria-label="Like">
                        ${ICONS.like}
                    </button>

                    <button type="button"
                            class="loop-action-btn loop-save-btn ${savedIds.has(id) ? "is-saved" : ""}"
                            aria-label="Save">
                        ${ICONS.save}
                    </button>

                    <button type="button"
                            class="loop-action-btn loop-share-btn"
                            aria-label="Share">
                        ${ICONS.share}
                    </button>

                    <button type="button"
                            class="loop-action-btn loop-report-btn ${reportedIds.has(id) ? "is-reported" : ""}"
                            aria-label="Report">
                        ${ICONS.report}
                    </button>

                </div>

            </div>
        `;

        featureEl.innerHTML = "";
        featureEl.appendChild(wrap);


        const media = wrap.querySelector(".loop-media");
        const video = wrap.querySelector(".loop-video");
        const image = wrap.querySelector(".loop-image");

        const muteBtn = wrap.querySelector(".loop-mute-btn");
        const fsBtn = wrap.querySelector(".loop-fs-btn");
        const likeBtn = wrap.querySelector(".loop-like-btn");
        const saveBtn = wrap.querySelector(".loop-save-btn");
        const shareBtn = wrap.querySelector(".loop-share-btn");
        const reportBtn = wrap.querySelector(".loop-report-btn");

        featuredEls = {
            wrap,
            media,
            video,
            muteBtn,
            fsBtn,
            saveBtn,
            observer: null
        };


        /* ---------- original aspect ratio ---------- */

        const applyRatio = (width, height) => {

            if (!width || !height) {
                return;
            }

            const ratio = width / height;

            if (!Number.isFinite(ratio) || ratio <= 0) {
                return;
            }

            wrap.style.setProperty(
                "--media-ratio",
                String(ratio)
            );

            updateOrientation(wrap, ratio);

            rememberRatio(id, ratio);
        };


        if (image) {

            const update = () => {

                applyRatio(
                    image.naturalWidth,
                    image.naturalHeight
                );
            };

            if (image.complete) {

                update();

            } else {

                image.addEventListener(
                    "load",
                    update,
                    { once: true }
                );
            }

            image.addEventListener(
                "error",
                () => {

                    if (image.src !== item.src) {
                        image.src = item.src;
                    }
                },
                { once: true }
            );
        }


        /* ---------- video behaviour ---------- */

        if (video) {

            const fill =
                wrap.querySelector(".loop-progress-fill");

            const progress =
                wrap.querySelector(".loop-progress");

            video.muted = sharedMuted;


            video.addEventListener("loadedmetadata", () => {

                applyRatio(
                    video.videoWidth,
                    video.videoHeight
                );

                updateProgress();
            });


            if (video.readyState >= 1) {

                applyRatio(
                    video.videoWidth,
                    video.videoHeight
                );
            }


            function updateProgress() {

                if (!fill) {
                    return;
                }

                fill.style.width =
                    video.duration
                        ? `${(video.currentTime / video.duration) * 100}%`
                        : "0%";
            }


            video.addEventListener(
                "timeupdate",
                updateProgress
            );

            video.addEventListener(
                "seeked",
                updateProgress
            );


            video.addEventListener("play", () => {

                media.classList.remove("is-paused");
            });


            video.addEventListener("pause", () => {

                if (wrap.dataset.userPaused === "true") {

                    media.classList.add("is-paused");
                }
            });


            /* Click media: play / pause */

            media.addEventListener("click", event => {

                if (
                    event.target.closest(
                        ".loop-media-controls, .loop-progress"
                    )
                ) {
                    return;
                }

                if (video.paused) {

                    delete wrap.dataset.userPaused;

                    video.muted = sharedMuted;

                    safePlay(video);

                } else {

                    wrap.dataset.userPaused = "true";

                    video.pause();

                    media.classList.add("is-paused");
                }
            });


            /* Progress bar: click / drag to seek */

            if (progress) {

                let dragging = false;

                const seek = event => {

                    const rect =
                        progress.getBoundingClientRect();

                    const fraction =
                        Math.min(
                            1,
                            Math.max(
                                0,
                                (event.clientX - rect.left) / rect.width
                            )
                        );

                    if (video.duration) {

                        video.currentTime =
                            fraction * video.duration;
                    }
                };


                progress.addEventListener(
                    "pointerdown",
                    event => {

                        event.stopPropagation();

                        dragging = true;

                        progress.classList.add("is-scrubbing");

                        try {
                            progress.setPointerCapture(
                                event.pointerId
                            );
                        } catch {}

                        seek(event);
                    }
                );


                progress.addEventListener(
                    "pointermove",
                    event => {

                        if (dragging) {
                            seek(event);
                        }
                    }
                );


                const stopDrag = () => {

                    dragging = false;

                    progress.classList.remove("is-scrubbing");
                };


                progress.addEventListener(
                    "pointerup",
                    stopDrag
                );

                progress.addEventListener(
                    "pointercancel",
                    stopDrag
                );


                progress.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();
                    }
                );
            }


            /* Mute / unmute */

            if (muteBtn) {

                muteBtn.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        setSharedMuted(!sharedMuted);

                        video.muted = sharedMuted;

                        refreshMuteUI();

                        if (!sharedMuted) {
                            safePlay(video);
                        }
                    }
                );
            }


            /* Pause when scrolled out of view */

            if ("IntersectionObserver" in window) {

                const observer =
                    new IntersectionObserver(
                        entries => {

                            const entry = entries[0];

                            if (
                                !entry ||
                                isFeaturedFullscreen()
                            ) {
                                return;
                            }

                            if (entry.isIntersecting) {

                                if (
                                    wrap.dataset.userPaused !== "true" &&
                                    video.paused
                                ) {

                                    video.muted =
                                        hoveredVideo
                                            ? true
                                            : sharedMuted;

                                    safePlay(video);
                                }

                            } else {

                                video.pause();
                            }
                        },
                        {
                            root: mainEl,
                            threshold: 0.2
                        }
                    );

                observer.observe(wrap);

                featuredEls.observer = observer;
            }


            /* Autoplay */

            safePlay(video);
        }


        /* ---------- fullscreen ---------- */

        if (fsBtn) {

            fsBtn.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    toggleFullscreen();
                }
            );
        }


        /* ---------- like / save / share / report ---------- */

        likeBtn.addEventListener("click", () => {

            if (likedIds.has(id)) {
                likedIds.delete(id);
            } else {
                likedIds.add(id);
            }

            likeBtn.classList.toggle(
                "is-liked",
                likedIds.has(id)
            );
        });


        saveBtn.addEventListener("click", () => {

            if (savedIds.has(id)) {
                savedIds.delete(id);
            } else {
                savedIds.add(id);
            }

            renderSaveState();
        });


        shareBtn.addEventListener(
            "click",
            () => {

                shareItem(id);
            }
        );


        reportBtn.addEventListener(
            "click",
            () => {

                if (reportedIds.has(id)) {
                    return;
                }

                reportedIds.add(id);

                reportBtn.classList.add(
                    "is-reported"
                );

                toast(
                    "Reported. Thanks for letting us know."
                );
            }
        );
    }


    /* =====================================================
       SHOW A LOOP PAGE

       options.order      saved grid order (restoring) —
                          otherwise a fresh shuffle is made
       options.scrollTop  saved scroll position (restoring) —
                          otherwise the page starts at the top
       options.animate    soft fade of the recommendations
    ===================================================== */

    function showFeatured(id, options = {}) {

        const previousId = featuredId;

        featuredId = id;

        hoveredVideo = null;

        renderFeatured(id);

        renderGrid(
            options.order ||
            buildRecommendationOrder(id, previousId),
            options.animate === true
        );

        refreshMuteUI();

        renderSaveState();

        if (typeof options.scrollTop === "number") {

            restoreLoopScroll(options.scrollTop);

        } else {

            jumpScroll(0);
        }
    }


    /* =====================================================
       MAKE A CARD THE FEATURED CARD

       The selected content opens directly (no smooth scroll
       to the top). The page you are leaving saves its own
       scroll position first, and a new history entry with
       its own key is created for the new page.
    ===================================================== */

    function setFeatured(id, options = {}) {

        const push = options.push !== false;

        if (id === featuredId) {

            jumpScroll(0);

            return;
        }

        /* Save the page being left (its scroll + grid order) */

        saveLoopState();

        showFeatured(id, { animate: true });

        if (push) {

            currentKey = newKey();

            try {

                history.pushState(
                    { card: id, key: currentKey },
                    "",
                    buildUrl(id)
                );

            } catch {}
        }

        saveLoopState();
    }


    /* =====================================================
       BROWSER BACK / FORWARD

       Each Loop page returns exactly as it was left: same
       featured card, same recommendation order, same scroll
       position — restored instantly.
    ===================================================== */

    window.addEventListener("popstate", event => {

        /* Save the page being left */

        saveLoopState();

        const state = event.state || {};

        const id =
            Number.isInteger(state.card)
                ? state.card
                : readIdFromUrl();

        if (id === null || !FEED_SET.has(id)) {
            return;
        }

        currentKey = state.key || newKey();

        const entry = readEntry(state.key);

        if (
            entry &&
            entry.featuredId === id &&
            entry.gridOrder
        ) {

            showFeatured(id, {
                order: entry.gridOrder,
                scrollTop: entry.scrollTop
            });

            return;
        }

        showFeatured(id, { animate: true });

        try {

            history.replaceState(
                { card: id, key: currentKey },
                "",
                buildUrl(id)
            );

        } catch {}

        saveLoopState();
    });


    /* =====================================================
       SAVE THE LOOP POSITION WHEN LEAVING

       - scrolling (debounced)
       - page hidden / closed / navigated away
       - any sidebar link click

       Clicking the Home link FROM the Loop page goes to the
       real Home page, so it forgets the latest Loop position
       instead of saving it (otherwise Home would redirect
       straight back here).
    ===================================================== */

    let loopScrollTimer = null;

    mainEl.addEventListener(
        "scroll",
        () => {

            clearTimeout(loopScrollTimer);

            loopScrollTimer =
                setTimeout(saveLoopState, 50);
        },
        { passive: true }
    );


    window.addEventListener("pagehide", saveLoopState);

    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.visibilityState === "hidden") {

                saveLoopState();
            }
        }
    );


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    /* Opening in a new tab: this page stays */

                    if (
                        event.ctrlKey ||
                        event.metaKey ||
                        event.shiftKey
                    ) {
                        return;
                    }

                    const href =
                        item.getAttribute("href") || "";

                    if (/home\/home\.html/.test(href)) {

                        /* Save this page's own position first,
                           then forget the "latest" marker */

                        saveLoopState();

                        leavingForHome = true;

                        clearLoopState();

                    } else {

                        saveLoopState();
                    }
                }
            );
        });


    /* =====================================================
       INITIALIZE
    ===================================================== */

    /* A real refresh is a fresh feed: forget old positions */

    if (isLoopReload) {

        clearLoopState();

        try {

            sessionStorage.removeItem(LOOP_ENTRIES_KEY);

        } catch {}
    }


    const historyState = history.state || {};

    const urlId = readIdFromUrl();


    /*
       Restore a saved position when:
       - the user came back with Back/Forward (this Loop page's
         own saved position), or
       - Home sent the user here (?restore=1, latest position).
       Never on a refresh, and never when the user opened a
       card from Home (that is a fresh start).
    */

    let restoredState = null;

    if (!isLoopReload) {

        if (navType === "back_forward") {

            restoredState =
                readEntry(historyState.key) ||
                readLoopState();

        } else if (
            new URLSearchParams(location.search).get("restore") === "1"
        ) {

            restoredState = readLoopState();
        }
    }

    if (
        restoredState &&
        urlId !== null &&
        urlId !== restoredState.featuredId
    ) {

        /* The URL points at a different card: don't restore */

        restoredState = null;
    }

    let startId =
        restoredState
            ? restoredState.featuredId
            : urlId;

    if (startId === null) {

        startId =
            FEED_IDS[
                Math.floor(Math.random() * FEED_IDS.length)
            ];
    }

    currentKey =
        (restoredState && historyState.key) ||
        newKey();

    try {

        history.replaceState(
            { card: startId, key: currentKey },
            "",
            buildUrl(startId)
        );

    } catch {}


    featuredId = startId;

    renderFeatured(startId);

    /*
       Load the complete grid once. A restored page reuses its
       saved order; every new Loop page gets a fresh shuffle.
    */
    renderGrid(
        restoredState
            ? restoredState.gridOrder
            : null,
        false
    );

    refreshMuteUI();

    renderSaveState();


    if (restoredState && restoredState.gridOrder) {

        restoreLoopScroll(restoredState.scrollTop);

    } else {

        saveLoopState();
    }

})();