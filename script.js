const pages = document.querySelector('#pages');
const pad = n => String(n).padStart(3, '0');
const projects = {
  haochao:{category:'Brand design',title:'好巢 / WONDER NEST',start:7,end:19},
  nomaster:{category:'Brand design',title:'NoMaster',start:20,end:38},
  veccirc:{category:'Brand design',title:'VECGIRC',start:39,end:51},
  daidai:{category:'Ip design',title:'DAIDAI',start:53,end:66},
  summer:{category:'Illustration design',title:'Summer Dream',start:68,end:78},
  garden:{category:'Illustration design',title:'迷失的少女花园',start:79,end:89},
  crocs:{category:'Illustration design',title:'Crocs / The Colourful World',start:90,end:99},
  personal:{category:'Personal works',title:'Personal Works',start:101,end:107}
};
const searchParams = new URLSearchParams(location.search);
const isBareEntry = !searchParams.has('view') && !searchParams.has('project') && !location.hash;
const homeView = searchParams.get('view') === 'home' || isBareEntry;
const indexView = searchParams.get('view') === 'index';
const aboutView = searchParams.get('view') === 'about';
if (homeView) document.body.classList.add('home-view');
if (indexView) document.body.classList.add('index-view');
if (aboutView) document.body.classList.add('about-view');
const readerEntry = document.querySelector('[data-reader-entry]');
if (readerEntry) {
  readerEntry.addEventListener('click', event => {
    event.preventDefault();
    const readerUrl = new URL(location.href);
    readerUrl.search = '?view=reader';
    readerUrl.hash = 'page-001';
    location.assign(readerUrl.href);
  });
}
if (homeView) {
  const homeScrollKey = 'portfolio-home-scroll-y';
  const savedHomeScroll = Number(sessionStorage.getItem(homeScrollKey)) || 0;
  let homeScrollReady = false;
  let lastHeaderScrollY = savedHomeScroll;
  let headerScrollFrame = 0;
  let headerTravel = 0;
  history.scrollRestoration = 'manual';
  const restoreHomeScroll = () => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    scrollTo(0, Math.min(savedHomeScroll, maxScroll));
    homeScrollReady = true;
  };
  const scheduleHomeScrollRestore = () => requestAnimationFrame(() => requestAnimationFrame(restoreHomeScroll));
  if (document.readyState === 'complete') scheduleHomeScrollRestore();
  else addEventListener('load', scheduleHomeScrollRestore, { once:true });
  addEventListener('scroll', () => {
    if (homeScrollReady) sessionStorage.setItem(homeScrollKey, String(scrollY));
  }, { passive:true });
  addEventListener('pagehide', () => sessionStorage.setItem(homeScrollKey, String(scrollY)));
  addEventListener('scroll', () => {
    if (headerScrollFrame) return;
    headerScrollFrame = requestAnimationFrame(() => {
      const currentScrollY = Math.max(0, scrollY);
      const delta = currentScrollY - lastHeaderScrollY;
      if (delta && Math.sign(delta) !== Math.sign(headerTravel)) headerTravel = 0;
      headerTravel += delta;
      if (currentScrollY < 32 || headerTravel < -18 || document.body.classList.contains('home-menu-visible')) {
        document.body.classList.remove('home-header-hidden');
      } else if (headerTravel > 32) {
        document.body.classList.add('home-header-hidden');
      }
      lastHeaderScrollY = currentScrollY;
      headerScrollFrame = 0;
    });
  }, { passive:true });
}
const activeProject = searchParams.get('project');
const project = projects[activeProject];
const readerSource = Boolean(project && searchParams.get('from') === 'reader');
const range = homeView ? [] : aboutView ? [2,3] : indexView ? [4,5] : project ? Array.from({length:project.end-project.start+1},(_,i)=>project.start+i) : Array.from({length:108},(_,i)=>i+1);
const projectTitle = document.querySelector('#project-title');
const indexLink = document.querySelector('#index-link');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const homeMenu = document.querySelector('.home-menu');
const homeMenuOpen = document.querySelector('.home-menu-open');
const homeMenuClose = document.querySelector('.home-menu-close');
const setHomeMenu = open => {
  homeMenu.classList.toggle('is-open', open);
  homeMenu.setAttribute('aria-hidden', String(!open));
  homeMenuOpen.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('home-menu-visible', open);
  if (open) document.body.classList.remove('home-header-hidden');
  if (open) homeMenuClose.focus(); else homeMenuOpen.focus();
};
homeMenuOpen.addEventListener('click', () => setHomeMenu(true));
homeMenuClose.addEventListener('click', () => setHomeMenu(false));
homeMenu.addEventListener('click', event => { if (event.target === homeMenu) setHomeMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && homeMenu.classList.contains('is-open')) setHomeMenu(false); });
const collectionTrack = document.querySelector('.home-collection-grid');
if (collectionTrack) {
  const collectionCards = [...collectionTrack.querySelectorAll(':scope > a')];
  const dotsContainer = document.querySelector('.home-collection-dots');
  dotsContainer.removeAttribute('aria-hidden');
  dotsContainer.setAttribute('aria-label', '选择作品卡片');
  const collectionDots = [...dotsContainer.children].map((dot, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `查看 ${collectionCards[index].querySelector('b').textContent}`);
    dot.replaceWith(button);
    button.addEventListener('click', () => {
      const card = collectionCards[index];
      collectionTrack.scrollTo({left:card.offsetLeft - collectionTrack.offsetLeft - (collectionTrack.clientWidth - card.offsetWidth)/2, behavior:reducedMotion.matches ? 'auto' : 'smooth'});
    });
    return button;
  });
  let collectionScrollFrame = 0;
  const setActiveCollectionDot = index => collectionDots.forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === index);
    dot.setAttribute('aria-pressed', String(dotIndex === index));
  });
  const syncCollectionDotToScroll = () => {
    const trackCenter = collectionTrack.getBoundingClientRect().left + collectionTrack.clientWidth / 2;
    let activeIndex = 0;
    let closestDistance = Infinity;
    collectionCards.forEach((card, index) => {
      const box = card.getBoundingClientRect();
      const distance = Math.abs(box.left + box.width / 2 - trackCenter);
      if (distance < closestDistance) { closestDistance = distance; activeIndex = index; }
    });
    setActiveCollectionDot(activeIndex);
    collectionScrollFrame = 0;
  };
  collectionTrack.addEventListener('scroll', () => {
    if (!collectionScrollFrame) collectionScrollFrame = requestAnimationFrame(syncCollectionDotToScroll);
  }, { passive:true });
  requestAnimationFrame(() => {
    collectionTrack.scrollLeft = Number(sessionStorage.getItem('portfolio-card-scroll')) || 0;
    syncCollectionDotToScroll();
  });
  addEventListener('pagehide', () => sessionStorage.setItem('portfolio-card-scroll', String(collectionTrack.scrollLeft)));
  addEventListener('resize', syncCollectionDotToScroll);
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  let moved = false;
  collectionTrack.addEventListener('dragstart', event => event.preventDefault());
  collectionTrack.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragging = true;
    moved = false;
    dragStartX = event.clientX;
    dragStartScroll = collectionTrack.scrollLeft;
  });
  collectionTrack.addEventListener('pointermove', event => {
    if (!dragging) return;
    const distance = event.clientX - dragStartX;
    if (!moved && Math.abs(distance) < 8) return;
    moved = true;
    collectionTrack.classList.add('is-dragging');
    collectionTrack.setPointerCapture(event.pointerId);
    collectionTrack.scrollLeft = dragStartScroll - distance;
  });
  const finishCollectionDrag = () => {
    dragging = false;
    collectionTrack.classList.remove('is-dragging');
  };
  collectionTrack.addEventListener('pointerup', finishCollectionDrag);
  collectionTrack.addEventListener('pointercancel', finishCollectionDrag);
  window.addEventListener('pointerup', finishCollectionDrag);
  collectionTrack.addEventListener('lostpointercapture', finishCollectionDrag);
  collectionTrack.addEventListener('click', event => {
    if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
  }, true);
}
const homeHero = document.querySelector('.home-hero');
const homeCoverMotion = document.querySelector('.home-cover-motion');
const deferredVideos = [...document.querySelectorAll('.deferred-video')];
if (deferredVideos.length) {
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    }, { rootMargin:'180px 0px', threshold:.05 });
    deferredVideos.forEach(video => videoObserver.observe(video));
  } else {
    deferredVideos.forEach(video => video.play().catch(() => {}));
  }
}
const homeCoverFreezeTime = 8.05;
const freezeHomeCover = () => {
  homeCoverMotion.pause();
  homeHero.classList.remove('is-playing');
  homeHero.classList.add('is-complete');
  if (Math.abs(homeCoverMotion.currentTime - homeCoverFreezeTime) > .02) {
    homeCoverMotion.currentTime = homeCoverFreezeTime;
  }
};
const replayHomeCover = activeBubble => {
  if (activeBubble && !homeHero.classList.contains('is-complete')) return;
  activeBubble?.classList.remove('is-pulsing');
  if (activeBubble) { void activeBubble.offsetWidth; activeBubble.classList.add('is-pulsing'); }
  homeHero.classList.remove('is-replaying', 'is-complete');
  void homeHero.offsetWidth;
  homeHero.classList.add('is-replaying', 'is-playing');
  homeCoverMotion.loop = false;
  homeCoverMotion.currentTime = 0;
  homeCoverMotion.defaultPlaybackRate = 1.5;
  homeCoverMotion.playbackRate = 1.5;
  homeCoverMotion.play().catch(() => homeHero.classList.replace('is-playing', 'is-complete'));
};
homeCoverMotion.addEventListener('timeupdate', () => {
  if (homeHero.classList.contains('is-playing') && homeCoverMotion.currentTime >= homeCoverFreezeTime) {
    freezeHomeCover();
  }
});
homeCoverMotion.addEventListener('ended', () => {
  freezeHomeCover();
});
document.querySelectorAll('.home-bubble-controls button').forEach(button => {
  button.setAttribute('aria-label', '轻触圆圈');
  button.addEventListener('click', () => {
    button.classList.remove('local-bounce');
    void button.offsetWidth;
    button.classList.add('local-bounce');
  });
});
if (!homeView || reducedMotion.matches) {
  homeCoverMotion.pause();
  homeHero.classList.add('is-complete');
} else replayHomeCover();
if (project) {
  document.body.classList.add('project-view');
  if (readerSource) document.body.classList.add('project-reader-source');
  projectTitle.textContent = `${project.category} / ${project.title}`;
  indexLink.href = '?view=index#page-004';
  const pagerLinks = document.querySelectorAll('.pager a');
  pagerLinks[0].href = `#page-${pad(project.start)}`;
  pagerLinks[0].textContent = '项目开头';
  pagerLinks[1].href = '?view=home';
  pagerLinks[1].textContent = '返回首页';
  pagerLinks[2].href = `#page-${pad(project.end)}`;
  pagerLinks[2].textContent = '项目结尾';
  if (readerSource) {
    const directoryLink = document.createElement('a');
    directoryLink.href = '?view=index#page-005';
    directoryLink.textContent = '返回目录';
    document.querySelector('.pager').insertBefore(directoryLink, pagerLinks[2]);
  }
}
if (indexView) {
  projectTitle.textContent = '目录 / INDEX';
  indexLink.href = '?view=home';
  const pagerLinks = document.querySelectorAll('.pager a');
  pagerLinks[0].href = '?view=home';
  pagerLinks[0].textContent = '首页模式';
  pagerLinks[1].href = '#page-004';
  pagerLinks[1].textContent = '目录封面';
  pagerLinks[2].href = '#page-005';
  pagerLinks[2].textContent = '项目目录';
}
if (aboutView) {
  projectTitle.textContent = '关于我 / ABOUT';
  indexLink.href = '?view=home';
  const pagerLinks = document.querySelectorAll('.pager a');
  pagerLinks[0].href = '?view=home';
  pagerLinks[0].textContent = '返回首页';
  pagerLinks[1].remove();
  pagerLinks[2].remove();

  const aboutMotionPage = document.createElement('section');
  aboutMotionPage.id = 'page-001';
  aboutMotionPage.className = 'page about-motion-page';
  aboutMotionPage.setAttribute('aria-label', '关于我动态介绍');
  aboutMotionPage.innerHTML = `
    <div class="about-motion-viewport">
      <div class="about-motion-camera">
        <div class="about-track-card about-portrait-layer" data-card-index="0"><img class="about-portrait-image" src="assets/about-motion/portrait.svg?v=20260911-1" alt="个人肖像" decoding="async" fetchpriority="high"></div>
        <img class="about-card about-track-card about-red-layer" data-card-index="1" src="assets/about-motion/red.svg" alt="红色眼睛插画">
        <div class="about-orbit about-track-card" data-card-index="2" aria-hidden="true">
          <svg viewBox="0 0 191 191" role="presentation">
            <circle class="about-orbit-ring" cx="95.5" cy="95.5" r="94" />
            <path id="particle-curve-a" d="M18 109 C48 30 135 23 174 91 C147 152 76 175 23 126" />
            <path id="particle-curve-b" d="M36 52 C92 5 170 63 140 132 C97 170 34 142 31 86" />
            <circle class="about-particle p1" r="3.8"><animateMotion dur="3.8s" repeatCount="indefinite"><mpath href="#particle-curve-a" /></animateMotion></circle>
            <circle class="about-particle p2" r="2.8"><animateMotion dur="3.8s" begin="-1.25s" repeatCount="indefinite"><mpath href="#particle-curve-a" /></animateMotion></circle>
            <circle class="about-particle p3" r="2.2"><animateMotion dur="3.1s" begin="-.7s" repeatCount="indefinite"><mpath href="#particle-curve-b" /></animateMotion></circle>
          </svg>
        </div>
        <div class="about-skill-loop about-track-card" data-card-index="3" aria-label="熟练使用 Ps、Ai、Figma 与 OpenAI">
          <div><span>Ps&nbsp;&nbsp; Ai&nbsp;&nbsp; Figma&nbsp;&nbsp; Open-ai</span><span aria-hidden="true">Ps&nbsp;&nbsp; Ai&nbsp;&nbsp; Figma&nbsp;&nbsp; Open-ai</span></div>
        </div>
        <div class="about-black-switch about-track-card" data-card-index="4" aria-hidden="true">
          <img class="about-black-before" src="assets/about-motion/black-before.svg" alt="">
          <img class="about-black-after" src="assets/about-motion/black-after.svg" alt="">
          <i class="about-eye-shine shine-one"></i><i class="about-eye-shine shine-two"></i>
        </div>
        <button class="about-enter" type="button" aria-label="展开关于我第 2 页">About me</button>
      </div>
    </div>
    <span class="page-number">001</span>`;
  pages.append(aboutMotionPage);
}
range.forEach(page => {
  const section = document.createElement('section');
  section.id = `page-${pad(page)}`;
  section.className = `page page-${pad(page)}`;
  const image = document.createElement('img');
  image.src = [2, 3, 4].includes(page)
    ? `assets/pages-update-20260911/Frame ${page}.png?v=20260911-2`
    : `pages/${pad(page)}.webp`;
  image.alt = `作品集第 ${page} 页${project ? `：${project.title}` : ''}`;
  image.loading = page === range[0] ? 'eager' : 'lazy';
  image.decoding = 'async';
  if (page === range[0]) image.fetchPriority = 'high';
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
    link.href = `?project=${key}&from=reader#page-${pad(item.start)}`;
    link.dataset.project = key;
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
let cardReturnFocus = null;
const closeCardFocus = () => {
  if (!cardFocus.classList.contains('is-open')) return;
  cardFocus.classList.remove('is-open'); cardFocus.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('preview-open');
  [...document.body.children].forEach(element => { if (element.dataset.previewInert === 'true') { element.inert = false; delete element.dataset.previewInert; } });
  cardReturnFocus?.focus({preventScroll:true});
};
const openCardFocus = (source, label) => {
  cardReturnFocus = document.activeElement;
  cardFocusImage.src = source; cardFocusImage.alt = label;
  cardFocus.classList.add('is-open'); cardFocus.setAttribute('aria-hidden', 'false'); cardFocus.setAttribute('aria-modal', 'true');
  document.body.classList.add('preview-open');
  [...document.body.children].forEach(element => { if (element !== cardFocus && !element.inert && !['SCRIPT','STYLE'].includes(element.tagName)) { element.inert = true; element.dataset.previewInert = 'true'; } });
  cardFocus.querySelector('button').focus({preventScroll:true});
};
cardFocus.addEventListener('keydown', event => { if (event.key === 'Tab') { event.preventDefault(); cardFocus.querySelector('button').focus(); } });
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
const cardFiles = ['01.webp','02.webp','03.webp','04.webp','05.webp','06.webp','07.webp','08.webp'];
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
  card.tabIndex = 0; card.setAttribute('role', 'button'); card.setAttribute('aria-label', `放大查看个人作品 ${index + 1}`);
  card.innerHTML = `<img src="cards/${file}" alt="个人作品精选 ${String(index + 1).padStart(2,'0')}" loading="lazy" decoding="async"><figcaption><span>0${index + 1}</span><span>PERSONAL WORK</span></figcaption>`;
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
  if (link.classList.contains('personal')) {
    event.preventDefault();
    gallery.classList.remove('is-open'); void gallery.offsetWidth;
    gallery.classList.add('is-open'); gallery.setAttribute('aria-hidden', 'false');
    window.setTimeout(() => gallery.scrollIntoView({behavior:'smooth', block:'start'}), 40);
    return;
  }
});
const pageCount = document.querySelector('#page-count');
const pagerLinks = [...document.querySelectorAll('.pager a')];
const startIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 11 6-6 6 6M6 18l6-6 6 6"/></svg>';
const homeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1Z"/></svg>';
const directoryIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="5" height="5" rx="1"/><rect x="14" y="5" width="5" height="5" rx="1"/><rect x="5" y="14" width="5" height="5" rx="1"/><rect x="14" y="14" width="5" height="5" rx="1"/></svg>';
const endIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 6 6 6-6M6 13l6 6 6-6"/></svg>';
const projectNavIcons = readerSource ? [startIcon, homeIcon, directoryIcon, endIcon] : [startIcon, homeIcon, endIcon];
pagerLinks.forEach((link, index) => {
  const text = link.textContent;
  const label = document.createElement('span'); label.className = project ? 'nav-label sr-only' : 'nav-label'; label.textContent = text;
  if (project) {
    const icon = document.createElement('span'); icon.className = 'nav-icon'; icon.innerHTML = projectNavIcons[index];
    link.setAttribute('aria-label', text); link.title = text; link.replaceChildren(icon, label);
  } else link.replaceChildren(label);
  link.addEventListener('pointerdown', event => { const box = link.getBoundingClientRect(); link.style.setProperty('--tap-x', `${event.clientX - box.left}px`); link.style.setProperty('--tap-y', `${event.clientY - box.top}px`); });
  link.addEventListener('click', () => { link.classList.remove('is-rippling'); void link.offsetWidth; link.classList.add('is-rippling'); window.setTimeout(() => link.classList.remove('is-rippling'), 600); });
});
const readingProgress = document.querySelector('.reading-progress');
let progressFrame = 0;
const updateReadingProgress = () => {
  const scrollRange = document.documentElement.scrollHeight - innerHeight;
  const progress = scrollRange > 0 ? Math.min(1, Math.max(0, scrollY / scrollRange)) : 0;
  readingProgress.style.setProperty('--reading-progress', progress.toFixed(4));
  progressFrame = 0;
};
const requestProgressUpdate = () => {
  if (!progressFrame) progressFrame = requestAnimationFrame(updateReadingProgress);
};
addEventListener('scroll', requestProgressUpdate, {passive:true});
addEventListener('resize', requestProgressUpdate);
const depthSections = [...document.querySelectorAll('.page:not(.page-005):not(.page-014):not(.page-030), .nomaster-video-page')];
let depthFrame = 0;
const updateScrollDepth = () => {
  const viewportCenter = innerHeight / 2;
  depthSections.forEach(section => {
    const box = section.getBoundingClientRect();
    if (box.bottom < -innerHeight || box.top > innerHeight * 2) return;
    const progress = Math.max(-1.15, Math.min(1.15, (box.top + box.height / 2 - viewportCenter) / innerHeight));
    const distance = Math.min(1, Math.abs(progress));
    section.style.setProperty('--scroll-shift', `${(-progress * 18).toFixed(2)}px`);
    section.style.setProperty('--scroll-scale', (1.004 + distance * .009).toFixed(4));
    section.style.setProperty('--scroll-opacity', (1 - distance * .045).toFixed(3));
    section.style.setProperty('--scroll-blur', `${(distance * .48).toFixed(2)}px`);
  });
  depthFrame = 0;
};
const requestDepthUpdate = () => {
  if (!depthFrame && !reducedMotion.matches) depthFrame = requestAnimationFrame(updateScrollDepth);
};
addEventListener('scroll', requestDepthUpdate, {passive:true});
addEventListener('resize', requestDepthUpdate);

const inertiaEnabled = !homeView && !reducedMotion.matches && matchMedia('(pointer:fine)').matches;
let inertiaCurrent = scrollY;
let inertiaTarget = scrollY;
let inertiaFrame = 0;
let inertiaRunning = false;
const clampScrollTarget = value => Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, value));
const runInertia = () => {
  inertiaRunning = true;
  inertiaCurrent += (inertiaTarget - inertiaCurrent) * .085;
  if (Math.abs(inertiaTarget - inertiaCurrent) < .35) {
    inertiaCurrent = inertiaTarget;
    scrollTo(0, inertiaCurrent);
    inertiaRunning = false;
    inertiaFrame = 0;
    return;
  }
  scrollTo(0, inertiaCurrent);
  inertiaFrame = requestAnimationFrame(runInertia);
};
const startInertia = () => {
  if (!inertiaFrame) inertiaFrame = requestAnimationFrame(runInertia);
};
const stopInertia = () => {
  if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
  inertiaFrame = 0;
  inertiaRunning = false;
  inertiaCurrent = scrollY;
  inertiaTarget = scrollY;
};
if (inertiaEnabled) {
  document.documentElement.classList.add('has-inertia-scroll');
  addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.body.classList.contains('preview-open')) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1;
    const impulse = Math.max(-220, Math.min(220, event.deltaY * unit));
    if (!inertiaRunning) inertiaCurrent = scrollY;
    inertiaTarget = clampScrollTarget(inertiaTarget + impulse);
    startInertia();
  }, {passive:false});
  document.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    const link = event.target.closest('a[href^="#"]');
    const destination = link && document.querySelector(link.hash);
    if (!destination) return;
    event.preventDefault();
    inertiaCurrent = scrollY;
    inertiaTarget = clampScrollTarget(destination.getBoundingClientRect().top + scrollY - 56);
    startInertia();
  });
  addEventListener('scroll', () => {
    if (!inertiaRunning) inertiaCurrent = inertiaTarget = scrollY;
  }, {passive:true});
  addEventListener('touchstart', stopInertia, {passive:true});
  addEventListener('keydown', stopInertia);
}
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  const visiblePage = Number(entry.target.id.slice(-3));
  pageCount.textContent = project ? `${pad(visiblePage - project.start + 1)} / ${pad(project.end - project.start + 1)}` : `${pad(visiblePage)} / ${pad(aboutView ? 3 : indexView ? 5 : 108)}`;
  if (location.hash !== `#${entry.target.id}`) history.replaceState(null, '', `#${entry.target.id}`);
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
requestAnimationFrame(() => { document.body.classList.add('ready'); updateReadingProgress(); updateScrollDepth(); });
// Restore visibility when the browser restores a chapter from its back/forward cache.
window.addEventListener('pageshow', () => {
  document.body.classList.remove('is-leaving');
  document.body.classList.add('ready');
  requestProgressUpdate();
});
