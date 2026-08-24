import { Enemy } from './Enemy.js';
import { CONFIG, DIRS, TILES } from '../config.js';
import { U } from '../utils.js';
import { Projectile } from './Projectile.js';

function sameDir(a,b){return a[0]===b[0]&&a[1]===b[1];}
function opposite(a,b){return a[0]===-b[0]&&a[1]===-b[1];}

export class NormalEnemy extends Enemy{
  decide(dt,game){
    const opts=this.validDirections(game,false);
    if(!opts.length)return this.dir;
    const forward=opts.find(d=>sameDir(d,this.dir));
    const side=opts.filter(d=>!opposite(d,this.dir));
    if(forward&&Math.random()<.72)return forward;
    return U.choice(side.length?side:opts);
  }
}

export class WandererEnemy extends Enemy{
  constructor(x,y,type,cfg){super(x,y,type,cfg);this.shootTimer=.8+Math.random();}
  decide(dt,game){
    const opts=this.validDirections(game,false);
    if(!opts.length)return this.dir;
    const forward=opts.find(d=>sameDir(d,this.dir));
    return forward&&Math.random()<.55?forward:U.choice(opts.filter(d=>!opposite(d,this.dir)).length?opts.filter(d=>!opposite(d,this.dir)):opts);
  }
  update(dt,game){
    super.update(dt,game);
    this.shootTimer-=dt;
    if(this.shootTimer<=0){
      const dirs=[...DIRS];
      const d=U.choice(dirs);
      const px=Math.floor(this.x)+.5,py=Math.floor(this.y)+.5;
      game.projectiles.push(new Projectile(px+d[0]*.45,py+d[1]*.45,d[0],d[1]));
      this.shootTimer=1.0+Math.random()*1.5;
    }
  }
}

export class WarriorEnemy extends NormalEnemy{}

export class HunterEnemy extends Enemy{
  constructor(x,y,type,cfg){super(x,y,type,cfg);this.repath=0;}
  decide(dt,game){
    this.repath-=dt;
    const sx=Math.floor(this.x),sy=Math.floor(this.y);
    const tx=Math.floor(game.player.x),ty=Math.floor(game.player.y);
    if(this.repath<=0){
      this.repath=.22;
      const path=game.map.findPath(sx,sy,tx,ty,(x,y)=>this.canMoveTo(x+.5,y+.5,game,{passBricks:false}));
      if(path&&path.length){
        const[nx,ny]=path[0];return [Math.sign(nx-sx),Math.sign(ny-sy)];
      }
    }
    const opts=this.validDirections(game,false);return opts.length?U.choice(opts):this.dir;
  }
}

export class GhostEnemy extends Enemy{
  constructor(x,y,type,cfg){super(x,y,type,cfg);this.passBombs=true;
  this.passBricks=true;}
  // Ghost walks through bricks and hidden exits; only walls block it.
  // The parent canMoveTo + collidesAt handles this via passBricks=true,
  // so no override is needed.


  decide(dt,game){
    const sx=Math.floor(this.x),sy=Math.floor(this.y),tx=Math.floor(game.player.x),ty=Math.floor(game.player.y);
    const path=game.map.findPath(sx,sy,tx,ty,(x,y)=>game.map.get(x,y)!==1);
    if(path&&path.length){const[nx,ny]=path[0];return [Math.sign(nx-sx),Math.sign(ny-sy)];}
    const opts=this.validDirections(game,true);return opts.length?U.choice(opts):this.dir;
  }
}

export class EnemyFactory{
  static create(x,y,type){
    const normalized=type==='baloon'?'normal':type==='runner'?'wanderer':type;
    const cfg=CONFIG.ENEMIES[normalized];
    switch(normalized){
      case 'wanderer':return new WandererEnemy(x,y,normalized,cfg);
      case 'warrior':return new WarriorEnemy(x,y,normalized,cfg);
      case 'hunter':return new HunterEnemy(x,y,normalized,cfg);
      case 'ghost':return new GhostEnemy(x,y,normalized,cfg);
      default:return new NormalEnemy(x,y,'normal',cfg);
    }
  }
}
