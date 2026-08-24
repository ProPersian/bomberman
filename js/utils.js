export const U = {
  toFa:n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]),
  fmtTime:s=>{const m=Math.floor(s/60),r=Math.floor(s%60);return U.toFa(m)+':'+U.toFa(String(r).padStart(2,'0'));},
  choice:a=>a[Math.floor(Math.random()*a.length)],
  weighted:o=>{const t=Object.values(o).reduce((a,b)=>a+b,0);let r=Math.random()*t;
    for(const k in o){r-=o[k];if(r<=0)return k;}return Object.keys(o)[0];},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  dist:(x1,y1,x2,y2)=>Math.hypot(x1-x2,y1-y2),
};

export class EventBus{
  constructor(){this.l=new Map();}
  on(e,fn){if(!this.l.has(e))this.l.set(e,[]);this.l.get(e).push(fn);}
  off(e,fn){const a=this.l.get(e);if(a)this.l.set(e,a.filter(f=>f!==fn));}
  emit(e,d){(this.l.get(e)||[]).forEach(fn=>fn(d));}
}