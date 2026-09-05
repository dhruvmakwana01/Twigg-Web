document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       REEL DATA
    ===================================================== */

    const reels = [
        {
            name: "Studio Craft",
            category: "Packaging Design",
            rating: "4.9",
            reviews: "1,204",
            video: "videos/video1.mp4",
            poster: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&h=1422&q=90"
        },
        {
            name: "Markwell Studio",
            category: "Logo Design",
            rating: "4.8",
            reviews: "842",
            video: "videos/video3.mp4",
            poster: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&h=1422&q=90"
        },
        {
            name: "Pixel & Co",
            category: "Web & Mobile Design",
            rating: "5.0",
            reviews: "2,380",
            video: "videos/video5.mp4",
            poster: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&h=1422&q=90"
        },
        {
            name: "Inkwell Press",
            category: "Book Design",
            rating: "4.5",
            reviews: "94",
            video: "videos/video1.mp4",
            poster: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&h=1422&q=90"
        },
        {
            name: "Reel Intro Studio",
            category: "Intro & Outro Videos",
            rating: "4.7",
            reviews: "445",
            video: "videos/video3.mp4",
            poster: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&h=1422&q=90"
        },
        {
            name: "Kinetic House",
            category: "Motion Graphics",
            rating: "4.8",
            reviews: "990",
            video: "videos/video5.mp4",
            poster: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&h=1422&q=90"
        },
        {
            name: "Studio Nova",
            category: "Product Photography",
            rating: "4.9",
            reviews: "1,875",
            video: "videos/video6.mp4",
            poster: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&h=1422&q=90"
        },
        {
            name: "ColorLab Studio",
            category: "Color Grading",
            rating: "5.0",
            reviews: "3,040",
            video: "videos/video2.mp4",
            poster: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&h=1422&q=90"
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
       CREATE REEL
    ===================================================== */

    function createReel(reel) {
        return `
            <section class="reel-slide">

                <div class="reel-row">

                    <div class="reel-info-outside">

                        <div class="reel-service-name">
                            ${reel.name}
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
                            preload="metadata"
                            poster="${reel.poster}"
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
       RANDOMIZE REELS
    ===================================================== */

    const shuffledReels = [...reels];

    for (let i = shuffledReels.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [
            shuffledReels[i],
            shuffledReels[j]
        ] = [
            shuffledReels[j],
            shuffledReels[i]
        ];
    }

    track.innerHTML =
        shuffledReels
            .map(createReel)
            .join("");


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
       ACTIVE REEL
    ===================================================== */

    function setActiveSlide(index) {

        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "is-active",
                i === index
            );

        });
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


            video.pause();
            video.currentTime = 0;

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
       OBSERVE VISIBLE REEL
    ===================================================== */

    const observer =
        new IntersectionObserver(
            entries => {

                /*
                 * Never let the observer change the
                 * active reel while fullscreen is active.
                 */
                if (isAnyFullscreenActive()) {
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

                    currentIndex = index;

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


    slides.forEach(slide => {
        observer.observe(slide);
    });


    /* =====================================================
       VIDEO STATE + PROGRESS
    ===================================================== */

    slides.forEach(slide => {

        const video =
            slide.querySelector(".reel-video");

        const fill =
            slide.querySelector(
                ".reel-progress-fill"
            );


        if (!video) {
            return;
        }


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

                fill.style.width = "0%";

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
    });


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


                video.muted =
                    !video.muted;


                muteButton.innerHTML =
                    video.muted
                        ? icons.mute
                        : icons.unmute;


                muteButton.setAttribute(
                    "aria-label",
                    video.muted
                        ? "Unmute"
                        : "Mute"
                );


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
                !event.target.closest(".reel-card")
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

    async function toggleFullscreen(slide) {

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


            return;
        }


        /* ---------------------------------------------
           EXIT REAL FULLSCREEN
        --------------------------------------------- */

        if (isRealFullscreenActive()) {

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


                /*
                 * Start playback only if the user
                 * has not deliberately paused it.
                 */
                if (
                    video &&
                    video.paused &&
                    !slide.dataset.userPaused
                ) {

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


        if (
            video &&
            video.paused &&
            !slide.dataset.userPaused
        ) {

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


        slides.forEach(slide => {

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
        });


        /* ---------------------------------------------
           REAL FULLSCREEN HAS ENDED
        --------------------------------------------- */

        if (!isRealFullscreenActive()) {

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


            if (isRealFullscreenActive()) {

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

            if (event.key === "ArrowDown") {

                event.preventDefault();

                goToIndex(
                    currentIndex + 1
                );

            } else if (
                event.key === "ArrowUp"
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
        .forEach(item => {

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
                        .querySelectorAll(".nav-item")
                        .forEach(nav => {

                            nav.classList.remove(
                                "active"
                            );
                        });


                    item.classList.add(
                        "active"
                    );
                }
            );
        });


    /* =====================================================
       INITIALIZE
    ===================================================== */

    setActiveSlide(0);

    updateNavButtons();

    playCurrentSlide();

});