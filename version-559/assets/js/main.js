(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      var isOpen = mobilePanel.hasAttribute('hidden') === false;
      if (isOpen) {
        mobilePanel.setAttribute('hidden', '');
        mobileToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobilePanel.removeAttribute('hidden');
        mobileToggle.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var timer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    stopHero();
    timer = window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      setSlide(index);
      startHero();
    });
  });

  startHero();

  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));
  filters.forEach(function (filterBox) {
    var input = filterBox.querySelector('input');
    var buttons = Array.prototype.slice.call(filterBox.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
    var activeFilter = '';

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matchQuery = query === '' || haystack.indexOf(query) !== -1;
        var matchFilter = activeFilter === '' || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle('hidden-card', !(matchQuery && matchFilter));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || '';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });

  var backTop = document.querySelector('.back-to-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('visible', window.scrollY > 420);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}());
