(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initNavigation() {
        var button = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', slider);
        var dots = selectAll('[data-hero-dot]', slider);
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
                dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var chips = selectAll('[data-filter-chip]', scope);
            var cards = selectAll('[data-filter-item]', scope);
            var empty = scope.querySelector('[data-no-results]');
            var active = 'all';
            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }
            function run() {
                var keyword = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var bucket = normalize(card.getAttribute('data-bucket'));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesChip = active === 'all' || bucket === active || haystack.indexOf(active) !== -1;
                    var show = matchesKeyword && matchesChip;
                    card.style.display = show ? '' : 'none';
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }
            if (input) {
                input.addEventListener('input', run);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    active = normalize(chip.getAttribute('data-filter-chip')) || 'all';
                    chips.forEach(function (item) {
                        item.classList.toggle('is-active', item === chip);
                    });
                    run();
                });
            });
            run();
        });
    }

    function attachHls(video, url) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._hls = hls;
            return;
        }
        video.src = url;
    }

    window.setupMoviePlayer = function (videoId, buttonId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !url) {
            return;
        }
        var ready = false;
        function start() {
            if (!ready) {
                attachHls(video, url);
                ready = true;
            }
            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }
        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!ready || video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initFilters();
    });
})();
