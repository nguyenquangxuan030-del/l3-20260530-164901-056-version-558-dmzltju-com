(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function attachSource(video, source) {
    if (!video || !source || video.dataset.bound === 'true') {
      return;
    }

    video.dataset.bound = 'true';

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    video.src = source;
  }

  function initializePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var source = video ? video.getAttribute('data-src') : '';

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener('click', function () {
        attachSource(video, source);
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  ready(initializePlayers);
})();
