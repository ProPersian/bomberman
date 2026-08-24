// Import dependencies
import { CONFIG, TILES } from './config.js';

class Renderer{
  constructor(canvas){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.canvas.width=CONFIG.COLS*CONFIG.TILE;
    this.canvas.height=CONFIG.ROWS*CONFIG.TILE;
    this.resize();
    window.addEventListener('resize',()=>this.resize());
  }
  resize(){
    const maxW=Math.min(window.innerWidth-20,900);
    const maxH=window.innerHeight-20;
    const aspect=CONFIG.COLS/CONFIG.ROWS;
    let w=maxW,h=w/aspect;
    if(h>maxH){h=maxH;w=h*aspect;}
    this.canvas.style.width=w+'px';
    this.canvas.style.height=h+'px';
  }
  clear(){
    this.ctx.fillStyle='#0a0d1f';
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
  }
  drawFloor(ctx,px,py,x,y){
    ctx.fillStyle=((x+y)%2)?'#29345a':'#243052';
    ctx.fillRect(px,py,CONFIG.TILE,CONFIG.TILE);
    ctx.fillStyle='rgba(255,255,255,.035)';
    ctx.fillRect(px+5,py+5,CONFIG.TILE-10,2);
    ctx.fillStyle='rgba(7,10,28,.18)';
    ctx.fillRect(px+5,py+CONFIG.TILE-6,CONFIG.TILE-10,2);
  }
  drawWall(ctx,px,py){
    ctx.fillStyle='#282039';
    ctx.fillRect(px,py,CONFIG.TILE,CONFIG.TILE);
    ctx.fillStyle='#3d3154';
    ctx.fillRect(px+3,py+3,CONFIG.TILE-6,CONFIG.TILE-6);
    ctx.fillStyle='#594361';
    ctx.fillRect(px+6,py+6,CONFIG.TILE-12,5);
    ctx.fillStyle='#221a31';
    ctx.fillRect(px+6,py+CONFIG.TILE-10,CONFIG.TILE-12,5);
    ctx.fillStyle='rgba(255,255,255,.07)';
    ctx.fillRect(px+8,py+14,CONFIG.TILE-16,2);
  }
  drawBrick(ctx,px,py,x,y){
    const variant=(x*17+y*31)%3;
    ctx.fillStyle='#9e4d37';
    ctx.fillRect(px,py,CONFIG.TILE,CONFIG.TILE);
    ctx.fillStyle='#c96b43';
    ctx.fillRect(px+3,py+3,CONFIG.TILE-6,CONFIG.TILE-7);
    ctx.fillStyle='#e18a51';
    ctx.fillRect(px+5,py+5,CONFIG.TILE-10,4);
    ctx.fillStyle='#71382f';
    ctx.fillRect(px+3,py+CONFIG.TILE-7,CONFIG.TILE-6,4);
    ctx.fillStyle='#7e3d31';
    ctx.fillRect(px+1,py+CONFIG.TILE*.48,CONFIG.TILE-2,3);
    const seamX=variant===0?px+CONFIG.TILE*.32:variant===1?px+CONFIG.TILE*.68:px+CONFIG.TILE*.5;
    ctx.fillRect(seamX,py+CONFIG.TILE*.48+3,3,CONFIG.TILE*.45);
    ctx.fillStyle='rgba(255,220,150,.3)';
    ctx.fillRect(px+8+(variant*7),py+17,5,3);
    ctx.fillStyle='rgba(70,30,35,.35)';
    ctx.fillRect(px+CONFIG.TILE-13-(variant*4),py+28,6,3);
  }
  drawExit(ctx,px,py){
    this.drawFloor(ctx,px,py,px/CONFIG.TILE,py/CONFIG.TILE);
    ctx.fillStyle='rgba(20,240,170,.18)';
    ctx.fillRect(px+6,py+8,CONFIG.TILE-12,CONFIG.TILE-5);
    ctx.fillStyle='#17172d';
    ctx.fillRect(px+9,py+17,CONFIG.TILE-18,CONFIG.TILE-17);
    ctx.beginPath();
    ctx.arc(px+CONFIG.TILE/2,py+17,CONFIG.TILE/2-9,Math.PI,0);
    ctx.lineTo(px+CONFIG.TILE-9,py+CONFIG.TILE-8);
    ctx.lineTo(px+9,py+CONFIG.TILE-8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#6e4738';
    ctx.fillRect(px+6,py+16,5,CONFIG.TILE-21);
    ctx.fillRect(px+CONFIG.TILE-11,py+16,5,CONFIG.TILE-21);
    ctx.fillStyle='#b8794f';
    ctx.fillRect(px+10,py+12,CONFIG.TILE-20,5);
    ctx.fillStyle='#3a2740';
    ctx.fillRect(px+15,py+22,CONFIG.TILE-30,CONFIG.TILE-30);
    ctx.fillStyle='#35e0a5';
    ctx.fillRect(px+CONFIG.TILE/2-4,py+28,8,3);
    ctx.fillStyle='#f6c453';
    ctx.fillRect(px+CONFIG.TILE-17,py+34,4,4);
    ctx.fillStyle='rgba(255,255,255,.18)';
    ctx.fillRect(px+14,py+20,3,18);
  }
  drawMap(map){
    const ctx=this.ctx,TILE=CONFIG.TILE;
    for(let y=0;y<map.rows;y++){
      for(let x=0;x<map.cols;x++){
        const t=map.get(x,y);
        const px=x*TILE,py=y*TILE;
        switch(t){
          case TILES.FLOOR:
            this.drawFloor(ctx,px,py,x,y);
            break;
          case TILES.WALL:
            this.drawWall(ctx,px,py);
            break;
          case TILES.BRICK:
          case TILES.HIDDEN_EXIT:
            this.drawBrick(ctx,px,py,x,y);
            break;
          case TILES.EXIT:
            this.drawExit(ctx,px,py);
            break;
        }
      }
    }
  }
  drawEntities(list){
    if(!list)return;
    for(const e of list)if(e.alive)e.draw(this.ctx);
  }
}

export { Renderer };