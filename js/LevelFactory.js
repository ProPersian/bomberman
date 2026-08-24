import { CONFIG, TILES } from './config.js';
import { TileMap } from './TileMap.js';
import { LEVELS } from './Levels.js';

const ENEMY_SYMBOLS={N:'normal',W:'wanderer',R:'warrior',H:'hunter',G:'ghost'};
const PICKUP_SYMBOLS={c:'coin',b:'bomb',f:'fire',s:'speed',l:'life',d:'shield','*':'star'};

class LevelFactory{
  static generate(level){
    if(level>LEVELS.length)return this.generateEndless(level);
    const source=LEVELS[level-1];
    const rows=source.map;
    const map=new TileMap(CONFIG.COLS,CONFIG.ROWS);
    const enemies=[];const pickups=[];let player=null;let exit=null;
    for(let y=0;y<CONFIG.ROWS;y++){
      const row=rows[y];
      for(let x=0;x<CONFIG.COLS;x++){
        const ch=row[x];
        let tile=TILES.FLOOR;
        if(ch==='#')tile=TILES.WALL;
        else if(ch==='B')tile=TILES.BRICK;
        else if(ch==='X'){tile=TILES.HIDDEN_EXIT;exit=[x,y];}
        map.set(x,y,tile);
        if(ch==='P')player={x:x+.5,y:y+.5};
        if(ENEMY_SYMBOLS[ch])enemies.push({x,y,type:ENEMY_SYMBOLS[ch]});
        if(PICKUP_SYMBOLS[ch])pickups.push({x,y,type:PICKUP_SYMBOLS[ch]});
      }
    }
    if(!player)player={x:1.5,y:1.5};
    if(!exit)exit=[CONFIG.COLS-2,CONFIG.ROWS-2];
    return {map,pickups,enemies,player,exit,time:CONFIG.LEVEL_TIME,name:source.name};
  }
  static generateEndless(level){
    const map=new TileMap(CONFIG.COLS,CONFIG.ROWS);
    for(let y=0;y<CONFIG.ROWS;y++)for(let x=0;x<CONFIG.COLS;x++){
      if(x===0||y===0||x===CONFIG.COLS-1||y===CONFIG.ROWS-1||(x%2===0&&y%2===0))map.set(x,y,TILES.WALL);
      else map.set(x,y,TILES.FLOOR);
    }
    const safe=[[1,1],[2,1],[1,2]];safe.forEach(([x,y])=>map.set(x,y,TILES.FLOOR));
    const pickups=[];const density=Math.min(.75,.58+(level-CONFIG.ENDLESS_START_LEVEL)*.01);
    for(let y=1;y<CONFIG.ROWS-1;y++)for(let x=1;x<CONFIG.COLS-1;x++){
      if(map.get(x,y)!==TILES.FLOOR||safe.some(s=>s[0]===x&&s[1]===y))continue;
      if(Math.random()<density){map.set(x,y,TILES.BRICK);}
    }
    const candidates=[];for(let y=1;y<CONFIG.ROWS-1;y++)for(let x=1;x<CONFIG.COLS-1;x++)if(map.get(x,y)===TILES.BRICK&&(x>3||y>3))candidates.push([x,y]);
    const exit=candidates[Math.floor(Math.random()*candidates.length)]||[CONFIG.COLS-2,CONFIG.ROWS-2];map.set(exit[0],exit[1],TILES.HIDDEN_EXIT);
    const types=['normal'];if(level>=22)types.push('wanderer');if(level>=24)types.push('hunter');if(level>=25)types.push('warrior');if(level>=27)types.push('ghost');
    const enemies=[];const count=Math.min(10,3+Math.floor(level/3));
    for(let i=0;i<count;i++){let x,y,tries=0;do{x=1+Math.floor(Math.random()*(CONFIG.COLS-2));y=1+Math.floor(Math.random()*(CONFIG.ROWS-2));tries++;}while((map.get(x,y)!==TILES.FLOOR||(x<4&&y<4))&&tries<200);if(tries<200)enemies.push({x,y,type:types[Math.floor(Math.random()*types.length)]});}
    return {map,pickups,enemies,player:{x:1.5,y:1.5},exit,time:CONFIG.LEVEL_TIME,name:`بی‌پایان ${level}`};
  }
}
export { LevelFactory };
