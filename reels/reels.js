document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       REEL DATA

       Comes from the SHARED media data
       (../shared/media-data.js). Reels shows EVERY video
       (feed "reels"). Ordering, playback and interactions
       stay in this file.

       Optional per-item field in the shared data:
           creator.profileImage
       If it is missing (or fails to load) the creator's
       initial is shown inside the circular avatar.
    ===================================================== */

    const sharedMedia = window.TwiggMedia;

    const reels =
        sharedMedia
            ? sharedMedia.getFeed("reels").map(item => ({
                id: item.id,
                name: item.creator.name,
                category: item.category,
                rating: item.rating,
                reviews: item.reviews,
                video: item.src,
                thumbnail: item.thumbnail,
                profileImage: item.creator.profileImage,
                caption: item.caption || item.description || ""
            }))
            : [];


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const feed = document.querySelector(".reels-feed");
    const track = document.querySelector(".reels-track");
    const navControls = document.querySelector(".reel-nav-controls");
    const upButton = document.querySelector(".reel-nav-up");
    const downButton = document.querySelector(".reel-nav-down");

    if (!feed || !track || !reels.length) {
        return;
    }


    /* =====================================================
       PAGE STATE
    ===================================================== */

    const HOME_ORDER_KEY = "twigg_home_order";
    const HOME_SCROLL_KEY = "twigg_home_scroll";
    const HOME_RATIO_KEY = "twigg_home_ratios";
    const REELS_ORDER_KEY = "twigg_reels_order";
    const REELS_STATE_KEY = "twigg_reels_state";

    /* Mute choice shared by the Home, Reels and Loop pages */
    const MUTE_KEY = "twigg_shared_muted";

    const MOBILE_QUERY = "(max-width: 800px)";

    /* -----------------------------------------------------
       CARD LAYOUT SETTINGS (desktop / tablet)

       OUTSIDE_SIDE_SPACE: width needed on EACH side of the
       card for the creator info (200px + 28px gap) and the
       action rail, plus a little breathing room.

       MIN_OUTSIDE_WIDTH: the smallest card we are happy to
       show before moving the info + actions inside the card.
    ----------------------------------------------------- */

    const OUTSIDE_SIDE_SPACE = 244;

    const MIN_OUTSIDE_WIDTH = {
        portrait: 400,
        landscape: 640
    };

    const MAX_LANDSCAPE_WIDTH = 1280;
    const MAX_PORTRAIT_HEIGHT = 800;
    const MAX_COMPACT_PORTRAIT_HEIGHT = 720;

    /* -----------------------------------------------------
       UP / DOWN BUTTON PLACEMENT

       NAV_BUTTON_SIZE:  the round up / down buttons (56px).
       NAV_BUTTON_GAP:   gap kept between each button and the
                         card when they are split above / below.
       NAV_OVERLAP_GAP:  how close the card may get to the
                         buttons before they count as overlapping.
    ----------------------------------------------------- */

    const NAV_BUTTON_SIZE = 56;
    const NAV_BUTTON_GAP = 14;
    const NAV_OVERLAP_GAP = 8;

    const navigationEntry =
        performance.getEntriesByType("navigation")[0];

    const isReelsReload =
        navigationEntry &&
        navigationEntry.type === "reload";

    /* A real browser refresh starts everything fresh. */
    if (isReelsReload) {
        [
            HOME_ORDER_KEY,
            HOME_SCROLL_KEY,
            HOME_RATIO_KEY,
            REELS_ORDER_KEY,
            REELS_STATE_KEY,
            MUTE_KEY
        ].forEach(key => sessionStorage.removeItem(key));
    }


    /* =====================================================
       SHARED MUTE STATE

       One mute setting is shared across the entire Reels
       feed AND across the Home and Loop pages: it starts
       with whatever was chosen there (default: muted), and
       toggling it here is remembered for those pages too.
       A real refresh starts muted again.
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
            sessionStorage.setItem(MUTE_KEY, String(value));
        } catch {}
    }


    /* =====================================================
       SVG ICONS
    ===================================================== */

    const icons = {
        mute: `
            <svg viewBox="0 0 24 24">
                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                <path d="M16 9c1 1 1 5 0 6"></path>
            </svg>
        `,

        unmute: `
            <svg viewBox="0 0 24 24">
                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                <path d="M16 8c2 2 2 6 0 8"></path>
                <path d="M19 5c3 3 3 11 0 14"></path>
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

        /* Rotate the video 90deg (mobile, and fullscreen everywhere) */
        rotate: `
            <svg viewBox="0 0 24 24">
                <path d="M20 12a8 8 0 1 1-2.34-5.66"></path>
                <path d="M20 4v5h-5"></path>
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
        `
    };


    /* =====================================================
       CREATE STARS
    ===================================================== */

    function createStars() {
        return Array.from(
            { length: 5 },
            () => `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z"></path>
                </svg>
            `
        ).join("");
    }


    /* =====================================================
       CREATE CREATOR AVATAR

       Uses reel.profileImage if present, otherwise an
       initial. If the image fails to load it is removed
       and the initial shows instead.
    ===================================================== */

    function createAvatar(reel) {

        const initial =
            (reel.name || "?")
                .trim()
                .charAt(0)
                .toUpperCase();

        const image =
            reel.profileImage
                ? `<img
                       class="reel-avatar-img"
                       src="${reel.profileImage}"
                       alt=""
                       loading="lazy"
                   >`
                : "";

        return `
            <div class="reel-avatar" aria-hidden="true">
                <span class="reel-avatar-initial">${initial}</span>
                ${image}
            </div>
        `;
    }


    /* =====================================================
       CAPTION HELPERS
    ===================================================== */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function createCaption(reel) {
        if (!reel.caption) return "";

        return `
            <div class="reel-caption-wrap">
                <p class="reel-caption">${escapeHtml(reel.caption)}</p>
                <button
                    type="button"
                    class="reel-caption-toggle"
                    aria-expanded="false"
                >Show more</button>
            </div>
        `;
    }


    /* =====================================================
       CREATE REEL

       .reel-stage wraps the creator info, the card and the
       action rail. The stage has the size of the card, so
       info / actions can sit outside it (desktop) or inside
       it (compact) without any extra maths.
    ===================================================== */

    function createReel(reel) {
        return `
            <section class="reel-slide">

                <div class="reel-row">

                    <div class="reel-stage">

                        <div class="reel-info-outside">

                            <div class="reel-creator">

                                ${createAvatar(reel)}

                                <div class="reel-service-name">
                                    ${reel.name}
                                </div>

                            </div>

                            <div class="reel-category">
                                ${reel.category}
                            </div>

                            <div class="reel-rating">

                                <div class="reel-stars">
                                    ${createStars()}
                                </div>

                                <span class="reel-rating-value">
                                    ${reel.rating}
                                </span>

                                <span class="reel-review-count">
                                    (${reel.reviews} reviews)
                                </span>

                            </div>

                            ${createCaption(reel)}

                        </div>


                        <div class="reel-card">

                            <video
                                class="reel-video"
                                muted
                                loop
                                playsinline
                                preload="auto"
                                ${reel.thumbnail ? `poster="${reel.thumbnail}"` : ""}
                            >
                                <source
                                    src="${reel.video}"
                                    type="video/mp4"
                                >
                            </video>


                            <button
                                type="button"
                                class="reel-mute-btn"
                                aria-label="Unmute"
                            >
                                ${icons.mute}
                            </button>


                            <button
                                type="button"
                                class="reel-fullscreen-btn"
                                aria-label="Enter fullscreen"
                            >
                                ${icons.fullscreen}
                            </button>


                            <button
                                type="button"
                                class="reel-rotate-btn"
                                aria-label="Rotate video"
                            >
                                ${icons.rotate}
                            </button>


                            <div class="reel-play-indicator">

                                <svg viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>

                            </div>


                            <div class="reel-progress" aria-label="Video progress">
                                <div class="reel-progress-track">
                                    <div class="reel-progress-fill"></div>
                                </div>
                            </div>

                        </div>


                        <div class="reel-actions">

                            <button
                                type="button"
                                class="reel-action-btn reel-like-btn"
                                aria-label="Like"
                            >
                                ${icons.like}
                            </button>

                            <button
                                type="button"
                                class="reel-action-btn reel-save-btn"
                                aria-label="Save"
                            >
                                ${icons.save}
                            </button>

                            <button
                                type="button"
                                class="reel-action-btn reel-share-btn"
                                aria-label="Share"
                            >
                                ${icons.share}
                            </button>

                            <button
                                type="button"
                                class="reel-action-btn reel-report-btn"
                                aria-label="Report"
                            >
                                ${icons.report}
                            </button>

                        </div>

                    </div>

                </div>

            </section>
        `;
    }


    /* =====================================================
       ORDER REELS FAIRLY (ONCE) + RESTORE SAVED ORDER

       A new session builds a fair order: the reels with the
       least visibility so far go first (see
       TwiggMedia.fairOrder in media-data.js). Coming back
       from another page reuses the saved order and does not
       count as new exposure.
    ===================================================== */

    let reelOrder = null;

    try {
        const storedOrder =
            sessionStorage.getItem(REELS_ORDER_KEY);

        if (storedOrder) {
            const parsed = JSON.parse(storedOrder);

            if (
                Array.isArray(parsed) &&
                parsed.length === reels.length &&
                new Set(parsed).size === reels.length &&
                parsed.every(
                    i =>
                        Number.isInteger(i) &&
                        i >= 0 &&
                        i < reels.length
                )
            ) {
                reelOrder = parsed;
            }
        }
    } catch {
        reelOrder = null;
    }

    if (!reelOrder) {

        const ids = reels.map(reel => reel.id);

        const fairIds =
            sharedMedia
                ? sharedMedia.fairOrder(ids, { columns: 1 })
                : ids;

        reelOrder = fairIds.map(id => ids.indexOf(id));

        try {
            sessionStorage.setItem(
                REELS_ORDER_KEY,
                JSON.stringify(reelOrder)
            );
        } catch {}
    }


    track.innerHTML =
        reelOrder
            .map(i => createReel(reels[i]))
            .join("");


    /* =====================================================
       AVATAR IMAGE FALLBACK
    ===================================================== */

    track
        .querySelectorAll(".reel-avatar-img")
        .forEach(img => {

            img.addEventListener(
                "error",
                () => img.remove(),
                { once: true }
            );

        });


    /* =====================================================
       GET SLIDES
    ===================================================== */

    const slides =
        Array.from(track.querySelectorAll(".reel-slide"));


    /* =====================================================
       STATE
    ===================================================== */

    let currentIndex = 0;

    let fullscreenSlide = null;
    let fullscreenIndex = null;
    let fullscreenScrollTop = 0;


    /* =====================================================
       FULLSCREEN STATE HELPERS

       .is-fullscreen            real OR fallback fullscreen
       .is-fallback-fullscreen   fallback only (no Fullscreen API)
    ===================================================== */

    function isRealFullscreenActive() {

        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }


    function isFallbackFullscreenActive(slide) {

        return slide.classList.contains("is-fallback-fullscreen");
    }


    function isSlideInFullscreen(slide) {

        return slide.classList.contains("is-fullscreen");
    }


    function isAnyFullscreenActive() {

        return (
            isRealFullscreenActive() ||
            !!document.querySelector(".reel-slide.is-fallback-fullscreen")
        );
    }


    /* =====================================================
       CAPTION TOGGLE VISIBILITY

       The caption sits behind a Show more / Show less toggle
       whenever the info is INSIDE the card (compact mode:
       mobile, and desktop / tablet without enough space).
    ===================================================== */

    function updateCaptionToggle(slide) {

        const caption = slide.querySelector(".reel-caption");
        const toggle = slide.querySelector(".reel-caption-toggle");
        const info = slide.querySelector(".reel-info-outside");

        if (!caption || !toggle || !info) return;

        const compact = slide.classList.contains("is-compact");

        if (!compact) {
            info.classList.remove("is-caption-expanded");
            toggle.hidden = true;
            toggle.textContent = "Show more";
            toggle.setAttribute("aria-expanded", "false");
            return;
        }

        toggle.hidden = false;

        const expanded = info.classList.contains("is-caption-expanded");

        toggle.textContent = expanded ? "Show less" : "Show more";
        toggle.setAttribute("aria-expanded", String(expanded));
    }


    function refreshCaptionToggles() {

        slides.forEach(updateCaptionToggle);
    }


    function collapseCaption(slide) {

        const info = slide.querySelector(".reel-info-outside");
        const toggle = slide.querySelector(".reel-caption-toggle");

        if (info) info.classList.remove("is-caption-expanded");

        if (toggle) {
            toggle.textContent = "Show more";
            toggle.setAttribute("aria-expanded", "false");
        }
    }


    /* =====================================================
       UP / DOWN BUTTON PLACEMENT

       Normally the up and down buttons sit stacked together
       at the right side of the page.

       When the ACTIVE reel is a landscape card (desktop /
       tablet) whose right edge reaches those buttons (so they
       would sit on top of its like / save controls), the
       controls are SPLIT: the up button goes above the card
       and the down button below it, at the same right-side
       position. Portrait reels (or a landscape card that does
       not reach the buttons) use the normal stacked position.
    ===================================================== */

    function updateNavPlacement() {

        if (!navControls) {
            return;
        }

        const activeSlide =
            slides.find(slide => slide.classList.contains("is-active"));

        const stage =
            activeSlide
                ? activeSlide.querySelector(".reel-stage")
                : null;

        const unsplit = () => {

            navControls.classList.remove("is-split");
            navControls.style.removeProperty("--nav-card-h");
        };

        if (
            !stage ||
            isMobileView() ||
            !activeSlide.classList.contains("has-landscape-card")
        ) {
            unsplit();
            return;
        }

        const feedRect = feed.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();

        const navRight =
            parseFloat(getComputedStyle(navControls).right) || 0;

        /* Left edge of the (stacked) buttons, relative to the feed. */

        const navLeft =
            feedRect.width - navRight - NAV_BUTTON_SIZE;

        const cardRight =
            (stageRect.left - feedRect.left) + stageRect.width;

        const overlapping =
            cardRight > navLeft - NAV_OVERLAP_GAP;

        if (!overlapping) {
            unsplit();
            return;
        }

        navControls.style.setProperty(
            "--nav-card-h",
            `${stage.offsetHeight}px`
        );

        navControls.classList.add("is-split");
    }


    /* =====================================================
       CARD LAYOUT (desktop / tablet)

       - Mobile (800px and below): the card is ALWAYS a 9:16
         portrait card (sized in CSS). Landscape videos sit
         inside it, letterboxed. Always compact.

       - Desktop / tablet: the card is 9:16 for portrait
         videos and 16:9 for landscape videos. The creator
         info and action rail sit OUTSIDE the card while there
         is room; otherwise the slide switches to compact and
         they move INSIDE the card. The decision uses the real
         width of the Reels area, not a fixed breakpoint.

       Video orientation comes from the video's own metadata.
       The video itself is never stretched or cropped.
    ===================================================== */

    function isMobileView() {

        return window.matchMedia(MOBILE_QUERY).matches;
    }


    function sizeCard(landscape, compact, availW, availH) {

        const ratio = landscape ? 16 / 9 : 9 / 16;

        let heightLimit =
            availH * (compact ? 0.9 : 0.92);

        if (landscape && compact) {

            /* Leave room above and below a compact landscape card
               for the up / down buttons when they are split. */

            heightLimit =
                Math.min(
                    heightLimit,
                    availH - 2 * (NAV_BUTTON_SIZE + NAV_BUTTON_GAP + 10)
                );
        }

        if (!landscape) {
            heightLimit =
                Math.min(
                    heightLimit,
                    compact
                        ? MAX_COMPACT_PORTRAIT_HEIGHT
                        : MAX_PORTRAIT_HEIGHT
                );
        }

        let widthLimit =
            compact
                ? availW - 32
                : availW - 2 * OUTSIDE_SIDE_SPACE;

        if (landscape) {
            widthLimit = Math.min(widthLimit, MAX_LANDSCAPE_WIDTH);
        }

        const width = Math.max(
            Math.min(widthLimit, heightLimit * ratio),
            0
        );

        return {
            width,
            height: width / ratio
        };
    }


    function layoutSlide(slide) {

        const landscape = slide.dataset.orientation === "landscape";

        if (isMobileView()) {

            slide.classList.add("is-compact");
            slide.classList.remove("has-landscape-card");

            slide.style.removeProperty("--card-w");
            slide.style.removeProperty("--card-h");

            updateCaptionToggle(slide);

            return;
        }

        const availW = feed.clientWidth;
        const availH = feed.clientHeight;

        if (!availW || !availH) {
            return;
        }

        const outside = sizeCard(landscape, false, availW, availH);

        const natural = sizeCard(landscape, false, Infinity, availH);

        const minWidth =
            Math.min(
                landscape
                    ? MIN_OUTSIDE_WIDTH.landscape
                    : MIN_OUTSIDE_WIDTH.portrait,
                natural.width
            );

        const compact = outside.width < minWidth - 0.5;

        const size =
            compact
                ? sizeCard(landscape, true, availW, availH)
                : outside;

        slide.style.setProperty("--card-w", `${Math.floor(size.width)}px`);
        slide.style.setProperty("--card-h", `${Math.floor(size.height)}px`);

        slide.classList.toggle("is-compact", compact);
        slide.classList.toggle("has-landscape-card", landscape);

        updateCaptionToggle(slide);
    }


    function layoutAllSlides() {

        slides.forEach(layoutSlide);

        updateNavPlacement();
    }


    function updateOrientation(slide, video) {

        if (!video.videoWidth || !video.videoHeight) {
            return;
        }

        const orientation =
            video.videoWidth > video.videoHeight
                ? "landscape"
                : "portrait";

        if (slide.dataset.orientation === orientation) {
            return;
        }

        slide.dataset.orientation = orientation;

        layoutSlide(slide);

        updateNavPlacement();
    }


    layoutAllSlides();


    /* =====================================================
       MUTE BUTTON UI
    ===================================================== */

    function updateMuteButton(slide, muted) {

        const button = slide.querySelector(".reel-mute-btn");

        if (!button) {
            return;
        }

        button.innerHTML =
            muted
                ? icons.mute
                : icons.unmute;

        button.setAttribute(
            "aria-label",
            muted
                ? "Unmute"
                : "Mute"
        );
    }


    function updateAllMuteButtons() {

        slides.forEach(slide => {
            updateMuteButton(slide, sharedMuted);
        });
    }


    /* =====================================================
       APPLY SHARED MUTE STATE

       Only the active Reel can ever be audible.
    ===================================================== */

    function applyMuteState() {

        slides.forEach((slide, index) => {

            const video = slide.querySelector(".reel-video");

            if (!video) {
                return;
            }

            if (index === currentIndex) {
                video.muted = sharedMuted;
            } else {
                video.muted = true;
            }

            updateMuteButton(slide, sharedMuted);
        });
    }


    /* =====================================================
       PLAY A VIDEO

       If the browser blocks playback WITH sound (autoplay
       policy, e.g. right after arriving from another page),
       the video falls back to muted, the shared setting
       becomes muted and the buttons are refreshed.
    ===================================================== */

    function playVideo(video, slide) {

        const markPlaying = () => {

            if (slide) {
                slide.classList.remove("is-paused");
            }
        };

        const promise = video.play();

        if (!promise || !promise.then) {
            return;
        }

        promise
            .then(markPlaying)
            .catch(error => {

                if (
                    error &&
                    error.name === "NotAllowedError" &&
                    !video.muted
                ) {

                    video.muted = true;

                    setSharedMuted(true);

                    applyMuteState();

                    video.play().then(markPlaying).catch(() => {});
                }
            });
    }


    /* =====================================================
       RESTORE + SAVE REELS POSITION
    ===================================================== */

    let savedReelsState = null;

    try {
        const storedState =
            sessionStorage.getItem(REELS_STATE_KEY);

        if (storedState) {
            const parsed = JSON.parse(storedState);

            if (
                parsed &&
                Number.isFinite(parsed.scrollTop) &&
                parsed.scrollTop >= 0 &&
                Number.isInteger(parsed.index) &&
                parsed.index >= 0 &&
                parsed.index < slides.length
            ) {
                savedReelsState = parsed;
            }
        }
    } catch {
        savedReelsState = null;
    }

    /* Instant jump, before the first paint. */
    if (savedReelsState) {

        currentIndex = savedReelsState.index;

        const previousBehavior = feed.style.scrollBehavior;

        feed.style.scrollBehavior = "auto";
        feed.scrollTop = savedReelsState.scrollTop;

        void feed.offsetHeight;

        feed.style.scrollBehavior = previousBehavior;
    }


    function saveReelsState() {

        if (isAnyFullscreenActive()) {
            return;
        }

        try {
            sessionStorage.setItem(
                REELS_STATE_KEY,
                JSON.stringify({
                    index: currentIndex,
                    scrollTop: feed.scrollTop
                })
            );
        } catch {}
    }

    let reelsSaveTimeout = null;

    feed.addEventListener(
        "scroll",
        () => {

            clearTimeout(reelsSaveTimeout);

            reelsSaveTimeout = setTimeout(saveReelsState, 50);
        },
        { passive: true }
    );

    window.addEventListener("pagehide", saveReelsState);

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {
            item.addEventListener("click", saveReelsState);
        });


    /* =====================================================
       ACTIVE REEL
    ===================================================== */

    function setActiveSlide(index) {

        slides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === index);
        });

        /* Whenever the active Reel changes, make sure
           only that Reel can have sound. */

        applyMuteState();

        /* ...and that the up / down buttons suit its shape. */

        updateNavPlacement();
    }


    /* =====================================================
       NAVIGATION BUTTON STATE
    ===================================================== */

    function updateNavButtons() {

        if (upButton) {
            upButton.disabled = currentIndex === 0;
        }

        if (downButton) {
            downButton.disabled = currentIndex === slides.length - 1;
        }
    }


    /* =====================================================
       GO TO REEL
    ===================================================== */

    function goToIndex(index) {

        if (
            index < 0 ||
            index >= slides.length ||
            index === currentIndex
        ) {
            return;
        }

        currentIndex = index;

        setActiveSlide(currentIndex);
        updateNavButtons();

        feed.scrollTo({
            top: currentIndex * feed.clientHeight,
            behavior: "smooth"
        });

        playCurrentSlide();
    }


    /* =====================================================
       UP / DOWN BUTTONS
    ===================================================== */

    if (upButton) {

        upButton.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            goToIndex(currentIndex - 1);
        });
    }


    if (downButton) {

        downButton.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            goToIndex(currentIndex + 1);
        });
    }


    /* =====================================================
       PLAY ACTIVE REEL
    ===================================================== */

    function playCurrentSlide() {

        slides.forEach((slide, index) => {

            const video = slide.querySelector(".reel-video");

            if (!video) return;

            if (index === currentIndex) {

                /* The active Reel inherits the shared mute setting. */

                video.muted = sharedMuted;

                updateMuteButton(slide, sharedMuted);

                if (!slide.dataset.userPaused) {

                    playVideo(video, slide);
                }

                return;
            }

            /* Every non-active Reel is always muted. */

            video.pause();
            video.muted = true;
            video.currentTime = 0;

            collapseCaption(slide);

            updateMuteButton(slide, sharedMuted);

            slide.classList.remove("is-paused");

            delete slide.dataset.userPaused;
        });
    }


    /* =====================================================
       ROTATE FEATURE

       Rotation only ever turns the VIDEO 90deg inside its
       (unchanged) card. The card never changes shape.

       - Mobile: available in the normal view AND fullscreen.
       - Desktop / tablet: fullscreen only. The state resets
         when fullscreen ends, so the normal layout is
         restored.

       The video box is swapped (width <-> height of the
       card) and then rotated, so its bounding box exactly
       matches the card. object-fit: contain keeps the whole
       video visible with its original aspect ratio, for
       landscape and portrait sources alike.
    ===================================================== */

    function resetVideoRotation(video) {

        if (!video) return;

        video.classList.remove("reel-video-rotated");

        video.style.width = "";
        video.style.height = "";
        video.style.transform = "";

        video.style.removeProperty("--reel-media-rotate-w");
        video.style.removeProperty("--reel-media-rotate-h");
    }


    function rotateVideoInPlace(card, video) {

        const width = card.clientWidth;
        const height = card.clientHeight;

        if (!width || !height) {
            return;
        }

        video.classList.add("reel-video-rotated");

        video.style.setProperty("--reel-media-rotate-w", `${height}px`);
        video.style.setProperty("--reel-media-rotate-h", `${width}px`);

        video.style.width = `${height}px`;
        video.style.height = `${width}px`;

        video.style.transform =
            "translate(-50%, -50%) rotate(90deg)";
    }


    function applyRotationState(slide) {

        const card = slide.querySelector(".reel-card");
        const video = slide.querySelector(".reel-video");

        if (!card || !video) {
            return;
        }

        const canRotate =
            isMobileView() ||
            isSlideInFullscreen(slide);

        const rotated =
            slide.dataset.rotated === "true" &&
            canRotate;

        if (rotated) {
            rotateVideoInPlace(card, video);
        } else {
            resetVideoRotation(video);
        }
    }


    function updateRotateButton(slide, rotated) {

        const button = slide.querySelector(".reel-rotate-btn");

        if (!button) {
            return;
        }

        button.classList.toggle("is-rotated", rotated);

        button.setAttribute(
            "aria-label",
            rotated
                ? "Reset rotation"
                : "Rotate video"
        );
    }


    function toggleRotate(slide) {

        const next = slide.dataset.rotated !== "true";

        slide.dataset.rotated = String(next);

        applyRotationState(slide);

        updateRotateButton(slide, next);
    }


    function resetRotation(slide) {

        slide.dataset.rotated = "false";

        applyRotationState(slide);

        updateRotateButton(slide, false);
    }


    /* Re-measure after a layout change (fullscreen enter / exit).
       Never changes the rotation state itself. */

    function reapplyRotationAfterLayoutChange(slide) {

        if (!slide) {
            return;
        }

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                applyRotationState(slide);

            });

        });
    }


    /* =====================================================
       REAPPLY ON WINDOW RESIZE
    ===================================================== */

    let rotateResizeTimeout = null;

    window.addEventListener("resize", () => {

        /* Layout (compact / outside, card size, caption toggle,
           up / down button placement) follows the real
           available space. */

        layoutAllSlides();

        clearTimeout(rotateResizeTimeout);

        rotateResizeTimeout =
            setTimeout(() => {

                slides.forEach(slide => {

                    if (slide.dataset.rotated !== "true") {
                        return;
                    }

                    /* Desktop / tablet outside fullscreen: no rotation. */

                    if (
                        !isMobileView() &&
                        !isSlideInFullscreen(slide)
                    ) {
                        resetRotation(slide);
                        return;
                    }

                    applyRotationState(slide);
                });

            }, 150);
    });


    /* =====================================================
       OBSERVE VISIBLE REEL
    ===================================================== */

    const observer =
        new IntersectionObserver(
            entries => {

                /* Never let the observer change the active
                   reel while fullscreen is active. */

                if (isAnyFullscreenActive()) {
                    return;
                }

                const visibleSlides =
                    entries
                        .filter(entry => entry.isIntersecting)
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );

                if (!visibleSlides.length) {
                    return;
                }

                const visibleSlide = visibleSlides[0].target;

                const index = slides.indexOf(visibleSlide);

                if (index === -1) {
                    return;
                }

                if (index !== currentIndex) {

                    currentIndex = index;

                    setActiveSlide(currentIndex);

                    updateNavButtons();

                    playCurrentSlide();
                }
            },
            {
                root: feed,
                threshold: [0.55, 0.7, 0.85, 1]
            }
        );


    slides.forEach(slide => {
        observer.observe(slide);
    });


    /* =====================================================
       VIDEO STATE + PROGRESS (click / tap / drag to seek)
    ===================================================== */

    slides.forEach(slide => {

        const video = slide.querySelector(".reel-video");
        const fill = slide.querySelector(".reel-progress-fill");
        const progress = slide.querySelector(".reel-progress");

        if (!video) {
            return;
        }


        /* ORIENTATION: from the video's real dimensions */

        video.addEventListener(
            "loadedmetadata",
            () => updateOrientation(slide, video)
        );

        if (video.readyState >= 1) {
            updateOrientation(slide, video);
        }


        /* FIRST FRAME: keep non-active videos at their beginning. */

        video.addEventListener(
            "loadeddata",
            () => {

                if (slides.indexOf(slide) !== currentIndex) {

                    video.pause();
                    video.currentTime = 0;
                    video.muted = true;
                }

            },
            { once: true }
        );


        /* PLAY */

        video.addEventListener("play", () => {
            slide.classList.remove("is-paused");
        });


        /* PLAYING */

        video.addEventListener("playing", () => {
            slide.classList.remove("is-paused");
        });


        /* PAUSE: only show the play indicator when the
           user deliberately paused this reel. */

        video.addEventListener("pause", () => {

            if (slide.dataset.userPaused === "true") {
                slide.classList.add("is-paused");
            }
        });


        /* PROGRESS */

        function updateProgress() {

            if (!fill) {
                return;
            }

            if (!video.duration) {

                fill.style.width = "0%";

                return;
            }

            const progressValue =
                (video.currentTime / video.duration) * 100;

            fill.style.width = `${progressValue}%`;
        }


        video.addEventListener("timeupdate", updateProgress);

        video.addEventListener("loadedmetadata", updateProgress);

        video.addEventListener("seeked", updateProgress);


        /* SEEK: click / tap / drag the progress bar
           (works exactly like the Loop progress bar) */

        if (progress) {

            let dragging = false;

            const seek = event => {

                const rect = progress.getBoundingClientRect();

                if (!rect.width || !video.duration) {
                    return;
                }

                const fraction =
                    Math.min(
                        1,
                        Math.max(
                            0,
                            (event.clientX - rect.left) / rect.width
                        )
                    );

                video.currentTime =
                    Math.min(
                        fraction * video.duration,
                        Math.max(video.duration - 0.05, 0)
                    );

                if (fill) {
                    fill.style.width = `${fraction * 100}%`;
                }
            };


            progress.addEventListener("pointerdown", event => {

                /* Never start a page swipe / play-pause */
                event.stopPropagation();

                dragging = true;

                progress.classList.add("is-scrubbing");

                try {
                    progress.setPointerCapture(event.pointerId);
                } catch {}

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
        }
    });


    /* =====================================================
       CLICK EVENTS
    ===================================================== */

    track.addEventListener("click", event => {

        const slide = event.target.closest(".reel-slide");

        if (!slide) {
            return;
        }


        /* PROGRESS BAR: seeking is handled by the pointer
           events above. A click on the bar must never also
           play / pause the video. */

        if (event.target.closest(".reel-progress")) {

            event.stopPropagation();

            return;
        }


        /* CAPTION: show more / show less (compact mode) */

        const captionToggle =
            event.target.closest(".reel-caption-toggle");

        if (captionToggle) {

            event.stopPropagation();

            const info = captionToggle.closest(".reel-info-outside");

            if (!info) return;

            const open = info.classList.toggle("is-caption-expanded");

            captionToggle.hidden = false;
            captionToggle.textContent = open ? "Show less" : "Show more";

            captionToggle.setAttribute("aria-expanded", String(open));

            return;
        }


        /* MUTE */

        const muteButton = event.target.closest(".reel-mute-btn");

        if (muteButton) {

            event.stopPropagation();

            const video = slide.querySelector(".reel-video");

            if (!video) {
                return;
            }

            /* Mute/unmute is a shared setting (feed-wide, and
               remembered for the Home and Loop pages too). */

            setSharedMuted(!sharedMuted);

            /* Apply to the active Reel; every other Reel stays muted. */

            applyMuteState();

            return;
        }


        /* FULLSCREEN */

        const fullscreenButton =
            event.target.closest(".reel-fullscreen-btn");

        if (fullscreenButton) {

            event.stopPropagation();

            toggleFullscreen(slide);

            return;
        }


        /* ROTATE */

        const rotateButton =
            event.target.closest(".reel-rotate-btn");

        if (rotateButton) {

            event.stopPropagation();

            toggleRotate(slide);

            return;
        }


        /* LIKE */

        const likeButton = event.target.closest(".reel-like-btn");

        if (likeButton) {

            event.stopPropagation();

            likeButton.classList.toggle("is-liked");

            return;
        }


        /* SAVE */

        const saveButton = event.target.closest(".reel-save-btn");

        if (saveButton) {

            event.stopPropagation();

            saveButton.classList.toggle("is-saved");

            return;
        }


        /* SHARE */

        const shareButton = event.target.closest(".reel-share-btn");

        if (shareButton) {

            event.stopPropagation();

            shareReel();

            return;
        }


        /* REPORT */

        const reportButton = event.target.closest(".reel-report-btn");

        if (reportButton) {

            event.stopPropagation();

            if (!reportButton.classList.contains("is-reported")) {

                reportButton.classList.add("is-reported");
            }

            return;
        }


        /* VIDEO PLAY / PAUSE */

        if (
            slide !== slides[currentIndex] ||
            !event.target.closest(".reel-card")
        ) {
            return;
        }

        const video = slide.querySelector(".reel-video");

        if (!video) {
            return;
        }

        if (video.paused) {

            delete slide.dataset.userPaused;

            /* Reapply the shared mute state before manual play. */

            video.muted = sharedMuted;

            playVideo(video, slide);

        } else {

            video.pause();

            slide.dataset.userPaused = "true";

            slide.classList.add("is-paused");
        }
    });


    /* =====================================================
       FULLSCREEN HELPERS
    ===================================================== */

    function supportsElementFullscreen(element) {

        return !!(
            element.requestFullscreen ||
            element.webkitRequestFullscreen ||
            element.mozRequestFullScreen ||
            element.msRequestFullscreen
        );
    }


    async function requestElementFullscreen(element) {

        if (element.requestFullscreen) {

            await element.requestFullscreen();

        } else if (element.webkitRequestFullscreen) {

            element.webkitRequestFullscreen();

        } else if (element.mozRequestFullScreen) {

            element.mozRequestFullScreen();

        } else if (element.msRequestFullscreen) {

            element.msRequestFullscreen();
        }
    }


    async function exitElementFullscreen() {

        if (document.exitFullscreen) {

            await document.exitFullscreen();

        } else if (document.webkitExitFullscreen) {

            document.webkitExitFullscreen();

        } else if (document.mozCancelFullScreen) {

            document.mozCancelFullScreen();

        } else if (document.msExitFullscreen) {

            document.msExitFullscreen();
        }
    }


    /* =====================================================
       EXIT FALLBACK FULLSCREEN
    ===================================================== */

    function exitFallbackFullscreen(slide, card) {

        slide.classList.remove(
            "is-fallback-fullscreen",
            "is-fullscreen"
        );

        document.body.classList.remove("fallback-fullscreen-active");

        updateFullscreenButton(card, false);
    }


    /* =====================================================
       FULLSCREEN
    ===================================================== */

    async function toggleFullscreen(slide) {

        const card = slide.querySelector(".reel-card");
        const video = slide.querySelector(".reel-video");

        if (!card) {
            return;
        }


        /* EXIT FALLBACK FULLSCREEN */

        if (isFallbackFullscreenActive(slide)) {

            exitFallbackFullscreen(slide, card);

            restoreReelAfterFullscreen(slide);

            reapplyRotationAfterLayoutChange(slide);

            return;
        }


        /* EXIT REAL FULLSCREEN */

        if (isRealFullscreenActive()) {

            try {

                await exitElementFullscreen();

            } catch (error) {

                console.log("Unable to exit fullscreen:", error);
            }

            return;
        }


        /* REMEMBER CURRENT REEL */

        fullscreenSlide = slide;

        fullscreenIndex = slides.indexOf(slide);

        fullscreenScrollTop = feed.scrollTop;

        currentIndex = fullscreenIndex;

        setActiveSlide(currentIndex);

        updateNavButtons();


        /* REAL FULLSCREEN */

        if (supportsElementFullscreen(card)) {

            try {

                await requestElementFullscreen(card);

                slide.classList.add("is-fullscreen");

                updateFullscreenButton(card, true);

                reapplyRotationAfterLayoutChange(slide);

                /* Start playback only if the user has not deliberately paused. */

                if (
                    video &&
                    video.paused &&
                    !slide.dataset.userPaused
                ) {

                    video.muted = sharedMuted;

                    playVideo(video, slide);
                }

            } catch (error) {

                console.log("Fullscreen unavailable:", error);
            }

            return;
        }


        /* FALLBACK FULLSCREEN (mobile / tablet only) */

        const isMobileOrTablet =
            window.matchMedia("(max-width: 1150px)").matches;

        if (!isMobileOrTablet) {
            return;
        }

        slide.classList.add(
            "is-fallback-fullscreen",
            "is-fullscreen"
        );

        document.body.classList.add("fallback-fullscreen-active");

        updateFullscreenButton(card, true);

        reapplyRotationAfterLayoutChange(slide);

        if (
            video &&
            video.paused &&
            !slide.dataset.userPaused
        ) {

            video.muted = sharedMuted;

            playVideo(video, slide);
        }
    }


    /* =====================================================
       RESTORE REEL AFTER FULLSCREEN

       Desktop / tablet: rotation only exists in fullscreen,
       so it is reset here and the normal layout returns.
       Mobile keeps its rotation state.
    ===================================================== */

    function restoreReelAfterFullscreen(slide) {

        if (!slide) {
            return;
        }

        if (!isMobileView()) {
            resetRotation(slide);
        }

        const index = slides.indexOf(slide);

        if (index !== -1) {

            currentIndex = index;

        } else if (
            fullscreenIndex !== null &&
            fullscreenIndex >= 0 &&
            fullscreenIndex < slides.length
        ) {

            currentIndex = fullscreenIndex;
        }

        setActiveSlide(currentIndex);

        updateNavButtons();

        /* Mobile browsers can take a frame or two to restore the
           normal viewport; wait before restoring the position. */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                const targetSlide = slides[currentIndex];

                if (!targetSlide) {
                    return;
                }

                layoutAllSlides();

                feed.scrollTo({
                    top: targetSlide.offsetTop,
                    left: 0,
                    behavior: "auto"
                });

                /* Force a layout recalculation (fixes info/actions
                   appearing only after manually scrolling). */

                void feed.offsetHeight;

                setActiveSlide(currentIndex);

                updateNavButtons();

                reapplyRotationAfterLayoutChange(targetSlide);

            });

        });

        fullscreenSlide = null;

        fullscreenIndex = null;
    }


    /* =====================================================
       FULLSCREEN BUTTON STATE
    ===================================================== */

    function updateFullscreenButton(card, fullscreen) {

        const button = card.querySelector(".reel-fullscreen-btn");

        if (!button) {
            return;
        }

        button.innerHTML =
            fullscreen
                ? icons.exitFullscreen
                : icons.fullscreen;

        button.setAttribute(
            "aria-label",
            fullscreen
                ? "Exit fullscreen"
                : "Enter fullscreen"
        );
    }


    /* =====================================================
       REAL FULLSCREEN STATE
    ===================================================== */

    function handleFullscreenChange() {

        const currentlyFullscreen =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement;

        slides.forEach(slide => {

            const card = slide.querySelector(".reel-card");

            if (!card) {
                return;
            }

            const inFullscreen =
                currentlyFullscreen === card ||
                isFallbackFullscreenActive(slide);

            slide.classList.toggle("is-fullscreen", inFullscreen);

            updateFullscreenButton(card, currentlyFullscreen === card);

            if (currentlyFullscreen === card) {
                reapplyRotationAfterLayoutChange(slide);
            }
        });


        /* REAL FULLSCREEN HAS ENDED */

        if (!isRealFullscreenActive()) {

            if (fullscreenSlide) {

                const slideToRestore = fullscreenSlide;

                restoreReelAfterFullscreen(slideToRestore);
            }
        }
    }


    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") {
            return;
        }

        const fallbackFullscreenSlide =
            document.querySelector(".reel-slide.is-fallback-fullscreen");

        if (fallbackFullscreenSlide) {

            const card =
                fallbackFullscreenSlide.querySelector(".reel-card");

            if (card) {

                exitFallbackFullscreen(fallbackFullscreenSlide, card);

                restoreReelAfterFullscreen(fallbackFullscreenSlide);
            }

            return;
        }

        if (isRealFullscreenActive()) {

            exitElementFullscreen();
        }
    });


    /* =====================================================
       SHARE
    ===================================================== */

    async function shareReel() {

        if (navigator.share) {

            try {

                await navigator.share({
                    title: "Twigg",
                    text: "Check out this reel on Twigg."
                });

            } catch {

                /* User closed share menu. */
            }

            return;
        }

        if (navigator.clipboard) {

            try {

                await navigator.clipboard.writeText(window.location.href);

            } catch {

                /* Clipboard unavailable. */
            }
        }
    }


    /* =====================================================
       KEYBOARD NAVIGATION
    ===================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "ArrowDown") {

            event.preventDefault();

            goToIndex(currentIndex + 1);

        } else if (event.key === "ArrowUp") {

            event.preventDefault();

            goToIndex(currentIndex - 1);
        }
    });


    /* =====================================================
       SIDEBAR NAVIGATION
    ===================================================== */

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener("click", event => {

                if (item.getAttribute("href") !== "#") {
                    return;
                }

                event.preventDefault();

                document
                    .querySelectorAll(".nav-item")
                    .forEach(nav => {
                        nav.classList.remove("active");
                    });

                item.classList.add("active");
            });
        });


    /* =====================================================
       INITIALIZE
    ===================================================== */

    setActiveSlide(currentIndex);

    updateAllMuteButtons();

    updateNavButtons();

    playCurrentSlide();

    layoutAllSlides();

    refreshCaptionToggles();

    window.addEventListener("load", () => {
        layoutAllSlides();
        refreshCaptionToggles();
    });

});