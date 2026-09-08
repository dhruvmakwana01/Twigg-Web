/* =========================================================
   SEARCH DATA
========================================================= */

const categories = [

    {
        name: "Video Editing",
        image: "https://i.pinimg.com/1200x/ac/25/83/ac2583076b9bb7f97c7d94390d101373.jpg",
        keywords:
            "video editing editor videos reels youtube short form long form"
    },

    {
        name: "Social Media Design",
        image: "https://i.pinimg.com/1200x/f0/10/30/f010301be8f9d67a390f94983756463f.jpg",
        keywords:
            "social media design instagram facebook posts social content"
    },

    {
        name: "Logo Design",
        image: "https://i.pinimg.com/1200x/b8/4e/5f/b84e5fc3f2a69397a976a284767d3c0b.jpg",
        keywords:
            "logo design logos brand identity designer"
    },

    {
        name: "Web & Mobile Design",
        image: "https://i.pinimg.com/736x/e4/27/99/e42799695833e5259ca324b2a4bec8e6.jpg",
        keywords:
            "web mobile website app ui ux interface design"
    },

    {
        name: "Branding",
        image: "https://i.pinimg.com/736x/07/77/a8/0777a871e588f0f3ca433585eae6fd36.jpg",
        keywords:
            "branding brand identity visual identity brand design"
    },

    {
        name: "Motion Graphics",
        image: "https://i.pinimg.com/736x/2d/a8/39/2da839435973fdd6cbd1fc7ef241d2fe.jpg",
        keywords:
            "motion graphics animation motion design animated"
    },

    {
        name: "Packaging Design",
        image: "https://i.pinimg.com/736x/3f/58/b6/3f58b6094eb21c868274b1c47e92429d.jpg",
        keywords:
            "packaging package product box label design"
    },

    {
        name: "Logo Animation",
        image: "https://i.pinimg.com/736x/08/94/6b/08946b7a8885fb1a23d765b9df84f3a0.jpg",
        keywords:
            "logo animation animated logo motion logo"
    },

    {
        name: "3D Product Animation",
        image: "https://i.pinimg.com/736x/d6/49/d2/d649d20f69d648981f981ea452b281e9.jpg",
        keywords:
            "3d product animation three dimensional product rendering"
    },

    {
        name: "Book Design",
        image: "https://i.pinimg.com/736x/c5/fb/10/c5fb101720b7f715545c846839039789.jpg",
        keywords:
            "book design cover books editorial publication"
    },

    {
        name: "Intro & Outro Videos",
        image: "https://i.pinimg.com/736x/00/bb/fe/00bbfe12608747031524389ddcf67403.jpg",
        keywords:
            "intro outro videos opening ending youtube video"
    }

];


/* =========================================================
   POPULAR SEARCHES
========================================================= */

const popularSearches = [
    "Video Editing",
    "Logo Design",
    "Photography",
    "Motion Graphics",
    "Web Design",
    "Social Media"
];


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

const popularSearchesContainer =
    document.getElementById("popularSearches");

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
   POPULAR SEARCHES
========================================================= */

function renderPopularSearches() {

    popularSearchesContainer.innerHTML = "";

    popularSearches.forEach(term => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "popular-search";

        button.textContent = term;

        button.addEventListener(
            "click",
            () => {

                searchInput.value = term;

                saveRecentSearch(term);

                renderRecentSearches();

                performSearch(term);

                clearSearch.classList.add(
                    "visible"
                );

            }
        );

        popularSearchesContainer.appendChild(
            button
        );

    });

}


/* =========================================================
   ALL CATEGORIES
========================================================= */

function createCategoryCard(category) {

    const card =
        document.createElement("article");

    card.className =
        "category-card";

    card.innerHTML = `

        <img
            src="${category.image}"
            alt="${category.name}"
            loading="lazy"
        >

        <div class="category-card-name">
            ${category.name}
        </div>

    `;

    card.addEventListener(
        "click",
        () => {

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
            alt="${creator.name}"
            loading="lazy"
        >

        <div class="creator-info">

            <div class="creator-name">
                ${creator.name}
            </div>

            <div class="creator-role">
                ${creator.role}
            </div>

        </div>

    `;

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
       MATCH CATEGORIES
    ----------------------------------------------------- */

    const matchingCategories =
        categories.filter(category => {

            const searchableText = (
                category.name +
                " " +
                category.keywords
            ).toLowerCase();

            return searchableText.includes(
                term
            );

        });


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
 * hide Popular Searches or All Categories.
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
             * Popular Searches
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

renderPopularSearches();

renderAllCategories();

renderRecentSearches();