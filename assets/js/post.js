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
      if (!block.hasAttribute('data-collapsed')) details.open = true;

      var summary = document.createElement('summary');
      summary.className = 'code-collapsible-summary';
      summary.textContent = desc || lang || 'code';

      block.parentNode.insertBefore(details, block);
      details.appendChild(summary);
      details.appendChild(block);
    });

    stretchHll();
  }

  function imageAltTooltips() {
    var tip = document.createElement('span');
    tip.className = 'img-alt';
    tip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tip);

    document.querySelectorAll('.post-content img[alt], .page-content img[alt]').forEach(function (img) {
      var alt = img.getAttribute('alt');
      if (!alt) return;

      img.addEventListener('mouseenter', function () {
        tip.textContent = alt;
        tip.style.opacity = '1';
      });
      img.addEventListener('mousemove', function (e) {
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top  = (e.clientY + 14) + 'px';
      });
      img.addEventListener('mouseleave', function () {
        tip.style.opacity = '0';
      });
    });
  }

  collapseCodeBlocks();
  imageAltTooltips();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(stretchHll, 100);
  });
})();
