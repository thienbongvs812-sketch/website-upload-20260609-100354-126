(function () {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const input = form.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';

            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.dataset.heroDot || 0));
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    const filterPanel = document.querySelector('[data-filter-panel]');
    const filterList = document.querySelector('[data-filter-list]');

    if (filterPanel && filterList) {
        const keywordInput = filterPanel.querySelector('.local-search-input');
        const yearSelect = filterPanel.querySelector('.year-filter');
        const typeSelect = filterPanel.querySelector('.type-filter');
        const cards = Array.from(filterList.querySelectorAll('.movie-card'));

        const update = function () {
            const keyword = (keywordInput.value || '').trim().toLowerCase();
            const year = yearSelect.value;
            const type = typeSelect.value;

            cards.forEach(function (card) {
                const haystack = [card.dataset.title, card.dataset.meta].join(' ').toLowerCase();
                const matchesKeyword = !keyword || haystack.includes(keyword);
                const matchesYear = !year || card.dataset.year === year;
                const matchesType = !type || card.dataset.type === type;
                card.classList.toggle('hidden-by-filter', !(matchesKeyword && matchesYear && matchesType));
            });
        };

        [keywordInput, yearSelect, typeSelect].forEach(function (control) {
            control.addEventListener('input', update);
            control.addEventListener('change', update);
        });
    }

    const searchPage = document.querySelector('[data-search-page]');
    const searchList = document.querySelector('[data-search-list]');

    if (searchPage && searchList) {
        const params = new URLSearchParams(window.location.search);
        const query = (params.get('q') || '').trim();
        const input = document.getElementById('searchInput');
        const cards = Array.from(searchList.querySelectorAll('.movie-card'));

        if (input) {
            input.value = query;
        }

        const update = function () {
            const keyword = (input ? input.value : '').trim().toLowerCase();

            cards.forEach(function (card) {
                const haystack = [card.dataset.title, card.dataset.meta].join(' ').toLowerCase();
                card.classList.toggle('hidden-by-filter', Boolean(keyword) && !haystack.includes(keyword));
            });
        };

        if (input) {
            input.addEventListener('input', update);
        }

        update();
    }
})();
