// Import dependencies
import { CONFIG } from './config.js';

class Storage{
  constructor(key='bomberman_fa_v2'){this.key=key;this.data=this.load();}
  defaults(){return{coins:0,bestScore:0,bestLevel:0,upgrades:{bomb:0,fire:0,speed:0,life:0,detonator:0,ghost:0,stamina:0}};}
  load(){
    try{
      const raw=localStorage.getItem(this.key);
      if(!raw)return this.defaults();
      const d=JSON.parse(raw);
      return{...this.defaults(),...d,upgrades:{...this.defaults().upgrades,...(d.upgrades||{})}};
    }catch(e){return this.defaults();}
  }
  save(){try{localStorage.setItem(this.key,JSON.stringify(this.data));}catch(e){}}
  reset(){this.data=this.defaults();this.save();}
  resetUpgrades(){this.data.upgrades=this.defaults().upgrades;this.save();}
  addCoins(n){this.data.coins+=n;this.save();}
  spend(n){if(this.data.coins<n)return false;this.data.coins-=n;this.save();return true;}
  upgrade(key){
    const cfg=CONFIG.SHOP[key];
    if(!cfg||this.data.upgrades[key]>=cfg.max)return false;
    if(!this.spend(cfg.cost))return false;
    this.data.upgrades[key]++;this.save();return true;
  }
  recordScore(score,level){
    if(score>this.data.bestScore)this.data.bestScore=score;
    if(level>this.data.bestLevel)this.data.bestLevel=level;
    this.save();
  }
}

export { Storage };