(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-live-search]');
    var buttons = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var activeFilter = 'all';

    if (input && initial) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var text = normalize(input ? input.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-query'));
        var region = card.getAttribute('data-region') || '';
        var type = card.getAttribute('data-type') || '';
        var matchesText = !text || haystack.indexOf(text) !== -1;
        var matchesFilter = activeFilter === 'all' || region === activeFilter || type === activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
        var showCard = matchesText && matchesFilter;
        card.classList.toggle('hidden', !showCard);
        if (showCard) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var playButton = document.querySelector('[data-play-button]');
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function bindSource() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', streamUrl);
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      }
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', streamUrl);
    }
  }

  function startPlayback() {
    bindSource();
    video.setAttribute('controls', 'controls');
    if (overlay) {
      overlay.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
}
