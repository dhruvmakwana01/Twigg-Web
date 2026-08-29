/* =========================================================
   REELS PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const feed = document.querySelector(".reels-feed");
    const track = document.querySelector(".reels-track");
    const slides = Array.from(document.querySelectorAll(".reel-slide"));
    const upButton = document.querySelector(".reel-nav-up");
    const downButton = document.querySelector(".reel-nav-down");
    const toast = document.querySelector(".reel-toast");

    if (!feed || !track || slides.length === 0) {
        return;
    }

    let currentIndex = 0;
    let isLocked = false;
    let unlockFallback;

    function lock() {

        isLocked = true;

        window.clearTimeout(unlockFallback);

        /* Safety net in case transitionend never fires */
        unlockFallback = window.setTimeout(unlock, 700);

    }

    function unlock() {
        isLocked = false;
    }

    track.addEventListener("transitionend", (event) => {

        if (event.target !== track || event.propertyName !== "transform") {
            return;
        }

        window.clearTimeout(unlockFallback);
        unlock();

    });


    /* =====================================================
       ORIENTATION DETECTION
       (confirms/corrects the data-orientation guess once
       the real video dimensions are known)
    ===================================================== */

    slides.forEach(slide => {

        const video = slide.querySelector(".reel-video");

        if (!video) {
            return;
        }

        video.addEventListener("loadedmetadata", () => {

            if (video.videoWidth && video.videoHeight) {

                const orientation =
                    video.videoHeight > video.videoWidth
                        ? "portrait"
                        : "landscape";

                slide.dataset.orientation = orientation;

            }

        });

    });


    /* =====================================================
       VIDEO PROGRESS BAR
    ===================================================== */

    slides.forEach(slide => {

        const video = slide.querySelector(".reel-video");
        const fill = slide.querySelector(".reel-progress-fill");

        if (!video || !fill) {
            return;
        }

        function updateProgress() {

            if (!video.duration) {
                return;
            }

            const percent = (video.currentTime / video.duration) * 100;
            fill.style.width = `${percent}%`;

        }

        video.addEventListener("timeupdate", updateProgress);
        video.addEventListener("loadedmetadata", updateProgress);
        video.addEventListener("seeked", updateProgress);

    });


    /* =====================================================
       PAGING — ONE REEL AT A TIME
    ===================================================== */

    function updateNavButtons() {

        upButton.disabled = currentIndex === 0;
        downButton.disabled = currentIndex === slides.length - 1;

    }

    function playCurrentSlide() {

        slides.forEach((slide, i) => {

            const video = slide.querySelector(".reel-video");

            if (!video) {
                return;
            }

            if (i === currentIndex) {

                if (!slide.dataset.userPaused) {

                    video.play().catch(() => {});
                    slide.classList.remove("is-paused");

                }

            } else {

                video.pause();
                video.currentTime = 0;

            }

        });

    }

    function goToIndex(index) {

        if (isLocked) {
            return;
        }

        if (index < 0 || index >= slides.length) {
            return;
        }

        if (index === currentIndex) {
            return;
        }

        currentIndex = index;
        lock();

        track.style.transform = `translateY(-${currentIndex * 100}%)`;

        updateNavButtons();
        playCurrentSlide();

    }

    upButton.addEventListener("click", () => {
        goToIndex(currentIndex - 1);
    });

    downButton.addEventListener("click", () => {
        goToIndex(currentIndex + 1);
    });


    /* =====================================================
       WHEEL SCROLL — ONE REEL PER GESTURE
    ===================================================== */

    feed.addEventListener(
        "wheel",
        (event) => {

            event.preventDefault();

            if (Math.abs(event.deltaY) < 8) {
                return;
            }

            if (event.deltaY > 0) {
                goToIndex(currentIndex + 1);
            } else {
                goToIndex(currentIndex - 1);
            }

        },
        { passive: false }
    );


    /* =====================================================
       TOUCH SWIPE — MOBILE
    ===================================================== */

    let touchStartY = 0;

    feed.addEventListener(
        "touchstart",
        (event) => {
            touchStartY = event.touches[0].clientY;
        },
        { passive: true }
    );

    feed.addEventListener(
        "touchend",
        (event) => {

            const touchEndY = event.changedTouches[0].clientY;
            const delta = touchStartY - touchEndY;

            if (Math.abs(delta) < 50) {
                return;
            }

            if (delta > 0) {
                goToIndex(currentIndex + 1);
            } else {
                goToIndex(currentIndex - 1);
            }

        },
        { passive: true }
    );


    /* =====================================================
       KEYBOARD
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key === "ArrowDown") {
            goToIndex(currentIndex + 1);
        }

        if (event.key === "ArrowUp") {
            goToIndex(currentIndex - 1);
        }

    });


    /* =====================================================
       PLAY / PAUSE ON CARD CLICK
    ===================================================== */

    document.querySelectorAll(".reel-card").forEach(card => {

        const video = card.querySelector(".reel-video");
        const slide = card.closest(".reel-slide");
        const likeBtn = slide.querySelector(".reel-like-btn");
        const burst = card.querySelector(".reel-like-burst");

        let clickTimer = null;
        let lastClickTime = 0;

        function togglePlayPause() {

            if (video.paused) {

                video.play().catch(() => {});
                slide.classList.remove("is-paused");
                delete slide.dataset.userPaused;

            } else {

                video.pause();
                slide.classList.add("is-paused");
                slide.dataset.userPaused = "true";

            }

        }

        function likeFromDoubleTap() {

            if (likeBtn && !likeBtn.classList.contains("is-liked")) {

                likeBtn.classList.add("is-liked");

                const countEl = likeBtn.querySelector(".reel-action-count");

                if (countEl) {
                    const base = parseFloat(countEl.dataset.base);
                    countEl.textContent = formatCount(base + 1);
                }

            }

            if (likeBtn) {

                likeBtn.classList.remove("pop");
                void likeBtn.offsetWidth;
                likeBtn.classList.add("pop");

            }

            if (burst) {

                burst.classList.remove("burst");
                void burst.offsetWidth;
                burst.classList.add("burst");

            }

        }

        card.addEventListener("click", () => {

            const now = Date.now();
            const delta = now - lastClickTime;

            if (delta > 0 && delta < 300) {

                window.clearTimeout(clickTimer);
                lastClickTime = 0;
                likeFromDoubleTap();
                return;

            }

            lastClickTime = now;

            clickTimer = window.setTimeout(() => {
                togglePlayPause();
            }, 260);

        });

    });


    /* =====================================================
       MUTE BUTTON
    ===================================================== */

    document.querySelectorAll(".reel-mute-btn").forEach(button => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            const video =
                button.closest(".reel-card").querySelector(".reel-video");

            video.muted = !video.muted;

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

        });

    });


    /* =====================================================
       LIKE BUTTON
    ===================================================== */

    document.querySelectorAll(".reel-like-btn").forEach(button => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            button.classList.toggle("is-liked");

            button.classList.remove("pop");
            void button.offsetWidth;
            button.classList.add("pop");

            const countEl = button.querySelector(".reel-action-count");

            if (countEl) {

                const base = parseFloat(countEl.dataset.base);
                const liked = button.classList.contains("is-liked");

                countEl.textContent = formatCount(liked ? base + 1 : base);

            }

        });

    });


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    document.querySelectorAll(".reel-save-btn").forEach(button => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            button.classList.toggle("is-saved");

            showToast(
                button.classList.contains("is-saved")
                    ? "Saved"
                    : "Removed from saved"
            );

        });

    });


    /* =====================================================
       SHARE BUTTON
    ===================================================== */

    document.querySelectorAll(".reel-share-btn").forEach(button => {

        button.addEventListener("click", async (event) => {

            event.stopPropagation();

            if (navigator.share) {

                try {

                    await navigator.share({
                        title: "Twigg",
                        text: "Check out this reel on Twigg."
                    });

                } catch (error) {

                    /* user closed the share menu */

                }

            } else {

                try {

                    await navigator.clipboard.writeText(window.location.href);
                    showToast("Link copied!");

                } catch (error) {

                    showToast("Share is not supported in this browser.");

                }

            }

        });

    });


    /* =====================================================
       REPORT BUTTON
    ===================================================== */

    document.querySelectorAll(".reel-report-btn").forEach(button => {

        button.addEventListener("click", (event) => {

            event.stopPropagation();

            if (button.classList.contains("is-reported")) {
                return;
            }

            button.classList.add("is-reported");
            showToast("Reported. Thanks for letting us know.");

        });

    });


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimeout;

    function showToast(message) {

        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add("is-visible");

        window.clearTimeout(toastTimeout);

        toastTimeout = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 1800);

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function formatCount(num) {

        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
        }

        return String(num);

    }


    /* =====================================================
       INIT
    ===================================================== */

    updateNavButtons();
    playCurrentSlide();

});


/* =========================================================
   NAVIGATION ACTIVE STATE (sidebar)
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener("click", function (event) {

            if (this.getAttribute("href") === "#") {

                event.preventDefault();

                document
                    .querySelectorAll(".nav-item")
                    .forEach(nav => {
                        nav.classList.remove("active");
                    });

                this.classList.add("active");

            }

        });

    });