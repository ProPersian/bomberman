/* ---------- Player ---------- */
import { Entity } from './Entity.js';
import { CONFIG, TILES } from '../config.js';
import { Bomb } from './Bomb.js';
import { moveGrid, collidesAt } from '../Movement.js';

// 6x6 sprite sheet:
// row 0 = down, row 1 = right, row 2 = left, row 3 = up,
// row 4 = hurt, row 5 = defeat. Each frame is 64x64.
const PLAYER_SPRITE = new Image();
PLAYER_SPRITE.src = new URL('../../assets/player.png', import.meta.url).href;

export class Player extends Entity{
  constructor(x,y,stats){
    super(x,y);
    this.spawn={x,y};
    this.stats=stats;
    this.activeBombs=0;
    this.invuln=0;
    this.facing='down';
    this.animTime=0;
    // دش (نفس): شارژ از صفر تا صد، زمانِ شارژ = dashTime ثانیه
    this.dashCharge=1;
    this.dashTimer=0;
    this.dashDirX=1;this.dashDirY=0;
  }
  update(dt,game){
    // شارژِ دش؛ فقط وقتی توانایی دش فعال باشد
    if(this.stats.stamina){
      this.dashCharge=Math.min(1,this.dashCharge+dt/this.stats.dashTime);
      if(game.pendingDash){
        game.pendingDash=false;
        if(this.dashCharge>=1){
          const v=game.input.getVector();
          let dx=v.x,dy=v.y;
          if(!dx&&!dy){
            dx={right:1,left:-1}[this.facing]||0;
            dy={down:1,up:-1}[this.facing]||0;
            if(!dx&&!dy)dx=1;
          }
          this.dashTimer=.16;
          this.dashDirX=dx;this.dashDirY=dy;
          this.dashCharge=0;
          this.invuln=Math.max(this.invuln,.4);
          game.audio.dash();
        }
      }
    }else if(game.pendingDash)game.pendingDash=false;

    const v=game.input.getVector();
    const sp=CONFIG.PLAYER_SPEED*(0.8+this.stats.speed*0.25);
    const moving=v.x!==0||v.y!==0;

    if(this.dashTimer>0){
      // حرکت سریع در جهت دش؛ عبور از بمب‌ها ولی نه از دیوار/آجر
      this.dashTimer-=dt;
      const dsp=CONFIG.PLAYER_SPEED*5;
      const moved=moveGrid(this,this.dashDirX,this.dashDirY,dsp*dt,game,{radius:.34,passBricks:this.stats.ghost,passBombs:true});
      if(moved)this.animTime+=dt;
    }else if(moving){
      if(v.x>0)this.facing='right';
      else if(v.x<0)this.facing='left';
      else if(v.y>0)this.facing='down';
      else if(v.y<0)this.facing='up';

      const moved=moveGrid(this,v.x,v.y,sp*dt,game,{radius:.34,passBricks:this.stats.ghost,passBombs:false});
      if(moved)this.animTime+=dt; else this.animTime=0;
      if(moved)game.audio.step();
    }else this.animTime=0;

    if(this.invuln>0)this.invuln-=dt;

    if(game.pendingBomb){
      game.pendingBomb=false;
      this.tryPlaceBomb(game);
    }
  }

  collides(x,y,game){
    return collidesAt(game,x,y,.34,{passBricks:this.stats.ghost,passBombs:false});
  }

  tryPlaceBomb(game){
    const tx=Math.floor(this.x),ty=Math.floor(this.y);
    if(this.activeBombs>=this.stats.bombs)return;
    if(game.bombs.some(b=>b.tx===tx&&b.ty===ty))return;
    // در حالت روح هم نباید روی آجر یا خروجیِ مخفی بمب کاشت؛
    // انفجارِ خانهٔ خودِ بمب، خروجی را آشکار نمی‌کند.
    const tile=game.map.get(tx,ty);
    if(tile===TILES.BRICK||tile===TILES.HIDDEN_EXIT)return;
    const bomb=new Bomb(tx,ty,this.stats.fire);
    bomb.owner=this;
    game.bombs.push(bomb);
    this.activeBombs++;
    game.audio.bomb();
  }
  hit(game,cause='hurt'){
    if(!this.alive||this.invuln>0)return;
    if(this.stats.shield>0){this.stats.shield--;this.invuln=1.2;game.audio.pickup();return;}
    this.stats.lives--;
    this.invuln=1.5;
    if(cause==='burn')game.audio.burn();
    else game.audio.hurt();
    if(this.stats.lives<=0){this.alive=false;}
    else{
      // به‌جای پرش ناگهانی به نقطهٔ ظهور، بازیکن سر جای خودش می‌ماند؛
      // آسیب‌ناپذیریِ تازه (invuln) جلوی ضربهٔ بعدی را می‌گیرد.
      this.facing='down';this.animTime=0;
    }
  }
  draw(ctx){
    const px=this.x*CONFIG.TILE,py=this.y*CONFIG.TILE;
    const frame=Math.floor(this.animTime*8)%6;
    const row={down:0,right:1,left:2,up:3}[this.facing]??0;
    const size=56;

    ctx.save();
    // در حالت آسیب‌ناپذیری به‌جای چشمک‌زدنِ خام (ناپدید شدن کامل)،
    // شفافیت به‌نرمی پالس می‌شود تا کاراکتر همیشه دیده شود.
    if(this.invuln>0)ctx.globalAlpha=.5+.3*Math.sin(this.invuln*10);
    if(PLAYER_SPRITE.complete&&PLAYER_SPRITE.naturalWidth>0){
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(PLAYER_SPRITE,frame*64,row*64,64,64,px-size/2,py-size/2,size,size);
    }else{
      // Fallback while the image is loading.
      ctx.font='36px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('🕹️',px,py);
    }
    ctx.restore();

    if(this.stats.shield>0){
      ctx.strokeStyle='rgba(100,200,255,.7)';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(px,py,26,0,Math.PI*2);ctx.stroke();
    }
  }
}
