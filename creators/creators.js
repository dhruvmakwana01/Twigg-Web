/* =========================================================
   TWIGG CREATORS — JAVASCRIPT

   Builds one card per creator from the SHARED media data
   (../shared/media-data.js). No media is duplicated: every
   creator's slider simply lists the items that creator owns.

   The category tiles come from ../shared/categories.js (the
   same tiles as Home); this page only adds the filter
   behaviour on top of them.

   Also includes (same logic as Home):
     - shared mute / unmute choice
     - returning to the same scroll position after visiting
       another page

   CHANGE: the creator's avatar + name block now links to the
   Creator Profile page (../creator-profile/creator-profile.html
   ?creator=<slug>).
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SETTINGS
    ===================================================== */

    const SAVED_KEY = "twigg_saved_creators";

    /* Mute choice shared by the Home, Reels, Loop and Creators pages */
    const MUTE_KEY = "twigg_shared_muted";

    /* Where the user left off on this page */
    const CREATORS_SCROLL_KEY = "twigg_creators_scroll";
    const CREATORS_FILTER_KEY = "twigg_creators_filter";

    /* Touch autoplay thresholds (same values as Home) */
    const AUTOPLAY_MIN_RATIO = 0.6;
    const AUTOPLAY_MIN_VIEWPORT_SHARE = 0.5;

    const touchQuery = window.matchMedia("(hover: none)");

    const mobileLayoutQuery = window.matchMedia("(max-width: 800px)");

    function isTouchFeed() {
        return touchQuery.matches;
    }

    let autoplayEvaluateTimer = null;

    /* true = start muted */
    let sharedVideoMuted = true;


    /* Disable the browser's automatic scroll restoration. */

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    const navigationEntry =
        performance.getEntriesByType("navigation")[0];

    const isReload =
        navigationEntry &&
        navigationEntry.type === "reload";

    /* A real browser refresh starts fresh. */

    if (isReload) {

        try {
            sessionStorage.removeItem(CREATORS_SCROLL_KEY);
            sessionStorage.removeItem(CREATORS_FILTER_KEY);
            sessionStorage.removeItem(MUTE_KEY);
        } catch { }
    }

    /* Start with the mute choice made on any other page. Default: muted. */

    try {
        sharedVideoMuted = sessionStorage.getItem(MUTE_KEY) !== "false";
    } catch {
        sharedVideoMuted = true;
    }


    /* =====================================================
       CATEGORIES (shared with Home and Search)

       Names, images and keywords live in ../shared/categories.js.
    ===================================================== */

    const CATEGORIES =
        window.TwiggCategories
            ? window.TwiggCategories.getAll()
            : [];


    /* =====================================================
       CREATOR PROFILES

       The creator's profile picture, OVERALL description and
       starting price.
       (The shared media data only has per-media captions, which
       must not be used here.) When the backend exists, these
       come from the creator record instead.
    ===================================================== */

    const PROFILES = {

        "Aarav Studio": {
            image: "https://i.pravatar.cc/150?img=12",
            price: 1500,
            description: "Video editor focused on fast, polished edits for brands, creators and ads. Colour grading, sound design and quick turnarounds included."
        },
        "Maya Designs": {
            image: "https://i.pravatar.cc/150?img=47",
            price: 800,
            description: "Graphic designer who builds consistent social media systems, logos and brand visuals for small businesses and personal brands."
        },
        "Pixel Forge": {
            image: "https://i.pravatar.cc/150?img=33",
            price: 1200,
            description: "Design studio for logos, interfaces and product visuals. Clear process, unlimited revisions and developer-ready files."
        },
        "Nora Creative": {
            image: "https://i.pravatar.cc/150?img=32",
            price: 1000,
            description: "Web, mobile and book designer. I turn rough ideas into clean layouts and interfaces that are easy to use and easy to read."
        },
        "Kabir Motion": {
            image: "https://i.pravatar.cc/150?img=11",
            price: 2000,
            description: "Motion designer creating branding animations, intros and kinetic graphics that give your content a confident, professional look."
        },
        "Lumen Works": {
            image: "https://i.pravatar.cc/150?img=15",
            price: 1800,
            description: "Motion and video studio for logo animations, packaging reveals and short-form edits made for launches and campaigns."
        },
        "Studio Craft": {
            image: "https://i.pravatar.cc/150?img=5",
            price: 1400,
            description: "Packaging designer for small and growing brands: custom boxes, labels and inserts, from first sketch to print-ready files."
        },
        "Markwell Studio": {
            image: "https://i.pravatar.cc/150?img=53",
            price: 2500,
            description: "Logo and identity designer. You get concept sketches, multiple directions and a full brand file pack to use everywhere."
        },
        "Pixel & Co": {
            image: "https://i.pravatar.cc/150?img=25",
            price: 3000,
            description: "Product design team for web and mobile apps. We work from wireframes to prototypes to the finished, polished interface."
        },
        "Inkwell Press": {
            image: "https://i.pravatar.cc/150?img=20",
            price: 1100,
            description: "Book designer for covers, interiors and series layouts, with careful typography for both print and ebook."
        },
        "Reel Intro Studio": {
            image: "https://i.pravatar.cc/150?img=60",
            price: 600,
            description: "Intro and outro videos and templates that make your channel look professionally produced from the first second."
        },
        "Kinetic House": {
            image: "https://i.pravatar.cc/150?img=8",
            price: 1700,
            description: "Motion graphics studio specialising in kinetic type and animated explainers that make your message move."
        },
        "Studio Nova": {
            image: "https://i.pravatar.cc/150?img=45",
            price: 900,
            description: "Product photographer for catalogues, ads and online stores, with clean lighting and a consistent style across every shot."
        },
        "ColorLab Studio": {
            image: "https://i.pravatar.cc/150?img=68",
            price: 700,
            description: "Colourist for film and social content. Moody, warm, cinematic or clean looks matched across every clip."
        }
    };

    const FALLBACK_PRICE = 500;


    /* =====================================================
       ICONS
    ===================================================== */

    const ICONS = {

        prev: `<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"></path></svg>`,

        next: `<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg>`,

        star: `<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z"></path></svg>`,

        save: `<svg viewBox="0 0 24 24"><path d="M6 4h12v16l-6-4-6 4z"></path></svg>`,

        message: `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="M7 9l5 4 5-4"></path></svg>`,

        /* Same mute icons as Home */

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
        `
    };


    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function formatNumber(value) {
        return Number(value).toLocaleString("en-IN");
    }

    function creatorSlug(name) {
        return String(name)
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }


    /* =====================================================
       SAVED CREATORS (persisted)
    ===================================================== */

    let savedCreators = new Set();

    try {
        const stored = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");

        if (Array.isArray(stored)) {
            savedCreators = new Set(stored);
        }
    } catch {
        savedCreators = new Set();
    }

    function persistSaved() {
        try {
            localStorage.setItem(
                SAVED_KEY,
                JSON.stringify(Array.from(savedCreators))
            );
        } catch { }
    }


    /* =====================================================
       GROUP SHARED MEDIA BY CREATOR
    ===================================================== */

    function buildCreators() {

        const media = window.TwiggMedia;

        const all = media ? media.getAll() : [];

        const groups = new Map();

        all.forEach(item => {

            const name = item.creator.name;

            if (!groups.has(name)) {
                groups.set(name, { name, items: [] });
            }

            groups.get(name).items.push(item);
        });

        return Array.from(groups.values()).map(group => {

            /* Primary category = the one used most often */

            const counts = new Map();

            group.items.forEach(item => {
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

            /* Average rating; total reviews across the creator's work */

            const ratings =
                group.items
                    .map(item => parseFloat(item.rating))
                    .filter(Number.isFinite);

            const rating =
                ratings.length
                    ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
                    : 0;

            const reviews =
                group.items.reduce(
                    (sum, item) =>
                        sum + (parseInt(String(item.reviews).replace(/,/g, ""), 10) || 0),
                    0
                );

            const profile = PROFILES[group.name] || {};

            return {
                name: group.name,
                slug: creatorSlug(group.name),
                items: group.items,
                category,
                rating,
                reviews,
                profileImage:
                    (group.items.find(item => item.creator.profileImage) || { creator: {} })
                        .creator.profileImage ||
                    profile.image ||
                    "",
                price: profile.price || FALLBACK_PRICE,
                description:
                    profile.description ||
                    `Independent creator offering ${category.toLowerCase() || "creative"} services and related creative work for brands and creators.`
            };
        });
    }


    /* =====================================================
       RENDER
    ===================================================== */

    function buildSlide(item, creator) {

        const label = `${item.title} by ${creator.name}`;

        if (item.type === "video") {

            return `
                <div class="creator-slide" data-media-id="${item.id}">
                    <video muted loop playsinline preload="metadata" aria-label="${escapeHtml(label)}">
                        <source src="${escapeHtml(item.src + "#t=0.001")}" type="video/mp4">
                    </video>
                    <div class="video-indicator"></div>
                </div>
            `;
        }

        return `
            <div class="creator-slide" data-media-id="${item.id}">
                <img src="${escapeHtml(item.src)}" alt="${escapeHtml(label)}"
                    loading="lazy" draggable="false">
            </div>
        `;
    }

    function buildCard(creator) {

        const multiple = creator.items.length > 1;

        const hasVideo = creator.items.some(item => item.type === "video");

        const messageUrl =
            "../message/message.html?creator=" + encodeURIComponent(creator.slug);

        const profileUrl =
            "../creator%20profile/creator-profile.html?creator=" + encodeURIComponent(creator.slug);

        return `
            <article class="creator-card" data-creator="${escapeHtml(creator.slug)}">

                <div class="creator-media">

                    <div class="creator-track" tabindex="0"
                        aria-label="${escapeHtml(creator.name)} work samples">
                        ${creator.items.map(item => buildSlide(item, creator)).join("")}
                    </div>

                    ${multiple ? `
                        <button class="slider-arrow prev" type="button" aria-label="Previous">${ICONS.prev}</button>
                        <button class="slider-arrow next" type="button" aria-label="Next">${ICONS.next}</button>

                        <div class="slider-dots">
                            ${creator.items.map((_, index) => `
                                <button class="slider-dot" type="button"
                                    aria-label="Show item ${index + 1}"></button>
                            `).join("")}
                        </div>
                    ` : ""}

                    ${hasVideo ? `
                        <button class="creator-mute" type="button" aria-label="Unmute video">
                            ${sharedVideoMuted ? ICONS.muted : ICONS.unmuted}
                        </button>
                    ` : ""}

                </div>

                <div class="creator-body">

                    <a class="creator-head" href="${escapeHtml(profileUrl)}"
                        style="text-decoration:none;color:inherit"
                        aria-label="Open ${escapeHtml(creator.name)}'s profile">

                        ${creator.profileImage
                            ? `<img class="card-profile-image" src="${escapeHtml(creator.profileImage)}"
                                alt="${escapeHtml(creator.name)}" loading="lazy" draggable="false">`
                            : `<div class="card-profile-initial">${escapeHtml(creator.name.charAt(0).toUpperCase())}</div>`}

                        <div class="creator-identity">
                            <h2 class="creator-name">${escapeHtml(creator.name)}</h2>
                            <div class="creator-category">${escapeHtml(creator.category)}</div>

                            <div class="creator-rating">
                                ${ICONS.star}
                                <span>${creator.rating.toFixed(1)}</span>
                                <span class="creator-reviews">(${formatNumber(creator.reviews)} reviews)</span>
                            </div>
                        </div>

                    </a>

                    <p class="creator-description">${escapeHtml(creator.description)}</p>

                    <div class="creator-footer">

                        <div class="creator-price"><span>From</span>₹${formatNumber(creator.price)}</div>

                        <div class="creator-actions">

                            <button class="creator-save" type="button"
                                aria-pressed="false" aria-label="Save ${escapeHtml(creator.name)}">
                                ${ICONS.save}
                            </button>

                            <a class="creator-message" href="${escapeHtml(messageUrl)}">
                                ${ICONS.message}
                                <span>Message</span>
                            </a>

                        </div>

                    </div>

                </div>

            </article>
        `;
    }


    /* =====================================================
       MUTE HELPERS (same logic as Home)
    ===================================================== */

    function refreshMuteIcons() {

        const icon = sharedVideoMuted ? ICONS.muted : ICONS.unmuted;

        document.querySelectorAll(".creator-mute").forEach(button => {
            button.innerHTML = icon;
            button.setAttribute(
                "aria-label",
                sharedVideoMuted ? "Unmute video" : "Mute video"
            );
        });
    }

    /*
       Plays a video. If the browser blocks playback WITH sound
       (autoplay policy), the video falls back to muted, the shared
       setting becomes muted and the icons are refreshed.
    */

    function safePlay(video) {

        const promise = video.play();

        if (promise && promise.catch) {

            promise.catch(error => {

                if (
                    error &&
                    error.name === "NotAllowedError" &&
                    !video.muted
                ) {

                    video.muted = true;

                    sharedVideoMuted = true;

                    try {
                        sessionStorage.setItem(MUTE_KEY, "true");
                    } catch { }

                    refreshMuteIcons();

                    video.play().catch(() => { });
                }
            });
        }
    }


    /* =====================================================
       SLIDER + PLAYBACK STATE (one entry per card)
    ===================================================== */

    const states = new Map();

    /* Cards that are sufficiently visible (touch autoplay) */
    const autoplayVisible = new Map();


    /*
       Plays the video of the current slide only while the card is
       "active" (hovered, or auto-selected on touch). The active
       video follows the shared mute choice; every other video is
       paused, rewound and muted (only one video can have sound).
    */

    function syncPlayback(state) {

        state.slides.forEach((slide, index) => {

            const video = slide.querySelector("video");

            if (!video) {
                return;
            }

            const indicator = slide.querySelector(".video-indicator");

            if (state.active && index === state.index) {

                video.muted = sharedVideoMuted;

                if (indicator) {
                    indicator.classList.add("hidden");
                }

                safePlay(video);

            } else {

                video.muted = true;

                if (indicator) {
                    indicator.classList.remove("hidden");
                }

                if (!video.paused) {
                    video.pause();
                }

                if (video.currentTime > 0) {
                    try {
                        video.currentTime = 0;
                    } catch { }
                }
            }
        });
    }

    function setActive(state, active) {

        if (state.active === active) {
            return;
        }

        state.active = active;

        syncPlayback(state);
    }

    function syncSlider(state) {

        state.dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === state.index);
        });

        if (state.prev) {
            state.prev.classList.toggle("is-disabled", state.index <= 0);
        }

        if (state.next) {
            state.next.classList.toggle(
                "is-disabled",
                state.index >= state.slides.length - 1
            );
        }

        /* The mute button only shows while the current slide is a video */

        const current = state.slides[state.index];

        state.media.classList.toggle(
            "on-video",
            Boolean(current && current.querySelector("video"))
        );
    }

    function goTo(state, index) {

        const target = Math.max(0, Math.min(state.slides.length - 1, index));

        state.track.scrollTo({
            left: target * state.track.clientWidth,
            behavior: "smooth"
        });
    }


    function setupCard(card, creator) {

        const track = card.querySelector(".creator-track");
        const slides = Array.from(card.querySelectorAll(".creator-slide"));

        const state = {
            card,
            media: card.querySelector(".creator-media"),
            track,
            slides,
            dots: Array.from(card.querySelectorAll(".slider-dot")),
            prev: card.querySelector(".slider-arrow.prev"),
            next: card.querySelector(".slider-arrow.next"),
            index: 0,
            active: false
        };

        states.set(card, state);


        /* ----- Profile picture: if it fails to load, show the Home-style initial ----- */

        const avatarImage = card.querySelector(".creator-head .card-profile-image");

        if (avatarImage) {

            avatarImage.addEventListener(
                "error",
                () => {

                    const initial = document.createElement("div");

                    initial.className = "card-profile-initial";

                    initial.textContent = creator.name.charAt(0).toUpperCase();

                    avatarImage.replaceWith(initial);
                },
                { once: true }
            );
        }


        /* ----- Media: posters, duration badges, skeletons ----- */

        slides.forEach(slide => {

            const image = slide.querySelector("img");
            const video = slide.querySelector("video");

            if (image && window.TwiggSkeleton) {
                window.TwiggSkeleton.watchImage(slide, image);
            }

            if (video) {

                video.muted = sharedVideoMuted;

                const item =
                    window.TwiggMedia
                        ? window.TwiggMedia.getById(Number(slide.dataset.mediaId))
                        : null;

                const indicator = slide.querySelector(".video-indicator");

                const showDuration = () => {

                    const text =
                        window.TwiggMedia
                            ? window.TwiggMedia.formatDuration(video.duration)
                            : "";

                    if (text && indicator) {
                        indicator.textContent = text;
                        indicator.classList.add("has-duration");
                    }
                };

                video.addEventListener("loadedmetadata", showDuration);
                video.addEventListener("durationchange", showDuration);

                showDuration();

                /* Shared thumbnail pipeline (same cached frame as Home / Loop) */

                const posterReady =
                    (item && window.TwiggMedia.applyPoster)
                        ? window.TwiggMedia.applyPoster(video, item)
                        : Promise.resolve(false);

                video.load();

                if (window.TwiggSkeleton) {
                    window.TwiggSkeleton.watchVideo(slide, video, posterReady);
                }
            }
        });


        /* ----- Slider navigation ----- */

        track.addEventListener(
            "scroll",
            () => {

                const width = track.clientWidth;

                /* Ignore scroll events while the card is hidden by a filter */

                if (!width) {
                    return;
                }

                const index = Math.max(
                    0,
                    Math.min(slides.length - 1, Math.round(track.scrollLeft / width))
                );

                if (index !== state.index) {
                    state.index = index;
                    syncSlider(state);
                    syncPlayback(state);
                }
            },
            { passive: true }
        );

        if (state.prev) {
            state.prev.addEventListener("click", event => {
                event.stopPropagation();
                goTo(state, state.index - 1);
            });
        }

        if (state.next) {
            state.next.addEventListener("click", event => {
                event.stopPropagation();
                goTo(state, state.index + 1);
            });
        }

        state.dots.forEach((dot, index) => {
            dot.addEventListener("click", event => {
                event.stopPropagation();
                goTo(state, index);
            });
        });

        track.addEventListener("keydown", event => {

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goTo(state, state.index - 1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                goTo(state, state.index + 1);
            }
        });

        syncSlider(state);


        /* ----- Hover autoplay (mouse devices only) ----- */

        card.addEventListener("mouseenter", () => {

            if (!isTouchFeed()) {
                setActive(state, true);
            }
        });

        card.addEventListener("mouseleave", () => {

            if (!isTouchFeed()) {
                setActive(state, false);
            }
        });


        /* ----- Mute / unmute (same logic as Home) ----- */

        const muteButton = card.querySelector(".creator-mute");

        if (muteButton) {

            muteButton.addEventListener("click", event => {

                event.stopPropagation();

                sharedVideoMuted = !sharedVideoMuted;

                /* Remember the choice for the other pages. */

                try {
                    sessionStorage.setItem(MUTE_KEY, String(sharedVideoMuted));
                } catch { }

                refreshMuteIcons();

                /*
                   The active card (hovered, or auto-playing on touch) is the
                   only one that may have sound; syncPlayback applies the new
                   choice to it and keeps every other video muted.
                */

                states.forEach(other => {

                    if (other.card === card && !other.active) {

                        /* Button clicked on a card that is not active yet */

                        setActive(other, true);

                    } else {

                        syncPlayback(other);
                    }
                });
            });
        }


        /* ----- Save ----- */

        const saveButton = card.querySelector(".creator-save");

        const renderSaved = () => {

            const isSaved = savedCreators.has(creator.slug);

            saveButton.classList.toggle("saved", isSaved);
            saveButton.setAttribute("aria-pressed", String(isSaved));
        };

        renderSaved();

        saveButton.addEventListener("click", event => {

            event.stopPropagation();

            if (savedCreators.has(creator.slug)) {
                savedCreators.delete(creator.slug);
            } else {
                savedCreators.add(creator.slug);
            }

            persistSaved();

            renderSaved();
        });

        return state;
    }


    /* =====================================================
       TOUCH AUTOPLAY (visibility based)

       Only ONE card is active at a time: the sufficiently
       visible card closest to the middle of the screen. Its
       current slide plays if that slide is a video.
    ===================================================== */

    function releaseAll() {
        states.forEach(state => setActive(state, false));
    }

    function evaluateAutoplay() {

        if (!isTouchFeed()) {
            return;
        }

        if (document.visibilityState === "hidden") {
            releaseAll();
            return;
        }

        const middle = window.innerHeight / 2;

        let best = null;
        let bestDistance = Infinity;

        autoplayVisible.forEach((_, card) => {

            const rect = card.getBoundingClientRect();

            const distance = Math.abs(rect.top + rect.height / 2 - middle);

            if (distance < bestDistance) {
                best = card;
                bestDistance = distance;
            }
        });

        states.forEach((state, card) => {
            setActive(state, card === best);
        });
    }


    /* =====================================================
       SCROLL POSITION (same logic as Home)

       On mobile (800px and below) the DOCUMENT scrolls; on
       desktop / tablet the fixed .main box scrolls. This is
       checked on every call so resizing across the breakpoint
       keeps working.
    ===================================================== */

    const grid = document.getElementById("creatorsGrid");

    function getScroller() {

        if (mobileLayoutQuery.matches) {

            return (
                document.scrollingElement ||
                document.documentElement
            );
        }

        return (
            document.querySelector(".main") ||
            document.scrollingElement ||
            document.documentElement
        );
    }

    function isDocumentScroller(scroller) {

        return (
            scroller === document.scrollingElement ||
            scroller === document.documentElement ||
            scroller === document.body
        );
    }

    function getScrollY() {

        const scroller = getScroller();

        return isDocumentScroller(scroller)
            ? window.scrollY
            : scroller.scrollTop;
    }

    function jumpToScroll(y) {

        const scroller = getScroller();

        const isDocument = isDocumentScroller(scroller);

        const target =
            isDocument
                ? document.documentElement
                : scroller;

        const previous = target.style.scrollBehavior;

        target.style.scrollBehavior = "auto";

        if (isDocument) {
            window.scrollTo(0, y);
        } else {
            scroller.scrollTop = y;
        }

        target.style.scrollBehavior = previous;
    }

    /* While true, scroll events from the restoration must NOT overwrite the saved value. */

    let restoring = false;

    function saveState() {

        if (restoring) {
            return;
        }

        try {
            sessionStorage.setItem(
                CREATORS_SCROLL_KEY,
                String(getScrollY())
            );
        } catch { }
    }


    /* =====================================================
       INIT: CATEGORIES, CARDS, SEARCH + FILTERS
    ===================================================== */

    const searchInput = document.getElementById("creatorSearchInput");
    const clearSearch = document.getElementById("clearCreatorSearch");
    const categoriesStrip = document.getElementById("creatorCategories");
    const emptyState = document.getElementById("creatorsEmpty");

    const entries = [];

    const filterState = { query: "", category: "" };


    /* ----- Category tiles (shared component from categories.js) ----- */

    if (categoriesStrip && window.TwiggCategories) {

        window.TwiggCategories.render(
            categoriesStrip,
            { interactive: true, toggle: true }
        );

        categoriesStrip.querySelectorAll(".category").forEach(tile => {

            const image = tile.querySelector("img");

            if (image && window.TwiggSkeleton) {
                window.TwiggSkeleton.watchImage(tile, image);
            }

            const toggle = () => {

                const name = tile.dataset.category;

                filterState.category =
                    filterState.category === name ? "" : name;

                applyFilters();
            };

            tile.addEventListener("click", toggle);

            tile.addEventListener("keydown", event => {

                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggle();
                }
            });
        });
    }


    /* ----- Filtering ----- */

    function persistFilters() {

        try {
            sessionStorage.setItem(
                CREATORS_FILTER_KEY,
                JSON.stringify(filterState)
            );
        } catch { }
    }

    function applyFilters() {

        const query = filterState.query.trim().toLowerCase();

        let visible = 0;

        entries.forEach(entry => {

            const matches =
                (!query || entry.text.includes(query)) &&
                (!filterState.category || entry.categories.has(filterState.category));

            entry.card.classList.toggle("is-filtered-out", !matches);

            const state = states.get(entry.card);

            if (matches) {

                visible++;

                /* A card that was hidden can lose its slider offset */

                if (state && state.track.clientWidth) {
                    state.track.scrollLeft = state.index * state.track.clientWidth;
                }

            } else {

                autoplayVisible.delete(entry.card);

                if (state) {
                    setActive(state, false);
                }
            }
        });

        if (emptyState) {
            emptyState.hidden = visible > 0;
        }

        if (clearSearch) {
            clearSearch.classList.toggle("visible", query.length > 0);
        }

        if (categoriesStrip) {

            categoriesStrip.querySelectorAll(".category").forEach(tile => {

                const isActive = tile.dataset.category === filterState.category;

                tile.classList.toggle("active", isActive);
                tile.setAttribute("aria-pressed", String(isActive));
            });
        }

        persistFilters();

        if (isTouchFeed()) {
            evaluateAutoplay();
        }
    }


    /* ----- Cards ----- */

    if (grid) {

        const creators = buildCreators();

        grid.innerHTML = creators.map(buildCard).join("");

        const cards = Array.from(grid.querySelectorAll(".creator-card"));

        cards.forEach((card, index) => {

            const creator = creators[index];

            setupCard(card, creator);

            const categories = new Set(creator.items.map(item => item.category));

            entries.push({
                card,
                categories,
                text: [
                    creator.name,
                    creator.category,
                    creator.description,
                    Array.from(categories).join(" ")
                ].join(" ").toLowerCase()
            });
        });

        if ("IntersectionObserver" in window) {

            const observer = new IntersectionObserver(
                observed => {

                    observed.forEach(entry => {

                        const enough =
                            entry.isIntersecting &&
                            (
                                entry.intersectionRatio >= AUTOPLAY_MIN_RATIO ||
                                entry.intersectionRect.height >=
                                    window.innerHeight * AUTOPLAY_MIN_VIEWPORT_SHARE
                            );

                        if (enough) {
                            autoplayVisible.set(entry.target, true);
                        } else {
                            autoplayVisible.delete(entry.target);
                        }
                    });

                    evaluateAutoplay();
                },
                {
                    root: null,
                    threshold: [0, 0.25, 0.5, 0.6, 0.75, 1]
                }
            );

            cards.forEach(card => observer.observe(card));
        }
    }


    /* ----- Search bar ----- */

    if (searchInput) {

        searchInput.addEventListener("input", () => {
            filterState.query = searchInput.value;
            applyFilters();
        });

        searchInput.addEventListener("keydown", event => {

            if (event.key === "Escape" && searchInput.value) {
                searchInput.value = "";
                filterState.query = "";
                applyFilters();
            }
        });
    }

    if (clearSearch) {

        clearSearch.addEventListener("click", () => {

            searchInput.value = "";

            filterState.query = "";

            applyFilters();

            searchInput.focus();
        });
    }


    /* ----- Restore the search / category the user had ----- */

    if (!isReload) {

        try {

            const stored = JSON.parse(
                sessionStorage.getItem(CREATORS_FILTER_KEY) || "null"
            );

            if (stored && typeof stored === "object") {

                filterState.query =
                    typeof stored.query === "string" ? stored.query : "";

                filterState.category =
                    CATEGORIES.some(category => category.name === stored.category)
                        ? stored.category
                        : "";

                if (searchInput) {
                    searchInput.value = filterState.query;
                }
            }

        } catch { }
    }

    applyFilters();


    /* =====================================================
       RESTORE SCROLL POSITION
       (user left this page and came back)
    ===================================================== */

    let savedScroll = null;

    if (!isReload) {

        try {

            const storedScroll = sessionStorage.getItem(CREATORS_SCROLL_KEY);

            if (storedScroll !== null) {

                const parsed = Number(storedScroll);

                if (Number.isFinite(parsed) && parsed >= 0) {
                    savedScroll = parsed;
                }
            }

        } catch {
            savedScroll = null;
        }
    }

    if (savedScroll !== null) {

        jumpToScroll(savedScroll);

        const reached = () =>
            Math.abs(getScrollY() - savedScroll) <= 2;

        if (!reached()) {

            restoring = true;

            const root = document.documentElement;

            root.style.visibility = "hidden";

            let watcher = null;
            let revealTimer = null;
            let correctionTimer = null;
            let revealed = false;

            const userEvents = [
                "wheel",
                "touchstart",
                "keydown",
                "mousedown"
            ];

            const stopRestoring = () => {

                restoring = false;

                root.style.visibility = "";

                if (watcher) {
                    watcher.disconnect();
                    watcher = null;
                }

                clearTimeout(revealTimer);
                clearTimeout(correctionTimer);

                userEvents.forEach(type => {
                    window.removeEventListener(type, stopRestoring);
                });
            };

            const reveal = () => {

                if (revealed) {
                    return;
                }

                revealed = true;

                clearTimeout(revealTimer);

                jumpToScroll(savedScroll);

                root.style.visibility = "";

                if (reached()) {
                    stopRestoring();
                }
            };

            const attempt = () => {

                jumpToScroll(savedScroll);

                if (reached()) {
                    reveal();
                    stopRestoring();
                }
            };

            if ("ResizeObserver" in window) {

                watcher = new ResizeObserver(attempt);

                watcher.observe(document.body);

                if (grid) {
                    watcher.observe(grid);
                }
            }

            userEvents.forEach(type => {
                window.addEventListener(
                    type,
                    stopRestoring,
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
                window.addEventListener("load", onLoaded, { once: true });
            }

            revealTimer = setTimeout(reveal, 1500);

            correctionTimer = setTimeout(stopRestoring, 3500);
        }
    }


    /* ----- Save the position whenever the user may leave ----- */

    window.addEventListener("pagehide", saveState);

    document.addEventListener("visibilitychange", () => {

        if (document.visibilityState === "hidden") {

            saveState();
            releaseAll();

        } else {

            evaluateAutoplay();
        }
    });

    let scrollSaveTimeout = null;

    window.addEventListener(
        "scroll",
        () => {

            clearTimeout(scrollSaveTimeout);

            scrollSaveTimeout = setTimeout(saveState, 50);

            if (!isTouchFeed()) {
                return;
            }

            /* Re-pick the most central card shortly after scrolling stops (touch) */

            clearTimeout(autoplayEvaluateTimer);

            autoplayEvaluateTimer = setTimeout(evaluateAutoplay, 120);
        },
        { passive: true, capture: true }
    );

    if (touchQuery.addEventListener) {
        touchQuery.addEventListener("change", () => {
            releaseAll();
            evaluateAutoplay();
        });
    }


    /* Keep each slider on its current slide when the card width changes */

    window.addEventListener("resize", () => {

        states.forEach(state => {

            if (state.track.clientWidth) {
                state.track.scrollLeft = state.index * state.track.clientWidth;
            }
        });
    });


    /* =====================================================
       NAVIGATION
       - placeholder links do nothing
       - Creators icon (active page) scrolls to the top
       - any other page: the position is saved first
    ===================================================== */

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", event => {

            const href = item.getAttribute("href");

            if (!href || href === "#") {
                event.preventDefault();
                return;
            }

            if (
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.altKey ||
                event.button > 0
            ) {
                return;
            }

            if (item.classList.contains("active")) {

                event.preventDefault();

                const scroller = getScroller();

                (isDocumentScroller(scroller) ? window : scroller)
                    .scrollTo({ top: 0, behavior: "smooth" });

                return;
            }

            saveState();
        });
    });

    /* Opening a creator's profile also remembers where the user was */

    document.querySelectorAll(".creator-head").forEach(link => {
        link.addEventListener("click", saveState);
    });

})();