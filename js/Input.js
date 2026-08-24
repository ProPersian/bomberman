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

    // ------ دکمه‌های جهت‌یابی (Pad) با Pointer Events ------
    document.querySelectorAll('#touch .pad button').forEach((btn) => {
      const dir = btn.dataset.dir;
      if (!dir) return;
      // برای دکمه‌ی pause از رویداد جداگانه استفاده می‌کنیم
      if (dir === 'pause') {
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          bus.emit('togglePause');
        });
        return;
      }
      const onDown = (e) => {
        e.preventDefault();
        if (this.pointers[dir]) this.pointers[dir].add(e.pointerId);
      };
      const onUp = (e) => {
        e.preventDefault();
        if (this.pointers[dir]) this.pointers[dir].delete(e.pointerId);
      };
      btn.addEventListener('pointerdown', onDown);
      btn.addEventListener('pointerup', onUp);
      btn.addEventListener('pointercancel', onUp);
      btn.addEventListener('pointerleave', onUp);
    });

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