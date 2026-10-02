document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       REEL DATA

       Optional per-reel field:
           profileImage: "profiles/example.jpg"

       If it is missing (or fails to load) the creator's
       initial is shown inside the circular avatar.
    ===================================================== */

    const reels = [
        {
            name: "Studio Craft",
            category: "Packaging Design",
            rating: "4.9",
            reviews: "1,204",
            video: "videos/80444097-841c-4bb7-b7b1-70beedcd4240.mov"
        },
        {
            name: "Markwell Studio",
            category: "Logo Design",
            rating: "4.8",
            reviews: "842",
            video: "videos/4bf27b85-3357-40aa-93eb-759303f8ee52.mov"
        },
        {
            name: "Pixel & Co",
            category: "Web & Mobile Design",
            rating: "5.0",
            reviews: "2,380",
            video: "videos/2d83975e-223c-400b-a8ce-f30ddc591c53.mov"
        },
        {
            name: "Inkwell Press",
            category: "Book Design",
            rating: "4.5",
            reviews: "94",
            video: "videos/75f99231-503c-4f5e-b455-f58ab5063358.MP4"
        },
        {
            name: "Reel Intro Studio",
            category: "Intro & Outro Videos",
            rating: "4.7",
            reviews: "445",
            video: "videos/2c8f8923-0e71-4ec0-8159-c665d9ff756e.MP4"
        },
        {
            name: "Kinetic House",
            category: "Motion Graphics",
            rating: "4.8",
            reviews: "990",
            video: "videos/c377903b-d9cd-485a-bb5b-e29ff8e0c4b5.MP4"
        },
        {
            name: "Studio Nova",
            category: "Product Photography",
            rating: "4.9",
            reviews: "1,875",
            video: "videos/6e7bd8c9-15be-4677-9a14-18c2cb5b14ca.MP4"
        },
        {
            name: "ColorLab Studio",
            category: "Color Grading",
            rating: "5.0",
            reviews: "3,040",
            video: "videos/27da01c8-e09c-4168-afc5-baa39d098c73.MP4"
        }
    ];


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const feed = document.querySelector(".reels-feed");
    const track = document.querySelector(".reels-track");
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
            REELS_STATE_KEY
        ].forEach(key => sessionStorage.removeItem(key));
    }


    /* =====================================================
       SHARED MUTE STATE
       
       One mute setting is shared across the entire
       Reels feed.

       true  = muted
       false = unmuted

       The feed always starts muted.
    ===================================================== */

    let sharedMuted = true;


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
                <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
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
       CREATE REEL
    ===================================================== */

    function createReel(reel) {
        return `
            <section class="reel-slide">

                <div class="reel-row">

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

                    </div>


                    <div class="reel-card">

                        <video
                            class="reel-video"
                            muted
                            loop
                            playsinline
                            preload="auto"
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


                        <div class="reel-progress">
                            <div class="reel-progress-fill"></div>
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

            </section>
        `;
    }


    /* =====================================================
       RANDOMIZE REELS (ONCE) + RESTORE SAVED ORDER
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

        reelOrder = reels.map((_, index) => index);

        for (let i = reelOrder.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [
                reelOrder[i],
                reelOrder[j]
            ] = [
                reelOrder[j],
                reelOrder[i]
            ];
        }

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

       If a profile image fails to load, remove it so the
       initial underneath is shown.
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
        Array.from(
            track.querySelectorAll(".reel-slide")
        );


    /* =====================================================
       STATE
    ===================================================== */

    let currentIndex = 0;

    let fullscreenSlide = null;
    let fullscreenIndex = null;
    let fullscreenScrollTop = 0;


    /* =====================================================
       MUTE BUTTON UI
    ===================================================== */

    function updateMuteButton(
        slide,
        muted
    ) {

        const button =
            slide.querySelector(
                ".reel-mute-btn"
            );

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

        slides.forEach(
            slide => {

                updateMuteButton(
                    slide,
                    sharedMuted
                );

            }
        );
    }


    /* =====================================================
       APPLY SHARED MUTE STATE
       
       Only the active Reel can ever be audible.

       Active Reel:
           muted = sharedMuted

       All other Reels:
           muted = true
    ===================================================== */

    function applyMuteState() {

        slides.forEach(
            (slide, index) => {

                const video =
                    slide.querySelector(
                        ".reel-video"
                    );

                if (!video) {
                    return;
                }


                if (index === currentIndex) {

                    video.muted =
                        sharedMuted;

                } else {

                    video.muted =
                        true;
                }


                updateMuteButton(
                    slide,
                    sharedMuted
                );

            }
        );
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

        const previousBehavior =
            feed.style.scrollBehavior;

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

            reelsSaveTimeout =
                setTimeout(saveReelsState, 50);
        },
        { passive: true }
    );

    window.addEventListener(
        "pagehide",
        saveReelsState
    );

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                saveReelsState
            );
        });


    /* =====================================================
       ACTIVE REEL
    ===================================================== */

    function setActiveSlide(index) {

        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "is-active",
                i === index
            );

        });


        /*
         * Whenever the active Reel changes, make sure
         * only that Reel can have sound.
         */

        applyMuteState();
    }


    /* =====================================================
       NAVIGATION BUTTON STATE
    ===================================================== */

    function updateNavButtons() {

        if (upButton) {
            upButton.disabled =
                currentIndex === 0;
        }

        if (downButton) {
            downButton.disabled =
                currentIndex === slides.length - 1;
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
            top:
                currentIndex *
                feed.clientHeight,
            behavior: "smooth"
        });

        playCurrentSlide();
    }


    /* =====================================================
       UP / DOWN BUTTONS
    ===================================================== */

    if (upButton) {

        upButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                goToIndex(
                    currentIndex - 1
                );
            }
        );
    }


    if (downButton) {

        downButton.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                goToIndex(
                    currentIndex + 1
                );
            }
        );
    }


    /* =====================================================
       PLAY ACTIVE REEL
    ===================================================== */

    function playCurrentSlide() {

        slides.forEach((slide, index) => {

            const video =
                slide.querySelector(".reel-video");

            if (!video) return;


            if (index === currentIndex) {

                /*
                 * The active Reel inherits the shared
                 * mute setting.
                 */

                video.muted =
                    sharedMuted;

                updateMuteButton(
                    slide,
                    sharedMuted
                );


                if (!slide.dataset.userPaused) {

                    video.play()
                        .then(() => {

                            slide.classList.remove(
                                "is-paused"
                            );

                        })
                        .catch(() => {});

                }

                return;
            }


            /*
             * Every non-active Reel is always muted.
             * This prevents more than one Reel from
             * ever producing sound.
             */

            video.pause();
            video.muted = true;
            video.currentTime = 0;

            updateMuteButton(
                slide,
                sharedMuted
            );

            slide.classList.remove(
                "is-paused"
            );

            delete slide.dataset.userPaused;
        });
    }


    /* =====================================================
       FULLSCREEN STATE HELPER
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

        return (
            slide.classList.contains(
                "mobile-reel-fullscreen"
            ) ||
            slide.classList.contains(
                "tablet-reel-fullscreen"
            )
        );
    }


    function isAnyFullscreenActive() {

        return (
            isRealFullscreenActive() ||
            !!document.querySelector(
                ".reel-slide.mobile-reel-fullscreen, " +
                ".reel-slide.tablet-reel-fullscreen"
            )
        );
    }


    /* =====================================================
       ROTATE FEATURE

       Manual two-state toggle only:

       - Mobile: the video rotates in place inside the
         untouched 9:16 card.

       - Desktop / tablet: the card itself becomes a
         16:9 landscape box; the video stays upright.

       Rotation state lives on slide.dataset.rotated and
       is never touched by fullscreen enter/exit, resize,
       or device orientation - only the Rotate button
       click changes it.
    ===================================================== */

    function isMobileRotateView() {

        return window.matchMedia(
            "(max-width: 800px)"
        ).matches;
    }


    function resetVideoRotation(video) {

        if (!video) return;

        video.classList.remove(
            "reel-video-rotated"
        );

        video.style.width = "";
        video.style.height = "";
        video.style.transform = "";

        video.style.removeProperty(
            "--reel-media-rotate-w"
        );

        video.style.removeProperty(
            "--reel-media-rotate-h"
        );
    }


    function resetCardRotation(card, video) {

        if (!card) return;

        card.classList.remove(
            "reel-card-rotated"
        );

        card.style.removeProperty(
            "--reel-rotate-w"
        );

        card.style.removeProperty(
            "--reel-rotate-h"
        );

        const slide =
            card.closest(".reel-slide");

        if (slide) {

            slide.classList.remove(
                "reel-slide-rotated"
            );

            slide.style.removeProperty(
                "--reel-rotate-w"
            );

            slide.style.removeProperty(
                "--reel-rotate-h"
            );
        }

        if (video) {

            video.classList.remove(
                "reel-video-contain"
            );
        }
    }


    /* -----------------------------------------------------
       MOBILE: rotate the video in place
    ----------------------------------------------------- */

    function rotateVideoInPlace(card, video) {

        const width = card.clientWidth;
        const height = card.clientHeight;

        if (!width || !height) {
            return;
        }

        video.classList.add(
            "reel-video-rotated"
        );

        /*
         * Swap the rendered box so that once rotated
         * 90deg, its bounding box exactly matches the
         * card which always stays 9:16 on mobile.
         */

        video.style.setProperty(
            "--reel-media-rotate-w",
            `${height}px`
        );

        video.style.setProperty(
            "--reel-media-rotate-h",
            `${width}px`
        );

        video.style.width =
            `${height}px`;

        video.style.height =
            `${width}px`;

        video.style.transform =
            "translate(-50%, -50%) rotate(90deg)";
    }


    /* -----------------------------------------------------
       DESKTOP / TABLET: available width beside the card
    ----------------------------------------------------- */

    function getAvailableCardWidth(slide) {

        const inFullscreen =
            isRealFullscreenActive() ||
            isFallbackFullscreenActive(slide);

        if (inFullscreen) {

            return window.innerWidth * 0.96;
        }


        const row =
            slide.querySelector(".reel-row");

        if (!row) {
            return window.innerWidth * 0.6;
        }


        const rowWidth = row.clientWidth;

        /*
         * Leave room for the info panel and action
         * buttons that sit beside the card.
         */

        const reserved = 480;

        return Math.max(
            rowWidth - reserved,
            320
        );
    }


    /* -----------------------------------------------------
       DESKTOP / TABLET: rotate the card to landscape
    ----------------------------------------------------- */

    function rotateCardToLandscape(
        slide,
        card,
        video
    ) {

        const inFullscreen =
            isRealFullscreenActive() ||
            isFallbackFullscreenActive(slide);

        const wasRotated =
            card.classList.contains(
                "reel-card-rotated"
            );

        if (wasRotated) {

            card.classList.remove(
                "reel-card-rotated"
            );

            card.style.removeProperty(
                "--reel-rotate-w"
            );

            card.style.removeProperty(
                "--reel-rotate-h"
            );

            void card.offsetHeight;
        }


        const naturalHeight =
            inFullscreen
                ? window.innerHeight
                : card.clientHeight;

        if (!naturalHeight) {
            return;
        }


        let targetHeight =
            naturalHeight;

        let targetWidth =
            targetHeight *
            (16 / 9);


        const availableWidth =
            getAvailableCardWidth(slide);


        if (targetWidth > availableWidth) {

            targetWidth =
                availableWidth;

            targetHeight =
                targetWidth *
                (9 / 16);
        }


        if (inFullscreen) {

            const maxHeight =
                window.innerHeight *
                0.98;

            if (targetHeight > maxHeight) {

                targetHeight =
                    maxHeight;

                targetWidth =
                    targetHeight *
                    (16 / 9);
            }
        }


        /* ---------------------------------------------
           CARD ROTATION SIZE
        --------------------------------------------- */

        card.style.setProperty(
            "--reel-rotate-w",
            `${targetWidth}px`
        );

        card.style.setProperty(
            "--reel-rotate-h",
            `${targetHeight}px`
        );


        /* ---------------------------------------------
           SLIDE ROTATION SIZE

           The slide receives the exact same dimensions
           so the outside information and action rail can
           position themselves relative to the landscape
           card.
        --------------------------------------------- */

        slide.style.setProperty(
            "--reel-rotate-w",
            `${targetWidth}px`
        );

        slide.style.setProperty(
            "--reel-rotate-h",
            `${targetHeight}px`
        );

        slide.classList.add(
            "reel-slide-rotated"
        );


        card.classList.add(
            "reel-card-rotated"
        );


        if (video) {

            video.classList.add(
                "reel-video-contain"
            );
        }
    }


    /* -----------------------------------------------------
       APPLY CURRENT ROTATION STATE
    ----------------------------------------------------- */

    function applyRotationState(slide) {

        const card =
            slide.querySelector(
                ".reel-card"
            );

        const video =
            slide.querySelector(
                ".reel-video"
            );

        if (!card || !video) {
            return;
        }


        const rotated =
            slide.dataset.rotated === "true";


        if (isMobileRotateView()) {

            resetCardRotation(
                card,
                video
            );


            if (rotated) {

                rotateVideoInPlace(
                    card,
                    video
                );

            } else {

                resetVideoRotation(
                    video
                );
            }

        } else {

            resetVideoRotation(
                video
            );


            if (rotated) {

                rotateCardToLandscape(
                    slide,
                    card,
                    video
                );

            } else {

                resetCardRotation(
                    card,
                    video
                );
            }
        }
    }


    /* =====================================================
       ROTATE BUTTON STATE
    ===================================================== */

    function updateRotateButton(
        slide,
        rotated
    ) {

        const button =
            slide.querySelector(
                ".reel-rotate-btn"
            );

        if (!button) {
            return;
        }


        button.classList.toggle(
            "is-rotated",
            rotated
        );


        button.setAttribute(
            "aria-label",
            rotated
                ? "Reset rotation"
                : "Rotate video"
        );
    }


    /* =====================================================
       TOGGLE ROTATE
    ===================================================== */

    function toggleRotate(slide) {

        const rotated =
            slide.dataset.rotated === "true";

        const next =
            !rotated;

        slide.dataset.rotated =
            String(next);

        applyRotationState(
            slide
        );

        updateRotateButton(
            slide,
            next
        );
    }


    /* =====================================================
       REAPPLY AFTER A LAYOUT CHANGE
       (fullscreen enter/exit)

       Never changes the rotation state itself,
       only re-measures sizing.
    ===================================================== */

    function reapplyRotationAfterLayoutChange(
        slide
    ) {

        if (!slide) {
            return;
        }


        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                applyRotationState(
                    slide
                );

            });

        });
    }


    /* =====================================================
       REAPPLY ON WINDOW RESIZE

       Keeps a rotated reel correctly sized if the
       viewport changes - never toggles the state.
    ===================================================== */

    let rotateResizeTimeout = null;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                rotateResizeTimeout
            );


            rotateResizeTimeout =
                setTimeout(() => {

                    slides.forEach(
                        slide => {

                            if (
                                slide.dataset.rotated ===
                                "true"
                            ) {

                                applyRotationState(
                                    slide
                                );
                            }
                        }
                    );

                }, 150);
        }
    );


    /* =====================================================
       OBSERVE VISIBLE REEL
    ===================================================== */

    const observer =
        new IntersectionObserver(
            entries => {

                /*
                 * Never let the observer change the
                 * active reel while fullscreen is active.
                 */

                if (
                    isAnyFullscreenActive()
                ) {
                    return;
                }


                const visibleSlides =
                    entries
                        .filter(
                            entry =>
                                entry.isIntersecting
                        )
                        .sort(
                            (a, b) =>
                                b.intersectionRatio -
                                a.intersectionRatio
                        );


                if (!visibleSlides.length) {
                    return;
                }


                const visibleSlide =
                    visibleSlides[0].target;


                const index =
                    slides.indexOf(
                        visibleSlide
                    );


                if (index === -1) {
                    return;
                }


                if (index !== currentIndex) {

                    currentIndex =
                        index;

                    setActiveSlide(
                        currentIndex
                    );

                    updateNavButtons();

                    playCurrentSlide();
                }
            },
            {
                root: feed,
                threshold: [
                    0.55,
                    0.7,
                    0.85,
                    1
                ]
            }
        );


    slides.forEach(
        slide => {
            observer.observe(slide);
        }
    );


    /* =====================================================
       VIDEO STATE + PROGRESS
    ===================================================== */

    slides.forEach(
        slide => {

            const video =
                slide.querySelector(
                    ".reel-video"
                );

            const fill =
                slide.querySelector(
                    ".reel-progress-fill"
                );


            if (!video) {
                return;
            }


            /* ---------------------------------------------
               FIRST FRAME
               
               No poster is used.

               The browser loads the actual video and
               displays its own first decoded frame.
            --------------------------------------------- */

            video.addEventListener(
                "loadeddata",
                () => {

                    /*
                     * Keep non-active videos at their
                     * beginning so their own first frame
                     * remains available visually.
                     */

                    if (
                        slides.indexOf(slide) !==
                        currentIndex
                    ) {

                        video.pause();
                        video.currentTime = 0;
                        video.muted = true;
                    }

                },
                { once: true }
            );


            /* ---------------------------------------------
               PLAY
            --------------------------------------------- */

            video.addEventListener(
                "play",
                () => {

                    slide.classList.remove(
                        "is-paused"
                    );

                }
            );


            /* ---------------------------------------------
               PLAYING
            --------------------------------------------- */

            video.addEventListener(
                "playing",
                () => {

                    slide.classList.remove(
                        "is-paused"
                    );

                }
            );


            /* ---------------------------------------------
               PAUSE
            --------------------------------------------- */

            video.addEventListener(
                "pause",
                () => {

                    /*
                     * Only show the play indicator when
                     * the user deliberately paused this reel.
                     */

                    if (
                        slide.dataset.userPaused ===
                        "true"
                    ) {

                        slide.classList.add(
                            "is-paused"
                        );
                    }
                }
            );


            /* ---------------------------------------------
               PROGRESS
            --------------------------------------------- */

            function updateProgress() {

                if (!fill) {
                    return;
                }


                if (!video.duration) {

                    fill.style.width =
                        "0%";

                    return;
                }


                const progress =
                    (
                        video.currentTime /
                        video.duration
                    ) * 100;


                fill.style.width =
                    `${progress}%`;
            }


            video.addEventListener(
                "timeupdate",
                updateProgress
            );


            video.addEventListener(
                "loadedmetadata",
                updateProgress
            );


            video.addEventListener(
                "seeked",
                updateProgress
            );

        }
    );


    /* =====================================================
       CLICK EVENTS
    ===================================================== */

    track.addEventListener(
        "click",
        event => {

            const slide =
                event.target.closest(
                    ".reel-slide"
                );


            if (!slide) {
                return;
            }


            /* -----------------------------------------
               MUTE
            ----------------------------------------- */

            const muteButton =
                event.target.closest(
                    ".reel-mute-btn"
                );


            if (muteButton) {

                event.stopPropagation();


                const video =
                    slide.querySelector(
                        ".reel-video"
                    );


                if (!video) {
                    return;
                }


                /*
                 * Mute/unmute is a shared feed-wide
                 * setting, not an individual Reel setting.
                 */

                sharedMuted =
                    !sharedMuted;


                /*
                 * Apply the new shared setting to the
                 * active Reel while keeping every other
                 * Reel muted.
                 */

                applyMuteState();


                return;
            }


            /* -----------------------------------------
               FULLSCREEN
            ----------------------------------------- */

            const fullscreenButton =
                event.target.closest(
                    ".reel-fullscreen-btn"
                );


            if (fullscreenButton) {

                event.stopPropagation();

                toggleFullscreen(
                    slide
                );

                return;
            }


            /* -----------------------------------------
               ROTATE
            ----------------------------------------- */

            const rotateButton =
                event.target.closest(
                    ".reel-rotate-btn"
                );


            if (rotateButton) {

                event.stopPropagation();

                toggleRotate(
                    slide
                );

                return;
            }


            /* -----------------------------------------
               LIKE
            ----------------------------------------- */

            const likeButton =
                event.target.closest(
                    ".reel-like-btn"
                );


            if (likeButton) {

                event.stopPropagation();

                likeButton.classList.toggle(
                    "is-liked"
                );

                return;
            }


            /* -----------------------------------------
               SAVE
            ----------------------------------------- */

            const saveButton =
                event.target.closest(
                    ".reel-save-btn"
                );


            if (saveButton) {

                event.stopPropagation();

                saveButton.classList.toggle(
                    "is-saved"
                );

                return;
            }


            /* -----------------------------------------
               SHARE
            ----------------------------------------- */

            const shareButton =
                event.target.closest(
                    ".reel-share-btn"
                );


            if (shareButton) {

                event.stopPropagation();

                shareReel();

                return;
            }


            /* -----------------------------------------
               REPORT
            ----------------------------------------- */

            const reportButton =
                event.target.closest(
                    ".reel-report-btn"
                );


            if (reportButton) {

                event.stopPropagation();


                if (
                    !reportButton.classList.contains(
                        "is-reported"
                    )
                ) {

                    reportButton.classList.add(
                        "is-reported"
                    );
                }


                return;
            }


            /* -----------------------------------------
               VIDEO PLAY / PAUSE
            ----------------------------------------- */

            if (
                slide !== slides[currentIndex] ||
                !event.target.closest(
                    ".reel-card"
                )
            ) {
                return;
            }


            const video =
                slide.querySelector(
                    ".reel-video"
                );


            if (!video) {
                return;
            }


            if (video.paused) {

                delete slide.dataset.userPaused;


                /*
                 * Reapply the shared mute state before
                 * manually playing the active Reel.
                 */

                video.muted =
                    sharedMuted;


                video.play()
                    .then(() => {

                        slide.classList.remove(
                            "is-paused"
                        );

                    })
                    .catch(() => {});


            } else {

                video.pause();

                slide.dataset.userPaused =
                    "true";

                slide.classList.add(
                    "is-paused"
                );
            }
        }
    );


    /* =====================================================
       FULLSCREEN HELPERS
    ===================================================== */

    function supportsElementFullscreen(
        element
    ) {

        return !!(
            element.requestFullscreen ||
            element.webkitRequestFullscreen ||
            element.mozRequestFullScreen ||
            element.msRequestFullscreen
        );
    }


    async function requestElementFullscreen(
        element
    ) {

        if (element.requestFullscreen) {

            await element.requestFullscreen();

        } else if (
            element.webkitRequestFullscreen
        ) {

            element.webkitRequestFullscreen();

        } else if (
            element.mozRequestFullScreen
        ) {

            element.mozRequestFullScreen();

        } else if (
            element.msRequestFullscreen
        ) {

            element.msRequestFullscreen();
        }
    }


    async function exitElementFullscreen() {

        if (document.exitFullscreen) {

            await document.exitFullscreen();

        } else if (
            document.webkitExitFullscreen
        ) {

            document.webkitExitFullscreen();

        } else if (
            document.mozCancelFullScreen
        ) {

            document.mozCancelFullScreen();

        } else if (
            document.msExitFullscreen
        ) {

            document.msExitFullscreen();
        }
    }


    /* =====================================================
       EXIT FALLBACK FULLSCREEN
    ===================================================== */

    function exitFallbackFullscreen(
        slide,
        card
    ) {

        slide.classList.remove(
            "mobile-reel-fullscreen",
            "tablet-reel-fullscreen"
        );


        document.body.classList.remove(
            "mobile-reel-fullscreen-active",
            "tablet-reel-fullscreen-active"
        );


        updateFullscreenButton(
            card,
            false
        );
    }


    /* =====================================================
       FULLSCREEN
    ===================================================== */

    async function toggleFullscreen(
        slide
    ) {

        const card =
            slide.querySelector(
                ".reel-card"
            );


        const video =
            slide.querySelector(
                ".reel-video"
            );


        if (!card) {
            return;
        }


        /* ---------------------------------------------
           EXIT FALLBACK FULLSCREEN
        --------------------------------------------- */

        if (
            isFallbackFullscreenActive(
                slide
            )
        ) {

            exitFallbackFullscreen(
                slide,
                card
            );


            restoreReelAfterFullscreen(
                slide
            );


            reapplyRotationAfterLayoutChange(
                slide
            );


            return;
        }


        /* ---------------------------------------------
           EXIT REAL FULLSCREEN
        --------------------------------------------- */

        if (
            isRealFullscreenActive()
        ) {

            try {

                await exitElementFullscreen();

            } catch (error) {

                console.log(
                    "Unable to exit fullscreen:",
                    error
                );
            }


            return;
        }


        /* ---------------------------------------------
           REMEMBER CURRENT REEL
        --------------------------------------------- */

        fullscreenSlide =
            slide;


        fullscreenIndex =
            slides.indexOf(
                slide
            );


        fullscreenScrollTop =
            feed.scrollTop;


        currentIndex =
            fullscreenIndex;


        setActiveSlide(
            currentIndex
        );


        updateNavButtons();


        /* ---------------------------------------------
           REAL FULLSCREEN
        --------------------------------------------- */

        if (
            supportsElementFullscreen(
                card
            )
        ) {

            try {

                await requestElementFullscreen(
                    card
                );


                updateFullscreenButton(
                    card,
                    true
                );


                reapplyRotationAfterLayoutChange(
                    slide
                );


                /*
                 * Start playback only if the user
                 * has not deliberately paused it.
                 */

                if (
                    video &&
                    video.paused &&
                    !slide.dataset.userPaused
                ) {

                    video.muted =
                        sharedMuted;

                    video.play()
                        .catch(() => {});
                }

            } catch (error) {

                console.log(
                    "Fullscreen unavailable:",
                    error
                );
            }


            return;
        }


        /* ---------------------------------------------
           FALLBACK FULLSCREEN
        --------------------------------------------- */

        const isMobile =
            window.matchMedia(
                "(max-width: 800px)"
            ).matches;


        const isTablet =
            window.matchMedia(
                "(min-width: 801px) and (max-width: 1150px)"
            ).matches;


        if (isMobile) {

            slide.classList.add(
                "mobile-reel-fullscreen"
            );


            document.body.classList.add(
                "mobile-reel-fullscreen-active"
            );

        } else if (isTablet) {

            slide.classList.add(
                "tablet-reel-fullscreen"
            );


            document.body.classList.add(
                "tablet-reel-fullscreen-active"
            );

        } else {

            return;
        }


        updateFullscreenButton(
            card,
            true
        );


        reapplyRotationAfterLayoutChange(
            slide
        );


        if (
            video &&
            video.paused &&
            !slide.dataset.userPaused
        ) {

            video.muted =
                sharedMuted;

            video.play()
                .catch(() => {});
        }
    }


    /* =====================================================
       RESTORE REEL AFTER FULLSCREEN
    ===================================================== */

    function restoreReelAfterFullscreen(
        slide
    ) {

        if (!slide) {
            return;
        }


        const index =
            slides.indexOf(
                slide
            );


        if (index !== -1) {

            currentIndex =
                index;

        } else if (
            fullscreenIndex !== null &&
            fullscreenIndex >= 0 &&
            fullscreenIndex < slides.length
        ) {

            currentIndex =
                fullscreenIndex;
        }


        setActiveSlide(
            currentIndex
        );


        updateNavButtons();


        /*
         * Mobile browsers can take one or more
         * frames to restore the normal viewport.
         *
         * Wait for the layout to return before
         * restoring the exact reel position.
         */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                const targetSlide =
                    slides[currentIndex];


                if (!targetSlide) {
                    return;
                }


                feed.scrollTo({
                    top:
                        targetSlide.offsetTop,
                    left: 0,
                    behavior: "auto"
                });


                /*
                 * Force a layout recalculation.
                 * This fixes the situation where the
                 * information/actions appear only after
                 * manually scrolling.
                 */

                void feed.offsetHeight;


                setActiveSlide(
                    currentIndex
                );


                updateNavButtons();


                reapplyRotationAfterLayoutChange(
                    targetSlide
                );

            });

        });


        fullscreenSlide =
            null;


        fullscreenIndex =
            null;
    }


    /* =====================================================
       FULLSCREEN BUTTON STATE
    ===================================================== */

    function updateFullscreenButton(
        card,
        fullscreen
    ) {

        const button =
            card.querySelector(
                ".reel-fullscreen-btn"
            );


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


        slides.forEach(
            slide => {

                const card =
                    slide.querySelector(
                        ".reel-card"
                    );


                if (!card) {
                    return;
                }


                const isFullscreen =
                    currentlyFullscreen ===
                    card;


                updateFullscreenButton(
                    card,
                    isFullscreen
                );
            }
        );


        /* ---------------------------------------------
           REAL FULLSCREEN HAS ENDED
        --------------------------------------------- */

        if (
            !isRealFullscreenActive()
        ) {

            document.body.classList.remove(
                "mobile-reel-fullscreen-active",
                "tablet-reel-fullscreen-active"
            );


            if (fullscreenSlide) {

                const slideToRestore =
                    fullscreenSlide;


                restoreReelAfterFullscreen(
                    slideToRestore
                );
            }
        }
    }


    document.addEventListener(
        "fullscreenchange",
        handleFullscreenChange
    );


    document.addEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
    );


    document.addEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
    );


    document.addEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
    );


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }


            const fallbackFullscreenSlide =
                document.querySelector(
                    ".reel-slide.mobile-reel-fullscreen, " +
                    ".reel-slide.tablet-reel-fullscreen"
                );


            if (fallbackFullscreenSlide) {

                const card =
                    fallbackFullscreenSlide.querySelector(
                        ".reel-card"
                    );


                if (card) {

                    exitFallbackFullscreen(
                        fallbackFullscreenSlide,
                        card
                    );


                    restoreReelAfterFullscreen(
                        fallbackFullscreenSlide
                    );
                }


                return;
            }


            if (
                isRealFullscreenActive()
            ) {

                exitElementFullscreen();
            }
        }
    );


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

                await navigator.clipboard.writeText(
                    window.location.href
                );

            } catch {

                /* Clipboard unavailable. */
            }
        }
    }


    /* =====================================================
       KEYBOARD NAVIGATION
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "ArrowDown"
            ) {

                event.preventDefault();

                goToIndex(
                    currentIndex + 1
                );

            } else if (
                event.key ===
                "ArrowUp"
            ) {

                event.preventDefault();

                goToIndex(
                    currentIndex - 1
                );
            }
        }
    );


    /* =====================================================
       SIDEBAR NAVIGATION
    ===================================================== */

    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    event => {

                        if (
                            item.getAttribute("href") !==
                            "#"
                        ) {
                            return;
                        }


                        event.preventDefault();


                        document
                            .querySelectorAll(
                                ".nav-item"
                            )
                            .forEach(
                                nav => {

                                    nav.classList.remove(
                                        "active"
                                    );
                                }
                            );


                        item.classList.add(
                            "active"
                        );
                    }
                );
            }
        );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    setActiveSlide(currentIndex);

    updateAllMuteButtons();

    updateNavButtons();

    playCurrentSlide();

});