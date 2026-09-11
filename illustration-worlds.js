if (homeView) {
  const illustrationSection = document.createElement('section');
  illustrationSection.className = 'illustration-worlds';
  illustrationSection.id = 'illustration-worlds';
  illustrationSection.setAttribute('aria-label', 'IP 与插画项目');
  illustrationSection.innerHTML = `
    <div class="illustration-cover">
      <div class="illustration-visual">
      <video class="illustration-cover-video" muted loop playsinline preload="none" poster="assets/illustration-worlds/frame3-line.webp" aria-label="IP 与插画动态背景">
        <source data-src="media/illustration-worlds.mp4" type="video/mp4" />
      </video>
      <img class="illustration-cover-art" src="assets/illustration-worlds/frame-3-2026.svg" alt="五张 IP 与插画项目卡片的堆叠预览" loading="lazy" decoding="async" fetchpriority="low" />
      <div class="illustration-stack-motion" aria-hidden="true">
        <span class="illustration-stack-wash"></span>
        <span class="illustration-stack-layer stack-layer-1"><img src="assets/illustration-worlds/stack-cherry.webp" alt="" loading="lazy" decoding="async" fetchpriority="low" /></span>
        <span class="illustration-stack-layer stack-layer-2"><img src="assets/illustration-worlds/stack-crocs.webp" alt="" loading="lazy" decoding="async" fetchpriority="low" /></span>
        <span class="illustration-stack-layer stack-layer-3"><img src="assets/illustration-worlds/stack-pink.webp" alt="" loading="lazy" decoding="async" fetchpriority="low" /></span>
        <span class="illustration-stack-layer stack-layer-4"><img src="assets/illustration-worlds/stack-summer-lant.jpg" alt="" loading="lazy" decoding="async" fetchpriority="low" /></span>
        <span class="illustration-stack-layer stack-layer-5"><img class="illustration-frame-sheet" src="assets/illustration-worlds/frame-4-2026.svg" alt="" loading="lazy" decoding="async" fetchpriority="low" /></span>
      </div>
      <button class="illustration-stack" type="button" aria-label="展开 IP 与插画项目卡片" aria-expanded="false"></button>
      </div>
      <header class="illustration-cover-heading">
        <h2>Ip &amp; Illustration</h2>
      </header>
      <p class="illustration-cover-copy-live">Virtual commercial projects,<br />primarily encompassing IP and commercial illustration.</p>
    </div>
    <div class="illustration-expanded" aria-hidden="true" inert>
      <button class="illustration-close" type="button" aria-label="收起项目卡片">收起 ×</button>
      <p class="illustration-part">Part 2 - 3.</p>
      <div class="illustration-track" tabindex="0" aria-label="左右滑动浏览五个 IP 与插画项目">
        <a class="illustration-card" href="?project=personal#page-101"><span class="illustration-card-media"><img src="assets/illustration-worlds/stack-cherry.webp" alt="Personal Works 项目预览" loading="lazy" decoding="async" fetchpriority="low" /></span><span class="illustration-card-label">Personal works<small>个人作品</small></span></a>
        <a class="illustration-card" href="?project=garden#page-079"><span class="illustration-card-media"><img src="assets/illustration-worlds/stack-pink.webp" alt="迷失的少女花园项目预览" loading="lazy" decoding="async" fetchpriority="low" /></span><span class="illustration-card-label">Illustration design<small>迷失的少女花园</small></span></a>
        <a class="illustration-card" href="?project=daidai#page-053"><span class="illustration-card-media"><img class="illustration-frame-sheet" src="assets/illustration-worlds/frame-4-2026.svg" alt="DAIDAI 项目预览" loading="lazy" decoding="async" fetchpriority="low" /></span><span class="illustration-card-label">Ip design<small>呆呆</small></span></a>
        <a class="illustration-card" href="?project=summer#page-068"><span class="illustration-card-media"><img src="assets/illustration-worlds/stack-summer-lant.jpg" alt="Summer Dream 项目预览" loading="lazy" decoding="async" fetchpriority="low" /></span><span class="illustration-card-label">Summer dream<small>专辑设计</small></span></a>
        <a class="illustration-card" href="?project=crocs#page-090"><span class="illustration-card-media"><img src="assets/illustration-worlds/stack-crocs.webp" alt="Crocs 项目预览" loading="lazy" decoding="async" fetchpriority="low" /></span><span class="illustration-card-label">Illustration design<small>Crocs</small></span></a>
      </div>
    </div>`;
  document.querySelector('.project-board-section').after(illustrationSection);

  const cover = illustrationSection.querySelector('.illustration-cover');
  const expanded = illustrationSection.querySelector('.illustration-expanded');
  const stack = illustrationSection.querySelector('.illustration-stack');
  const video = illustrationSection.querySelector('.illustration-cover-video');
  const track = illustrationSection.querySelector('.illustration-track');
  const part = illustrationSection.querySelector('.illustration-part');
  const cards = [...illustrationSection.querySelectorAll('.illustration-card')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const videoSource = video.querySelector('source');
  let videoLoaded = false;
  let closeTimer = 0;
  let blankPulseTimer = 0;
  let arrivalTimer = 0;
  let arrivalReady = true;

  const keepVideoPlaying = () => {
    if (!videoLoaded) return;
    const attempt = video.play();
    if (attempt?.catch) attempt.catch(() => {});
  };
  const loadCoverVideo = () => {
    if (videoLoaded) return;
    videoLoaded = true;
    videoSource.src = videoSource.dataset.src;
    videoSource.removeAttribute('data-src');
    video.load();
    keepVideoPlaying();
  };
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadCoverVideo();
        keepVideoPlaying();
      } else if (videoLoaded) video.pause();
    }, {rootMargin:'420px 0px'});
    videoObserver.observe(illustrationSection);
  } else loadCoverVideo();
  video.addEventListener('loadeddata', keepVideoPlaying, {once:true});
  addEventListener('pageshow', keepVideoPlaying, {passive:true});

  const syncCenteredCard = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = cards[0];
    let nearest = Infinity;
    cards.forEach(card => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      if (distance < nearest) { nearest = distance; closest = card; }
      const centerRange = Math.max(track.clientWidth * .3, 1);
      const scale = 1 + Math.max(0, 1 - distance / centerRange) * .423;
      card.style.setProperty('--card-scale', scale.toFixed(3));
    });
    cards.forEach(card => card.classList.toggle('is-centered', card === closest));
    part.textContent = closest === cards[0] ? 'Part 4.' : 'Part 2 - 3.';
  };

  const setScatterOrigins = () => {
    const stackBox = stack.getBoundingClientRect();
    const originX = stackBox.left + stackBox.width / 2;
    const originY = stackBox.top + stackBox.height / 2;
    cards.forEach(card => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--scatter-x', `${originX - box.left - box.width / 2}px`);
      card.style.setProperty('--scatter-y', `${originY - box.top - box.height / 2}px`);
    });
  };

  const openCards = () => {
    if (illustrationSection.classList.contains('is-expanded')) return;
    stack.setAttribute('aria-expanded', 'true');
    clearTimeout(closeTimer);
    illustrationSection.classList.remove('is-closing');
    document.body.classList.remove('home-header-hidden');
    illustrationSection.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'start'
    });
    expanded.hidden = false;
    expanded.inert = false;
    expanded.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      const centerCard = cards[2];
      track.scrollLeft = centerCard.offsetLeft - (track.clientWidth - centerCard.offsetWidth) / 2;
      setScatterOrigins();
      syncCenteredCard();
      requestAnimationFrame(() => {
        illustrationSection.classList.add('is-expanded');
        track.focus({preventScroll:true});
      });
    });
  };

  const closeCards = () => {
    if (!illustrationSection.classList.contains('is-expanded')) return;
    stack.setAttribute('aria-expanded', 'false');
    setScatterOrigins();
    illustrationSection.classList.remove('is-blank-pulse');
    illustrationSection.classList.add('is-closing');
    illustrationSection.classList.remove('is-expanded');
    expanded.inert = true;
    expanded.setAttribute('aria-hidden', 'true');
    closeTimer = window.setTimeout(() => {
      illustrationSection.classList.remove('is-closing');
      expanded.hidden = true;
      stack.focus({preventScroll:true});
    }, reducedMotion.matches ? 0 : 860);
  };

  const pulseCardsFromBlank = event => {
    if (!illustrationSection.classList.contains('is-expanded') || event.target.closest('a,button')) return;
    const sectionCenter = illustrationSection.getBoundingClientRect().left + illustrationSection.clientWidth / 2;
    cards.forEach(card => {
      const box = card.getBoundingClientRect();
      const cardCenter = box.left + box.width / 2;
      const gatherX = Math.max(-22, Math.min(22, (sectionCenter - cardCenter) * .055));
      card.style.setProperty('--blank-gather-x', `${gatherX.toFixed(1)}px`);
    });
    clearTimeout(blankPulseTimer);
    illustrationSection.classList.remove('is-blank-pulse');
    void illustrationSection.offsetWidth;
    illustrationSection.classList.add('is-blank-pulse');
    blankPulseTimer = window.setTimeout(() => illustrationSection.classList.remove('is-blank-pulse'), 440);
  };

  stack.addEventListener('click', openCards);
  illustrationSection.querySelector('.illustration-close').addEventListener('click', closeCards);
  expanded.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeCards(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const current = Math.max(0, cards.findIndex(card => card.classList.contains('is-centered')));
      const next = cards[Math.max(0, Math.min(cards.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1)))];
      track.scrollTo({left:next.offsetLeft - (track.clientWidth - next.offsetWidth) / 2, behavior:reducedMotion.matches ? 'auto' : 'smooth'});
    }
  });
  expanded.addEventListener('click', pulseCardsFromBlank);
  const arrivalObserver = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (entry.intersectionRatio < .2) arrivalReady = true;
    if (entry.intersectionRatio < .55 || !arrivalReady || illustrationSection.classList.contains('is-expanded')) return;
    arrivalReady = false;
    clearTimeout(arrivalTimer);
    illustrationSection.classList.remove('is-stack-arrival');
    void illustrationSection.offsetWidth;
    illustrationSection.classList.add('is-stack-arrival');
    arrivalTimer = window.setTimeout(() => illustrationSection.classList.remove('is-stack-arrival'), 920);
  }, {threshold:[.2,.55]});
  arrivalObserver.observe(illustrationSection);
  let scrollFrame = 0;
  track.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => { syncCenteredCard(); scrollFrame = 0; });
  }, {passive:true});
  illustrationSection.addEventListener('wheel', event => {
    if (!illustrationSection.classList.contains('is-expanded')) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (event.deltaY > 28) {
      event.preventDefault();
      closeCards();
    }
  }, {passive:false});
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragging = false;
  track.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0) return;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    dragging = false;
  });
  track.addEventListener('pointermove', event => {
    if (!event.buttons || event.pointerType === 'touch') return;
    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 6 && !dragging) {
      dragging = true;
      track.setPointerCapture(event.pointerId);
    }
    if (dragging) track.scrollLeft = dragStartScroll - distance;
  });
  track.addEventListener('pointerup', event => {
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    requestAnimationFrame(() => { dragging = false; });
  });
  track.addEventListener('click', event => {
    if (dragging) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  let touchStartY = 0;
  expanded.addEventListener('touchstart', event => { touchStartY = event.touches[0].clientY; }, {passive:true});
  expanded.addEventListener('touchend', event => {
    if (event.changedTouches[0].clientY - touchStartY > 64) closeCards();
  }, {passive:true});
  addEventListener('resize', () => {
    if (illustrationSection.classList.contains('is-expanded')) {
      setScatterOrigins();
      syncCenteredCard();
    }
  }, {passive:true});
}
