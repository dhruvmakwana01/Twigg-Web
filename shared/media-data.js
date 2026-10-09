/* =========================================================
   TWIGG — SHARED MEDIA DATA   (shared/media-data.js)

   Temporary stand-in for the backend. Home, Loop and Reels
   all READ from this one file; each page keeps its own
   feed, ordering and interaction logic in its own JS file.

   FUTURE BACKEND
   Replace RAW below with an API response:

       const res = await fetch("/api/media");
       TwiggMedia.setItems(await res.json());

   (every page reads TwiggMedia when it starts, so load the
   API data before the page scripts run). Pages only use
   getAll / getById / getFeed, so no page logic has to change.

   FIELDS
     id         unique media id (number)
     type       "video" | "image"
     src        media file (path relative to the project root
                containing home/, loop/, reels/, shared/, or a URL)
     thumbnail  optional poster image (null = taken from video)
     title      title / alt text
     creator    { name, profileImage }
     category, rating, reviews
     feeds      which pages show it: "home", "loop", "reels"
========================================================= */

(() => {

    "use strict";

    /* Every page lives in a sibling folder (home/, loop/, reels/),
       so project-relative paths are resolved with "../". */

    const ASSET_ROOT = "../";

    function assetUrl(path) {

        if (!path) {
            return null;
        }

        return /^(https?:|data:|blob:|\/)/i.test(path)
            ? path
            : ASSET_ROOT + path;
    }

    const photo = id =>
        `https://images.unsplash.com/photo-${id}?auto=format&fit=max&w=900&q=90`;

    const HL = ["home", "loop"];
    const R = ["reels"];

    function m(id, type, src, title, creator, category, rating, reviews, feeds) {

        return {
            id,
            type,
            src,
            thumbnail: null,
            title,
            creator: { name: creator, profileImage: null },
            category,
            rating,
            reviews,
            feeds
        };
    }

    const V = "home/videos/";
    const RV = "reels/videos/";

    const RAW = [

        /* ----- Home + Loop ----- */
        m(0, "video", V + "b9f4e7d4-ce0a-426a-937e-daebd25f5842.MP4", "Video", "Aarav Studio", "Video Editing", "4.9", "1,204", HL),
        m(1, "image", photo("1561070791-2526d30994b5"), "Creative design", "Maya Designs", "Social Media Design", "4.8", "94", HL),
        m(2, "image", photo("1586717791821-3f44a563fa4c"), "Graphic design", "Pixel Forge", "Logo Design", "5.0", "1,875", HL),
        m(3, "video", V + "d27829dc-6302-47a3-8c71-5f8a157f47e5.MP4", "Video", "Nora Creative", "Web & Mobile Design", "4.7", "2,380", HL),
        m(4, "image", photo("1558655146-9f40138edfeb"), "Creative branding", "Kabir Motion", "Branding", "4.6", "990", HL),
        m(5, "video", V + "22512-328261507_medium.mp4", "Video", "Lumen Works", "Motion Graphics", "4.9", "842", HL),
        m(6, "image", photo("1497366811353-6870744d04b2"), "Interior design", "Aarav Studio", "Packaging Design", "4.5", "445", HL),
        m(7, "video", V + "22619-328940133_medium.mp4", "Video", "Maya Designs", "Logo Animation", "4.9", "1,204", HL),
        m(8, "image", photo("1618005198919-d3d4b5a92ead"), "Abstract design", "Pixel Forge", "3D Product Animation", "4.8", "94", HL),
        m(9, "video", V + "212404_medium.mp4", "Video", "Nora Creative", "Book Design", "5.0", "1,875", HL),
        m(10, "image", photo("1559028012-481c04fa702d"), "Website design", "Kabir Motion", "Intro & Outro Videos", "4.7", "2,380", HL),
        m(11, "video", V + "338904_medium.mp4", "Video", "Lumen Works", "Video Editing", "4.6", "990", HL),
        m(12, "image", photo("1634017839464-5c339ebe3cb4"), "Abstract artwork", "Aarav Studio", "Social Media Design", "4.9", "842", HL),
        m(13, "image", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsnn_crhJrO4NbGugSy9ofq1PdH5NhJYEPwRsTaV9b6Q&s=10", "Creative business design", "Maya Designs", "Logo Design", "4.5", "445", HL),
        m(14, "video", V + "364783_medium.mp4", "Video", "Pixel Forge", "Web & Mobile Design", "4.9", "1,204", HL),
        m(15, "image", photo("1513364776144-60967b0f800f"), "Art and illustration", "Nora Creative", "Branding", "4.8", "94", HL),
        m(16, "image", photo("1557682250-33bd709cbe85"), "Color design", "Kabir Motion", "Motion Graphics", "5.0", "1,875", HL),
        m(17, "video", V + "ad509c81-b69a-4021-be22-37d432bd7531.MP4", "Video", "Lumen Works", "Packaging Design", "4.7", "2,380", HL),
        m(18, "image", photo("1542744095-fcf48d80b0fd"), "Business design", "Aarav Studio", "Logo Animation", "4.6", "990", HL),
        m(19, "image", photo("1497366754035-f200968a6e72"), "Interior design", "Maya Designs", "3D Product Animation", "4.9", "842", HL),
        m(20, "video", V + "21d1f8ec-5dab-476d-b3a9-16412b7745b0.MP4", "Video", "Pixel Forge", "Book Design", "4.5", "445", HL),
        m(21, "image", photo("1561214115-f2f134cc4912"), "Art gallery", "Nora Creative", "Intro & Outro Videos", "4.9", "1,204", HL),
        m(22, "image", photo("1550745165-9bc0b252726f"), "Creative technology", "Kabir Motion", "Video Editing", "4.8", "94", HL),
        m(23, "video", V + "6ede3033-72bb-46c7-a61c-c8eaf77445b4.MP4", "Video", "Lumen Works", "Social Media Design", "5.0", "1,875", HL),
        m(24, "image", photo("1634017839464-5c339ebe3cb4"), "Abstract artwork", "Aarav Studio", "Logo Design", "4.7", "2,380", HL),
        m(25, "image", photo("1497215728101-856f4ea42174"), "Workspace design", "Maya Designs", "Web & Mobile Design", "4.6", "990", HL),
        m(26, "video", V + "e75e166b-f8bc-497f-8c07-c557c8d0de77.MP4", "Video", "Pixel Forge", "Branding", "4.9", "842", HL),
        m(27, "image", photo("1513364776144-60967b0f800f"), "Art and illustration", "Nora Creative", "Motion Graphics", "4.5", "445", HL),
        m(28, "image", photo("1542744095-fcf48d80b0fd"), "Business creative", "Kabir Motion", "Packaging Design", "4.9", "1,204", HL),
        m(29, "video", V + "ad3b477e-ccf1-49df-8bfa-ec0b8c80965a.MP4", "Video", "Lumen Works", "Logo Animation", "4.8", "94", HL),

        /* ----- Reels ----- */
        m(30, "video", RV + "80444097-841c-4bb7-b7b1-70beedcd4240.mov", "Reel", "Studio Craft", "Packaging Design", "4.9", "1,204", R),
        m(31, "video", RV + "4bf27b85-3357-40aa-93eb-759303f8ee52.mov", "Reel", "Markwell Studio", "Logo Design", "4.8", "842", R),
        m(32, "video", RV + "2d83975e-223c-400b-a8ce-f30ddc591c53.mov", "Reel", "Pixel & Co", "Web & Mobile Design", "5.0", "2,380", R),
        m(33, "video", RV + "75f99231-503c-4f5e-b455-f58ab5063358.MP4", "Reel", "Inkwell Press", "Book Design", "4.5", "94", R),
        m(34, "video", RV + "2c8f8923-0e71-4ec0-8159-c665d9ff756e.MP4", "Reel", "Reel Intro Studio", "Intro & Outro Videos", "4.7", "445", R),
        m(35, "video", RV + "c377903b-d9cd-485a-bb5b-e29ff8e0c4b5.MP4", "Reel", "Kinetic House", "Motion Graphics", "4.8", "990", R),
        m(36, "video", RV + "6e7bd8c9-15be-4677-9a14-18c2cb5b14ca.MP4", "Reel", "Studio Nova", "Product Photography", "4.9", "1,875", R),
        m(37, "video", RV + "27da01c8-e09c-4168-afc5-baa39d098c73.MP4", "Reel", "ColorLab Studio", "Color Grading", "5.0", "3,040", R)
    ];


    /* ---------- store ---------- */

    let items = [];
    let byId = new Map();

    function normalize(raw) {

        const creator = raw.creator || {};

        return Object.freeze({
            id: raw.id,
            type: raw.type === "video" ? "video" : "image",
            src: assetUrl(raw.src),
            thumbnail: assetUrl(raw.thumbnail),
            title: raw.title || "",
            creator: Object.freeze({
                name: creator.name || "Twigg Creator",
                profileImage: assetUrl(creator.profileImage)
            }),
            category: raw.category || "",
            rating: String(raw.rating ?? ""),
            reviews: String(raw.reviews ?? ""),
            feeds: Array.isArray(raw.feeds) ? raw.feeds.slice() : []
        });
    }

    function setItems(list) {

        items = (list || []).map(normalize);

        byId = new Map(items.map(item => [item.id, item]));
    }

    setItems(RAW);

    window.TwiggMedia = {

        getAll: () => items.slice(),

        getById: id => byId.get(id) || null,

        getFeed: feed =>
            items.filter(item => item.feeds.includes(feed)),

        setItems,

        assetUrl
    };

})();