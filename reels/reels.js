/* =========================================================
   REELS PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const feed = document.querySelector(".reels-feed");
    const track = document.querySelector(".reels-track");
    const slides = Array.from(document.querySelectorAll(".reel-slide"));
    const upButton = document.querySelector(".reel-nav-up");
    const downButton = document.querySelector(".reel-nav-down");

    if (!feed || !track || slides.length === 0) {
        return;
    }

    /* =====================================================
       RANDOMIZE REEL ORDER
       ===================================================== */

    for (let i = slides.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slides[i], slides[j]] = [slides[j], slides[i]];
    }

    slides.forEach(slide => track.appendChild(slide));

    /* =====================================================
       REEL STATE
       ===================================================== */

    let currentIndex = 0;
    let isLocked = false;
    let unlockFallback = null;
    let wheelBlocked = false;

    function setActiveSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === index);
        });
    }

    function getSlideStep() {
        return feed.clientHeight * 0.88;
    }

    function applyTrackPosition(animate = true) {
        track.style.transition = animate
            ? "transform 0.48s cubic-bezier(0.22, 0.68, 0.35, 1)"
            : "none";

        track.style.transform =
            `translateY(-${currentIndex * getSlideStep()}px)`;
    }

    function updateNavButtons() {
        if (upButton) {
            upButton.disabled = currentIndex === 0;
        }

        if (downButton) {
            downButton.disabled = currentIndex === slides.length - 1;
        }
    }

    function finishTransition() {
        window.clearTimeout(unlockFallback);

        setActiveSlide(currentIndex);

        isLocked = false;

        playCurrentSlide();
    }

    function lockTransition() {
        isLocked = true;

        window.clearTimeout(unlockFallback);

        unlockFallback = window.setTimeout(
            finishTransition,
            650
        );
    }

    track.addEventListener("transitionend", event => {
        if (
            event.target === track &&
            event.propertyName === "transform"
        ) {
            finishTransition();
        }
    });

    /* =====================================================
       VIDEO ORIENTATION
       ===================================================== */

    slides.forEach(slide => {
        const video = slide.querySelector(".reel-video");

        if (!video) return;

        video.addEventListener("loadedmetadata", () => {
            if (!video.videoWidth || !video.videoHeight) {
                return;
            }

            slide.dataset.orientation =
                video.videoHeight > video.videoWidth
                    ? "portrait"
                    : "landscape";
        });
    });

    /* =====================================================
       VIDEO PROGRESS
       ===================================================== */

    slides.forEach(slide => {
        const video = slide.querySelector(".reel-video");
        const fill = slide.querySelector(".reel-progress-fill");

        if (!video || !fill) return;

        function updateProgress() {
            if (!video.duration) return;

            fill.style.width =
                `${(video.currentTime / video.duration) * 100}%`;
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
       VIDEO PLAYBACK
       ===================================================== */

    function playCurrentSlide() {
        slides.forEach((slide, i) => {
            const video = slide.querySelector(".reel-video");

            if (!video) return;

            if (i === currentIndex) {
                if (!slide.dataset.userPaused) {
                    video.play()
                        .then(() => {
                            slide.classList.remove("is-paused");
                        })
                        .catch(() => {});
                }

                return;
            }

            video.pause();
            video.currentTime = 0;

            slide.classList.remove("is-paused");

            delete slide.dataset.userPaused;
        });
    }

    /* =====================================================
   PLAY / PAUSE REEL ON CARD CLICK
   ===================================================== */

slides.forEach(slide => {
    const card = slide.querySelector(".reel-card");
    const video = slide.querySelector(".reel-video");

    if (!card || !video) return;

    card.addEventListener("click", event => {
        // Only the active reel can be paused/resumed
        if (slide !== slides[currentIndex]) {
            return;
        }

        // Ignore clicks on the mute button
        if (event.target.closest(".reel-mute-btn")) {
            return;
        }

        if (video.paused) {
            delete slide.dataset.userPaused;

            video.play()
                .then(() => {
                    slide.classList.remove("is-paused");
                })
                .catch(() => {});
        } else {
            video.pause();

            slide.dataset.userPaused = "true";
            slide.classList.add("is-paused");
        }
    });
});

    function goToIndex(index) {
        if (
            isLocked ||
            index < 0 ||
            index >= slides.length ||
            index === currentIndex
        ) {
            return;
        }

        delete slides[currentIndex].dataset.userPaused;

        currentIndex = index;

        lockTransition();

        applyTrackPosition(true);

        updateNavButtons();
    }

    /* =====================================================
       NAVIGATION BUTTONS
       ===================================================== */

    upButton?.addEventListener("click", () => {
        goToIndex(currentIndex - 1);
    });

    downButton?.addEventListener("click", () => {
        goToIndex(currentIndex + 1);
    });

    /* =====================================================
       MOUSE WHEEL
       ===================================================== */

    feed.addEventListener(
        "wheel",
        event => {
            event.preventDefault();

            if (
                wheelBlocked ||
                isLocked ||
                Math.abs(event.deltaY) < 20
            ) {
                return;
            }

            wheelBlocked = true;

            goToIndex(
                currentIndex +
                (event.deltaY > 0 ? 1 : -1)
            );

            window.setTimeout(() => {
                wheelBlocked = false;
            }, 750);
        },
        { passive: false }
    );

    /* =====================================================
       TOUCH SWIPE
       ===================================================== */

    let touchStartY = 0;

    feed.addEventListener(
        "touchstart",
        event => {
            touchStartY = event.touches[0].clientY;
        },
        { passive: true }
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

            goToIndex(
                currentIndex +
                (delta > 0 ? 1 : -1)
            );
        },
        { passive: true }
    );

    /* =====================================================
       KEYBOARD NAVIGATION
       ===================================================== */

    document.addEventListener("keydown", event => {
        if (event.key === "ArrowDown") {
            goToIndex(currentIndex + 1);
        }

        else if (event.key === "ArrowUp") {
            goToIndex(currentIndex - 1);
        }
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
                            ?.querySelector(
                                ".reel-video"
                            );

                    if (!video) return;

                    video.muted = !video.muted;

                    button.innerHTML =
                        video.muted
                            ? `
                                <svg viewBox="0 0 24 24">
                                    <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                    <path d="M16 9c1 1 1 5 0 6"></path>
                                </svg>
                              `
                            : `
                                <svg viewBox="0 0 24 24">
                                    <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                    <path d="M16 8c2 2 2 6 0 8"></path>
                                    <path d="M19 5c3 3 3 11 0 14"></path>
                                </svg>
                              `;
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

                    const liked =
                        button.classList.toggle(
                            "is-liked"
                        );

                    updateLikeCount(
                        button,
                        liked
                    );

                    button.classList.remove("pop");

                    void button.offsetWidth;

                    button.classList.add("pop");
                }
            );
        });

    function updateLikeCount(button, liked) {
        const countElement =
            button.querySelector(
                ".reel-action-count"
            );

        if (!countElement) return;

        const base =
            Number(
                countElement.dataset.base
            );

        countElement.textContent =
            formatCount(
                liked
                    ? base + 1
                    : base
            );
    }

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
                        }

                        catch (error) {
                            // User closed the share menu.
                        }

                        return;
                    }

                    try {
                        await navigator.clipboard.writeText(
                            window.location.href
                        );
                    }

                    catch (error) {
                        // Clipboard access is unavailable.
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
                }
            );
        });

    /* =====================================================
       NAVIGATION ACTIVE STATE
       ===================================================== */

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                event => {

                    if (
                        item.getAttribute(
                            "href"
                        ) !== "#"
                    ) {
                        return;
                    }

                    event.preventDefault();

                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(nav => {
                            nav.classList.remove(
                                "active"
                            );
                        });

                    item.classList.add("active");
                }
            );
        });

    /* =====================================================
       HELPERS / INITIALIZATION
       ===================================================== */

    function formatCount(num) {
        if (num >= 1000) {
            return `${(num / 1000)
                .toFixed(1)
                .replace(/\.0$/, "")}k`;
        }

        return String(num);
    }

    setActiveSlide(0);

    updateNavButtons();

    applyTrackPosition(false);

    playCurrentSlide();

    window.addEventListener("resize", () => {
        applyTrackPosition(false);
    });
});