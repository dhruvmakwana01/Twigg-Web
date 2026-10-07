/* =========================================================
   TWIGG LOOP PAGE — JAVASCRIPT

   How it works:
   1. The Home Page sends the clicked card's id in the URL:
          loop.html?card=7
   2. This file looks the id up in MEDIA (below), renders
      that item as the large FEATURED card, and fills
      the Pinterest grid with every other item.
   3. Clicking a grid card makes it the new featured card.
      The previous featured card returns to the top of the
      grid.

   IMPORTANT: MEDIA must stay in the SAME ORDER as the cards
   in home.html (card 01 = id 0, card 02 = id 1, ...).
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SHARED KEYS (same keys the Home Page uses)
    ===================================================== */

    const HOME_RATIO_KEY = "twigg_home_ratios";
    const MUTE_KEY = "twigg_shared_muted";


    /* =====================================================
       MEDIA CATALOG
       (id = position in this list = card order in home.html)
    ===================================================== */

    const VIDEO_BASE = "../home/videos/";

    const photo = id =>
        `https://images.unsplash.com/photo-${id}?auto=format&fit=max&w=900&q=90`;

    const MEDIA = [

        /* 00 */ { type: "video", src: VIDEO_BASE + "b9f4e7d4-ce0a-426a-937e-daebd25f5842.MP4", alt: "Video" },
        /* 01 */ { type: "image", src: photo("1561070791-2526d30994b5"), alt: "Creative design" },
        /* 02 */ { type: "image", src: photo("1586717791821-3f44a563fa4c"), alt: "Graphic design" },
        /* 03 */ { type: "video", src: VIDEO_BASE + "d27829dc-6302-47a3-8c71-5f8a157f47e5.MP4", alt: "Video" },
        /* 04 */ { type: "image", src: photo("1558655146-9f40138edfeb"), alt: "Creative branding" },
        /* 05 */ { type: "video", src: VIDEO_BASE + "22512-328261507_medium.mp4", alt: "Video" },
        /* 06 */ { type: "image", src: photo("1497366811353-6870744d04b2"), alt: "Interior design" },
        /* 07 */ { type: "video", src: VIDEO_BASE + "22619-328940133_medium.mp4", alt: "Video" },
        /* 08 */ { type: "image", src: photo("1618005198919-d3d4b5a92ead"), alt: "Abstract design" },
        /* 09 */ { type: "video", src: VIDEO_BASE + "212404_medium.mp4", alt: "Video" },
        /* 10 */ { type: "image", src: photo("1559028012-481c04fa702d"), alt: "Website design" },
        /* 11 */ { type: "video", src: VIDEO_BASE + "338904_medium.mp4", alt: "Video" },
        /* 12 */ { type: "image", src: photo("1634017839464-5c339ebe3cb4"), alt: "Abstract artwork" },
        /* 13 */ { type: "image", src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsnn_crhJrO4NbGugSy9ofq1PdH5NhJYEPwRsTaV9b6Q&s=10", alt: "Creative business design" },
        /* 14 */ { type: "video", src: VIDEO_BASE + "364783_medium.mp4", alt: "Video" },
        /* 15 */ { type: "image", src: photo("1513364776144-60967b0f800f"), alt: "Art and illustration" },
        /* 16 */ { type: "image", src: photo("1557682250-33bd709cbe85"), alt: "Color design" },
        /* 17 */ { type: "video", src: VIDEO_BASE + "ad509c81-b69a-4021-be22-37d432bd7531.MP4", alt: "Video" },
        /* 18 */ { type: "image", src: photo("1542744095-fcf48d80b0fd"), alt: "Business design" },
        /* 19 */ { type: "image", src: photo("1497366754035-f200968a6e72"), alt: "Interior design" },
        /* 20 */ { type: "video", src: VIDEO_BASE + "21d1f8ec-5dab-476d-b3a9-16412b7745b0.MP4", alt: "Video" },
        /* 21 */ { type: "image", src: photo("1561214115-f2f134cc4912"), alt: "Art gallery" },
        /* 22 */ { type: "image", src: photo("1550745165-9bc0b252726f"), alt: "Creative technology" },
        /* 23 */ { type: "video", src: VIDEO_BASE + "6ede3033-72bb-46c7-a61c-c8eaf77445b4.MP4", alt: "Video" },
        /* 24 */ { type: "image", src: photo("1634017839464-5c339ebe3cb4"), alt: "Abstract artwork" },
        /* 25 */ { type: "image", src: photo("1497215728101-856f4ea42174"), alt: "Workspace design" },
        /* 26 */ { type: "video", src: VIDEO_BASE + "e75e166b-f8bc-497f-8c07-c557c8d0de77.MP4", alt: "Video" },
        /* 27 */ { type: "image", src: photo("1513364776144-60967b0f800f"), alt: "Art and illustration" },
        /* 28 */ { type: "image", src: photo("1542744095-fcf48d80b0fd"), alt: "Business creative" },
        /* 29 */ { type: "video", src: VIDEO_BASE + "ad3b477e-ccf1-49df-8bfa-ec0b8c80965a.MP4", alt: "Video" }
    ];


    /* =====================================================
       PROFILE / CATEGORY / RATING DATA (placeholder)
    ===================================================== */

    const PROFILES = [
        "Aarav Studio",
        "Maya Designs",
        "Pixel Forge",
        "Nora Creative",
        "Kabir Motion",
        "Lumen Works"
    ];

    const CATEGORIES = [
        "Video Editing",
        "Social Media Design",
        "Logo Design",
        "Web & Mobile Design",
        "Branding",
        "Motion Graphics",
        "Packaging Design",
        "Logo Animation",
        "3D Product Animation",
        "Book Design",
        "Intro & Outro Videos"
    ];

    const RATINGS = ["4.9", "4.8", "5.0", "4.7", "4.6", "4.9", "4.5"];
    const REVIEWS = ["1,204", "842", "2,380", "94", "445", "990", "1,875"];


    function getItem(id) {

        return {
            id,
            type: MEDIA[id].type,
            src: MEDIA[id].src,
            alt: MEDIA[id].alt,
            name: PROFILES[id % PROFILES.length],
            category: CATEGORIES[id % CATEGORIES.length],
            rating: RATINGS[id % RATINGS.length],
            reviews: REVIEWS[(id * 3) % REVIEWS.length]
        };
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

    const savedIds = new Set();
    const likedIds = new Set();
    const reportedIds = new Set();


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
            id >= 0 &&
            id < MEDIA.length
        )
            ? id
            : null;
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

        const avatar = document.createElement("div");

        avatar.className = "card-profile-initial";

        avatar.textContent =
            item.name.charAt(0).toUpperCase();

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
       Loads every card exactly once except the featured card.

       There is intentionally NO infinite scrolling.
       This prevents duplicate cards from being appended
       when the user reaches the bottom.
    ===================================================== */

    function renderGrid() {

        gridEl.innerHTML = "";

        const ids =
            shuffle(
                MEDIA
                    .map((_, index) => index)
                    .filter(index => index !== featuredId)
            );

        const fragment =
            document.createDocumentFragment();

        ids.forEach(id => {

            fragment.appendChild(
                createGridCard(id, false)
            );
        });

        gridEl.appendChild(fragment);
    }


    function removeFromGrid(id) {

        gridEl
            .querySelectorAll(
                `.media-card[data-card-id="${id}"]`
            )
            .forEach(card => card.remove());
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
        }

        const mediaHtml =
            isVideo
                ? `
                    <video class="loop-video" muted loop playsinline preload="auto">
                        <source src="${item.src}" type="video/mp4">
                    </video>
                  `
                : `
                    <img class="loop-image"
                         src="${item.src.replace("w=900", "w=1600")}"
                         alt="${item.alt}">
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
                        ${item.name.charAt(0).toUpperCase()}
                    </div>

                    <div class="loop-creator-text">

                        <div class="loop-name">${item.name}</div>

                        <div class="loop-category">${item.category}</div>

                        <div class="loop-rating">

                            <div class="loop-stars">
                                ${ICONS.star.repeat(5)}
                            </div>

                            <span class="loop-rating-value">${item.rating}</span>

                            <span class="loop-review-count">(${item.reviews} reviews)</span>

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


            /* Progress bar */

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
       MAKE A CARD THE FEATURED CARD
    ===================================================== */

    function setFeatured(id, options = {}) {

        const push = options.push !== false;
        const scroll = options.scroll !== false;

        if (id === featuredId) {

            if (scroll) {

                mainEl.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }

            return;
        }

        const previousId = featuredId;

        featuredId = id;


        /* Remove the newly selected card from the grid. */

        removeFromGrid(id);


        /*
           Return the previous featured card to the grid.

           Before inserting it, make sure it doesn't already
           exist. This guarantees that every card appears only
           once in the grid.
        */

        if (previousId !== null) {

            removeFromGrid(previousId);

            gridEl.insertBefore(
                createGridCard(previousId, false),
                gridEl.firstChild
            );
        }


        hoveredVideo = null;

        renderFeatured(id);

        refreshMuteUI();


        if (push) {

            try {

                history.pushState(
                    { card: id },
                    "",
                    buildUrl(id)
                );

            } catch {}
        }


        if (scroll) {

            mainEl.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }


    /* =====================================================
       BROWSER BACK / FORWARD
    ===================================================== */

    window.addEventListener("popstate", () => {

        const id = readIdFromUrl();

        if (id !== null) {

            setFeatured(id, { push: false });
        }
    });


    /* =====================================================
       INITIALIZE
    ===================================================== */

    let startId = readIdFromUrl();

    if (startId === null) {

        startId =
            Math.floor(
                Math.random() * MEDIA.length
            );

        try {

            history.replaceState(
                { card: startId },
                "",
                buildUrl(startId)
            );

        } catch {}
    }


    featuredId = startId;

    renderFeatured(startId);

    /*
       Load the complete grid once.

       There is no infinite scroll and no repeated batches.
       Each of the other 29 cards is added exactly once.
    */
    renderGrid();

})();