/* =========================================================
   TWIGG MESSAGES — JAVASCRIPT

   Demo data lives in `conversations` below. Replace it with
   your real data source; everything else renders from it.

   Tip: open message.html?empty=1 to preview the empty state.
========================================================= */

(() => {

    "use strict";

    /* =====================================================
       SAMPLE DATA

       `ago` values are minutes before page load.
    ===================================================== */

    const NOW = Date.now();

    const MIN = 60000;

    const FORCE_EMPTY =
        new URLSearchParams(location.search).get("empty") === "1";

    const PHOTO = {

        mood: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=max&w=800&q=85",

        logoA: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=max&w=800&q=85",

        logoB: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=max&w=800&q=85"

    };

    const msg = (from, text, ago, extra = {}) => ({

        from,

        text,

        ts: NOW - ago * MIN,

        status: from === "me" ? "read" : undefined,

        ...extra

    });

    const image = src => ({

        type: "image",

        src

    });

    const file = (name, size, src = "") => ({

        type: "file",

        name,

        size,

        src

    });

    const conversations = FORCE_EMPTY ? [] : [

        {

            id: "alex",

            name: "Alex Morgan",

            handle: "alex.morgan",

            img: 12,

            status: "Active now",

            online: true,

            unread: 0,

            messages: [

                msg(
                    "them",
                    "Hey! I saw your portfolio on Twigg. Are you available for a brand identity project?",
                    190
                ),

                msg(
                    "me",
                    "Hi Alex, yes — I have space next week. What's the brand about?",
                    185
                ),

                msg(
                    "them",
                    "A small specialty coffee roaster. Warm, modern, a little editorial.",
                    180
                ),

                msg(
                    "them",
                    "Here's the mood board I've been collecting.",
                    179,
                    {
                        attach: image(PHOTO.mood)
                    }
                ),

                msg(
                    "me",
                    "Love the direction. I'll put together three logo routes and share them tomorrow.",
                    120
                ),

                msg(
                    "them",
                    "Perfect. Budget and timeline are as we discussed on the listing.",
                    95
                ),

                msg(
                    "me",
                    "Great, I've started on the first route. Sending a preview now.",
                    60
                ),

                msg(
                    "me",
                    "",
                    59,
                    {
                        attach: file(
                            "Route-01-preview.pdf",
                            "2.4 MB"
                        )
                    }
                ),

                msg(
                    "them",
                    "Sounds good, let's proceed with the second direction.",
                    20
                )

            ]

        },

        {

            id: "sarah",

            name: "Sarah Mitchell",

            handle: "sarah.mitchell",

            img: 47,

            status: "Last active 2h ago",

            online: false,

            unread: 2,

            messages: [

                msg(
                    "them",
                    "Hi! Thanks for choosing my logo design service. Could you share a few brands you like?",
                    1560
                ),

                msg(
                    "me",
                    "Sure. Aesop and Kinfolk are close to the feel I want: minimal, warm, lots of space.",
                    1540
                ),

                msg(
                    "them",
                    "Got it. I'll start sketching and update you soon.",
                    1535
                ),

                msg(
                    "them",
                    "Quick update: the first sketches are done.",
                    400,
                    {
                        attach: image(PHOTO.logoA)
                    }
                ),

                msg(
                    "them",
                    "Two colour variations below.",
                    362,
                    {
                        attach: image(PHOTO.logoB)
                    }
                ),

                msg(
                    "them",
                    "Your logo concept is ready for review. Let me know what you think!",
                    360
                )

            ]

        },

        {

            id: "daniel",

            name: "Daniel Smith",

            handle: "daniel.edits",

            img: 33,

            status: "Last active 1h ago",

            online: false,

            unread: 1,

            messages: [

                msg(
                    "me",
                    "Hi Daniel, could you recut the intro down to 15 seconds?",
                    2900
                ),

                msg(
                    "them",
                    "Sure thing. Should I keep the same music track?",
                    2880
                ),

                msg(
                    "me",
                    "Yes please, same track.",
                    2870
                ),

                msg(
                    "them",
                    "I'll send the files over tonight.",
                    1500
                )

            ]

        },

        {

            id: "priya",

            name: "Priya Nair",

            handle: "priya.motion",

            img: 45,

            status: "Last active yesterday",

            online: false,

            unread: 0,

            messages: [

                msg(
                    "them",
                    "The revision is uploaded. Let me know if the pacing feels right.",
                    3000
                ),

                msg(
                    "me",
                    "Perfect, the pacing feels great. Approving it now.",
                    1800
                )

            ]

        },

        {

            id: "lena",

            name: "Lena Kowalski",

            handle: "lena.packaging",

            img: 25,

            status: "Last active 3h ago",

            online: false,

            unread: 5,

            messages: [

                msg(
                    "me",
                    "Hi Lena, I'd love a box design for our new candle line.",
                    6000
                ),

                msg(
                    "them",
                    "Hello! Happy to help with that.",
                    4410
                ),

                msg(
                    "them",
                    "Do you have the dieline dimensions?",
                    4408
                ),

                msg(
                    "them",
                    "Also, matte or gloss finish?",
                    4406
                ),

                msg(
                    "them",
                    "I can mock up both so you can compare.",
                    4404
                ),

                msg(
                    "them",
                    "Let me know when you have a moment!",
                    4400
                )

            ]

        },

        {

            id: "marcus",

            name: "Marcus Chen",

            handle: "marcus.motion",

            img: 15,

            status: "Last active 2d ago",

            online: false,

            unread: 0,

            messages: [

                msg(
                    "them",
                    "The logo animation is exported in 4K, plus a square version for socials.",
                    5000
                ),

                msg(
                    "me",
                    "Just watched it. The timing on the reveal is perfect.",
                    4600
                ),

                msg(
                    "them",
                    "Glad you like it! Happy to help with future projects.",
                    4500
                )

            ]

        },

        {

            id: "noor",

            name: "Noor Hassan",

            handle: "noor.webdesign",

            img: 5,

            status: "Last active 4d ago",

            online: false,

            unread: 0,

            messages: [

                msg(
                    "them",
                    "Homepage mockup attached. Let me know what you'd change.",
                    9000,
                    {
                        attach: image(PHOTO.logoB)
                    }
                ),

                msg(
                    "me",
                    "Looks clean. Can we try a larger hero image?",
                    8700
                )

            ]

        }

    ];

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const $ = id => document.getElementById(id);

    const root = $("messages");

    const listEl = $("conversationList");

    const listNoResults = $("listNoResults");

    const listEmpty = $("listEmpty");

    const chatEmpty = $("chatEmpty");

    const searchInput = $("conversationSearch");

    const searchClear = $("searchClear");

    const chatAvatar = $("chatAvatar");

    const chatName = $("chatName");

    const chatStatus = $("chatStatus");

    const chatScroll = $("chatScroll");

    const chatThread = $("chatThread");

    const backButton = $("backButton");

    const input = $("messageInput");

    const sendButton = $("sendButton");

    const attachButton = $("attachButton");

    const emojiButton = $("emojiButton");

    const attachMenu = $("attachMenu");

    const emojiPanel = $("emojiPanel");

    const fileInput = $("fileInput");

    const pendingEl = $("pending");

    const navBadge = $("navMessageBadge");

    const mediaViewer = $("mediaViewer");

    const mediaViewerImage = $("mediaViewerImage");

    const mediaViewerClose = $("mediaViewerClose");

    const mediaViewerBackdrop = $("mediaViewerBackdrop");

    const mobile =
        window.matchMedia("(max-width: 800px)");

    let activeId = null;

    let query = "";

    let pending = [];

    /*
       True while the chat should stay glued to the latest
       message. It is set when a conversation opens or a
       message is sent, and cleared only when the user
       deliberately scrolls up.
    */
    let stickToBottom = true;

    /* =====================================================
       SCROLL CONTROL

       The chat is always positioned by setting scrollTop
       directly on the real scroll container (#chatScroll).
       No smooth scrolling and no scrollIntoView().
    ===================================================== */

    function pinToBottom() {

        chatScroll.scrollTop =
            chatScroll.scrollHeight;

    }

    function stickAndPin() {

        stickToBottom = true;

        pinToBottom();

    }

    /*
       Disable the browser's scroll anchoring so it can never
       nudge the thread when content above the fold changes
       size (for example when images finish loading).
    */
    chatScroll.style.overflowAnchor = "none";

    chatScroll.style.scrollBehavior = "auto";

    /*
       Track whether the user is at the bottom. Layout-only
       changes (image loads, resizes) do not fire scroll
       events, so they never clear the flag.
    */
    chatScroll.addEventListener(

        "scroll",

        () => {

            const distance =

                chatScroll.scrollHeight -

                chatScroll.scrollTop -

                chatScroll.clientHeight;

            stickToBottom = distance <= 48;

        },

        {

            passive: true

        }

    );

    /*
       Keep the latest message in view whenever the thread
       or the scroll viewport changes size while pinned
       (images/videos loading, switching mobile <-> desktop,
       the composer growing, etc.).

       ResizeObserver callbacks run before paint, so the
       correction is never visible as movement.
    */
    if ("ResizeObserver" in window) {

        const sizeObserver =

            new ResizeObserver(() => {

                if (activeId && stickToBottom) {

                    pinToBottom();

                }

            });

        sizeObserver.observe(chatThread);

        sizeObserver.observe(chatScroll);

    }

    /*
       Fallback / extra safety: media finishing its load
       re-pins when we are at the bottom.
    */
    const onMediaLoaded = () => {

        if (activeId && stickToBottom) {

            pinToBottom();

        }

    };

    chatThread.addEventListener("load", onMediaLoaded, true);

    chatThread.addEventListener("loadedmetadata", onMediaLoaded, true);

    /* =====================================================
       HELPERS
    ===================================================== */

    const escapeHtml = value =>

        String(value).replace(

            /[&<>"']/g,

            ch => ({

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#39;"

            }[ch])

        );

    const escapeRegExp = value =>

        value.replace(

            /[.*+?^${}()|[\]\\]/g,

            "\\$&"

        );

    function highlight(text, q) {

        const safe = escapeHtml(text);

        if (!q) {

            return safe;

        }

        return safe.replace(

            new RegExp(

                `(${escapeRegExp(q)})`,

                "ig"

            ),

            "<mark>$1</mark>"

        );

    }

    function relativeTime(ts) {

        const minutes = Math.floor(

            (Date.now() - ts) / MIN

        );

        if (minutes < 1) return "now";

        if (minutes < 60) {

            return `${minutes}m`;

        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {

            return `${hours}h`;

        }

        const days = Math.floor(hours / 24);

        if (days < 7) {

            return `${days}d`;

        }

        return `${Math.floor(days / 7)}w`;

    }

    const clockTime = ts =>

        new Date(ts).toLocaleTimeString([], {

            hour: "numeric",

            minute: "2-digit"

        });

    const dayKey = ts => {

        const d = new Date(ts);

        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    };

    function dayLabel(ts) {

        const startOf = t => {

            const d = new Date(t);

            d.setHours(0, 0, 0, 0);

            return d.getTime();

        };

        const diff = Math.round(

            (startOf(Date.now()) -

                startOf(ts)) /

            86400000

        );

        if (diff === 0) return "Today";

        if (diff === 1) return "Yesterday";

        return new Date(ts).toLocaleDateString([], {

            weekday: "short",

            month: "short",

            day: "numeric"

        });

    }

    function formatSize(bytes) {

        if (bytes < 1024) {

            return `${bytes} B`;

        }

        if (bytes < 1048576) {

            return `${(bytes / 1024).toFixed(0)} KB`;

        }

        return `${(bytes / 1048576).toFixed(1)} MB`;

    }

    const findConversation = id =>

        conversations.find(c => c.id === id);

    const lastMessage = c =>

        c.messages[c.messages.length - 1];

    const sorted = () =>

        [...conversations].sort(

            (a, b) =>

                lastMessage(b).ts -

                lastMessage(a).ts

        );

    function messageSummary(m) {

        if (m.text) {

            return m.text;

        }

        if (m.attach) {

            if (m.attach.type === "image") {

                return "Sent a photo";

            }

            if (m.attach.type === "video") {

                return "Sent a video";

            }

            return `Sent ${m.attach.name}`;

        }

        return "";

    }

    /* =====================================================
       ICONS
    ===================================================== */

    const ICON = {

        file: `

            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round">

                <path d="M7 3.5h7l4 4V20.5H7z"/>

                <path d="M14 3.5v4h4"/>

            </svg>

        `,

        close: `

            <svg viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round">

                <path d="M7 7l10 10M17 7L7 17"/>

            </svg>

        `

    };

    const RECEIPT_LABEL = {

        sent: "Sent",

        delivered: "Delivered",

        read: "Seen"

    };

    /* =====================================================
       AVATAR + EMPTY STATE
    ===================================================== */

    function avatarHTML(c, size = "") {

        const src =
            `https://i.pravatar.cc/160?img=${c.img}`;

        return `

            <span class="avatar ${size}">

                ${escapeHtml(c.name.charAt(0))}

                <img
                    src="${src}"
                    alt=""
                    loading="lazy"
                    onerror="this.remove()">

            </span>

        `;

    }

    function emptyStateHTML() {

        return `

            <div class="empty-state">

                <svg
                    class="empty-art"
                    viewBox="0 0 240 180"
                    fill="none"
                    aria-hidden="true">

                    <defs>

                        <linearGradient
                            id="twiggGradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1">

                            <stop
                                offset="0%"
                                stop-color="#B90066"/>

                            <stop
                                offset="53%"
                                stop-color="#FB0838"/>

                            <stop
                                offset="100%"
                                stop-color="#F6801E"/>

                        </linearGradient>

                    </defs>

                    <rect
                        x="22"
                        y="26"
                        width="128"
                        height="78"
                        rx="28"
                        fill="url(#twiggGradient)"
                        opacity="0.16"/>

                    <rect
                        x="22"
                        y="26"
                        width="128"
                        height="78"
                        rx="28"
                        stroke="url(#twiggGradient)"
                        stroke-opacity="0.35"/>

                    <path
                        d="M52 100l-6 22 26-16z"
                        fill="url(#twiggGradient)"
                        opacity="0.16"/>

                    <rect
                        x="78"
                        y="62"
                        width="140"
                        height="82"
                        rx="28"
                        fill="#111"
                        opacity="0.06"/>

                    <rect
                        x="78"
                        y="62"
                        width="140"
                        height="82"
                        rx="28"
                        stroke="#d9d9d9"/>

                    <path
                        d="M196 140l8 22-28-17z"
                        fill="#111"
                        opacity="0.06"/>

                    <circle
                        cx="124"
                        cy="103"
                        r="4"
                        fill="#bdbdbd"/>

                    <circle
                        cx="148"
                        cy="103"
                        r="4"
                        fill="#bdbdbd"/>

                    <circle
                        cx="172"
                        cy="103"
                        r="4"
                        fill="url(#twiggGradient)"/>

                </svg>

                <h2>Select a conversation</h2>

                <p>
                    Select a conversation to start messaging.
                </p>

            </div>

        `;

    }

    /* =====================================================
       CONVERSATION LIST
    ===================================================== */

    function matchesQuery(c, q) {

        if (!q) {

            return true;

        }

        return (

            c.name.toLowerCase().includes(q) ||

            c.handle.toLowerCase().includes(q) ||

            c.messages.some(m =>

                (m.text || "")
                    .toLowerCase()
                    .includes(q)

            )

        );

    }

    /*
       Sidebar badge = number of PEOPLE with unread messages,
       not the total number of unread messages.
    */

    function updateNavBadge() {

        const people =

            conversations.filter(

                c => c.unread > 0

            ).length;

        navBadge.hidden =

            people === 0;

        navBadge.textContent =

            people > 9

                ? "9+"

                : String(people);

        navBadge.parentElement.setAttribute(

            "aria-label",

            people

                ? `${people} conversations with unread messages`

                : ""

        );

    }

    function renderList() {

        const q =

            query.trim().toLowerCase();

        const previousScroll =

            listEl.scrollTop;

        const visible =

            sorted().filter(

                c => matchesQuery(c, q)

            );

        listEl.innerHTML =

            visible

                .map(c => {

                    const last =

                        lastMessage(c);

                    let previewMessage =

                        last;

                    /*
                       When searching message content, show
                       the most recent message that actually matches.
                    */

                    if (

                        q &&

                        !(last.text || "")
                            .toLowerCase()
                            .includes(q)

                    ) {

                        const hit =

                            [...c.messages]

                                .reverse()

                                .find(m =>

                                    (m.text || "")
                                        .toLowerCase()
                                        .includes(q)

                                );

                        if (hit) {

                            previewMessage = hit;

                        }

                    }

                    const prefix =

                        previewMessage.from === "me"

                            ? "You: "

                            : "";

                    const preview =

                        messageSummary(

                            previewMessage

                        );

                    const classes = [

                        "conversation",

                        c.unread

                            ? "is-unread"

                            : "",

                        c.id === activeId

                            ? "is-active"

                            : ""

                    ].join(" ");

                    return `

                        <button
                            class="${classes}"
                            type="button"
                            role="listitem"
                            data-id="${c.id}">

                            <span class="avatar-wrap">

                                ${avatarHTML(c)}

                                ${
                                    c.unread
                                        ? `

                                            <span
                                                class="unread-badge"
                                                aria-label="${c.unread} unread">

                                                ${c.unread}

                                            </span>

                                          `
                                        : ""
                                }

                            </span>

                            <span class="conversation-body">

                                <span class="conversation-top">

                                    <span class="conversation-name">

                                        ${highlight(
                                            c.name,
                                            q
                                        )}

                                    </span>

                                    <span class="conversation-time">

                                        ${relativeTime(
                                            last.ts
                                        )}

                                    </span>

                                </span>

                                <span class="conversation-preview">

                                    ${prefix}${highlight(
                                        preview,
                                        q
                                    )}

                                </span>

                            </span>

                        </button>

                    `;

                })

                .join("");

        listEl.scrollTop =

            previousScroll;

        updateNavBadge();

        listNoResults.hidden =

            !(
                q &&
                visible.length === 0 &&
                conversations.length > 0
            );

        listEl.hidden =

            conversations.length === 0;

        const isEmpty =

            conversations.length === 0;

        root.classList.toggle(

            "is-empty",

            isEmpty

        );

        if (

            isEmpty &&

            !listEmpty.innerHTML

        ) {

            listEmpty.innerHTML =

                emptyStateHTML();

            chatEmpty.innerHTML =

                emptyStateHTML();

        }

        /*
           Normal conversations need the default chat
           empty state before a conversation is selected.
        */

        if (

            !isEmpty &&

            !chatEmpty.innerHTML

        ) {

            chatEmpty.innerHTML =

                emptyStateHTML();

        }

    }

    /* =====================================================
       FULL-SCREEN IMAGE VIEWER
    ===================================================== */

    function openImageViewer(

        src,

        alt = "Shared image"

    ) {

        if (!src) {

            return;

        }

        mediaViewerImage.src = src;

        mediaViewerImage.alt =

            alt || "Shared image";

        mediaViewer.classList.add(

            "is-open"

        );

        mediaViewer.setAttribute(

            "aria-hidden",

            "false"

        );

        document.body.classList.add(

            "media-viewer-open"

        );

        mediaViewerClose.focus({

            preventScroll: true

        });

    }

    function closeImageViewer() {

        mediaViewer.classList.remove(

            "is-open"

        );

        mediaViewer.setAttribute(

            "aria-hidden",

            "true"

        );

        mediaViewerImage.removeAttribute(

            "src"

        );

        mediaViewerImage.alt = "";

        document.body.classList.remove(

            "media-viewer-open"

        );

    }

    mediaViewerClose.addEventListener(

        "click",

        closeImageViewer

    );

    mediaViewerBackdrop.addEventListener(

        "click",

        closeImageViewer

    );

    /* =====================================================
       OPEN SHARED FILE
    ===================================================== */

    function openSharedFile(attach) {

        if (

            !attach ||

            !attach.src

        ) {

            return;

        }

        const url =

            String(attach.src);

        /*
           Use a temporary anchor so normal browser behaviour
           works for both regular URLs and blob URLs.

           PDFs and other browser-supported formats can open
           in a new tab. Other file types will be handled by
           the browser according to their type.
        */

        const link =

            document.createElement("a");

        link.href = url;

        link.target = "_blank";

        link.rel =

            "noopener noreferrer";

        document.body.appendChild(link);

        link.click();

        link.remove();

    }

    /* =====================================================
       CHAT
    ===================================================== */

    function attachmentHTML(attach) {

        if (!attach) {

            return "";

        }

        /*
           IMAGE

           Chat images load eagerly (no loading="lazy") so
           their final height is known right away and the
           thread can be positioned at the latest message
           without later layout shifts.
        */

        if (

            attach.type === "image"

        ) {

            return `

                <button
                    class="media-open-button"
                    type="button"
                    data-media-type="image"
                    data-media-src="${escapeHtml(
                        attach.src || ""
                    )}"
                    aria-label="Open shared image">

                    <img
                        class="bubble-media"
                        src="${escapeHtml(
                            attach.src || ""
                        )}"
                        alt="Shared photo">

                </button>

            `;

        }

        /*
           VIDEO

           Keep the video element itself completely normal
           so playback is not affected.

           The Download control is disabled separately after
           the video is rendered in renderThread().
        */

        if (

            attach.type === "video"

        ) {

            return `

                <video
                    class="bubble-media"
                    src="${escapeHtml(
                        attach.src || ""
                    )}"
                    controls
                    playsinline
                    preload="metadata">
                </video>

            `;

        }

        /*
           FILE

           The entire file card is clickable.
        */

        return `

            <button
                class="file-chip"
                type="button"
                data-file-src="${escapeHtml(
                    attach.src || ""
                )}"
                ${
                    attach.src
                        ? ""
                        : "disabled"
                }>

                <span class="file-icon">

                    ${ICON.file}

                </span>

                <span>

                    <span class="file-name">

                        ${escapeHtml(
                            attach.name || "File"
                        )}

                    </span>

                    <span class="file-size">

                        ${escapeHtml(
                            attach.size || ""
                        )}

                    </span>

                </span>

            </button>

        `;

    }

    function bubbleHTML(m) {

        const classes = [

            "bubble"

        ];

        if (m.attach) {

            classes.push(

                m.attach.type === "file"

                    ? "has-file"

                    : "has-media"

            );

        }

        if (m.isNew) {

            classes.push("is-new");

        }

        return `

            <div class="${classes.join(" ")}">

                ${attachmentHTML(

                    m.attach

                )}

                ${
                    m.text
                        ? `

                            <span class="bubble-text">

                                ${escapeHtml(
                                    m.text
                                ).replace(
                                    /\n/g,
                                    "<br>"
                                )}

                            </span>

                          `
                        : ""
                }

            </div>

        `;

    }

    function receiptHTML(status) {

        return `

            <span
                class="receipt ${
                    status === "read"
                        ? "is-seen"
                        : ""
                }">

                ${RECEIPT_LABEL[status]}

            </span>

        `;

    }

    function buildGroups(messages) {

        const groups = [];

        let group = null;

        let previousDay = null;

        messages.forEach(m => {

            const day =

                dayKey(m.ts);

            if (

                day !== previousDay

            ) {

                groups.push({

                    divider: dayLabel(

                        m.ts

                    )

                });

                group = null;

                previousDay = day;

            }

            if (

                !group ||

                group.from !== m.from ||

                m.ts - group.lastTs >

                    15 * MIN

            ) {

                group = {

                    from: m.from,

                    items: [],

                    lastTs: m.ts

                };

                groups.push(group);

            }

            group.items.push(m);

            group.lastTs = m.ts;

        });

        return groups;

    }

    /*
       scroll modes:

       "bottom" - jump straight to the latest message
                  (no animation)
       "none"   - keep the current position; if the user is
                  already at the bottom, stay at the bottom
    */

    function renderThread(

        c,

        { scroll = "none" } = {}

    ) {

        const previousScroll =

            chatScroll.scrollTop;

        const wasPinned =

            stickToBottom;

        const lastMine =

            [...c.messages]

                .reverse()

                .find(

                    m => m.from === "me"

                );

        chatThread.innerHTML =

            buildGroups(

                c.messages

            )

                .map(g => {

                    if (g.divider) {

                        return `

                            <div class="day-divider">

                                <span>

                                    ${g.divider}

                                </span>

                            </div>

                        `;

                    }

                    const lastItem =

                        g.items[

                            g.items.length - 1

                        ];

                    const mine =

                        g.from === "me";

                    /*
                       Status shown only under the last
                       message the user sent.
                    */

                    const receipt =

                        mine &&

                        lastItem === lastMine

                            ? receiptHTML(

                                lastItem.status ||

                                "sent"

                            )

                            : "";

                    return `

                        <div
                            class="msg-group ${
                                mine
                                    ? "from-me"
                                    : "from-them"
                            }">

                            ${
                                mine
                                    ? ""
                                    : avatarHTML(
                                        c,
                                        "avatar-sm"
                                    )
                            }

                            <div class="group-stack">

                                ${
                                    g.items
                                        .map(
                                            bubbleHTML
                                        )
                                        .join("")
                                }

                                <div class="group-meta">

                                    <span>

                                        ${clockTime(
                                            lastItem.ts
                                        )}

                                    </span>

                                    ${receipt}

                                </div>

                            </div>

                        </div>

                    `;

                })

                .join("");

        /*
           Hide the native Download control without changing
           the video element's source or playback behaviour.

           controlsList is applied only after the video exists
           in the DOM.
        */

        chatThread
            .querySelectorAll("video.bubble-media")
            .forEach(video => {

                if ("controlsList" in video) {

                    video.controlsList.add(
                        "nodownload"
                    );

                } else {

                    video.setAttribute(
                        "controlsList",
                        "nodownload"
                    );

                }

            });

        c.messages.forEach(

            m => {

                delete m.isNew;

            }

        );

        if (

            scroll === "bottom"

        ) {

            stickAndPin();

        } else if (

            wasPinned

        ) {

            /*
               Re-rendering must not move a chat that is
               already showing the latest message.
            */
            stickAndPin();

        } else {

            chatScroll.scrollTop =

                previousScroll;

        }

    }

    function renderHeader(c) {

        chatAvatar.innerHTML =

            avatarHTML(

                c,

                "avatar-md"

            );

        chatName.textContent =

            c.name;

        chatStatus.textContent =

            c.status;

        chatStatus.classList.toggle(

            "is-online",

            !!c.online

        );

    }

    /* =====================================================
       CHAT ATTACHMENT EVENTS
    ===================================================== */

    chatThread.addEventListener(

        "click",

        event => {

            /*
               SHARED IMAGE
            */

            const imageButton =

                event.target.closest(

                    "[data-media-type='image']"

                );

            if (imageButton) {

                const src =

                    imageButton.dataset.mediaSrc;

                if (src) {

                    openImageViewer(

                        src,

                        "Shared photo"

                    );

                }

                return;

            }

            /*
               SHARED FILE
            */

            const fileButton =

                event.target.closest(

                    "[data-file-src]"

                );

            if (fileButton) {

                const src =

                    fileButton.dataset.fileSrc;

                if (src) {

                    openSharedFile({

                        src

                    });

                }

            }

        }

    );

    /* =====================================================
       OPEN / CLOSE
    ===================================================== */

    /*
       Hides the bottom bar while a chat is open on mobile.
    */

    function syncChatOpen() {

        document.body.classList.toggle(

            "chat-open",

            mobile.matches &&

            root.classList.contains(

                "in-chat"

            )

        );

    }

    function openConversation(

        id,

        { push = false } = {}

    ) {

        const c =

            findConversation(id);

        if (!c) {

            return;

        }

        activeId = id;

        /*
           A conversation is only marked read after
           the user explicitly selects it.
        */

        c.unread = 0;

        root.classList.add(

            "has-chat"

        );

        renderList();

        renderHeader(c);

        /*
           Make the chat layout visible first (mobile slide-in
           class and bottom bar), then position the thread, so
           the final scrollTop is measured against the final
           layout.
        */

        if (mobile.matches) {

            root.classList.add(

                "in-chat"

            );

            syncChatOpen();

        }

        renderThread(c, {

            scroll: "bottom"

        });

        updateComposer();

        closePopovers();

        /*
           The composer height can change the viewport size;
           make sure the latest message is still at the bottom.
        */

        stickAndPin();

        if (mobile.matches) {

            if (push) {

                history.pushState(

                    {

                        chat: id

                    },

                    ""

                );

            }

        } else {

            input.focus({

                preventScroll: true

            });

        }

        /*
           One more direct (non-animated) pin before the next
           paint, in case fonts/images settled after the
           synchronous layout above.
        */

        requestAnimationFrame(() => {

            if (activeId === id) {

                stickAndPin();

            }

        });

    }

    function closeChat() {

        root.classList.remove(

            "in-chat"

        );

        syncChatOpen();

        closePopovers();

        if (mobile.matches) {

            activeId = null;

            root.classList.remove(

                "has-chat"

            );

            renderList();

        }

    }

    listEl.addEventListener(

        "click",

        event => {

            const item =

                event.target.closest(

                    ".conversation"

                );

            if (!item) {

                return;

            }

            openConversation(

                item.dataset.id,

                {

                    push: true

                }

            );

        }

    );

    backButton.addEventListener(

        "click",

        () => {

            if (

                history.state &&

                history.state.chat

            ) {

                history.back();

            } else {

                closeChat();

            }

        }

    );

    window.addEventListener(

        "popstate",

        () => {

            if (

                mobile.matches &&

                root.classList.contains(

                    "in-chat"

                )

            ) {

                closeChat();

            }

        }

    );

    /*
       Switching between mobile and desktop/tablet.

       The open conversation is NOT re-rendered or reopened;
       only the layout classes change. The thread is then
       pinned directly to the latest message.
    */

    mobile.addEventListener(

        "change",

        () => {

            syncChatOpen();

            if (mobile.matches) {

                /*
                   Only keep an already-selected chat
                   open when moving into mobile view.
                */

                if (activeId) {

                    root.classList.add(

                        "in-chat"

                    );

                }

            } else {

                root.classList.remove(

                    "in-chat"

                );

                /*
                   Never automatically select a
                   conversation when moving to
                   desktop/tablet.
                */

                if (!activeId) {

                    root.classList.remove(

                        "has-chat"

                    );

                }

            }

            syncChatOpen();

            if (activeId) {

                stickAndPin();

                requestAnimationFrame(() => {

                    if (activeId) {

                        stickAndPin();

                    }

                });

            }

        }

    );

    /* =====================================================
       SEARCH
    ===================================================== */

    searchInput.addEventListener(

        "input",

        () => {

            query =

                searchInput.value;

            searchClear.hidden =

                !query;

            renderList();

        }

    );

    searchInput.addEventListener(

        "keydown",

        event => {

            if (

                event.key === "Escape"

            ) {

                searchClear.click();

            }

        }

    );

    searchClear.addEventListener(

        "click",

        () => {

            searchInput.value = "";

            query = "";

            searchClear.hidden =

                true;

            renderList();

            searchInput.focus();

        }

    );

    /* =====================================================
       COMPOSER
    ===================================================== */

    function updateComposer() {

        input.style.height =

            "auto";

        /*
           scrollHeight is 0 while the chat is hidden;
           keep CSS height then.
        */

        if (input.scrollHeight) {

            input.style.height =

                `${Math.min(

                    input.scrollHeight,

                    140

                )}px`;

        }

        sendButton.disabled =

            !input.value.trim() &&

            pending.length === 0;

    }

    input.addEventListener(

        "input",

        updateComposer

    );

    input.addEventListener(

        "keydown",

        event => {

            if (

                event.key === "Enter" &&

                !event.shiftKey &&

                !event.isComposing

            ) {

                event.preventDefault();

                sendMessage();

            }

        }

    );

    sendButton.addEventListener(

        "click",

        sendMessage

    );

    /* ---------- SEND ---------- */

    function sendMessage() {

        const c =

            findConversation(

                activeId

            );

        const text =

            input.value.trim();

        if (

            !c ||

            (

                !text &&

                pending.length === 0

            )

        ) {

            return;

        }

        const created = [];

        let offset = 0;

        pending.forEach(

            attach => {

                created.push({

                    from: "me",

                    text: "",

                    attach,

                    ts:

                        Date.now() +

                        offset++,

                    status: "sent",

                    isNew: true

                });

            }

        );

        if (text) {

            created.push({

                from: "me",

                text,

                ts:

                    Date.now() +

                    offset,

                status: "sent",

                isNew: true

            });

        }

        c.messages.push(

            ...created

        );

        input.value = "";

        pending = [];

        renderPending();

        updateComposer();

        closePopovers();

        renderList();

        /*
           Sending always shows the newest message
           immediately, with no animation.
        */

        renderThread(c, {

            scroll: "bottom"

        });

        /*
           Simulated delivery → read.
           Replace with real receipts from backend.
        */

        const advance =

            status => {

                created.forEach(

                    m => {

                        m.status =

                            status;

                    }

                );

                if (

                    activeId === c.id

                ) {

                    renderThread(c);

                }

            };

        setTimeout(

            () => advance(

                "delivered"

            ),

            800

        );

        setTimeout(

            () => advance(

                "read"

            ),

            2400

        );

    }

    /* =====================================================
       ATTACHMENTS
    ===================================================== */

    function renderPending() {

        pendingEl.hidden =

            pending.length === 0;

        pendingEl.innerHTML =

            pending

                .map(

                    (a, index) => {

                        let thumb;

                        if (

                            a.type === "image"

                        ) {

                            thumb = `

                                <img
                                    src="${escapeHtml(
                                        a.src
                                    )}"
                                    alt="">

                            `;

                        } else if (

                            a.type === "video"

                        ) {

                            thumb = `

                                <video
                                    src="${escapeHtml(
                                        a.src
                                    )}"
                                    muted
                                    playsinline>

                                </video>

                            `;

                        } else {

                            thumb = `

                                <span class="file-icon">

                                    ${ICON.file}

                                </span>

                            `;

                        }

                        return `

                            <div
                                class="pending-item">

                                ${thumb}

                                ${
                                    a.type === "file"
                                        ? `

                                            <span
                                                class="pending-name">

                                                ${escapeHtml(
                                                    a.name
                                                )}

                                            </span>

                                          `
                                        : ""
                                }

                                <button
                                    class="pending-remove"
                                    type="button"
                                    data-index="${index}"
                                    aria-label="Remove attachment">

                                    ${ICON.close}

                                </button>

                            </div>

                        `;

                    }

                )

                .join("");

    }

    pendingEl.addEventListener(

        "click",

        event => {

            const button =

                event.target.closest(

                    ".pending-remove"

                );

            if (!button) {

                return;

            }

            const index =

                Number(

                    button.dataset.index

                );

            const removed =

                pending[index];

            /*
               Release local object URLs when
               the user removes an attachment
               before sending it.
            */

            if (

                removed &&

                removed.src &&

                removed.src.startsWith(

                    "blob:"

                )

            ) {

                URL.revokeObjectURL(

                    removed.src

                );

            }

            pending.splice(

                index,

                1

            );

            renderPending();

            updateComposer();

        }

    );

    attachButton.addEventListener(

        "click",

        event => {

            event.stopPropagation();

            emojiPanel.classList.remove(

                "open"

            );

            const open =

                attachMenu.classList.toggle(

                    "open"

                );

            attachButton.setAttribute(

                "aria-expanded",

                String(open)

            );

        }

    );

    attachMenu.addEventListener(

        "click",

        event => {

            const option =

                event.target.closest(

                    "button[data-accept]"

                );

            if (!option) {

                return;

            }

            fileInput.accept =

                option.dataset.accept;

            fileInput.click();

            closePopovers();

        }

    );

    fileInput.addEventListener(

        "change",

        () => {

            Array.from(

                fileInput.files

            ).forEach(f => {

                const type =

                    f.type.startsWith(

                        "image/"

                    )

                        ? "image"

                        : f.type.startsWith(

                            "video/"

                        )

                            ? "video"

                            : "file";

                /*
                   Create an object URL for every
                   attachment, including files.

                   This keeps uploaded files usable
                   after they are sent in the demo.
                */

                pending.push({

                    type,

                    name: f.name,

                    size: formatSize(

                        f.size

                    ),

                    src:

                        URL.createObjectURL(

                            f

                        )

                });

            });

            fileInput.value = "";

            renderPending();

            updateComposer();

            input.focus({

                preventScroll: true

            });

        }

    );

    /* =====================================================
       EMOJI
    ===================================================== */

    const EMOJIS = [

        "😀", "😄", "😁", "😊", "🙂", "😉", "😍", "🥰",

        "😎", "🤩", "🥳", "😅", "😂", "🤔", "🙌", "👏",

        "👍", "🙏", "🔥", "✨", "💡", "🎨", "🖌️", "🎬",

        "📸", "🎵", "💯", "❤️", "💜", "🧡", "🚀", "🎉",

        "✅", "👀", "💬", "📎", "📦", "⏰", "🌿", "☕"

    ];

    emojiPanel.innerHTML =

        EMOJIS

            .map(

                e => `

                    <button
                        type="button"
                        data-emoji="${e}"
                        aria-label="${e}">

                        ${e}

                    </button>

                `

            )

            .join("");

    emojiButton.addEventListener(

        "click",

        event => {

            event.stopPropagation();

            attachMenu.classList.remove(

                "open"

            );

            attachButton.setAttribute(

                "aria-expanded",

                "false"

            );

            emojiPanel.classList.toggle(

                "open"

            );

        }

    );

    emojiPanel.addEventListener(

        "click",

        event => {

            const button =

                event.target.closest(

                    "button[data-emoji]"

                );

            if (!button) {

                return;

            }

            const start =

                input.selectionStart ??

                input.value.length;

            const end =

                input.selectionEnd ??

                input.value.length;

            input.value =

                input.value.slice(

                    0,

                    start

                ) +

                button.dataset.emoji +

                input.value.slice(

                    end

                );

            const caret =

                start +

                button.dataset.emoji.length;

            input.setSelectionRange(

                caret,

                caret

            );

            updateComposer();

            input.focus({

                preventScroll: true

            });

        }

    );

    /* =====================================================
       POPOVER DISMISS
    ===================================================== */

    function closePopovers() {

        attachMenu.classList.remove(

            "open"

        );

        emojiPanel.classList.remove(

            "open"

        );

        attachButton.setAttribute(

            "aria-expanded",

            "false"

        );

    }

    document.addEventListener(

        "click",

        event => {

            if (

                !event.target.closest(

                    ".popover"

                )

            ) {

                closePopovers();

            }

        }

    );

    document.addEventListener(

        "keydown",

        event => {

            if (

                event.key === "Escape"

            ) {

                closePopovers();

                if (

                    mediaViewer.classList.contains(

                        "is-open"

                    )

                ) {

                    closeImageViewer();

                }

            }

        }

    );

    /* =====================================================
       INIT
    ===================================================== */

    renderList();

    renderPending();

    updateComposer();

    /*
       IMPORTANT:

       No conversation is automatically opened on
       initial page load or refresh.

       Desktop/tablet:

       - Conversation list is shown.
       - Main chat area shows the selection empty state.

       Mobile:

       - Conversation list is shown.
       - Chat opens only after the user taps a conversation.
    */

    activeId = null;

    root.classList.remove(

        "has-chat"

    );

    root.classList.remove(

        "in-chat"

    );

    if (!chatEmpty.innerHTML) {

        chatEmpty.innerHTML =

            emptyStateHTML();

    }

    /*
       Keep relative times fresh.
    */

    setInterval(

        renderList,

        60000

    );

})();