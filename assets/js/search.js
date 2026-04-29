(function () {
  var input   = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var status  = document.getElementById('search-status');
  if (!input) return;

  var posts = [];
  var debounceTimer;
  var indexUrl = input.closest('[data-search-index]')
    ? input.closest('[data-search-index]').dataset.searchIndex
    : '/search.json';

  fetch(indexUrl)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      posts = data;
      var params   = new URLSearchParams(location.search);
      var tagParam = params.get('tag');
      if (tagParam) {
        input.value = tagParam;
        runSearch();
      } else {
        setStatus(posts.length + ' post' + (posts.length === 1 ? '' : 's') + ' indexed.');
      }
    })
    .catch(function () {
      setStatus('error: failed to load search index.');
    });

  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 150);
  });

  function runSearch() {
    var query = input.value.trim().toLowerCase();
    results.innerHTML = '';

    if (!query) {
      setStatus(posts.length + ' post' + (posts.length === 1 ? '' : 's') + ' indexed.');
      return;
    }

    var matched = posts.filter(function (post) {
      return contains(post.title, query) ||
             contains(post.content, query) ||
             anyContains(post.tags, query);
    });

    setStatus(matched.length + ' result' + (matched.length === 1 ? '' : 's') + ' for "' + query + '"');

    matched.forEach(function (post) {
      var li       = document.createElement('li');
      li.className = 'search-result';

      var tagsHtml = (post.tags && post.tags.length)
        ? '<div class="sr-tags">' +
            post.tags.map(function (t) {
              return '<a class="tag" href="/search/?tag=' + encodeURIComponent(t) + '">' + esc(t) + '</a>';
            }).join('') +
          '</div>'
        : '';

      var snippet  = makeSnippet(post.content, query);
      var snippetHtml = snippet
        ? '<p class="sr-snippet">' + snippet + '</p>'
        : '';

      li.innerHTML =
        '<div class="sr-header">' +
          '<a class="sr-title" href="' + esc(post.url) + '">' + esc(post.title) + '</a>' +
          '<time class="sr-date">' + esc(post.date) + '</time>' +
        '</div>' +
        tagsHtml +
        snippetHtml;

      results.appendChild(li);
    });
  }

  function makeSnippet(content, query) {
    var idx = content.toLowerCase().indexOf(query);
    if (idx === -1) return '';
    var start   = Math.max(0, idx - 80);
    var end     = Math.min(content.length, idx + query.length + 80);
    var excerpt = (start > 0 ? '…' : '') +
                  content.slice(start, end) +
                  (end < content.length ? '…' : '');
    var escaped      = esc(excerpt);
    var escapedQuery = esc(query);
    return escaped.replace(
      new RegExp('(' + escRegex(escapedQuery) + ')', 'gi'),
      '<mark>$1</mark>'
    );
  }

  function contains(str, query) {
    return str && str.toLowerCase().indexOf(query) !== -1;
  }

  function anyContains(arr, query) {
    return Array.isArray(arr) && arr.some(function (s) { return contains(s, query); });
  }

  function setStatus(msg) {
    if (status) status.textContent = msg;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
})();
