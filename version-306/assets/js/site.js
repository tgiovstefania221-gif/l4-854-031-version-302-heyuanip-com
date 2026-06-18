(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function getBase() {
    return document.body ? document.body.getAttribute("data-base") || "" : "";
  }

  function toggleHidden(element) {
    if (element) {
      element.classList.toggle("hidden");
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cardHtml(movie, base) {
    return [
      '<a href="' + escapeHtml(base + movie.href) + '" class="movie-card group cursor-pointer hover-scale rounded-lg overflow-hidden bg-white shadow-ocean">',
      '  <div class="poster-frame relative aspect-[4/5] overflow-hidden">',
      '    <span class="poster-fallback">经典国产电视剧</span>',
      '    <img src="' + escapeHtml(base + movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" data-fallback-cover>',
      '    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">',
      '      <div class="absolute inset-0 flex items-center justify-center">',
      '        <span class="w-16 h-16 rounded-full bg-coral-accent/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 text-white text-2xl">▶</span>',
      '      </div>',
      '    </div>',
      '    <span class="absolute top-2 right-2 px-2 py-1 bg-ocean-blue/90 rounded text-white text-xs font-medium">' + escapeHtml(movie.year) + '</span>',
      '  </div>',
      '  <div class="p-3">',
      '    <h3 class="font-semibold text-text-dark mb-1 line-clamp-2 group-hover:text-ocean-blue transition-colors">' + escapeHtml(movie.title) + '</h3>',
      '    <p class="text-sm text-text-gray mb-2 line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="flex items-center justify-between text-xs text-text-gray gap-2">',
      '      <span class="px-2 py-1 bg-sand-warm rounded line-clamp-1">' + escapeHtml(movie.region) + '</span>',
      '      <span class="px-2 py-1 bg-ocean-light/30 rounded line-clamp-1">' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join("");
  }

  function setupHeader() {
    var searchPanel = document.querySelector("[data-search-panel]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    document.querySelectorAll("[data-toggle-search]").forEach(function (button) {
      button.addEventListener("click", function () {
        toggleHidden(searchPanel);
        if (searchPanel && !searchPanel.classList.contains("hidden")) {
          var input = searchPanel.querySelector("input[name='q']");
          if (input) {
            input.focus();
          }
        }
      });
    });

    document.querySelectorAll("[data-toggle-menu]").forEach(function (button) {
      button.addEventListener("click", function () {
        toggleHidden(mobileMenu);
      });
    });

    document.querySelectorAll("[data-site-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = getBase() + "search.html?q=" + encodeURIComponent(query);
        }
      });
    });

    document.querySelectorAll("[data-back-top]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
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

    if (slides.length > 1) {
      restart();
    }
  }

  function setupFilters() {
    document.querySelectorAll(".js-filter-area").forEach(function (area) {
      var textInput = area.querySelector("[data-filter-text]");
      var regionInput = area.querySelector("[data-filter-region]");
      var typeInput = area.querySelector("[data-filter-type]");
      var yearInput = area.querySelector("[data-filter-year]");
      var countNode = area.querySelector("[data-filter-count]");
      var emptyNode = area.querySelector("[data-empty-state]");
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function applyFilter() {
        var text = normalize(textInput && textInput.value);
        var region = normalize(regionInput && regionInput.value);
        var type = normalize(typeInput && typeInput.value);
        var year = normalize(yearInput && yearInput.value);
        var visible = 0;

        cards.forEach(function (card) {
          var keywords = normalize(card.getAttribute("data-keywords"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;

          if (text && keywords.indexOf(text) === -1) {
            matched = false;
          }
          if (region && cardRegion !== region) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }

          card.classList.toggle("hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = String(visible);
        }
        if (emptyNode) {
          emptyNode.classList.toggle("hidden", visible !== 0);
        }
      }

      [textInput, regionInput, typeInput, yearInput].forEach(function (input) {
        if (input) {
          input.addEventListener("input", applyFilter);
          input.addEventListener("change", applyFilter);
        }
      });
    });
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var results = document.getElementById("search-results");
    var summary = document.querySelector("[data-search-summary]");
    if (!form || !results || !window.SEARCH_MOVIES) {
      return;
    }

    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (input) {
      input.value = initialQuery;
    }

    function render(query) {
      var q = normalize(query);
      if (!q) {
        results.innerHTML = "";
        if (summary) {
          summary.textContent = "请输入关键词开始搜索。";
        }
        return;
      }

      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return normalize(movie.keywords).indexOf(q) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(function (movie) {
        return cardHtml(movie, "");
      }).join("");

      if (summary) {
        summary.textContent = "搜索 \"" + query + "\" 找到 " + matched.length + " 个结果。";
      }
      setupImageFallbacks();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : "";
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      render(query);
    });

    render(initialQuery);
  }

  function setupVideoPlayers() {
    document.querySelectorAll("video[data-hls-source]").forEach(function (video) {
      var source = video.getAttribute("data-hls-source");
      var shell = video.closest(".player-shell");
      var loading = shell ? shell.querySelector("[data-player-loading]") : null;
      var errorBox = shell ? shell.querySelector("[data-player-error]") : null;
      var errorText = shell ? shell.querySelector("[data-player-error-text]") : null;
      var retry = shell ? shell.querySelector("[data-player-retry]") : null;

      function hideLoading() {
        if (loading) {
          loading.classList.add("hidden");
        }
      }

      function showError(message) {
        hideLoading();
        if (errorText) {
          errorText.textContent = message;
        }
        if (errorBox) {
          errorBox.classList.remove("hidden");
        }
      }

      if (retry) {
        retry.addEventListener("click", function () {
          window.location.reload();
        });
      }

      if (!source) {
        showError("播放源缺失");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showError("网络错误，请检查播放源或网络连接");
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showError("媒体错误，正在尝试恢复播放");
            hls.recoverMediaError();
          } else {
            showError("无法加载视频，请稍后重试");
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", hideLoading);
        video.addEventListener("error", function () {
          showError("无法加载视频，请稍后重试");
        });
      } else {
        showError("当前浏览器不支持 HLS 播放");
      }
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll("img[data-fallback-cover]").forEach(function (image) {
      if (image.getAttribute("data-fallback-bound") === "1") {
        return;
      }
      image.setAttribute("data-fallback-bound", "1");
      image.addEventListener("error", function () {
        image.remove();
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupVideoPlayers();
    setupImageFallbacks();
  });
})();
