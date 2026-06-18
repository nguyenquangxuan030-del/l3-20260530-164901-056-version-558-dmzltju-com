(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var year = document.querySelector('[data-filter-year]');
  var region = document.querySelector('[data-filter-region]');
  var type = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-state]');
  var normalize = function (value) {
    return String(value || '').trim().toLowerCase();
  };
  var applyFilter = function () {
    var query = normalize(inputs.map(function (input) { return input.value; }).filter(Boolean).join(' '));
    var y = year ? normalize(year.value) : '';
    var r = region ? normalize(region.value) : '';
    var t = type ? normalize(type.value) : '';
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type')
      ].join(' '));
      var ok = true;
      if (query && haystack.indexOf(query) === -1) ok = false;
      if (y && normalize(card.getAttribute('data-year')) !== y) ok = false;
      if (r && normalize(card.getAttribute('data-region')) !== r) ok = false;
      if (t && normalize(card.getAttribute('data-type')) !== t) ok = false;
      card.style.display = ok ? '' : 'none';
      if (ok) visible += 1;
    });
    if (empty) empty.classList.toggle('show', visible === 0);
  };
  inputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });
  [year, region, type].forEach(function (select) {
    if (select) select.addEventListener('change', applyFilter);
  });
})();
