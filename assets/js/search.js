(function () {
  var input = document.getElementById('search-input');
  var summary = document.getElementById('search-summary');
  var results = document.getElementById('search-results');
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(movie) {
    var meta = [movie.year, movie.region, movie.type].filter(Boolean).slice(0, 3);
    var metaHtml = meta.map(function (item) {
      return '<span>' + escapeHtml(item) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.url) + '" class="movie-card-link">',
      '    <div class="movie-thumb">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="play-mark">▶</span>',
      '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <div class="movie-info">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-meta">' + metaHtml + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  if (input) {
    input.value = query;
  }

  if (!summary || !results || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  if (!query) {
    summary.textContent = '输入关键词后即可查看相关影片。';
    results.innerHTML = window.MOVIE_SEARCH_INDEX.slice(0, 12).map(card).join('');
    return;
  }

  var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      (movie.tags || []).join(' '),
      movie.oneLine
    ].join(' ').toLowerCase();
    return terms.every(function (term) {
      return text.indexOf(term) !== -1;
    });
  });

  summary.textContent = matched.length ? '已找到相关影片，点击卡片进入播放页。' : '没有找到相关影片，可以更换关键词继续搜索。';
  results.innerHTML = matched.slice(0, 80).map(card).join('');
}());
