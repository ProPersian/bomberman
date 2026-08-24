import { Entity } from './Entity.js';
import { CONFIG, TILES } from '../config.js';

export class Projectile extends Entity{
  constructor(x,y,dx,dy,speed=4.2){
    super(x,y);this.dx=dx;this.dy=dy;this.speed=speed;this.life=3;
  }
  update(dt,game){
    this.life-=dt;if(this.life<=0){this.alive=false;return;}
    const nx=this.x+this.dx*this.speed*dt,ny=this.y+this.dy*this.speed*dt;
    const t=game.map.get(Math.floor(nx),Math.floor(ny));
    if(t===TILES.WALL||t===TILES.BRICK||t===TILES.HIDDEN_EXIT){this.alive=false;return;}
    this.x=nx;this.y=ny;
    if(game.player.alive&&Math.hypot(this.x-game.player.x,this.y-game.player.y)<.48){
      game.player.hit(game,'hurt');this.alive=false;
    }
  }
  draw(ctx){
    const px=this.x*CONFIG.TILE,py=this.y*CONFIG.TILE;
    ctx.save();
    ctx.fillStyle='#f6c453';
    ctx.beginPath();ctx.arc(px,py,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff4a8';
    ctx.beginPath();ctx.arc(px-this.dx*3,py-this.dy*3,2.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}
