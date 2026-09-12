const journey=document.querySelector('.journey'),stage=document.querySelector('.stage'),svg=document.querySelector('.portal'),word=document.querySelector('#word'),swept=document.querySelector('#swept-rect'),unswept=document.querySelector('#unswept-rect'),header=document.querySelector('header'),video=document.querySelector('video'),toggle=document.querySelector('#video-toggle'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let width=0,height=0,queued=false,manuallyPaused=false,visible=true;
const clamp=v=>Math.max(0,Math.min(1,v));
function render(){queued=false;const p=reduced.matches?0:clamp(-journey.getBoundingClientRect().top/Math.max(1,journey.offsetHeight-height));const sweep=clamp((p-.06)/.76),edge=width*(1-sweep);swept.setAttribute('x',edge);swept.setAttribute('width',width-edge);unswept.setAttribute('width',edge);const gray=Math.round(255-25*sweep);header.style.backgroundColor=`rgb(${gray} ${gray} ${gray})`;document.querySelector('.intro-meta').style.opacity=1-clamp(sweep*5);document.querySelector('.hero-bottom').classList.toggle('dark',sweep>.98);}
function resize(){width=stage.clientWidth;height=stage.clientHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);const logoWidth=width*.94,logoHeight=logoWidth*449/2048;document.querySelectorAll('.hero-logo').forEach(logo=>{logo.setAttribute('x',width*.03);logo.setAttribute('y',height*.52-logoHeight/2);logo.setAttribute('width',logoWidth);logo.setAttribute('height',logoHeight);});document.querySelectorAll('.canvas').forEach(r=>{r.setAttribute('width',width);r.setAttribute('height',height);});[swept,unswept].forEach(r=>r.setAttribute('height',height));const m=document.querySelector('#letter-mask');m.setAttribute('x',0);m.setAttribute('y',0);m.setAttribute('width',width);m.setAttribute('height',height);render();}
function schedule(){if(!queued){queued=true;requestAnimationFrame(render);}}
function label(){toggle.textContent=video.paused?'Pokreni video ▷':'Pauziraj video Ⅱ';toggle.setAttribute('aria-label',video.paused?'Pokreni video':'Pauziraj video');}
function playback(){if(manuallyPaused||reduced.matches||!visible||document.hidden)video.pause();else video.play().catch(label);label();}
toggle.addEventListener('click',()=>{if(video.paused){manuallyPaused=false;video.play().catch(label);}else{manuallyPaused=true;video.pause();}});
video.addEventListener('play',label);video.addEventListener('pause',label);video.addEventListener('error',()=>{toggle.textContent='Video nije dostupan';toggle.disabled=true;});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;playback();}).observe(stage);
document.addEventListener('visibilitychange',playback);reduced.addEventListener('change',()=>{resize();playback();});addEventListener('scroll',schedule,{passive:true});new ResizeObserver(resize).observe(stage);resize();playback();
const dialog=document.querySelector('#contact-dialog');document.querySelector('#open-contact').addEventListener('click',()=>dialog.showModal());dialog.querySelectorAll('.close,.dialog-done').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});document.querySelector('#replay').addEventListener('click',()=>scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));

const services=[
{image:'service-floors.jpg',alt:'Mašinsko čišćenje poda u svetloj kancelariji',title:'Čistoća od poda.',description:'Mašinsko pranje tvrdih podloga, sa postupkom prilagođenim površini i stepenu zaprljanosti.',label:'podove'},
{image:'service-furniture.jpg',alt:'Dubinsko pranje tapaciranog nameštaja',title:'Svežina koja se oseća.',description:'Dubinsko pranje nameštaja, tepiha i drugih mekih podloga. Pažljivo, u skladu sa materijalom.',label:'nameštaj i tepihe'},
{image:'service-glass.jpg',alt:'Čišćenje staklene pregrade plavom krpom',title:'Više svetla. Manje tragova.',description:'Pranje prozora, izloga i staklenih pregrada — za jasniji pogled i uredniji prostor.',label:'staklene površine'},
{image:'service-space.jpg',alt:'Uredna moderna kancelarija u neutralnim tonovima',title:'Prostor spreman za svaki dan.',description:'Čišćenje kuća, stanova, poslovnih prostora i zgrada. Obim rada dogovaramo prema tvojim potrebama.',label:'ceo prostor'}
];
const tabs=[...document.querySelectorAll('.service-tab')],panel=document.querySelector('#service-panel'),photo=document.querySelector('#service-image');
let selection=0;
async function selectService(index){
selection=index;const service=services[index];
tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
panel.setAttribute('aria-labelledby',tabs[index].id);
document.querySelector('#service-title').textContent=service.title;
document.querySelector('#service-description').textContent=service.description;
document.querySelector('.photo-count').textContent=`0${index+1} / 04`;
document.querySelector('.service-cta').setAttribute('aria-label',`Zatraži procenu za ${service.label}`);
const next=new Image();next.src=service.image;
try{await next.decode();}catch{if(selection===index){photo.src=service.image;photo.alt=service.alt;}return;}
if(selection!==index)return;
photo.src=service.image;photo.alt=service.alt;
if(!reduced.matches)photo.animate([{clipPath:'inset(0 100% 0 0)',transform:'scale(1.025)'},{clipPath:'inset(0 0 0 0)',transform:'scale(1)'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});
}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectService(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();selectService(next);});});
