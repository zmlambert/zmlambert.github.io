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
})();
