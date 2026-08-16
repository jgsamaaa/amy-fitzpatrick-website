(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? 'Close' : 'Menu';
    });
  }

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      document.querySelectorAll('.project-card').forEach((card) => {
        const categories = (card.dataset.category || '').split(' ');
        card.hidden = filter !== 'all' && !categories.includes(filter);
      });
    });
  });

  document.querySelectorAll('.stay-choice').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.stay-choice').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      document.querySelectorAll('[data-calendar-property]').forEach((target) => {
        target.textContent = button.dataset.property || button.textContent.trim();
      });
    });
  });

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const weekdayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const friendly = (value) => {
    if (!value) return 'Not selected';
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  document.querySelectorAll('[data-calendar]').forEach((calendar) => {
    const daysRoot = calendar.querySelector('.calendar-days');
    const title = calendar.querySelector('[data-month-title]');
    const startOutput = document.querySelector(calendar.dataset.startTarget || '#calendar-start');
    const endOutput = document.querySelector(calendar.dataset.endTarget || '#calendar-end');
    const hiddenStart = document.querySelector(calendar.dataset.startInput || '#selected-start');
    const hiddenEnd = document.querySelector(calendar.dataset.endInput || '#selected-end');
    const kind = calendar.dataset.kind || 'stay';
    const today = new Date();
    today.setHours(0,0,0,0);
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    let start = null;
    let end = null;

    const output = () => {
      if (startOutput) startOutput.textContent = friendly(start);
      if (endOutput) endOutput.textContent = kind === 'consultation' ? 'One-hour consultation request' : friendly(end);
      if (hiddenStart) hiddenStart.value = start || '';
      if (hiddenEnd) hiddenEnd.value = end || '';
      document.querySelectorAll('[data-date-link]').forEach((link) => {
        const property = document.querySelector('[data-calendar-property]')?.textContent || 'Stay';
        const params = new URLSearchParams({ intent: kind === 'consultation' ? 'consultation' : 'stay', property, start: start || '', end: end || '' });
        link.href = `contact.html?${params.toString()}`;
      });
    };

    const render = () => {
      title.textContent = `${monthNames[view.getMonth()]} ${view.getFullYear()}`;
      daysRoot.innerHTML = '';
      const first = new Date(view.getFullYear(), view.getMonth(), 1);
      const total = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
      const previousTotal = new Date(view.getFullYear(), view.getMonth(), 0).getDate();
      const cells = Math.ceil((first.getDay() + total) / 7) * 7;
      for (let index = 0; index < cells; index += 1) {
        const offset = index - first.getDay() + 1;
        let date;
        let muted = false;
        if (offset < 1) { date = new Date(view.getFullYear(), view.getMonth()-1, previousTotal + offset); muted = true; }
        else if (offset > total) { date = new Date(view.getFullYear(), view.getMonth()+1, offset-total); muted = true; }
        else date = new Date(view.getFullYear(), view.getMonth(), offset);
        date.setHours(0,0,0,0);
        const value = iso(date);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `calendar-day${muted ? ' muted' : ''}${date >= today ? ' pending' : ''}`;
        button.textContent = date.getDate();
        button.dataset.date = value;
        button.disabled = date < today;
        button.setAttribute('aria-label', friendly(value));
        if (value === start || value === end) button.classList.add('selected');
        if (start && end && value > start && value < end) button.classList.add('in-range');
        button.addEventListener('click', () => {
          if (kind === 'consultation') { start = value; end = value; }
          else if (!start || end || value < start) { start = value; end = null; }
          else if (value === start) { start = null; end = null; }
          else end = value;
          output();
          render();
        });
        daysRoot.appendChild(button);
      }
    };

    calendar.querySelector('[data-calendar-prev]')?.addEventListener('click', () => {
      view = new Date(view.getFullYear(), view.getMonth()-1, 1); render();
    });
    calendar.querySelector('[data-calendar-next]')?.addEventListener('click', () => {
      view = new Date(view.getFullYear(), view.getMonth()+1, 1); render();
    });
    const week = calendar.querySelector('.calendar-week');
    if (week && !week.children.length) weekdayNames.forEach((day) => { const span = document.createElement('span'); span.textContent = day; week.appendChild(span); });
    output();
    render();
  });

  const params = new URLSearchParams(location.search);
  const intent = params.get('intent');
  if (intent) {
    const intentInput = document.querySelector(`input[name="intent"][value="${CSS.escape(intent)}"]`);
    if (intentInput) intentInput.checked = true;
    const message = document.querySelector('#message');
    const property = params.get('property');
    const start = params.get('start');
    const end = params.get('end');
    if (message && property) {
      message.value = `${intent === 'stay' ? 'Stay request' : 'Consultation request'}: ${property}${start ? `\nPreferred date${end && end !== start ? 's' : ''}: ${friendly(start)}${end && end !== start ? ` to ${friendly(end)}` : ''}` : ''}\n\n`;
    }
  }

  const galleryButtons = Array.from(document.querySelectorAll('[data-gallery-image]'));
  if (galleryButtons.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'stay-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Property photo viewer');
    lightbox.innerHTML = '<span class="stay-lightbox-count"></span><button class="stay-lightbox-close" type="button">Close</button><button class="stay-lightbox-nav stay-lightbox-prev" type="button" aria-label="Previous photo">←</button><figure class="stay-lightbox-figure"><img class="stay-lightbox-image" alt=""><figcaption class="stay-lightbox-caption"></figcaption></figure><button class="stay-lightbox-nav stay-lightbox-next" type="button" aria-label="Next photo">→</button>';
    document.body.appendChild(lightbox);
    const image = lightbox.querySelector('.stay-lightbox-image');
    const caption = lightbox.querySelector('.stay-lightbox-caption');
    const count = lightbox.querySelector('.stay-lightbox-count');
    image.src = galleryButtons[0].dataset.galleryImage;
    image.alt = galleryButtons[0].dataset.galleryAlt;
    let active = 0;
    const show = (index) => {
      active = (index + galleryButtons.length) % galleryButtons.length;
      const button = galleryButtons[active];
      image.src = button.dataset.galleryImage;
      image.alt = button.dataset.galleryAlt;
      caption.textContent = button.dataset.galleryAlt;
      count.textContent = `${active + 1} / ${galleryButtons.length}`;
    };
    const open = (index) => {
      show(index);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.stay-lightbox-close').focus();
    };
    const close = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      galleryButtons[active]?.focus();
    };
    galleryButtons.forEach((button, index) => button.addEventListener('click', () => open(index)));
    lightbox.querySelector('.stay-lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.stay-lightbox-prev').addEventListener('click', () => show(active - 1));
    lightbox.querySelector('.stay-lightbox-next').addEventListener('click', () => show(active + 1));
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') show(active - 1);
      if (event.key === 'ArrowRight') show(active + 1);
    });
  }

  document.querySelectorAll('form[data-prototype-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = form.querySelector('.form-message');
      if (message) {
        message.classList.add('show');
        message.textContent = 'Prototype form only — no message was sent. Production should connect this form to Amy’s approved email or CRM.';
      }
    });
  });
})();
