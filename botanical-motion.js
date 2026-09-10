if (homeView) {
  const makeLetters = text => [...text].map((letter, index) =>
    `<span style="--letter-index:${index}">${letter === ' ' ? '&nbsp;' : letter}</span>`
  ).join('');

  const botanicalSection = document.createElement('section');
  botanicalSection.className = 'botanical-motion';
  botanicalSection.id = 'botanical-motion';
  botanicalSection.setAttribute('aria-label', '欧阳雨晴视觉设计动态画板');
  botanicalSection.innerHTML = `
    <div class="botanical-stage">
      <div class="botanical-tilt">
        <div class="botanical-camera">
          <div class="botanical-plant-tilt">
            <object class="botanical-art" data="assets/botanical-motion.svg?v=20260910-5" type="image/svg+xml" aria-label="泡泡、水滴、花瓶与生长花朵组成的动态视觉画板"></object>
            <svg class="botanical-vase-overlay" viewBox="0 0 1920 1080" aria-hidden="true">
              <g class="botanical-vase">
                <path d="M858.7 708.05C863.89 711.28 871.12 713.08 877.22 713.15C926.87 713.72 976.61 701.09 1019.98 676.91C1023.28 675.07 1026.98 672.45 1026.91 668.67C1026.84 664.89 1019.73 663.57 1017.12 655.95C1013.28 644.74 931.87 660.5 922.03 662.95C899.06 668.65 861.2 676.62 849.81 700.41C841.91 716.9 847.97 741.3 847.02 758.97C845.05 795.62 839.16 832.46 835.22 868.95C834.4 876.59 833.62 884.62 836.62 891.7C841.84 904.03 856.29 909.14 869.21 912.67C900.64 921.26 933.05 928.54 965.54 926.12C998.03 923.7 1031.03 910.33 1050.64 884.3C1071.96 856.01 1074.37 816.97 1065.43 782.7C1056.49 748.43 1037.56 717.75 1018.88 687.66" fill="none" stroke="#603813" stroke-miterlimit="10"/>
                <path class="botanical-vase-water" d="M848.5 852.29C844.72 862.29 848.66 873.97 855.93 881.8C863.2 889.63 873.28 894.23 883.38 897.74C920.58 910.68 963.19 910.85 998.25 892.91C1033.32 874.97 1059.04 837.46 1057.83 798.09C1028.12 816.36 996.84 835.15 962.03 837.36C944.28 838.48 925.19 835.46 909.72 844.21C905.61 846.53 901.95 849.61 897.74 851.75C884.8 858.31 869.27 854.96 848.49 852.29H848.5Z" fill="#29ABE2" stroke="#603813" stroke-miterlimit="10"/>
                <text class="botanical-vase-name" x="866" y="768" fill="#111"><tspan x="866" dy="0">OU</tspan><tspan x="866" dy="19">YANG</tspan><tspan x="866" dy="19">YU</tspan><tspan x="866" dy="19">QING</tspan></text>
              </g>
            </svg>
          </div>
        </div>
      </div>
      <p class="botanical-copy botanical-copy-left" aria-label="品牌，插画，产品">${makeLetters('品牌○插画○产品')}</p>
      <p class="botanical-copy botanical-copy-right" aria-label="平面，动效，交互">${makeLetters('平面○动效○交互')}</p>
    </div>`;
  document.querySelector('#illustration-worlds').after(botanicalSection);

  const stage = botanicalSection.querySelector('.botanical-stage');
  const tilt = botanicalSection.querySelector('.botanical-tilt');
  let art = botanicalSection.querySelector('.botanical-art');
  const plant = botanicalSection.querySelector('.botanical-plant-tilt');
  let vaseTarget = 0;
  let vaseRotation = 0;
  let readyToReplay = true;
  let completionTimer = 0;

  const animateVase = () => {
    vaseRotation += (vaseTarget - vaseRotation) * .1;
    if (plant) {
      const squeeze = 1 - Math.abs(vaseRotation) * .0025;
      plant.style.transform = `perspective(900px) rotateY(${vaseRotation.toFixed(2)}deg) rotate(${(vaseRotation * .08).toFixed(2)}deg) scaleX(${squeeze.toFixed(3)})`;
    }
    requestAnimationFrame(animateVase);
  };
  animateVase();

  const replayAnimation = () => {
    const replacement = art.cloneNode(true);
    art.replaceWith(replacement);
    art = replacement;
    window.clearTimeout(completionTimer);
    botanicalSection.classList.remove('is-complete');
    botanicalSection.classList.remove('is-playing');
    void botanicalSection.offsetWidth;
    botanicalSection.classList.add('is-playing');
    completionTimer = window.setTimeout(() => botanicalSection.classList.add('is-complete'), 6650);
  };

  const observer = new IntersectionObserver(entries => {
    const entry = entries[0];
    if (entry.intersectionRatio < .16) readyToReplay = true;
    if (entry.intersectionRatio < .48 || !readyToReplay) return;
    readyToReplay = false;
    replayAnimation();
  }, {threshold:[.16,.48]});
  observer.observe(botanicalSection);

  stage.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    if (!botanicalSection.classList.contains('is-complete')) {
      vaseTarget = 0;
      return;
    }
    const box = stage.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    vaseTarget = Math.max(-1, Math.min(1, x * 2)) * 12;
  });
  stage.addEventListener('pointerleave', () => {
    vaseTarget = 0;
  });
}
