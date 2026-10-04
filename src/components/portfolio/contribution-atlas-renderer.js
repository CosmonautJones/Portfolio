export function initializeContributionAtlas(root, data) {
  const controller = new AbortController();
  const listen = (element, type, listener) => element.addEventListener(type, listener, { signal: controller.signal });
  const canvas = root.querySelector('#atlas-canvas');
  const ctx = canvas.getContext('2d');
  const scene = root.querySelector('#scene');
  const tooltip = root.querySelector('#tooltip');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#22342e', '#0e5835', '#238b4b', '#46c96e', '#8aefaa'];
  const start = Date.parse(data.from + 'T00:00:00Z');
  const offset = new Date(start).getUTCDay();
  const weeks = Math.ceil((data.days.length + offset) / 7);
  const peak = data.days.reduce((a, b) => a.count >= b.count ? a : b);
  const peakIndex = data.days.indexOf(peak);
  const days = data.days.map((day, i) => ({...day, index:i, week:Math.floor((i + offset) / 7), row:(i + offset) % 7}));
  const state = {blend:0, target:0, yaw:-0.23, pitch:0.66, height:1, width:0, canvasHeight:0, scale:1, cx:0, cy:0, hovered:-1, selected:-1, faces:[], animation:null};
  let frame = 0;
  let introTimer = 0;
  let drag = null;
  let suppressClick = false;
  const formatter = new Intl.DateTimeFormat('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'UTC'});
  const number = new Intl.NumberFormat('en-US');
  root.querySelector('#total').textContent = number.format(days.reduce((sum, day) => sum + day.count, 0));
  root.querySelector('#active').textContent = days.filter(day => day.count > 0).length;
  root.querySelector('#peak').textContent = peak.count;
  function describe(index, label = 'Selected day') {
    const day = days[index];
    root.querySelector('#day-label').textContent = label;
    root.querySelector('#day-description').textContent = `${number.format(day.count)} contribution${day.count === 1 ? '' : 's'}`;
    root.querySelector('#day-date').textContent = formatter.format(new Date(day.date + 'T00:00:00Z'));
  }
  describe(peakIndex, 'The highest point');
  function shade(hex, factor) {
    return '#' + [1,3,5].map(i => Math.min(255, Math.round(parseInt(hex.slice(i, i+2),16) * factor)).toString(16).padStart(2,'0')).join('');
  }
  function rawProject(x, z, height) {
    const yaw = state.yaw * state.blend;
    const pitch = Math.PI / 2 + (state.pitch - Math.PI / 2) * state.blend;
    const rotatedX = x * Math.cos(yaw) - z * Math.sin(yaw);
    const depth = x * Math.sin(yaw) + z * Math.cos(yaw);
    return {x:rotatedX, y:depth * Math.sin(pitch) - height * Math.cos(pitch), depth:depth * Math.cos(pitch) + height * Math.sin(pitch)};
  }
  function project(x,z,height) {
    const p = rawProject(x,z,height);
    return {x:state.cx + p.x * state.scale, y:state.cy + p.y * state.scale, depth:p.depth};
  }
  function columnHeight(day) {
    const delay = day.week / weeks * 0.18;
    const lift = Math.max(0, Math.min(1, (state.blend - delay) / (1-delay)));
    return 0.06 + day.count / (peak.count || 1) * 8 * state.height * lift;
  }
  function path(points) {
    ctx.beginPath(); ctx.moveTo(points[0].x,points[0].y);
    for (let i=1;i<points.length;i++) ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();
  }
  function fit() {
    const bounds = [];
    for (const x of [-weeks/2-1,weeks/2+1]) for (const z of [-4.4,4.4]) bounds.push(rawProject(x,z,0));
    days.forEach(day => bounds.push(rawProject(day.week-(weeks-1)/2, day.row-3, columnHeight(day))));
    const minX=Math.min(...bounds.map(p=>p.x)), maxX=Math.max(...bounds.map(p=>p.x));
    const minY=Math.min(...bounds.map(p=>p.y)), maxY=Math.max(...bounds.map(p=>p.y));
    const margin = state.width < 500 ? 24 : 50;
    state.scale=Math.min((state.width-margin*2)/(maxX-minX), (state.canvasHeight-98)/(maxY-minY), 25);
    state.cx=state.width/2-(minX+maxX)/2*state.scale;
    state.cy=state.canvasHeight/2-(minY+maxY)/2*state.scale-8;
  }
  function background() {
    ctx.clearRect(0,0,state.width,state.canvasHeight);
    // A static star field keeps all continuous motion in the contribution grid.
    for(let i=0;i<45;i++) {
      const x=((i*127.13+31)%997)/997*state.width;
      const y=((i*63.73+19)%419)/419*state.canvasHeight;
      ctx.fillStyle=i%6===0?'#a1c7de35':'#a1c7de15';
      ctx.fillRect(x,y,i%6===0?1.5:1,1);
    }
    if(state.blend>0.01) {
      ctx.save();ctx.globalAlpha=state.blend;
      const board=[project(-weeks/2-.25,-3.7,-.08),project(weeks/2+.25,-3.7,-.08),project(weeks/2+.25,3.7,-.08),project(-weeks/2-.25,3.7,-.08)];
      path(board);ctx.fillStyle='#0b1513';ctx.fill();ctx.strokeStyle='#3a5348';ctx.lineWidth=1;ctx.stroke();
      for(let x=-weeks/2+.5;x<weeks/2;x++) {
        const a=project(x,-3.7,-.07),b=project(x,3.7,-.07);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#29403955';ctx.stroke();
      }
      ctx.restore();
    }
  }
  function draw() {
    fit(); background();
    const faces=[];
    const yaw=state.yaw*state.blend;
    days.forEach(day => {
      const x=day.week-(weeks-1)/2,z=day.row-3,h=columnHeight(day),s=.39;
      const b=[project(x-s,z-s,0),project(x+s,z-s,0),project(x+s,z+s,0),project(x-s,z+s,0)];
      const t=[project(x-s,z-s,h),project(x+s,z-s,h),project(x+s,z+s,h),project(x-s,z+s,h)];
      const color=colors[day.level];
      const add=(points,fill,top=false)=>faces.push({points,fill,index:day.index,top,depth:points.reduce((n,p)=>n+p.depth,0)/points.length});
      if(state.blend>0.001) {
        add([b[3],b[2],t[2],t[3]],shade(color,.63));
        if(yaw<0) add([b[0],b[3],t[3],t[0]],shade(color,.42));
        else if(yaw>0) add([b[2],b[1],t[1],t[2]],shade(color,.8));
      }
      add(t,color,true);
    });
    faces.sort((a,b)=>a.depth-b.depth);
    for(const face of faces) {
      path(face.points);ctx.fillStyle=face.fill;ctx.fill();
      ctx.lineWidth=.5;ctx.strokeStyle=face.top?'#b5ffd015':'#07131c50';ctx.stroke();
      if(face.index===state.hovered || face.index===state.selected) {
        ctx.strokeStyle=face.top?'#d4ffe4':'#a8ffd57a';ctx.lineWidth=face.top?1.7:.8;ctx.stroke();
      }
    }
    state.faces=faces;
    // Months and weekday markers move with the plane throughout the transformation.
    ctx.font=`${state.width<500?9:11}px ${getComputedStyle(root).fontFamily}`;ctx.fillStyle='#9bafc2';ctx.textAlign='left';
    let prior='';
    for (const day of days) {
      const month=day.date.slice(0,7);
      if(month!==prior) {
        prior=month;
        if(day.week>weeks-3) continue;
        const p=project(day.week-(weeks-1)/2,-4.6,0);
        ctx.fillText(new Date(day.date+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',timeZone:'UTC'}),p.x,p.y);
      }
    }
    if(state.blend<.3) {
      ctx.globalAlpha=1-state.blend/.3;ctx.textAlign='right';
      ['Mon','Wed','Fri'].forEach((label,i)=>{const p=project(-weeks/2-1, i*2-2,0);ctx.fillText(label,p.x,p.y+4)});
      ctx.globalAlpha=1;
    }
  }
  function schedule() { if(!frame) frame=requestAnimationFrame(tick); }
  function tick(now) {
    frame=0;
    if(state.animation) {
      const a=state.animation;
      const t=Math.min(1,(now-a.start)/a.duration);
      const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      state.blend=a.from+(a.to-a.from)*eased;
      if(t===1) {state.blend=a.to;state.animation=null;}
    }
    draw();
    if(state.animation) schedule();
  }
  function setView(target, instant=false) {
    clearTimeout(introTimer);state.target=target;
    tooltip.style.display='none';state.hovered=-1;
    root.querySelector('#top-view').setAttribute('aria-pressed',String(target===0));
    root.querySelector('#landscape-view').setAttribute('aria-pressed',String(target===1));
    root.querySelector('#scene-hint').textContent=target?'Drag to orbit · Hover a day to explore':'Hover a day to explore';
    root.querySelector('#view-name').textContent=target?'Height = daily contributions':'The familiar view';
    canvas.style.touchAction=target?'none':'pan-y';
    if(motion.matches || instant) {state.blend=target;state.animation=null;}
    else state.animation={from:state.blend,to:target,start:performance.now(),duration:1800};
    schedule();
  }
  function replay() {
    state.yaw=-.23;state.pitch=.66;state.selected=-1;
    setView(0,true);
    if(!motion.matches) introTimer=setTimeout(()=>setView(1),850);
  }
  function contains(points,x,y) {
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++) {
      const a=points[i],b=points[j];
      if(((a.y>y)!==(b.y>y)) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x) inside=!inside;
    }
    return inside;
  }
  function hitTest(x,y) {
    for(let i=state.faces.length-1;i>=0;i--) if(contains(state.faces[i].points,x,y)) return state.faces[i].index;
    return -1;
  }
  function updateHover(event) {
    const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;
    const index=hitTest(x,y);
    canvas.style.cursor=state.target?'grab':index>=0?'pointer':'default';
    if(index!==state.hovered) {state.hovered=index;if(index>=0) describe(index,'Exploring this day');schedule();}
    if(index<0) {tooltip.style.display='none';return;}
    const day=days[index];
    tooltip.replaceChildren();
    const strong=document.createElement('strong');strong.textContent=`${day.count} contribution${day.count===1?'':'s'}`;
    tooltip.append(strong,document.createTextNode(formatter.format(new Date(day.date+'T00:00:00Z'))));
    tooltip.style.display='block';
    tooltip.style.left=Math.max(6,Math.min(state.width-tooltip.offsetWidth-6,x+14))+'px';
    tooltip.style.top=Math.max(4,y-tooltip.offsetHeight-14)+'px';
  }
  listen(canvas, 'pointerdown',event=>{
    clearTimeout(introTimer);
    if(state.target && event.button===0) {canvas.setPointerCapture(event.pointerId);drag={x:event.clientX,y:event.clientY,yaw:state.yaw,pitch:state.pitch,moved:false};}
  });
  listen(canvas, 'pointermove',event=>{
    if(drag) {
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>4) drag.moved=true;
      if(drag.moved) {
        state.yaw=Math.max(-.85,Math.min(.85,drag.yaw+(event.clientX-drag.x)*.003));
        state.pitch=Math.max(.3,Math.min(1.15,drag.pitch+(event.clientY-drag.y)*.003));
        canvas.style.cursor='grabbing';tooltip.style.display='none';state.hovered=-1;schedule();return;
      }
    }
    updateHover(event);
  });
  listen(canvas, 'pointerup',event=>{
    suppressClick=Boolean(drag?.moved);drag=null;
    if(canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if(!suppressClick) updateHover(event);
    canvas.style.cursor=state.target?'grab':'default';
  });
  listen(canvas, 'pointercancel',()=>{drag=null;tooltip.style.display='none';});
  listen(canvas, 'pointerleave',()=>{if(!drag){state.hovered=-1;tooltip.style.display='none';schedule();}});
  listen(canvas, 'click',event=>{if(suppressClick){suppressClick=false;return;}const r=canvas.getBoundingClientRect();state.selected=hitTest(event.clientX-r.left,event.clientY-r.top);if(state.selected>=0)describe(state.selected);schedule();});
  listen(canvas, 'keydown',event=>{
    if(event.key==='1') {setView(0);return;}if(event.key==='2') {setView(1);return;}if(event.key.toLowerCase()==='r') {replay();return;}
    const step={ArrowLeft:-7,ArrowRight:7,ArrowUp:-1,ArrowDown:1}[event.key];
    if(step!==undefined) {event.preventDefault();clearTimeout(introTimer);state.selected=Math.max(0,Math.min(days.length-1,(state.selected<0?peakIndex:state.selected)+step));describe(state.selected);schedule();}
    if(event.key==='Escape') {state.selected=-1;tooltip.style.display='none';schedule();}
  });
  listen(root.querySelector('#top-view'), 'click',()=>setView(0));
  listen(root.querySelector('#landscape-view'), 'click',()=>setView(1));
  listen(root.querySelector('#replay'), 'click',replay);
  listen(root.querySelector('#height-scale'), 'input',event=>{clearTimeout(introTimer);state.height=Number(event.target.value);root.querySelector('#height-value').value=state.height.toFixed(1)+'×';schedule();});
  listen(root.querySelector('#reset-camera'), 'click',()=>{state.yaw=-.23;state.pitch=.66;schedule();});
  listen(root.querySelector('#show-peak'), 'click',()=>{state.selected=peakIndex;describe(peakIndex,'The highest point');setView(1);});
  listen(motion, 'change',()=>{if(motion.matches){clearTimeout(introTimer);state.animation=null;state.blend=state.target;schedule();}});
  function resize() {
    const rect=scene.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
    state.width=rect.width;state.canvasHeight=rect.height;
    canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);schedule();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(scene);
  resize();
  if(!motion.matches) introTimer=setTimeout(()=>setView(1),1400);
  return () => {
    clearTimeout(introTimer);
    cancelAnimationFrame(frame);
    controller.abort();
    observer.disconnect();
  };
}
