(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initializeHeader() {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && mobileNav && header) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
        header.classList.toggle('is-open');
      });
    }
  }

  function initializeHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function initializeFilters() {
    var list = document.querySelector('[data-movie-list]');

    if (!list) {
      return;
    }

    var panel = document.querySelector('[data-filter-panel]');
    var input = panel ? panel.querySelector('[data-search-input]') : null;
    var select = panel ? panel.querySelector('[data-sort-select]') : null;
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function cardValue(card, key) {
      if (key === 'title') {
        return normalize(card.getAttribute('data-title'));
      }
      return Number(card.getAttribute('data-' + key)) || 0;
    }

    function applySearch() {
      var keyword = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var title = normalize(card.getAttribute('data-title'));
        var matched = !keyword || haystack.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        card.classList.toggle('is-filtered-out', !matched);
      });
    }

    function applySort() {
      var mode = select ? select.value : 'year';
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'title') {
          return cardValue(a, 'title').localeCompare(cardValue(b, 'title'), 'zh-Hans-CN');
        }
        return cardValue(b, mode) - cardValue(a, mode);
      });
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', applySearch);
    }

    if (select) {
      select.addEventListener('change', function () {
        applySort();
        applySearch();
      });
    }

    applySort();
    applySearch();
  }

  ready(function () {
    initializeHeader();
    initializeHero();
    initializeFilters();
  });
})();
