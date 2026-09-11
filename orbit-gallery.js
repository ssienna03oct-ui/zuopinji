if (homeView) {
  const works = [
    ['01.jpg', '二十四节气·春'], ['02.jpg', '二十四节气·夏'],
    ['03.jpg', '二十四节气·秋'], ['04.jpg', '二十四节气·冬'],
    ['05.jpg', '仲夏夜'], ['06.jpg', '小森林 1'],
    ['07.jpg', '小森林 2'], ['08.jpg', '春日自然主义'],
    ['09.jpg', '未标题'], ['10.jpg', '水果'],
    ['11.jpg', '热植主理人'], ['12.jpg', '猫咪日'],
    ['13.jpg', '猫咪驱虫前的准备工作'], ['14.jpg', '百鬼夜行'],
    ['15.jpg', '羽暖松间'], ['16.jpg', '餐具音乐会']
  ];
  const section = document.createElement('section');
  section.className = 'orbit-gallery';
  section.id = 'orbit-gallery';
  section.setAttribute('aria-label', '十六张插画组成的多形态环形画廊');
  section.innerHTML = `
    <header class="orbit-gallery-head">
      <p class="orbit-gallery-kicker">SELECTED ILLUSTRATIONS</p>
      <div class="orbit-gallery-modes" role="group" aria-label="选择画廊布局">
        <button class="orbit-gallery-mode is-active" type="button" data-mode="flat" aria-pressed="true">Flat</button>
        <button class="orbit-gallery-mode" type="button" data-mode="tilt" aria-pressed="false">Tilt</button>
        <button class="orbit-gallery-mode" type="button" data-mode="ring" aria-pressed="false">Ring</button>
        <button class="orbit-gallery-mode" type="button" data-mode="gallery" aria-pressed="false">Gallery</button>
      </div>
    </header>
    <div class="orbit-gallery-stage" tabindex="0" aria-label="拖拽、滚轮或方向键旋转插画圆环">
      ${works.map(([file, title], index) => `<figure class="orbit-gallery-card" style="--card-index:${index}" data-index="${index}"><span class="orbit-gallery-card-shell"><img src="assets/orbit-gallery/${file}" alt="${title}" loading="lazy" decoding="async" fetchpriority="low"></span></figure>`).join('')}
    </div>
    <footer class="orbit-gallery-foot"><p>SCROLL / DRAG TO EXPLORE</p><p class="orbit-gallery-index"><span>01</span> — 16</p></footer>`;
  document.querySelector('#illustration-worlds').after(section);

  const stage = section.querySelector('.orbit-gallery-stage');
  const cards = [...section.querySelectorAll('.orbit-gallery-card')];
  const buttons = [...section.querySelectorAll('.orbit-gallery-mode')];
  const indexLabel = section.querySelector('.orbit-gallery-index span');
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const phaseStep = Math.PI * 2 / cards.length;
  const modes = {
    flat:{rx:.425,ry:.355,centerY:0,orbitRotation:0,cardScale:1,scaleBack:1,scaleFront:1,opacityBack:1,rotateX:0,rotateY:0,rotateZ:0,skew:0,irregular:0,depthFlip:0},
    tilt:{rx:.485,ry:.07,centerY:.025,orbitRotation:0,cardScale:1,scaleBack:.92,scaleFront:1.48,opacityBack:.62,rotateX:4,rotateY:14,rotateZ:0,skew:.035,irregular:0,depthFlip:0},
    ring:{rx:.39,ry:.35,centerY:0,orbitRotation:-18,cardScale:.8,scaleBack:.66,scaleFront:1.34,opacityBack:.5,rotateX:2,rotateY:18,rotateZ:2.5,skew:.025,irregular:0,depthFlip:0},
    gallery:{rx:.465,ry:.035,centerY:.055,orbitRotation:0,cardScale:1,scaleBack:.42,scaleFront:1.82,opacityBack:.7,rotateX:0,rotateY:8,rotateZ:0,skew:0,irregular:0,depthFlip:0}
  };
  let modeName = 'flat';
  let previousMode = modes.flat;
  let currentMode = modes.flat;
  let renderedMode = modes.flat;
  let modeStartedAt = 0;
  let modeDuration = 900;
  let angle = -Math.PI / 2;
  let velocity = 0;
  let pointerId = null;
  let pointerX = 0;
  let pointerY = 0;
  let lastPointerTime = 0;
  let wheelTimer = 0;
  let snapTarget = null;
  let entering = false;
  let visible = false;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const ease = value => value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
  const mix = (from, to, progress) => from + (to - from) * progress;
  const interpolateMode = (from, to, progress) => Object.fromEntries(Object.keys(to).map(key => [key, mix(from[key], to[key], progress)]));
  const poseFor = (index, orbitAngle, mode, width, height) => {
    const a = orbitAngle + index * phaseStep;
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    const naturalDepth = (sin + 1) / 2;
    const depth = mix(naturalDepth, 1 - naturalDepth, mode.depthFlip);
    const orbitRotation = mode.orbitRotation * Math.PI / 180;
    const jitter = mode.irregular ? Math.sin(index * 2.37) : 0;
    const desiredRx = width * (mode.rx + jitter * .012 * mode.irregular);
    const desiredRy = height * (mode.ry + Math.cos(index * 1.71) * .014 * mode.irregular);
    const cardHalf = (cards[0]?.offsetWidth || 120) * Math.max(mode.scaleBack, mode.scaleFront) / 2;
    const availableX = Math.max(width * .2, width / 2 - cardHalf - 22);
    const availableY = Math.max(height * .18, height / 2 - cardHalf - 28 - Math.abs(height * mode.centerY));
    const projectedX = Math.abs(desiredRx * Math.cos(orbitRotation)) + Math.abs(desiredRy * Math.sin(orbitRotation)) + Math.abs(width * mode.skew);
    const projectedY = Math.abs(desiredRx * Math.sin(orbitRotation)) + Math.abs(desiredRy * Math.cos(orbitRotation)) + Math.abs(width * mode.skew * Math.sin(orbitRotation));
    const fit = Math.min(1, availableX / Math.max(1, projectedX), availableY / Math.max(1, projectedY));
    const rx = desiredRx * fit;
    const ry = desiredRy * fit;
    const rawX = cos * rx + sin * width * mode.skew * fit + jitter * width * .012 * mode.irregular;
    const rawY = sin * ry + Math.cos(index * 1.31) * height * .018 * mode.irregular;
    return {
      x:rawX * Math.cos(orbitRotation) - rawY * Math.sin(orbitRotation),
      y:height * mode.centerY + rawX * Math.sin(orbitRotation) + rawY * Math.cos(orbitRotation),
      scale:mix(mode.scaleBack, mode.scaleFront, depth) * mode.cardScale,
      opacity:mix(mode.opacityBack, 1, depth),
      rotateX:cos * mode.rotateX,
      rotateY:cos * mode.rotateY,
      rotateZ:(mode.rotateZ ? cos * mode.rotateZ : 0) + jitter * 4 * mode.irregular,
      depth
    };
  };
  const draw = time => {
    if (!visible && (!modeStartedAt || time - modeStartedAt > modeDuration)) {
      requestAnimationFrame(draw);
      return;
    }
    const box = stage.getBoundingClientRect();
    const rawProgress = modeStartedAt ? clamp((time - modeStartedAt) / modeDuration, 0, 1) : 1;
    const progress = ease(rawProgress);
    const mode = interpolateMode(previousMode, currentMode, progress);
    renderedMode = mode;
    const canMove = !prefersReducedMotion.matches;
    if (pointerId === null && canMove) {
      angle += velocity;
      if (snapTarget !== null) {
        velocity += (snapTarget - angle) * .016;
        velocity *= .86;
        if (Math.abs(snapTarget - angle) < .0003 && Math.abs(velocity) < .0002) {
          angle = snapTarget;
          velocity = 0;
          snapTarget = null;
        }
      } else {
        velocity *= .935;
        if (Math.abs(velocity) < .00001) velocity = 0;
      }
    }
    let frontIndex = 0;
    let frontDepth = -1;
    cards.forEach((card, index) => {
      const fromPose = poseFor(index, angle, previousMode, box.width, box.height);
      const toPose = poseFor(index, angle, currentMode, box.width, box.height);
      const pose = rawProgress < 1 ? {
        x:mix(fromPose.x, toPose.x, progress), y:mix(fromPose.y, toPose.y, progress),
        scale:mix(fromPose.scale, toPose.scale, progress), opacity:mix(fromPose.opacity, toPose.opacity, progress),
        rotateX:mix(fromPose.rotateX, toPose.rotateX, progress), rotateY:mix(fromPose.rotateY, toPose.rotateY, progress),
        rotateZ:mix(fromPose.rotateZ, toPose.rotateZ, progress), depth:mix(fromPose.depth, toPose.depth, progress)
      } : toPose;
      const arcLift = rawProgress < 1 ? Math.sin(Math.PI * progress) * (index % 2 ? 16 : -16) : 0;
      card.style.transform = `translate3d(calc(-50% + ${pose.x.toFixed(2)}px),calc(-50% + ${(pose.y + arcLift).toFixed(2)}px),${(pose.depth * 90).toFixed(1)}px) scale(${pose.scale.toFixed(4)}) rotateX(${pose.rotateX.toFixed(2)}deg) rotateY(${pose.rotateY.toFixed(2)}deg) rotateZ(${pose.rotateZ.toFixed(2)}deg)`;
      card.style.opacity = pose.opacity.toFixed(3);
      card.style.zIndex = String(10 + Math.round(pose.depth * 100));
      if (pose.depth > frontDepth) { frontDepth = pose.depth; frontIndex = index; }
    });
    indexLabel.textContent = String(frontIndex + 1).padStart(2, '0');
    requestAnimationFrame(draw);
  };

  const settle = () => {
    if (pointerId !== null || prefersReducedMotion.matches) return;
    snapTarget = Math.round(angle / phaseStep) * phaseStep;
  };
  const chooseMode = name => {
    if (name === modeName) return;
    previousMode = renderedMode;
    currentMode = modes[name];
    modeName = name;
    modeStartedAt = performance.now();
    modeDuration = prefersReducedMotion.matches ? 1 : 920;
    buttons.forEach(button => {
      const active = button.dataset.mode === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  buttons.forEach(button => button.addEventListener('click', () => chooseMode(button.dataset.mode)));
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastPointerTime = performance.now();
    velocity = 0;
    snapTarget = null;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(pointerId);
  });
  stage.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId) return;
    const now = performance.now();
    const delta = (event.clientX - pointerX) + (event.clientY - pointerY) * .35;
    const deltaAngle = delta / Math.max(320, stage.clientWidth) * Math.PI * 1.45;
    angle += deltaAngle;
    velocity = deltaAngle / Math.max(1, now - lastPointerTime) * 16.67;
    pointerX = event.clientX;
    pointerY = event.clientY;
    lastPointerTime = now;
  });
  const releasePointer = event => {
    if (event.pointerId !== pointerId) return;
    if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
    pointerId = null;
    stage.classList.remove('is-dragging');
    window.setTimeout(settle, 120);
  };
  stage.addEventListener('pointerup', releasePointer);
  stage.addEventListener('pointercancel', releasePointer);
  stage.addEventListener('wheel', event => {
    if (!visible || prefersReducedMotion.matches) return;
    const amount = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    snapTarget = null;
    velocity += clamp(amount, -90, 90) * .000045;
    clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(settle, 180);
  }, {passive:true});
  stage.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    velocity += (event.key === 'ArrowRight' ? 1 : -1) * .016;
    clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(settle, 180);
  });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (!visible || entering) return;
    entering = true;
    section.classList.add('is-entering');
    window.setTimeout(() => section.classList.remove('is-entering'), 1200);
  }, {threshold:.2});
  observer.observe(section);
  addEventListener('resize', settle, {passive:true});
  requestAnimationFrame(draw);
}
