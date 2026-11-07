(() => {
  'use strict';
  const stage=document.querySelector('#stage'), tile=document.querySelector('#tile'), fragment=document.querySelector('#fragment'), head=document.querySelector('#head'), copy=document.querySelector('#copy'), rule=document.querySelector('.rule-two');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sources=[
    {key:'book',crop:[.52,.06,.46,.87],threshold:116,invert:true,width:190},
    {key:'front',crop:[.025,.01,.95,.98],threshold:130,width:120},
    {key:'back',crop:[.03,.02,.94,.96],threshold:132,width:160},
    {key:'face',crop:[.185,.045,.49,.42],threshold:136,width:118,clearEdgeWhite:true},
    {key:'hand',crop:[.05,.015,.9,.97],threshold:179,width:155},
    {key:'profile',crop:[.13,.14,.75,.79],threshold:122,width:128},
    {key:'textface',crop:[.1,.04,.8,.94],threshold:144,width:180}
  ];
  const images=new Map(), buffers=new Map();
  let leftIndex=0, topIndex=0, rightIndex=0, phase=0, elapsed=0, last=0, lastPaint=0, paused=reduced, ready=false;
  const leftSlots=[0,4,6,1], topSlots=[2,1,4], rightSlots=[3,5,4,6];
  let menuOpen = false;
  const menu = document.querySelector('#process-menu');
  const load=(key,src)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images.set(key,im);resolve()};im.onerror=()=>reject(new Error('Image unavailable: '+key));im.src=src});
  function prepare(spec){
    const im=images.get(spec.key), [x,y,w,h]=spec.crop, canvas=document.createElement('canvas');
    canvas.width=spec.width;canvas.height=Math.round(canvas.width*(im.naturalHeight*h)/(im.naturalWidth*w));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(im,x*im.naturalWidth,y*im.naturalHeight,w*im.naturalWidth,h*im.naturalHeight,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    for(let i=0;i<pixels.data.length;i+=4){
      const gray=.2126*pixels.data[i]+.7152*pixels.data[i+1]+.0722*pixels.data[i+2];
      let value=gray>=spec.threshold?255:0;if(spec.invert)value=255-value;
      pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;pixels.data[i+3]=255;
    }
    if(spec.clearEdgeWhite){
      // Remove the surrounding pale postcard paper, retaining the enclosed face.
      const seen=new Uint8Array(canvas.width*canvas.height),queue=[];
      const add=(x,y)=>{const n=y*canvas.width+x;if(x<0||y<0||x>=canvas.width||y>=canvas.height||seen[n]||pixels.data[n*4]!==255)return;seen[n]=1;queue.push(n);};
      for(let x=0;x<canvas.width;x++){add(x,0);add(x,canvas.height-1)}for(let y=0;y<canvas.height;y++){add(0,y);add(canvas.width-1,y)}
      for(let i=0;i<queue.length;i++){const n=queue[i],x=n%canvas.width,y=Math.floor(n/canvas.width);pixels.data[n*4]=pixels.data[n*4+1]=pixels.data[n*4+2]=0;add(x-1,y);add(x+1,y);add(x,y-1);add(x,y+1)}
    }
    ctx.putImageData(pixels,0,0);buffers.set(spec.key,canvas);
  }
  function paint(button,index,glitch=false){
    const base=buffers.get(sources[index].key), canvas=button.querySelector('canvas');
    if(canvas.width!==base.width||canvas.height!==base.height){canvas.width=base.width;canvas.height=base.height;}
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0);
    if(glitch){
      // Displace a few horizontal scanline strips; most of the image stays still.
      for(let i=0;i<5;i++){
        const y=Math.floor(Math.random()*base.height),h=1+Math.floor(Math.random()*4),dx=Math.floor((Math.random()-.5)*16);
        ctx.fillRect(0,y,canvas.width,h);ctx.drawImage(base,0,y,base.width,Math.min(h,base.height-y),dx,y,base.width,Math.min(h,base.height-y));
      }
    }
  }
  function setPhase(next){
    phase=next;stage.dataset.phase=['opening','question','forget'][phase];rule.hidden=phase===0;copy.hidden=phase===0;
    if(phase){
      copy.innerHTML = '<button type="button" data-menu="want"><span>What</span><span>you</span><span>want?</span></button><span class="gap" aria-hidden="true"></span><button type="button" data-menu="who"><span>Who</span><span>are</span><span>you?</span></button>';
    }
    // Leave a brief empty right column when the question first appears.
    head.hidden=phase===1&&elapsed<7400;
  }
  function repaint(glitch=false){if(!ready)return;paint(tile,topSlots[topIndex]);paint(fragment,leftSlots[leftIndex]);paint(head,rightSlots[rightIndex],glitch);}
  function advance(){if(!ready)return;elapsed=phase===0?5000:phase===1?11200:0;setPhase((phase+1)%3);repaint();}
  tile.addEventListener('click',()=>{if(!ready)return;topIndex=(topIndex+1)%topSlots.length;repaint();});
  fragment.addEventListener('click',()=>{if(!ready)return;leftIndex=(leftIndex+1)%leftSlots.length;repaint();});
  head.addEventListener('click',()=>{if(!ready)return;rightIndex=(rightIndex+1)%rightSlots.length;repaint(!reduced);});
  function closeMenu() {
    menu.hidden = true;
    menuOpen = false;
    copy.querySelectorAll('button').forEach(button => button.setAttribute('aria-expanded', 'false'));
  }
  function randomLink(paths) {
    return paths[Math.floor(Math.random() * paths.length)];
  }
  copy.addEventListener('click', event => {
    const button = event.target.closest('[data-menu]');
    if (!button) return;
    const kind = button.dataset.menu;
    if (menuOpen && menu.dataset.kind === kind) { closeMenu(); return; }
    menuOpen = true;
    menu.dataset.kind = kind;
    menu.hidden = false;
    copy.querySelectorAll('button').forEach(item => item.setAttribute('aria-expanded', String(item === button))); 
    menu.innerHTML = kind === 'want'
      ? '<a href="' + window.LPPP.localURL('diary/index.html') + '">DIARY</a><a href="#" data-random="demo">DEMO</a><a href="#" data-random="works">WORKS</a>'
      : '<button type="button" data-forget>FORGET</button><a href="' + window.LPPP.localURL('admin/diary.html') + '">DROP SHIT</a>';
  });
  menu.addEventListener('click', event => {
    const target = event.target.closest('[data-random], [data-forget]');
    if (!target) return;
    event.preventDefault();
    if (target.hasAttribute('data-forget')) { closeMenu(); window.LPPP.showASCII(); return; }
    const settings = window.LPPP_CATALOG.settings;
    const destinations = target.dataset.random === 'demo'
      ? [settings.demoBandcamp, settings.demoSoundcloud].map(window.LPPP.safeURL).filter(Boolean)
      : ['crimes/index.html', 'sedition/index.html'].map(path => window.LPPP.localURL(path));
    if (destinations.length) location.href = randomLink(destinations);
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('keydown',event=>{if(event.code==='Space'&&!/BUTTON|INPUT/.test(event.target.tagName)){event.preventDefault();paused=!paused;}if(event.key==='ArrowRight'&&!menuOpen)advance();});
  document.addEventListener('visibilitychange',()=>{last=0});
  function tick(now){
    if(!last)last=now;const delta=now-last;last=now;
    if(ready&&!paused&&!document.hidden&&!menuOpen){
      elapsed=(elapsed+Math.min(delta,100))%20500;
      const next=elapsed<5000?0:elapsed<11200?1:2;
      if(next!==phase)setPhase(next);
      if(phase===1&&elapsed>=7400)head.hidden=false;
      if(now-lastPaint>145){paint(head,rightSlots[rightIndex],phase===0&&Math.random()<.8);lastPaint=now;}
    }
    requestAnimationFrame(tick);
  }
  Promise.all(Object.entries(window.STUDY_IMAGES).map(([key,src])=>load(key,src))).then(()=>{
    sources.forEach(prepare);ready=true;setPhase(0);repaint(!reduced);requestAnimationFrame(tick);
  }).catch(error=>{stage.setAttribute('aria-label',error.message);console.error(error)});
})();
