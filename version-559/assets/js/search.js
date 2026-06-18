(function () {
  var form = document.querySelector('.search-page-form');
  var input = form ? form.querySelector('input[name="q"]') : null;
  var status = document.querySelector('[data-search-status]');
  var results = document.querySelector('[data-search-results]');
  var movies = window.SiteMovies || [];
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';

  function card(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.detail) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '      <span class="play-mask">▶</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '      <span class="genre-pill">' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render(query) {
    var clean = query.trim().toLowerCase();
    if (!results || !status) {
      return;
    }
    if (!clean) {
      status.textContent = '请输入关键词开始搜索';
      results.innerHTML = '';
      return;
    }
    var found = movies.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
      return haystack.indexOf(clean) !== -1;
    }).slice(0, 120);
    status.textContent = found.length ? '已为你匹配相关影片' : '没有找到相关影片';
    results.innerHTML = found.map(card).join('');
  }

  if (input) {
    input.value = initialQuery;
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value : '';
      var url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render(query);
    });
  }

  render(initialQuery);
}());
