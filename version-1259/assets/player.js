(function () {
    const players = document.querySelectorAll('[data-video-player]');

    players.forEach(function (player) {
        const video = player.querySelector('video');
        const button = player.querySelector('.play-overlay');
        const source = player.getAttribute('data-m3u8');
        let hlsInstance = null;
        let prepared = false;

        const prepare = function () {
            if (prepared || !video || !source) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                prepared = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                prepared = true;
                return;
            }

            video.src = source;
            prepared = true;
        };

        const play = function () {
            prepare();
            player.classList.add('is-playing');
            const promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        };

        if (button && video) {
            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
