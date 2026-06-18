(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobile = document.querySelector("[data-mobile-nav]");
    if (!header) {
      return;
    }

    function syncHeader() {
      if (window.scrollY > 16) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
        header.classList.toggle("is-open");
      });
    }
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function autoplay() {
      clearInterval(timer);
      timer = setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        autoplay();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        autoplay();
      });
    }

    show(0);
    autoplay();
  }

  function initMovieFilters() {
    var pages = Array.prototype.slice.call(document.querySelectorAll("[data-filter-page]"));
    pages.forEach(function (page) {
      var input = page.querySelector("[data-filter-input]");
      var select = page.querySelector("[data-sort-select]");
      var grid = page.querySelector("[data-card-grid]");
      var empty = page.querySelector("[data-empty-state]");
      if (!grid) {
        return;
      }

      function cards() {
        return Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
      }

      function apply() {
        var term = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards().forEach(function (card) {
          var hay = card.getAttribute("data-search") || "";
          var match = !term || hay.indexOf(term) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      function sortCards() {
        if (!select) {
          return;
        }
        var value = select.value;
        var sorted = cards().sort(function (a, b) {
          if (value === "title") {
            return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-CN");
          }
          var ay = parseInt(a.getAttribute("data-year") || "0", 10);
          var by = parseInt(b.getAttribute("data-year") || "0", 10);
          return by - ay;
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        apply();
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", sortCards);
      }
      sortCards();
      apply();
    });
  }

  ready(function () {
    initHeader();
    initHeroSlider();
    initMovieFilters();
  });
})();

function initMoviePlayer(source) {
  var player = document.querySelector("[data-player]");
  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var overlay = player.querySelector(".player-overlay");
  var button = player.querySelector(".play-button");
  var hls = null;
  var attached = false;

  function attachSource() {
    if (attached || !video) {
      return;
    }
    attached = true;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachSource();
    if (overlay) {
      overlay.classList.add("player-overlay-hidden");
    }
    var action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {
        if (overlay) {
          overlay.classList.remove("player-overlay-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  if (video) {
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("player-overlay-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("player-overlay-hidden");
      }
    });
  }

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
