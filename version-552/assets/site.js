(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = './library.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

        function applyFilter() {
            var value = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search-text') || '').toLowerCase();
                card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
            });
        }

        if (initial) {
            filterInput.value = initial;
        }
        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }
})();
