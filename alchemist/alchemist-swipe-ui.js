(function (global) {
  function attachSwipe(panel, handlers) {
    let startX = 0;
    let startY = 0;

    function onStart(event) {
      const point = event.touches ? event.touches[0] : event;
      startX = point.clientX;
      startY = point.clientY;
    }

    function onEnd(event) {
      const point = event.changedTouches ? event.changedTouches[0] : event;
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (Math.max(absX, absY) < 40) return;
      if (absY > absX && dy < 0) handlers.onUp();
      else if (absY > absX && dy > 0) handlers.onDown();
      else if (absX > absY && dx < 0) handlers.onLeft();
      else if (absX > absY && dx > 0) handlers.onRight();
    }

    panel.addEventListener('touchstart', onStart, { passive: true });
    panel.addEventListener('touchend', onEnd, { passive: true });
    panel.addEventListener('pointerdown', onStart, { passive: true });
    panel.addEventListener('pointerup', onEnd, { passive: true });
  }

  global.AlchemistSwipeUI = { attachSwipe };
})(window);
