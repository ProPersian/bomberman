/* ---------- Explosion ---------- */
import { Entity } from "./Entity.js";
import { CONFIG } from '../config.js';
import { U } from '../utils.js';

export class Explosion extends Entity {
  constructor(x, y, damage = true, cause = 'hurt', playerDamage = damage) {
    super(x + .5, y + .5);
    this.life = CONFIG.EXPLOSION_LIFE;
    this.damageEnabled = damage;
    this.cause = cause;
    this.playerDamage = playerDamage;
    // هر دشمن فقط یک بار توسط این انفجار آسیب ببیند
    this.hitEnemies = new Set();
  }
  update(dt, game) {
    this.life -= dt;
    if (this.life <= 0) { this.alive = false; return; }
    if (!this.damageEnabled && !this.playerDamage) return;
    if (this.playerDamage && U.dist(this.x, this.y, game.player.x, game.player.y) < .7) game.player.hit(game, this.cause);
    if (!this.damageEnabled) return;
    for (const e of game.enemies) {
      if (
        e.alive &&
        !this.hitEnemies.has(e) &&
        U.dist(this.x, this.y, e.x, e.y) < .7
      ) {
        this.hitEnemies.add(e);
        e.damage(1, game);
      }
    }

  }
  draw(ctx) {
    const a = this.life / CONFIG.EXPLOSION_LIFE;
    const px = this.x * CONFIG.TILE, py = this.y * CONFIG.TILE;
    ctx.fillStyle = `rgba(255,${120 + Math.random() * 80},0,${a})`;
    ctx.beginPath(); ctx.arc(px, py, CONFIG.TILE * .45, 0, Math.PI * 2); ctx.fill();
    ctx.font = '28px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('💥', px, py);
  }
}
