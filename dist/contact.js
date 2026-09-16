
(()=>{
 const root=document.getElementById('kontakt');
 let method='Poziv', app='Viber';
 const phone=root.querySelector('[name=phone]'), emailInput=root.querySelector('[name=email]'), country=root.querySelector('[name=country]');
 const examples={'Kuća / stan':'Npr. dubinsko pranje ugaone garniture i dva tepiha.','Zgrada':'Npr. redovno održavanje ulaza i stepeništa zgrade sa pet spratova.','Poslovni prostor':'Npr. redovno čišćenje kancelarije od oko 100 m².'};
 root.querySelectorAll('[data-space]').forEach(button=>button.addEventListener('click',()=>{
  root.querySelectorAll('[data-space]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  root.querySelector('textarea').placeholder=examples[button.dataset.space];
 }));
 const spaces={dom:'Kuća / stan',zgrade:'Zgrada',posao:'Poslovni prostor'};
 document.querySelectorAll('.services-rail .space-option').forEach(button=>button.addEventListener('click',()=>{
  const target=[...root.querySelectorAll('[data-space]')].find(item=>item.dataset.space===spaces[button.dataset.space]);
  target?.click();
 }));
 phone.addEventListener('input',()=>phone.setCustomValidity(''));
 root.querySelectorAll('[data-method]').forEach(button=>button.addEventListener('click',()=>{
  method=button.dataset.method;
  root.querySelectorAll('[data-method]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  const email=method==='Email';
  root.querySelector('[data-phone]').hidden=email;root.querySelector('[data-email]').hidden=!email;
  phone.disabled=email;phone.required=!email;emailInput.disabled=!email;emailInput.required=email;
  root.querySelector('.fc-apps').hidden=method!=='Poruka';
 }));
 root.querySelectorAll('[data-app]').forEach(button=>button.addEventListener('click',()=>{app=button.dataset.app;root.querySelectorAll('[data-app]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));}));
 country.addEventListener('change',()=>{const other=country.value==='other';phone.placeholder=other?'+44 7700 900000':'65 9564738';});
 const normalizePhone=()=>{let digits=phone.value.replace(/[^\d+]/g,'');if(!digits)return '';if(digits.startsWith('00'))digits='+'+digits.slice(2);if(digits.startsWith('+'))return digits;return country.value==='other'?digits:'+'+country.value+digits.replace(/^0/,'');};
 let photos=[];
 const fileInput=root.querySelector('#fc-files'), error=root.querySelector('.fc-error'), thumbs=root.querySelector('.fc-thumbs');
 root.querySelector('.fc-attach').addEventListener('click',()=>fileInput.click());
 const showPhotos=()=>{thumbs.replaceChildren();photos.forEach((photo,index)=>{const frame=document.createElement('div');frame.className='fc-thumb';const img=document.createElement('img');img.src=photo.url;img.alt=photo.file.name;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Ukloni '+photo.file.name);remove.addEventListener('click',()=>{URL.revokeObjectURL(photo.url);photos.splice(index,1);showPhotos();});frame.append(img,remove);thumbs.append(frame);});};
 fileInput.addEventListener('change',()=>{const errors=[];for(const file of fileInput.files){if(!['image/jpeg','image/png','image/webp'].includes(file.type)){errors.push('Izaberi JPG, PNG ili WebP fotografiju.');continue;}if(file.size>10*1024*1024){errors.push('Fotografija '+file.name+' prelazi 10 MB.');continue;}if(photos.length>=5){errors.push('Možeš dodati najviše 5 fotografija.');break;}photos.push({file,url:URL.createObjectURL(file)});}error.textContent=[...new Set(errors)].join(' ');error.hidden=!errors.length;fileInput.value='';showPhotos();});
 root.querySelector('form').addEventListener('submit',event=>{
  event.preventDefault();const status=root.querySelector('.fc-demo-result');status.hidden=false;
  const contact=method==='Email'?emailInput.value:normalizePhone();
  if(method!=='Email'&&!/^\+?[1-9]\d{6,14}$/.test(contact)){status.hidden=true;phone.setCustomValidity('Proveri broj telefona i pozivni broj države.');phone.reportValidity();return;}
  status.textContent='Demo — ništa nije poslato. Izabrani kontakt: '+(method==='Poruka'?app:method)+' · '+contact+'. Dodate fotografije: '+photos.length+'.';
 });

})();
