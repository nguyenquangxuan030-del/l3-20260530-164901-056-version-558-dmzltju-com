(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (slides.length <= 1) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        startTimer();
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    });

    startTimer();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var counters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-count]"));
    if (!cards.length || !inputs.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    function applyFilter(value) {
      var query = normalize(value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(
          card.getAttribute("data-title") + " " + card.getAttribute("data-meta")
        );
        var matched = !query || haystack.indexOf(query) !== -1;
        card.classList.toggle("is-hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });

      counters.forEach(function (counter) {
        counter.textContent = visible + " 部影片";
      });
    }

    inputs.forEach(function (input) {
      input.value = initial;
      input.addEventListener("input", function () {
        var value = input.value;
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = value;
          }
        });
        applyFilter(value);
      });
    });

    applyFilter(initial);
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");
    var overlay = document.querySelector("[data-play-video]");
    if (!video) {
      return;
    }

    var src = video.getAttribute("data-video-src");
    var loaded = false;
    var hlsInstance = null;

    function playVideo() {
      if (!src) {
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      if (loaded) {
        video.play().catch(function () {});
        return;
      }

      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (!loaded) {
        playVideo();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  onReady(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
