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


/*
   Shared mute state for all Home videos.

   true  = videos start muted
   false = videos start unmuted

   The last user-selected state is kept while moving
   between different videos.
*/

let sharedVideoMuted = true;


/*
   IMPORTANT:

   Disable the browser's automatic scroll restoration.

   Otherwise the browser can restore its own position
   after our JavaScript has already restored the saved
   position, causing a visible jump.

   This is set only by the Home page script, so other
   pages (Reels, Creators, Search, etc.) keep their
   normal browser behavior.
*/

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}


const navigationEntry =
    performance.getEntriesByType("navigation")[0];

const isHomeReload =
    navigationEntry &&
    navigationEntry.type === "reload";


/*
   A real browser refresh creates a completely fresh
   Twigg feed (new order, scroll back to the top).

   Normal navigation does NOT clear the state, so the
   saved scroll position stays available until the user
   intentionally refreshes.
*/

if (isHomeReload) {

    sessionStorage.removeItem(
        HOME_ORDER_KEY
    );

    sessionStorage.removeItem(
        HOME_SCROLL_KEY
    );

    sessionStorage.removeItem(
        REELS_ORDER_KEY
    );

    sessionStorage.removeItem(
        REELS_STATE_KEY
    );

    sessionStorage.removeItem(
        HOME_RATIO_KEY
    );
}


/*
   Cached media aspect ratios.

   Card heights depend on these ratios. Applying them
   immediately lets the page be tall enough to restore
   the exact scroll position before images have loaded.
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
    `
};


/* =========================================================
   PINTEREST GRID
   SHUFFLE + RESTORE
========================================================= */

const grid =
    document.querySelector(
        ".pinterest-grid"
    );


if (grid) {

    const cards =
        Array.from(
            grid.querySelectorAll(
                ".media-card"
            )
        );


    /*
       Remember each card's original index so its
       aspect ratio can be cached and restored.
    */

    cards.forEach((card, index) => {

        card.dataset.homeIndex =
            String(index);

    });


    let savedOrder = null;


    try {

        const storedOrder =
            sessionStorage.getItem(
                HOME_ORDER_KEY
            );


        if (storedOrder) {

            const parsed =
                JSON.parse(
                    storedOrder
                );


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
       Create a fresh random order only when there
       is no previously saved order.
    */

    if (!savedOrder) {

        savedOrder =
            cards.map(
                (_, index) => index
            );


        for (
            let i = savedOrder.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );


            [
                savedOrder[i],
                savedOrder[j]
            ] = [
                savedOrder[j],
                savedOrder[i]
            ];
        }


        try {

            sessionStorage.setItem(
                HOME_ORDER_KEY,
                JSON.stringify(savedOrder)
            );

        } catch {}
    }


    /*
       Apply the saved order immediately.
    */

    savedOrder.forEach(
        index => {

            grid.appendChild(
                cards[index]
            );

        }
    );


    /*
       Apply cached aspect ratios immediately so the
       page has its final height before scroll restore.
    */

    cards.forEach(card => {

        const ratio =
            homeRatios[
                card.dataset.homeIndex
            ];


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

/*
   Read the saved position only when this is NOT a
   browser refresh. (On refresh the keys were already
   cleared above, so the page simply starts at the top.)
*/

let savedHomeScroll = null;


if (!isHomeReload) {

    let storedScroll = null;

    try {

        storedScroll =
            sessionStorage.getItem(
                HOME_SCROLL_KEY
            );

    } catch {

        storedScroll = null;
    }


    if (storedScroll !== null) {

        const parsedScroll =
            Number(storedScroll);


        if (
            Number.isFinite(parsedScroll) &&
            parsedScroll >= 0
        ) {

            savedHomeScroll =
                parsedScroll;
        }
    }
}


/*
   Jump instantly (ignoring any CSS smooth scrolling).
*/

/*
   Find the element that actually scrolls the Home page.

   Most pages scroll the window, but some layouts scroll
   an inner container instead (fixed-height wrapper with
   overflow-y: auto). In that case window.scrollY is
   always 0, so we must read/write that container.
*/

function findHomeScroller() {

    const doc =
        document.scrollingElement ||
        document.documentElement;


    const isScrollableStyle = el => {

        const overflowY =
            getComputedStyle(el).overflowY;

        return (
            overflowY === "auto" ||
            overflowY === "scroll" ||
            overflowY === "overlay"
        );
    };


    /*
       If the document itself can scroll, use it.
    */

    if (doc.scrollHeight > doc.clientHeight + 1) {
        return doc;
    }


    /*
       Otherwise look for a scrolling ancestor of the grid.
    */

    let el =
        grid ? grid.parentElement : null;


    while (
        el &&
        el !== document.documentElement
    ) {

        if (
            el === document.body &&
            getComputedStyle(
                document.documentElement
            ).overflowY === "visible"
        ) {
            /*
               Body overflow propagates to the viewport,
               so the window is the scroller.
            */
            break;
        }

        if (isScrollableStyle(el)) {
            return el;
        }

        el = el.parentElement;
    }


    return doc;
}


const homeScroller =
    findHomeScroller();

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

    const previous =
        target.style.scrollBehavior;

    target.style.scrollBehavior =
        "auto";

    if (homeScrollerIsDocument) {

        window.scrollTo(0, y);

    } else {

        homeScroller.scrollTop = y;
    }

    target.style.scrollBehavior =
        previous;
}


/*
   While true, the saved position is protected: scroll
   events caused by the restoration itself (or by the
   page being temporarily too short) must NOT overwrite
   the good saved value.
*/

let homeRestoring = false;


if (savedHomeScroll !== null) {

    /*
       First attempt: cached card ratios usually make the
       page tall enough right now, so this often succeeds
       immediately with no flicker at all.
    */

    jumpToScroll(savedHomeScroll);


    const reached = () =>
        Math.abs(
            getScrollY() - savedHomeScroll
        ) <= 2;


    if (!reached()) {

        /*
           The page is not tall enough yet (content is
           still loading). Hide the page, keep retrying as
           the layout grows, and reveal it once the exact
           position is reached.
        */

        homeRestoring = true;


        const root =
            document.documentElement;

        root.style.visibility =
            "hidden";


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


        /*
           Fully finish restoring: stop observing, make
           sure the page is visible, and allow normal
           saving of the scroll position again.
        */

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

                window.removeEventListener(
                    type,
                    stopRestoring
                );

            });
        };


        /*
           Show the page. If the exact position still has
           not been reached, we keep correcting in the
           background for a short while (late layout shifts)
           until the user interacts or the position is hit.
        */

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

            watcher =
                new ResizeObserver(attempt);

            watcher.observe(
                document.body
            );

            if (grid) {
                watcher.observe(grid);
            }
        }


        /*
           If the user starts scrolling/interacting, stop
           fighting them immediately.
        */

        userEvents.forEach(type => {

            window.addEventListener(
                type,
                stopRestoring,
                { passive: true }
            );

        });


        /*
           When everything has loaded, do a final attempt
           and reveal the page.
        */

        const onLoaded = () => {

            attempt();

            reveal();
        };


        if (document.readyState === "complete") {

            onLoaded();

        } else {

            window.addEventListener(
                "load",
                onLoaded,
                { once: true }
            );
        }


        /*
           Safety nets:
           - never keep the page hidden for too long
           - never keep correcting forever
        */

        revealTimer =
            setTimeout(reveal, 1500);

        correctionTimer =
            setTimeout(stopRestoring, 3500);
    }
}


/* =========================================================
   SAVE HOME POSITION
========================================================= */

function saveHomeState() {

    if (homeRestoring) {
        return;
    }

    try {

        sessionStorage.setItem(
            HOME_SCROLL_KEY,
            String(getScrollY())
        );

    } catch {}
}


window.addEventListener(
    "pagehide",
    saveHomeState
);


/*
   Mobile browsers don't always fire pagehide reliably,
   so also save when the page becomes hidden.
*/

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.visibilityState === "hidden") {

            saveHomeState();
        }
    }
);


document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            () => {

                saveHomeState();

            }
        );

    });


let homeScrollSaveTimeout = null;


window.addEventListener(
    "scroll",
    () => {

        clearTimeout(
            homeScrollSaveTimeout
        );


        homeScrollSaveTimeout =
            setTimeout(
                () => {

                    saveHomeState();

                },
                50
            );

    },
    {
        passive: true,
        capture: true
    }
);


/* =========================================================
   MEDIA ASPECT RATIO
========================================================= */

function setMediaAspectRatio(
    card,
    width,
    height
) {

    if (!width || !height) {
        return;
    }


    const ratio =
        width / height;


    if (
        !Number.isFinite(ratio) ||
        ratio <= 0
    ) {
        return;
    }


    card.style.setProperty(
        "--media-ratio",
        `${ratio}`
    );


    /*
       Cache the ratio so it can be applied instantly
       when Home is revisited.
    */

    if (card.dataset.homeIndex !== undefined) {

        homeRatios[
            card.dataset.homeIndex
        ] = ratio;


        try {

            sessionStorage.setItem(
                HOME_RATIO_KEY,
                JSON.stringify(homeRatios)
            );

        } catch {}
    }
}


/* =========================================================
   IMAGE ASPECT RATIO
========================================================= */

function setupImageAspectRatio(
    card,
    image
) {

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

        image.addEventListener(
            "load",
            updateRatio,
            { once: true }
        );

    }


    image.addEventListener(
        "error",
        () => {

            card.style.removeProperty(
                "--media-ratio"
            );

        },
        { once: true }
    );
}


/* =========================================================
   VIDEO THUMBNAIL + ASPECT RATIO
========================================================= */

function setupVideoAspectRatio(
    card,
    video
) {

    /*
       The video itself is used to generate the thumbnail.

       The first available video frame is captured and
       stored as the video's poster.

       This means the card has a thumbnail even when the
       video is not currently playing.
    */

    const generateVideoThumbnail = () => {

        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
        }


        /*
           Always use the video's exact native dimensions
           for the card aspect ratio.
        */

        setMediaAspectRatio(
            card,
            video.videoWidth,
            video.videoHeight
        );


        /*
           If a poster already exists, there is nothing
           else to generate.
        */

        if (video.poster) {
            return;
        }


        try {

            const canvas =
                document.createElement("canvas");


            canvas.width =
                video.videoWidth;

            canvas.height =
                video.videoHeight;


            const context =
                canvas.getContext("2d");


            if (!context) {
                return;
            }


            /*
               Make sure we capture the beginning of the
               video rather than a random frame.
            */

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
                        canvas.toDataURL(
                            "image/jpeg",
                            0.88
                        );

                } catch {
                    /*
                       Canvas extraction may be blocked
                       by the browser for some sources.
                    */
                }
            };


            /*
               If the video is already at the beginning,
               capture immediately.
            */

            if (
                Math.abs(video.currentTime) < 0.01
            ) {

                captureFrame();

                return;
            }


            /*
               Otherwise move to the first frame and wait
               until seeking has completed.
            */

            const handleSeeked = () => {

                captureFrame();

            };


            video.addEventListener(
                "seeked",
                handleSeeked,
                { once: true }
            );


            video.currentTime = 0;

        } catch {
            /*
               Thumbnail generation is optional.
               Video playback continues normally if it fails.
            */
        }
    };


    /* -----------------------------------------------------
       VIDEO METADATA
    ----------------------------------------------------- */

    const updateRatio = () => {

        setMediaAspectRatio(
            card,
            video.videoWidth,
            video.videoHeight
        );

    };


    video.addEventListener(
        "loadedmetadata",
        updateRatio
    );


    /* -----------------------------------------------------
       FIRST FRAME / THUMBNAIL
    ----------------------------------------------------- */

    video.addEventListener(
        "loadeddata",
        generateVideoThumbnail,
        { once: true }
    );


    /*
       If metadata is already available, update the ratio
       immediately.
    */

    if (video.readyState >= 1) {

        updateRatio();

    }


    /*
       If the first frame is already available, generate
       the thumbnail immediately.
    */

    if (video.readyState >= 2) {

        generateVideoThumbnail();

    }


    /*
       Ask the browser to load the first frame.

       This works together with preload="auto" in HTML.
    */

    video.load();
}


/* =========================================================
   INITIALIZE MEDIA ASPECT RATIOS
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        const image =
            card.querySelector("img");

        const video =
            card.querySelector("video");


        if (image) {

            setupImageAspectRatio(
                card,
                image
            );

        }


        if (video) {

            setupVideoAspectRatio(
                card,
                video
            );

        }

    });


/* =========================================================
   VIDEO CONTROLS
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        const video =
            card.querySelector(
                "video"
            );

        const muteButton =
            card.querySelector(
                ".unmute-button"
            );


        if (!video) {
            return;
        }


        /* -------------------------------------------------
           VIDEO INDICATOR
        ------------------------------------------------- */

        let videoIndicator =
            card.querySelector(
                ".video-indicator"
            );


        /*
           Create the indicator only for video cards.

           It stays in the top-left corner of the card
           while the video is not being hovered.
        */

        if (!videoIndicator) {

            videoIndicator =
                document.createElement(
                    "div"
                );


            videoIndicator.className =
                "video-indicator";


            videoIndicator.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.5v13l10-6.5-10-6.5z"></path>
                </svg>
            `;


            card.appendChild(
                videoIndicator
            );
        }


        /*
           Set the initial state from the shared state.
        */

        video.muted =
            sharedVideoMuted;


        if (muteButton) {

            muteButton.innerHTML =
                sharedVideoMuted
                    ? ICONS.muted
                    : ICONS.unmuted;

        }


        /* -------------------------------------------------
           HOVER AUTOPLAY
        ------------------------------------------------- */

        card.addEventListener(
            "mouseenter",
            () => {

                /*
                   Hide the video indicator when the user
                   starts engaging with the video.
                */

                if (videoIndicator) {

                    videoIndicator.classList.add(
                        "hidden"
                    );

                }


                /*
                   Apply the last global mute/unmute choice
                   to the newly hovered video.
                */

                video.muted =
                    sharedVideoMuted;


                /*
                   The hovered video becomes the only
                   video that can have audio.
                */

                document
                    .querySelectorAll(
                        ".media-card video"
                    )
                    .forEach(otherVideo => {

                        if (otherVideo !== video) {

                            otherVideo.muted =
                                true;

                        }

                    });


                /*
                   Update this video's button.
                */

                if (muteButton) {

                    muteButton.innerHTML =
                        video.muted
                            ? ICONS.muted
                            : ICONS.unmuted;

                }


                /*
                   Start the video.
                */

                video.play()
                    .catch(() => {});

            }
        );


        /* -------------------------------------------------
           HOVER END
        ------------------------------------------------- */

        card.addEventListener(
            "mouseleave",
            () => {

                /*
                   Bring the video indicator back when
                   the cursor leaves the card.
                */

                if (videoIndicator) {

                    videoIndicator.classList.remove(
                        "hidden"
                    );

                }


                /*
                   Stop the video.
                */

                video.pause();


                /*
                   Return to the beginning so that the
                   poster/first frame is shown again.
                */

                video.currentTime = 0;


                /*
                   Keep the actual video muted when it is
                   not being hovered.

                   sharedVideoMuted itself is NOT changed.
                */

                video.muted = true;


                if (muteButton) {

                    muteButton.innerHTML =
                        sharedVideoMuted
                            ? ICONS.muted
                            : ICONS.unmuted;

                }

            }
        );


        /* -------------------------------------------------
           MUTE / UNMUTE
        ------------------------------------------------- */

        if (muteButton) {

            muteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    /*
                       Toggle the GLOBAL audio state.
                    */

                    sharedVideoMuted =
                        !sharedVideoMuted;


                    /*
                       Apply the new state to every video.

                       Only the currently hovered video can
                       remain audible.
                    */

                    document
                        .querySelectorAll(
                            ".media-card video"
                        )
                        .forEach(otherVideo => {

                            otherVideo.muted =
                                sharedVideoMuted ||
                                otherVideo !== video;

                        });


                    /*
                       Update every mute button.
                    */

                    document
                        .querySelectorAll(
                            ".media-card"
                        )
                        .forEach(otherCard => {

                            const otherVideo =
                                otherCard.querySelector(
                                    "video"
                                );

                            const otherMuteButton =
                                otherCard.querySelector(
                                    ".unmute-button"
                                );


                            if (
                                otherVideo &&
                                otherMuteButton
                            ) {

                                otherMuteButton.innerHTML =
                                    sharedVideoMuted
                                        ? ICONS.muted
                                        : ICONS.unmuted;

                            }

                        });


                    /*
                       If the user just unmuted the current
                       video, keep it playing.
                    */

                    if (!sharedVideoMuted) {

                        video.play()
                            .catch(() => {});

                    }

                }
            );

        }

    });


/* =========================================================
   SAVE
========================================================= */

document
    .querySelectorAll(".save-button")
    .forEach(button => {

        /*
           Make sure every save button has a clean initial
           icon and rendering state when the page loads.
        */

        button.classList.remove("saved");

        button.innerHTML =
            ICONS.unsaved;


        /*
           Prevent the button from inheriting any temporary
           rendering state from the card/video underneath it.
        */

        button.style.display = "flex";
        button.style.alignItems = "center";
        button.style.justifyContent = "center";


        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const isSaved =
                    button.classList.toggle(
                        "saved"
                    );


                button.innerHTML =
                    isSaved
                        ? ICONS.saved
                        : ICONS.unsaved;

            }
        );

    });


/* =========================================================
   SHARE
========================================================= */

document
    .querySelectorAll(".share-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            async event => {

                event.stopPropagation();


                if (navigator.share) {

                    try {

                        await navigator.share({
                            title: "Twigg",
                            text: "Check out this creative work on Twigg."
                        });

                    } catch {
                        /*
                           User cancelled sharing.
                        */
                    }

                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );


                    alert(
                        "Link copied!"
                    );

                } catch {

                    alert(
                        "Share is not supported in this browser."
                    );

                }

            }
        );

    });


/* =========================================================
   NAVIGATION ACTIVE STATE
========================================================= */

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            /*
               Save one final time immediately before
               navigation.
            */

            saveHomeState();


            navItems.forEach(
                navItem => {

                    navItem.classList.remove(
                        "active"
                    );

                }
            );


            item.classList.add(
                "active"
            );

        }
    );

});


/* =========================================================
   CARD PROFILE (image + name, shown on hover via CSS)

   Runs last, after all aspect-ratio and video setup, so the
   profile avatar <img> can never be mistaken for the card's
   main media by card.querySelector("img").
========================================================= */

/*
   Placeholder names, used only when a card has no
   data-profile-name attribute. Replace with real data later.
*/

const PLACEHOLDER_PROFILES = [
    "Aarav Studio",
    "Maya Designs",
    "Pixel Forge",
    "Nora Creative",
    "Kabir Motion",
    "Lumen Works"
];


document
    .querySelectorAll(".media-card")
    .forEach((card, index) => {

        if (card.querySelector(".card-profile")) {
            return;
        }

        const name =
            card.dataset.profileName ||
            PLACEHOLDER_PROFILES[
                index % PLACEHOLDER_PROFILES.length
            ];

        const imageSrc =
            card.dataset.profileImage;


        const profile =
            document.createElement("div");

        profile.className =
            "card-profile";


        let avatar;

        if (imageSrc) {

            avatar =
                document.createElement("img");

            avatar.className =
                "card-profile-image";

            avatar.src = imageSrc;
            avatar.alt = name;
            avatar.loading = "lazy";

        } else {

            avatar =
                document.createElement("div");

            avatar.className =
                "card-profile-initial";

            avatar.textContent =
                name.charAt(0).toUpperCase();
        }


        const label =
            document.createElement("span");

        label.className =
            "card-profile-name";

        label.textContent = name;


        profile.appendChild(avatar);
        profile.appendChild(label);

        card.appendChild(profile);

    });