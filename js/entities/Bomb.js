/* ---------- Bomb ---------- */
import { Entity } from "./Entity.js";
import { CONFIG, TILES, DIRS } from '../config.js';
import { Explosion } from "./Explosion.js";

export class Bomb extends Entity {
  constructor(x,y,fire){
    super(x+.5,y+.5);
    this.tx=x;this.ty=y;
    this.fuse=CONFIG.BOMB_FUSE;
    this.fire=fire;
    this.solid=false;
    this.owner=null;
    this.ownerEscaped=false;
  }
  update(dt,game){
    // بمبِ خود بازیکن تا وقتی کاملاً از خانهٔ بمب خارج نشده، عبورپذیر می‌ماند.
    // این جلوی قفل شدن بازیکن درست بعد از کاشت بمب را می‌گیرد.
    if(!this.ownerEscaped){
      const p=game.player;
      const margin=0.4;
      if(p && (p.x < this.tx-margin || p.x > this.tx+1+margin ||
               p.y < this.ty-margin || p.y > this.ty+1+margin)){
        this.ownerEscaped=true;
        this.solid=true;
      }
    }
    if(this.ownerEscaped)this.solid=true;
    // با چاشنی ریموت، بمب‌ها خودکار منفجر نمی‌شوند.
    if(!game.player.stats.detonator)this.fuse-=dt;
    if(this.fuse<=0)this.explode(game);
  }
  explode(game){
    if(!this.alive)return;
    this.alive=false;
    if(this.owner)this.owner.activeBombs--;
    game.audio.explosion();

    const cells=[[this.tx,this.ty]];
    for(const[dx,dy]of DIRS){
      for(let i=1;i<=this.fire;i++){
        const x=this.tx+dx*i,y=this.ty+dy*i;
        const t=game.map.get(x,y);
        if(t===TILES.WALL)break;
        if(t===TILES.BRICK||t===TILES.HIDDEN_EXIT){
          // آجر خودِ خانه را می‌سوزاند، اما آتش نباید از آن عبور کند.
          // انفجارِ این خانه فقط بصری است؛ دشمنِ پشت آجر آسیب نمی‌بیند.
          game.breakBrick(x,y);
          // روحی که داخل آجر ایستاده، همراه آجر آسیب می‌بیند.
          game.explosions.push(new Explosion(x,y,false,'burn',true));
          break;
        }
        cells.push([x,y]);
        // انفجار زنجیره‌ای
        const other=game.bombs.find(b=>b.alive&&b.tx===x&&b.ty===y);
        if(other)other.fuse=0;
      }
    }
    for(const[x,y]of cells)game.explosions.push(new Explosion(x,y));
  }
  draw(ctx){
    const px=this.x*CONFIG.TILE,py=this.y*CONFIG.TILE;
    const pulse=1+Math.sin((CONFIG.BOMB_FUSE-this.fuse)*8)*.06;
    const radius=14*pulse;

    ctx.save();
    ctx.imageSmoothingEnabled=false;

    // Classic round Bomberman bomb with a small grounded shadow.
    ctx.fillStyle='rgba(7,10,28,.45)';
    ctx.beginPath();
    ctx.ellipse(px,py+18,16,5,0,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#0b0d1d';
    ctx.beginPath();
    ctx.arc(px,py+2,radius,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#252543';
    ctx.beginPath();
    ctx.arc(px,py+1,radius-3,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#4a496e';
    ctx.beginPath();
    ctx.arc(px-4,py-4,radius-7,Math.PI*1.08,Math.PI*1.72);
    ctx.strokeStyle='#77749a';
    ctx.lineWidth=3;
    ctx.stroke();

    // Bottom rim gives the round body the old arcade silhouette.
    ctx.fillStyle='#111329';
    ctx.fillRect(px-9,py+radius-2,18,4);
    ctx.fillStyle='#5e4660';
    ctx.fillRect(px-5,py+radius+2,10,3);

    // Curved fuse and a blinking spark near detonation.
    ctx.strokeStyle='#c7934c';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(px+5,py-radius+3);
    ctx.quadraticCurveTo(px+12,py-radius-5,px+6,py-radius-10);
    ctx.stroke();
    ctx.fillStyle=this.fuse<.8?'#ff554d':'#f6c453';
    ctx.beginPath();
    ctx.arc(px+6,py-radius-11,4,0,Math.PI*2);
    ctx.fill();
    if(this.fuse<.8){
      ctx.fillStyle='#fff4a8';
      ctx.beginPath();
      ctx.arc(px+6,py-radius-11,2,0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }
}
