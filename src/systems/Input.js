/**
 * Input — клавиатура (WASD/стрелки) + тач-стик на левой половине экрана.
 * Pointer Events, без зависимостей. Стик рисуется двумя div поверх канваса.
 */
export class Input {
  constructor(container) {
    this.container = container;
    this.keys = new Set();
    this.stick = { active: false, id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
    this.stickRadius = 60;

    this.onKeyDown = (e) => this.keys.add(e.code);
    this.onKeyUp = (e) => this.keys.delete(e.code);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Визуал стика.
    this.baseEl = document.createElement('div');
    this.baseEl.style.cssText = 'position:absolute;width:110px;height:110px;border:2px solid rgba(0,170,255,0.4);border-radius:50%;display:none;pointer-events:none;z-index:5;';
    this.knobEl = document.createElement('div');
    this.knobEl.style.cssText = 'position:absolute;width:48px;height:48px;background:rgba(0,170,255,0.5);border-radius:50%;display:none;pointer-events:none;z-index:5;';
    container.appendChild(this.baseEl);
    container.appendChild(this.knobEl);

    this.onPointerDown = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x > rect.width / 2 || this.stick.active) return; // стик только слева
      this.stick.active = true;
      this.stick.id = e.pointerId;
      this.stick.ox = x; this.stick.oy = y;
      this.stick.dx = 0; this.stick.dy = 0;
      this.showStick(x, y, x, y);
    };
    this.onPointerMove = (e) => {
      if (!this.stick.active || e.pointerId !== this.stick.id) return;
      const rect = container.getBoundingClientRect();
      let dx = (e.clientX - rect.left) - this.stick.ox;
      let dy = (e.clientY - rect.top) - this.stick.oy;
      const len = Math.hypot(dx, dy);
      if (len > this.stickRadius) { dx = dx / len * this.stickRadius; dy = dy / len * this.stickRadius; }
      this.stick.dx = dx; this.stick.dy = dy;
      this.showStick(this.stick.ox, this.stick.oy, this.stick.ox + dx, this.stick.oy + dy);
    };
    this.onPointerUp = (e) => {
      if (!this.stick.active || e.pointerId !== this.stick.id) return;
      this.stick.active = false;
      this.stick.dx = 0; this.stick.dy = 0;
      this.baseEl.style.display = 'none';
      this.knobEl.style.display = 'none';
    };
    container.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
  }

  showStick(ox, oy, kx, ky) {
    this.baseEl.style.display = 'block';
    this.baseEl.style.left = (ox - 55) + 'px';
    this.baseEl.style.top = (oy - 55) + 'px';
    this.knobEl.style.display = 'block';
    this.knobEl.style.left = (kx - 24) + 'px';
    this.knobEl.style.top = (ky - 24) + 'px';
  }

  /** Возвращает нормализованный {x, z}: экран вверх = -z. */
  getMove() {
    let x = 0, z = 0;
    const k = this.keys;
    if (k.has('KeyW') || k.has('ArrowUp')) z -= 1;
    if (k.has('KeyS') || k.has('ArrowDown')) z += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
    if (this.stick.active) {
      x += this.stick.dx / this.stickRadius;
      z += this.stick.dy / this.stickRadius;
    }
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    return { x, z };
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.container.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.baseEl.remove();
    this.knobEl.remove();
  }
}
