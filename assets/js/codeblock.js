(function () {
  function stretchHll() {
    document.querySelectorAll('pre .hll').forEach(function (hll) {
      var pre = hll.closest('pre');
      if (pre) hll.style.minWidth = pre.scrollWidth + 'px';
    });
  }

  function collapseCodeBlocks() {
    var blocks = Array.from(document.querySelectorAll('figure.highlight'));
    blocks.forEach(function (block) {
      var desc = block.getAttribute('data-desc');
      if (!desc) return;
      var lang = '';
      var code = block.querySelector('code[data-lang]');
      if (code) lang = code.getAttribute('data-lang');

      var details = document.createElement('details');
      details.className = 'code-collapsible';
      details.open = true;

      var summary = document.createElement('summary');
      summary.className = 'code-collapsible-summary';
      summary.textContent = desc || lang || 'code';

      block.parentNode.insertBefore(details, block);
      details.appendChild(summary);
      details.appendChild(block);
    });

    stretchHll();
  }

  collapseCodeBlocks();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(stretchHll, 100);
  });
})();
