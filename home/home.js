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
            <path d="M6 4h12v16l-6 4-6 4z"></path>
        </svg>
    `
};


/* =========================================================
   PINTEREST GRID
========================================================= */

const grid = document.querySelector(".pinterest-grid");

if (grid) {

    const cards = [...grid.querySelectorAll(".media-card")];

    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);

    // Put shuffled cards back into the grid
    cards.forEach(card => grid.appendChild(card));
}


/* =========================================================
   VIDEO CONTROLS
========================================================= */

document.querySelectorAll(".media-card").forEach(card => {

    const video = card.querySelector("video");
    const muteButton = card.querySelector(".unmute-button");

    if (!video) return;


    /* -------------------------
       HOVER AUTOPLAY
    ------------------------- */

    card.addEventListener("mouseenter", () => {

        video.muted = true;

        video.play().catch(() => {});

    });


    card.addEventListener("mouseleave", () => {

        video.pause();
        video.currentTime = 0;
        video.muted = true;

        if (muteButton) {
            muteButton.innerHTML = ICONS.muted;
        }

    });


    /* -------------------------
       MUTE / UNMUTE
    ------------------------- */

    if (muteButton) {

        muteButton.addEventListener("click", event => {

            event.stopPropagation();

            video.muted = !video.muted;

            muteButton.innerHTML =
                video.muted
                    ? ICONS.muted
                    : ICONS.unmuted;

            if (!video.muted) {
                video.play().catch(() => {});
            }

        });

    }

});


/* =========================================================
   SAVE
========================================================= */

document.querySelectorAll(".save-button").forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        const saved = button.classList.toggle("saved");

        button.innerHTML =
            saved
                ? ICONS.saved
                : ICONS.unsaved;

    });

});


/* =========================================================
   SHARE
========================================================= */

document.querySelectorAll(".share-button").forEach(button => {

    button.addEventListener("click", async event => {

        event.stopPropagation();


        // Use the device's native share menu when available
        if (navigator.share) {

            try {

                await navigator.share({
                    title: "Twigg",
                    text: "Check out this creative work on Twigg."
                });

            } catch {
                // User cancelled sharing
            }

            return;
        }


        // Fallback: copy page URL
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
   NAVIGATION
========================================================= */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {

    item.addEventListener("click", event => {

        event.preventDefault();

        // Remove active state
        navItems.forEach(navItem => {
            navItem.classList.remove("active");
        });

        // Add active state
        item.classList.add("active");

    });

});