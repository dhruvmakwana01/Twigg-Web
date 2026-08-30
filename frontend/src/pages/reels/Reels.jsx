import { useEffect, useRef } from "react";
import "./reels.css";

export default function Reels() {
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;



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
            `translateY(-${currentIndex * getSlideStep()}px)`;

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

    

        return () => {
            // React removes the DOM when this component unmounts.
        };
    }, []);

    return (
        <>
        
        
            {/* =========================================================
                 SIDEBAR
            ========================================================= */}
        
            <aside className="sidebar">
        
                <div className="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="225 425 630 240" width="100%" height="auto"
                        preserveAspectRatio="xMidYMid meet">
                        <defs>
        
                            <linearGradient id="gradient1" gradientUnits="userSpaceOnUse" x1="217.2762" y1="575.5398"
                                x2="365.8892" y2="438.8525">
                                <stop offset="0" stopColor="#B90066" />
                                <stop offset="0.5335" stopColor="#FB0838" />
                                <stop offset="1" stopColor="#F6801E" />
                            </linearGradient>
        
                            <linearGradient id="gradient2" gradientUnits="userSpaceOnUse" x1="246.1549" y1="606.9382"
                                x2="394.7679" y2="470.2509">
                                <stop offset="0" stopColor="#B90066" />
                                <stop offset="0.5335" stopColor="#FB0838" />
                                <stop offset="1" stopColor="#F6801E" />
                            </linearGradient>
        
                            <linearGradient id="gradient3" gradientUnits="userSpaceOnUse" x1="290.7614" y1="655.4365"
                                x2="439.3744" y2="518.7493">
                                <stop offset="0" stopColor="#B90066" />
                                <stop offset="0.5335" stopColor="#FB0838" />
                                <stop offset="1" stopColor="#F6801E" />
                            </linearGradient>
        
                        </defs>
        
                        {/* TWIGG WORDMARK */}
        
                        <g fill="#000000">
        
                            <path
                                d="M619.3,550.7l-15.8-43.5c-1-2.9-3.8-4.8-6.8-4.8h0c-3.1,0-5.8,1.9-6.8,4.8l-15.8,43.5l-18-48.2H538l28.9,71.8c1.1,2.8,3.8,4.6,6.7,4.6h0.3c3,0,5.7-1.8,6.8-4.6l16-40.9l16,40.9c1.1,2.8,3.8,4.6,6.8,4.6h0.3c3,0,5.6-1.8,6.7-4.6l28.9-71.8h-18.1L619.3,550.7z" />
        
                            <rect x="662.4" y="502.5" width="17.5" height="76.4" />
        
                            <path
                                d="M671.1,467.5c-3,0-5.4,1-7.4,3c-2,2-2.9,4.5-2.9,7.5c0,3,1,5.5,2.9,7.5c2,2,4.4,3,7.4,3c3.1,0,5.6-1,7.5-3c1.9-2,2.9-4.5,2.9-7.5c0-3-1-5.5-2.9-7.5C676.7,468.5,674.2,467.5,671.1,467.5z" />
        
                            <path
                                d="M727.5,500.8c-20.3,0-36.7,16.4-36.7,36.7s16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7c0-6.3-1.6-12.2-4.4-17.4l4.4-2.5V504h-21.9C737.7,502,732.7,500.8,727.5,500.8z M727.5,557.4c-11,0-19.9-8.9-19.9-19.9s8.9-19.9,19.9-19.9c11,0,19.9,8.9,19.9,19.9S738.5,557.4,727.5,557.4z" />
        
                            <path
                                d="M727.5,597.6c-11,0-19.9-8.9-19.9-19.9h-16.8c0,20.3,16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7h-16.8C747.4,588.7,738.5,597.6,727.5,597.6z" />
        
                            <path
                                d="M813.6,597.6c-11,0-19.9-8.9-19.9-19.9h-16.8c0,20.3,16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7h-16.8C833.5,588.7,824.6,597.6,813.6,597.6z" />
        
                            <path
                                d="M850.3,504h-21.9c-4.5-2-9.5-3.1-14.8-3.1c-20.3,0-36.7,16.4-36.7,36.7s16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7c0-6.3-1.6-12.2-4.4-17.4l4.4-2.5V504z M813.6,557.4c-11,0-19.9-8.9-19.9-19.9s8.9-19.9,19.9-19.9c11,0,19.9,8.9,19.9,19.9S824.6,557.4,813.6,557.4z" />
        
                            <polygon
                                points="515.4,478 497.9,478 497.9,502.5 484.4,502.5 484.4,518.4 497.9,518.4 497.9,578.8 515.4,578.8 515.4,518.4 528.9,518.4 528.9,502.5 515.4,502.5" />
        
                        </g>
        
        
                        {/* TWIGG SYMBOL */}
        
                        <path fill="url(#gradient1)"
                            d="M295.2,567.6v-130c-38.4,15.1-65.5,52.5-65.5,96.2c0,27.6,10.8,52.6,28.4,71.2l23.7-13.9C290.1,586.1,295.2,577.2,295.2,567.6z" />
        
                        <path fill="url(#gradient2)"
                            d="M338,430.6c-9.8-0.5-19.4,0.4-28.5,2.5v27.4c0,9.7,5.2,18.7,13.6,23.5l112.1,64.4c0.6-4.1,0.9-8.3,1-12.5C437.4,480.5,393.5,433.2,338,430.6z" />
        
                        <path fill="url(#gradient3)"
                            d="M380.8,551.6l-113.2,62.5c3.2,2.6,6.6,5.1,10.2,7.3c15.3,9.7,32.4,14.9,49.6,15.8c6.7,0.4,11.8,6.4,11.1,13c0,0.1,0,0.1,0,0.2c-1.4,7.6-5.2,16.5-5.2,16.5s72.7-33.5,98-100.7L408,552.1C399.7,547.1,389.3,546.9,380.8,551.6z" />
        
                    </svg>
                </div>
        
                {/* FILTER & SORT */}
                <button className="filter-button">
        
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        {/* Vertical double-ended arrow */}
                        <path d="M6 2L2 6h3v12H2l4 4 4-4H7V6h3L6 2z" />
                        {/* Four descending horizontal bars */}
                        <rect x="12" y="4" width="10" height="3" rx="1.5" />
                        <rect x="12" y="9" width="8" height="3" rx="1.5" />
                        <rect x="12" y="14" width="6" height="3" rx="1.5" />
                        <rect x="12" y="19" width="4" height="3" rx="1.5" />
                    </svg>
        
                    <span>Filter &amp; Sort</span>
        
                </button>
        
        
                {/* =====================================================
                     NAVIGATION
                ===================================================== */}
        
                <nav className="navigation">
        
                    {/* HOME */}
                    <a href="home.html" className="nav-item">
        
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"
                            strokeLinejoin="round">
        
                            <path d="M3 11L12 4l9 7"></path>
                            <path d="M5 10v10h14V10"></path>
        
                        </svg>
        
                        <span>Home</span>
        
                    </a>
        
        
                    {/* REELS */}
                    <a href="reels.html" className="nav-item active">
        
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"
                            strokeLinejoin="round">
        
                            <rect x="4" y="4" width="16" height="16" rx="3">
                            </rect>
        
                            <path d="M10 9l5 3-5 3z"></path>
        
                        </svg>
        
                        <span>Reels</span>
        
                    </a>
        
        
                    {/* CREATORS */}
                   <a href="#" className="nav-item">
        
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                {/* Left person */}
                <circle cx="5" cy="8" r="1.8"></circle>
                <path d="M2.2 18.5c.2-2.2 1.3-3.5 3.1-3.5 1.1 0 2 .4 2.6 1.2"></path>
        
                {/* Right person */}
                <circle cx="19" cy="8" r="1.8"></circle>
                <path d="M16.1 16.2c.6-.8 1.5-1.2 2.6-1.2 1.9 0 3 1.3 3.1 3.5"></path>
        
                {/* Center person */}
                <circle cx="12" cy="6.8" r="2.4"></circle>
                <path d="M8.2 19c.2-3 1.6-4.6 3.8-4.6s3.6 1.6 3.8 4.6"></path>
            </svg>
        
            <span>Creators</span>
        
        </a>
        
        
                    {/* SEARCH */}
                    <a href="#" className="nav-item">
        
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
        
                            <circle cx="10.5" cy="10.5" r="6">
                            </circle>
        
                            <path d="M15 15l5 5"></path>
        
                        </svg>
        
                        <span>Search</span>
        
                    </a>
        
        
                    {/* MESSAGE */}
                    <a href="#" className="nav-item">
        
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"
                            strokeLinejoin="round">
        
                            <rect x="3" y="5" width="18" height="14" rx="3">
                            </rect>
        
                            <path d="M7 9l5 4 5-4"></path>
        
                        </svg>
        
                        <span>Message</span>
        
                    </a>
        
        
                    {/* NOTIFICATION */}
                    <a href="#" className="nav-item">
        
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"
                            strokeLinejoin="round">
        
                            <path d="M6 17h12l-1.5-3V10a4.5 4.5 0 0 0-9 0v4z"></path>
                            <path d="M10 20h4"></path>
        
                        </svg>
        
                        <span>Notification</span>
        
                    </a>
        
        
                    {/* Create */}
                    <a href="#" className="nav-item">
        
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
        
                            <circle cx="12" cy="12" r="8">
                            </circle>
        
                            <path d="M12 8v8"></path>
                            <path d="M8 12h8"></path>
        
                        </svg>
        
                        <span>Create</span>
        
                    </a>
        
        
                    {/* ACCOUNT */}
                    <a href="#" className="nav-item">
        
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round"
                            strokeLinejoin="round">
        
                            <circle cx="12" cy="8" r="3">
                            </circle>
        
                            <path d="M5 20c1-4 3.5-6 7-6s6 2 7 6"></path>
        
                        </svg>
        
                        <span>Account</span>
        
                    </a>
        
                </nav>
        
            </aside>
        
        
            {/* =========================================================
                 MAIN
            ========================================================= */}
        
            <main className="main">
        
                {/* =====================================================
                     UP / DOWN NAVIGATION
                ===================================================== */}
        
                <div className="reel-nav-controls">
        
                    <button className="reel-nav-btn reel-nav-up" aria-label="Previous reel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M6 15l6-6 6 6"></path>
                        </svg>
                    </button>
        
                    <button className="reel-nav-btn reel-nav-down" aria-label="Next reel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                            strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6"></path>
                        </svg>
                    </button>
        
                </div>
        
        
                {/* =====================================================
                     REELS FEED
                ===================================================== */}
        
                <div className="reels-feed">
        
                    <div className="reels-track">
        
                        {/* REEL 01 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">Studio Craft</div>
                                    <div className="reel-category">Packaging Design</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">4.9</span>
                                        <span className="reel-review-count">(1,204 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video1.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">Studio Craft</div>
                                        <div className="reel-category">Packaging Design</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">4.9</span>
                                            <span className="reel-review-count">(1,204 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="3200">3,200</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>
        
                        {/* REEL 02 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">Markwell Studio</div>
                                    <div className="reel-category">Logo Design</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">4.8</span>
                                        <span className="reel-review-count">(842 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video3.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">Markwell Studio</div>
                                        <div className="reel-category">Logo Design</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">4.8</span>
                                            <span className="reel-review-count">(842 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="2100">2,100</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>
        
                        {/* REEL 03 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">Pixel & Co</div>
                                    <div className="reel-category">Web & Mobile Design</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">5.0</span>
                                        <span className="reel-review-count">(2,380 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video5.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">Pixel & Co</div>
                                        <div className="reel-category">Web & Mobile Design</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">5.0</span>
                                            <span className="reel-review-count">(2,380 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="5200">5,200</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>
        
                        {/* REEL 04 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">Inkwell Press</div>
                                    <div className="reel-category">Book Design</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">4.5</span>
                                        <span className="reel-review-count">(94 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video1.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">Inkwell Press</div>
                                        <div className="reel-category">Book Design</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">4.5</span>
                                            <span className="reel-review-count">(94 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="260">260</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>
        
                        {/* REEL 05 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">Reel Intro Studio</div>
                                    <div className="reel-category">Intro & Outro Videos</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">4.7</span>
                                        <span className="reel-review-count">(445 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video3.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">Reel Intro Studio</div>
                                        <div className="reel-category">Intro & Outro Videos</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">4.7</span>
                                            <span className="reel-review-count">(445 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="1180">1,180</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>
        
                        {/* REEL 06 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">Kinetic House</div>
                                    <div className="reel-category">Motion Graphics</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">4.8</span>
                                        <span className="reel-review-count">(990 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video5.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">Kinetic House</div>
                                        <div className="reel-category">Motion Graphics</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">4.8</span>
                                            <span className="reel-review-count">(990 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="2650">2,650</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>
        
                        {/* REEL 07 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">Studio Nova</div>
                                    <div className="reel-category">Product Photography</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">4.9</span>
                                        <span className="reel-review-count">(1,875 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video6.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">Studio Nova</div>
                                        <div className="reel-category">Product Photography</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">4.9</span>
                                            <span className="reel-review-count">(1,875 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="4800">4,800</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>
        
                        {/* REEL 08 — PORTRAIT */}
        
                        <div className="reel-slide" data-orientation="portrait">
        
                            <div className="reel-row">
        
                                <div className="reel-info-outside">
                                    <div className="reel-service-name">ColorLab Studio</div>
                                    <div className="reel-category">Color Grading</div>
                                    <div className="reel-rating">
                                        <div className="reel-stars">
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                </path>
                                            </svg>
                                        </div>
                                        <span className="reel-rating-value">5.0</span>
                                        <span className="reel-review-count">(3,040 reviews)</span>
                                    </div>
                                </div>
        
                                <div className="reel-card">
        
                                    <video className="reel-video" muted loop playsinline preload="metadata"
                                        poster="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&h=1422&q=90">
        
                                        <source src="videos/video2.mp4" type="video/mp4" />
        
                                    </video>
        
                                    <div className="reel-like-burst">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                    </div>
        
                                    <div className="reel-info-overlay">
                                        <div className="reel-service-name">ColorLab Studio</div>
                                        <div className="reel-category">Color Grading</div>
                                        <div className="reel-rating">
                                            <div className="reel-stars">
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                                <svg viewBox="0 0 24 24">
                                                    <path
                                                        d="M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z">
                                                    </path>
                                                </svg>
                                            </div>
                                            <span className="reel-rating-value">5.0</span>
                                            <span className="reel-review-count">(3,040 reviews)</span>
                                        </div>
                                    </div>
        
                                    <div className="reel-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z"></path>
                                        </svg>
                                    </div>
        
                                    <button className="reel-mute-btn" aria-label="Mute or unmute">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                            <path d="M16 9c1 1 1 5 0 6"></path>
                                        </svg>
                                    </button>
        
                                    <div className="reel-progress">
                                        <div className="reel-progress-fill"></div>
                                    </div>
        
                                </div>
        
                                <div className="reel-actions">
        
                                    <button className="reel-action-btn reel-like-btn" aria-label="Like">
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z">
                                            </path>
                                        </svg>
                                        <span className="reel-action-count" data-base="6100">6,100</span>
                                    </button>
        
                                    <button className="reel-action-btn reel-save-btn" aria-label="Save">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-share-btn" aria-label="Share">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M12 16V4"></path>
                                            <path d="M7 9l5-5 5 5"></path>
                                            <path d="M5 13v6h14v-6"></path>
                                        </svg>
                                    </button>
        
                                    <button className="reel-action-btn reel-report-btn" aria-label="Report">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M6 3v18"></path>
                                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                                        </svg>
                                    </button>
        
                                </div>
        
                            </div>
        
                        </div>

                    </div>

                </div>
        
            </main>
        
        </>
    );
}
