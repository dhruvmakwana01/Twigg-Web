/* =========================================================
   TWIGG HOME — JAVASCRIPT
========================================================= */


/* =========================================================
   PAGE STATE
========================================================= */

const HOME_ORDER_KEY = "twigg_home_order";
const HOME_SCROLL_KEY = "twigg_home_scroll";

const REELS_ORDER_KEY = "twigg_reels_order";
const REELS_STATE_KEY = "twigg_reels_state";

const HOME_RATIO_KEY = "twigg_home_ratios";

/* Mute choice shared by the Home, Reels and Loop pages */
const MUTE_KEY = "twigg_shared_muted";

/* LOOP PAGE: where the user left off (featured card + grid order + scroll) */
const LOOP_STATE_KEY = "twigg_loop_state";

/* Per-Loop-page positions (each Loop page remembers its own scroll) */
const LOOP_ENTRIES_KEY = "twigg_loop_entries";


/* Shared mute state for all Home videos. true = start muted */

let sharedVideoMuted = true;


/* Disable the browser's automatic scroll restoration. */

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}


const navigationEntry =
    performance.getEntriesByType("navigation")[0];

const isHomeReload =
    navigationEntry &&
    navigationEntry.type === "reload";


/* A real browser refresh creates a completely fresh feed. */

if (isHomeReload) {

    sessionStorage.removeItem(HOME_ORDER_KEY);
    sessionStorage.removeItem(HOME_SCROLL_KEY);
    sessionStorage.removeItem(REELS_ORDER_KEY);
    sessionStorage.removeItem(REELS_STATE_KEY);
    sessionStorage.removeItem(HOME_RATIO_KEY);
    sessionStorage.removeItem(MUTE_KEY);
    sessionStorage.removeItem(LOOP_STATE_KEY);
    sessionStorage.removeItem(LOOP_ENTRIES_KEY);
}


/* Start with the mute choice made on any other page
   (Reels / Loop). Default: muted. */

try {
    sharedVideoMuted =
        sessionStorage.getItem(MUTE_KEY) !== "false";
} catch {
    sharedVideoMuted = true;
}


/* =========================================================
   HOME ↔ LOOP SYNC

   If the user has a saved Loop position, Home sends them
   straight back to it (Home → Loop → other page → Home).
========================================================= */

let redirectingToLoop = false;

if (!isHomeReload) {

    let hasLoopState = false;

    try {
        hasLoopState =
            sessionStorage.getItem(LOOP_STATE_KEY) !== null;
    } catch {
        hasLoopState = false;
    }

    const isBackForward =
        navigationEntry &&
        navigationEntry.type === "back_forward";

    if (hasLoopState && !isBackForward) {

        redirectingToLoop = true;

        document.documentElement.style.visibility = "hidden";

        window.location.replace("../loop/loop.html?restore=1");

    } else if (hasLoopState) {

        try {
            sessionStorage.removeItem(LOOP_STATE_KEY);
        } catch { }
    }
}


/*
   Cached media aspect ratios (keyed by media id) so the page
   is tall enough to restore the exact scroll position early.
*/

let homeRatios = {};

try {
    homeRatios = JSON.parse(
        sessionStorage.getItem(HOME_RATIO_KEY) || "{}"
    ) || {};
} catch {
    homeRatios = {};
}


/* =========================================================
   ICONS
========================================================= */

const ICONS = {

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
    `,

    saved: `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h12v16l-6-4-6 4z"></path>
        </svg>
    `,

    unsaved: `
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
    `
};


/* =========================================================
   MUTE HELPERS
========================================================= */

function refreshHomeMuteIcons() {

    const icon =
        sharedVideoMuted
            ? ICONS.muted
            : ICONS.unmuted;

    document
        .querySelectorAll(".media-card .unmute-button")
        .forEach(button => {
            button.innerHTML = icon;
        });
}


/*
   Plays a video. If the browser blocks playback WITH sound
   (autoplay policy), the video falls back to muted, the
   shared setting becomes muted and the icons are refreshed.
*/

function safeHomePlay(video) {

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

                refreshHomeMuteIcons();

                video.play().catch(() => { });
            }
        });
    }
}


/* =========================================================
   RENDER HOME CARDS FROM THE SHARED MEDIA DATA
========================================================= */

const homeGrid =
    document.querySelector(".pinterest-grid");

const homeFeed =
    window.TwiggMedia
        ? window.TwiggMedia.getFeed("home")
        : [];


function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}


function buildHomeCard(item) {

    const isVideo =
        item.type === "video";

    const media =
        isVideo
            ? `
                <video muted loop playsinline preload="auto"${item.thumbnail ? ` poster="${escapeHtml(item.thumbnail)}"` : ""}>
                    <source src="${escapeHtml(item.src)}" type="video/mp4">
                </video>
            `
            : `
                <img src="${escapeHtml(item.src)}"
                    alt="${escapeHtml(item.title)}" loading="lazy">
            `;

    return `
        <article class="media-card"
            data-media-id="${item.id}"
            data-profile-name="${escapeHtml(item.creator.name)}"
            ${item.creator.profileImage ? `data-profile-image="${escapeHtml(item.creator.profileImage)}"` : ""}>

            ${media}

            <div class="media-actions">

                ${isVideo ? `
                    <button class="action-button unmute-button" type="button" aria-label="Unmute video">
                        ${ICONS.muted}
                    </button>
                ` : ""}

                <button class="action-button save-button" type="button" aria-label="Save">
                    ${ICONS.unsaved}
                </button>

                <button class="action-button share-button" type="button" aria-label="Share">
                    ${ICONS.share}
                </button>

            </div>

        </article>
    `;
}


if (homeGrid) {

    homeGrid.innerHTML =
        homeFeed.map(buildHomeCard).join("");
}


/* =========================================================
   PINTEREST GRID
   FAIR ORDER + RESTORE
========================================================= */

const grid = homeGrid;


if (grid) {

    const cards =
        Array.from(grid.querySelectorAll(".media-card"));


    /* Remember each card's original index (position in the Home feed) */

    cards.forEach((card, index) => {
        card.dataset.homeIndex = String(index);
    });


    let savedOrder = null;


    try {

        const storedOrder =
            sessionStorage.getItem(HOME_ORDER_KEY);

        if (storedOrder) {

            const parsed = JSON.parse(storedOrder);

            if (
                Array.isArray(parsed) &&
                parsed.length === cards.length &&
                new Set(parsed).size === cards.length &&
                parsed.every(
                    index =>
                        Number.isInteger(index) &&
                        index >= 0 &&
                        index < cards.length
                )
            ) {
                savedOrder = parsed;
            }
        }

    } catch {
        savedOrder = null;
    }


    /*
       No saved order → build a FAIR order: the items that
       have had the least visibility so far get the best
       positions (see TwiggMedia.fairOrder in media-data.js).
       A saved order (coming back from another page) is reused
       as-is and does NOT count as new exposure.
    */

    if (!savedOrder) {

        const ids =
            cards.map(card => Number(card.dataset.mediaId));

        const fairIds =
            window.TwiggMedia
                ? window.TwiggMedia.fairOrder(
                    ids,
                    { columns: window.TwiggMedia.columns() }
                )
                : ids;

        savedOrder =
            fairIds.map(id => ids.indexOf(id));

        try {
            sessionStorage.setItem(
                HOME_ORDER_KEY,
                JSON.stringify(savedOrder)
            );
        } catch { }
    }


    /* Apply the saved order immediately. */

    savedOrder.forEach(index => {
        grid.appendChild(cards[index]);
    });


    /* Apply cached aspect ratios immediately. */

    cards.forEach(card => {

        const ratio =
            homeRatios[card.dataset.mediaId];

        if (ratio) {
            card.style.setProperty(
                "--media-ratio",
                String(ratio)
            );
        }
    });
}


/* =========================================================
   RESTORE HOME SCROLL
========================================================= */

let savedHomeScroll = null;


if (!isHomeReload && !redirectingToLoop) {

    let storedScroll = null;

    try {
        storedScroll =
            sessionStorage.getItem(HOME_SCROLL_KEY);
    } catch {
        storedScroll = null;
    }

    if (storedScroll !== null) {

        const parsedScroll = Number(storedScroll);

        if (
            Number.isFinite(parsedScroll) &&
            parsedScroll >= 0
        ) {
            savedHomeScroll = parsedScroll;
        }
    }
}


/* Find the element that actually scrolls the Home page. */

function findHomeScroller() {

    const doc =
        document.scrollingElement ||
        document.documentElement;

    const isScrollableStyle = el => {

        const overflowY = getComputedStyle(el).overflowY;

        return (
            overflowY === "auto" ||
            overflowY === "scroll" ||
            overflowY === "overlay"
        );
    };

    if (doc.scrollHeight > doc.clientHeight + 1) {
        return doc;
    }

    let el = grid ? grid.parentElement : null;

    while (el && el !== document.documentElement) {

        if (
            el === document.body &&
            getComputedStyle(document.documentElement).overflowY === "visible"
        ) {
            break;
        }

        if (isScrollableStyle(el)) {
            return el;
        }

        el = el.parentElement;
    }

    return doc;
}


const homeScroller = findHomeScroller();

const homeScrollerIsDocument =
    homeScroller === document.scrollingElement ||
    homeScroller === document.documentElement ||
    homeScroller === document.body;


function getScrollY() {

    return homeScrollerIsDocument
        ? window.scrollY
        : homeScroller.scrollTop;
}


function jumpToScroll(y) {

    const target =
        homeScrollerIsDocument
            ? document.documentElement
            : homeScroller;

    const previous = target.style.scrollBehavior;

    target.style.scrollBehavior = "auto";

    if (homeScrollerIsDocument) {
        window.scrollTo(0, y);
    } else {
        homeScroller.scrollTop = y;
    }

    target.style.scrollBehavior = previous;
}


/* While true, scroll events from the restoration must NOT overwrite the saved value. */

let homeRestoring = false;


if (savedHomeScroll !== null) {

    jumpToScroll(savedHomeScroll);

    const reached = () =>
        Math.abs(getScrollY() - savedHomeScroll) <= 2;

    if (!reached()) {

        homeRestoring = true;

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

            homeRestoring = false;

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

            jumpToScroll(savedHomeScroll);

            root.style.visibility = "";

            if (reached()) {
                stopRestoring();
            }
        };

        const attempt = () => {

            jumpToScroll(savedHomeScroll);

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


/* =========================================================
   SAVE HOME POSITION
========================================================= */

function saveHomeState() {

    if (homeRestoring || redirectingToLoop) {
        return;
    }

    try {
        sessionStorage.setItem(
            HOME_SCROLL_KEY,
            String(getScrollY())
        );
    } catch { }
}


window.addEventListener("pagehide", saveHomeState);


document.addEventListener("visibilitychange", () => {

    if (document.visibilityState === "hidden") {
        saveHomeState();
    }
});


document
    .querySelectorAll(".nav-item")
    .forEach(item => {
        item.addEventListener("click", () => {
            saveHomeState();
        });
    });


let homeScrollSaveTimeout = null;


window.addEventListener(
    "scroll",
    () => {

        clearTimeout(homeScrollSaveTimeout);

        homeScrollSaveTimeout =
            setTimeout(() => {
                saveHomeState();
            }, 50);
    },
    {
        passive: true,
        capture: true
    }
);


/* =========================================================
   MEDIA ASPECT RATIO
========================================================= */

function setMediaAspectRatio(card, width, height) {

    if (!width || !height) {
        return;
    }

    const ratio = width / height;

    if (!Number.isFinite(ratio) || ratio <= 0) {
        return;
    }

    card.style.setProperty("--media-ratio", `${ratio}`);

    /* Cache by media id so it is applied instantly on revisit. */

    if (card.dataset.mediaId !== undefined) {

        homeRatios[card.dataset.mediaId] = ratio;

        try {
            sessionStorage.setItem(
                HOME_RATIO_KEY,
                JSON.stringify(homeRatios)
            );
        } catch { }
    }
}


/* =========================================================
   IMAGE ASPECT RATIO
========================================================= */

function setupImageAspectRatio(card, image) {

    const updateRatio = () => {
        setMediaAspectRatio(
            card,
            image.naturalWidth,
            image.naturalHeight
        );
    };

    if (image.complete) {
        updateRatio();
    } else {
        image.addEventListener("load", updateRatio, { once: true });
    }

    image.addEventListener(
        "error",
        () => {
            card.style.removeProperty("--media-ratio");
        },
        { once: true }
    );
}


/* =========================================================
   VIDEO THUMBNAIL + ASPECT RATIO
========================================================= */

function setupVideoAspectRatio(card, video) {

    /*
       The first available video frame is captured and
       stored as the video's poster (unless the shared data
       already provides a thumbnail).
    */

    const generateVideoThumbnail = () => {

        if (!video.videoWidth || !video.videoHeight) {
            return;
        }

        setMediaAspectRatio(
            card,
            video.videoWidth,
            video.videoHeight
        );

        if (video.poster) {
            return;
        }

        try {

            const canvas = document.createElement("canvas");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                return;
            }

            const captureFrame = () => {

                try {

                    context.drawImage(
                        video,
                        0,
                        0,
                        video.videoWidth,
                        video.videoHeight
                    );

                    video.poster =
                        canvas.toDataURL("image/jpeg", 0.88);

                } catch {
                    /* Canvas extraction may be blocked. */
                }
            };

            if (Math.abs(video.currentTime) < 0.01) {
                captureFrame();
                return;
            }

            video.addEventListener(
                "seeked",
                captureFrame,
                { once: true }
            );

            video.currentTime = 0;

        } catch {
            /* Thumbnail generation is optional. */
        }
    };

    const updateRatio = () => {
        setMediaAspectRatio(
            card,
            video.videoWidth,
            video.videoHeight
        );
    };

    video.addEventListener("loadedmetadata", updateRatio);

    video.addEventListener(
        "loadeddata",
        generateVideoThumbnail,
        { once: true }
    );

    if (video.readyState >= 1) {
        updateRatio();
    }

    if (video.readyState >= 2) {
        generateVideoThumbnail();
    }

    video.load();
}


/* =========================================================
   INITIALIZE MEDIA ASPECT RATIOS
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        const image = card.querySelector("img");
        const video = card.querySelector("video");

        if (image) {
            setupImageAspectRatio(card, image);
        }

        if (video) {
            setupVideoAspectRatio(card, video);
        }
    });


/* =========================================================
   VIDEO CONTROLS
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        const video = card.querySelector("video");

        const muteButton = card.querySelector(".unmute-button");

        if (!video) {
            return;
        }


        /* ----- VIDEO DURATION BADGE (replaces the old video icon) ----- */

        let videoIndicator = card.querySelector(".video-indicator");

        if (!videoIndicator) {

            videoIndicator = document.createElement("div");

            videoIndicator.className = "video-indicator";

            card.appendChild(videoIndicator);
        }

        const showDuration = () => {

            const text =
                window.TwiggMedia
                    ? window.TwiggMedia.formatDuration(video.duration)
                    : "";

            if (text) {
                videoIndicator.textContent = text;
                videoIndicator.classList.add("has-duration");
            }
        };

        video.addEventListener("loadedmetadata", showDuration);
        video.addEventListener("durationchange", showDuration);

        showDuration();


        video.muted = sharedVideoMuted;


        if (muteButton) {

            muteButton.innerHTML =
                sharedVideoMuted
                    ? ICONS.muted
                    : ICONS.unmuted;
        }


        /* ----- HOVER AUTOPLAY ----- */

        card.addEventListener("mouseenter", () => {

            if (videoIndicator) {
                videoIndicator.classList.add("hidden");
            }

            video.muted = sharedVideoMuted;

            /* Only the hovered video may have audio. */

            document
                .querySelectorAll(".media-card video")
                .forEach(otherVideo => {
                    if (otherVideo !== video) {
                        otherVideo.muted = true;
                    }
                });

            if (muteButton) {
                muteButton.innerHTML =
                    video.muted
                        ? ICONS.muted
                        : ICONS.unmuted;
            }

            safeHomePlay(video);
        });


        /* ----- HOVER END ----- */

        card.addEventListener("mouseleave", () => {

            if (videoIndicator) {
                videoIndicator.classList.remove("hidden");
            }

            video.pause();

            video.currentTime = 0;

            video.muted = true;

            if (muteButton) {
                muteButton.innerHTML =
                    sharedVideoMuted
                        ? ICONS.muted
                        : ICONS.unmuted;
            }
        });


        /* ----- MUTE / UNMUTE ----- */

        if (muteButton) {

            muteButton.addEventListener("click", event => {

                event.stopPropagation();

                sharedVideoMuted = !sharedVideoMuted;

                /* Remember the choice for the Reels and Loop pages. */

                try {
                    sessionStorage.setItem(
                        MUTE_KEY,
                        String(sharedVideoMuted)
                    );
                } catch { }

                document
                    .querySelectorAll(".media-card video")
                    .forEach(otherVideo => {
                        otherVideo.muted =
                            sharedVideoMuted ||
                            otherVideo !== video;
                    });

                document
                    .querySelectorAll(".media-card")
                    .forEach(otherCard => {

                        const otherVideo =
                            otherCard.querySelector("video");

                        const otherMuteButton =
                            otherCard.querySelector(".unmute-button");

                        if (otherVideo && otherMuteButton) {
                            otherMuteButton.innerHTML =
                                sharedVideoMuted
                                    ? ICONS.muted
                                    : ICONS.unmuted;
                        }
                    });

                if (!sharedVideoMuted) {
                    safeHomePlay(video);
                }
            });
        }
    });


/* =========================================================
   SAVE
========================================================= */

document
    .querySelectorAll(".save-button")
    .forEach(button => {

        button.classList.remove("saved");

        button.innerHTML = ICONS.unsaved;

        button.style.display = "flex";
        button.style.alignItems = "center";
        button.style.justifyContent = "center";

        button.addEventListener("click", event => {

            event.stopPropagation();

            const isSaved = button.classList.toggle("saved");

            button.innerHTML =
                isSaved
                    ? ICONS.saved
                    : ICONS.unsaved;
        });
    });


/* =========================================================
   SHARE
========================================================= */

document
    .querySelectorAll(".share-button")
    .forEach(button => {

        button.addEventListener("click", async event => {

            event.stopPropagation();

            if (navigator.share) {

                try {
                    await navigator.share({
                        title: "Twigg",
                        text: "Check out this creative work on Twigg."
                    });
                } catch {
                    /* User cancelled sharing. */
                }

                return;
            }

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert("Link copied!");

            } catch {

                alert("Share is not supported in this browser.");
            }
        });
    });


/* =========================================================
   NAVIGATION ACTIVE STATE
========================================================= */

const navItems = document.querySelectorAll(".nav-item");


navItems.forEach(item => {

    item.addEventListener("click", () => {

        saveHomeState();

        navItems.forEach(navItem => {
            navItem.classList.remove("active");
        });

        item.classList.add("active");
    });
});


/* =========================================================
   CARD PROFILE (image + name, shown on hover via CSS)
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        if (card.querySelector(".card-profile")) {
            return;
        }

        const name =
            card.dataset.profileName || "Twigg Creator";

        const imageSrc = card.dataset.profileImage;

        const profile = document.createElement("div");

        profile.className = "card-profile";

        let avatar;

        if (imageSrc) {

            avatar = document.createElement("img");

            avatar.className = "card-profile-image";
            avatar.src = imageSrc;
            avatar.alt = name;
            avatar.loading = "lazy";

        } else {

            avatar = document.createElement("div");

            avatar.className = "card-profile-initial";

            avatar.textContent = name.charAt(0).toUpperCase();
        }

        const label = document.createElement("span");

        label.className = "card-profile-name";

        label.textContent = name;

        profile.appendChild(avatar);
        profile.appendChild(label);

        card.appendChild(profile);
    });


/* =========================================================
   OPEN THE LOOP PAGE

   Clicking any media card opens:
       ../loop/loop.html?card=<media id>&homeScroll=<position>

   Ctrl / Cmd + click opens the Loop Page in a new tab.
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        card.addEventListener("click", event => {

            if (event.target.closest(".action-button")) {
                return;
            }

            saveHomeState();

            let homeScroll = 0;

            try {

                const storedScroll =
                    sessionStorage.getItem(HOME_SCROLL_KEY);

                const parsedScroll = Number(storedScroll);

                if (
                    Number.isFinite(parsedScroll) &&
                    parsedScroll >= 0
                ) {
                    homeScroll = parsedScroll;
                }

            } catch { }

            const url =
                "../loop/loop.html?card=" +
                encodeURIComponent(card.dataset.mediaId) +
                "&homeScroll=" +
                encodeURIComponent(homeScroll);

            if (event.metaKey || event.ctrlKey) {
                window.open(url, "_blank");
                return;
            }

            window.location.href = url;
        });
    });