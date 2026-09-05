/* =========================================================
   TWIGG HOME — JAVASCRIPT
========================================================= */


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
   SHUFFLE
========================================================= */

const grid = document.querySelector(".pinterest-grid");

if (grid) {

    const cards = Array.from(
        grid.querySelectorAll(".media-card")
    );

    cards.sort(() => Math.random() - 0.5);

    cards.forEach(card => {
        grid.appendChild(card);
    });
}


/* =========================================================
   MEDIA ASPECT RATIO
========================================================= */

/*
   This is the important part of the Pinterest-style layout.

   The card does NOT use a fixed height.

   Instead:

       card width = column width

       card height =
       column width ÷ media aspect ratio

   Example:

       Image = 1600 × 900

       Aspect ratio = 16 / 9

       Column = 250px

       Card height ≈ 140.6px

   A 4000 × 2250 image therefore has the SAME displayed
   aspect ratio as a 1600 × 900 image.

   Resolution does not determine card size.
   Aspect ratio determines card size.
*/


function setMediaAspectRatio(card, width, height) {

    if (!width || !height) {
        return;
    }

    const ratio = width / height;

    if (!Number.isFinite(ratio) || ratio <= 0) {
        return;
    }

    card.style.setProperty(
        "--media-ratio",
        `${ratio}`
    );
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

        image.addEventListener(
            "load",
            updateRatio,
            { once: true }
        );

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
   VIDEO ASPECT RATIO
========================================================= */

function setupVideoAspectRatio(card, video) {

    const updateRatio = () => {

        setMediaAspectRatio(
            card,
            video.videoWidth,
            video.videoHeight
        );

    };


    /*
       loadedmetadata gives us the video's actual
       intrinsic dimensions.
    */

    video.addEventListener(
        "loadedmetadata",
        updateRatio
    );


    /*
       If metadata has already loaded before JavaScript
       attaches the listener.
    */

    if (video.readyState >= 1) {
        updateRatio();
    }


    /*
       Use the poster as an initial fallback when the
       actual video dimensions are not available yet.
    */

    if (
        video.poster &&
        !video.videoWidth
    ) {

        const posterImage = new Image();

        posterImage.onload = () => {

            if (!video.videoWidth) {

                setMediaAspectRatio(
                    card,
                    posterImage.naturalWidth,
                    posterImage.naturalHeight
                );

            }

        };

        posterImage.src = video.poster;
    }
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
            card.querySelector("video");

        const muteButton =
            card.querySelector(".unmute-button");


        if (!video) {
            return;
        }


        /* -------------------------------------------------
           HOVER AUTOPLAY
        ------------------------------------------------- */

        card.addEventListener(
            "mouseenter",
            () => {

                video.muted = true;

                video.play().catch(() => {});

            }
        );


        /* -------------------------------------------------
           HOVER END
        ------------------------------------------------- */

        card.addEventListener(
            "mouseleave",
            () => {

                video.pause();

                video.currentTime = 0;

                video.muted = true;


                if (muteButton) {

                    muteButton.innerHTML =
                        ICONS.muted;

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

                    video.muted =
                        !video.muted;


                    muteButton.innerHTML =
                        video.muted
                            ? ICONS.muted
                            : ICONS.unmuted;


                    if (!video.muted) {

                        video.play().catch(() => {});

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


                /*
                   Use the device's native share menu
                   when supported.
                */

                if (navigator.share) {

                    try {

                        await navigator.share({
                            title: "Twigg",
                            text: "Check out this creative work on Twigg."
                        });

                    } catch {
                        /*
                           The user cancelled sharing.
                        */
                    }

                    return;
                }


                /*
                   Browser fallback:
                   copy the current page URL.
                */

                try {

                    await navigator.clipboard.writeText(
                        window.location.href
                    );

                    alert("Link copied!");

                } catch {

                    alert(
                        "Share is not supported in this browser."
                    );

                }

            }
        );

    });


/* =========================================================
   NAVIGATION
========================================================= */

const navItems =
    document.querySelectorAll(".nav-item");

navItems.forEach(item => {

    item.addEventListener(
        "click",
        event => {

            event.preventDefault();


            /*
               Remove active state from every item.
            */

            navItems.forEach(navItem => {

                navItem.classList.remove(
                    "active"
                );

            });


            /*
               Activate clicked item.
            */

            item.classList.add("active");

        }
    );

});