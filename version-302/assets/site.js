(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function htmlEscape(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function card(movie, prefix) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + prefix + htmlEscape(movie.url) + '" aria-label="观看' + htmlEscape(movie.title) + '">',
      '<img src="' + prefix + htmlEscape(movie.cover) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
      '<span class="play-badge">▶</span>',
      '<span class="year-badge">' + htmlEscape(movie.year || "精选") + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + prefix + htmlEscape(movie.url) + '">' + htmlEscape(movie.title) + '</a></h3>',
      '<p>' + htmlEscape(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + htmlEscape(movie.regionGroup) + '</span><span>' + htmlEscape(movie.typeGroup) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function initSearch() {
    var results = document.getElementById("search-results");
    var input = document.getElementById("search-input");
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var prefix = results.getAttribute("data-prefix") || "./";
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var matches = window.SITE_MOVIES.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.regionGroup, movie.type, movie.typeGroup, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
      return !normalized || haystack.indexOf(normalized) !== -1;
    }).slice(0, 120);
    results.innerHTML = matches.map(function (movie) {
      return card(movie, prefix);
    }).join("");
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
}());
