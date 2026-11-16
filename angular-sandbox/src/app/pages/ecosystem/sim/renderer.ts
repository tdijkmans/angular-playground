import { WorldEngine, Organism, Patch } from './engine';

const TAU = Math.PI * 2;
export class WorldRenderer {
  private ctx: CanvasRenderingContext2D;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private readonly foodGlow: HTMLCanvasElement;
  zoom = 1;
  pointer: {x:number;y:number} | null = null;
  hover = false;
  private readonly dust: {x:number;y:number;r:number;opacity:number;offset:number}[];
  constructor(private canvas: HTMLCanvasElement, private world: WorldEngine) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is not supported');
    this.ctx = ctx;
    this.foodGlow = document.createElement('canvas');
    this.foodGlow.width = this.foodGlow.height = 24;
    const glow = this.foodGlow.getContext('2d')!;
    const gradient = glow.createRadialGradient(12,12,0,12,12,12);
    gradient.addColorStop(0,'rgba(126,241,159,.20)');
    gradient.addColorStop(1,'rgba(126,241,159,0)');
    glow.fillStyle = gradient; glow.fillRect(0,0,24,24);
    let s = 728193;
    const rand = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s/4294967296; };
    this.dust = Array.from({length:205},()=>({x:rand()*world.width,y:rand()*world.height,r:rand()*1.2+.15,opacity:rand()*.3+.03,offset:rand()*10}));
  }
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width); this.height = Math.max(1,rect.height);
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.width*this.dpr);
    this.canvas.height = Math.round(this.height*this.dpr);
  }
  private transform(){const s=Math.min(this.width/this.world.width,this.height/this.world.height)*this.zoom;
    return {s,ox:(this.width-this.world.width*s)/2,oy:(this.height-this.world.height*s)/2};}
  screenToWorld(clientX:number,clientY:number){
    const rect=this.canvas.getBoundingClientRect(),t=this.transform();
    const x=(clientX-rect.left-t.ox)/t.s, y=(clientY-rect.top-t.oy)/t.s;
    return {x:Number.isFinite(x)?Math.max(0,Math.min(this.world.width,x)):this.world.width/2,
      y:Number.isFinite(y)?Math.max(0,Math.min(this.world.height,y)):this.world.height/2};
  }
  setWorld(world: WorldEngine) { this.world = world; }
  render(now: number) {
    const c=this.ctx,w=this.width,h=this.height,t=this.transform();
    c.setTransform(this.dpr,0,0,this.dpr,0,0);
    c.fillStyle='#061016';c.fillRect(0,0,w,h);
    // Background: broad translucent light fields, not a photograph or a static background asset.
    const g=c.createRadialGradient(w*.54,h*.5,10,w*.54,h*.5,w*.72);
    g.addColorStop(0,'#122b32');g.addColorStop(.42,'#0a1b23');g.addColorStop(1,'#061016');
    c.fillStyle=g;c.fillRect(0,0,w,h);
    const g2=c.createRadialGradient(w*.13,h*.87,0,w*.13,h*.87,w*.46);
    g2.addColorStop(0,'rgba(15,78,76,.23)');g2.addColorStop(1,'rgba(10,20,25,0)');c.fillStyle=g2;c.fillRect(0,0,w,h);
    const g3=c.createRadialGradient(w*.86,h*.18,0,w*.86,h*.18,w*.4);
    g3.addColorStop(0,'rgba(107,57,40,.14)');g3.addColorStop(1,'rgba(10,20,25,0)');c.fillStyle=g3;c.fillRect(0,0,w,h);
    c.translate(t.ox,t.oy);c.scale(t.s,t.s);
    this.grid(now);
    this.interventions(now);
    this.food(now);
    this.organisms(now);
    this.flashes(now);
    this.selected(now);
    this.pointerRing(now);
    c.setTransform(this.dpr,0,0,this.dpr,0,0);
    const vignette = c.createRadialGradient(w/2,h/2,w*.12,w/2,h/2,w*.8);
    vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.38)');
    c.fillStyle=vignette;c.fillRect(0,0,w,h);
  }
  private grid(now:number) {
    const c=this.ctx, W=this.world.width,H=this.world.height;
    c.save();c.lineWidth=.7;c.strokeStyle='rgba(125,177,176,.038)';
    for(let x=0;x<=W;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
    for(let y=0;y<=H;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
    c.strokeStyle='rgba(117,209,190,.052)';c.lineWidth=.8;
    for(const [x,y,r] of [[275,228,150],[926,402,190],[660,670,130]]){
      c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.beginPath();c.arc(x,y,r*.65,0,TAU);c.stroke();
    }
    for(const d of this.dust){c.beginPath();c.fillStyle=`rgba(167,232,210,${d.opacity*(.75+.25*Math.sin(now*.00055+d.offset))})`;
      c.arc(d.x,d.y,d.r,0,TAU);c.fill();}
    c.restore();
  }
  private interventions(now:number){
    const c=this.ctx;
    for(const p of this.world.patches){const power=p.life/p.maxLife;
      if(p.kind==='current'){
        c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.dy,p.dx));
        c.strokeStyle=`rgba(105,176,255,${.30*power})`;c.lineWidth=1.2;
        for(let i=-2;i<=2;i++) {c.beginPath();c.ellipse(0,i*11,p.radius*.75,p.radius*.29,0,-1.1,1.1);c.stroke();}
        c.restore();
      }else{
        const heat=p.kind==='heat',cold=p.kind==='cold',bloom=p.kind==='bloom';
        const color=heat?'255,126,83':cold?'105,169,255':'124,240,175';
        const grad=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.radius);
        grad.addColorStop(0,`rgba(${color},${(bloom?.16:.22)*power})`);
        grad.addColorStop(1,`rgba(${color},0)`);c.fillStyle=grad;c.beginPath();c.arc(p.x,p.y,p.radius,0,TAU);c.fill();
        c.strokeStyle=`rgba(${color},${.34*power})`;c.lineWidth=1.5;
        c.beginPath();c.arc(p.x,p.y,p.radius*(1-power*.44),0,TAU);c.stroke();
      }
    }
  }
  private food(now:number){
    const c=this.ctx;
    // Soft bioluminescent halo for a subset of plants, then sharp edible centers.
    c.save();
    for(let i=0;i<this.world.food.length;i++){
      const f=this.world.food[i],phase=.72+.28*Math.sin(now*.0019+f.id*1.71);
      if(i%3===0) c.drawImage(this.foodGlow, f.x-12, f.y-12);
      c.beginPath();c.fillStyle=`rgba(132,226,158,${.53*phase})`;c.arc(f.x,f.y,1.4+(f.id%4)*.15,0,TAU);c.fill();
    }
    c.restore();
  }
  private organisms(now:number){
    const c=this.ctx;
    c.save();
    for(const a of this.world.organisms){
      const prey=a.species==='prey',pulse=.9+.1*Math.sin(now*.003+a.id),s=.85+a.genes.speed*.32;
      const head=prey?'#7ae6d5':'#ffb380';const tail=prey?'rgba(67,225,198,0)':'rgba(255,129,98,0)';
      const body=prey?`rgba(125,246,226,${.74+a.genes.camouflage*.18})`:'rgba(255,166,125,.94)';
      const trail=prey?`rgba(71,216,198,${.25*pulse})`:`rgba(255,142,104,${.38*pulse})`;
      c.save();c.translate(a.x,a.y);c.rotate(a.angle);
      const length=prey?14+a.genes.speed*7:22+a.genes.speed*9;
      // Luminous tail reveals genetic speed at a glance.
      const gr=c.createLinearGradient(-length,0,5,0);gr.addColorStop(0,tail);gr.addColorStop(1,trail);
      c.beginPath();c.moveTo(-length,0);c.quadraticCurveTo(-length*.46,Math.sin(now*.002+a.id)*3,0,0);
      c.strokeStyle=gr;c.lineWidth=prey?1.4:2.1;c.stroke();
      if(prey){
        c.beginPath();c.ellipse(0,0,4.8*s,2.6*s,0,0,TAU);c.fillStyle=body;c.shadowBlur=11;c.shadowColor='#5cf9e4';c.fill();
        c.shadowBlur=0;c.fillStyle='#e4fffa';c.beginPath();c.arc(2.4*s,-.5,1,0,TAU);c.fill();
      }else{
        c.beginPath();c.moveTo(7*s,0);c.lineTo(-4*s,-4.2*s);c.quadraticCurveTo(-2*s,0,-4*s,4.2*s);c.closePath();
        c.fillStyle=body;c.shadowBlur=17;c.shadowColor='#ff936e';c.fill();c.shadowBlur=0;
        c.beginPath();c.moveTo(-3*s,-3*s);c.lineTo(-8*s,-5.5*s);c.moveTo(-3*s,3*s);c.lineTo(-8*s,5.5*s);
        c.strokeStyle='rgba(255,169,129,.5)';c.lineWidth=.8;c.stroke();
      }
      c.restore();
    }
    c.restore();
  }
  private flashes(now:number){
    const c=this.ctx;
    for(const f of this.world.flashes){const p=f.life/f.maxLife;
      const color=f.species==='predator'?'255,160,119':f.species==='death'?'255,207,164':'105,237,217';
      c.beginPath();c.arc(f.x,f.y,(1-p)*24+3,0,TAU);c.strokeStyle=`rgba(${color},${p*.6})`;c.lineWidth=1.5;c.stroke();
    }
  }
  private selected(now:number){
    const a=this.world.getSelected();if(!a)return;
    const c=this.ctx,r=17+Math.sin(now*.003)*1.7;c.save();
    c.strokeStyle=a.species==='prey'?'rgba(125,249,226,.82)':'rgba(255,162,114,.86)';
    c.lineWidth=1.1;c.setLineDash([3,6]);c.lineDashOffset=-now*.012;c.beginPath();c.arc(a.x,a.y,r,0,TAU);c.stroke();
    c.setLineDash([]);c.beginPath();c.moveTo(a.x,a.y-r-8);c.lineTo(a.x,a.y-r-15);c.stroke();
    c.restore();
  }
  private pointerRing(now:number){
    if(!this.pointer || !this.hover)return;
    const c=this.ctx,x=this.pointer.x,y=this.pointer.y;c.save();
    c.strokeStyle='rgba(219,249,233,.32)';c.lineWidth=1;c.setLineDash([2,5]);c.beginPath();c.arc(x,y,28+Math.sin(now*.004)*1.5,0,TAU);c.stroke();
    c.setLineDash([]);c.fillStyle='rgba(212,244,225,.5)';c.beginPath();c.arc(x,y,2,0,TAU);c.fill();c.restore();
  }
}
