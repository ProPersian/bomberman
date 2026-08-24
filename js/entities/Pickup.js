/* ---------- Pickup ---------- */
import { Entity } from "./Entity.js";
import { CONFIG } from '../config.js';
import { U } from '../utils.js';

// آیتم‌ها با شکل‌های Canvas جامد رسم می‌شوند تا در همهٔ سیستم‌ها
// واضح و پررنگ دیده شوند (ایموجی روی بعضی ویندوزها توخالی و کمرنگ می‌شود).
function glow(ctx, cx, cy, color){
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20);
  g.addColorStop(0, color + 'aa');
  g.addColorStop(1, color + '00');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
}
function star(ctx, cx, cy, outer, inner){
  ctx.beginPath();
  for(let i = 0; i < 10; i++){
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
    if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function heart(ctx, cx, cy, s){
  ctx.beginPath();
  ctx.moveTo(cx, cy + 8 * s);
  ctx.bezierCurveTo(cx - 9 * s, cy + 1 * s, cx - 9 * s, cy - 6 * s, cx - 5 * s, cy - 6 * s);
  ctx.arc(cx - 2.5 * s, cy - 6 * s, 2.5 * s, Math.PI, 0);
  ctx.arc(cx + 2.5 * s, cy - 6 * s, 2.5 * s, Math.PI, 0);
  ctx.bezierCurveTo(cx + 9 * s, cy - 6 * s, cx + 9 * s, cy + 1 * s, cx, cy + 8 * s);
  ctx.closePath();
}

export class Pickup extends Entity{
  constructor(x,y,type){super(x+.5,y+.5);this.type=type;this.bob=Math.random()*Math.PI*2;}
  update(dt,game){
    this.bob+=dt*3;
    if(U.dist(this.x,this.y,game.player.x,game.player.y)<.6){
      this.apply(game);this.alive=false;
    }
  }
  apply(game){
    const p=game.player.stats;
    switch(this.type){
      case 'coin':
        game.addCoins(1);
        game.audio.coin();
        break;
      case 'bomb':p.bombs++;break;
      case 'fire':p.fire++;break;
      case 'speed':p.speed=Math.min(p.speed+1,5);break;
      case 'life':p.lives++;break;
      case 'shield':p.shield++;break;
      case 'star':game.addScore(200);game.addStars(1);break;
      // دش پیش‌فرض فعال است؛ این آیتم شارژ دش را فوراً پر می‌کند
      case 'stamina':game.player.dashCharge=1;break;
    }
    if(this.type!=='coin')game.audio.pickup();
  }
  draw(ctx){
    const px=this.x*CONFIG.TILE;
    const py=this.y*CONFIG.TILE+Math.sin(this.bob)*3;
    ctx.save();
    ctx.globalAlpha=1;
    ctx.lineJoin='round';

    // سایهٔ زمینی
    ctx.fillStyle='rgba(7,10,28,.4)';
    ctx.beginPath();ctx.ellipse(px,py+13,10,3.5,0,0,Math.PI*2);ctx.fill();

    switch(this.type){
      case 'coin':
        glow(ctx,px,py,'#ffd75e');
        ctx.fillStyle='#ffd75e';
        ctx.beginPath();ctx.arc(px,py,11,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#b07d10';ctx.lineWidth=2.5;ctx.stroke();
        ctx.fillStyle='#fff3b0';
        ctx.beginPath();ctx.arc(px,py,5.5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#c98f1b';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.stroke();
        // برق سکه
        ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(px+8,py-8);ctx.lineTo(px+12,py-12);ctx.stroke();
        break;
      case 'bomb':
        glow(ctx,px,py,'#8a8ab8');
        ctx.fillStyle='#141426';
        ctx.beginPath();ctx.arc(px,py,10,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#3a3a5e';
        ctx.beginPath();ctx.arc(px-3,py-3,4,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#c7934c';ctx.lineWidth=2;ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(px+5,py-8);ctx.quadraticCurveTo(px+10,py-12,px+7,py-15);ctx.stroke();
        ctx.fillStyle='#ff554d';
        ctx.beginPath();ctx.arc(px+7,py-16,2.5,0,Math.PI*2);ctx.fill();
        break;
      case 'fire':
        glow(ctx,px,py,'#ff8a2a');
        ctx.fillStyle='#ff5a1f';
        ctx.beginPath();
        ctx.moveTo(px,py+9);
        ctx.quadraticCurveTo(px-9,py+1,px-5,py-4);
        ctx.quadraticCurveTo(px-2,py-8,px-1,py-11);
        ctx.quadraticCurveTo(px+2,py-6,px+4,py-4);
        ctx.quadraticCurveTo(px+9,py+1,px,py+9);
        ctx.closePath();ctx.fill();
        ctx.fillStyle='#ffd166';
        ctx.beginPath();
        ctx.moveTo(px,py+6);
        ctx.quadraticCurveTo(px-4,py,px-2,py-3);
        ctx.quadraticCurveTo(px,py-6,px+1,py-8);
        ctx.quadraticCurveTo(px+3,py-3,px+4,py-1);
        ctx.quadraticCurveTo(px+6,py+1,px,py+6);
        ctx.closePath();ctx.fill();
        break;
      case 'speed':
        glow(ctx,px,py,'#7dff6a');
        ctx.strokeStyle='#7dff6a';ctx.lineWidth=3.5;ctx.lineCap='round';
        ctx.beginPath();
        ctx.moveTo(px-8,py+4);ctx.lineTo(px,py);ctx.lineTo(px-8,py-4);
        ctx.moveTo(px-2,py+4);ctx.lineTo(px+6,py);ctx.lineTo(px-2,py-4);
        ctx.stroke();
        break;
      case 'life':
        glow(ctx,px,py,'#ff5f6d');
        ctx.fillStyle='#ff4d5e';
        heart(ctx,px,py,1);
        ctx.fill();
        ctx.fillStyle='#ff9aa5';
        ctx.beginPath();ctx.arc(px-4.5,py-4,2,0,Math.PI*2);ctx.fill();
        break;
      case 'shield':
        glow(ctx,px,py,'#5ac8ff');
        ctx.fillStyle='#3fa9f5';
        ctx.beginPath();
        ctx.moveTo(px-10,py-8);
        ctx.lineTo(px+10,py-8);
        ctx.lineTo(px+10,py);
        ctx.quadraticCurveTo(px+10,py+8,px,py+11);
        ctx.quadraticCurveTo(px-10,py+8,px-10,py);
        ctx.closePath();ctx.fill();
        ctx.strokeStyle='#d6f0ff';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle='#bce6ff';
        ctx.fillRect(px-6,py-5,5,9);
        break;
      case 'star':
        glow(ctx,px,py,'#ffe066');
        ctx.fillStyle='#ffd93d';
        star(ctx,px,py,12,5);
        ctx.fill();
        ctx.strokeStyle='#d19e00';ctx.lineWidth=2;ctx.stroke();
        break;
      case 'stamina':
        // نفس/دش: گرداب بادِ فیروزه‌ای
        glow(ctx,px,py,'#6ef0e0');
        ctx.strokeStyle='#6ef0e0';ctx.lineWidth=3.5;ctx.lineCap='round';
        ctx.beginPath();ctx.arc(px,py,7,-Math.PI*.85,Math.PI*.45);ctx.stroke();
        ctx.beginPath();ctx.arc(px,py,3,-Math.PI*.6,Math.PI*.6);ctx.stroke();
        ctx.globalAlpha=.75;
        ctx.beginPath();ctx.moveTo(px-10,py+3);ctx.lineTo(px-14,py+3);ctx.stroke();
        ctx.beginPath();ctx.moveTo(px-10,py-1);ctx.lineTo(px-14,py-1);ctx.stroke();
        ctx.globalAlpha=1;
        break;
    }
    ctx.restore();
  }
}
