(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var topButton = document.querySelector('[data-back-top]');

  if (topButton) {
    topButton.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    showSlide(0);

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var input = document.querySelector('[data-filter-input]');
  var empty = document.querySelector('[data-no-results]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' '));
  }

  function filterMovies(value) {
    var query = normalize(value);
    var visible = 0;

    cards.forEach(function (card) {
      var matched = !query || cardText(card).indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  if (input && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (q) {
      input.value = q;
      filterMovies(q);
    }

    input.addEventListener('input', function () {
      filterMovies(input.value);
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('active');
      });

      chip.classList.add('active');
      var value = chip.getAttribute('data-filter-value') || '';

      if (input) {
        input.value = value;
      }

      filterMovies(value);
    });
  });

  window.initPlayer = function (streamUrl) {
    var video = document.getElementById('moviePlayer');
    var shell = document.querySelector('[data-player-shell]');
    var trigger = document.querySelector('[data-play-trigger]');
    var hls;
    var ready = false;

    if (!video || !shell || !trigger || !streamUrl) {
      return;
    }

    function begin() {
      shell.classList.add('is-playing');
      video.controls = true;

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {});
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        video.play().catch(function () {});
      }
    }

    trigger.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        begin();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
