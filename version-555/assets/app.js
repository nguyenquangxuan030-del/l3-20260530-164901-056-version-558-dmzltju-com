(function () {
  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");

  function onScroll() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  inputs.forEach(function (input) {
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-hidden", keyword.length > 0 && haystack.indexOf(keyword) === -1);
      });
    });
  });
})();

function startMoviePlayer(source) {
  var video = document.getElementById("moviePlayer");
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button]"));
  var attached = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    attached = true;
  }

  function play() {
    attachSource();
    buttons.forEach(function (button) {
      button.classList.add("is-hidden");
    });
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", play);
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
