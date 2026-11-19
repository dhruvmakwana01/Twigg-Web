/* =========================================================
   SEARCH DATA
========================================================= */

/*
 * Categories come from the shared file ../shared/categories.js
 * (the same two categories, images and keywords used by Home
 * and Creators). Edit them there, not here.
 */

const categories =
    window.TwiggCategories
        ? window.TwiggCategories.getAll()
        : [];


/* =========================================================
   CREATOR DATA
========================================================= */

const creators = [

    {
        name: "Arjun Mehta",
        role: "Video Editor",
        image: "https://i.pravatar.cc/150?img=12"
    },

    {
        name: "Riya Shah",
        role: "Graphic Designer",
        image: "https://i.pravatar.cc/150?img=47"
    },

    {
        name: "Kabir Patel",
        role: "Motion Designer",
        image: "https://i.pravatar.cc/150?img=11"
    },

    {
        name: "Ananya Kapoor",
        role: "Brand Designer",
        image: "https://i.pravatar.cc/150?img=32"
    },

    {
        name: "Dev Malhotra",
        role: "Video Editor",
        image: "https://i.pravatar.cc/150?img=13"
    },

    {
        name: "Meera Joshi",
        role: "UI/UX Designer",
        image: "https://i.pravatar.cc/150?img=44"
    },

    {
        name: "Aditya Rao",
        role: "Graphic Designer",
        image: "https://i.pravatar.cc/150?img=15"
    },

    {
        name: "Sara Khan",
        role: "Motion Designer",
        image: "https://i.pravatar.cc/150?img=45"
    }

];


/* =========================================================
   ELEMENTS
========================================================= */

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const defaultContent =
    document.getElementById("defaultContent");

const recentSection =
    document.getElementById("recentSection");

const recentSearchesContainer =
    document.getElementById("recentSearches");

const clearRecent =
    document.getElementById("clearRecent");

const resultsContainer =
    document.getElementById("resultsContainer");

const categoryResults =
    document.getElementById("categoryResults");

const creatorResults =
    document.getElementById("creatorResults");

const noResults =
    document.getElementById("noResults");

const allCategoriesContainer =
    document.getElementById("allCategories");


/* =========================================================
   RECENT SEARCH STORAGE
========================================================= */

const RECENT_KEY =
    "twiggRecentSearches";


function getRecentSearches() {

    try {

        return JSON.parse(
            localStorage.getItem(RECENT_KEY)
        ) || [];

    } catch {

        return [];

    }

}


function saveRecentSearch(term) {

    term = term.trim();

    if (!term) {
        return;
    }

    let searches =
        getRecentSearches();

    searches =
        searches.filter(
            item =>
                item.toLowerCase() !==
                term.toLowerCase()
        );

    searches.unshift(term);

    searches =
        searches.slice(0, 8);

    localStorage.setItem(
        RECENT_KEY,
        JSON.stringify(searches)
    );

}


/* =========================================================
   ALL CATEGORIES

   The tile itself is the shared Home-style tile built by
   categories.js; this page only decides what a click does.
========================================================= */

function createCategoryCard(category) {

    const card =
        window.TwiggCategories.createTile(
            category,
            { interactive: true }
        );

    const image =
        card.querySelector("img");

    if (image && window.TwiggSkeleton) {
        window.TwiggSkeleton.watchImage(card, image);
    }

    const open = () => {

        searchInput.value =
            category.name;

        saveRecentSearch(
            category.name
        );

        renderRecentSearches();

        performSearch(
            category.name
        );

        clearSearch.classList.add(
            "visible"
        );

    };

    card.addEventListener(
        "click",
        open
    );

    card.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                open();

            }

        }
    );

    return card;

}


function renderAllCategories() {

    allCategoriesContainer.innerHTML = "";

    categories.forEach(category => {

        allCategoriesContainer.appendChild(
            createCategoryCard(category)
        );

    });

}


/* =========================================================
   RECENT SEARCHES
========================================================= */

function renderRecentSearches() {

    const searches =
        getRecentSearches();

    recentSearchesContainer.innerHTML = "";


    if (searches.length === 0) {

        recentSection.classList.add(
            "hidden"
        );

        return;

    }


    recentSection.classList.remove(
        "hidden"
    );


    searches.forEach(term => {

        const row =
            document.createElement("div");

        row.className =
            "recent-search";


        /* -------------------------------------------------
           SEARCH TERM
        ------------------------------------------------- */

        const text =
            document.createElement("span");

        text.textContent = term;


        text.addEventListener(
            "click",
            () => {

                searchInput.value = term;

                clearSearch.classList.add(
                    "visible"
                );

                performSearch(term);

            }
        );


        /* -------------------------------------------------
           REMOVE X BUTTON
        ------------------------------------------------- */

        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.className =
            "remove-recent";

        removeButton.textContent = "×";

        removeButton.setAttribute(
            "aria-label",
            `Remove ${term}`
        );


        removeButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                let searches =
                    getRecentSearches();


                searches =
                    searches.filter(
                        item =>
                            item.toLowerCase() !==
                            term.toLowerCase()
                    );


                localStorage.setItem(
                    RECENT_KEY,
                    JSON.stringify(searches)
                );


                renderRecentSearches();

            }
        );


        row.appendChild(text);

        row.appendChild(removeButton);

        recentSearchesContainer.appendChild(
            row
        );

    });

}


/* =========================================================
   CREATOR CARD
========================================================= */

function createCreatorCard(creator) {

    const card =
        document.createElement("article");

    card.className =
        "creator-card";

    card.innerHTML = `

        <img
            src="${creator.image}"
            alt="${creator.name}" loading="lazy" data-sk="self">

        <div class="creator-info">

            <div class="creator-name">
                ${creator.name}
            </div>

            <div class="creator-role">
                ${creator.role}
            </div>

        </div>

    `;

    if (window.TwiggSkeleton) {
        window.TwiggSkeleton.scan(card);
    }

    return card;

}


/* =========================================================
   SEARCH
========================================================= */

function performSearch(term) {

    term =
        term.trim().toLowerCase();


    if (!term) {

        showDefaultState();

        return;

    }


    /* -----------------------------------------------------
       HIDE DEFAULT CONTENT
    ----------------------------------------------------- */

    defaultContent.classList.add(
        "hidden"
    );

    recentSection.classList.add(
        "hidden"
    );

    resultsContainer.classList.remove(
        "hidden"
    );


    /* -----------------------------------------------------
       MATCH CATEGORIES (name + keywords, from categories.js)
    ----------------------------------------------------- */

    const matchingCategories =
        categories.filter(category =>
            window.TwiggCategories.matches(
                category,
                term
            )
        );


    /* -----------------------------------------------------
       MATCH CREATORS
    ----------------------------------------------------- */

    const matchingCreators =
        creators.filter(creator => {

            const searchableText = (
                creator.name +
                " " +
                creator.role
            ).toLowerCase();

            return searchableText.includes(
                term
            );

        });


    /* -----------------------------------------------------
       RENDER CATEGORIES
    ----------------------------------------------------- */

    categoryResults.innerHTML = "";

    matchingCategories.forEach(
        category => {

            categoryResults.appendChild(
                createCategoryCard(category)
            );

        }
    );


    /* -----------------------------------------------------
       RENDER CREATORS
    ----------------------------------------------------- */

    creatorResults.innerHTML = "";

    matchingCreators.forEach(
        creator => {

            creatorResults.appendChild(
                createCreatorCard(creator)
            );

        }
    );


    /* -----------------------------------------------------
       EMPTY SECTIONS
    ----------------------------------------------------- */

    const categorySection =
        categoryResults.parentElement;

    const creatorSection =
        creatorResults.parentElement;


    if (matchingCategories.length === 0) {

        categorySection.classList.add(
            "hidden"
        );

    } else {

        categorySection.classList.remove(
            "hidden"
        );

    }


    if (matchingCreators.length === 0) {

        creatorSection.classList.add(
            "hidden"
        );

    } else {

        creatorSection.classList.remove(
            "hidden"
        );

    }


    /* -----------------------------------------------------
       NO RESULTS
    ----------------------------------------------------- */

    if (
        matchingCategories.length === 0 &&
        matchingCreators.length === 0
    ) {

        noResults.classList.remove(
            "hidden"
        );

    } else {

        noResults.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   DEFAULT STATE
========================================================= */

function showDefaultState() {

    defaultContent.classList.remove(
        "hidden"
    );

    resultsContainer.classList.add(
        "hidden"
    );

    noResults.classList.add(
        "hidden"
    );

}


/* =========================================================
   SEARCH INPUT
========================================================= */

/*
 * Clicking/focusing the search bar does NOT
 * hide All Categories.
 *
 * If recent searches exist, they appear
 * underneath the default content.
 */

searchInput.addEventListener(
    "focus",
    () => {

        renderRecentSearches();

    }
);


searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value.trim();


        /* -------------------------------------------------
           USER IS TYPING
        ------------------------------------------------- */

        if (value) {

            clearSearch.classList.add(
                "visible"
            );

            recentSection.classList.add(
                "hidden"
            );

            performSearch(value);

        }


        /* -------------------------------------------------
           USER DELETED EVERYTHING
        ------------------------------------------------- */

        else {

            clearSearch.classList.remove(
                "visible"
            );

            showDefaultState();

            /*
             * Return to:
             *
             * All Categories
             *
             * Recent Searches will appear
             * underneath if they exist.
             */

            renderRecentSearches();

        }

    }
);


/* =========================================================
   ENTER KEY
========================================================= */

searchInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            const term =
                searchInput.value.trim();

            if (term) {

                saveRecentSearch(term);

                renderRecentSearches();

                performSearch(term);

            }

        }

    }
);


/* =========================================================
   CLEAR SEARCH
========================================================= */

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearch.classList.remove(
            "visible"
        );

        showDefaultState();

        renderRecentSearches();

        searchInput.focus();

    }
);


/* =========================================================
   CLEAR ALL RECENT SEARCHES
========================================================= */

clearRecent.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            RECENT_KEY
        );

        renderRecentSearches();

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );


navItems.forEach(item => {

    item.addEventListener(
        "click",
        event => {

            const href =
                item.getAttribute("href");


            /*
             * Only prevent default for
             * placeholder links.
             *
             * Real links such as Reels
             * must still navigate.
             */

            if (
                !href ||
                href === "#"
            ) {

                event.preventDefault();

            }


            navItems.forEach(nav => {

                nav.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );

        }
    );

});


/* =========================================================
   INITIALIZE
========================================================= */

renderAllCategories();

renderRecentSearches();