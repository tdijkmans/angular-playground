import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorldEngine, Organism, WorldStats, HistorySample, WorldEvent } from './sim/engine';
import { WorldRenderer } from './sim/renderer';
import { drawChart, drawTinyChart } from './sim/charts';

type Tool = 'bloom' | 'current' | 'heat' | 'cold' | 'inspect';
type AquariumCard = 'population' | 'evolution' | 'timeline' | 'journal';
type AquariumPreset = 'zen' | 'glance' | 'study' | 'custom';
const aquariumDefaults: Record<AquariumPreset, Record<AquariumCard, boolean>> = {
  zen:    {population:false, evolution:false, timeline:false, journal:false},
  glance: {population:true,  evolution:false, timeline:false, journal:false},
  study:  {population:true,  evolution:true,  timeline:true,  journal:true},
  custom: {population:false, evolution:false, timeline:false, journal:false}
};

@Component({
  selector: 'app-ecosystem',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './ecosystem.html',
  styleUrl: './ecosystem.scss'
})
export class EcosystemComponent implements AfterViewInit, OnDestroy {
  @ViewChild('worldFrame', {static:true}) worldFrame!: ElementRef<HTMLElement>;
  @ViewChild('worldCanvas', {static:true}) worldCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('aquariumChart') aquariumChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('popChart', {static:true}) popChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('preySpark', {static:true}) preySpark!: ElementRef<HTMLCanvasElement>;
  @ViewChild('predatorSpark', {static:true}) predatorSpark!: ElementRef<HTMLCanvasElement>;

  private world = new WorldEngine(20261116);
  private renderer!: WorldRenderer;
  private resizeObserver?: ResizeObserver;
  private frameId = 0;
  private lastFrame = 0;
  private accumulator = 0;
  private statsTimer = 0;
  private interactionTimer = 0;
  private pointers = new Map<number, {x:number;y:number}>();
  private pinchDistance = 0;
  private pinchZoom = 1;
  private pointerXY: {x:number;y:number} | null = null;
  private movingFrom: {x:number;y:number} | null = null;
  private aquariumChromeTimer?: ReturnType<typeof setTimeout>;
  private usingNativeFullscreen = false;
  private priorBodyOverflow = '';
  private readonly fullscreenHandler = () => {
    if (this.usingNativeFullscreen && document.fullscreenElement !== this.worldFrame.nativeElement) {
      this.usingNativeFullscreen = false;
      this.finishAquariumExit();
    }
    requestAnimationFrame(() => this.onResize());
  };

  readonly stats = signal<WorldStats>(this.world.stats());
  readonly history = signal<HistorySample[]>([...this.world.history]);
  readonly events = signal<WorldEvent[]>([...this.world.events]);
  readonly selected = signal<Organism|null>(null);
  readonly seed = signal(this.world.seed);
  readonly mode = signal<Tool>('bloom');
  readonly chartMode = signal<'population'|'traits'>('population');
  readonly paused = signal(false);
  readonly speed = signal(1);
  readonly showGuide = signal(true);
  readonly interaction = signal('Leave a little life behind.');
  readonly zoomLevel = signal(1);
  readonly aquariumMode = signal(false);
  readonly aquariumSettingsOpen = signal(false);
  readonly aquariumIdle = signal(false);
  readonly aquariumInteract = signal(false);
  readonly aquariumPreset = signal<AquariumPreset>('zen');
  readonly aquariumCards = signal<Record<AquariumCard, boolean>>({...aquariumDefaults.zen});
  readonly aquariumCardOptions: {id:AquariumCard; title:string; subtitle:string}[] = [
    {id:'population', title:'Populations', subtitle:'Grazers & hunters'},
    {id:'evolution', title:'Evolution', subtitle:'Genes & generation'},
    {id:'timeline', title:'Live graph', subtitle:'Population history'},
    {id:'journal', title:'Field journal', subtitle:'Recent events'}
  ];

  readonly tools: { id: Tool; icon: string; name: string; shortcut: string; description: string; color: string }[] = [
    { id:'bloom', icon:'✳', name:'Grow', shortcut:'1', description:'Plant a bloom of food', color:'mint' },
    { id:'current', icon:'↝', name:'Flow', shortcut:'2', description:'Sculpt the current', color:'blue' },
    { id:'heat', icon:'☀', name:'Warm', shortcut:'3', description:'Create a warm pocket', color:'coral' },
    { id:'cold', icon:'❄', name:'Cool', shortcut:'4', description:'Create a cool pocket', color:'blue' },
    { id:'inspect', icon:'◎', name:'Inspect', shortcut:'5', description:'Read an organism’s DNA', color:'white' },
  ];

  private readonly keyHandler = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if(target && ['INPUT','TEXTAREA','SELECT'].includes(target.tagName))return;
    if(event.key.toLowerCase()==='f' && !event.repeat){event.preventDefault();void this.toggleAquarium();return;}
    if(event.key==='Escape' && this.aquariumMode() && !this.usingNativeFullscreen){this.exitAquarium();return;}
    if(event.code==='Space'){event.preventDefault();this.togglePause();}
    else { const index=Number(event.key)-1; if(index>=0&&index<this.tools.length)this.setMode(this.tools[index].id); }
  };

  ngAfterViewInit() {
    this.renderer = new WorldRenderer(this.worldCanvas.nativeElement, this.world);
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.worldCanvas.nativeElement);
    this.resizeObserver.observe(this.popChart.nativeElement);
    window.addEventListener('keydown', this.keyHandler);
    document.addEventListener('fullscreenchange', this.fullscreenHandler);
    this.onResize();
    this.frameId=requestAnimationFrame(this.tick);
  }
  ngOnDestroy() { if (document.fullscreenElement === this.worldFrame?.nativeElement) { void document.exitFullscreen().catch(() => {}); } cancelAnimationFrame(this.frameId);this.resizeObserver?.disconnect(); window.removeEventListener('keydown',this.keyHandler); document.removeEventListener('fullscreenchange', this.fullscreenHandler);clearTimeout(this.aquariumChromeTimer);document.body.style.overflow=this.priorBodyOverflow; }

  private tick = (now:number) => {
    if(!this.lastFrame)this.lastFrame=now;
    const delta=Math.min((now-this.lastFrame)/1000,.065);
    this.lastFrame=now;
    if(!this.paused()){
      this.accumulator=Math.min(.28,this.accumulator+delta*this.speed());
      let steps=0;
      while(this.accumulator>=1/60 && steps<18){this.world.step(1/60);this.accumulator-=1/60;steps++;}
    }
    this.renderer.render(now);
    this.statsTimer+=delta;
    if(this.statsTimer>.22){this.statsTimer=0;this.updateUi();}
    if(this.pointers.size===1 && !this.paused() && this.pointerXY && (!this.aquariumMode() || this.aquariumInteract())){
      this.interactionTimer+=delta;
      const tool=this.mode();
      if(tool==='bloom' && this.interactionTimer>.13){this.world.bloom(this.pointerXY.x,this.pointerXY.y,4);this.interactionTimer=0;}
      if((tool==='heat'||tool==='cold') && this.interactionTimer>.4){this.world.climate(this.pointerXY.x,this.pointerXY.y,tool);this.interactionTimer=0;}
    }
    this.frameId=requestAnimationFrame(this.tick);
  };
  private updateUi(){
    this.stats.set(this.world.stats());
    this.history.set([...this.world.history]);
    this.events.set([...this.world.events]);
    this.selected.set(this.world.getSelected());
    this.paintCharts();
  }
  private onResize(){if(!this.renderer)return;this.renderer.resize();this.paintCharts();}
  private paintCharts(){
    if(!this.popChart)return;
    drawChart(this.popChart.nativeElement,this.world.history,this.chartMode());
    if(this.aquariumMode() && this.aquariumCards().timeline && this.aquariumChart) drawChart(this.aquariumChart.nativeElement,this.world.history,'population');
    drawTinyChart(this.preySpark.nativeElement,this.world.history,'prey');
    drawTinyChart(this.predatorSpark.nativeElement,this.world.history,'predators');
  }

  setMode(value:Tool){this.mode.set(value);this.selected.set(null);this.world.selectedId=null;
    const labels:Record<Tool,string>={bloom:'Tap or drag to grow new food.',current:'Drag to redirect the current.',heat:'Touch to create a warm pocket.',cold:'Touch to create a cool pocket.',inspect:'Tap an organism to inspect its genes.'};
    this.interaction.set(labels[value]);}
  setChartMode(value:'population'|'traits'){this.chartMode.set(value);this.paintCharts();}
  togglePause(){this.paused.update(p=>!p);this.lastFrame=performance.now();}
  cycleSpeed(){this.speed.set(this.speed()===1?2:this.speed()===2?4:1);}
  newWorld(){
    this.world=new WorldEngine(Math.floor(Math.random()*4294967295));
    this.renderer.setWorld(this.world);this.seed.set(this.world.seed);this.selected.set(null);
    this.paused.set(false);this.lastFrame=performance.now();this.accumulator=0;this.statsTimer=0;
    this.renderer.zoom=1;this.zoomLevel.set(1);this.pointers.clear();this.world.selectedId=null;
    this.interaction.set('An entirely new evolutionary story starts.');this.updateUi();
  }
  closeInspector(){this.world.selectedId=null;this.selected.set(null);}
  toggleGuide(){this.showGuide.update(p=>!p);}

  async toggleAquarium(){
    if(this.aquariumMode()){this.exitAquarium();return;}
    this.showGuide.set(false);
    this.closeInspector();
    this.aquariumInteract.set(false); // watching never changes the ecosystem accidentally
    this.aquariumSettingsOpen.set(false);
    this.priorBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.aquariumMode.set(true);
    this.wakeAquarium();
    // User-initiated native fullscreen when available; CSS immersive fallback for iOS.
    const element = this.worldFrame.nativeElement;
    if(element.requestFullscreen){
      try{await element.requestFullscreen();this.usingNativeFullscreen=true;}
      catch{this.usingNativeFullscreen=false;}
    }
    requestAnimationFrame(()=>this.onResize());
  }
  exitAquarium(){
    if(document.fullscreenElement===this.worldFrame.nativeElement){
      void document.exitFullscreen().catch(()=>this.finishAquariumExit());
    }else this.finishAquariumExit();
  }
  private finishAquariumExit(){
    document.body.style.overflow=this.priorBodyOverflow;
    this.aquariumMode.set(false);
    this.aquariumSettingsOpen.set(false);
    this.aquariumIdle.set(false);
    this.aquariumInteract.set(false);
    this.usingNativeFullscreen=false;
    clearTimeout(this.aquariumChromeTimer);
    this.renderer.hover=false;
    this.pointers.clear();this.pointerXY=null;
    requestAnimationFrame(()=>this.onResize());
  }
  wakeAquarium(){
    if(!this.aquariumMode())return;
    this.aquariumIdle.set(false);
    clearTimeout(this.aquariumChromeTimer);
    if(!this.aquariumSettingsOpen())this.aquariumChromeTimer=setTimeout(()=>this.aquariumIdle.set(true),4200);
  }
  toggleAquariumSettings(){
    this.aquariumSettingsOpen.update(v=>!v);
    this.wakeAquarium();
  }
  setAquariumPreset(preset: Exclude<AquariumPreset,'custom'>){
    this.aquariumPreset.set(preset);
    this.aquariumCards.set({...aquariumDefaults[preset]});
    requestAnimationFrame(()=>this.paintCharts());
  }
  toggleAquariumCard(card:AquariumCard){
    this.aquariumPreset.set('custom');
    this.aquariumCards.update(old=>({...old,[card]:!old[card]}));
    requestAnimationFrame(()=>this.paintCharts());
  }
  toggleAquariumInteraction(){
    this.aquariumInteract.update(v=>!v);
    if(!this.aquariumInteract()){
      this.pointers.clear();this.pointerXY=null;this.renderer.hover=false;
      this.closeInspector();
    }
    this.wakeAquarium();
  }
  onWheel(event:WheelEvent){event.preventDefault();if(this.aquariumMode()&&!this.aquariumInteract())return;this.renderer.zoom=Math.max(1,Math.min(2.8,this.renderer.zoom*(event.deltaY>0?.92:1.08)));this.zoomLevel.set(this.renderer.zoom);}
  onPointerDown(event:PointerEvent){
    if(this.aquariumMode()&&!this.aquariumInteract())return;
    event.preventDefault();(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(this.pointers.size===2){const p=[...this.pointers.values()];this.pinchDistance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);this.pinchZoom=this.renderer.zoom;return;}
    const pos=this.renderer.screenToWorld(event.clientX,event.clientY);this.pointerXY=pos;this.movingFrom=pos;
    this.renderer.pointer=pos;this.renderer.hover=true;this.interactionTimer=0;
    this.applyInteraction(pos,0,0,true);
    this.showGuide.set(false);
  }
  onPointerMove(event:PointerEvent){
    if(this.aquariumMode()&&!this.aquariumInteract()){this.renderer.hover=false;return;}
    const pos=this.renderer.screenToWorld(event.clientX,event.clientY);
    this.renderer.pointer=pos;this.renderer.hover=true;
    if(!this.pointers.has(event.pointerId))return;
    this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(this.pointers.size>1){const points=[...this.pointers.values()],distance=Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y);
      if(this.pinchDistance){this.renderer.zoom=Math.max(1,Math.min(2.8,this.pinchZoom*distance/this.pinchDistance));this.zoomLevel.set(this.renderer.zoom);}return;}
    const prev=this.movingFrom ?? pos;this.pointerXY=pos;this.movingFrom=pos;
    this.applyInteraction(pos,pos.x-prev.x,pos.y-prev.y,false);
  }
  onPointerUp(event:PointerEvent){this.pointers.delete(event.pointerId);this.movingFrom=null;this.interactionTimer=0;
    if(this.pointers.size===0)this.pointerXY=null;
    if(this.pointers.size===1){const p=[...this.pointers.values()][0];this.movingFrom=this.renderer.screenToWorld(p.x,p.y);}
  }
  onPointerLeave(){this.renderer.hover=false;}
  private applyInteraction(pos:{x:number;y:number},dx:number,dy:number,first:boolean){
    if(this.paused() && this.mode()!=='inspect')return;
    switch(this.mode()){
      case 'bloom':this.world.bloom(pos.x,pos.y,first?15:2);break;
      case 'current':if(!first)this.world.flow(pos.x,pos.y,dx,dy);break;
      case 'heat':if(first || this.interactionTimer>.15){this.world.climate(pos.x,pos.y,'heat');this.interactionTimer=0;}break;
      case 'cold':if(first || this.interactionTimer>.15){this.world.climate(pos.x,pos.y,'cold');this.interactionTimer=0;}break;
      case 'inspect':if(first)this.selected.set(this.world.findNearest(pos.x,pos.y,48));break;
    }
  }
  formatGeneration(n:number){return Number.isFinite(n)?n.toFixed(1):'—';}
  percent(n:number){return Math.round(n*100);}
  get currentTool(){return this.tools.find(t=>t.id===this.mode())!;}
}
