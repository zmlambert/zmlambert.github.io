(function () {
  var THEMES = [
    'gruvbox',
    'dracula',
    'nord',
    'mocha',
    'macchiato',
    'frappe',
    'latte',
  ];
  var STORAGE_KEY = 'theme';

  function applyTheme(theme) {
    if (THEMES.indexOf(theme) === -1) theme = THEMES[0];
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
  }

  function initPicker() {
    var dropdown = document.getElementById('theme-dropdown');
    var menu     = document.getElementById('theme-menu');
    var current  = document.getElementById('theme-current');
    if (!dropdown || !menu || !current) return;

    var active = document.documentElement.getAttribute('data-theme') || THEMES[0];

    // Populate menu
    THEMES.forEach(function (t) {
      var li = document.createElement('li');
      li.textContent = t;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', t === active ? 'true' : 'false');
      li.addEventListener('click', function (e) {
        e.stopPropagation();
        select(t);
        close();
      });
      menu.appendChild(li);
    });

    current.textContent = active;

    function open() {
      dropdown.setAttribute('aria-expanded', 'true');
    }

    function close() {
      dropdown.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      var expanded = dropdown.getAttribute('aria-expanded') === 'true';
      expanded ? close() : open();
    }

    function select(theme) {
      active = theme;
      current.textContent = theme;
      applyTheme(theme);
      menu.querySelectorAll('li').forEach(function (li) {
        li.setAttribute('aria-selected', li.textContent === theme ? 'true' : 'false');
      });
    }

    dropdown.addEventListener('click', function (e) {
      e.stopPropagation();
      toggle();
    });

    dropdown.addEventListener('keydown', function (e) {
      var expanded = dropdown.getAttribute('aria-expanded') === 'true';
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!expanded) { open(); return; }
        var idx = THEMES.indexOf(active);
        idx = e.key === 'ArrowDown'
          ? Math.min(idx + 1, THEMES.length - 1)
          : Math.max(idx - 1, 0);
        select(THEMES[idx]);
      }
    });

    document.addEventListener('click', function () {
      close();
    });
  }

  document.addEventListener('DOMContentLoaded', initPicker);
})();
