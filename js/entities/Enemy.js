/* ---------- Enemy (Base) ---------- */
import { Entity } from './Entity.js';
import { CONFIG, TILES, DIRS } from '../config.js';
import { U } from '../utils.js';
import { moveGrid, collidesAt, nearestCenter } from '../Movement.js';

const pixel=(ctx,x,y,w,h,color)=>{
  ctx.fillStyle=color;
  ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
};

export class Enemy extends Entity{
  constructor(x,y,type,cfg){
    super(x,y);
    this.type=type;
    this.cfg=cfg;
    this.hp=cfg.hp;

    this.dir=U.choice(DIRS);

    // جلوگیری از تصمیم‌گیری در هر فریم
    this.decisionTimer=.10;

    this.passBombs=false;
    this.animTime=0;

    // زمان واقعی گیر کردن
    this.stuckTime=0;

    // جلوگیری از انتخاب مکرر همان مسیر ناموفق
    this.blockedDir=null;
    this.blockedCooldown=0;
  }

  update(dt,game){
    this.animTime+=dt;

    this.decisionTimer-=dt;
    this.blockedCooldown-=dt;

    if(this.blockedCooldown<=0){
      this.blockedDir=null;
    }

    const sp=CONFIG.ENEMY_BASE_SPEED*this.cfg.speed;

    const atCenter=
      Math.abs(this.x-nearestCenter(this.x))<.10 &&
      Math.abs(this.y-nearestCenter(this.y))<.10;

    /*
     * تصمیم‌گیری معمول:
     * فقط وقتی تایمر تمام شده یا دشمن به مرکز یک خانه رسیده.
     */
    if(this.decisionTimer<=0){
  const d=this.decide(dt,game);

  if(d && (d[0]||d[1])){
    this.dir=d;
  }

  this.decisionTimer=.35;
}

    const beforeX=this.x;
    const beforeY=this.y;

    const moved=moveGrid(
      this,
      this.dir[0],
      this.dir[1],
      sp*dt,
      game,
      {
        radius:.30,
        passBricks:!!this.passBricks,
        passBombs:this.passBombs
      }
    );

    if(!moved){

  this.stuckTime+=dt;

  // فقط اگر واقعاً به مانع گیر کرده، مسیر جدید انتخاب کن
  if(this.stuckTime>=.10){

    const d=this.decide(dt,game);

    if(d && (d[0]||d[1])){
      this.dir=d;
    }

    this.stuckTime=0;

    // کمی فرصت بده تا جهت جدید اجرا شود
    this.decisionTimer=.35;
  }

}else{

  // حرکت موفق بود؛ یعنی دشمن گیر نکرده
  this.stuckTime=0;
}

    /*
     * اگر دشمن واقعاً بیش از حد گیر کرد،
     * یک بار دیگر مسیر را بررسی کن.
     * نه در هر فریم.
     */
    if(this.stuckTime>.25){

      const d=this.decide(dt,game);

      if(d && (d[0]||d[1])){
        this.dir=d;
      }

      this.stuckTime=0;
      this.decisionTimer=.15;
    }

    if(
      U.dist(
        this.x,
        this.y,
        game.player.x,
        game.player.y
      )<.68
    ){
      game.player.hit(game);
    }
  }

  canMoveTo(x,y,game,opts={}){
    return !collidesAt(
      game,
      x,
      y,
      .30,
      {
        passBricks:!!(opts.passBricks??this.passBombs),
        passBombs:this.passBombs
      }
    );
  }

  validDirections(game,passBricks=this.passBombs){
    const hereX=nearestCenter(this.x);
    const hereY=nearestCenter(this.y);

    return DIRS.filter(d=>
      this.canMoveTo(
        hereX+d[0]*.55,
        hereY+d[1]*.55,
        game,
        {passBricks}
      )
    );
  }

  decide(){
    return this.dir;
  }

  damage(n,game){
    this.hp-=n;

    if(this.hp<=0){
      this.alive=false;
      game.audio.enemyDefeat();
      game.addScore(this.cfg.score);
      game.addCoins(this.cfg.coins);
      game.addPopup(
        this.x,
        this.y,
        '🪙+'+this.cfg.coins
      );
    }else{
      game.addPopup(this.x,this.y,'💥');
    }
  }

  draw(ctx){
    const px=this.x*CONFIG.TILE;
    const py=this.y*CONFIG.TILE;

    const bob=Math.round(
      Math.sin(this.animTime*7)*1.5
    );

    const step=
      Math.sin(this.animTime*10)>0?2:0;

    ctx.save();
    ctx.imageSmoothingEnabled=false;

    ctx.globalAlpha=.3;
    ctx.fillStyle='#0c1025';
    ctx.beginPath();
    ctx.ellipse(
      px,
      py+20,
      15,
      5,
      0,
      0,
      Math.PI*2
    );
    ctx.fill();

    ctx.globalAlpha=1;

    switch(this.type){
      case 'wanderer':
        this.drawWanderer(ctx,px,py+bob,step);
        break;

      case 'warrior':
        this.drawWarrior(ctx,px,py+bob,step);
        break;

      case 'hunter':
        this.drawHunter(ctx,px,py+bob,step);
        break;

      case 'ghost':
        this.drawGhost(ctx,px,py+bob);
        break;

      default:
        this.drawBalloon(ctx,px,py+bob);
        break;
    }

    if(
      this.cfg.hp>1 &&
      this.hp<this.cfg.hp
    ){
      ctx.font='12px sans-serif';
      ctx.textAlign='center';
      ctx.fillText(
        '❤️'.repeat(this.hp),
        px,
        py-28
      );
    }

    ctx.restore();
  }

  drawBalloon(ctx,px,py){
    ctx.fillStyle='#5b244e';
    ctx.beginPath();
    ctx.ellipse(px,py-1,17,19,0,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#ef6a9a';
    ctx.beginPath();
    ctx.ellipse(px,py-3,14,16,0,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#ff9fbd';
    ctx.beginPath();
    ctx.ellipse(px-5,py-9,5,8,-.45,0,Math.PI*2);
    ctx.fill();

    pixel(ctx,px-9,py-4,6,7,'#fff7f0');
    pixel(ctx,px+3,py-4,6,7,'#fff7f0');
    pixel(ctx,px-7,py-2,2,3,'#252344');
    pixel(ctx,px+5,py-2,2,3,'#252344');

    pixel(ctx,px-5,py+6,10,3,'#9b315f');
    pixel(ctx,px-4,py+14,8,4,'#d84e85');
    pixel(ctx,px-2,py+18,4,4,'#8c345f');

    ctx.strokeStyle='#f6c453';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(px,py+22);
    ctx.quadraticCurveTo(px+4,py+25,px,py+29);
    ctx.stroke();
  }

  drawWanderer(ctx,px,py,step){
    ctx.fillStyle='#164b58';
    ctx.beginPath();
    ctx.ellipse(px,py-1,18,19,0,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#35a6a0';
    ctx.beginPath();
    ctx.ellipse(px,py-4,15,16,0,0,Math.PI*2);
    ctx.fill();

    pixel(ctx,px-10,py-6,7,7,'#fff7f0');
    pixel(ctx,px+3,py-6,7,7,'#fff7f0');
    pixel(ctx,px-8,py-4,2,3,'#173047');
    pixel(ctx,px+5,py-4,2,3,'#173047');

    pixel(ctx,px-11,py+7,22,5,'#176b70');
    pixel(ctx,px-6,py+13,12,4,'#0f3d4b');

    pixel(ctx,px-22,py-2,6,4,'#f6c453');
    pixel(ctx,px+16,py-2,6,4,'#f6c453');
    pixel(ctx,px-2,py-24,4,6,'#f6c453');
    pixel(ctx,px-2,py+18,4,6,'#f6c453');
  }

  drawWarrior(ctx,px,py,step){
    ctx.fillStyle='#3d465a';
    ctx.beginPath();
    ctx.ellipse(px,py-1,19,21,0,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#78839a';
    ctx.beginPath();
    ctx.ellipse(px,py-4,15,17,0,0,Math.PI*2);
    ctx.fill();

    pixel(ctx,px-15,py-8,30,6,'#c4cedd');
    pixel(ctx,px-11,py-5,7,8,'#fff7f0');
    pixel(ctx,px+4,py-5,7,8,'#fff7f0');
    pixel(ctx,px-9,py-2,2,4,'#20283a');
    pixel(ctx,px+6,py-2,2,4,'#20283a');

    pixel(ctx,px-12,py+8,24,5,'#3f566c');
    pixel(ctx,px-4,py+14,8,6,'#2b3548');

    ctx.strokeStyle='#f6c453';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(px-18,py-18);
    ctx.lineTo(px-11,py-25);
    ctx.moveTo(px+18,py-18);
    ctx.lineTo(px+11,py-25);
    ctx.stroke();
  }

  drawHunter(ctx,px,py,step){
    ctx.fillStyle='#54234f';
    ctx.beginPath();
    ctx.ellipse(px,py-1,19,21,0,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#c83f88';
    ctx.beginPath();
    ctx.ellipse(px,py-3,16,18,0,0,Math.PI*2);
    ctx.fill();

    pixel(ctx,px-12,py-20,7,6,'#f6c453');
    pixel(ctx,px-3,py-23,7,9,'#f6c453');
    pixel(ctx,px+6,py-20,7,6,'#f6c453');

    pixel(ctx,px-15,py-7,30,5,'#f08ab0');
    pixel(ctx,px-11,py-4,7,8,'#fff7f0');
    pixel(ctx,px+4,py-4,7,8,'#fff7f0');
    pixel(ctx,px-9,py-1,2,4,'#252344');
    pixel(ctx,px+6,py-1,2,4,'#252344');

    pixel(ctx,px-8,py+7,16,4,'#751f5a');
    pixel(ctx,px-8,py+14,16,4,'#a52c70');
    pixel(ctx,px-3,py+18,6,5,'#61234f');

    ctx.strokeStyle='#f6c453';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(px,py+23);
    ctx.quadraticCurveTo(
      px+4+step,
      py+27,
      px+1,
      py+31
    );
    ctx.stroke();
  }

  drawGhost(ctx,px,py){
    ctx.globalAlpha=.65;
    ctx.fillStyle='#8a4f9d';
    ctx.beginPath();
    ctx.ellipse(px,py-2,18,20,0,0,Math.PI*2);
    ctx.fill();

    ctx.globalAlpha=.9;
    ctx.fillStyle='#e58ec3';
    ctx.beginPath();
    ctx.ellipse(px,py-5,14,16,0,0,Math.PI*2);
    ctx.fill();

    ctx.globalAlpha=1;

    pixel(ctx,px-5,py-12,5,6,'#ffd3e8');
    pixel(ctx,px-9,py-4,6,7,'#fff7f0');
    pixel(ctx,px+3,py-4,6,7,'#fff7f0');
    pixel(ctx,px-7,py-2,2,3,'#35264e');
    pixel(ctx,px+5,py-2,2,3,'#35264e');

    pixel(ctx,px-9,py+12,6,7,'#b565a7');
    pixel(ctx,px+3,py+12,6,7,'#b565a7');
    pixel(ctx,px-2,py+18,4,5,'#754276');

    ctx.strokeStyle='rgba(246,196,83,.8)';
    ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(px,py+23);
    ctx.lineTo(px+3,py+29);
    ctx.stroke();
  }
}

function sameDirection(a,b){
  return a && b && a[0]===b[0] && a[1]===b[1];
}