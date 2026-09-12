/* Four approved services per space. Detailed user data in services.js is preserved. */
window.initializeServiceRail = function () {
 const section=document.querySelector('.services-rail');if(!section)return;
 const sticky=section.querySelector('.rail-sticky'),viewport=section.querySelector('.rail-window'),track=section.querySelector('.rail-track'),buttons=[...section.querySelectorAll('.space-option')],reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const groups=[
 {name:'Kuća / stan',items:[
 ['Dubinsko pranje','Nameštaj, dušeci, tepisi i druge meke podloge.','Nameštaj / Dušeci / Tepisi'],
 ['Mašinsko pranje podova','Čišćenje tvrdih podnih površina, uz postupak prilagođen materijalu.','Tvrde podne površine'],
 ['Pranje prozora i stakla','Pranje prozora, staklenih pregrada i drugih staklenih površina u domu.','Prozori / Pregrade / Staklo'],
 ['Generalno čišćenje','Kompletno čišćenje doma, prema dogovorenom obimu.','Kuhinja / Kupatilo / Prostorije']]},
 {name:'Zgrada',items:[
 ['Čišćenje ulaza i stepeništa','Čišćenje hodnika, stepenica, rukohvata i zajedničkih prostora.','Ulazi / Hodnici / Stepeništa'],
 ['Mašinsko pranje podova i garaža','Mašinsko čišćenje većih tvrdih površina u objektu.','Podovi / Garaže'],
 ['Pranje staklenih površina','Pranje staklenih ulaznih vrata, prozora i pregrada.','Ulazna vrata / Prozori / Pregrade'],
 ['Održavanje zajedničkih prostora','Redovno čišćenje po dogovorenom rasporedu i obimu rada.','Zajednički prostori / Redovno održavanje']]},
 {name:'Kancelarijski prostor',items:[
 ['Čišćenje kancelarija','Čišćenje radnih i zajedničkih prostorija poslovnog prostora.','Kancelarije / Zajedničke prostorije'],
 ['Dubinsko pranje nameštaja i tepiha','Dubinsko pranje kancelarijskih stolica, garnitura, tepiha i itisona.','Stolice / Garniture / Tepisi / Itisoni'],
 ['Mašinsko pranje podova','Mašinsko čišćenje tvrdih podnih površina poslovnog prostora.','Tvrde podne površine'],
 ['Pranje staklenih površina','Pranje prozora, staklenih pregrada i vrata.','Prozori / Pregrade / Vrata']]}
 ];
 let active=0,cinematic=false,pending=false,step=600,total=2400,top=110;
 const clamp=v=>Math.max(0,Math.min(1,v));
 function progress(slide){const i=Math.max(0,Math.min(3,Math.round(slide)));section.querySelector('.rail-position').textContent='0'+(i+1)+' / 04';section.querySelector('.rail-progress i').style.transform='scaleX('+((i+1)/4)+')';}
 function show(index){
  active=index;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  section.querySelector('#rail-scope').textContent=groups[index].name.toUpperCase();
  track.replaceChildren(...groups[index].items.map((item,i)=>{
   const card=document.createElement('article');card.className='rail-card';
   const number=document.createElement('span');number.className='rail-card-number';number.textContent='0'+(i+1);
   const heading=document.createElement('h3');heading.textContent=item[0];
   const description=document.createElement('p');description.textContent=item[1];
   const surfaces=document.createElement('p');surfaces.className='rail-surfaces';surfaces.textContent=item[2];
   card.append(number,heading,description,surfaces);return card;
  }));viewport.scrollLeft=0;progress(0);
 }
 function render(){
  pending=false;if(!cinematic){track.style.transform='none';return;}
  const position=Math.max(0,Math.min(total,top-section.getBoundingClientRect().top));
  const unit=position/step,index=Math.min(3,Math.floor(unit));
  // Reading hold followed by scroll-controlled transition. Last card holds before release.
  const slide=index+(index===3?0:clamp((unit-index-.58)/.42));
  track.style.transform='translate3d('+(-slide*viewport.clientWidth)+'px,0,0)';progress(slide);
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(render);}}
 function layout(){
  top=innerWidth<=800?96:110;section.style.setProperty('--rail-top',top+'px');
  section.classList.add('is-cinematic');
  cinematic=!reduced.matches&&sticky.offsetHeight<=innerHeight-top;
  section.classList.toggle('is-cinematic',cinematic);
  step=Math.max(420,innerHeight*.65);total=step*4;
  section.style.height=cinematic?(total+sticky.offsetHeight)+'px':'auto';
  viewport.scrollLeft=0;render();if(!cinematic)progress(0);
 }
 buttons.forEach((b,index)=>b.addEventListener('click',()=>{
  const sectionTop=scrollY+section.getBoundingClientRect().top,inside=section.getBoundingClientRect().top<=top;
  show(index);if(cinematic&&inside)scrollTo({top:sectionTop-top,behavior:'instant'});render();
 }));
 viewport.addEventListener('scroll',()=>{if(!cinematic)progress(viewport.scrollLeft/Math.max(1,viewport.clientWidth));},{passive:true});
 viewport.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
  const start=scrollY+section.getBoundingClientRect().top-top;
  const current=cinematic?Math.max(0,Math.min(3,Math.round((scrollY-start)/step))):Math.round(viewport.scrollLeft/viewport.clientWidth);
  const next=e.key==='Home'?0:e.key==='End'?3:Math.max(0,Math.min(3,current+(e.key==='ArrowRight'?1:-1)));
  if(cinematic)scrollTo({top:start+next*step,behavior:'instant'});
  else viewport.scrollTo({left:next*viewport.clientWidth,behavior:reduced.matches?'instant':'smooth'});
 });
 show(active);layout();addEventListener('scroll',schedule,{passive:true});addEventListener('resize',layout);reduced.addEventListener('change',layout);document.fonts.ready.then(layout);
};
