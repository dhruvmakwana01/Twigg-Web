/* =========================================================
   TWIGG — SHARED CATEGORIES   (shared/categories.js)

   Single source of truth for the Categories section on
   Home, Creators and Search.

   TO CHANGE A CATEGORY: edit RAW_CATEGORIES below. Rename it,
   swap its image, add one or remove one. All three pages pick
   the change up automatically.

   `image` is relative to the site root (like every other asset);
   assetUrl() turns it into a working path from any page folder.

   Load this file BEFORE media-data.js and before the page's own
   script:

       <script src="../shared/categories.js"></script>

   API  (window.TwiggCategories)
     getAll()                      → [{ id, name, image, keywords }]
     getById(id) / getByName(name) → one category or null
     names()                       → ["Video Editing", ...]
     matches(category, term)       → true if term is in name / keywords
     createTile(category, opts)    → <div class="category"> element
     render(container, opts)       → fills container with tiles,
                                     returns the tile elements

   opts: { interactive: true }  adds role="button" + tabindex
         { toggle: true }       adds aria-pressed (filter toggles)
         { list: [...] }        render only these categories

   Any element with the attribute  data-twigg-categories  is
   filled automatically (used by the Home page).

   Tile markup (styled by the .categories / .category classes
   in home.css and search.css):

       <div class="category" data-category="Name">
           <img src="..." alt="Name">
           <div class="category-name">Name</div>
       </div>
========================================================= */

(() => {

    "use strict";

    const ASSET_ROOT = "../";

    function assetUrl(path) {

        if (!path) {
            return null;
        }

        return /^(https?:|data:|blob:|\/)/i.test(path)
            ? path
            : ASSET_ROOT + path;
    }


    /* =====================================================
       CATEGORY DATA  (edit here only)
    ===================================================== */

    const RAW_CATEGORIES = [

        {
            id: "video-editing",
            name: "Video Editing",
            image: "home/categoryimg/video_editing_icon_pastel_glass_large.png",
            keywords:
                "video editing editor videos reels youtube short form long form edit cut color grading intro outro"
        },

        {
            id: "ai-generated-videos",
            name: "AI Generated Videos",
            image: "home/categoryimg/ai_generated_video_editing_icon_larger_elements.png",
            keywords:
                "ai generated videos artificial intelligence generative video text to video avatar ai clone motion animation"
        }
    ];

    const categories = RAW_CATEGORIES.map(category =>
        Object.freeze({
            id: category.id,
            name: category.name,
            image: assetUrl(category.image),
            keywords: category.keywords || ""
        })
    );


    /* =====================================================
       LOOKUPS
    ===================================================== */

    function getAll() {
        return categories.slice();
    }

    function getById(id) {
        return categories.find(category => category.id === id) || null;
    }

    function getByName(name) {
        return categories.find(category => category.name === name) || null;
    }

    function names() {
        return categories.map(category => category.name);
    }

    function matches(category, term) {

        const query = String(term ?? "").trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (category.name + " " + category.keywords)
            .toLowerCase()
            .includes(query);
    }


    /* =====================================================
       RENDERING
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function createTile(category, options = {}) {

        const tile = document.createElement("div");

        tile.className = "category";

        tile.dataset.category = category.name;

        if (options.interactive) {
            tile.setAttribute("role", "button");
            tile.setAttribute("tabindex", "0");
        }

        if (options.toggle) {
            tile.setAttribute("aria-pressed", "false");
        }

        tile.innerHTML = `
            <img src="${escapeHtml(category.image)}" alt="${escapeHtml(category.name)}">
            <div class="category-name">${escapeHtml(category.name)}</div>
        `;

        return tile;
    }

    function render(container, options = {}) {

        if (!container) {
            return [];
        }

        const list = Array.isArray(options.list) ? options.list : categories;

        container.innerHTML = "";

        const tiles = list.map(category => createTile(category, options));

        tiles.forEach(tile => container.appendChild(tile));

        return tiles;
    }

    function renderAuto() {

        document
            .querySelectorAll("[data-twigg-categories]")
            .forEach(container => render(container));
    }

    /* This file is loaded at the end of <body>, so the containers
       already exist and the tiles are in place before the page's
       own script runs. */

    renderAuto();


    window.TwiggCategories = {

        getAll,

        getById,

        getByName,

        names,

        matches,

        createTile,

        render,

        assetUrl
    };

})();