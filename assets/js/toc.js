(function () {
  // Stretch highlighted lines to full scroll width so the background
  // doesn't cut off when the code block scrolls horizontally.
  function stretchHll() {
    document.querySelectorAll('pre .hll').forEach(function (hll) {
      var pre = hll.closest('pre');
      if (pre) hll.style.minWidth = pre.scrollWidth + 'px';
    });
  }
  stretchHll();
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(stretchHll, 100);
  });

  function buildToc() {
    var content = document.querySelector('.post-content');
    if (!content) return;

    var headings = Array.from(content.querySelectorAll('h1, h2, h3')).filter(function (h) {
      return h.id;
    });
    if (headings.length < 2) return;

    var minLevel = Math.min.apply(null, headings.map(function (h) {
      return parseInt(h.tagName[1]);
    }));

    var nav = document.createElement('nav');
    nav.className = 'section-nav';
    nav.setAttribute('aria-label', 'Table of contents');

    var rootOl = document.createElement('ol');
    nav.appendChild(rootOl);

    var stack = [{ level: minLevel - 1, ol: rootOl }];

    headings.forEach(function (h) {
      var level = parseInt(h.tagName[1]);

      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      var li = document.createElement('li');
      var a  = document.createElement('a');
      a.href        = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      stack[stack.length - 1].ol.appendChild(li);

      var childOl = document.createElement('ol');
      li.appendChild(childOl);
      stack.push({ level: level, ol: childOl });
    });

    nav.querySelectorAll('ol:empty').forEach(function (ol) { ol.remove(); });

    content.insertBefore(nav, content.firstChild);
  }

  buildToc();
})();
