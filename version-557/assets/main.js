(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type"),
      card.getAttribute("data-region"),
      card.getAttribute("data-tags")
    ].join(" "));
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var topButton = document.querySelector("[data-back-top]");

    if (topButton) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 500) {
          topButton.classList.add("is-visible");
        } else {
          topButton.classList.remove("is-visible");
        }
      });

      topButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;

      function showSlide(index) {
        current = index;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          showSlide((current + 1) % slides.length);
        }, 5000);
      }
    }

    var filterPanel = document.querySelector("[data-filter-panel]");

    if (filterPanel) {
      var input = filterPanel.querySelector("[data-filter-keyword]");
      var year = filterPanel.querySelector("[data-filter-year]");
      var type = filterPanel.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var empty = document.querySelector("[data-empty-state]");

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var yearValue = year && year.value ? year.value : "";
        var typeValue = type && type.value ? type.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var textMatch = !keyword || cardText(card).indexOf(keyword) !== -1;
          var yearMatch = !yearValue || card.getAttribute("data-year") === yearValue;
          var typeMatch = !typeValue || card.getAttribute("data-type") === typeValue;
          var visible = textMatch && yearMatch && typeMatch;
          card.style.display = visible ? "" : "none";
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    }

    var searchRoot = document.querySelector("[data-search-root]");

    if (searchRoot && window.SITE_MOVIES) {
      var searchInput = searchRoot.querySelector("[data-search-input]");
      var searchResults = searchRoot.querySelector("[data-search-results]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (searchInput) {
        searchInput.value = initial;
      }

      function renderSearch() {
        var keyword = normalize(searchInput && searchInput.value);
        var items = window.SITE_MOVIES.filter(function (item) {
          if (!keyword) {
            return true;
          }
          return normalize([
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            item.tags,
            item.category
          ].join(" ")).indexOf(keyword) !== -1;
        }).slice(0, 120);

        searchResults.innerHTML = items.map(function (item) {
          return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + item.file + '">',
            '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
            '<span class="play-badge">▶</span>',
            '<span class="year-badge">' + item.year + '</span>',
            '</a>',
            '<div class="card-body">',
            '<a class="card-title" href="' + item.file + '">' + item.title + '</a>',
            '<p class="card-desc">' + item.oneLine + '</p>',
            '<div class="card-meta">',
            '<a href="' + item.categoryFile + '">' + item.category + '</a>',
            '<span>' + item.region + '</span>',
            '</div>',
            '</div>',
            '</article>'
          ].join("");
        }).join("");
      }

      if (searchInput) {
        searchInput.addEventListener("input", renderSearch);
      }

      renderSearch();
    }
  });
})();
