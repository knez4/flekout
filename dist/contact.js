/* ============================================================================
   FLEKOUT — sekcija 05 "Kontakt"

   Izbori su dugmad (aria-pressed), pa ih forma sama ne bi poslala. Zato svaki
   izbor upisuje vrednost u skriveno polje: space, contact_method, app. Kad se
   forma poveže sa servisom, new FormData(form) već sadrži sve što treba.

   NAPOMENA ZA PRODUKCIJU: slanje nije povezano — submit samo prikazuje šta
   bi bilo poslato. Fotografije se drže u nizu `photos` i nisu u FormData.
============================================================================ */
(() => {
  const root = document.getElementById('kontakt');
  if (!root) return;

  const form = root.querySelector('form');
  const phone = form.elements.phone;
  const emailInput = form.elements.email;
  const country = form.elements.country;
  const spaceField = form.elements.space;
  const methodField = form.elements.contact_method;
  const appField = form.elements.app;
  let method = 'Poziv';

  const examples = {
    'Kuća / stan': 'Npr. dubinsko pranje ugaone garniture i dva tepiha.',
    'Zgrada': 'Npr. redovno održavanje ulaza i stepeništa zgrade sa pet spratova.',
    'Kancelarijski prostor': 'Npr. redovno čišćenje kancelarije od oko 100 m².'
  };

  const press = (selector, active) =>
    root.querySelectorAll(selector).forEach(item => item.setAttribute('aria-pressed', String(item === active)));

  /* --- prostor --- */
  root.querySelectorAll('[data-space]').forEach(button => button.addEventListener('click', () => {
    press('[data-space]', button);
    spaceField.value = button.dataset.space;
    form.elements.details.placeholder = examples[button.dataset.space];
  }));

  /* Izbor prostora u "Naše usluge" se prenosi i ovde. */
  const spaces = { dom: 'Kuća / stan', zgrade: 'Zgrada', posao: 'Kancelarijski prostor' };
  document.querySelectorAll('.services-rail .space-option').forEach(button => button.addEventListener('click', () => {
    root.querySelector(`[data-space="${spaces[button.dataset.space]}"]`)?.click();
  }));

  /* --- način kontakta --- */
  root.querySelectorAll('[data-method]').forEach(button => button.addEventListener('click', () => {
    method = button.dataset.method;
    press('[data-method]', button);
    methodField.value = method;
    const email = method === 'Email';
    root.querySelector('[data-phone]').hidden = email;
    root.querySelector('[data-email]').hidden = !email;
    phone.disabled = email; phone.required = !email;
    emailInput.disabled = !email; emailInput.required = email;
    root.querySelector('.fc-apps').hidden = method !== 'Poruka';
    /* aplikacija ide u podatke samo kad je izabrana poruka */
    appField.disabled = method !== 'Poruka';
    if (!appField.disabled && !appField.value) appField.value = 'Viber';
  }));

  root.querySelectorAll('[data-app]').forEach(button => button.addEventListener('click', () => {
    press('[data-app]', button);
    appField.value = button.dataset.app;
  }));

  /* --- telefon --- */
  country.addEventListener('change', () => {
    phone.placeholder = country.value === 'other' ? '+44 7700 900000' : '65 9564738';
  });
  phone.addEventListener('input', () => { phone.setCustomValidity(''); phone.removeAttribute('aria-invalid'); });

  const normalizePhone = () => {
    let digits = phone.value.replace(/[^\d+]/g, '');
    if (!digits) return '';
    if (digits.startsWith('00')) digits = '+' + digits.slice(2);
    if (digits.startsWith('+')) return digits;
    return country.value === 'other' ? digits : '+' + country.value + digits.replace(/^0/, '');
  };

  /* --- fotografije --- */
  const photos = [];
  const fileInput = root.querySelector('#fc-files');
  const error = root.querySelector('.fc-error');
  const thumbs = root.querySelector('.fc-thumbs');
  root.querySelector('.fc-attach').addEventListener('click', () => fileInput.click());

  function showPhotos() {
    thumbs.replaceChildren(...photos.map((photo, index) => {
      const frame = document.createElement('div');
      frame.className = 'fc-thumb';
      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.file.name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Uklonite ' + photo.file.name);
      remove.addEventListener('click', () => {
        URL.revokeObjectURL(photo.url);
        photos.splice(index, 1);
        showPhotos();
      });
      frame.append(img, remove);
      return frame;
    }));
  }

  fileInput.addEventListener('change', () => {
    const errors = [];
    for (const file of fileInput.files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { errors.push('Izaberite JPG, PNG ili WebP fotografiju.'); continue; }
      if (file.size > 10 * 1024 * 1024) { errors.push('Fotografija ' + file.name + ' prelazi 10 MB.'); continue; }
      if (photos.length >= 5) { errors.push('Možete dodati najviše 5 fotografija.'); break; }
      photos.push({ file, url: URL.createObjectURL(file) });
    }
    error.textContent = [...new Set(errors)].join(' ');
    error.hidden = !errors.length;
    fileInput.value = '';
    showPhotos();
  });

  /* --- slanje (demo) --- */
  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = root.querySelector('.fc-demo-result');
    status.hidden = true;
    const contact = method === 'Email' ? emailInput.value.trim() : normalizePhone();
    if (method !== 'Email' && !/^\+?[1-9]\d{6,14}$/.test(contact)) {
      phone.setCustomValidity('Proverite broj telefona i pozivni broj države.');
      phone.setAttribute('aria-invalid', 'true');
      phone.reportValidity();
      return;
    }
    const data = new FormData(form);
    status.textContent =
      'Probni prikaz, ništa nije poslato. Prostor: ' + data.get('space') +
      '. Kontakt: ' + (data.get('app') || data.get('contact_method')) + ', ' + contact +
      '. Fotografija: ' + photos.length + '.';
    status.hidden = false;
  });
})();
