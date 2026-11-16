/** WILD agent-based ecosystem. All charts come from these simulated agents. */
export type Species = 'prey' | 'predator';
export type Intervention = 'bloom' | 'current' | 'heat' | 'cold';
export interface Genes {
  speed: number;       // Movement, 0.55—1.6
  vision: number;      // Perception range, 0.55—1.6
  camouflage: number;  // Hiding from predators, 0—1
  fertility: number;   // Energy threshold/interval, 0.6—1.5
  thermal: number;     // Temperature preference, -1 (cold) to +1 (warm)
}
export interface Organism {
  id: number; species: Species; x: number; y: number;
  vx: number; vy: number; angle: number; energy: number; age: number;
  generation: number; cooldown: number; genes: Genes; alive: boolean;
}
export interface Food { id: number; x: number; y: number; energy: number; }
export interface Patch { x: number; y: number; radius: number; strength: number; life: number; maxLife: number; kind: Intervention; dx: number; dy: number; }
export interface Flash { x: number; y: number; life: number; maxLife: number; species: Species | 'food' | 'death'; }
export interface WorldStats {
  prey: number; predators: number; food: number; births: number; deaths: number;
  kills: number; day: number; generations: number; meanSpeed: number;
  camouflage: number; diversity: number; temperature: number;
  populationPeak: number;
}
export interface HistorySample { time: number; prey: number; predators: number; food: number; speed: number; camouflage: number; }
export interface WorldEvent { key: number; day: number; type: 'birth' | 'hunt' | 'evolution' | 'extinction' | 'world'; message: string; }
export interface OrganismSnapshot extends Organism { }

const W = 1200;
const H = 740;
const CELL = 48;
const MAX_PREY = 720;
const MAX_PREDATORS = 120;
const MAX_FOOD = 780;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/** Stable PRNG: same seed + same inputs reproduces a world. */
class Random {
  constructor(private state: number) { this.state = this.state >>> 0 || 123456; }
  next(): number { let t = this.state += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  between(min: number, max: number): number { return min + (max - min) * this.next(); }
  choose<T>(xs: readonly T[]): T { return xs[Math.floor(this.next() * xs.length)]; }
}

class SpatialGrid<T extends { x: number; y: number }> {
  private readonly cells = new Map<number, T[]>();
  clear() { this.cells.clear(); }
  insert(a: T) { const k = Math.floor(a.x / CELL) + 32 * Math.floor(a.y / CELL); let cell = this.cells.get(k); if (!cell) { cell = []; this.cells.set(k, cell); } cell.push(a); }
  nearby(x: number, y: number, radius: number, cb: (item: T) => void) {
    const x0 = Math.floor((x - radius) / CELL), x1 = Math.floor((x + radius) / CELL);
    const y0 = Math.floor((y - radius) / CELL), y1 = Math.floor((y + radius) / CELL);
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      const cell = this.cells.get(cx + 32 * cy); if (cell) for (const a of cell) cb(a);
    }
  }
}

export class WorldEngine {
  readonly width = W;
  readonly height = H;
  readonly organisms: Organism[] = [];
  readonly food: Food[] = [];
  readonly patches: Patch[] = [];
  readonly flashes: Flash[] = [];
  readonly history: HistorySample[] = [];
  readonly events: WorldEvent[] = [];
  readonly seed: number;
  private readonly random: Random;
  private preyGrid = new SpatialGrid<Organism>();
  private predatorGrid = new SpatialGrid<Organism>();
  private foodGrid = new SpatialGrid<Food>();
  private nextId = 1;
  private foodAccum = 0;
  private historyAccum = 0;
  private eventKey = 0;
  private lastMilestone = 0;
  private lastHuntEvent = -100;
  private statsCache: WorldStats | undefined;
  elapsed = 0;
  births = 0;
  deaths = 0;
  kills = 0;
  maxPopulation = 0;
  selectedId: number | null = null;
  private readonly initialPrey: number;
  private readonly initialPredators: number;

  constructor(seed = Math.floor(Math.random() * 0xFFFFFFFF), prey = 210, predators = 18) {
    this.seed = seed >>> 0;
    this.random = new Random(this.seed);
    this.initialPrey = prey;
    this.initialPredators = predators;
    this.populate();
  }
  get day() { return this.elapsed / 6 + 1; }
  get prey() { return this.organisms.filter(a => a.alive && a.species === 'prey').length; }
  get predators() { return this.organisms.filter(a => a.alive && a.species === 'predator').length; }
  private event(type: WorldEvent['type'], message: string) {
    this.events.unshift({ key: ++this.eventKey, day: Math.floor(this.day), type, message });
    if (this.events.length > 8) this.events.length = 8;
  }
  private populate() {
    for (let i = 0; i < 410; i++) this.addFood();
    for (let i = 0; i < this.initialPrey; i++) this.addOrganism('prey');
    for (let i = 0; i < this.initialPredators; i++) this.addOrganism('predator');
    this.event('world', 'A new world begins. Every life is an experiment.');
    this.takeHistory();
  }
  private randomPoint(): { x: number; y: number } {
    // Shallow fertile islands subtly bias plant growth without locking food in place.
    const islands = [[245,180],[910,190],[630,410],[320,600],[1030,550]];
    if (this.random.next() < 0.84) {
      const c = this.random.choose(islands);
      return { x: clamp(c[0] + (this.random.next()+this.random.next()+this.random.next()-1.5)*230, 15, W-15),
        y: clamp(c[1] + (this.random.next()+this.random.next()+this.random.next()-1.5)*225, 15, H-15) };
    }
    return { x: this.random.between(15, W-15), y: this.random.between(15, H-15) };
  }
  private addFood(x?: number, y?: number) {
    if (this.food.length >= MAX_FOOD) return;
    const p = x === undefined || y === undefined ? this.randomPoint() : { x: clamp(x,0,W), y: clamp(y,0,H) };
    this.food.push({ id: this.nextId++, x: p.x, y: p.y, energy: this.random.between(.43,.67) });
  }
  private genesFor(species: Species, parent?: Genes): Genes {
    if (!parent) return {
      speed: this.random.between(.72, 1.2), vision: this.random.between(.7,1.2),
      camouflage: species === 'prey' ? this.random.between(.22,.7) : this.random.between(.06,.35),
      fertility: this.random.between(.77,1.17), thermal: this.random.between(-.38,.38)
    };
    const mutate = (v: number, a: number, b: number) => clamp(v + (this.random.next()<.22 ? this.random.between(-.19,.19) : this.random.between(-.025,.025)), a, b);
    return { speed: mutate(parent.speed,.55,1.6), vision: mutate(parent.vision,.55,1.6), camouflage: mutate(parent.camouflage,0,1), fertility: mutate(parent.fertility,.6,1.5), thermal: mutate(parent.thermal,-1,1) };
  }
  private addOrganism(species: Species, parent?: Organism) {
    const p = parent ? { x: clamp(parent.x + this.random.between(-16,16),4,W-4), y: clamp(parent.y+this.random.between(-16,16),4,H-4) } : this.randomPoint();
    const angle = this.random.between(0, Math.PI*2);
    const a: Organism = { id: this.nextId++, species, x:p.x, y:p.y, vx:Math.cos(angle), vy:Math.sin(angle), angle,
      age: parent ? 0 : this.random.between(0,25), energy: parent ? .75 : this.random.between(.9,1.55),
      generation: parent ? parent.generation+1 : 1, cooldown: this.random.between(0,7), genes: this.genesFor(species,parent?.genes), alive:true };
    this.organisms.push(a);
    if (parent) { this.births++; if (this.flashes.length<80) this.flashes.push({x:a.x,y:a.y,life:1.2,maxLife:1.2,species}); }
    return a;
  }
  bloom(x: number, y: number, amount = 10) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    for (let i = 0; i < amount; i++) {
      const a = this.random.between(0,Math.PI*2), r = Math.sqrt(this.random.next())*48;
      this.addFood(x+Math.cos(a)*r,y+Math.sin(a)*r);
    }
    this.pulse(x,y,'bloom',.8,55,0,0);
  }
  flow(x: number, y: number, dx: number, dy: number) {
    if (![x,y,dx,dy].every(Number.isFinite)) return;
    const len = Math.hypot(dx,dy);
    if (len < 1) return;
    this.pulse(x,y,'current',1.65,115,clamp(dx*2,-160,160),clamp(dy*2,-160,160));
  }
  climate(x: number, y: number, kind: 'heat'|'cold') { if (Number.isFinite(x) && Number.isFinite(y)) this.pulse(x,y,kind,18,118,0,0); }
  private pulse(x: number,y: number,kind: Intervention,life: number,radius: number,dx:number,dy:number) {
    if (this.patches.length > 24) this.patches.shift();
    this.patches.push({x,y,kind,radius,life,maxLife:life,strength:1,dx,dy});
  }
  findNearest(x: number,y: number,radius = 38): Organism | null {
    let best: Organism | null = null, bestD = radius*radius;
    for (const a of this.organisms) {
      if (!a.alive) continue;
      const d = (a.x-x)**2+(a.y-y)**2;
      if (d<bestD) { best=a;bestD=d; }
    }
    this.selectedId = best?.id ?? null;
    return best;
  }
  getSelected(): Organism | null { return this.organisms.find(a => a.id === this.selectedId && a.alive) ?? null; }
  /** Do not change organism array during iteration: births are staged. */
  step(rawDt: number) {
    const dt = clamp(rawDt,0,.05);
    if (!dt) return;
    this.elapsed += dt;
    this.statsCache = undefined;
    this.foodAccum += dt * (12.5 + 3.0*Math.sin(this.elapsed*.039));
    while (this.foodAccum>=1) { this.addFood(); this.foodAccum -= 1; }
    for (let i=this.patches.length-1;i>=0;i--) if ((this.patches[i].life-=dt)<=0) this.patches.splice(i,1);
    for (let i=this.flashes.length-1;i>=0;i--) if ((this.flashes[i].life-=dt)<=0) this.flashes.splice(i,1);
    this.foodGrid.clear(); this.preyGrid.clear(); this.predatorGrid.clear();
    for (const f of this.food) this.foodGrid.insert(f);
    for (const a of this.organisms) if (a.alive) (a.species==='prey' ? this.preyGrid : this.predatorGrid).insert(a);
    const newBorn: Array<{species: Species;parent:Organism}> = [];
    const preyCount=this.organisms.filter(a=>a.alive && a.species==='prey').length;
    const predatorCount=this.organisms.filter(a=>a.alive && a.species==='predator').length;
    const pendingBirths: Record<Species,number>={prey:0,predator:0};
    for (const a of this.organisms) {
      if (!a.alive) continue;
      const isPrey = a.species==='prey';
      a.age += dt; a.cooldown -= dt;
      const g=a.genes;
      const vision=(isPrey?75:103)*g.vision;
      let tx=0,ty=0, closest=Infinity, preyTarget: Organism | null = null, foodTarget: Food | null = null;
      if (isPrey) {
        this.foodGrid.nearby(a.x,a.y,vision,f=>{const dd=(f.x-a.x)**2+(f.y-a.y)**2;if(dd<closest){closest=dd;foodTarget=f;}});
        if(foodTarget){const f:Food=foodTarget; tx=(f.x-a.x)/Math.sqrt(closest+1);ty=(f.y-a.y)/Math.sqrt(closest+1);if(closest<106 && f.energy>0){ f.energy=0; a.energy+=.42; }}
        let threatX=0,threatY=0;
        this.predatorGrid.nearby(a.x,a.y,105*g.vision,p=>{
          const dx=a.x-p.x,dy=a.y-p.y,d2=dx*dx+dy*dy;
          if(d2<(105*g.vision)**2){const w=1/(d2+450);threatX+=dx*w;threatY+=dy*w;}
        });
        if(threatX||threatY) {const d=Math.hypot(threatX,threatY)||1;tx=tx*.2+(threatX/d)*1.8;ty=ty*.2+(threatY/d)*1.8;}
      } else {
        this.preyGrid.nearby(a.x,a.y,vision, p=>{
          if(!p.alive) return;
          const dx=p.x-a.x, dy=p.y-a.y,dd=dx*dx+dy*dy;
          const visualRange=vision*(1-p.genes.camouflage*.43);
          if(dd<closest && dd<visualRange*visualRange){closest=dd;preyTarget=p;}
        });
        if(preyTarget){const p:Organism=preyTarget;tx=(p.x-a.x)/Math.sqrt(closest+1);ty=(p.y-a.y)/Math.sqrt(closest+1);
          if(closest<140 && p.alive){p.alive=false; this.kills++;this.deaths++;a.energy+=.95;
            if(this.flashes.length<80) this.flashes.push({x:p.x,y:p.y,life:.8,maxLife:.8,species:'death'});
            if(this.elapsed-this.lastHuntEvent>13){this.event('hunt','Predators found a new feeding ground.'); this.lastHuntEvent=this.elapsed;}
          }
        }
      }
      // Wander when there is no strong directional stimulus.
      const turn = .35*Math.sin(a.id*7.77+this.elapsed*.7)+.3*Math.sin(a.id*3.51+this.elapsed*.31);
      tx+=Math.cos(a.angle+turn)*.28; ty+=Math.sin(a.angle+turn)*.28;
      const d=Math.hypot(tx,ty)||1, steer=Math.min(1,dt*(isPrey?4.8:3.6));
      a.vx+=(tx/d-a.vx)*steer; a.vy+=(ty/d-a.vy)*steer;
      const norm=Math.hypot(a.vx,a.vy)||1;a.vx/=norm;a.vy/=norm;
      const speed=(isPrey?44:39)*g.speed * (a.energy<.3?.7:1);
      a.x+=a.vx*speed*dt;a.y+=a.vy*speed*dt;
      for(const p of this.patches){const dx=a.x-p.x,dy=a.y-p.y;const dd=dx*dx+dy*dy;
        if(dd>p.radius*p.radius)continue;
        const atten=(1-Math.sqrt(dd)/p.radius)*(p.life/p.maxLife);
        if(p.kind==='current'){a.x+=p.dx*dt*atten*1.9;a.y+=p.dy*dt*atten*1.9;}
        else if(p.kind==='heat'||p.kind==='cold'){
          const optimal=p.kind==='heat'?1:-1;
          const suitability=(1-g.thermal*optimal)/2;
          a.energy-=dt*.09*atten*suitability;
        }
      }
      if(a.x<8){a.x=8;a.vx=Math.abs(a.vx);} if(a.x>W-8){a.x=W-8;a.vx=-Math.abs(a.vx);}
      if(a.y<8){a.y=8;a.vy=Math.abs(a.vy);} if(a.y>H-8){a.y=H-8;a.vy=-Math.abs(a.vy);}
      a.angle=Math.atan2(a.vy,a.vx);
      a.energy-=dt*(isPrey?.015:.033)*(0.58+g.speed*g.speed*.37+g.vision*.11);
      const lifespan=(isPrey?125:152)*(1-(g.fertility-.6)*.12);
      if(a.energy<=0 || a.age>lifespan){a.alive=false;this.deaths++;if(this.flashes.length<80 && this.random.next()<.25)this.flashes.push({x:a.x,y:a.y,life:.8,maxLife:.8,species:'death'});continue;}
      const cap=isPrey?MAX_PREY:MAX_PREDATORS, count=isPrey?preyCount:predatorCount;
      const energyNeeded=(isPrey?1.58:2.55)/g.fertility;
      if(a.age>10 && a.energy>energyNeeded && a.cooldown<0 && count+pendingBirths[a.species]<cap){
        a.energy-=isPrey?.65:1.55;a.cooldown=(isPrey?7:27)/g.fertility;
        newBorn.push({species:a.species,parent:a});pendingBirths[a.species]++;
      }
    }
    // Remove eaten plants and dead organisms, without invalidating the search grids mid-step.
    for(let i=this.food.length-1;i>=0;i--) if(this.food[i].energy<=0) this.food.splice(i,1);
    for(let i=this.organisms.length-1;i>=0;i--) if(!this.organisms[i].alive) this.organisms.splice(i,1);
    for(const b of newBorn)this.addOrganism(b.species,b.parent);
    this.maxPopulation=Math.max(this.maxPopulation,this.organisms.length);
    const milestone=Math.floor(this.births/40);
    if(milestone>this.lastMilestone){this.lastMilestone=milestone; this.event('birth',`${milestone*40} new lives have emerged in this world.`);}
    this.historyAccum+=dt;
    if(this.historyAccum>=1.1){this.historyAccum=0;this.takeHistory();}
  }
  private takeHistory(){const s=this.stats();this.history.push({time:this.elapsed,prey:s.prey,predators:s.predators,food:s.food,speed:s.meanSpeed,camouflage:s.camouflage}); if(this.history.length>180)this.history.shift();}
  stats():WorldStats {
    if(this.statsCache)return this.statsCache;
    let prey=0,predators=0,speed=0,camouflage=0,gen=0;
    let speedSumSq=0,camouSumSq=0;
    for(const a of this.organisms){if(!a.alive)continue;if(a.species==='prey')prey++;else predators++;
      speed+=a.genes.speed;speedSumSq+=a.genes.speed**2;camouflage+=a.genes.camouflage;camouSumSq+=a.genes.camouflage**2;gen+=a.generation;}
    const n=Math.max(1,prey+predators),avgSpeed=speed/n,avgCam=camouflage/n;
    const variation=Math.sqrt(Math.max(0,speedSumSq/n-avgSpeed**2)) + Math.sqrt(Math.max(0,camouSumSq/n-avgCam**2));
    this.statsCache={prey,predators,food:this.food.length,births:this.births,deaths:this.deaths,kills:this.kills,day:this.day,
      generations:gen/n,meanSpeed:avgSpeed,camouflage:avgCam,diversity:clamp(variation/0.65*100,0,100),temperature:18+4*Math.sin(this.elapsed*.014),populationPeak:this.maxPopulation};
    return this.statsCache;
  }
}
