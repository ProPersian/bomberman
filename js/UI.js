// Import dependencies
import { CONFIG } from './config.js';
import { U } from './utils.js';

class UI{
  constructor(){
    this.screens={};
    ['menu','help','shop','levelComplete','gameOver','pause','champion'].forEach(id=>{
      this.screens[id]=document.getElementById(id);
    });
    this.hud=document.getElementById('hud');
  }
  show(name){
    Object.values(this.screens).forEach(s=>{if(s)s.classList.add('hidden');});
    if(name&&this.screens[name])this.screens[name].classList.remove('hidden');
    const hideHud=['menu','help','shop','gameOver','champion'].includes(name);
    this.hud.classList.toggle('hidden',hideHud);
  }
  _set(id,txt){const el=document.getElementById(id);if(el)el.textContent=txt;}
  updateHUD(game){
    const s=game.player.stats;
    this._set('hudLives','❤️ '+U.toFa(s.lives));
    this._set('hudShield','🛡️ '+U.toFa(s.shield));
    const dashEl=document.getElementById('hudDash');
    if(dashEl){
      if(s.stamina){
        dashEl.style.display='';
        const pct=Math.round(game.player.dashCharge*100);
        dashEl.textContent='💨 '+(pct>=100?'آماده':U.toFa(pct)+'٪');
      }else dashEl.style.display='none';
    }
    this._set('hudCoins','🪙 '+U.toFa(game.coins));
    this._set('hudStars','⭐ '+U.toFa(game.stars));
    this._set('hudBombs','💣 '+U.toFa(s.bombs));
    this._set('hudFire','🔥 '+U.toFa(s.fire));
    this._set('hudSpeed','👟 '+U.toFa(s.speed));
    this._set('hudLevel','مرحله '+U.toFa(game.level));
    this._set('hudTime','⏱ '+U.fmtTime(game.timeLeft));
  }
  updateMenu(storage){
    this._set('bestScore',U.toFa(storage.data.bestScore));
    this._set('bestLevel',U.toFa(storage.data.bestLevel));
    this._set('menuCoins',U.toFa(storage.data.coins));
  }
  buildShop(storage,onBuy){
    const list=document.getElementById('shopList');
    if(!list)return;
    list.innerHTML='';
    this._set('shopCoins',U.toFa(storage.data.coins));
    for(const key in CONFIG.SHOP){
      const cfg=CONFIG.SHOP[key];
      const lvl=storage.data.upgrades[key]||0;
      const maxed=lvl>=cfg.max;
      const div=document.createElement('div');
      div.className='shop-item';
      div.innerHTML=`
        <div class="info">
          <div class="emoji">${cfg.emoji}</div>
          <div>
            <div style="font-weight:700">${cfg.name}</div>
            <div style="color:var(--muted);font-size:12px">سطح ${U.toFa(lvl)}/${U.toFa(cfg.max)} ${maxed?'(نهایت)':''}</div>
          </div>
        </div>
        <button ${maxed?'disabled':''}>🪙 ${U.toFa(cfg.cost)}</button>`;
      div.querySelector('button').addEventListener('click',()=>{
        if(onBuy(key))this.buildShop(storage,onBuy);
      });
      list.appendChild(div);
    }
  }
}

export { UI };
