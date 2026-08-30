import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./reels.css";

/* =========================================================
   STATIC DATA
========================================================= */

const STAR_PATH =
    "M12 3.5l2.6 5.4 5.9.7-4.4 4 1.2 5.9L12 16.7l-5.3 2.8 1.2-5.9-4.4-4 5.9-.7z";

const HEART_PATH =
    "M12 20.5s-7.5-4.6-10-9.3C.5 7.8 2.4 4.5 6 4.2c2-.2 3.8.9 6 3.3 2.2-2.4 4-3.5 6-3.3 3.6.3 5.5 3.6 4 7-2.5 4.7-10 9.3-10 9.3z";

const STAR_KEYS = [0, 1, 2, 3, 4];

const REELS = [
    {
        id: "studio-craft",
        orientation: "portrait",
        serviceName: "Studio Craft",
        category: "Packaging Design",
        rating: "4.9",
        reviews: "(1,204 reviews)",
        poster:
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video1.mp4",
        likeBase: 3200,
        initialLikeText: "3,200",
    },
    {
        id: "markwell-studio",
        orientation: "portrait",
        serviceName: "Markwell Studio",
        category: "Logo Design",
        rating: "4.8",
        reviews: "(842 reviews)",
        poster:
            "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video3.mp4",
        likeBase: 2100,
        initialLikeText: "2,100",
    },
    {
        id: "pixel-and-co",
        orientation: "portrait",
        serviceName: "Pixel & Co",
        category: "Web & Mobile Design",
        rating: "5.0",
        reviews: "(2,380 reviews)",
        poster:
            "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video5.mp4",
        likeBase: 5200,
        initialLikeText: "5,200",
    },
    {
        id: "inkwell-press",
        orientation: "portrait",
        serviceName: "Inkwell Press",
        category: "Book Design",
        rating: "4.5",
        reviews: "(94 reviews)",
        poster:
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video1.mp4",
        likeBase: 260,
        initialLikeText: "260",
    },
    {
        id: "reel-intro-studio",
        orientation: "portrait",
        serviceName: "Reel Intro Studio",
        category: "Intro & Outro Videos",
        rating: "4.7",
        reviews: "(445 reviews)",
        poster:
            "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video3.mp4",
        likeBase: 1180,
        initialLikeText: "1,180",
    },
    {
        id: "kinetic-house",
        orientation: "portrait",
        serviceName: "Kinetic House",
        category: "Motion Graphics",
        rating: "4.8",
        reviews: "(990 reviews)",
        poster:
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video5.mp4",
        likeBase: 2650,
        initialLikeText: "2,650",
    },
    {
        id: "studio-nova",
        orientation: "portrait",
        serviceName: "Studio Nova",
        category: "Product Photography",
        rating: "4.9",
        reviews: "(1,875 reviews)",
        poster:
            "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video6.mp4",
        likeBase: 4800,
        initialLikeText: "4,800",
    },
    {
        id: "colorlab-studio",
        orientation: "portrait",
        serviceName: "ColorLab Studio",
        category: "Color Grading",
        rating: "5.0",
        reviews: "(3,040 reviews)",
        poster:
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&h=1422&q=90",
        video: "videos/video2.mp4",
        likeBase: 6100,
        initialLikeText: "6,100",
    },
];

const NAV_ITEMS = [
    {
        id: "home",
        label: "Home",
        icon: (
            <>
                <path d="M3 11L12 4l9 7"></path>
                <path d="M5 10v10h14V10"></path>
            </>
        ),
    },
    {
        id: "reels",
        label: "Reels",
        icon: (
            <>
                <rect x="4" y="4" width="16" height="16" rx="3"></rect>
                <path d="M10 9l5 3-5 3z"></path>
            </>
        ),
    },
    {
        id: "creators",
        label: "Creators",
        icon: (
            <>
                <circle cx="5" cy="8" r="1.8"></circle>
                <path d="M2.2 18.5c.2-2.2 1.3-3.5 3.1-3.5 1.1 0 2 .4 2.6 1.2"></path>
                <circle cx="19" cy="8" r="1.8"></circle>
                <path d="M16.1 16.2c.6-.8 1.5-1.2 2.6-1.2 1.9 0 3 1.3 3.1 3.5"></path>
                <circle cx="12" cy="6.8" r="2.4"></circle>
                <path d="M8.2 19c.2-3 1.6-4.6 3.8-4.6s3.6 1.6 3.8 4.6"></path>
            </>
        ),
    },
    {
        id: "search",
        label: "Search",
        icon: (
            <>
                <circle cx="10.5" cy="10.5" r="6"></circle>
                <path d="M15 15l5 5"></path>
            </>
        ),
    },
    {
        id: "message",
        label: "Message",
        icon: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="3"></rect>
                <path d="M7 9l5 4 5-4"></path>
            </>
        ),
    },
    {
        id: "notification",
        label: "Notification",
        icon: (
            <>
                <path d="M6 17h12l-1.5-3V10a4.5 4.5 0 0 0-9 0v4z"></path>
                <path d="M10 20h4"></path>
            </>
        ),
    },
    {
        id: "create",
        label: "Create",
        icon: (
            <>
                <circle cx="12" cy="12" r="8"></circle>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
            </>
        ),
    },
    {
        id: "account",
        label: "Account",
        icon: (
            <>
                <circle cx="12" cy="8" r="3"></circle>
                <path d="M5 20c1-4 3.5-6 7-6s6 2 7 6"></path>
            </>
        ),
    },
];

/* =========================================================
   HELPERS
========================================================= */

function shuffledIndices(length) {
    const indices = Array.from({ length }, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return indices;
}

function formatCount(num) {
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }

    return String(num);
}

function getLikeDisplayText(reel, ui) {
    if (!ui.touchedLike) {
        return reel.initialLikeText;
    }

    return formatCount(ui.liked ? reel.likeBase + 1 : reel.likeBase);
}

// Restarts a CSS animation on an element by forcing a reflow between
// removing and re-adding the class that triggers it.
function pulseClass(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
}

function createInitialSlideState() {
    return Object.fromEntries(
        REELS.map((reel) => [
            reel.id,
            {
                orientation: reel.orientation,
                muted: true,
                liked: false,
                touchedLike: false,
                saved: false,
                reported: false,
                paused: false,
                userPaused: false,
            },
        ])
    );
}

/* =========================================================
   PRESENTATIONAL SUB-COMPONENTS
========================================================= */

function RatingBlock({ rating, reviews }) {
    return (
        <div className="reel-rating">
            <div className="reel-stars">
                {STAR_KEYS.map((key) => (
                    <svg key={key} viewBox="0 0 24 24">
                        <path d={STAR_PATH}></path>
                    </svg>
                ))}
            </div>
            <span className="reel-rating-value">{rating}</span>
            <span className="reel-review-count">{reviews}</span>
        </div>
    );
}

function ReelSlide({
    reel,
    isActive,
    ui,
    videoRefs,
    progressFillRefs,
    likeButtonRefs,
    burstRefs,
    onCardClick,
    onLoadedMetadata,
    onTimeUpdate,
    onSeeked,
    onMuteClick,
    onLikeClick,
    onSaveClick,
    onShareClick,
    onReportClick,
}) {
    const likeText = getLikeDisplayText(reel, ui);

    return (
        <div
            className={`reel-slide${isActive ? " is-active" : ""}${ui.paused ? " is-paused" : ""
                }`}
            data-orientation={ui.orientation}
        >
            <div className="reel-row">
                <div className="reel-info-outside">
                    <div className="reel-service-name">{reel.serviceName}</div>
                    <div className="reel-category">{reel.category}</div>
                    <RatingBlock rating={reel.rating} reviews={reel.reviews} />
                </div>

                <div className="reel-card" onClick={() => onCardClick(reel.id)}>
                    <video
                        className="reel-video"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={reel.poster}
                        ref={(el) => {
                            videoRefs.current[reel.id] = el;
                        }}
                        onLoadedMetadata={(event) => onLoadedMetadata(reel.id, event)}
                        onTimeUpdate={(event) => onTimeUpdate(reel.id, event)}
                        onSeeked={(event) => onSeeked(reel.id, event)}
                    >
                        <source src={reel.video} type="video/mp4" />
                    </video>

                    <div
                        className="reel-like-burst"
                        ref={(el) => {
                            burstRefs.current[reel.id] = el;
                        }}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d={HEART_PATH}></path>
                        </svg>
                    </div>

                    <div className="reel-info-overlay">
                        <div className="reel-service-name">{reel.serviceName}</div>
                        <div className="reel-category">{reel.category}</div>
                        <RatingBlock rating={reel.rating} reviews={reel.reviews} />
                    </div>

                    <div className="reel-play-indicator">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"></path>
                        </svg>
                    </div>

                    <button
                        className="reel-mute-btn"
                        aria-label="Mute or unmute"
                        onClick={(event) => onMuteClick(reel.id, event)}
                    >
                        {ui.muted ? (
                            <svg viewBox="0 0 24 24">
                                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                <path d="M16 9c1 1 1 5 0 6"></path>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24">
                                <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
                                <path d="M16 8c2 2 2 6 0 8"></path>
                                <path d="M19 5c3 3 3 11 0 14"></path>
                            </svg>
                        )}
                    </button>

                    <div className="reel-progress">
                        <div
                            className="reel-progress-fill"
                            ref={(el) => {
                                progressFillRefs.current[reel.id] = el;
                            }}
                        ></div>
                    </div>
                </div>

                <div className="reel-actions">
                    <button
                        className={`reel-action-btn reel-like-btn${ui.liked ? " is-liked" : ""
                            }`}
                        aria-label="Like"
                        ref={(el) => {
                            likeButtonRefs.current[reel.id] = el;
                        }}
                        onClick={(event) => onLikeClick(reel.id, event)}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d={HEART_PATH}></path>
                        </svg>
                        <span className="reel-action-count" data-base={reel.likeBase}>
                            {likeText}
                        </span>
                    </button>

                    <button
                        className={`reel-action-btn reel-save-btn${ui.saved ? " is-saved" : ""
                            }`}
                        aria-label="Save"
                        onClick={(event) => onSaveClick(reel.id, event)}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M6 4h12v16l-6-4-6 4z"></path>
                        </svg>
                    </button>

                    <button
                        className="reel-action-btn reel-share-btn"
                        aria-label="Share"
                        onClick={onShareClick}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M12 16V4"></path>
                            <path d="M7 9l5-5 5 5"></path>
                            <path d="M5 13v6h14v-6"></path>
                        </svg>
                    </button>

                    <button
                        className={`reel-action-btn reel-report-btn${ui.reported ? " is-reported" : ""
                            }`}
                        aria-label="Report"
                        onClick={(event) => onReportClick(reel.id, event)}
                    >
                        <svg viewBox="0 0 24 24">
                            <path d="M6 3v18"></path>
                            <path d="M6 4h11l-2.5 4L17 12H6"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Reels() {
    // Shuffled once per mount, never re-shuffled on re-render.
    const [order] = useState(() => shuffledIndices(REELS.length));

    // `targetIndex` drives the track position and nav-button state and
    // updates immediately on navigation. `activeIndex` drives which
    // slide shows its metadata/actions and which video plays, and only
    // updates once the slide-change transition finishes (matching the
    // original behavior of not swapping content mid-animation).
    const [targetIndex, setTargetIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [slideState, setSlideState] = useState(createInitialSlideState);
    const [activeNavId, setActiveNavId] = useState("reels");
    const [toast, setToast] = useState({ message: "", visible: false });
    const [feedHeight, setFeedHeight] = useState(0);
    const [instant, setInstant] = useState(true);

    const feedRef = useRef(null);
    const videoRefs = useRef({});
    const progressFillRefs = useRef({});
    const likeButtonRefs = useRef({});
    const burstRefs = useRef({});

    const lockedRef = useRef(false);
    const targetIndexRef = useRef(0);
    const slideStateRef = useRef(slideState);
    const unlockTimeoutRef = useRef(null);
    const toastTimeoutRef = useRef(null);
    const clickTrackerRef = useRef({});

    useEffect(() => {
        targetIndexRef.current = targetIndex;
    }, [targetIndex]);

    useEffect(() => {
        slideStateRef.current = slideState;
    }, [slideState]);

    /* ---------------------------------------------------
       TOAST
    --------------------------------------------------- */

    const showToast = useCallback((message) => {
        setToast({ message, visible: true });
        window.clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = window.setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 1800);
    }, []);

    /* ---------------------------------------------------
       TRACK POSITION / SLIDE STEP
    --------------------------------------------------- */

    useLayoutEffect(() => {
        if (feedRef.current) {
            setFeedHeight(feedRef.current.clientHeight);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setInstant(true);
            if (feedRef.current) {
                setFeedHeight(feedRef.current.clientHeight);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useLayoutEffect(() => {
        if (!instant) return undefined;
        const id = requestAnimationFrame(() => setInstant(false));
        return () => cancelAnimationFrame(id);
    }, [instant, feedHeight]);

    const slideStep = feedHeight * 0.88;

    /* ---------------------------------------------------
       NAVIGATION
    --------------------------------------------------- */

    const finishTransition = useCallback((index) => {
        window.clearTimeout(unlockTimeoutRef.current);
        setActiveIndex(index);
        lockedRef.current = false;
    }, []);

    const goToIndex = useCallback(
        (index) => {
            if (lockedRef.current) return;
            if (index < 0 || index >= order.length) return;
            if (index === targetIndexRef.current) return;

            // Clear the manual-pause state of the slide we're leaving so
            // it autoplays normally the next time it becomes active.
            const outgoingId = REELS[order[targetIndexRef.current]].id;
            setSlideState((prev) => ({
                ...prev,
                [outgoingId]: { ...prev[outgoingId], userPaused: false },
            }));

            lockedRef.current = true;
            setTargetIndex(index);

            window.clearTimeout(unlockTimeoutRef.current);
            unlockTimeoutRef.current = window.setTimeout(
                () => finishTransition(index),
                650
            );
        },
        [order, finishTransition]
    );

    const handleTrackTransitionEnd = (event) => {
        if (event.target !== event.currentTarget) return;
        if (event.propertyName !== "transform") return;
        finishTransition(targetIndexRef.current);
    };

    // Wheel navigation needs a non-passive listener so it can prevent
    // default page scrolling, which React's onWheel cannot reliably do.
    useEffect(() => {
        const feed = feedRef.current;
        if (!feed) return undefined;

        let wheelBlocked = false;
        let resetTimeout;

        const handleWheel = (event) => {
            event.preventDefault();

            if (wheelBlocked || lockedRef.current) return;
            if (Math.abs(event.deltaY) < 20) return;

            wheelBlocked = true;
            goToIndex(targetIndexRef.current + (event.deltaY > 0 ? 1 : -1));

            resetTimeout = window.setTimeout(() => {
                wheelBlocked = false;
            }, 750);
        };

        feed.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            feed.removeEventListener("wheel", handleWheel);
            window.clearTimeout(resetTimeout);
        };
    }, [goToIndex]);

    // Keyboard navigation is global, matching the original behavior of
    // listening on `document` rather than a specific element.
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowDown") {
                goToIndex(targetIndexRef.current + 1);
            }
            if (event.key === "ArrowUp") {
                goToIndex(targetIndexRef.current - 1);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [goToIndex]);

    const touchStartYRef = useRef(0);

    const handleTouchStart = (event) => {
        touchStartYRef.current = event.touches[0].clientY;
    };

    const handleTouchEnd = (event) => {
        const delta = touchStartYRef.current - event.changedTouches[0].clientY;
        if (Math.abs(delta) < 50) return;
        goToIndex(targetIndexRef.current + (delta > 0 ? 1 : -1));
    };

    /* ---------------------------------------------------
       PLAY / PAUSE ACTIVE SLIDE
    --------------------------------------------------- */

    useEffect(() => {
        order.forEach((reelIndex, position) => {
            const id = REELS[reelIndex].id;
            const video = videoRefs.current[id];
            if (!video) return;

            if (position === activeIndex) {
                if (!slideStateRef.current[id]?.userPaused) {
                    video.play().catch(() => {
                        // Autoplay may be blocked by the browser.
                    });
                }
            } else {
                video.pause();
                video.currentTime = 0;

                setSlideState((prev) => {
                    if (!prev[id].paused && !prev[id].userPaused) return prev;
                    return {
                        ...prev,
                        [id]: { ...prev[id], paused: false, userPaused: false },
                    };
                });
            }
        });
    }, [activeIndex, order]);

    /* ---------------------------------------------------
       CARD CLICK: SINGLE = PLAY/PAUSE, DOUBLE = LIKE
    --------------------------------------------------- */

    const togglePlayPause = useCallback((id) => {
        const video = videoRefs.current[id];
        if (!video) return;

        if (video.paused) {
            video
                .play()
                .then(() => {
                    setSlideState((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], paused: false, userPaused: false },
                    }));
                })
                .catch(() => { });
        } else {
            video.pause();
            setSlideState((prev) => ({
                ...prev,
                [id]: { ...prev[id], paused: true, userPaused: true },
            }));
        }
    }, []);

    const likeFromDoubleTap = useCallback((id) => {
        setSlideState((prev) => {
            if (prev[id].liked) return prev;
            return { ...prev, [id]: { ...prev[id], liked: true, touchedLike: true } };
        });
        pulseClass(likeButtonRefs.current[id], "pop");
        pulseClass(burstRefs.current[id], "burst");
    }, []);

    const handleCardClick = useCallback(
        (id) => {
            const tracker =
                clickTrackerRef.current[id] ||
                (clickTrackerRef.current[id] = { timer: null, lastClick: 0 });

            const now = Date.now();
            const delta = now - tracker.lastClick;

            if (delta > 0 && delta < 300) {
                window.clearTimeout(tracker.timer);
                tracker.lastClick = 0;
                likeFromDoubleTap(id);
                return;
            }

            tracker.lastClick = now;
            tracker.timer = window.setTimeout(() => {
                togglePlayPause(id);
            }, 260);
        },
        [likeFromDoubleTap, togglePlayPause]
    );

    /* ---------------------------------------------------
       VIDEO METADATA / PROGRESS
    --------------------------------------------------- */

    const updateProgress = useCallback((id, video) => {
        if (!video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        const fill = progressFillRefs.current[id];
        if (fill) fill.style.width = `${percent}%`;
    }, []);

    const handleLoadedMetadata = useCallback(
        (id, event) => {
            const video = event.currentTarget;

            if (video.videoWidth && video.videoHeight) {
                const orientation =
                    video.videoHeight > video.videoWidth ? "portrait" : "landscape";

                setSlideState((prev) =>
                    prev[id].orientation === orientation
                        ? prev
                        : { ...prev, [id]: { ...prev[id], orientation } }
                );
            }

            updateProgress(id, video);
        },
        [updateProgress]
    );

    const handleTimeUpdate = useCallback(
        (id, event) => updateProgress(id, event.currentTarget),
        [updateProgress]
    );

    const handleSeeked = useCallback(
        (id, event) => updateProgress(id, event.currentTarget),
        [updateProgress]
    );

    /* ---------------------------------------------------
       ACTION BUTTONS
    --------------------------------------------------- */

    const handleMuteClick = useCallback((id, event) => {
        event.stopPropagation();
        const video = videoRefs.current[id];

        setSlideState((prev) => {
            const nextMuted = !prev[id].muted;
            if (video) video.muted = nextMuted;
            return { ...prev, [id]: { ...prev[id], muted: nextMuted } };
        });
    }, []);

    const handleLikeClick = useCallback((id, event) => {
        event.stopPropagation();

        setSlideState((prev) => ({
            ...prev,
            [id]: { ...prev[id], liked: !prev[id].liked, touchedLike: true },
        }));

        pulseClass(likeButtonRefs.current[id], "pop");
    }, []);

    const handleSaveClick = useCallback(
        (id, event) => {
            event.stopPropagation();
            const nextSaved = !slideStateRef.current[id].saved;

            setSlideState((prev) => ({
                ...prev,
                [id]: { ...prev[id], saved: nextSaved },
            }));

            showToast(nextSaved ? "Saved" : "Removed from saved");
        },
        [showToast]
    );

    const handleShareClick = useCallback(
        async (event) => {
            event.stopPropagation();

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: "Twigg",
                        text: "Check out this reel on Twigg.",
                    });
                } catch (error) {
                    // User closed the share menu.
                }
            } else {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showToast("Link copied!");
                } catch (error) {
                    showToast("Share is not supported in this browser.");
                }
            }
        },
        [showToast]
    );

    const handleReportClick = useCallback(
        (id, event) => {
            event.stopPropagation();
            if (slideStateRef.current[id].reported) return;

            setSlideState((prev) => ({
                ...prev,
                [id]: { ...prev[id], reported: true },
            }));

            showToast("Reported. Thanks for letting us know.");
        },
        [showToast]
    );

    /* ---------------------------------------------------
       CLEANUP
    --------------------------------------------------- */

    useEffect(() => {
        return () => {
            window.clearTimeout(unlockTimeoutRef.current);
            window.clearTimeout(toastTimeoutRef.current);
            Object.values(clickTrackerRef.current).forEach((tracker) => {
                window.clearTimeout(tracker.timer);
            });
        };
    }, []);

    /* ---------------------------------------------------
       SIDEBAR NAV
    --------------------------------------------------- */

    const handleNavClick = (id, event) => {
        event.preventDefault();
        setActiveNavId(id);
    };

    return (
        <>
            {/* =========================================================
                 SIDEBAR
            ========================================================= */}

            <aside className="sidebar">
                <div className="logo">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="225 425 630 240"
                        width="100%"
                        height="auto"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <linearGradient
                                id="gradient1"
                                gradientUnits="userSpaceOnUse"
                                x1="217.2762"
                                y1="575.5398"
                                x2="365.8892"
                                y2="438.8525"
                            >
                                <stop offset="0" stopColor="#B90066" />
                                <stop offset="0.5335" stopColor="#FB0838" />
                                <stop offset="1" stopColor="#F6801E" />
                            </linearGradient>

                            <linearGradient
                                id="gradient2"
                                gradientUnits="userSpaceOnUse"
                                x1="246.1549"
                                y1="606.9382"
                                x2="394.7679"
                                y2="470.2509"
                            >
                                <stop offset="0" stopColor="#B90066" />
                                <stop offset="0.5335" stopColor="#FB0838" />
                                <stop offset="1" stopColor="#F6801E" />
                            </linearGradient>

                            <linearGradient
                                id="gradient3"
                                gradientUnits="userSpaceOnUse"
                                x1="290.7614"
                                y1="655.4365"
                                x2="439.3744"
                                y2="518.7493"
                            >
                                <stop offset="0" stopColor="#B90066" />
                                <stop offset="0.5335" stopColor="#FB0838" />
                                <stop offset="1" stopColor="#F6801E" />
                            </linearGradient>
                        </defs>

                        {/* TWIGG WORDMARK */}
                        <g fill="#000000">
                            <path d="M619.3,550.7l-15.8-43.5c-1-2.9-3.8-4.8-6.8-4.8h0c-3.1,0-5.8,1.9-6.8,4.8l-15.8,43.5l-18-48.2H538l28.9,71.8c1.1,2.8,3.8,4.6,6.7,4.6h0.3c3,0,5.7-1.8,6.8-4.6l16-40.9l16,40.9c1.1,2.8,3.8,4.6,6.8,4.6h0.3c3,0,5.6-1.8,6.7-4.6l28.9-71.8h-18.1L619.3,550.7z" />
                            <rect x="662.4" y="502.5" width="17.5" height="76.4" />
                            <path d="M671.1,467.5c-3,0-5.4,1-7.4,3c-2,2-2.9,4.5-2.9,7.5c0,3,1,5.5,2.9,7.5c2,2,4.4,3,7.4,3c3.1,0,5.6-1,7.5-3c1.9-2,2.9-4.5,2.9-7.5c0-3-1-5.5-2.9-7.5C676.7,468.5,674.2,467.5,671.1,467.5z" />
                            <path d="M727.5,500.8c-20.3,0-36.7,16.4-36.7,36.7s16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7c0-6.3-1.6-12.2-4.4-17.4l4.4-2.5V504h-21.9C737.7,502,732.7,500.8,727.5,500.8z M727.5,557.4c-11,0-19.9-8.9-19.9-19.9s8.9-19.9,19.9-19.9c11,0,19.9,8.9,19.9,19.9S738.5,557.4,727.5,557.4z" />
                            <path d="M727.5,597.6c-11,0-19.9-8.9-19.9-19.9h-16.8c0,20.3,16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7h-16.8C747.4,588.7,738.5,597.6,727.5,597.6z" />
                            <path d="M813.6,597.6c-11,0-19.9-8.9-19.9-19.9h-16.8c0,20.3,16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7h-16.8C833.5,588.7,824.6,597.6,813.6,597.6z" />
                            <path d="M850.3,504h-21.9c-4.5-2-9.5-3.1-14.8-3.1c-20.3,0-36.7,16.4-36.7,36.7s16.4,36.7,36.7,36.7c20.3,0,36.7-16.4,36.7-36.7c0-6.3-1.6-12.2-4.4-17.4l4.4-2.5V504z M813.6,557.4c-11,0-19.9-8.9-19.9-19.9s8.9-19.9,19.9-19.9c11,0,19.9,8.9,19.9,19.9S824.6,557.4,813.6,557.4z" />
                            <polygon points="515.4,478 497.9,478 497.9,502.5 484.4,502.5 484.4,518.4 497.9,518.4 497.9,578.8 515.4,578.8 515.4,518.4 528.9,518.4 528.9,502.5 515.4,502.5" />
                        </g>

                        {/* TWIGG SYMBOL */}
                        <path
                            fill="url(#gradient1)"
                            d="M295.2,567.6v-130c-38.4,15.1-65.5,52.5-65.5,96.2c0,27.6,10.8,52.6,28.4,71.2l23.7-13.9C290.1,586.1,295.2,577.2,295.2,567.6z"
                        />
                        <path
                            fill="url(#gradient2)"
                            d="M338,430.6c-9.8-0.5-19.4,0.4-28.5,2.5v27.4c0,9.7,5.2,18.7,13.6,23.5l112.1,64.4c0.6-4.1,0.9-8.3,1-12.5C437.4,480.5,393.5,433.2,338,430.6z"
                        />
                        <path
                            fill="url(#gradient3)"
                            d="M380.8,551.6l-113.2,62.5c3.2,2.6,6.6,5.1,10.2,7.3c15.3,9.7,32.4,14.9,49.6,15.8c6.7,0.4,11.8,6.4,11.1,13c0,0.1,0,0.1,0,0.2c-1.4,7.6-5.2,16.5-5.2,16.5s72.7-33.5,98-100.7L408,552.1C399.7,547.1,389.3,546.9,380.8,551.6z"
                        />
                    </svg>
                </div>

                {/* FILTER & SORT */}
                <button className="filter-button">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        fill="currentColor"
                    >
                        <path d="M6 2L2 6h3v12H2l4 4 4-4H7V6h3L6 2z" />
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
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            href="#"
                            className={`nav-item${activeNavId === item.id ? " active" : ""}`}
                            onClick={(event) => handleNavClick(item.id, event)}
                        >
                            <svg
                                className="nav-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                {item.icon}
                            </svg>
                            <span>{item.label}</span>
                        </a>
                    ))}
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
                    <button
                        className="reel-nav-btn reel-nav-up"
                        aria-label="Previous reel"
                        disabled={targetIndex === 0}
                        onClick={() => goToIndex(targetIndex - 1)}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 15l6-6 6 6"></path>
                        </svg>
                    </button>

                    <button
                        className="reel-nav-btn reel-nav-down"
                        aria-label="Next reel"
                        disabled={targetIndex === order.length - 1}
                        onClick={() => goToIndex(targetIndex + 1)}
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 9l6 6 6-6"></path>
                        </svg>
                    </button>
                </div>
                <div className="line-mask"></div>

                {/* =====================================================
                     REELS FEED
                ===================================================== */}

                <div className="reels-feed" ref={feedRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <div
                        className="reels-track"
                        onTransitionEnd={handleTrackTransitionEnd}
                        style={{
                            transform: `translateY(-${Math.round(targetIndex * slideStep)}px)`,
                            transition: instant ? "none" : undefined,
                        }}
                    >
                        {order.map((reelIndex, position) => {
                            const reel = REELS[reelIndex];
                            const ui = slideState[reel.id];

                            return (
                                <ReelSlide
                                    key={reel.id}
                                    reel={reel}
                                    isActive={position === activeIndex}
                                    ui={ui}
                                    videoRefs={videoRefs}
                                    progressFillRefs={progressFillRefs}
                                    likeButtonRefs={likeButtonRefs}
                                    burstRefs={burstRefs}
                                    onCardClick={handleCardClick}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onTimeUpdate={handleTimeUpdate}
                                    onSeeked={handleSeeked}
                                    onMuteClick={handleMuteClick}
                                    onLikeClick={handleLikeClick}
                                    onSaveClick={handleSaveClick}
                                    onShareClick={handleShareClick}
                                    onReportClick={handleReportClick}
                                />
                            );
                        })}
                    </div>

                    <div className={`reel-toast${toast.visible ? " is-visible" : ""}`}>
                        {toast.message}
                    </div>
                </div>
            </main>
        </>
    );
}