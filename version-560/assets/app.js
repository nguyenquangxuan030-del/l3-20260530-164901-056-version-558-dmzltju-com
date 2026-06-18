(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function bindMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function bindSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function bindHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer;

    function setSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    setSlide(0);
    start();
  }

  function bindFilters() {
    var panel = qs('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var search = qs('[data-page-search]');
    var type = qs('[data-page-type]');
    var year = qs('[data-page-year]');
    var cards = qsa('[data-card]');
    var empty = qs('[data-no-results]');

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function apply() {
      var query = valueOf(search);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchType = !typeValue || (card.getAttribute('data-type') || '').toLowerCase() === typeValue;
        var matchYear = !yearValue || (card.getAttribute('data-year') || '') === yearValue;
        var show = matchQuery && matchType && matchYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible > 0;
      }
    }

    [search, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-card>' +
      '<a class="card-cover" href="' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="card-chip top">' + escapeHtml(movie.category) + '</span>' +
      '<span class="card-chip bottom">' + escapeHtml(movie.year) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.description) + '</p>' +
      '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchPage() {
    var results = qs('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var empty = qs('[data-search-empty]');
    var input = qs('[data-search-input]');
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (input) {
      input.value = query;
    }
    var data = window.MOVIE_SEARCH_INDEX;
    var normalized = query.toLowerCase();
    var matches = data.filter(function (movie) {
      if (!normalized) {
        return movie.featured;
      }
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, (movie.tags || []).join(' ')]
        .join(' ')
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 120);
    results.innerHTML = matches.map(cardTemplate).join('');
    if (empty) {
      empty.hidden = matches.length > 0;
    }
  }

  window.initMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = qs('#movieVideo');
      var trigger = qs('[data-play-trigger]');
      if (!video || !trigger || !sourceUrl) {
        return;
      }
      var loaded = false;
      var pendingPlay = false;
      var hls;

      function playVideo() {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }

      function loadSource() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (pendingPlay) {
              playVideo();
            }
          });
        } else {
          video.src = sourceUrl;
        }
      }

      function startPlayback() {
        pendingPlay = true;
        loadSource();
        trigger.classList.add('is-hidden');
        playVideo();
      }

      trigger.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('play', function () {
        trigger.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          trigger.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindFilters();
    renderSearchPage();
  });
})();
