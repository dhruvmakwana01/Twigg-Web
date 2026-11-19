/* =========================================================
   TWIGG FILTER & SORT PANEL

   Add filter.css + filter.js to a page and every
   ".filter-button" / ".mobile-filter-button" on it opens
   the panel. The panel markup is created here, so no HTML
   changes are needed.

   Closing:
   - click the Filter & Sort button again
   - X button (desktop / tablet) or Back arrow (mobile)
   - click outside the panel (desktop / tablet)
   - Escape key
   Closing without pressing Apply discards unapplied edits.

   When Apply is pressed:
   - the selection is saved for the session, so it carries
     across Twigg pages
   - a red count badge appears on the Filter & Sort buttons
     (number of applied filter groups, 0–3) and is restored
     on every page load
   - a "twigg:filters-change" event is fired on document with
     the filters in event.detail, so each page can react:

       document.addEventListener("twigg:filters-change", e => {
           console.log(e.detail);
           // { categories: [], priceMin: 0, priceMax: 1000, delivery: "any" }
       });

   window.TwiggFilters.open() / .close() / .getState() are
   also available.

   Only one side panel is open at a time: opening this panel
   fires "twigg:panel-open" so other panels (Notifications)
   close, and vice versa.
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CONFIG
    ===================================================== */

    const CURRENCY = "$";

    const PRICE_MIN = 0;
    const PRICE_MAX = 1000;
    const PRICE_STEP = 10;

    const STORAGE_KEY = "twigg_filters";

    const TRIGGER_SELECTOR =
        ".filter-button, .mobile-filter-button";

    const CATEGORIES = [
        "Video Editing",
        "AI Generated Videos",
    ];

    const DELIVERY_OPTIONS = [
        { id: "any", label: "Any time" },
        { id: "24h", label: "24 hours" },
        { id: "3d",  label: "Up to 3 days" },
        { id: "7d",  label: "Up to 7 days" },
        { id: "14d", label: "Up to 14 days" }
    ];

    const ICONS = {

        close: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12"></path>
                <path d="M18 6L6 18"></path>
            </svg>
        `,

        back: `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7"></path>
            </svg>
        `
    };


    /* =====================================================
       STATE
    ===================================================== */

    const defaultState = () => ({
        categories: [],
        priceMin: PRICE_MIN,
        priceMax: PRICE_MAX,
        delivery: "any"
    });

    const clone = state => ({
        ...state,
        categories: [...state.categories]
    });

    function clampPrice(value) {

        const number = Number(value);

        if (!Number.isFinite(number)) {
            return null;
        }

        const stepped =
            Math.round(number / PRICE_STEP) * PRICE_STEP;

        return Math.min(
            PRICE_MAX,
            Math.max(PRICE_MIN, stepped)
        );
    }

    function sanitize(raw) {

        const state = defaultState();

        if (!raw || typeof raw !== "object") {
            return state;
        }

        if (Array.isArray(raw.categories)) {

            state.categories =
                raw.categories.filter(
                    name => CATEGORIES.includes(name)
                );
        }

        const min = clampPrice(raw.priceMin);
        const max = clampPrice(raw.priceMax);

        if (min !== null) {
            state.priceMin = min;
        }

        if (max !== null) {
            state.priceMax = max;
        }

        if (state.priceMin > state.priceMax) {
            state.priceMin = PRICE_MIN;
            state.priceMax = PRICE_MAX;
        }

        if (
            DELIVERY_OPTIONS.some(
                option => option.id === raw.delivery
            )
        ) {
            state.delivery = raw.delivery;
        }

        return state;
    }

    function loadState() {

        try {

            return sanitize(
                JSON.parse(
                    sessionStorage.getItem(STORAGE_KEY)
                )
            );

        } catch {

            return defaultState();
        }
    }

    function saveState(state) {

        try {

            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch {}
    }

    /* Applied (committed) filters, and the working copy that
       is edited while the panel is open. */

    let applied = loadState();
    let draft = clone(applied);

    let isOpen = false;
    let lastTrigger = null;


    /* =====================================================
       APPLIED-FILTERS INDICATOR

       A filter "group" counts as applied when it differs
       from its default: category, price, delivery time.
    ===================================================== */

    function activeCount(state) {

        let count = 0;

        if (state.categories.length) {
            count++;
        }

        if (
            state.priceMin > PRICE_MIN ||
            state.priceMax < PRICE_MAX
        ) {
            count++;
        }

        if (state.delivery !== "any") {
            count++;
        }

        return count;
    }

    function updateIndicators() {

        const count = activeCount(applied);

        document
            .querySelectorAll(TRIGGER_SELECTOR)
            .forEach(trigger => {

                let badge =
                    trigger.querySelector(":scope > .fs-badge");

                if (!badge) {

                    /* <i>, not <span>, so page CSS that hides
                       spans inside nav buttons can't hide it. */

                    badge = document.createElement("i");

                    badge.className = "fs-badge";
                    badge.setAttribute("aria-hidden", "true");

                    trigger.appendChild(badge);
                }

                if (trigger.dataset.fsLabel === undefined) {

                    trigger.dataset.fsLabel =
                        trigger.getAttribute("aria-label") || "";
                }

                badge.textContent = String(count);

                trigger.dataset.filtered =
                    count > 0 ? "true" : "false";

                const base =
                    trigger.dataset.fsLabel || "Filter & Sort";

                if (count > 0) {

                    trigger.setAttribute(
                        "aria-label",
                        base + ", " + count + " applied"
                    );

                } else if (trigger.dataset.fsLabel) {

                    trigger.setAttribute(
                        "aria-label",
                        trigger.dataset.fsLabel
                    );

                } else {

                    trigger.removeAttribute("aria-label");
                }
            });
    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function formatPrice(value) {

        return CURRENCY + value.toLocaleString("en-US");
    }

    function createElement(tag, className, text) {

        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }


    /* =====================================================
       BUILD PANEL
    ===================================================== */

    function init() {

        if (document.querySelector(".fs-panel")) {
            return;
        }


        /* ---------- backdrop ---------- */

        const backdrop =
            createElement("div", "fs-backdrop");


        /* ---------- panel shell ---------- */

        const panel =
            createElement("aside", "fs-panel");

        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "Filter and sort");
        panel.setAttribute("aria-hidden", "true");
        panel.tabIndex = -1;

        panel.innerHTML = `
            <header class="fs-header">

                <button type="button" class="fs-icon-btn fs-back" aria-label="Back">
                    ${ICONS.back}
                </button>

                <h2 class="fs-title">Filter &amp; Sort</h2>

                <button type="button" class="fs-icon-btn fs-close" aria-label="Close filters">
                    ${ICONS.close}
                </button>

            </header>

            <div class="fs-body">

                <section class="fs-section">

                    <div class="fs-section-head">
                        <h3 class="fs-section-title">Category</h3>
                        <span class="fs-count"></span>
                    </div>

                    <div class="fs-chips"></div>

                </section>

                <section class="fs-section">

                    <div class="fs-section-head">
                        <h3 class="fs-section-title">Price</h3>
                        <span class="fs-price-summary"></span>
                    </div>

                    <div class="fs-range">

                        <div class="fs-range-track">
                            <div class="fs-range-fill"></div>
                        </div>

                        <input
                            type="range"
                            class="fs-range-input fs-range-min"
                            min="${PRICE_MIN}"
                            max="${PRICE_MAX}"
                            step="${PRICE_STEP}"
                            aria-label="Minimum price"
                        >

                        <input
                            type="range"
                            class="fs-range-input fs-range-max"
                            min="${PRICE_MIN}"
                            max="${PRICE_MAX}"
                            step="${PRICE_STEP}"
                            aria-label="Maximum price"
                        >

                    </div>

                    <div class="fs-price-fields">

                        <label class="fs-field">
                            <span class="fs-field-label">Min</span>
                            <span class="fs-field-box">
                                <em>${CURRENCY}</em>
                                <input
                                    type="number"
                                    class="fs-price-min-input"
                                    inputmode="numeric"
                                    min="${PRICE_MIN}"
                                    max="${PRICE_MAX}"
                                    step="${PRICE_STEP}"
                                >
                            </span>
                        </label>

                        <span class="fs-field-dash">–</span>

                        <label class="fs-field">
                            <span class="fs-field-label">Max</span>
                            <span class="fs-field-box">
                                <em>${CURRENCY}</em>
                                <input
                                    type="number"
                                    class="fs-price-max-input"
                                    inputmode="numeric"
                                    min="${PRICE_MIN}"
                                    max="${PRICE_MAX}"
                                    step="${PRICE_STEP}"
                                >
                            </span>
                        </label>

                    </div>

                </section>

                <section class="fs-section">

                    <div class="fs-section-head">
                        <h3 class="fs-section-title">Delivery time</h3>
                    </div>

                    <div class="fs-options" role="radiogroup" aria-label="Delivery time"></div>

                </section>

            </div>

            <footer class="fs-footer">

                <button type="button" class="fs-clear">Clear all</button>

                <button type="button" class="fs-apply">Apply</button>

            </footer>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(panel);


        /* ---------- references ---------- */

        const q = selector => panel.querySelector(selector);

        const chipsWrap = q(".fs-chips");
        const optionsWrap = q(".fs-options");
        const countBadge = q(".fs-count");

        const range = q(".fs-range");
        const rangeMin = q(".fs-range-min");
        const rangeMax = q(".fs-range-max");

        const fieldMin = q(".fs-price-min-input");
        const fieldMax = q(".fs-price-max-input");

        const priceSummary = q(".fs-price-summary");


        /* ---------- category chips ---------- */

        CATEGORIES.forEach(name => {

            const chip =
                createElement("button", "fs-chip", name);

            chip.type = "button";
            chip.dataset.category = name;
            chip.setAttribute("aria-pressed", "false");

            chipsWrap.appendChild(chip);
        });


        /* ---------- delivery options ---------- */

        DELIVERY_OPTIONS.forEach(option => {

            const row =
                createElement("button", "fs-option");

            row.type = "button";
            row.dataset.delivery = option.id;
            row.setAttribute("role", "radio");
            row.setAttribute("aria-checked", "false");

            row.appendChild(
                createElement("span", "", option.label)
            );

            row.appendChild(
                createElement("span", "fs-radio")
            );

            optionsWrap.appendChild(row);
        });


        /* =================================================
           RENDER
        ================================================= */

        function renderCategories() {

            chipsWrap
                .querySelectorAll(".fs-chip")
                .forEach(chip => {

                    chip.setAttribute(
                        "aria-pressed",
                        String(
                            draft.categories.includes(
                                chip.dataset.category
                            )
                        )
                    );
                });

            const total = draft.categories.length;

            countBadge.textContent = String(total);

            countBadge.classList.toggle(
                "is-visible",
                total > 0
            );
        }

        function renderPrice() {

            const span = PRICE_MAX - PRICE_MIN;

            range.style.setProperty(
                "--a",
                String((draft.priceMin - PRICE_MIN) / span)
            );

            range.style.setProperty(
                "--b",
                String((draft.priceMax - PRICE_MIN) / span)
            );

            rangeMin.value = draft.priceMin;
            rangeMax.value = draft.priceMax;

            fieldMin.value = draft.priceMin;
            fieldMax.value = draft.priceMax;

            /*
               When both thumbs overlap, keep the one that can
               still move on top so it never gets stuck.
            */

            const minOnTop =
                draft.priceMin > PRICE_MIN + span / 2;

            rangeMin.style.zIndex = minOnTop ? "3" : "2";
            rangeMax.style.zIndex = minOnTop ? "2" : "3";

            priceSummary.textContent =
                formatPrice(draft.priceMin) +
                " – " +
                formatPrice(draft.priceMax) +
                (draft.priceMax === PRICE_MAX ? "+" : "");
        }

        function renderDelivery() {

            optionsWrap
                .querySelectorAll(".fs-option")
                .forEach(row => {

                    row.setAttribute(
                        "aria-checked",
                        String(
                            row.dataset.delivery ===
                            draft.delivery
                        )
                    );
                });
        }

        function render() {

            renderCategories();
            renderPrice();
            renderDelivery();
        }


        /* =================================================
           OPEN / CLOSE
        ================================================= */

        function setTriggersExpanded(expanded) {

            document
                .querySelectorAll(TRIGGER_SELECTOR)
                .forEach(trigger => {

                    trigger.setAttribute(
                        "aria-expanded",
                        String(expanded)
                    );
                });
        }

        function open(trigger) {

            if (isOpen) {
                return;
            }

            /* Let other panels (Notifications) close themselves. */

            document.dispatchEvent(
                new CustomEvent(
                    "twigg:panel-open",
                    { detail: { panel: "filter" } }
                )
            );

            draft = clone(applied);

            render();

            isOpen = true;
            lastTrigger = trigger || null;

            panel.classList.add("is-open");
            backdrop.classList.add("is-open");

            panel.setAttribute("aria-hidden", "false");

            setTriggersExpanded(true);

            panel.focus({ preventScroll: true });
        }

        function close() {

            if (!isOpen) {
                return;
            }

            isOpen = false;

            const focusWasInside =
                panel.contains(document.activeElement);

            panel.classList.remove("is-open");
            backdrop.classList.remove("is-open");

            panel.setAttribute("aria-hidden", "true");

            setTriggersExpanded(false);

            /* Closing without Apply discards unapplied edits. */

            draft = clone(applied);

            if (
                focusWasInside &&
                lastTrigger &&
                document.contains(lastTrigger)
            ) {
                lastTrigger.focus({ preventScroll: true });
            }
        }

        function toggle(trigger) {

            if (isOpen) {
                close();
            } else {
                open(trigger);
            }
        }


        /* =================================================
           EVENTS — OPEN / CLOSE
        ================================================= */

        /*
           One delegated listener handles both the sidebar
           "Filter & Sort" button and the mobile floating one.
        */

        document.addEventListener(
            "click",
            event => {

                const trigger =
                    event.target.closest(TRIGGER_SELECTOR);

                if (!trigger) {
                    return;
                }

                event.preventDefault();

                toggle(trigger);
            }
        );

        q(".fs-close").addEventListener("click", close);
        q(".fs-back").addEventListener("click", close);

        backdrop.addEventListener("click", close);

        panel.addEventListener(
            "keydown",
            event => {

                /*
                   Keep keys typed inside the panel from reaching
                   page-level shortcuts (for example the Reels
                   Arrow Up / Arrow Down navigation).
                */

                event.stopPropagation();

                if (event.key === "Escape") {
                    close();
                }
            }
        );

        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape" && isOpen) {
                    close();
                }
            }
        );

        /* Opening another panel (Notifications) closes this one. */

        document.addEventListener(
            "twigg:panel-open",
            event => {

                if (
                    event.detail &&
                    event.detail.panel !== "filter"
                ) {
                    close();
                }
            }
        );


        /* =================================================
           EVENTS — CATEGORY
        ================================================= */

        chipsWrap.addEventListener(
            "click",
            event => {

                const chip =
                    event.target.closest(".fs-chip");

                if (!chip) {
                    return;
                }

                const name = chip.dataset.category;

                draft.categories =
                    draft.categories.includes(name)
                        ? draft.categories.filter(
                            item => item !== name
                        )
                        : [...draft.categories, name];

                renderCategories();
            }
        );


        /* =================================================
           EVENTS — PRICE
        ================================================= */

        rangeMin.addEventListener(
            "input",
            () => {

                draft.priceMin =
                    Math.min(
                        Number(rangeMin.value),
                        draft.priceMax - PRICE_STEP
                    );

                renderPrice();
            }
        );

        rangeMax.addEventListener(
            "input",
            () => {

                draft.priceMax =
                    Math.max(
                        Number(rangeMax.value),
                        draft.priceMin + PRICE_STEP
                    );

                renderPrice();
            }
        );

        fieldMin.addEventListener(
            "change",
            () => {

                const value = clampPrice(fieldMin.value);

                if (value !== null) {

                    draft.priceMin =
                        Math.min(
                            value,
                            draft.priceMax - PRICE_STEP
                        );
                }

                renderPrice();
            }
        );

        fieldMax.addEventListener(
            "change",
            () => {

                const value = clampPrice(fieldMax.value);

                if (value !== null) {

                    draft.priceMax =
                        Math.max(
                            value,
                            draft.priceMin + PRICE_STEP
                        );
                }

                renderPrice();
            }
        );


        /* =================================================
           EVENTS — DELIVERY
        ================================================= */

        optionsWrap.addEventListener(
            "click",
            event => {

                const row =
                    event.target.closest(".fs-option");

                if (!row) {
                    return;
                }

                draft.delivery = row.dataset.delivery;

                renderDelivery();
            }
        );


        /* =================================================
           EVENTS — CLEAR / APPLY
        ================================================= */

        q(".fs-clear").addEventListener(
            "click",
            () => {

                draft = defaultState();

                render();
            }
        );

        q(".fs-apply").addEventListener(
            "click",
            () => {

                applied = clone(draft);

                saveState(applied);

                updateIndicators();

                close();

                document.dispatchEvent(
                    new CustomEvent(
                        "twigg:filters-change",
                        { detail: clone(applied) }
                    )
                );
            }
        );


        /* ---------- initial state ---------- */

        render();

        setTriggersExpanded(false);

        updateIndicators();


        /* ---------- public API ---------- */

        window.TwiggFilters = {
            open: () => open(null),
            close,
            getState: () => clone(applied)
        };
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();