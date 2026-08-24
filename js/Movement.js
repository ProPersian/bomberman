import { TILES } from './config.js';

export function collidesAt(game,x,y,r=.30,{passBricks=false,passBombs=false}={}){
  const corners=[[x-r,y-r],[x+r,y-r],[x-r,y+r],[x+r,y+r]];
  for(const[cx,cy] of corners){
    const t=game.map.get(Math.floor(cx),Math.floor(cy));
    if(t===TILES.WALL)return true;
    if(!passBricks&&(t===TILES.BRICK||t===TILES.HIDDEN_EXIT))return true;
    if(!passBombs&&game.bombs.some(b=>b.alive&&b.solid&&Math.floor(cx)===b.tx&&Math.floor(cy)===b.ty))return true;
  }
  return false;
}

export function nearestCenter(v){return Math.floor(v)+.5;}

// Moves one grid-aligned character smoothly while allowing early turns.
// The perpendicular coordinate is gently snapped toward the lane center when
// a requested turn is possible, so the player/enemy does not need pixel-perfect alignment.
export function moveGrid(entity,dx,dy,amount,game,opts={}){
  const r=opts.radius??.30;
  const passBricks=!!opts.passBricks;
  const passBombs=!!opts.passBombs;
  let moved=false;

  const attempt=(axis,dir)=>{
    if(!dir)return false;
    const nx=axis==='x'?entity.x+dir*amount:entity.x;
    const ny=axis==='y'?entity.y+dir*amount:entity.y;
    if(!collidesAt(game,nx,ny,r,{passBricks,passBombs})){
      if(axis==='x')entity.x=nx; else entity.y=ny;
      return true;
    }
    const perp=axis==='x'?'y':'x';
    const target=nearestCenter(entity[perp]);
    const aligned=axis==='x'?collidesAt(game,nx,target,r,{passBricks,passBombs}):collidesAt(game,target,ny,r,{passBricks,passBombs});
    if(!aligned){
      entity[perp]=target;
      if(axis==='x')entity.x=nx; else entity.y=ny;
      return true;
    }
    return false;
  };

  // Prefer the dominant input axis. This avoids diagonal corner jitter while
  // still allowing a diagonal input when both lanes are open.
  if(Math.abs(dx)>=Math.abs(dy)){
    if(attempt('x',dx))moved=true;
    if(attempt('y',dy))moved=true;
  }else{
    if(attempt('y',dy))moved=true;
    if(attempt('x',dx))moved=true;
  }
  return moved;
}
