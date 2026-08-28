/* =========================================================
   HOVER AUTOPLAY
========================================================= */

document
    .querySelectorAll(".media-card")
    .forEach(card => {

        const video = card.querySelector("video");

        /* Image card — ignore */
        if (!video) {
            return;
        }

        /* -----------------------------------------------------
           MOUSE ENTER
        ----------------------------------------------------- */

        card.addEventListener(
            "mouseenter",
            () => {

                /*
                 * Always start muted.
                 * This allows browsers to autoplay the video.
                 */

                video.muted = true;

                video.play()
                    .then(() => {
                        console.log("Video playing");
                    })
                    .catch(error => {
                        console.log(
                            "Could not autoplay video:",
                            error
                        );
                    });

            }
        );


        /* -----------------------------------------------------
           MOUSE LEAVE
        ----------------------------------------------------- */

        card.addEventListener(
            "mouseleave",
            () => {

                video.pause();
                video.currentTime = 0;
                video.muted = true;

            }
        );

    });


/* =========================================================
   UNMUTE BUTTON
========================================================= */

document
    .querySelectorAll(".unmute-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                const card =
                    this.closest(".media-card");

                const video =
                    card.querySelector("video");

                video.muted =
                    !video.muted;


                if (video.muted) {

                    this.innerHTML = `
                        <svg viewBox="0 0 24 24">

                            <path
                                d="M4 10v4h4l5 4V6l-5 4H4z">
                            </path>

                            <path
                                d="M16 9c1 1 1 5 0 6">
                            </path>

                        </svg>
                    `;

                }

                else {

                    this.innerHTML = `
                        <svg viewBox="0 0 24 24">

                            <path
                                d="M4 10v4h4l5 4V6l-5 4H4z">
                            </path>

                            <path
                                d="M16 8c2 2 2 6 0 8">
                            </path>

                            <path
                                d="M19 5c3 3 3 11 0 14">
                            </path>

                        </svg>
                    `;

                    /*
                     * Some browsers require the play command
                     * again after changing audio state.
                     */

                    video.play()
                        .catch(() => {});

                }

            }
        );

    });


/* =========================================================
   SAVE BUTTON
========================================================= */

document
    .querySelectorAll(".save-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                this.classList.toggle("saved");


                if (
                    this.classList.contains("saved")
                ) {

                    this.innerHTML = `
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor">

                            <path
                                d="M6 4h12v16l-6-4-6 4z">
                            </path>

                        </svg>
                    `;

                }

                else {

                    this.innerHTML = `
                        <svg viewBox="0 0 24 24">

                            <path
                                d="M6 4h12v16l-6-4-6 4z">
                            </path>

                        </svg>
                    `;

                }

            }
        );

    });


/* =========================================================
   SHARE BUTTON
========================================================= */

document
    .querySelectorAll(".share-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            async function(event) {

                event.stopPropagation();


                if (navigator.share) {

                    try {

                        await navigator.share({
                            title: "Twigg",
                            text:
                                "Check out this creative work on Twigg."
                        });

                    }

                    catch (error) {

                        /*
                         * User closed share menu.
                         */

                    }

                }

                else {

                    /*
                     * Fallback: copy page URL.
                     */

                    try {

                        await navigator.clipboard.writeText(
                            window.location.href
                        );

                        alert("Link copied!");

                    }

                    catch (error) {

                        alert(
                            "Share is not supported in this browser."
                        );

                    }

                }

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

                event.preventDefault();


                document
                    .querySelectorAll(".nav-item")
                    .forEach(nav => {

                        nav.classList.remove("active");

                    });


                this.classList.add("active");

            }
        );

    });