/* =========================================================
   TWIGG — SHARED SKELETON LOADING  (shared/skeleton.js)

   TwiggSkeleton.watchImage(target, img)
       shimmer on `target` until `img` has loaded.
       target may be the img itself (e.g. small avatars).
   TwiggSkeleton.watchVideo(target, video, posterPromise)
       shimmer until a poster / first frame is ready.
       posterPromise (optional) resolves true when a poster
       was applied (see TwiggMedia.applyPoster).
   TwiggSkeleton.scan(root)
       watches every  img[data-sk]  below root. The shimmer goes
       on the img's parent, or on the img itself if data-sk="self".

   Nothing is shown for media that is already ready, and a
   failed / slow load ends in a static (non-animated) state.
========================================================= */

(() => {

    "use strict";

    const LOADING = "sk-loading";
    const FAILED = "sk-failed";
    const REVEAL = "sk-reveal";

    const IMAGE_TIMEOUT = 20000;
    const VIDEO_TIMEOUT = 12000;


    function begin(target) {

        target.classList.remove(FAILED, REVEAL);
        target.classList.add(LOADING);
    }


    function settle(target, ok) {

        const wasLoading = target.classList.contains(LOADING);

        target.classList.remove(LOADING);
        target.classList.toggle(FAILED, !ok);

        if (ok && wasLoading) {

            target.classList.add(REVEAL);

            setTimeout(() => target.classList.remove(REVEAL), 400);
        }
    }


    function watchImage(target, img) {

        if (!target || !img || img.__twiggSk) {
            return;
        }

        img.__twiggSk = true;

        if (img.complete) {

            /* Already loaded: no skeleton. Complete but empty = broken. */

            if (img.naturalWidth === 0 && img.getAttribute("src")) {
                settle(target, false);
            }

            return;
        }

        begin(target);

        const timer =
            setTimeout(() => {
                if (target.classList.contains(LOADING)) {
                    settle(target, false);
                }
            }, IMAGE_TIMEOUT);

        /* Listeners are not one-shot: a fallback src may load after an error. */

        img.addEventListener("load", () => {

            clearTimeout(timer);

            if (img.naturalWidth > 0) {
                settle(target, true);
            }
        });

        img.addEventListener("error", () => {

            clearTimeout(timer);

            settle(target, false);
        });
    }


    function watchVideo(target, video, posterPromise) {

        if (!target || !video || video.__twiggSk) {
            return;
        }

        video.__twiggSk = true;

        /* A poster or decoded frame is already available */

        if (video.poster || video.readyState >= 2) {
            return;
        }

        begin(target);

        let posterPending = !!posterPromise;
        let mediaFailed = false;

        const timer =
            setTimeout(() => {
                if (target.classList.contains(LOADING)) {
                    settle(target, false);
                }
            }, VIDEO_TIMEOUT);

        const done = ok => {

            clearTimeout(timer);

            settle(target, ok);
        };

        video.addEventListener("loadeddata", () => done(true), { once: true });

        /* Errors fire on the <source> children, not on the <video> */

        const fail = () => {

            mediaFailed = true;

            if (!posterPending) {
                done(false);
            }
        };

        video.addEventListener("error", fail, { once: true });

        video
            .querySelectorAll("source")
            .forEach(source => {
                source.addEventListener("error", fail, { once: true });
            });

        if (posterPromise && posterPromise.then) {

            posterPromise
                .then(ok => {

                    posterPending = false;

                    if (ok) {
                        done(true);
                    } else if (mediaFailed) {
                        done(false);
                    }
                })
                .catch(() => {

                    posterPending = false;

                    if (mediaFailed) {
                        done(false);
                    }
                });
        }
    }


    function scan(root) {

        if (!root) {
            return;
        }

        root
            .querySelectorAll("img[data-sk]")
            .forEach(img => {

                const target =
                    img.dataset.sk === "self"
                        ? img
                        : img.parentElement;

                watchImage(target, img);
            });
    }


    window.TwiggSkeleton = {
        begin,
        settle,
        watchImage,
        watchVideo,
        scan
    };

})();
