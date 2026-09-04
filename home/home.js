/* =========================================================
   RANDOMIZE PINTEREST GRID
========================================================= */

const grid = document.querySelector(".pinterest-grid");

if (grid) {

    const cards = Array.from(
        grid.querySelectorAll(".media-card")
    );

    for (let i = cards.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [cards[i], cards[j]] = [cards[j], cards[i]];

    }

    cards.forEach(card => {
        grid.appendChild(card);
    });

}

/* =========================================================
   ICONS
========================================================= */

const mutedIcon = `
    <svg viewBox="0 0 24 24">
        <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
        <path d="M16 9c1 1 1 5 0 6"></path>
    </svg>
`;

const unmutedIcon = `
    <svg viewBox="0 0 24 24">
        <path d="M4 10v4h4l5 4V6l-5 4H4z"></path>
        <path d="M16 8c2 2 2 6 0 8"></path>
        <path d="M19 5c3 3 3 11 0 14"></path>
    </svg>
`;

const savedIcon = `
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 4h12v16l-6-4-6 4z"></path>
    </svg>
`;

const unsavedIcon = `
    <svg viewBox="0 0 24 24">
        <path d="M6 4h12v16l-6-4-6 4z"></path>
    </svg>
`;


/* =========================================================
   HOVER AUTOPLAY
========================================================= */

document.querySelectorAll(".media-card").forEach(card => {

    const video = card.querySelector("video");

    if (!video) {
        return;
    }

    card.addEventListener("mouseenter", () => {

        video.muted = true;

        video.play().catch(() => {});

    });


    card.addEventListener("mouseleave", () => {

        video.pause();
        video.currentTime = 0;
        video.muted = true;

    });

});


/* =========================================================
   MUTE / UNMUTE
========================================================= */

document.querySelectorAll(".unmute-button").forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        const card = button.closest(".media-card");
        const video = card.querySelector("video");

        video.muted = !video.muted;

        button.innerHTML =
            video.muted
                ? mutedIcon
                : unmutedIcon;

        if (!video.muted) {
            video.play().catch(() => {});
        }

    });

});


/* =========================================================
   SAVE BUTTON
========================================================= */

document.querySelectorAll(".save-button").forEach(button => {

    button.addEventListener("click", event => {

        event.stopPropagation();

        const isSaved =
            button.classList.toggle("saved");

        button.innerHTML =
            isSaved
                ? savedIcon
                : unsavedIcon;

    });

});


/* =========================================================
   SHARE BUTTON
========================================================= */

document.querySelectorAll(".share-button").forEach(button => {

    button.addEventListener("click", async event => {

        event.stopPropagation();

        if (navigator.share) {

            try {

                await navigator.share({
                    title: "Twigg",
                    text: "Check out this creative work on Twigg."
                });

            } catch {
                // User closed the share menu.
            }

            return;
        }


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

    });

});


/* =========================================================
   NAVIGATION ACTIVE STATE
========================================================= */

document.querySelectorAll(".nav-item").forEach(item => {

    item.addEventListener("click", event => {

        event.preventDefault();

        document
            .querySelector(".nav-item.active")
            ?.classList.remove("active");

        item.classList.add("active");

    });

});