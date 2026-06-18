(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var scope = panel.closest(".page-content") || document;
      var input = panel.querySelector("[data-filter-input]");
      var type = panel.querySelector("[data-filter-type]");
      var region = panel.querySelector("[data-filter-region]");
      var year = panel.querySelector("[data-filter-year]");
      var items = Array.prototype.slice.call(scope.querySelectorAll(".filter-item"));

      function currentValue(el) {
        return el ? el.value.trim().toLowerCase() : "";
      }

      function apply() {
        var keyword = currentValue(input);
        var typeValue = currentValue(type);
        var regionValue = currentValue(region);
        var yearValue = currentValue(year);
        items.forEach(function (item) {
          var search = (item.getAttribute("data-search") || "").toLowerCase();
          var itemType = (item.getAttribute("data-type") || "").toLowerCase();
          var itemRegion = (item.getAttribute("data-region") || "").toLowerCase();
          var itemYear = (item.getAttribute("data-year") || "").toLowerCase();
          var matched = true;
          if (keyword && search.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && itemType !== typeValue) {
            matched = false;
          }
          if (regionValue && itemRegion !== regionValue) {
            matched = false;
          }
          if (yearValue && itemYear !== yearValue) {
            matched = false;
          }
          item.classList.toggle("is-hidden", !matched);
        });
      }

      [input, type, region, year].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      if (document.querySelector("[data-search-page]") && input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          input.value = q;
        }
      }
      apply();
    });
  }

  function initPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var url = box.getAttribute("data-video");
      var started = false;
      var hls = null;

      if (!video || !url) {
        return;
      }

      function attach() {
        if (started) {
          return Promise.resolve();
        }
        started = true;
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          });
        }
        video.src = url;
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          if (button) {
            button.classList.add("is-hidden");
          }
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        });
      }

      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          play();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
