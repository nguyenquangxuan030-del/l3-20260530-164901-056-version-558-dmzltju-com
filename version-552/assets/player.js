function initMoviePlayer(source, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);

    if (!video || !overlay || !source) {
        return;
    }

    function bindSource() {
        if (video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = source;
        }

        video.setAttribute('data-ready', '1');
    }

    function startPlay() {
        bindSource();
        overlay.classList.add('is-hidden');
        video.controls = true;
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {});
        }
    }

    overlay.addEventListener('click', startPlay);
    video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
            startPlay();
        }
    });
}
