/* ============================================================================
   FLEKOUT — sekcija 05 "Kontakt"

   Izbori su dugmad (aria-pressed), pa ih forma sama ne bi poslala. Zato svaki
   izbor upisuje vrednost u skriveno polje: space, contact_method, app. Kad se
   forma poveže sa servisom, new FormData(form) već sadrži sve što treba.

   Slanje ide preko FormSubmit-a na flekout.clean@gmail.com (vidi dole).
   Fotografije se drže u nizu `photos` i dodaju se u upit pri slanju.
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

  /* --- slanje: FormSubmit šalje upit kao mejl na flekout.clean@gmail.com ---
     Bez naloga i ključa. Prvi upit stiže kao mejl za aktivaciju: neko sa
     pristupom tom inboksu mora jednom da klikne "Activate form", tek onda
     stižu upiti. Fotografije se pre slanja smanje (najviše 1600 px, JPEG),
     da ceo mejl ostane daleko ispod ograničenja Gmail-a. */
  const ENDPOINT = 'https://formsubmit.co/ajax/flekout.clean@gmail.com';
  const status = root.querySelector('.fc-status');
  const submit = form.querySelector('.fc-submit');
  const submitLabel = submit.textContent;

  const shrink = file => new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', .82);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });

  function say(text, kind, mailto) {
    status.textContent = text;
    if (mailto) {
      const link = document.createElement('a');
      link.href = mailto;
      link.className = 'fc-status-mail';
      link.textContent = 'pošaljite upit mejlom';
      status.append(' ', link, '.');
    }
    status.dataset.kind = kind;
    status.hidden = false;
  }

  /* Rezerva kad slanje ne uspe: mejl sa već popunjenim upitom, da se upit
     ne izgubi (fotografije posetilac dodaje sam). */
  const mailtoFor = fields => 'mailto:flekout.clean@gmail.com?subject=' +
    encodeURIComponent('Upit sa sajta: ' + fields.Prostor) + '&body=' +
    encodeURIComponent(Object.entries(fields).map(([k, v]) => k + ': ' + v).join('\n'));

  /* povratak posle slanja sa fotografijama */
  if (new URLSearchParams(location.search).get('upit') === 'poslat') {
    say('Hvala! Upit i fotografije su poslati. Javićemo Vam se što pre da dogovorimo procenu.', 'ok');
    history.replaceState(null, '', location.pathname);
    /* posle ekrana sa logom spusti stranicu tačno do poruke, da je posetilac vidi */
    const show = () => document.documentElement.classList.contains('is-loading')
      ? requestAnimationFrame(show)
      : requestAnimationFrame(() => status.scrollIntoView({ block: 'center' }));
    show();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.hidden = true;
    const contact = method === 'Email' ? emailInput.value.trim() : normalizePhone();
    if (method !== 'Email' && !/^\+?[1-9]\d{6,14}$/.test(contact)) {
      phone.setCustomValidity('Proverite broj telefona i pozivni broj države.');
      phone.setAttribute('aria-invalid', 'true');
      phone.reportValidity();
      return;
    }
    const data = new FormData(form);
    if (data.get('_honey')) return;

    const payload = new FormData();
    const fields = {
      'Prostor': data.get('space'),
      'Lokacija': data.get('location'),
      'Ime': data.get('name') || '-',
      'Opis': data.get('details'),
      'Način kontakta': data.get('app') ? 'Poruka (' + data.get('app') + ')' : method,
      [method === 'Email' ? 'Email' : 'Telefon']: contact,
      'Broj fotografija': String(photos.length)
    };
    payload.append('_subject', 'Novi upit sa sajta: ' + fields.Prostor);
    payload.append('_template', 'table');
    payload.append('_captcha', 'false');
    Object.entries(fields).forEach(([key, value]) => payload.append(key, value));
    if (method === 'Email') payload.append('_replyto', contact);

    let leaving = false;
    submit.disabled = true;
    submit.textContent = 'Šaljemo...';
    try {
      /* Sa fotografijama: FormSubmit prima priloge samo iz klasičnog slanja
         forme (AJAX ih odbacuje), pa šaljemo skrivenu formu i vraćamo se na
         sajt (?upit=poslat). Bez fotografija ostaje slanje bez napuštanja
         stranice. */
      if (photos.length && typeof DataTransfer === 'function') {
        const files = await Promise.all(photos.map(photo => shrink(photo.file)));
        const native = document.createElement('form');
        native.method = 'POST';
        native.action = ENDPOINT.replace('/ajax/', '/');
        native.enctype = 'multipart/form-data';
        native.hidden = true;
        const back = new URL(location.href);
        back.search = '?upit=poslat';
        back.hash = '';
        payload.append('_next', back.href);
        payload.forEach((value, key) => {
          const input = document.createElement('input');
          input.type = 'hidden'; input.name = key; input.value = value;
          native.append(input);
        });
        files.forEach((file, i) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.name = 'Fotografija ' + (i + 1);
          const list = new DataTransfer();
          list.items.add(file);
          input.files = list.files;
          native.append(input);
        });
        document.body.append(native);
        leaving = true;
        native.submit();
        return;
      }
      const response = await fetch(ENDPOINT, { method: 'POST', body: payload, headers: { Accept: 'application/json' } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) === 'false') throw new Error(result.message || response.status);
      say('Hvala! Upit je poslat. Javićemo Vam se što pre da dogovorimo procenu.', 'ok');
      form.reset();
      photos.splice(0).forEach(photo => URL.revokeObjectURL(photo.url));
      showPhotos();
      root.querySelector('[data-space="Kuća / stan"]').click();
      root.querySelector('[data-method="Poziv"]').click();
    } catch (error) {
      /* "This form needs Activation" = FormSubmit čeka klik na link u mejlu
         za aktivaciju na flekout.clean@gmail.com (samo prvi put). */
      console.warn('[Flekout forma] slanje nije uspelo:', error.message);
      say('Upit nije poslat. Pozovite nas na +381 61 2983645 ili', 'error', mailtoFor(fields));
    } finally {
      if (leaving) return;
      submit.disabled = false;
      submit.textContent = submitLabel;
    }
  });
})();
