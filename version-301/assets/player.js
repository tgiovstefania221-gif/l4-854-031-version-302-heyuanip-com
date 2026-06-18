(function () {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var playButton = player.querySelector('[data-play-button]');
  var sources = [player.dataset.source, player.dataset.fallback].filter(Boolean);
  var mp4 = player.dataset.mp4;
  var hls = null;
  var index = 0;
  var loadingMp4 = false;

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  function loadMp4() {
    if (!mp4 || loadingMp4) {
      return;
    }

    loadingMp4 = true;
    destroyHls();
    video.src = mp4;
    video.load();
  }

  function loadSource(source) {
    destroyHls();
    loadingMp4 = false;

    if (!source) {
      loadMp4();
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(source);
      });
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          loadNextSource();
        }
      });
      return;
    }

    loadMp4();
  }

  function loadNextSource() {
    if (index + 1 < sources.length) {
      index += 1;
      loadSource(sources[index]);
      return;
    }

    loadMp4();
  }

  function startPlayback() {
    if (!video.src && !hls) {
      loadSource(sources[index]);
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      }).catch(function () {
        if (playButton) {
          playButton.classList.remove('is-hidden');
        }
      });
    }
  }

  video.addEventListener('error', loadNextSource);
  video.addEventListener('play', function () {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', function () {
    if (playButton) {
      playButton.classList.remove('is-hidden');
    }
  });

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  loadSource(sources[index]);
})();
