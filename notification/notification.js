/* =========================================================
   TWIGG NOTIFICATIONS
   Include after filter.css + notification.css on every page.

   Hooks (add to your existing markup):
     data-notif-toggle   on the notification button in the
                         desktop sidebar AND the mobile bottom bar.
                         A red count badge (same as the Messages
                         page .nav-badge) is added to its icon.

   Public API (window.TwiggNotifications):
     add({ type, name, avatar, amount, client, read })
     markRead(id) / unreadCount() / open() / close()

   Colour variants: each type in TYPES can set `variant`
   ("approved" | "order" | "transfer"). The matching
   .is-<variant> class is put on both the row and the avatar.

   State persists in localStorage, so read/unread survives
   navigation between Twigg pages (and syncs across tabs).
========================================================= */

(function () {
    "use strict";

    var STORE_KEY = "twigg.notifications.v2";
    var MOBILE_QUERY = "(max-width: 800px)";
    var MAX_ITEMS = 100;

    var ICONS = {
        close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
        back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
        delivery: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
        // Bank building (roof, columns, base): no currency symbol
        bank: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3L3 9h18L12 3z"/><path d="M5 9v9M9.5 9v9M14.5 9v9M19 9v9"/><path d="M3 21h18"/></svg>',
        // Shopping bag with a tick
        order: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 11H6L5 8z"/><path d="M9 8V7a3 3 0 016 0v1"/><path d="M9.5 13.5l2 2 3.5-3.5"/></svg>'
    };

    /* ---------- Message templates ---------- */

    function esc(value) {
        var d = document.createElement("div");
        d.textContent = value == null ? "" : String(value);
        return d.innerHTML;
    }

    function formatAmount(n) {
        var num = Number(n);
        if (isNaN(num)) return esc(n);
        return "\u20B9" + num.toLocaleString("en-IN");
    }

    var TYPES = {
        delivery_approved: {
            person: false,
            variant: "approved",
            icon: "delivery",
            text: function (n) {
                return "Your delivery was approved by <strong>" + esc(n.client || n.name || "your client") + "</strong>.";
            }
        },
        wallet_transfer: {
            person: false,
            variant: "transfer",
            icon: "bank",
            text: function (n) {
                return "<strong>" + formatAmount(n.amount) + "</strong> has been transferred to your bank account.";
            }
        },
        new_like: {
            person: true,
            text: function (n) {
                return "<strong>" + esc(n.name) + "</strong> liked your creation.";
            }
        },
        new_booking: {
            person: true,
            text: function (n) {
                return "<strong>" + esc(n.name) + "</strong> booked your service.";
            }
        },
        order_completed: {
            person: false,
            variant: "order",
            icon: "order",
            text: function () {
                return "Your order has been completed.";
            }
        }
    };

    /* ---------- Store ---------- */

    function uid() {
        return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function load() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (raw === null) return null;
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return null;
        }
    }

    function save() {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(items));
        } catch (e) { /* storage unavailable: state lives for this page only */ }
    }

    function seed() {
        var now = Date.now();
        var m = 60000, h = 60 * m, d = 24 * h;
        return [
            { id: uid(), type: "new_booking", name: "Aarav Studio", createdAt: now - 20000, read: false },
            { id: uid(), type: "wallet_transfer", amount: 4500, createdAt: now - 2 * m, read: false },
            { id: uid(), type: "new_like", name: "Maya Designs", createdAt: now - h, read: false },
            { id: uid(), type: "delivery_approved", client: "Pixel Forge", createdAt: now - 6 * h, read: true },
            { id: uid(), type: "order_completed", createdAt: now - 30 * h, read: true },
            { id: uid(), type: "new_like", name: "Nora Creative", createdAt: now - 3 * d, read: true }
        ];
    }

    var items = load();
    if (items === null) {
        // First run only: demo data so the panel is visible. Remove seed()
        // once notifications come from your backend.
        items = seed();
        save();
    }

    /* ---------- Time ---------- */

    function relTime(ts) {
        var s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
        if (s < 60) return "now";
        var m = Math.floor(s / 60);
        if (m < 60) return m + "m";
        var h = Math.floor(m / 60);
        if (h < 24) return h + "h";
        var d = Math.floor(h / 24);
        if (d === 1) return "Yesterday";
        return d + "d";
    }

    /* ---------- DOM ---------- */

    var backdrop, panel, list, lastToggle = null;
    var isOpen = false;

    function build() {
        backdrop = document.createElement("div");
        backdrop.className = "nt-backdrop";

        panel = document.createElement("aside");
        panel.className = "nt-panel";
        panel.id = "twigg-notifications";
        panel.tabIndex = -1;
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "false");
        panel.setAttribute("aria-labelledby", "nt-title");

        panel.innerHTML =
            '<div class="fs-header">' +
                '<button type="button" class="fs-icon-btn fs-back" aria-label="Back">' + ICONS.back + "</button>" +
                '<h2 class="fs-title" id="nt-title">Notifications</h2>' +
                '<button type="button" class="fs-icon-btn fs-close" aria-label="Close notifications">' + ICONS.close + "</button>" +
            "</div>" +
            '<div class="nt-body">' +
                '<ul class="nt-list"></ul>' +
                '<p class="nt-empty">No notifications yet.</p>' +
            "</div>";

        document.body.appendChild(backdrop);
        document.body.appendChild(panel);

        list = panel.querySelector(".nt-list");

        panel.querySelector(".fs-back").addEventListener("click", close);
        panel.querySelector(".fs-close").addEventListener("click", close);
        backdrop.addEventListener("click", close);

        // One delegated handler: clicking a row marks only that row as read.
        list.addEventListener("click", function (e) {
            var row = e.target.closest(".nt-row");
            if (row) markRead(row.getAttribute("data-id"));
        });
    }

    function avatarHTML(n, def) {
        if (def.person) {
            if (n.avatar) {
                return '<span class="nt-avatar"><img src="' + esc(n.avatar) + '" alt="" loading="lazy"></span>';
            }
            var initial = (n.name || "?").trim().charAt(0).toUpperCase();
            return '<span class="nt-avatar" aria-hidden="true">' + esc(initial) + "</span>";
        }
        // Coloured variant (approved / order / transfer) gets its own avatar colour.
        // Approved draws its tick in CSS; order and transfer show their icon.
        return '<span class="nt-avatar' + (def.variant ? " is-" + def.variant : "") + '" aria-hidden="true">' + ICONS[def.icon] + "</span>";
    }

    function render() {
        var sorted = items.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });

        list.innerHTML = sorted.map(function (n) {
            var def = TYPES[n.type];
            if (!def) return "";
            var unread = !n.read;
            return (
                '<li class="nt-item">' +
                    '<button type="button" class="nt-row' + (unread ? " is-unread" : "") + (def.variant ? " is-" + def.variant : "") + '" data-id="' + esc(n.id) + '">' +
                        avatarHTML(n, def) +
                        '<span class="nt-content">' +
                            '<p class="nt-text">' + def.text(n) + "</p>" +
                            '<time class="nt-time" datetime="' + new Date(n.createdAt).toISOString() + '">' + relTime(n.createdAt) + "</time>" +
                        "</span>" +
                        '<span class="nt-unread-dot"' + (unread ? ' role="img" aria-label="Unread"' : ' aria-hidden="true"') + "></span>" +
                    "</button>" +
                "</li>"
            );
        }).join("");

        panel.classList.toggle("is-empty", sorted.length === 0);
        updateIndicators();
    }

    function updateTimes() {
        var times = list.querySelectorAll(".nt-time");
        var sorted = items.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
        for (var i = 0; i < times.length && i < sorted.length; i++) {
            times[i].textContent = relTime(sorted[i].createdAt);
        }
    }

    /* ---------- Indicators ---------- */

    function unreadCount() {
        return items.filter(function (n) { return !n.read; }).length;
    }

    function updateIndicators() {
        var count = unreadCount();

        var toggles = document.querySelectorAll("[data-notif-toggle]");
        for (var i = 0; i < toggles.length; i++) {
            var t = toggles[i];
            if (!t.querySelector(".nt-nav-badge")) {
                // Attach to the icon wrapper, same structure as the Messages badge.
                var wrap = t.querySelector(".nav-icon-wrap, .nt-icon-wrap");
                if (!wrap) {
                    var icon = t.querySelector(".nav-icon") || t.querySelector("svg");
                    wrap = document.createElement("i");
                    wrap.className = "nt-icon-wrap";
                    if (icon && icon.parentNode) {
                        icon.parentNode.insertBefore(wrap, icon);
                        wrap.appendChild(icon);
                    } else {
                        t.appendChild(wrap);
                    }
                }
                var badge = document.createElement("i");
                badge.className = "nt-nav-badge";
                badge.setAttribute("aria-hidden", "true");
                wrap.appendChild(badge);
            }
            var b = t.querySelector(".nt-nav-badge");
            b.textContent = count > 99 ? "99+" : String(count);
            t.setAttribute("data-has-unread", count > 0 ? "true" : "false");
            t.setAttribute("aria-label", count > 0 ? "Notifications, " + count + " unread" : "Notifications");
            t.setAttribute("aria-expanded", isOpen ? "true" : "false");
            t.setAttribute("aria-controls", "twigg-notifications");
        }
    }

    /* ---------- Actions ---------- */

    function markRead(id) {
        var changed = false;
        items.forEach(function (n) {
            if (n.id === id && !n.read) { n.read = true; changed = true; }
        });
        if (!changed) return;
        save();

        // Update the row in place so the dot fades out immediately.
        var row = list.querySelector('.nt-row[data-id="' + id + '"]');
        if (row) {
            row.classList.remove("is-unread");
            var dot = row.querySelector(".nt-unread-dot");
            if (dot) { dot.removeAttribute("role"); dot.removeAttribute("aria-label"); dot.setAttribute("aria-hidden", "true"); }
        }
        updateIndicators();
    }

    function add(data) {
        if (!data || !TYPES[data.type]) return null;
        var n = {
            id: uid(),
            type: data.type,
            name: data.name,
            client: data.client,
            amount: data.amount,
            avatar: data.avatar,
            createdAt: data.createdAt || Date.now(),
            read: data.read === true
        };
        items.unshift(n);
        if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
        save();
        render();
        return n.id;
    }

    /* ---------- Open / close ---------- */

    function isMobile() {
        return window.matchMedia(MOBILE_QUERY).matches;
    }

    function open(trigger) {
        if (isOpen) return;
        if (trigger) lastToggle = trigger;

        // Let other panels (e.g. Filter & Sort) close themselves.
        document.dispatchEvent(new CustomEvent("twigg:panel-open", { detail: { panel: "notifications" } }));

        isOpen = true;
        updateTimes();
        panel.classList.add("is-open");
        backdrop.classList.add("is-open");
        updateIndicators();
        panel.focus({ preventScroll: true });
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        panel.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        updateIndicators();
        if (lastToggle && document.contains(lastToggle)) lastToggle.focus({ preventScroll: true });
    }

    function toggle(trigger) {
        if (isOpen) close(); else open(trigger);
    }

    /* ---------- Wiring ---------- */

    // If the nav button has no data-notif-toggle yet, find it by its
    // label/href inside the sidebar and tag it automatically.
    function autoTag() {
        var nodes = document.querySelectorAll(".sidebar a, .sidebar button, .nav-item, .mobile-topbar-icon");
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            if (el.hasAttribute("data-notif-toggle")) continue;
            var label = (el.textContent || "") + " " + (el.getAttribute("href") || "") + " " + (el.getAttribute("aria-label") || "");
            if (/notification/i.test(label)) el.setAttribute("data-notif-toggle", "");
        }
    }

    function init() {
        autoTag();
        build();
        render();

        // Delegated so the sidebar and mobile bar buttons both work,
        // even if they are rendered after this script runs.
        document.addEventListener("click", function (e) {
            var t = e.target.closest("[data-notif-toggle]");
            if (!t) return;
            // Capture phase + stopPropagation so a page's own link/nav
            // handlers (or an href) can't swallow the click.
            e.preventDefault();
            e.stopPropagation();
            toggle(t);
        }, true);

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && isOpen) close();
        });

        // Opening another panel closes this one.
        document.addEventListener("twigg:panel-open", function (e) {
            if (e.detail && e.detail.panel !== "notifications") close();
        });

        // Keep state in sync across tabs / pages.
        window.addEventListener("storage", function (e) {
            if (e.key !== STORE_KEY) return;
            var fresh = load();
            if (fresh) { items = fresh; render(); }
        });

        // Refresh relative timestamps while the panel is open.
        setInterval(function () { if (isOpen) updateTimes(); }, 30000);

        // Back/forward cache restores can show stale state.
        window.addEventListener("pageshow", function (e) {
            if (!e.persisted) return;
            var fresh = load();
            if (fresh) { items = fresh; render(); }
        });
    }

    window.TwiggNotifications = {
        add: add,
        markRead: markRead,
        unreadCount: unreadCount,
        open: function () { open(); },
        close: close
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();