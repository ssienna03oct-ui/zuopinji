(() => {
  const page = document.querySelector('.about-motion-page');
  if (!page) return;
  const body = document.body;
  const camera = page.querySelector('.about-motion-camera');
  const enter = page.querySelector('.about-enter');
  const cards = [...page.querySelectorAll('.about-track-card')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentPhase = 0;
  let targetPhase = 0;
  let raf = 0;
  let blackWasFront = false;
  let entryStart = performance.now();
  const entryDuration = 1050;
  const entryStagger = 85;
  const spinDuration = 6800;
  let spinStart = entryStart + entryDuration + entryStagger * (cards.length - 1);
  let autoSpinning = !reducedMotion;
  let step = 1;
  let lockedUntil = 0;
  let touchStartY = 0;

  body.classList.remove('about-step-2', 'about-step-3');
  body.classList.add('about-step-1');
  if (location.hash !== '#page-001') history.replaceState(null, '', '#page-001');

  const render = now => {
    const entryEnd = entryStart + entryDuration + entryStagger * (cards.length - 1);
    if (autoSpinning && now >= entryEnd) {
      const spinProgress = Math.max(0, (now - spinStart) / spinDuration);
      currentPhase = spinProgress * Math.PI * 2;
      targetPhase = currentPhase;
    } else if (!autoSpinning) {
      currentPhase += (targetPhase - currentPhase) * .105;
    }
    cards.forEach((card, index) => {
      const angle = currentPhase + index * Math.PI * 2 / cards.length;
      const compact = innerWidth < 700;
      const pathX = Math.sin(angle) * (compact ? 20 : 25);
      const pathY = Math.cos(angle) * (compact ? 21 : 28);
      const x = pathX * .78 - pathY * .34;
      const y = pathX * .28 + pathY * .94;
      const depth = (Math.sin(angle - .22) + 1) / 2;
      const targetScale = .54 + depth * .48;
      const rawEntry = reducedMotion ? 1 : Math.max(0, Math.min(1, (now - entryStart - index * entryStagger) / entryDuration));
      const entry = 1 - Math.pow(1 - rawEntry, 4);
      const scale = .14 + (targetScale - .14) * entry;
      const rotate = -8 + Math.cos(angle) * 7 + depth * 5;
      card.style.transform = `translate(-50%,-50%) translate3d(${(x * entry).toFixed(3)}vw,${(y * entry).toFixed(3)}vh,${Math.round(depth * 100 * entry)}px) scale(${scale.toFixed(4)}) rotate(${(rotate * entry).toFixed(2)}deg)`;
      card.style.opacity = ((.42 + depth * .58) * entry).toFixed(3);
      card.style.zIndex = String(10 + Math.round(depth * 90));
      card.style.filter = `saturate(${(.76 + depth * .24).toFixed(2)}) brightness(${(.84 + depth * .16).toFixed(2)})`;
      if (card.classList.contains('about-black-switch')) {
        const isFront = depth > .82;
        card.classList.toggle('is-front', isFront);
        if (isFront && !blackWasFront) {
          card.classList.remove('is-glinting');
          void card.offsetWidth;
          card.classList.add('is-glinting');
        }
        blackWasFront = isFront;
      }
    });
    const entering = !reducedMotion && now < entryStart + entryDuration + (cards.length - 1) * entryStagger;
    if (!entering) page.classList.add('is-entered');
    if (entering || autoSpinning || Math.abs(targetPhase - currentPhase) > .0004) raf = requestAnimationFrame(render);
    else raf = 0;
  };
  const requestRender = () => { if (!raf) raf = requestAnimationFrame(render); };
  const startEntrance = () => {
    page.classList.remove('is-entered', 'is-scattering');
    void page.offsetWidth;
    page.classList.add('is-scattering');
    entryStart = reducedMotion ? performance.now() - entryDuration : performance.now();
    spinStart = entryStart + entryDuration + entryStagger * (cards.length - 1);
    currentPhase = 0;
    targetPhase = 0;
    autoSpinning = !reducedMotion;
    requestRender();
  };

  const showStep = nextStep => {
    step = nextStep;
    body.classList.remove('about-step-1', 'about-step-2', 'about-step-3');
    body.classList.add(`about-step-${step}`);
    lockedUntil = performance.now() + 720;
    const target = document.querySelector(step === 1 ? '#page-001' : step === 2 ? '#page-002' : '#page-003');
    requestAnimationFrame(() => target?.scrollIntoView({ behavior:reducedMotion ? 'auto' : 'smooth', block:'start' }));
    if (step === 1) startEntrance();
  };
  const collapseToHome = () => showStep(1);

  enter.addEventListener('click', () => showStep(2));

  addEventListener('wheel', event => {
    if (performance.now() < lockedUntil || Math.abs(event.deltaY) < 8) return;
    if (step === 1) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!autoSpinning && page.classList.contains('is-entered')) targetPhase += event.deltaY * .0022;
      requestRender();
      return;
    }
    if (step === 2 && event.deltaY > 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showStep(3);
    } else if (step === 3 && event.deltaY < 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showStep(2);
    } else if (step === 2 && event.deltaY < 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      collapseToHome();
    }
  }, { capture:true, passive:false });

  addEventListener('touchstart', event => {
    touchStartY = event.touches[0]?.clientY || 0;
  }, { passive:true });
  addEventListener('touchend', event => {
    if (performance.now() < lockedUntil) return;
    const endY = event.changedTouches[0]?.clientY || touchStartY;
    const distance = touchStartY - endY;
    if (Math.abs(distance) < 45) return;
    if (step === 1) {
      targetPhase += Math.sign(distance) * Math.PI * .38;
      requestRender();
    } else if (step === 2 && distance > 0) showStep(3);
    else if (step === 3 && distance < 0) showStep(2);
    else if (step === 2 && distance < 0) collapseToHome();
  }, { passive:true });

  let pointerFrame = 0;
  page.addEventListener('pointermove', event => {
    if (reducedMotion || event.pointerType === 'touch' || pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      const box = page.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - .5) * 2;
      const y = ((event.clientY - Math.max(0, box.top)) / innerHeight - .5) * 2;
      camera.style.setProperty('--pointer-x', `${(x * .8).toFixed(2)}deg`);
      camera.style.setProperty('--pointer-y', `${(y * -.6).toFixed(2)}deg`);
      pointerFrame = 0;
    });
  }, { passive:true });
  page.addEventListener('pointerleave', () => {
    camera.style.setProperty('--pointer-x', '0deg');
    camera.style.setProperty('--pointer-y', '0deg');
  });
  addEventListener('resize', requestRender);
  startEntrance();
})();
