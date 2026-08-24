class Input {
  constructor(bus) {
    this.bus = bus;
    this.keys = {};
    // مجموعه pointerIdها برای هر جهت (اجازه‌ی چندلمسی)
    this.pointers = { up: new Set(), down: new Set(), left: new Set(), right: new Set() };

    // رویدادهای کیبورد (بدون تغییر)
    window.addEventListener('keydown', (e) => {
      if (e.repeat) { this.keys[e.code] = true; return; }
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.code === 'KeyP') bus.emit('togglePause');
      if (e.code === 'KeyM') bus.emit('toggleMute');
      if (e.code === 'Enter') bus.emit('remoteDetonate');
      if (e.code === 'Space') bus.emit('placeBomb');
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') bus.emit('dash');
    });
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);

    // پاک‌سازی هنگام از دست رفتن فوکوس
    const clear = () => {
      this.keys = {};
      for (const k in this.pointers) this.pointers[k].clear();
    };
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });

    // ------ جوی‌استیک لمسی (جایگزین پد جهت‌دار قدیمی) ------
    const joyBase = document.getElementById('joyBase');
    const joyKnob = document.getElementById('joyKnob');
    if (joyBase && joyKnob) {
      let activePointerId = null;
      const maxDist = 40;    // شعاع حرکت دسته (px)
      const deadZone = 0.25; // زیر این نسبت از شعاع، جهتی فعال نمی‌شود

      const clearDirs = () => { for (const k in this.pointers) this.pointers[k].delete('joy'); };
      const setKnob = (dx, dy) => { joyKnob.style.transform = `translate(${dx}px, ${dy}px)`; };

      const updateDirs = (dx, dy, dist) => {
        clearDirs();
        if (dist < maxDist * deadZone) return;
        const deg = Math.atan2(dy, dx) * 180 / Math.PI;
        if (deg > -157.5 && deg <= -112.5) { this.pointers.up.add('joy'); this.pointers.left.add('joy'); }
        else if (deg > -112.5 && deg <= -67.5) { this.pointers.up.add('joy'); }
        else if (deg > -67.5 && deg <= -22.5) { this.pointers.up.add('joy'); this.pointers.right.add('joy'); }
        else if (deg > -22.5 && deg <= 22.5) { this.pointers.right.add('joy'); }
        else if (deg > 22.5 && deg <= 67.5) { this.pointers.down.add('joy'); this.pointers.right.add('joy'); }
        else if (deg > 67.5 && deg <= 112.5) { this.pointers.down.add('joy'); }
        else if (deg > 112.5 && deg <= 157.5) { this.pointers.down.add('joy'); this.pointers.left.add('joy'); }
        else { this.pointers.left.add('joy'); }
      };

      const onMove = (e) => {
        if (e.pointerId !== activePointerId) return;
        e.preventDefault();
        const rect = joyBase.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const rawDist = Math.hypot(dx, dy);
        const clamped = Math.min(rawDist, maxDist);
        const angle = Math.atan2(dy, dx);
        setKnob(Math.cos(angle) * clamped, Math.sin(angle) * clamped);
        updateDirs(dx, dy, rawDist);
      };

      const onUp = (e) => {
        if (e.pointerId !== activePointerId) return;
        activePointerId = null;
        clearDirs();
        setKnob(0, 0);
      };

      joyBase.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (activePointerId !== null) return; // فقط یک انگشت روی دسته
        activePointerId = e.pointerId;
        joyBase.setPointerCapture?.(e.pointerId);
        onMove(e);
      });
      joyBase.addEventListener('pointermove', onMove);
      joyBase.addEventListener('pointerup', onUp);
      joyBase.addEventListener('pointercancel', onUp);
      joyBase.addEventListener('pointerleave', onUp);
    }

    // ------ دکمه‌های عملیات (Bomb, Remote, Dash) با Pointer Events ------
    const bombBtn = document.getElementById('btnBomb');
    if (bombBtn) {
      bombBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); bus.emit('placeBomb'); });
    }
    const remoteBtn = document.getElementById('btnRemote');
    if (remoteBtn) {
      remoteBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); bus.emit('remoteDetonate'); });
    }
    const dashBtn = document.getElementById('btnDash');
    if (dashBtn) {
      dashBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); bus.emit('dash'); });
    }
  }

  isDown(c) {
    return !!this.keys[c];
  }

  getVector() {
    let x = 0, y = 0;
    if (this.isDown('ArrowUp') || this.isDown('KeyW') || this.pointers.up.size > 0) y -= 1;
    if (this.isDown('ArrowDown') || this.isDown('KeyS') || this.pointers.down.size > 0) y += 1;
    if (this.isDown('ArrowLeft') || this.isDown('KeyA') || this.pointers.left.size > 0) x -= 1;
    if (this.isDown('ArrowRight') || this.isDown('KeyD') || this.pointers.right.size > 0) x += 1;
    if (x && y) {
      const inv = 1 / Math.sqrt(2);
      x *= inv;
      y *= inv;
    }
    return { x, y };
  }
}

export { Input };