(function () {
  function initMoviePlayer(videoUrl) {
    var video = document.getElementById('movie-video');
    var cover = document.getElementById('player-cover');
    var hls = null;
    var attached = false;

    if (!video || !videoUrl) {
      return;
    }

    function attachVideo() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        video.src = videoUrl;
      }

      attached = true;
    }

    function playVideo() {
      attachVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
