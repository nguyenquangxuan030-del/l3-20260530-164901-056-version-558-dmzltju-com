(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (stage) {
    var video = stage.querySelector('.movie-player');
    var startButton = stage.querySelector('.video-start');
    var toggleButton = stage.querySelector('.video-toggle');
    var mutedButton = stage.querySelector('.video-muted');
    var fullscreenButton = stage.querySelector('.video-fullscreen');
    var stream = video ? video.getAttribute('data-stream') : '';
    var instance = null;
    var ready = false;

    function prepare() {
      if (!video || !stream || ready) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        instance.loadSource(stream);
        instance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
      ready = true;
    }

    function playVideo() {
      prepare();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function togglePlay() {
      if (!video) {
        return;
      }
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    function refreshState() {
      if (!video) {
        return;
      }
      stage.classList.toggle('playing', !video.paused);
      if (toggleButton) {
        toggleButton.textContent = video.paused ? '播放' : '暂停';
      }
      if (mutedButton) {
        mutedButton.textContent = video.muted ? '取消静音' : '静音';
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    if (toggleButton) {
      toggleButton.addEventListener('click', togglePlay);
    }

    if (mutedButton) {
      mutedButton.addEventListener('click', function () {
        if (!video) {
          return;
        }
        video.muted = !video.muted;
        refreshState();
      });
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener('click', function () {
        if (!video) {
          return;
        }
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', refreshState);
      video.addEventListener('pause', refreshState);
      video.addEventListener('volumechange', refreshState);
    }

    window.addEventListener('beforeunload', function () {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
  });
}());
