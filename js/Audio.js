class AudioSystem{
  constructor(bus){
    this.bus=bus;this.muted=false;this.ctx=null;
    this.nextStepAt=0;this.stepIndex=0;
    bus.on('toggleMute',()=>{this.muted=!this.muted;bus.emit('muteChanged',this.muted);});
    const init=()=>{
      if(!this.ctx){
        try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();}
        catch(e){}
      }
      if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});
    };
    document.addEventListener('click',init,{once:true});
    document.addEventListener('touchstart',init,{once:true});
  }
  beep(freq=440,dur=.1,type='square',vol=.1,when=0){
    if(this.muted||!this.ctx)return;
    try{
      const start=this.ctx.currentTime+when;
      const o=this.ctx.createOscillator(),g=this.ctx.createGain();
      o.type=type;o.frequency.value=freq;
      g.gain.setValueAtTime(vol,start);
      g.gain.exponentialRampToValueAtTime(.0001,start+dur);
      o.connect(g);g.connect(this.ctx.destination);
      o.start(start);o.stop(start+dur);
    }catch(e){}
  }
  sweep(from,to,dur,type='sawtooth',vol=.1,when=0){
    if(this.muted||!this.ctx)return;
    try{
      const start=this.ctx.currentTime+when;
      const o=this.ctx.createOscillator(),g=this.ctx.createGain();
      o.type=type;
      o.frequency.setValueAtTime(from,start);
      o.frequency.exponentialRampToValueAtTime(Math.max(1,to),start+dur);
      g.gain.setValueAtTime(vol,start);
      g.gain.exponentialRampToValueAtTime(.0001,start+dur);
      o.connect(g);g.connect(this.ctx.destination);
      o.start(start);o.stop(start+dur);
    }catch(e){}
  }
  noise(dur=.2,vol=.1){
    if(this.muted||!this.ctx)return;
    try{
      const length=Math.max(1,Math.floor(this.ctx.sampleRate*dur));
      const buffer=this.ctx.createBuffer(1,length,this.ctx.sampleRate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
      const source=this.ctx.createBufferSource(),g=this.ctx.createGain();
      const now=this.ctx.currentTime;
      source.buffer=buffer;
      g.gain.setValueAtTime(vol,now);
      g.gain.exponentialRampToValueAtTime(.0001,now+dur);
      source.connect(g);g.connect(this.ctx.destination);
      source.start(now);source.stop(now+dur);
    }catch(e){}
  }
  bomb(){this.sweep(180,80,.25,'sawtooth',.12);}
  explosion(){
    this.noise(.28,.16);
    this.sweep(150,38,.32,'sawtooth',.18);
    this.beep(72,.12,'triangle',.12,.04);
  }
  enemyDefeat(){
    this.sweep(520,150,.22,'square',.1);
    this.beep(760,.08,'triangle',.08,.05);
  }
  step(){
    if(this.muted||!this.ctx)return;
    const now=performance.now()/1000;
    if(now<this.nextStepAt)return;
    this.nextStepAt=now+.16;
    const tones=[150,190];
    this.beep(tones[this.stepIndex%tones.length],.045,'triangle',.045);
    this.stepIndex++;
  }
  coin(){
    this.beep(880,.08,'sine',.1);
    this.beep(1320,.1,'sine',.08,.06);
  }
  dash(){this.sweep(300,950,.12,'sine',.1);}
  pickup(){this.beep(660,.08,'sine',.08);}
  hurt(){this.sweep(260,90,.3,'square',.12);}
  burn(){
    this.noise(.22,.13);
    this.sweep(460,95,.28,'sawtooth',.16);
    this.beep(120,.18,'square',.08,.03);
  }
  win(){[523,659,784,1046].forEach((f,i)=>this.beep(f,.15,'triangle',.12,i*.1));}
}

export { AudioSystem };
