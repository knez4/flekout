const journey=document.querySelector('.journey'),stage=document.querySelector('.stage'),svg=document.querySelector('.portal'),swept=document.querySelector('#swept-rect'),unswept=document.querySelector('#unswept-rect'),header=document.querySelector('header'),video=document.querySelector('video'),toggle=document.querySelector('#video-toggle'),copy=document.querySelector('.hero-copy'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,queued=false,manuallyPaused=false,visible=true;
const clamp=v=>Math.max(0,Math.min(1,v));
function render(){queued=false;const p=reduced.matches?0:clamp(-journey.getBoundingClientRect().top/Math.max(1,journey.offsetHeight-height));const sweep=clamp((p-.06)/.76),edge=width*(1-sweep);swept.setAttribute('x',edge);swept.setAttribute('width',width-edge);unswept.setAttribute('width',edge);const gray=Math.round(255-25*sweep);header.style.backgroundColor=`rgb(${gray} ${gray} ${gray})`;const fade=1-clamp(sweep*4);copy.style.opacity=fade;copy.style.visibility=fade<.02?'hidden':'visible';stage.style.setProperty('--scrim',fade.toFixed(3));document.querySelector('.hero-bottom').classList.toggle('dark',sweep>.98);}
function resize(){width=stage.clientWidth;height=stage.clientHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);const logoWidth=width*.94,logoHeight=logoWidth*449/2048;document.querySelectorAll('.hero-logo').forEach(logo=>{logo.setAttribute('x',width*.03);logo.setAttribute('y',height*.52-logoHeight/2);logo.setAttribute('width',logoWidth);logo.setAttribute('height',logoHeight);});document.querySelectorAll('.canvas').forEach(r=>{r.setAttribute('width',width);r.setAttribute('height',height);});[swept,unswept].forEach(r=>r.setAttribute('height',height));const m=document.querySelector('#letter-mask');m.setAttribute('x',0);m.setAttribute('y',0);m.setAttribute('width',width);m.setAttribute('height',height);render();}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
function label(){if(!toggle)return;toggle.textContent=video.paused?'Pokreni video ▷':'Pauziraj video Ⅱ';toggle.setAttribute('aria-label',video.paused?'Pokreni video':'Pauziraj video');}
function playback(){if(manuallyPaused||reduced.matches||!visible||document.hidden)video.pause();else video.play().catch(label);label();}
toggle?.addEventListener('click',()=>{if(video.paused){manuallyPaused=false;video.play().catch(label);}else{manuallyPaused=true;video.pause();}});
video.addEventListener('play',label);video.addEventListener('pause',label);video.addEventListener('error',()=>{if(toggle){toggle.textContent='Video nije dostupan';toggle.disabled=true;}});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback();}).observe(stage);
document.addEventListener('visibilitychange',playback);reduced.addEventListener('change',()=>{resize();playback();});addEventListener('scroll',schedule,{passive:true});new ResizeObserver(resize).observe(stage);resize();playback();
/* Navigacija: link sekcije koja je trenutno na sredini ekrana dobija aria-current. */
(()=>{
  const links=[...document.querySelectorAll('nav a[href^="#"]:not([data-open-prices])')];
  const targets=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const seen=new Set();
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>e.isIntersecting?seen.add(e.target):seen.delete(e.target));
    const current=targets.find(t=>seen.has(t));
    links.forEach(a=>a.setAttribute('aria-current',String(!!current&&a.getAttribute('href')==='#'+current.id)));
  },{rootMargin:'-45% 0px -50% 0px'});
  targets.forEach(t=>io.observe(t));
})();
/* Plutajuće "Pozovi" (samo telefon, vidi style.css): vidljivo posle heroja,
   skriveno dok su na ekranu usluge, forma ili futer. */
(()=>{
  const fab=document.querySelector('.call-fab');if(!fab)return;
  const blockers=['.journey','.services-rail','#kontakt','.site-foot'].map(s=>document.querySelector(s)).filter(Boolean);
  const seen=new Set();
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>e.isIntersecting?seen.add(e.target):seen.delete(e.target));
    fab.classList.toggle('is-visible',seen.size===0);
  },{rootMargin:'0px 0px -12% 0px'});
  blockers.forEach(b=>io.observe(b));
})();
