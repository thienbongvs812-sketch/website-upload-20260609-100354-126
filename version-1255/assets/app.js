(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('is-open');
        });
    }

    const carousels = document.querySelectorAll('[data-hero-carousel]');

    carousels.forEach((carousel) => {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const previous = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const show = (index) => {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const restart = () => {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(() => show(current + 1), 5000);
        };

        previous?.addEventListener('click', () => {
            show(current - 1);
            restart();
        });

        next?.addEventListener('click', () => {
            show(current + 1);
            restart();
        });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    });

    const controls = Array.from(document.querySelectorAll('[data-card-search], [data-region-filter], [data-year-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

    if (controls.length && cards.length) {
        const applyFilters = () => {
            const searchValues = Array.from(document.querySelectorAll('[data-card-search]'))
                .map((input) => input.value.trim().toLowerCase())
                .filter(Boolean);
            const regionValue = document.querySelector('[data-region-filter]')?.value.trim().toLowerCase() || '';
            const yearValue = document.querySelector('[data-year-filter]')?.value.trim() || '';

            cards.forEach((card) => {
                const text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.keywords
                ].join(' ').toLowerCase();
                const matchesSearch = searchValues.length === 0 || searchValues.some((value) => text.includes(value));
                const matchesRegion = !regionValue || (card.dataset.region || '').toLowerCase().includes(regionValue);
                const matchesYear = !yearValue || card.dataset.year === yearValue;

                card.classList.toggle('is-filtered', !(matchesSearch && matchesRegion && matchesYear));
            });
        };

        controls.forEach((control) => {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        });
    }
})();
