(function () {
  window.initMoviePlayer = function (source) {
    var shell = document.querySelector('[data-player-shell]');
    var video = document.querySelector('[data-video]');
    var button = document.querySelector('[data-play-button]');
    if (!shell || !video || !button || !source) return;

    var ready = false;
    var hls = null;

    var attach = function () {
      if (ready) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.controls = true;
      ready = true;
    };

    var play = function () {
      attach();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    };

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
