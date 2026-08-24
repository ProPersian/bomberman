// Import dependencies
import { TILES, DIRS } from './config.js';

class TileMap{
  constructor(cols,rows){
    this.cols=cols;this.rows=rows;
    // 🔧 FIX: مقداردهی اولیهٔ آرایهٔ دوبعدی
    this.grid=Array.from({length:rows},()=>Array(cols).fill(TILES.FLOOR));
  }
  get(x,y){
    if(x<0||y<0||x>=this.cols||y>=this.rows)return TILES.WALL;
    return this.grid[y][x];
  }
  set(x,y,v){
    if(x<0||y<0||x>=this.cols||y>=this.rows)return;
    this.grid[y][x]=v;
  }
  isSolid(x,y){
    const t=this.get(x,y);
    return t===TILES.WALL||t===TILES.BRICK||t===TILES.HIDDEN_EXIT;
  }
  findPath(sx,sy,tx,ty,canEnter=null){
    if(sx===tx&&sy===ty)return null;
    const key=(x,y)=>y*this.cols+x;
    const start=key(sx,sy),target=key(tx,ty);
    const visited=new Set([start]);
    const prev=new Map();
    const q=[[sx,sy]];
    while(q.length){
      const[x,y]=q.shift();
      for(const[dx,dy]of DIRS){
        const nx=x+dx,ny=y+dy;
        if(canEnter ? !canEnter(nx,ny) : this.isSolid(nx,ny))continue;
        const k=key(nx,ny);
        if(visited.has(k))continue;
        visited.add(k);prev.set(k,key(x,y));
        if(k===target){
          const path=[];let cur=k;
          while(cur!==start){
            const cy=Math.floor(cur/this.cols),cx=cur%this.cols;
            path.unshift([cx,cy]);cur=prev.get(cur);
          }
          return path;
        }
        q.push([nx,ny]);
      }
    }
    return null;
  }
}

export { TileMap };