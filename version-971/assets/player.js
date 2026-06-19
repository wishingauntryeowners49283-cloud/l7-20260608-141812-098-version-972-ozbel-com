import { H as Hls } from "./hls-vendor-dru42stk.js";

export function initializeMoviePlayer(streamUrl) {
    const video = document.getElementById("moviePlayer");
    const button = document.getElementById("moviePlayButton");
    const stage = document.querySelector(".video-stage");
    let prepared = false;
    let hls = null;

    async function start() {
        if (!video || !streamUrl) {
            return;
        }
        if (!prepared) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            prepared = true;
        }
        if (stage) {
            stage.classList.add("is-playing");
        }
        const playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (stage) {
                stage.classList.add("is-playing");
            }
        });
        video.addEventListener("ended", function () {
            if (stage) {
                stage.classList.remove("is-playing");
            }
        });
    }
    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
