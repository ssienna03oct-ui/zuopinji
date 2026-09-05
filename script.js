const pages = document.querySelector('#pages');
const pad = n => String(n).padStart(3, '0');
const projects = {
  haochao:{category:'Brand design',title:'好巢 / WONDER NEST',start:7,end:19},
  nomaster:{category:'Brand design',title:'NoMaster',start:20,end:38},
  veccirc:{category:'Brand design',title:'VECCIRC',start:39,end:51},
  daidai:{category:'Ip design',title:'DAIDAI',start:53,end:66},
  summer:{category:'Illustration design',title:'Summer Dream',start:68,end:78},
  garden:{category:'Illustration design',title:'迷失的少女花园',start:79,end:89},
  crocs:{category:'Illustration design',title:'Crocs / The Colourful World',start:90,end:99},
  personal:{category:'Personal works',title:'Personal Works',start:101,end:107}
};
const activeProject = new URLSearchParams(location.search).get('project');
const project = projects[activeProject];
const range = project ? Array.from({length:project.end-project.start+1},(_,i)=>project.start+i) : Array.from({length:108},(_,i)=>i+1);
const projectTitle = document.querySelector('#project-title');
const indexLink = document.querySelector('#index-link');
if (project) {
  document.body.classList.add('project-view');
  projectTitle.textContent = `${project.category} / ${project.title}`;
  indexLink.href = 'index.html#page-005';
  const pagerLinks = document.querySelectorAll('.pager a');
  pagerLinks[0].href = `#page-${pad(project.start)}`;
  pagerLinks[0].textContent = '项目开头';
  pagerLinks[1].href = 'index.html#page-005';
  pagerLinks[2].href = `#page-${pad(project.end)}`;
  pagerLinks[2].textContent = '项目结尾';
}
range.forEach(page => {
  const section = document.createElement('section');
  section.id = `page-${pad(page)}`;
  section.className = `page page-${pad(page)}`;
  const image = document.createElement('img');
  image.src = `pages/${pad(page)}.png`;
  image.alt = `作品集第 ${page} 页${project ? `：${project.title}` : ''}`;
  image.loading = page === range[0] ? 'eager' : 'lazy';
  section.append(image);
  const number = document.createElement('span');
  number.className = 'page-number'; number.textContent = pad(page);
  section.append(number); pages.append(section);
});
const page28 = document.querySelector('#page-028');
if (page28) {
  const videoPage = document.createElement('section');
  videoPage.id = 'nomaster-video'; videoPage.className = 'nomaster-video-page';
  videoPage.innerHTML = '<video controls playsinline preload="metadata" aria-label="NoMaster 项目动态视频"><source src="media/nomaster-motion.mp4" type="video/mp4">你的浏览器暂不支持该视频格式。</video>';
  page28.after(videoPage);
}
const page30 = document.querySelector('#page-030');
if (page30) {
  const page30Image = page30.querySelector('img');
  const eyePositions = [{x:.1592,y:.322},{x:.3678,y:.322}];
  const eyes = eyePositions.map((position, index) => {
    const eye = document.createElement('span');
    eye.className = 'tracking-eye';
    eye.setAttribute('aria-hidden', 'true');
    eye.dataset.x = position.x;
    eye.dataset.y = position.y;
    eye.innerHTML = `<span class="tracking-pupil tracking-pupil-${index + 1}"></span>`;
    page30.append(eye);
    return eye;
  });
  const positionEyes = () => {
    const imageBox = page30Image.getBoundingClientRect();
    const pageBox = page30.getBoundingClientRect();
    const eyeSize = imageBox.width * .044;
    eyes.forEach(eye => {
      eye.style.width = `${eyeSize}px`;
      eye.style.left = `${imageBox.left - pageBox.left + imageBox.width * Number(eye.dataset.x) - eyeSize / 2}px`;
      eye.style.top = `${imageBox.top - pageBox.top + imageBox.height * Number(eye.dataset.y) - eyeSize / 2}px`;
    });
  };
  const resetEyes = () => eyes.forEach(eye => {
    const pupil = eye.firstElementChild;
    pupil.style.setProperty('--pupil-x', '0px');
    pupil.style.setProperty('--pupil-y', '0px');
  });
  let pointerFrame = 0;
  page30.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => eyes.forEach(eye => {
      const box = eye.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const travel = box.width * .23;
      const strength = Math.min(1, distance / (box.width * 2.5));
      const pupil = eye.firstElementChild;
      pupil.style.setProperty('--pupil-x', `${dx / distance * travel * strength}px`);
      pupil.style.setProperty('--pupil-y', `${dy / distance * travel * strength}px`);
    }));
  });
  page30.addEventListener('pointerleave', resetEyes);
  window.addEventListener('resize', positionEyes);
  if (page30Image.complete) requestAnimationFrame(positionEyes);
  else page30Image.addEventListener('load', positionEyes, {once:true});
}
const pageFive = document.querySelector('#page-005');
if (pageFive) {
  Object.entries(projects).forEach(([key,item]) => {
    const link = document.createElement('a');
    link.className = `chapter-link ${key}`;
    link.href = `?project=${key}`;
    link.setAttribute('aria-label', `查看${item.title}`);
    link.innerHTML = `<span>${item.title} · ${pad(item.start)}—${pad(item.end)}</span>`;
    pageFive.append(link);
  });
}
const gallery = document.querySelector('.inline-card-gallery');
if (pageFive) pageFive.after(gallery);
const cardGrid = document.querySelector('.card-grid');
const cardFocus = document.querySelector('.card-focus');
const cardFocusImage = cardFocus.querySelector('img');
const closeCardFocus = () => { cardFocus.classList.remove('is-open'); cardFocus.setAttribute('aria-hidden', 'true'); };
const openCardFocus = (source, label) => { cardFocusImage.src = source; cardFocusImage.alt = label; cardFocus.classList.add('is-open'); cardFocus.setAttribute('aria-hidden', 'false'); };
const page14 = document.querySelector('#page-014');
if (page14) {
  const trigger = document.createElement('button'); trigger.className = 'video-trigger'; trigger.type = 'button'; trigger.setAttribute('aria-label', '播放好巢品牌设计视频'); trigger.innerHTML = '<span>PLAY VIDEO</span>';
  const inlineVideo = document.createElement('video'); inlineVideo.className = 'inline-video'; inlineVideo.controls = true; inlineVideo.playsInline = true; inlineVideo.preload = 'metadata'; inlineVideo.src = 'media/haochao-motion.mp4'; inlineVideo.hidden = true;
  const positionTrigger = () => {
    const imageBox = page14.querySelector('img').getBoundingClientRect(); const pageBox = page14.getBoundingClientRect();
    trigger.style.left = `${imageBox.left - pageBox.left + imageBox.width * .612}px`;
    trigger.style.top = `${imageBox.top - pageBox.top + imageBox.height * .17}px`;
    trigger.style.width = `${imageBox.width * .286}px`; trigger.style.height = `${imageBox.height * .677}px`;
    inlineVideo.style.left = trigger.style.left; inlineVideo.style.top = trigger.style.top; inlineVideo.style.width = trigger.style.width; inlineVideo.style.height = trigger.style.height;
  };
  page14.append(trigger, inlineVideo); window.addEventListener('resize', positionTrigger);
  const page14Image = page14.querySelector('img');
  if (page14Image.complete) requestAnimationFrame(positionTrigger); else page14Image.addEventListener('load', positionTrigger, {once:true});
  trigger.addEventListener('click', () => { trigger.hidden = true; inlineVideo.hidden = false; inlineVideo.play().catch(() => {}); });
}
const cardFiles = ['01.png','02.png','03.jpg','04.png','05.png','06.jpg','07.jpg','08.jpg'];
const cardAngles = [-18,-13,-8,-3,2,7,12,17];
const cardSpreadX = [-31,-22,-13,-4,5,14,23,32];
const cardSpreadY = ['12vw','11vw','6vw','2vw','1vw','6vw','12vw','13vw'];
const cards = [];
cardFiles.forEach((file, index) => {
  const card = document.createElement('figure'); card.className = 'gallery-card';
  card.style.setProperty('--delay', `${index * 55}ms`);
  card.style.setProperty('--angle', `${cardAngles[index]}deg`);
  card.style.setProperty('--spread-x', `${cardSpreadX[index]}vw`);
  card.style.setProperty('--spread-y', cardSpreadY[index]);
  card.style.setProperty('--layer', index + 1);
  card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-label', `轻微转动个人作品 ${index + 1}`);
  card.innerHTML = `<img src="cards/${file}" alt="个人作品精选 ${String(index + 1).padStart(2,'0')}" loading="${index < 4 ? 'eager' : 'lazy'}"><figcaption><span>0${index + 1}</span><span>PERSONAL WORK</span></figcaption>`;
  cardGrid.append(card);
  cards.push(card);
  const open = () => openCardFocus(`cards/${file}`, `个人作品精选 ${String(index + 1).padStart(2,'0')}`);
  card.addEventListener('click', open);
  card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
});
document.querySelector('.card-focus-close').addEventListener('click', closeCardFocus);
cardFocus.addEventListener('click', event => { if (event.target === cardFocus) closeCardFocus(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCardFocus(); });
document.querySelector('.gallery-close').addEventListener('click', () => { gallery.classList.remove('is-open'); gallery.setAttribute('aria-hidden', 'true'); });
document.addEventListener('click', event => {
  const link = event.target.closest('.chapter-link');
  if (!link) return;
  event.preventDefault();
  if (link.classList.contains('personal')) {
    gallery.classList.remove('is-open'); void gallery.offsetWidth;
    gallery.classList.add('is-open'); gallery.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => gallery.scrollIntoView({behavior:'smooth', block:'start'}), 40);
    return;
  }
  document.body.classList.add('is-leaving');
  window.setTimeout(() => { location.href = link.href; }, 260);
});
const pageCount = document.querySelector('#page-count');
const pagerLinks = [...document.querySelectorAll('.pager a')];
const projectNavIcons = [
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6v12M17 7l-5 5 5 5"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="5" height="5" rx="1"/><rect x="14" y="5" width="5" height="5" rx="1"/><rect x="5" y="14" width="5" height="5" rx="1"/><rect x="14" y="14" width="5" height="5" rx="1"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6v12M7 7l5 5-5 5"/></svg>'
];
pagerLinks.forEach((link, index) => {
  const text = link.textContent;
  const label = document.createElement('span'); label.className = `nav-label${project ? ' sr-only' : ''}`; label.textContent = text;
  if (project) {
    const icon = document.createElement('span'); icon.className = 'nav-icon'; icon.innerHTML = projectNavIcons[index];
    link.setAttribute('aria-label', text); link.title = text; link.replaceChildren(icon, label);
  } else link.replaceChildren(label);
  link.addEventListener('pointerdown', event => { const box = link.getBoundingClientRect(); link.style.setProperty('--tap-x', `${event.clientX - box.left}px`); link.style.setProperty('--tap-y', `${event.clientY - box.top}px`); });
  link.addEventListener('click', () => { link.classList.remove('is-rippling'); void link.offsetWidth; link.classList.add('is-rippling'); window.setTimeout(() => link.classList.remove('is-rippling'), 600); });
});
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  pageCount.textContent = `${entry.target.id.slice(-3)} / ${pad(project ? project.end : 108)}`;
  pagerLinks.forEach(link => {
    const isCurrent = link.hash === `#${entry.target.id}`;
    link.classList.toggle('is-current', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}), {threshold:.55});
document.querySelectorAll('.page').forEach(page => observer.observe(page));
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  entry.target.classList.add('is-visible');
  revealObserver.unobserve(entry.target);
}), {threshold:.12});
document.querySelectorAll('.page').forEach(page => revealObserver.observe(page));
requestAnimationFrame(() => document.body.classList.add('ready'));
