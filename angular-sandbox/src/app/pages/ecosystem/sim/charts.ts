import { HistorySample } from './engine';

type ChartMode = 'population' | 'traits';
function fit(canvas:HTMLCanvasElement){const r=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
  const w=Math.max(1,r.width),h=Math.max(1,r.height);
  canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);
  const c=canvas.getContext('2d');if(!c)throw new Error('2D canvas missing');c.setTransform(dpr,0,0,dpr,0,0);return {c,w,h};}
export function drawChart(canvas:HTMLCanvasElement,data:HistorySample[],mode:ChartMode){
  const {c,w,h}=fit(canvas);c.clearRect(0,0,w,h);
  if(!data.length)return;
  const left=12,right=w-12,top=16,bottom=h-18,plotHeight=bottom-top;
  c.strokeStyle='rgba(167,200,192,.09)';c.lineWidth=1;
  for(let i=0;i<4;i++){const y=top+plotHeight*i/3;c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();}
  const latest=data[data.length-1];
  const series=mode==='population' ? [
      {values:data.map(x=>x.prey),color:'#72ead3',fill:'rgba(88,240,204,.15)'},
      {values:data.map(x=>x.predators),color:'#ffa879',fill:'rgba(255,152,108,.065)'}
    ]:[
      {values:data.map(x=>x.speed),color:'#72ead3',fill:'rgba(88,240,204,.14)'},
      {values:data.map(x=>x.camouflage),color:'#ffa879',fill:'rgba(255,152,108,.04)'}
    ];
  const max=mode==='population'? Math.max(45,...series.flatMap(s=>s.values))*1.12 : 1.75;
  for(const s of series){
    const points=s.values.map((value,i)=>({x:left+(right-left)*(i/Math.max(1,data.length-1)),y:bottom-(value/max)*plotHeight}));
    if(points.length===1)points.push({x:right,y:points[0].y});
    c.beginPath();c.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++){
      const mx=(points[i-1].x+points[i].x)/2;c.bezierCurveTo(mx,points[i-1].y,mx,points[i].y,points[i].x,points[i].y);
    }
    c.lineTo(right,bottom);c.lineTo(left,bottom);c.closePath();c.fillStyle=s.fill;c.fill();
    c.beginPath();c.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++){
      const mx=(points[i-1].x+points[i].x)/2;c.bezierCurveTo(mx,points[i-1].y,mx,points[i].y,points[i].x,points[i].y);
    }
    c.lineWidth=1.9;c.strokeStyle=s.color;c.shadowColor=s.color;c.shadowBlur=5;c.stroke();c.shadowBlur=0;
    const last=points[points.length-1];c.beginPath();c.arc(last.x,last.y,3.5,0,Math.PI*2);c.fillStyle=s.color;c.fill();
  }
  c.font='10px system-ui';c.fillStyle='rgba(193,213,206,.39)';c.textAlign='left';c.fillText(`DAY ${Math.floor(data[0].time/6+1).toString().padStart(3,'0')}`,left,h-2);
  c.textAlign='right';c.fillText(`DAY ${Math.floor(latest.time/6+1).toString().padStart(3,'0')}`,right,h-2);
}
export function drawTinyChart(canvas:HTMLCanvasElement,data:HistorySample[],key:'prey'|'predators'){
  const {c,w,h}=fit(canvas);c.clearRect(0,0,w,h);const values=data.slice(-65).map(d=>d[key]);if(values.length<2)return;
  const max=Math.max(1,...values)*1.15;const color=key==='prey'?'#6ee8d0':'#ffa774';
  c.strokeStyle=color;c.lineWidth=1.75;c.beginPath();values.forEach((v,i)=>{const x=i/(values.length-1)*w,y=h-v/max*(h-4)-2;if(!i)c.moveTo(x,y);else c.lineTo(x,y);});c.stroke();
}
