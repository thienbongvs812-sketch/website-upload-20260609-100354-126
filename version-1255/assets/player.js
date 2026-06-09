(() => {
    const video = document.getElementById('movie-video');
    const button = document.querySelector('.player-start');

    if (!video) {
        return;
    }

    const url = video.getAttribute('src');
    let attached = false;

    const attach = () => {
        if (!url || attached) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            attached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.hls = hls;
            attached = true;
        }
    };

    const play = () => {
        attach();
        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {});
        }
    };

    button?.addEventListener('click', () => {
        button.classList.add('is-hidden');
        play();
    });

    video.addEventListener('play', () => {
        button?.classList.add('is-hidden');
    });

    video.addEventListener('pause', () => {
        if (!video.ended) {
            button?.classList.remove('is-hidden');
        }
    });

    video.addEventListener('click', () => {
        if (video.paused) {
            play();
        }
    });

    attach();
})();
