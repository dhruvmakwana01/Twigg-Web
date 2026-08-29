/* =========================================================
   REELS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const feed = document.querySelector(".reels-feed");
    const track = document.querySelector(".reels-track");
    const slides = Array.from(
        document.querySelectorAll(".reel-slide")
    );

    // RANDOMIZE REEL ORDER
for (let i = slides.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [slides[i], slides[j]] = [slides[j], slides[i]];
}

// Put the shuffled reels back into the track
slides.forEach(slide => {
    track.appendChild(slide);
});

    const upButton = document.querySelector(".reel-nav-up");
    const downButton = document.querySelector(".reel-nav-down");
    const toast = document.querySelector(".reel-toast");

    if (!feed || !track || slides.length === 0) {
        return;
    }


    /* =====================================================
       CURRENT / ACTIVE REEL
    ===================================================== */

    let currentIndex = 0;
    let activeIndex = 0;

    let isLocked = false;
    let unlockFallback;


    function setActiveSlide(index) {

        activeIndex = index;

        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "is-active",
                i === activeIndex
            );

        });

    }


    /* =====================================================
       REEL POSITION
    ===================================================== */

    function getSlideStep() {

        return feed.clientHeight * 0.88;

    }


    function applyTrackPosition(animate = true) {

        track.style.transition = animate
            ? "transform 0.48s cubic-bezier(0.22, 0.68, 0.35, 1)"
            : "none";

        track.style.transform =
            `translateY(-${currentIndex * getSlideStep()}px`;

    }


    /* =====================================================
       LOCK / UNLOCK TRANSITIONS
    ===================================================== */

    function unlock() {

        isLocked = false;

    }


    function finishTransition() {

        window.clearTimeout(unlockFallback);

        setActiveSlide(currentIndex);

        unlock();

        playCurrentSlide();

    }


    function lock() {

        isLocked = true;

        window.clearTimeout(unlockFallback);

        unlockFallback =
            window.setTimeout(
                finishTransition,
                650
            );

    }


    track.addEventListener(
        "transitionend",
        event => {

            if (
                event.target !== track ||
                event.propertyName !== "transform"
            ) {
                return;
            }

            finishTransition();

        }
    );


    /* =====================================================
       ORIENTATION DETECTION
    ===================================================== */

    slides.forEach(slide => {

        const video =
            slide.querySelector(".reel-video");

        if (!video) {
            return;
        }

        video.addEventListener(
            "loadedmetadata",
            () => {

                if (
                    video.videoWidth &&
                    video.videoHeight
                ) {

                    const orientation =
                        video.videoHeight >
                        video.videoWidth
                            ? "portrait"
                            : "landscape";

                    slide.dataset.orientation =
                        orientation;

                }

            }
        );

    });


    /* =====================================================
       VIDEO PROGRESS BAR
    ===================================================== */

    slides.forEach(slide => {

        const video =
            slide.querySelector(".reel-video");

        const fill =
            slide.querySelector(
                ".reel-progress-fill"
            );

        if (!video || !fill) {
            return;
        }


        function updateProgress() {

            if (!video.duration) {
                return;
            }

            const percent =
                (video.currentTime /
                    video.duration) * 100;

            fill.style.width =
                `${percent}%`;

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
       NAVIGATION BUTTONS
    ===================================================== */

    function updateNavButtons() {

        if (upButton) {

            upButton.disabled =
                currentIndex === 0;

        }

        if (downButton) {

            downButton.disabled =
                currentIndex ===
                slides.length - 1;

        }

    }


    /* =====================================================
       PLAY CURRENT REEL
    ===================================================== */

    function playCurrentSlide() {

        slides.forEach((slide, i) => {

            const video =
                slide.querySelector(".reel-video");

            if (!video) {
                return;
            }


            if (i === currentIndex) {

                /*
                 * Only autoplay if the user has not
                 * manually paused this reel.
                 */

                if (!slide.dataset.userPaused) {

                    video.play()
                        .then(() => {

                            slide.classList.remove(
                                "is-paused"
                            );

                        })
                        .catch(() => {

                            /*
                             * Browser autoplay policy
                             * may block playback.
                             */

                        });

                }

            } else {

                /*
                 * Stop every reel that is not active.
                 */

                video.pause();

                video.currentTime = 0;

                slide.classList.remove(
                    "is-paused"
                );

                delete slide.dataset.userPaused;

            }

        });

    }


    /* =====================================================
       GO TO REEL
    ===================================================== */

    function goToIndex(index) {

        if (isLocked) {
            return;
        }

        if (
            index < 0 ||
            index >= slides.length
        ) {
            return;
        }

        if (index === currentIndex) {
            return;
        }


        /*
         * Clear the manual pause state of the
         * previous reel so it can restart normally
         * when revisited.
         */

        const previousSlide =
            slides[currentIndex];

        if (previousSlide) {

            delete previousSlide.dataset.userPaused;

        }


        currentIndex = index;

        lock();

        applyTrackPosition(true);

        updateNavButtons();

    }


    /* =====================================================
       UP BUTTON
    ===================================================== */

    if (upButton) {

        upButton.addEventListener(
            "click",
            () => {

                goToIndex(
                    currentIndex - 1
                );

            }
        );

    }


    /* =====================================================
       DOWN BUTTON
    ===================================================== */

    if (downButton) {

        downButton.addEventListener(
            "click",
            () => {

                goToIndex(
                    currentIndex + 1
                );

            }
        );

    }


   /* =====================================================
   WHEEL SCROLL — ONE GESTURE = ONE REEL
===================================================== */

let wheelBlocked = false;

feed.addEventListener(
    "wheel",
    event => {

        event.preventDefault();

        /*
         * Ignore every wheel event while the current
         * reel is moving.
         */
        if (wheelBlocked || isLocked) {
            return;
        }

        /*
         * Ignore extremely tiny movements.
         */
        if (Math.abs(event.deltaY) < 20) {
            return;
        }

        /*
         * Lock immediately.
         */
        wheelBlocked = true;

        /*
         * Move exactly ONE reel.
         */
        if (event.deltaY > 0) {

            goToIndex(currentIndex + 1);

        } else {

            goToIndex(currentIndex - 1);

        }

        /*
         * The CSS animation is 480ms.
         * Give the track a little extra time so the
         * remaining wheel burst cannot trigger another reel.
         */
        window.setTimeout(() => {

            wheelBlocked = false;

        }, 750);

    },
    {
        passive: false
    }
);


    /* =====================================================
       TOUCH SWIPE
    ===================================================== */

    let touchStartY = 0;


    feed.addEventListener(
        "touchstart",
        event => {

            touchStartY =
                event.touches[0].clientY;

        },
        {
            passive: true
        }
    );


    feed.addEventListener(
        "touchend",
        event => {

            const touchEndY =
                event.changedTouches[0].clientY;

            const delta =
                touchStartY - touchEndY;


            if (Math.abs(delta) < 50) {
                return;
            }


            if (delta > 0) {

                goToIndex(
                    currentIndex + 1
                );

            } else {

                goToIndex(
                    currentIndex - 1
                );

            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       KEYBOARD NAVIGATION
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "ArrowDown"
            ) {

                goToIndex(
                    currentIndex + 1
                );

            }


            if (
                event.key === "ArrowUp"
            ) {

                goToIndex(
                    currentIndex - 1
                );

            }

        }
    );


    /* =====================================================
       PLAY / PAUSE + DOUBLE TAP LIKE
    ===================================================== */

    document
        .querySelectorAll(".reel-card")
        .forEach(card => {

            const video =
                card.querySelector(
                    ".reel-video"
                );

            const slide =
                card.closest(
                    ".reel-slide"
                );

            const likeBtn =
                slide.querySelector(
                    ".reel-like-btn"
                );

            const burst =
                card.querySelector(
                    ".reel-like-burst"
                );

            let clickTimer = null;
            let lastClickTime = 0;


            function togglePlayPause() {

                if (video.paused) {

                    video.play()
                        .then(() => {

                            slide.classList.remove(
                                "is-paused"
                            );

                            delete slide.dataset.userPaused;

                        })
                        .catch(() => {});

                } else {

                    video.pause();

                    slide.classList.add(
                        "is-paused"
                    );

                    /*
                     * Remember that the user manually
                     * paused this reel.
                     */

                    slide.dataset.userPaused =
                        "true";

                }

            }


            function likeFromDoubleTap() {

                if (
                    likeBtn &&
                    !likeBtn.classList.contains(
                        "is-liked"
                    )
                ) {

                    likeBtn.classList.add(
                        "is-liked"
                    );


                    const countEl =
                        likeBtn.querySelector(
                            ".reel-action-count"
                        );


                    if (countEl) {

                        const base =
                            parseFloat(
                                countEl.dataset.base
                            );

                        countEl.textContent =
                            formatCount(
                                base + 1
                            );

                    }

                }


                if (likeBtn) {

                    likeBtn.classList.remove(
                        "pop"
                    );

                    void likeBtn.offsetWidth;

                    likeBtn.classList.add(
                        "pop"
                    );

                }


                if (burst) {

                    burst.classList.remove(
                        "burst"
                    );

                    void burst.offsetWidth;

                    burst.classList.add(
                        "burst"
                    );

                }

            }


            card.addEventListener(
                "click",
                () => {

                    const now =
                        Date.now();

                    const delta =
                        now -
                        lastClickTime;


                    if (
                        delta > 0 &&
                        delta < 300
                    ) {

                        window.clearTimeout(
                            clickTimer
                        );

                        lastClickTime = 0;

                        likeFromDoubleTap();

                        return;

                    }


                    lastClickTime = now;


                    clickTimer =
                        window.setTimeout(
                            () => {

                                togglePlayPause();

                            },
                            260
                        );

                }
            );

        });


    /* =====================================================
       MUTE BUTTON
    ===================================================== */

    document
        .querySelectorAll(".reel-mute-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const video =
                        button
                            .closest(".reel-card")
                            .querySelector(
                                ".reel-video"
                            );


                    video.muted =
                        !video.muted;


                    if (video.muted) {

                        button.innerHTML = `
                            <svg viewBox="0 0 24 24">
                                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                <path d="M16 9c1 1 1 5 0 6"></path>
                            </svg>
                        `;

                    } else {

                        button.innerHTML = `
                            <svg viewBox="0 0 24 24">
                                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                <path d="M16 8c2 2 2 6 0 8"></path>
                                <path d="M19 5c3 3 3 11 0 14"></path>
                            </svg>
                        `;

                    }

                }
            );

        });


    /* =====================================================
       LIKE BUTTON
    ===================================================== */

    document
        .querySelectorAll(".reel-like-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    button.classList.toggle(
                        "is-liked"
                    );


                    button.classList.remove(
                        "pop"
                    );

                    void button.offsetWidth;

                    button.classList.add(
                        "pop"
                    );


                    const countEl =
                        button.querySelector(
                            ".reel-action-count"
                        );


                    if (countEl) {

                        const base =
                            parseFloat(
                                countEl.dataset.base
                            );

                        const liked =
                            button.classList.contains(
                                "is-liked"
                            );

                        countEl.textContent =
                            formatCount(
                                liked
                                    ? base + 1
                                    : base
                            );

                    }

                }
            );

        });


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    document
        .querySelectorAll(".reel-save-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    button.classList.toggle(
                        "is-saved"
                    );


                    showToast(
                        button.classList.contains(
                            "is-saved"
                        )
                            ? "Saved"
                            : "Removed from saved"
                    );

                }
            );

        });


    /* =====================================================
       SHARE BUTTON
    ===================================================== */

    document
        .querySelectorAll(".reel-share-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();


                    if (navigator.share) {

                        try {

                            await navigator.share({
                                title: "Twigg",
                                text: "Check out this reel on Twigg."
                            });

                        } catch (error) {

                            /*
                             * User closed share menu.
                             */

                        }

                    } else {

                        try {

                            await navigator.clipboard
                                .writeText(
                                    window.location.href
                                );

                            showToast(
                                "Link copied!"
                            );

                        } catch (error) {

                            showToast(
                                "Share is not supported in this browser."
                            );

                        }

                    }

                }
            );

        });


    /* =====================================================
       REPORT BUTTON
    ===================================================== */

    document
        .querySelectorAll(".reel-report-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    if (
                        button.classList.contains(
                            "is-reported"
                        )
                    ) {
                        return;
                    }


                    button.classList.add(
                        "is-reported"
                    );


                    showToast(
                        "Reported. Thanks for letting us know."
                    );

                }
            );

        });


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimeout;


    function showToast(message) {

        if (!toast) {
            return;
        }


        toast.textContent =
            message;


        toast.classList.add(
            "is-visible"
        );


        window.clearTimeout(
            toastTimeout
        );


        toastTimeout =
            window.setTimeout(
                () => {

                    toast.classList.remove(
                        "is-visible"
                    );

                },
                1800
            );

    }


    /* =====================================================
       HELPER
    ===================================================== */

    function formatCount(num) {

        if (num >= 1000) {

            return (
                (num / 1000)
                    .toFixed(1)
                    .replace(/\.0$/, "")
                + "k"
            );

        }

        return String(num);

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    setActiveSlide(0);

    updateNavButtons();

    applyTrackPosition(false);

    playCurrentSlide();


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            applyTrackPosition(false);

        }
    );

});


/* =========================================================
   NAVIGATION ACTIVE STATE
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            function(event) {

                if (
                    this.getAttribute("href") === "#"
                ) {

                    event.preventDefault();


                    document
                        .querySelectorAll(".nav-item")
                        .forEach(nav => {

                            nav.classList.remove(
                                "active"
                            );

                        });


                    this.classList.add(
                        "active"
                    );

                }

            }
        );

    });

    