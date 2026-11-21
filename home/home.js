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


/* =========================================================
   TOUCH / MOBILE SETTINGS

   - touch devices (no hover) autoplay by visibility instead of
     hover
   - on mobile (800px and below) the DOCUMENT scrolls, so the
     browser can hide / show its own toolbars; on desktop and
     tablet the fixed .main box scrolls
========================================================= */

const touchQuery = window.matchMedia("(hover: none)");

const mobileLayoutQuery = window.matchMedia("(max-width: 800px)");

function isTouchFeed() {
    return touchQuery.matches;
}

/* A video is "sufficiently visible" at 60% of its own area, or when
   it fills at least half of the screen height (very tall cards). */
const AUTOPLAY_MIN_RATIO = 0.6;
const AUTOPLAY_MIN_VIEWPORT_SHARE = 0.5;

/* Tap vs scroll: a touch that moved further than this, or that
   happened while the page was still scrolling, is not a tap. */
const TAP_SLOP = 10;
const SCROLL_GUARD_MS = 150;

/* Cards whose video is sufficiently visible (touch autoplay) */
const autoplayVisible = new Map();

/* The one card whose video is currently auto-playing (touch) */
let autoplayCard = null;

let autoplayEvaluateTimer = null;

/* Time of the latest scroll event, and the touch being tracked */
let lastScrollAt = 0;

let tapState = null;


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


/* Verified badge: the same artwork the Creator Profile page uses.
   Shown next to the creator's name in the hover profile of a card.
   Every creator is verified unless the creator data says
   `verified: false`. */

const VERIFIED_BADGE = `<svg class="verified-badge" viewBox="0 0 24 24" role="img" aria-label="Verified" focusable="false"><title>Verified</title><path fill="#1d9bf0" d="M12 1.8l2.4 1.6 2.9-.3 1.2 2.7 2.6 1.3-.3 2.9L22.4 12l-1.6 2.4.3 2.9-2.6 1.3-1.2 2.7-2.9-.3L12 22.2l-2.4-1.6-2.9.3-1.2-2.7-2.6-1.3.3-2.9L1.6 12l1.6-2.4-.3-2.9 2.6-1.3 1.2-2.7 2.9.3z"></path><path fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7.9 12.3l2.8 2.9 5.4-5.8"></path></svg>`;


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
   (autoplay policy), the video falls back to muted.

   Desktop / mouse devices: the shared setting also becomes
   muted (unchanged behaviour).

   Touch devices: the user's mute / unmute CHOICE is kept. Only
   this one video plays muted (the browser would not allow sound
   for it), the speaker icon shows its real state, and the next
   video tries again with sound. Before, the choice itself was
   overwritten with "muted" and every following video stayed
   muted, which is why videos "muted themselves" while scrolling.
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

                if (isTouchFeed()) {

                    const card = video.closest(".media-card");

                    const button =
                        card
                            ? card.querySelector(".unmute-button")
                            : null;

                    if (button) {
                        button.innerHTML = ICONS.muted;
                    }

                    video.play().catch(() => { });

                    return;
                }

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

    /*
       Touch devices only download video METADATA up front (plus
       the first frame, via the #t=0.001 media fragment). The full
       video is fetched only when it autoplays. Desktop / tablet
       with a mouse keep the original preload="auto".
    */

    const touch = isTouchFeed();

    const videoSrc =
        touch
            ? item.src + "#t=0.001"
            : item.src;

    const media =
        isVideo
            ? `
                <video muted loop playsinline preload="${touch ? "metadata" : "auto"}"${item.thumbnail ? ` poster="${escapeHtml(item.thumbnail)}"` : ""}>
                    <source src="${escapeHtml(videoSrc)}" type="video/mp4">
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
            data-profile-verified="${item.creator.verified === false ? "false" : "true"}"
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


/*
   On mobile (800px and below) the document scrolls (see home.css).
   On desktop / tablet the fixed .main box scrolls. This is checked
   on every call so resizing across the breakpoint keeps working.
*/

function getHomeScroller() {

    if (mobileLayoutQuery.matches) {

        return (
            document.scrollingElement ||
            document.documentElement
        );
    }

    return findHomeScroller();
}


function isDocumentScroller(scroller) {

    return (
        scroller === document.scrollingElement ||
        scroller === document.documentElement ||
        scroller === document.body
    );
}


function getScrollY() {

    const scroller = getHomeScroller();

    return isDocumentScroller(scroller)
        ? window.scrollY
        : scroller.scrollTop;
}


function jumpToScroll(y) {

    const scroller = getHomeScroller();

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
       The poster comes from the SHARED thumbnail pipeline
       (TwiggMedia.applyPoster in media-data.js): the same cached
       frame is reused by Home, Loop and later visits. Returns a
       promise that resolves true once a poster is applied.
    */

    const media = window.TwiggMedia;

    const item =
        media
            ? media.getById(Number(card.dataset.mediaId))
            : null;

    const updateRatio = () => {
        setMediaAspectRatio(
            card,
            video.videoWidth,
            video.videoHeight
        );
    };

    video.addEventListener("loadedmetadata", updateRatio);

    if (video.readyState >= 1) {
        updateRatio();
    }

    const posterReady =
        (item && media.applyPoster)
            ? media.applyPoster(
                video,
                item,
                ratio => setMediaAspectRatio(card, ratio, 1)
            )
            : Promise.resolve(false);

    video.load();

    return posterReady;
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

            if (window.TwiggSkeleton) {
                window.TwiggSkeleton.watchImage(card, image);
            }
        }

        if (video) {
            const posterReady = setupVideoAspectRatio(card, video);

            if (window.TwiggSkeleton) {
                window.TwiggSkeleton.watchVideo(card, video, posterReady);
            }
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


        /* ----- HOVER AUTOPLAY (mouse devices only) -----

           Touch devices get emulated mouse events after a tap;
           those are ignored here. Touch playback is handled by
           the visibility-based autoplay further down. */

        card.addEventListener("mouseenter", () => {

            if (isTouchFeed()) {
                return;
            }

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

            if (isTouchFeed()) {
                return;
            }

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

                /*
                   Touch: the browser may have refused sound for the
                   playing video (the choice is still "unmuted" but the
                   video plays muted, and the icon shows that). Tapping
                   the speaker then turns the sound on for this video.
                   A tap is a user gesture, so the browser allows it.
                */

                if (isTouchFeed() && !sharedVideoMuted && autoplayCard) {

                    const playing = autoplayCard.querySelector("video");

                    if (playing && playing.muted) {

                        playing.muted = false;

                        const playingButton =
                            autoplayCard.querySelector(".unmute-button");

                        if (playingButton) {
                            playingButton.innerHTML = ICONS.unmuted;
                        }

                        safeHomePlay(playing);

                        return;
                    }
                }

                sharedVideoMuted = !sharedVideoMuted;

                /* Remember the choice for the Reels and Loop pages. */

                try {
                    sessionStorage.setItem(
                        MUTE_KEY,
                        String(sharedVideoMuted)
                    );
                } catch { }

                /*
                   Mouse: the card whose button was clicked is the
                   hovered one. Touch: the card that is currently
                   auto-playing is the only one that may have sound.
                */

                const activeVideo =
                    isTouchFeed()
                        ? (autoplayCard ? autoplayCard.querySelector("video") : null)
                        : video;

                document
                    .querySelectorAll(".media-card video")
                    .forEach(otherVideo => {
                        otherVideo.muted =
                            sharedVideoMuted ||
                            otherVideo !== activeVideo;
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

                if (!sharedVideoMuted && activeVideo) {
                    safeHomePlay(activeVideo);
                }
            });
        }
    });


/* =========================================================
   TOUCH AUTOPLAY (visibility based)

   On touch devices a video starts when it is sufficiently
   visible and stops when it leaves the screen. Only ONE video
   plays at a time: the sufficiently-visible card closest to
   the middle of the screen. Playback is muted unless the shared
   mute setting says otherwise; if the browser blocks sound,
   safeHomePlay plays that video muted and keeps the user's
   choice. Videos that are not visible are never played, so
   they download nothing beyond metadata.

   The playing card carries .is-playing: on phones the speaker
   icon is shown only on that card (see home.css).
========================================================= */

function startAutoplayCard(card) {

    const video = card.querySelector("video");

    if (!video) {
        return;
    }

    const indicator = card.querySelector(".video-indicator");

    if (indicator) {
        indicator.classList.add("hidden");
    }

    video.muted = sharedVideoMuted;

    const muteButton = card.querySelector(".unmute-button");

    if (muteButton) {
        muteButton.innerHTML =
            video.muted
                ? ICONS.muted
                : ICONS.unmuted;
    }

    card.classList.add("is-playing");

    safeHomePlay(video);
}


function stopAutoplayCard(card) {

    const video = card.querySelector("video");

    if (!video) {
        return;
    }

    const indicator = card.querySelector(".video-indicator");

    if (indicator) {
        indicator.classList.remove("hidden");
    }

    card.classList.remove("is-playing");

    video.pause();

    video.muted = true;

    try {
        video.currentTime = 0;
    } catch { }
}


function releaseAutoplay() {

    if (autoplayCard) {

        stopAutoplayCard(autoplayCard);

        autoplayCard = null;
    }
}


function evaluateAutoplay() {

    if (
        !isTouchFeed() ||
        document.visibilityState === "hidden"
    ) {
        releaseAutoplay();
        return;
    }

    const middle = window.innerHeight / 2;

    let best = null;
    let bestDistance = Infinity;

    autoplayVisible.forEach((_, card) => {

        const rect = card.getBoundingClientRect();

        const distance =
            Math.abs(rect.top + rect.height / 2 - middle);

        if (distance < bestDistance) {
            best = card;
            bestDistance = distance;
        }
    });

    if (best === autoplayCard) {
        return;
    }

    if (autoplayCard) {
        stopAutoplayCard(autoplayCard);
    }

    autoplayCard = best;

    if (best) {
        startAutoplayCard(best);
    }
}


if ("IntersectionObserver" in window) {

    /*
       root: null (the viewport). Intersection is still clipped by
       any scrolling ancestor, so this works for both the mobile
       document scroll and the tablet / desktop .main scroll.
    */

    const autoplayObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

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

    document
        .querySelectorAll(".media-card")
        .forEach(card => {

            if (card.querySelector("video")) {
                autoplayObserver.observe(card);
            }
        });
}


/* Re-pick the most central video shortly after scrolling stops */

window.addEventListener(
    "scroll",
    () => {

        lastScrollAt = Date.now();

        if (!isTouchFeed()) {
            return;
        }

        clearTimeout(autoplayEvaluateTimer);

        autoplayEvaluateTimer =
            setTimeout(evaluateAutoplay, 120);
    },
    {
        passive: true,
        capture: true
    }
);


document.addEventListener("visibilitychange", () => {

    if (document.visibilityState === "hidden") {
        releaseAutoplay();
    } else {
        evaluateAutoplay();
    }
});


if (touchQuery.addEventListener) {
    touchQuery.addEventListener("change", evaluateAutoplay);
}


/* =========================================================
   TAP vs SCROLL (touch)

   A card only opens for an intentional tap. A touch is NOT a
   tap when the finger moved, the browser cancelled the pointer
   (it started scrolling), or the page was still scrolling when
   the finger landed / lifted (a light touch to stop momentum).
   Mouse clicks are never filtered.
========================================================= */

document.addEventListener(
    "pointerdown",
    event => {

        tapState =
            event.pointerType === "mouse"
                ? null
                : {
                    x: event.clientX,
                    y: event.clientY,
                    moved: false,
                    duringScroll:
                        Date.now() - lastScrollAt < SCROLL_GUARD_MS
                };
    },
    { passive: true, capture: true }
);


document.addEventListener(
    "pointermove",
    event => {

        if (
            tapState &&
            !tapState.moved &&
            Math.hypot(
                event.clientX - tapState.x,
                event.clientY - tapState.y
            ) > TAP_SLOP
        ) {
            tapState.moved = true;
        }
    },
    { passive: true, capture: true }
);


document.addEventListener(
    "pointercancel",
    () => {

        if (tapState) {
            tapState.moved = true;
        }
    },
    { passive: true, capture: true }
);


function isAccidentalTap() {

    const state = tapState;

    tapState = null;

    if (!state) {
        return false;
    }

    return (
        state.moved ||
        state.duringScroll ||
        Date.now() - lastScrollAt < SCROLL_GUARD_MS
    );
}


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


/* True when the link points at the page the user is already on. */

function isCurrentPageLink(item) {

    const href = item.getAttribute("href");

    if (!href || href === "#") {
        return false;
    }

    try {
        return new URL(item.href, location.href).pathname === location.pathname;
    } catch {
        return false;
    }
}


/* Smooth scroll of whichever element scrolls Home (document on
   mobile, the fixed .main box on desktop / tablet). No reload,
   no feed reset, no new media requests. */

function scrollHomeToTop() {

    const scroller = getHomeScroller();

    const target =
        isDocumentScroller(scroller)
            ? window
            : scroller;

    target.scrollTo({ top: 0, behavior: "smooth" });
}


navItems.forEach(item => {

    item.addEventListener("click", event => {

        const href = item.getAttribute("href");

        /* Placeholder links: do nothing (and never jump / change #) */

        if (!href || href === "#") {
            event.preventDefault();
            return;
        }

        /* Let "open in new tab" and similar clicks behave normally */

        if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            event.button > 0
        ) {
            return;
        }

        /* Active Home icon: scroll to the top instead of reloading */

        if (isCurrentPageLink(item)) {
            event.preventDefault();
            scrollHomeToTop();
            return;
        }

        /* Another page: position is saved (also by the listener above)
           and restored when the user comes back. */

        saveHomeState();
    });
});


/* =========================================================
   CARD PROFILE (image + name + verified badge, shown on hover
   via CSS)
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

        const verified =
            card.dataset.profileVerified !== "false";

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

        /* Name + badge stay together (the name is the part that is
           shortened with "…" when it is too long). */

        const identity = document.createElement("div");

        identity.className = "card-profile-identity";

        identity.appendChild(label);

        if (verified) {
            identity.insertAdjacentHTML("beforeend", VERIFIED_BADGE);
        }

        profile.appendChild(avatar);
        profile.appendChild(identity);

        card.appendChild(profile);
    });


/* =========================================================
   OPEN THE LOOP PAGE

   Clicking any media card opens:
       ../loop/loop.html?card=<media id>&homeScroll=<position>

   Ctrl / Cmd + click opens the Loop Page in a new tab.

   On touch devices a touch that was really a scroll gesture
   (moved, cancelled, or landed on a moving page) is ignored.
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        card.addEventListener("click", event => {

            if (event.target.closest(".action-button")) {
                return;
            }

            if (isAccidentalTap()) {
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

/* =========================================================
   SKELETON: category tiles (static <img> tags in home.html)
========================================================= */

if (window.TwiggSkeleton) {

    document
        .querySelectorAll(".category")
        .forEach(tile => {

            const image = tile.querySelector("img");

            if (image) {
                window.TwiggSkeleton.watchImage(tile, image);
            }
        });
}