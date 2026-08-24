// Import dependencies
import { CONFIG, TILES } from './config.js';
import { EventBus, U } from './utils.js';
import { Storage } from './Storage.js';
import { AudioSystem } from './Audio.js';
import { Input } from './Input.js';
import { TileMap } from './TileMap.js';
import { LevelFactory } from './LevelFactory.js';
import { Player } from './entities/Player.js';
import { EnemyFactory } from './entities/Enemies.js';
import { Bomb } from './entities/Bomb.js';
import { Explosion } from './entities/Explosion.js';
import { Pickup } from './entities/Pickup.js';
import { Renderer } from './Renderer.js';
import { UI } from './UI.js';

class Game{
  constructor(){
    this.bus=new EventBus();
    this.storage=new Storage();
    this.input=new Input(this.bus);
    this.audio=new AudioSystem(this.bus);
    this.ui=new UI();
    this.renderer=new Renderer(document.getElementById('game'));

    this.state='menu';
    this.level=1;this.score=0;this.stars=3;this.coins=0;
    this.timeLeft=CONFIG.LEVEL_TIME;
    this.map=null;this.player=null;
    this.enemies=[];this.bombs=[];this.explosions=[];this.projectiles=[];
    this.pickups=[];this.levelPickups=[];
    this.exit=null;this.exitRevealed=false;
    this.pendingBomb=false;this.remoteTrigger=false;this.pendingDash=false;
    this.shopReturn='menu';
    this.popups=[];

    this.bindBus();
    this.bindUI();
    this.ui.updateMenu(this.storage);
    this.ui.show('menu');

    this.lastTime=performance.now();
    this._loop=this.loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  bindBus(){
    this.bus.on('togglePause',()=>{
      if(this.state==='play')this.pause();
      else if(this.state==='paused')this.resume();
    });
    this.bus.on('placeBomb',()=>{if(this.state==='play')this.pendingBomb=true;});
    this.bus.on('remoteDetonate',()=>{if(this.state==='play')this.remoteTrigger=true;});
    this.bus.on('dash',()=>{if(this.state==='play')this.pendingDash=true;});
    this.bus.on('muteChanged',muted=>{
      const el=document.getElementById('btnMute');
      if(el)el.textContent=muted?'🔇':'🔊';
    });
  }

  bindUI(){
    const on=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener('click',fn);};
    on('btnStart',()=>this.startRun(1));
    on('btnHelp',()=>this.ui.show('help'));
    on('btnHelpClose',()=>this.ui.show('menu'));
    on('btnShop',()=>{this.shopReturn='menu';this.ui.buildShop(this.storage,k=>this.buyUpgrade(k));this.ui.show('shop');});
    on('btnShopClose',()=>{this.ui.updateMenu(this.storage);this.ui.show(this.shopReturn);});
    on('btnReset',()=>{
      if(confirm('همهٔ سیوها پاک شود؟')){this.storage.reset();this.ui.updateMenu(this.storage);}
    });
    on('btnResume',()=>this.resume());
    on('btnRestart',()=>this.startRun(this.level));
    on('btnQuit',()=>{this.state='menu';this.ui.updateMenu(this.storage);this.ui.show('menu');});
    on('btnNextLevel',()=>this.startRun(this.level+1,true));
    on('btnEndless',()=>this.startRun(this.level+1,true));
    on('btnChampMenu',()=>{this.state='menu';this.ui.updateMenu(this.storage);this.ui.show('menu');});
    on('btnToShop',()=>{this.shopReturn='levelComplete';this.ui.buildShop(this.storage,k=>this.buyUpgrade(k));this.ui.show('shop');});
    on('btnToMenu',()=>{this.state='menu';this.ui.updateMenu(this.storage);this.ui.show('menu');});
    on('btnRetry',()=>this.startRun(1,false));
    on('btnGoMenu',()=>{this.state='menu';this.ui.updateMenu(this.storage);this.ui.show('menu');});
    on('btnMute',()=>this.bus.emit('toggleMute'));
    on('btnPauseHud',()=>this.bus.emit('togglePause'));
  }

  startRun(level=1,keepScore=false){
    this.level=level;
    if(!keepScore){this.score=0;this.stars=3;this.coins=0;}
    this.loadLevel(level);
    this.state='play';
    this.ui.show(null);
  }

  loadLevel(level){
    const data=LevelFactory.generate(level);
    this.map=data.map;
    this.exit=data.exit;
    this.exitRevealed=false;
    this.levelName=data.name||'';
    this.levelPickups=data.pickups;
    this.pickups=[];
    this.bombs=[];
    this.explosions=[];
    this.projectiles=[];
    this.enemies=data.enemies.map(e=>EnemyFactory.create(e.x+.5,e.y+.5,e.type));
    this.timeLeft=data.time;
    this.remoteTrigger=false;
    this.pendingBomb=false;
    this.pendingDash=false;

    const up=this.storage.data.upgrades;
    const stats={
      bombs:CONFIG.BASE_BOMBS+up.bomb,
      fire:CONFIG.BASE_FIRE+up.fire,
      speed:CONFIG.BASE_SPEED+up.speed,
      lives:3+up.life,
      shield:0,
      detonator:up.detonator>0,
      ghost:up.ghost>0,
      stamina:true,
      dashTime:up.stamina>0?5:10,
    };
    this.player=new Player(data.player?.x??1.5,data.player?.y??1.5,stats);
  }

  pause(){if(this.state==='play'){this.state='paused';this.ui.show('pause');}}
  resume(){if(this.state==='paused'){this.state='play';this.ui.show(null);}}

  addScore(n){this.score+=n;}
  addCoins(n){this.coins+=n;this.storage.addCoins(n);}
  addStars(n){this.stars+=n;}
  buyUpgrade(key){
    const bought=this.storage.upgrade(key);
    if(bought)this.audio.coin();
    return bought;
  }
  addPopup(x,y,txt,color='#ffb703'){this.popups.push({x,y,txt,color,life:1.0});}

  breakBrick(x,y){
    const t=this.map.get(x,y);
    if(t===TILES.HIDDEN_EXIT){
      this.map.set(x,y,TILES.EXIT);
      this.exitRevealed=true;
      const p=this.levelPickups.find(p=>p.x===x&&p.y===y);
      if(p){
        this.pickups.push(new Pickup(p.x,p.y,p.type));
        this.levelPickups=this.levelPickups.filter(q=>q!==p);
      }
      this.audio.pickup();
    }else if(t===TILES.BRICK){
      this.map.set(x,y,TILES.FLOOR);
      const p=this.levelPickups.find(p=>p.x===x&&p.y===y);
      if(p){
        this.pickups.push(new Pickup(p.x,p.y,p.type));
        this.levelPickups=this.levelPickups.filter(q=>q!==p);
      }else if(Math.random()<.4){
        // آیتم تصادفی از آجر بیفتد (سکه، بمب، شعاع و...)
        const type=U.weighted(Object.fromEntries(
          Object.entries(CONFIG.PICKUPS).map(([k,v])=>[k,v.weight])
        ));
        this.pickups.push(new Pickup(x,y,type));
      }
      this.addScore(10);
    }
  }

  onPlayerDeath(){
    if(this.state!=='play')return;
    this.storage.recordScore(this.score,this.level);
    if(this.stars>1){
      this.stars--;
      // A continue grants exactly three fresh lives and removes every shop ability.
      this.storage.resetUpgrades();
      this.loadLevel(this.level);
      this.state='play';
      this.addPopup(this.player.x,this.player.y,`⭐ ${U.toFa(this.stars)}  ادامه!`,'#f6c453');
      this.ui.updateHUD(this);
      return;
    }
    this.stars=0;
    this.level=1;
    this.state='gameOver';
    this.ui.show('gameOver');
  }

  onLevelComplete(){
    this.storage.recordScore(this.score,this.level);
    this.state='levelComplete';
    document.getElementById('lcScore').textContent=U.toFa(this.score);
    document.getElementById('lcCoins').textContent=U.toFa(this.coins);
    this.audio.win();
    this.ui.show(this.level===20?'champion':'levelComplete');
  }

  loop(now){
    const dt=Math.min(.05,(now-this.lastTime)/1000);
    this.lastTime=now;
    if(this.state==='play')this.update(dt);
    this.render();
    requestAnimationFrame(this._loop);
  }

  update(dt){
    this.timeLeft-=dt;
    if(this.timeLeft<=0){this.player.alive=false;this.player.stats.lives=0;this.onPlayerDeath();return;}

    // چاشنی ریموت: همهٔ بمب‌ها منفجر می‌شوند
    if(this.remoteTrigger){
      this.bombs.forEach(b=>{if(b.alive)b.fuse=0;});
      this.remoteTrigger=false;
    }

    this.player.update(dt,this);
    for(const e of this.enemies)if(e.alive)e.update(dt,this);
    for(const b of this.bombs)if(b.alive)b.update(dt,this);
    for(const x of this.explosions)if(x.alive)x.update(dt,this);
    for(const p of this.projectiles)if(p.alive)p.update(dt,this);
    for(const p of this.pickups)if(p.alive)p.update(dt,this);

    // پاکسازی
    this.enemies=this.enemies.filter(e=>e.alive);
    this.bombs=this.bombs.filter(b=>b.alive);
    this.explosions=this.explosions.filter(e=>e.alive);
    this.projectiles=this.projectiles.filter(p=>p.alive);
    this.pickups=this.pickups.filter(p=>p.alive);

    // به‌روزرسانی پاپ‌آپ‌ها
    for(const p of this.popups){p.life-=dt;p.y-=dt*1.5;}
    this.popups=this.popups.filter(p=>p.life>0);

    if(!this.player.alive){this.onPlayerDeath();return;}

    // شرط پیروزی: رسیدن به درِ آشکار شده
    if(this.exitRevealed){
      const[ex,ey]=this.exit;
      if(Math.floor(this.player.x)===ex&&Math.floor(this.player.y)===ey){
        this.onLevelComplete();
        return;
      }
    }
    this.ui.updateHUD(this);
  }

  render(){
    const r=this.renderer;
    r.clear();
    if(this.map){
      r.drawMap(this.map);
      r.drawEntities(this.enemies);
      // بمب روی بازیکن قرار می‌گیرد و تا زمان خروج، عبورپذیر است؛
      // بعد از بازیکن رسمش می‌کنیم تا هنگام کاشت ناپدید نشود.
      r.drawEntities(this.bombs);
      if(this.player)this.player.draw(r.ctx);
      r.drawEntities(this.projectiles);
      r.drawEntities(this.explosions);
      // آیتم‌ها آخر از همه رسم می‌شوند تا زیر هیچ لایه‌ای قرار نگیرند
      r.drawEntities(this.pickups);
      // رسم پاپ‌آپ‌های امتیاز
      const ctx=r.ctx;
      for(const p of this.popups){
        ctx.globalAlpha=Math.min(1,p.life*2);
        ctx.font='bold 16px Vazirmatn,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillStyle=p.color;
        ctx.fillText(p.txt,p.x*CONFIG.TILE,p.y*CONFIG.TILE);
        ctx.globalAlpha=1;
      }
    }
  }
}

export { Game };

