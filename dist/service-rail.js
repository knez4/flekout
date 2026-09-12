/* Presentation only: SERVICES remains owned by services.js. */
window.initializeServiceRail = function (services) {
  const section = document.querySelector('.services-rail');
  if (!section) return;
  const sticky = section.querySelector('.rail-sticky');
  const viewport = section.querySelector('.rail-window');
  const track = section.querySelector('.rail-track');
  const buttons = [...section.querySelectorAll('.space-option')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 801px) and (min-height: 740px)');
  const groups = [
    {id:'dom', name:'Kuća / stan'},
    {id:'zgrade', name:'Zgrada'},
    {id:'posao', name:'Kancelarijski prostor'}
  ].map(group => ({...group, items:services.filter(item => item.scopes.includes(group.id))}));
  let active = -1, segments = [], total = 0, pending = false;
  const bounded = value => Math.max(0,Math.min(1,value));
  const cinematic = () => desktop.matches && !reduced.matches;
  function show(index) {
    if (active === index) return;
    active = index;
    const group = groups[index];
    buttons.forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
    section.querySelector('#rail-scope').textContent = group.name.toUpperCase();
    track.replaceChildren(...group.items.map((service,i) => {
      const card = document.createElement('article');
      card.className = 'rail-card';
      const number = document.createElement('span');
      number.className = 'rail-card-number';
      number.textContent = String(i+1).padStart(2,'0');
      const heading = document.createElement('h3');
      heading.textContent = service.name;
      const sub = document.createElement('p');
      sub.textContent = service.sub;
      const surfaces = document.createElement('p');
      surfaces.className = 'rail-surfaces';
      surfaces.textContent = service.surfaces.join(' / ');
      card.append(number,heading,sub,surfaces);
      return card;
    }));
    viewport.scrollLeft = 0;
  }
  function progress(value) {
    const count = groups[active].items.length;
    section.querySelector('.rail-position').textContent = String(Math.min(count,1+Math.floor(value*(count-1)+.001))).padStart(2,'0')+' / '+String(count).padStart(2,'0');
    section.querySelector('.rail-progress i').style.transform = 'scaleX('+Math.max(1/count,value)+')';
  }
  function render() {
    pending = false;
    if (!cinematic()) {track.style.transform='none';return;}
    const position = Math.max(0,Math.min(total,-section.getBoundingClientRect().top+110));
    const index = Math.max(0,segments.findIndex((s,i) => position<s.end || i===segments.length-1));
    show(index);
    const segment = segments[index];
    const p = bounded((position-segment.start-160)/segment.travel);
    const distance = Math.max(0,track.scrollWidth-viewport.clientWidth);
    track.style.transform = 'translate3d('+(-distance*p)+'px,0,0)';
    progress(p);
  }
  function schedule() {if(!pending){pending=true;requestAnimationFrame(render);}}
  function layout() {
    section.classList.toggle('is-cinematic',cinematic());
    const cardWidth = Math.min(360,viewport.clientWidth*.34);
    const gap = 28;
    let start = 0;
    segments = groups.map(group => {
      const travel = Math.max(480,group.items.length*(cardWidth+gap)-gap-viewport.clientWidth);
      const segment = {start,travel,end:start+travel+320};
      start = segment.end;
      return segment;
    });
    total = start;
    section.style.height = cinematic() ? (total+sticky.offsetHeight)+'px' : 'auto';
    if (!cinematic()) {
      show(Math.max(active,0));
      track.style.transform='none';
      progress(0);
      section.querySelector('.rail-instruction').textContent='Prevuci za još usluga →';
    } else {
      section.querySelector('.rail-instruction').textContent='Skroluj i istraži ↘';
      render();
    }
  }
  buttons.forEach((button,index) => button.addEventListener('click',() => {
    if(cinematic()) {
      const top = scrollY+section.getBoundingClientRect().top;
      // Immediate jump prevents scrolling through unrelated groups after a click.
      scrollTo({top:top+segments[index].start-110,behavior:'instant'});
      show(index);render();
    } else {show(index);progress(0);}
  }));
  viewport.addEventListener('scroll',() => {
    if(!cinematic())progress(bounded(viewport.scrollLeft/Math.max(1,track.scrollWidth-viewport.clientWidth)));
  },{passive:true});
  viewport.addEventListener('keydown',event => {
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    if(cinematic()){
      const segment=segments[active];
      const top=scrollY+section.getBoundingClientRect().top-110;
      const target=event.key==='Home'?top+segment.start:event.key==='End'?top+segment.end-1:scrollY+(event.key==='ArrowRight'?330:-330);
      scrollTo({top:Math.max(top,Math.min(top+total,target)),behavior:'instant'});
    }else{
      const target=event.key==='Home'?0:event.key==='End'?track.scrollWidth:viewport.scrollLeft+(event.key==='ArrowRight'?300:-300);
      viewport.scrollTo({left:target,behavior:reduced.matches?'instant':'smooth'});
    }
  });
  show(0);layout();
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',layout);
  reduced.addEventListener('change',layout);
  document.fonts.ready.then(layout);
};
