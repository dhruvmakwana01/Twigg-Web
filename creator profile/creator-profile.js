/* =========================================================
   TWIGG CREATOR PROFILE — JAVASCRIPT

   Opened as:  creator-profile.html?creator=<slug>
   (slug = same slug creators.js builds from the creator name)

   DATA
   Everything comes from the shared data (../shared/media-data.js,
   window.TwiggMedia), like Home, Reels, Loop and Creators:
   creator name, category, rating, reviews, COVER IMAGE
   (item.creator.coverImage) and every image / video the creator
   owns. Nothing is duplicated here.

   The shared data has no packages, written reviews, bios or
   profile pictures yet; those sections show an empty state until
   data exists. To fill them later, define (before this script):

     window.TwiggCreatorExtras = {
       "aarav-studio": {
         bio: "…", profileImage: "…", cover: "…",
         packages: [{ name, price, delivery, description,
                      includes: [], revisions }],
         reviews:  [{ name, avatar, rating, date, text }]
       }
     };

   FEED GRID
   The feed is laid out in TWO columns on mobile and tablet
   (up to 1150px) and THREE columns on desktop (1151px and up).
   Each post goes into the shortest column (estimated from its
   aspect ratio), so every column fills evenly, left to right,
   for any number of posts and any screen size. Once real media
   sizes are known the layout re-balances itself, and it also
   rebuilds when the screen crosses the tablet / desktop breakpoint.

   SAVED NOTIFICATION
   One shared toast (notifySaved) shows "Saved" after anything is
   successfully saved (creator or post). Unsaving shows nothing.

   POST VIEWER
   Opening a post shows this creator's posts as a vertical list of
   the SAME media card the Loop page uses (loop.css is loaded by
   the page): same media sizing, mute / fullscreen / rotate
   controls, progress bar, like / save / share / report buttons
   and caption. The behaviour below is the Loop card's behaviour
   (loop.js), adapted to show several cards of one creator.

   VERIFIED BADGE
   Every creator is verified: the badge shows next to the name in
   the profile header (HTML) and next to the name on every post
   in the post viewer (VERIFIED_BADGE below).
========================================================= */

(() => {

    "use strict";

    const media = window.TwiggMedia;

    const SAVED_KEY = "twigg_saved_creators";      /* shared with Creators page */
    const REPORT_KEY = "twigg_reported_creators";
    const MUTE_KEY = "twigg_shared_muted";         /* shared with all pages */
    const HOME_RATIO_KEY = "twigg_home_ratios";    /* shared with Home / Loop */
    const TAB_KEY = "twigg_profile_tab_";

    const TABS = ["feed", "packages", "reviews", "services"];

    /* Feed columns: 3 on desktop, 2 on tablet and mobile.
       The breakpoint matches the tablet range in creator-profile.css
       (tablet is 801px – 1150px, so desktop starts at 1151px). */

    const DESKTOP_QUERY = window.matchMedia("(min-width: 1151px)");

    function gridColumnCount() {
        return DESKTOP_QUERY.matches ? 3 : 2;
    }

    const EXTRAS = window.TwiggCreatorExtras || {};

    const touchQuery = window.matchMedia("(hover: none)");

    const $ = id => document.getElementById(id);

    /* Verified badge (same artwork as the profile header) */

    const VERIFIED_BADGE =
        `<svg class="cp-verified" viewBox="0 0 24 24" role="img" aria-label="Verified" focusable="false"><title>Verified</title><path fill="#1d9bf0" d="M12 1.8l2.4 1.6 2.9-.3 1.2 2.7 2.6 1.3-.3 2.9L22.4 12l-1.6 2.4.3 2.9-2.6 1.3-1.2 2.7-2.9-.3L12 22.2l-2.4-1.6-2.9.3-1.2-2.7-2.6-1.3.3-2.9L1.6 12l1.6-2.4-.3-2.9 2.6-1.3 1.2-2.7 2.9.3z"></path><path fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7.9 12.3l2.8 2.9 5.4-5.8"></path></svg>`;


    /* =====================================================
       HELPERS
    ===================================================== */

    function esc(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function slugify(name) {

        return String(name)
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function fmt(value) {
        return Number(value).toLocaleString("en-IN");
    }

    function readSet(key) {

        try {
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            return new Set(Array.isArray(list) ? list : []);
        } catch {
            return new Set();
        }
    }

    /* Returns true when the data was really stored */

    function writeSet(key, set) {

        try {
            localStorage.setItem(key, JSON.stringify(Array.from(set)));
            return true;
        } catch {
            return false;
        }
    }

    let toastTimer = null;

    function toast(text, duration) {

        const el = $("cpToast");

        el.textContent = text;
        el.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => el.classList.remove("show"), duration || 2200);
    }

    /* The ONE notification used for every successful save.
       Call it only when something was saved, never on unsave. */

    function notifySaved() {
        toast("Saved", 1600);
    }

    const STAR_PATH = "M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z";

    function starIcon(cls) {
        return `<svg viewBox="0 0 24 24"${cls ? ` class="${cls}"` : ""}><path d="${STAR_PATH}"></path></svg>`;
    }

    function stars(rating) {

        const filled = Math.round(Number(rating) || 0);

        return `<div class="cp-stars" aria-hidden="true">${
            [1, 2, 3, 4, 5].map(n => starIcon(n > filled ? "off" : "")).join("")
        }</div>`;
    }

    function avatarHtml(name, image) {

        return (image ? `<img src="${esc(image)}" alt="" loading="lazy">` : "") +
            `<span>${esc(name.charAt(0).toUpperCase())}</span>`;
    }

    /* Image on top of the initial: if it fails, it is removed */

    function wireAvatarFallback(root) {

        root.querySelectorAll("img").forEach(img => {
            img.addEventListener("error", () => img.remove(), { once: true });
        });
    }


    /* ----- aspect ratios (cached, shared with Home / Loop) ----- */

    let ratios = {};

    try {
        ratios = JSON.parse(sessionStorage.getItem(HOME_RATIO_KEY) || "{}") || {};
    } catch {
        ratios = {};
    }

    function rememberRatio(id, ratio) {

        ratios[id] = ratio;

        try {
            sessionStorage.setItem(HOME_RATIO_KEY, JSON.stringify(ratios));
        } catch { }
    }


    /* =====================================================
       CREATOR (from the shared media data)
    ===================================================== */

    function findCreator(slug) {

        const items =
            media
                ? media.getAll().filter(item => slugify(item.creator.name) === slug)
                : [];

        if (!items.length) {
            return null;
        }

        const counts = new Map();

        items.forEach(item => {
            counts.set(item.category, (counts.get(item.category) || 0) + 1);
        });

        let category = "";
        let best = 0;

        counts.forEach((count, key) => {
            if (count > best) {
                best = count;
                category = key;
            }
        });

        const ratings =
            items.map(item => parseFloat(item.rating)).filter(Number.isFinite);

        const extras = EXTRAS[slug] || {};

        const fromData = key =>
            (items.find(item => item.creator[key]) || { creator: {} }).creator[key] || "";

        return {
            slug,
            name: items[0].creator.name,
            items,
            category,
            extras,
            rating: ratings.length
                ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
                : 0,
            reviews: items.reduce(
                (sum, item) =>
                    sum + (parseInt(String(item.reviews).replace(/,/g, ""), 10) || 0),
                0
            ),
            profileImage: extras.profileImage || fromData("profileImage"),
            cover: extras.cover || fromData("coverImage"),
            bio:
                extras.bio ||
                `${category || "Creative"} creator on Twigg with ${items.length} ${items.length === 1 ? "post" : "posts"}.`
        };
    }

    const slug = new URLSearchParams(location.search).get("creator") || "";

    const creator = findCreator(slug);

    const state = { category: "", tab: "feed" };

    let viewerOpen = false;


    /* =====================================================
       HEADER
    ===================================================== */

    function renderHeader() {

        document.title = `${creator.name} · Twigg`;

        /* The name sits in its own span so the verified badge
           (every account is verified) stays next to it. */

        $("cpNameText").textContent = creator.name;
        $("cpCategory").textContent = creator.category;
        $("cpBio").textContent = creator.bio;

        $("cpRating").innerHTML =
            `${starIcon("")}<span>${creator.rating.toFixed(1)}</span>` +
            `<span class="cp-reviews-count">(${fmt(creator.reviews)} reviews)</span>`;

        const avatar = $("cpAvatar");

        avatar.innerHTML = avatarHtml(creator.name, creator.profileImage);
        avatar.setAttribute("role", "img");
        avatar.setAttribute("aria-label", creator.name);

        wireAvatarFallback(avatar);

        $("cpMessage").href =
            "../message/message.html?creator=" + encodeURIComponent(creator.slug);


        /* Cover: from the shared data (creator.coverImage). Without one
           (or if it fails to load) the Twigg gradient behind it shows. */

        if (creator.cover) {

            const img = document.createElement("img");

            img.alt = "";
            img.src = creator.cover;

            img.addEventListener("error", () => img.remove(), { once: true });

            $("cpCover").insertBefore(img, $("cpCover").firstChild);
        }


        /* Save ("Saved" pop-up only when something is saved, not on unsave) */

        const saveButton = $("cpSave");

        const renderSaved = () => {

            const saved = readSet(SAVED_KEY).has(creator.slug);

            saveButton.setAttribute("aria-pressed", String(saved));
            saveButton.setAttribute("aria-label", saved ? "Remove from saved" : "Save creator");
        };

        renderSaved();

        saveButton.addEventListener("click", () => {

            const set = readSet(SAVED_KEY);

            if (set.has(creator.slug)) {

                set.delete(creator.slug);

                writeSet(SAVED_KEY, set);

                renderSaved();

                return;
            }

            set.add(creator.slug);

            const stored = writeSet(SAVED_KEY, set);

            renderSaved();

            if (stored) {
                notifySaved();
            }
        });


        /* Report */

        const reportButton = $("cpReport");

        const renderReported = () => {

            reportButton.setAttribute(
                "aria-pressed",
                String(readSet(REPORT_KEY).has(creator.slug))
            );
        };

        renderReported();

        reportButton.addEventListener("click", () => {

            const set = readSet(REPORT_KEY);

            if (set.has(creator.slug)) {
                toast("You've already reported this creator");
                return;
            }

            set.add(creator.slug);

            writeSet(REPORT_KEY, set);

            renderReported();

            toast("Thanks, we'll review this creator");
        });


        /* Share */

        $("cpShare").addEventListener("click", async () => {

            const data = {
                title: `${creator.name} on Twigg`,
                text: `Check out ${creator.name} on Twigg.`,
                url: location.href
            };

            if (navigator.share) {

                try {
                    await navigator.share(data);
                } catch { }

                return;
            }

            try {
                await navigator.clipboard.writeText(location.href);
                toast("Link copied");
            } catch {
                toast("Sharing isn't supported in this browser");
            }
        });


        /* Back */

        $("cpBack").addEventListener("click", () => {

            let sameSite = false;

            try {
                sameSite =
                    document.referrer &&
                    new URL(document.referrer).origin === location.origin;
            } catch { }

            if (sameSite && history.length > 1) {
                history.back();
            } else {
                location.href = "../creators/creators.html";
            }
        });
    }


    /* =====================================================
       TABS (only ONE panel visible at a time)
    ===================================================== */

    function selectTab(name, focus) {

        if (!TABS.includes(name)) {
            name = "feed";
        }

        state.tab = name;

        TABS.forEach(tab => {

            const selected = tab === name;
            const button = $("tab-" + tab);

            button.setAttribute("aria-selected", String(selected));
            button.tabIndex = selected ? 0 : -1;

            $("panel-" + tab).hidden = !selected;

            if (selected && focus) {
                button.focus();
            }
        });

        try {
            sessionStorage.setItem(TAB_KEY + creator.slug, name);
        } catch { }
    }

    function setupTabs() {

        const tabs = $("cpTabs");

        tabs.addEventListener("click", event => {

            const button = event.target.closest(".cp-tab");

            if (button) {
                selectTab(button.dataset.tab);
            }
        });

        tabs.addEventListener("keydown", event => {

            const step =
                event.key === "ArrowRight" ? 1 :
                event.key === "ArrowLeft" ? -1 : 0;

            if (!step) {
                return;
            }

            event.preventDefault();

            const index = TABS.indexOf(state.tab);

            selectTab(TABS[(index + step + TABS.length) % TABS.length], true);
        });

        let saved = "feed";

        try {
            saved = sessionStorage.getItem(TAB_KEY + creator.slug) || "feed";
        } catch { }

        selectTab(saved);
    }


    /* =====================================================
       FEED (two-column grid on mobile / tablet,
             three-column grid on desktop)
    ===================================================== */

    function feedItems() {

        return creator.items.filter(
            item => !state.category || item.category === state.category
        );
    }

    /* Measured aspect ratio (width / height) per media id */

    const cardRatio = new Map();

    let feedCards = [];      /* cards in feed order */
    let feedColumns = [];    /* the column elements (2 or 3) */
    let layoutTimer = null;

    function setRatio(card, width, height) {

        const ratio = width / height;

        if (Number.isFinite(ratio) && ratio > 0) {

            card.style.setProperty("--media-ratio", String(ratio));

            cardRatio.set(String(card.dataset.mediaId), ratio);

            scheduleLayout();
        }
    }

    /* Best known ratio for a card: measured, cached, or a neutral 1 */

    function knownRatio(card) {

        const id = String(card.dataset.mediaId);

        const measured = cardRatio.get(id);

        if (measured) {
            return measured;
        }

        const cached = Number(ratios[id]);

        return Number.isFinite(cached) && cached > 0 ? cached : 1;
    }

    /* Put every card (in feed order) into the currently shortest column.
       Heights are in column-width units: height = 1 / ratio (+ a little
       for the gap). Ties go to the left-most column, so the first row of
       posts always lands in columns 1, 2 (and 3 on desktop), left to
       right, and no column can stay empty while the others keep filling. */

    function applyGridLayout() {

        if (!feedColumns.length || !feedCards.length) {
            return;
        }

        const heights = feedColumns.map(() => 0);
        const buckets = feedColumns.map(() => []);

        feedCards.forEach(card => {

            let target = 0;

            for (let i = 1; i < heights.length; i++) {
                if (heights[i] < heights[target] - 0.0001) {
                    target = i;
                }
            }

            heights[target] += 1 / knownRatio(card) + 0.04;

            buckets[target].push(card);
        });

        /* Only touch columns whose content actually changes, so
           media that is already in the right place is not moved. */

        buckets.forEach((list, index) => {

            const column = feedColumns[index];
            const current = Array.from(column.children);

            const same =
                current.length === list.length &&
                current.every((node, i) => node === list[i]);

            if (!same) {
                list.forEach(card => column.appendChild(card));
            }
        });
    }

    /* Re-balance once media sizes have settled */

    function scheduleLayout() {

        clearTimeout(layoutTimer);

        layoutTimer = setTimeout(applyGridLayout, 220);
    }

    /* Create the empty column elements for the current screen size */

    function createColumns(count) {

        return Array.from({ length: count }, () => {

            const column = document.createElement("div");

            column.className = "cp-grid-col";

            return column;
        });
    }

    /* The screen crossed the tablet / desktop breakpoint:
       swap 2 columns for 3 (or back) and re-place the same cards. */

    function rebuildColumns() {

        const grid = document.querySelector("#panel-feed .cp-grid");

        if (!grid || !feedCards.length) {
            return;
        }

        const count = gridColumnCount();

        if (feedColumns.length === count) {
            return;
        }

        grid.style.setProperty("--cp-cols", String(count));

        feedColumns = createColumns(count);

        grid.replaceChildren(...feedColumns);

        applyGridLayout();
    }

    if (DESKTOP_QUERY.addEventListener) {
        DESKTOP_QUERY.addEventListener("change", rebuildColumns);
    } else if (DESKTOP_QUERY.addListener) {
        DESKTOP_QUERY.addListener(rebuildColumns);
    }

    function buildCard(item) {

        const label = `${item.title} by ${creator.name}`;

        const inner =
            item.type === "video"
                ? `<video muted loop playsinline preload="metadata"${item.thumbnail ? ` poster="${esc(item.thumbnail)}"` : ""}>
                       <source src="${esc(item.src + "#t=0.001")}" type="video/mp4">
                   </video>
                   <div class="video-indicator"></div>`
                : `<img src="${esc(item.src)}" alt="${esc(label)}" loading="lazy">`;

        return `<article class="media-card" tabindex="0" role="button"
                    aria-label="Open ${esc(label)}" data-media-id="${item.id}">${inner}</article>`;
    }

    function setupCard(card) {

        const item = media.getById(Number(card.dataset.mediaId));
        const image = card.querySelector("img");
        const video = card.querySelector("video");

        if (image) {

            const update = () => setRatio(card, image.naturalWidth, image.naturalHeight);

            if (image.complete && image.naturalWidth) {
                update();
            } else {
                image.addEventListener("load", update, { once: true });
            }

            if (window.TwiggSkeleton) {
                window.TwiggSkeleton.watchImage(card, image);
            }
        }

        if (video) {

            const indicator = card.querySelector(".video-indicator");

            const update = () => setRatio(card, video.videoWidth, video.videoHeight);

            const showDuration = () => {

                const text = media.formatDuration(video.duration);

                if (text) {
                    indicator.textContent = text;
                    indicator.classList.add("has-duration");
                }
            };

            video.addEventListener("loadedmetadata", () => { update(); showDuration(); });
            video.addEventListener("durationchange", showDuration);

            const posterReady =
                media.applyPoster
                    ? media.applyPoster(video, item, ratio => setRatio(card, ratio, 1))
                    : Promise.resolve(false);

            video.load();

            if (window.TwiggSkeleton) {
                window.TwiggSkeleton.watchVideo(card, video, posterReady);
            }

            /* Hover preview (mouse devices only) */

            card.addEventListener("mouseenter", () => {

                if (touchQuery.matches) {
                    return;
                }

                indicator.classList.add("hidden");

                video.muted = true;

                const promise = video.play();

                if (promise && promise.catch) {
                    promise.catch(() => { });
                }
            });

            card.addEventListener("mouseleave", () => {

                if (touchQuery.matches) {
                    return;
                }

                indicator.classList.remove("hidden");

                video.pause();

                try {
                    video.currentTime = 0;
                } catch { }
            });
        }

        const open = () => openViewer(item.id);

        card.addEventListener("click", open);

        card.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
            }
        });
    }

    function renderFeed() {

        const panel = $("panel-feed");
        const list = feedItems();

        clearTimeout(layoutTimer);

        feedCards = [];
        feedColumns = [];

        if (!list.length) {

            panel.innerHTML =
                `<div class="cp-empty"><h2>No posts yet</h2><p>This creator hasn't posted anything yet.</p></div>`;

            return;
        }

        const columnCount = gridColumnCount();

        panel.innerHTML =
            (state.category
                ? `<div class="cp-filter-chip">${esc(state.category)}
                       <button type="button" id="cpClearFilter" aria-label="Show all posts">×</button>
                   </div>`
                : "") +
            `<section class="pinterest-grid cp-grid" style="--cp-cols:${columnCount}">${
                Array.from({ length: columnCount }, () => `<div class="cp-grid-col"></div>`).join("")
            }</section>`;

        feedColumns = Array.from(panel.querySelectorAll(".cp-grid-col"));

        feedCards = list.map(item => {

            const holder = document.createElement("template");

            holder.innerHTML = buildCard(item).trim();

            return holder.content.firstElementChild;
        });

        /* First placement (uses cached ratios when there are any) */

        applyGridLayout();

        feedCards.forEach(setupCard);

        const clear = $("cpClearFilter");

        if (clear) {

            clear.addEventListener("click", () => {
                state.category = "";
                renderFeed();
            });
        }
    }


    /* =====================================================
       POST VIEWER — the Loop media card, one per post

       Markup, classes and behaviour follow loop.js
       (renderFeatured). Differences: several cards in one
       vertical list instead of one featured card, and an
       IntersectionObserver that plays the post in view.
    ===================================================== */

    const ICONS = {

        muted: `<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6l-5 4H4z"></path><path d="M16 9c1 1 1 5 0 6"></path></svg>`,

        unmuted: `<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6l-5 4H4z"></path><path d="M16 8c2 2 2 6 0 8"></path><path d="M19 5c3 3 3 11 0 14"></path></svg>`,

        fullscreen: `<svg viewBox="0 0 24 24"><path d="M8 3H3v5"></path><path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M16 21h5v-5"></path></svg>`,

        exitFullscreen: `<svg viewBox="0 0 24 24"><path d="M9 3v6H3"></path><path d="M15 3v6h6"></path><path d="M9 21v-6H3"></path><path d="M15 21v-6h6"></path></svg>`,

        rotate: `<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.34-5.66"></path><path d="M20 4v5h-5"></path></svg>`,

        like: `<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z"></path></svg>`,

        save: `<svg viewBox="0 0 24 24"><path d="M6 4h12v16l-6-4-6 4z"></path></svg>`,

        share: `<svg viewBox="0 0 24 24"><path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M5 13v6h14v-6"></path></svg>`,

        report: `<svg viewBox="0 0 24 24"><path d="M6 3v18"></path><path d="M6 4h11l-2.5 4L17 12H6"></path></svg>`,

        star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z"></path></svg>`,

        play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>`
    };

    /* Per-session like / save / report on posts (same as Loop) */

    const likedIds = new Set();
    const savedIds = new Set();
    const reportedIds = new Set();

    const posts = new Map();       /* .loop-featured element -> post */
    const postById = new Map();    /* media id -> post */

    let viewerObserver = null;

    let anchor = null;             /* keeps the opened post at the top while layout settles */


    /* ----- shared mute (same key as Home / Reels / Loop) ----- */

    let sharedMuted = true;

    try {
        sharedMuted = sessionStorage.getItem(MUTE_KEY) !== "false";
    } catch {
        sharedMuted = true;
    }

    function setSharedMuted(value) {

        sharedMuted = value;

        try {
            sessionStorage.setItem(MUTE_KEY, String(value));
        } catch { }
    }

    function refreshMuteUI() {

        posts.forEach(post => {

            if (post.muteBtn) {

                post.muteBtn.innerHTML = sharedMuted ? ICONS.muted : ICONS.unmuted;

                post.muteBtn.setAttribute("aria-label", sharedMuted ? "Unmute" : "Mute");
            }
        });
    }

    function safePlay(video) {

        const promise = video.play();

        if (promise && promise.catch) {

            promise.catch(error => {

                if (error && error.name === "NotAllowedError" && !video.muted) {

                    video.muted = true;

                    setSharedMuted(true);

                    refreshMuteUI();

                    video.play().catch(() => { });
                }
            });
        }
    }


    /* Portrait media: info + actions go to the side on desktop / tablet
       (loop.css), on the bottom bar on mobile. */

    function updateOrientation(wrap, ratio) {

        wrap.classList.toggle(
            "is-portrait",
            Number.isFinite(ratio) && ratio > 0 && ratio < 0.999
        );
    }

    function realignAnchor() {

        if (anchor && anchor.active) {
            $("cpViewerScroll").scrollTop = anchor.post.section.offsetTop - 16;
        }
    }


    /* ----- fullscreen + rotation (same logic as loop.js) ----- */

    function realFullscreenElement() {

        return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    function isFs(post) {

        return (
            realFullscreenElement() === post.media ||
            post.media.classList.contains("loop-fs-fallback")
        );
    }

    function applyRotation(post) {

        if (!post.video) {
            return;
        }

        const active = post.rotated && isFs(post);

        if (active) {

            const width = post.media.clientWidth;
            const height = post.media.clientHeight;

            if (!width || !height) {
                return;
            }

            post.video.classList.add("loop-video-rotated");

            post.video.style.width = `${height}px`;
            post.video.style.height = `${width}px`;

        } else {

            post.video.classList.remove("loop-video-rotated");

            post.video.style.width = "";
            post.video.style.height = "";
        }

        if (post.rotateBtn) {

            post.rotateBtn.classList.toggle("is-rotated", active);

            post.rotateBtn.setAttribute("aria-label", active ? "Reset rotation" : "Rotate video");
        }
    }

    function setFsState(post, active) {

        post.media.classList.toggle("is-fullscreen", active);

        post.fsBtn.innerHTML = active ? ICONS.exitFullscreen : ICONS.fullscreen;

        post.fsBtn.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");

        if (!active) {
            post.rotated = false;
        }

        applyRotation(post);
    }

    function exitFallbackFs(post) {

        post.media.classList.remove("loop-fs-fallback");

        setFsState(post, false);
    }

    async function toggleFullscreen(post) {

        if (post.media.classList.contains("loop-fs-fallback")) {
            exitFallbackFs(post);
            return;
        }

        if (realFullscreenElement()) {

            try {

                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }

            } catch { }

            return;
        }

        const request = post.media.requestFullscreen || post.media.webkitRequestFullscreen;

        if (request) {

            try {

                await request.call(post.media);

                setFsState(post, true);

            } catch {

                post.media.classList.add("loop-fs-fallback");

                setFsState(post, true);
            }

            return;
        }

        if (post.video && post.video.webkitEnterFullscreen) {

            try {
                post.video.webkitEnterFullscreen();
                return;
            } catch { }
        }

        post.media.classList.add("loop-fs-fallback");

        setFsState(post, true);
    }

    function onFullscreenChange() {

        posts.forEach(post => setFsState(post, isFs(post)));
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    let rotateResizeTimer = null;

    window.addEventListener("resize", () => {

        clearTimeout(rotateResizeTimer);

        rotateResizeTimer = setTimeout(() => {
            posts.forEach(post => post.rotated && applyRotation(post));
        }, 150);
    });


    /* ----- share (opens the post in Loop, like the Loop share button) ----- */

    async function sharePost(id) {

        const url = new URL(`../loop/loop.html?card=${id}`, location.href).href;

        if (navigator.share) {

            try {

                await navigator.share({
                    title: "Twigg",
                    text: "Check out this creative work on Twigg.",
                    url
                });

            } catch { }

            return;
        }

        try {

            await navigator.clipboard.writeText(url);

            toast("Link copied!");

        } catch {

            toast("Share is not supported in this browser.");
        }
    }


    /* ----- build one post (Loop card markup) ----- */

    function buildPost(item) {

        const id = item.id;
        const isVideo = item.type === "video";

        const section = document.createElement("section");

        section.className = "loop-feature";

        const wrap = document.createElement("article");

        wrap.className = "loop-featured";

        wrap.dataset.cardId = String(id);

        if (ratios[id]) {

            wrap.style.setProperty("--media-ratio", String(ratios[id]));

            updateOrientation(wrap, ratios[id]);
        }

        const mediaHtml =
            isVideo
                ? `<video class="loop-video" muted loop playsinline preload="metadata"${item.thumbnail ? ` poster="${esc(item.thumbnail)}"` : ""}>
                       <source src="${esc(item.src)}" type="video/mp4">
                   </video>`
                : `<img class="loop-image"
                       src="${esc(item.src.replace("w=900", "w=1600"))}"
                       alt="${esc(item.title)}">`;

        wrap.innerHTML = `

            <div class="loop-media ${isVideo ? "is-video" : "is-image"}">

                ${mediaHtml}

                <div class="loop-media-controls">

                    ${isVideo ? `
                        <button type="button" class="loop-ctrl loop-mute-btn" aria-label="${sharedMuted ? "Unmute" : "Mute"}">
                            ${sharedMuted ? ICONS.muted : ICONS.unmuted}
                        </button>
                    ` : ""}

                    <button type="button" class="loop-ctrl loop-fs-btn" aria-label="Enter fullscreen">
                        ${ICONS.fullscreen}
                    </button>

                    ${isVideo ? `
                        <button type="button" class="loop-ctrl loop-rotate-btn" aria-label="Rotate video">
                            ${ICONS.rotate}
                        </button>
                    ` : ""}

                </div>

                ${isVideo ? `
                    <div class="loop-play-indicator">${ICONS.play}</div>

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
                        ${avatarHtml(creator.name, creator.profileImage)}
                    </div>

                    <div class="loop-creator-text">

                        <div class="loop-name"><span>${esc(creator.name)}</span>${VERIFIED_BADGE}</div>

                        <div class="loop-category">${esc(item.category)}</div>

                        <div class="loop-rating">

                            <div class="loop-stars">${ICONS.star.repeat(5)}</div>

                            <span class="loop-rating-value">${esc(item.rating)}</span>

                            <span class="loop-review-count">(${esc(item.reviews)} reviews)</span>

                        </div>

                    </div>

                </div>

                <div class="loop-actions">

                    <button type="button" class="loop-action-btn loop-like-btn ${likedIds.has(id) ? "is-liked" : ""}" aria-label="Like">${ICONS.like}</button>

                    <button type="button" class="loop-action-btn loop-save-btn ${savedIds.has(id) ? "is-saved" : ""}" aria-label="Save">${ICONS.save}</button>

                    <button type="button" class="loop-action-btn loop-share-btn" aria-label="Share">${ICONS.share}</button>

                    <button type="button" class="loop-action-btn loop-report-btn ${reportedIds.has(id) ? "is-reported" : ""}" aria-label="Report">${ICONS.report}</button>

                </div>

                ${item.caption ? `<p class="loop-caption">${esc(item.caption)}</p>` : ""}

            </div>
        `;

        section.appendChild(wrap);

        wireAvatarFallback(wrap.querySelector(".loop-avatar"));

        const mediaEl = wrap.querySelector(".loop-media");
        const video = wrap.querySelector(".loop-video");
        const image = wrap.querySelector(".loop-image");

        const post = {
            id,
            section,
            wrap,
            media: mediaEl,
            video,
            muteBtn: wrap.querySelector(".loop-mute-btn"),
            fsBtn: wrap.querySelector(".loop-fs-btn"),
            rotateBtn: wrap.querySelector(".loop-rotate-btn"),
            rotated: false
        };


        /* ---- original aspect ratio ---- */

        const applyRatio = (width, height) => {

            if (!width || !height) {
                return;
            }

            const ratio = width / height;

            if (!Number.isFinite(ratio) || ratio <= 0) {
                return;
            }

            wrap.style.setProperty("--media-ratio", String(ratio));

            updateOrientation(wrap, ratio);

            rememberRatio(id, ratio);

            realignAnchor();
        };

        if (image) {

            const update = () => applyRatio(image.naturalWidth, image.naturalHeight);

            if (image.complete && image.naturalWidth) {
                update();
            } else {
                image.addEventListener("load", update, { once: true });
            }

            image.addEventListener("error", () => {

                if (image.src !== item.src) {
                    image.src = item.src;
                }

            }, { once: true });

            if (window.TwiggSkeleton) {
                window.TwiggSkeleton.watchImage(mediaEl, image);
            }
        }


        /* ---- video behaviour ---- */

        if (video) {

            const posterReady =
                media.applyPoster
                    ? media.applyPoster(video, id, ratio => applyRatio(ratio, 1))
                    : Promise.resolve(false);

            if (window.TwiggSkeleton) {
                window.TwiggSkeleton.watchVideo(mediaEl, video, posterReady);
            }

            const fill = wrap.querySelector(".loop-progress-fill");
            const progress = wrap.querySelector(".loop-progress");

            video.muted = sharedMuted;

            const updateProgress = () => {

                fill.style.width =
                    video.duration
                        ? `${(video.currentTime / video.duration) * 100}%`
                        : "0%";
            };

            video.addEventListener("loadedmetadata", () => {
                applyRatio(video.videoWidth, video.videoHeight);
                updateProgress();
            });

            video.addEventListener("timeupdate", updateProgress);
            video.addEventListener("seeked", updateProgress);

            video.addEventListener("play", () => mediaEl.classList.remove("is-paused"));

            video.addEventListener("pause", () => {

                if (wrap.dataset.userPaused === "true") {
                    mediaEl.classList.add("is-paused");
                }
            });

            video.load();

            /* Click media: play / pause */

            mediaEl.addEventListener("click", event => {

                if (event.target.closest(".loop-media-controls, .loop-progress")) {
                    return;
                }

                if (video.paused) {

                    delete wrap.dataset.userPaused;

                    video.muted = sharedMuted;

                    safePlay(video);

                } else {

                    wrap.dataset.userPaused = "true";

                    video.pause();

                    mediaEl.classList.add("is-paused");
                }
            });

            /* Progress bar: click / drag to seek */

            let dragging = false;

            const seek = event => {

                const rect = progress.getBoundingClientRect();

                if (!rect.width || !video.duration) {
                    return;
                }

                const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));

                video.currentTime = fraction * video.duration;
            };

            progress.addEventListener("pointerdown", event => {

                event.stopPropagation();

                dragging = true;

                progress.classList.add("is-scrubbing");

                try {
                    progress.setPointerCapture(event.pointerId);
                } catch { }

                seek(event);
            });

            progress.addEventListener("pointermove", event => {

                if (dragging) {
                    seek(event);
                }
            });

            const stopDrag = () => {
                dragging = false;
                progress.classList.remove("is-scrubbing");
            };

            progress.addEventListener("pointerup", stopDrag);
            progress.addEventListener("pointercancel", stopDrag);
            progress.addEventListener("click", event => event.stopPropagation());

            /* Mute / unmute (shared setting) */

            post.muteBtn.addEventListener("click", event => {

                event.stopPropagation();

                setSharedMuted(!sharedMuted);

                video.muted = sharedMuted;

                refreshMuteUI();

                if (!sharedMuted) {
                    safePlay(video);
                }
            });

            /* Rotate (fullscreen only, see loop.css) */

            post.rotateBtn.addEventListener("click", event => {

                event.stopPropagation();

                if (isFs(post)) {
                    post.rotated = !post.rotated;
                    applyRotation(post);
                }
            });
        }

        post.fsBtn.addEventListener("click", event => {

            event.stopPropagation();

            toggleFullscreen(post);
        });


        /* ---- like / save / share / report ---- */

        const likeBtn = wrap.querySelector(".loop-like-btn");
        const saveBtn = wrap.querySelector(".loop-save-btn");
        const reportBtn = wrap.querySelector(".loop-report-btn");

        likeBtn.addEventListener("click", () => {

            likedIds.has(id) ? likedIds.delete(id) : likedIds.add(id);

            likeBtn.classList.toggle("is-liked", likedIds.has(id));
        });

        /* Save: "Saved" pop-up only when the post becomes saved, not on unsave */

        saveBtn.addEventListener("click", () => {

            const nowSaved = !savedIds.has(id);

            nowSaved ? savedIds.add(id) : savedIds.delete(id);

            saveBtn.classList.toggle("is-saved", nowSaved);

            if (nowSaved) {
                notifySaved();
            }
        });

        wrap.querySelector(".loop-share-btn").addEventListener("click", () => sharePost(id));

        reportBtn.addEventListener("click", () => {

            if (reportedIds.has(id)) {
                return;
            }

            reportedIds.add(id);

            reportBtn.classList.add("is-reported");

            toast("Reported. Thanks for letting us know.");
        });

        posts.set(wrap, post);
        postById.set(id, post);

        return post;
    }


    /* ----- open / close ----- */

    function openViewer(id) {

        const scroller = $("cpViewerScroll");

        scroller.innerHTML = "";

        posts.clear();
        postById.clear();

        feedItems().forEach(item => {
            scroller.appendChild(buildPost(item).section);
        });

        $("cpViewerTitle").textContent = creator.name;

        $("cpViewer").hidden = false;

        viewerOpen = true;

        history.pushState({ cpViewer: true }, "");

        /* Put the chosen post at the top. Its neighbours may still
           change height while their media loads, so the position is
           re-applied until the user scrolls or a moment has passed. */

        const target = postById.get(id);

        if (target) {

            anchor = { post: target, active: true };

            realignAnchor();

            setTimeout(() => {
                if (anchor) {
                    anchor.active = false;
                }
            }, 2500);
        }

        /* Play the post that is in view; pause the others */

        if ("IntersectionObserver" in window) {

            viewerObserver = new IntersectionObserver(entries => {

                entries.forEach(entry => {

                    const post = posts.get(entry.target);

                    if (!post || !post.video || isFs(post)) {
                        return;
                    }

                    const showing =
                        entry.isIntersecting &&
                        (
                            entry.intersectionRatio >= 0.5 ||
                            entry.intersectionRect.height >= scroller.clientHeight * 0.5
                        );

                    if (showing) {

                        if (post.wrap.dataset.userPaused !== "true" && post.video.paused) {

                            post.video.muted = sharedMuted;

                            safePlay(post.video);
                        }

                    } else {

                        post.video.pause();
                    }
                });

            }, { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 1] });

            posts.forEach((post, wrap) => viewerObserver.observe(wrap));
        }

        $("cpViewerBack").focus();
    }

    function hideViewer() {

        if (!viewerOpen) {
            return;
        }

        viewerOpen = false;
        anchor = null;

        if (viewerObserver) {
            viewerObserver.disconnect();
            viewerObserver = null;
        }

        if (realFullscreenElement()) {

            try {

                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }

            } catch { }
        }

        posts.forEach(post => post.video && post.video.pause());

        posts.clear();
        postById.clear();

        $("cpViewerScroll").innerHTML = "";

        $("cpViewer").hidden = true;
    }

    function setupViewer() {

        $("cpViewerBack").addEventListener("click", () => history.back());

        window.addEventListener("popstate", hideViewer);

        /* Once the user scrolls, stop re-aligning the opened post */

        ["wheel", "touchstart", "keydown", "pointerdown"].forEach(type => {

            $("cpViewerScroll").addEventListener(type, () => {
                if (anchor) {
                    anchor.active = false;
                }
            }, { passive: true });
        });

        document.addEventListener("keydown", event => {

            if (event.key !== "Escape" || !viewerOpen) {
                return;
            }

            for (const post of posts.values()) {

                if (post.media.classList.contains("loop-fs-fallback")) {
                    exitFallbackFs(post);
                    return;
                }
            }

            if (!realFullscreenElement()) {
                history.back();
            }
        });
    }


    /* =====================================================
       PACKAGES & PRICING
    ===================================================== */

    function emptyState(title, text) {
        return `<div class="cp-empty"><h2>${esc(title)}</h2><p>${esc(text)}</p></div>`;
    }

    function renderPackages() {

        const list = Array.isArray(creator.extras.packages) ? creator.extras.packages : [];

        $("panel-packages").innerHTML =
            list.length
                ? `<div class="cp-packages">${list.map(pkg => `
                    <article class="cp-package">
                        <h3>${esc(pkg.name)}</h3>
                        ${pkg.price !== undefined && pkg.price !== ""
                            ? `<div class="cp-package-price">${
                                typeof pkg.price === "number" ? "₹" + fmt(pkg.price) : esc(pkg.price)
                              }</div>`
                            : ""}
                        <div class="cp-package-meta">
                            ${pkg.delivery ? `<span class="cp-pill">${esc(pkg.delivery)} delivery</span>` : ""}
                            ${pkg.revisions !== undefined ? `<span class="cp-pill">${esc(pkg.revisions)} revisions</span>` : ""}
                        </div>
                        ${pkg.description ? `<p>${esc(pkg.description)}</p>` : ""}
                        ${Array.isArray(pkg.includes) && pkg.includes.length
                            ? `<ul>${pkg.includes.map(line => `<li>${esc(line)}</li>`).join("")}</ul>`
                            : ""}
                    </article>`).join("")}</div>`
                : emptyState(
                    "No packages yet",
                    `${creator.name} hasn't published packages and pricing yet. You can message them to ask about a quote.`
                );
    }


    /* =====================================================
       RATINGS & REVIEWS
    ===================================================== */

    function renderReviews() {

        const reviews = Array.isArray(creator.extras.reviews) ? creator.extras.reviews : [];

        let breakdown = `<p class="cp-note">A rating breakdown will appear here once individual reviews are available.</p>`;

        if (reviews.length) {

            const counts = [5, 4, 3, 2, 1].map(
                n => reviews.filter(review => Math.round(Number(review.rating)) === n).length
            );

            breakdown = `<div class="cp-breakdown">${[5, 4, 3, 2, 1].map((n, i) => `
                <div class="cp-bar-row">
                    <span>${n}</span>
                    <div class="cp-bar"><i style="width:${(counts[i] / reviews.length) * 100}%"></i></div>
                    <span>${counts[i]}</span>
                </div>`).join("")}</div>`;
        }

        const summary = `
            <div class="cp-reviews-summary">
                <div class="cp-score">
                    <strong>${creator.rating.toFixed(1)}</strong>
                    ${stars(creator.rating)}
                    <small>${fmt(creator.reviews)} reviews</small>
                </div>
                ${breakdown}
            </div>`;

        const list =
            reviews.length
                ? `<div class="cp-review-list">${reviews.map(review => `
                    <article class="cp-review">
                        <div class="cp-review-head">
                            <div class="cp-review-avatar">${avatarHtml(review.name || "?", review.avatar)}</div>
                            <div>
                                <div class="cp-review-name">${esc(review.name || "Anonymous")}</div>
                                ${review.date ? `<div class="cp-review-date">${esc(review.date)}</div>` : ""}
                            </div>
                        </div>
                        ${stars(review.rating)}
                        <p>${esc(review.text)}</p>
                    </article>`).join("")}</div>`
                : emptyState("No written reviews yet", "Customer reviews will appear here once they're available.");

        const panel = $("panel-reviews");

        panel.innerHTML = summary + list;

        wireAvatarFallback(panel);
    }


    /* =====================================================
       OTHER SERVICES
       One card per category this creator works in, built from
       their own media. Clicking opens that work in the Feed.
    ===================================================== */

    function renderServices() {

        const groups = new Map();

        creator.items.forEach(item => {

            if (!groups.has(item.category)) {
                groups.set(item.category, []);
            }

            groups.get(item.category).push(item);
        });

        const panel = $("panel-services");

        if (!groups.size) {
            panel.innerHTML = emptyState("No services yet", "This creator hasn't listed any services yet.");
            return;
        }

        panel.innerHTML = `<div class="cp-services">${
            Array.from(groups.entries()).map(([category, items]) => {

                const first = items.find(item => item.type === "image") || items[0];

                return `
                    <article class="cp-service" tabindex="0" role="button"
                        data-category="${esc(category)}" aria-label="View ${esc(category)} work">
                        <div class="cp-service-cover" data-cover="${first.id}">
                            ${first.type === "image"
                                ? `<img src="${esc(first.src)}" alt="" loading="lazy">`
                                : `<video muted playsinline preload="metadata"><source src="${esc(first.src + "#t=0.001")}" type="video/mp4"></video>`}
                        </div>
                        <div class="cp-service-body">
                            <h3>${esc(category)}</h3>
                            <p>${items.length} ${items.length === 1 ? "post" : "posts"} · ${esc(creator.name)}</p>
                        </div>
                    </article>`;

            }).join("")
        }</div>`;

        panel.querySelectorAll(".cp-service").forEach(card => {

            const coverBox = card.querySelector(".cp-service-cover");
            const image = coverBox.querySelector("img");
            const video = coverBox.querySelector("video");

            if (image && window.TwiggSkeleton) {
                window.TwiggSkeleton.watchImage(coverBox, image);
            }

            if (video) {

                const item = media.getById(Number(coverBox.dataset.cover));

                const posterReady =
                    media.applyPoster
                        ? media.applyPoster(video, item)
                        : Promise.resolve(false);

                video.load();

                if (window.TwiggSkeleton) {
                    window.TwiggSkeleton.watchVideo(coverBox, video, posterReady);
                }
            }

            const open = () => {
                state.category = card.dataset.category;
                renderFeed();
                selectTab("feed");
                window.scrollTo({ top: 0 });
            };

            card.addEventListener("click", open);

            card.addEventListener("keydown", event => {

                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open();
                }
            });
        });
    }


    /* =====================================================
       INIT
    ===================================================== */

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    if (!creator) {

        $("cpNotFound").hidden = false;

    } else {

        $("cpRoot").hidden = false;

        renderHeader();
        renderFeed();
        renderPackages();
        renderReviews();
        renderServices();
        setupTabs();
        setupViewer();

        /* Placeholder links do nothing */

        document.querySelectorAll(".nav-item").forEach(item => {

            item.addEventListener("click", event => {

                const href = item.getAttribute("href");

                if (!href || href === "#") {
                    event.preventDefault();
                }
            });
        });
    }

})();