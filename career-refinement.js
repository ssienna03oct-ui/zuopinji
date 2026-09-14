// Editorial information remains independent of the cover movie.
const identity = document.createElement('section');
identity.className = 'home-identity';
identity.innerHTML = '<p>欧阳雨晴 / PORTFOLIO 2026</p><h1>视觉设计师</h1><p>以品牌识别为核心，连接插画与 IP 的创意表达。</p><a href="#selected-projects">查看精选项目 ↘</a>';
document.querySelector('.home-hero').before(identity);
const textNav = document.createElement('nav');
textNav.className = 'home-text-nav';
textNav.setAttribute('aria-label', '主要导航');
textNav.innerHTML = '<a href="?view=home#selected-projects-board">作品</a><a href="?view=about#page-001">关于我</a><a href="mailto:1263247471@qq.com">联系 ↗</a>';
document.querySelector('.home-header').append(textNav);
const replay = document.createElement('button');
replay.type = 'button'; replay.className = 'cover-replay'; replay.innerHTML = '<svg viewBox="0 0 48 64" aria-hidden="true"><path d="M4 24L24 4L44 24M24 4V60" /></svg>'; replay.setAttribute('aria-label', '重播封面动画');
replay.addEventListener('click', () => {
  replay.hidden = true;
  if (document.body.classList.contains('live-cover-ready')) liveCover.contentWindow.postMessage({type:'cover-replay'}, '*');
  else replayHomeCover();
});
document.querySelector('.home-cover-stage').append(replay);
document.querySelector('.home-bubble-controls button:last-child').hidden = true;
const liveCover = document.createElement('iframe');
liveCover.className = 'live-cover'; liveCover.title = '圆圈与房子交互封面';
if (homeView) {
  addEventListener('message', event => {
    if (event.source !== liveCover.contentWindow) return;
    if (event.data?.type === 'cover-ready') {
      document.body.classList.add('live-cover-ready');
      homeCoverMotion.pause();
      replay.hidden = true;
    }
    if (event.data?.type === 'cover-playing') replay.hidden = true;
    if (event.data?.type === 'cover-complete') replay.hidden = false;
  });
  liveCover.src = 'cover-live/index.html';
  document.querySelector('.home-cover-stage').append(liveCover);
  document.querySelectorAll('.home-bubble-controls button').forEach((button, index) => {
    button.addEventListener('click', () => liveCover.contentWindow.postMessage({type:'cover-tap',index}, '*'));
  });
}
homeCoverMotion.addEventListener('timeupdate', () => {
  if (!document.body.classList.contains('live-cover-ready') && homeCoverMotion.currentTime >= homeCoverFreezeTime) replay.hidden = false;
});
homeCoverMotion.addEventListener('error', () => { replay.hidden = false; });
document.querySelector('.home-footer-role p').textContent = 'VISUAL DESIGNER';
document.querySelector('.home-collection-hint')?.remove();
document.querySelector('.home-collection-heading p').textContent = 'ILLUSTRATION & IP';
if (homeView) {
  const boardSection = document.createElement('section');
  boardSection.className = 'project-board-section';
  boardSection.id = 'selected-projects-board';
  boardSection.innerHTML = `
    <header class="project-board-heading">
      <h2>Brand design</h2>
      <p>From branding to illustration,<br />creating a visual world with a distinct personality.</p>
    </header>
    <div class="project-board-layout">
      <p class="project-board-side project-board-part">Part 1.</p>
      <div class="project-card-grid" role="group" aria-label="八个精选项目，卡片会依次翻面">
      <div class="project-flip-card crop-tl" data-side="front"><div class="project-card-inner">
        <span class="project-card-face project-card-front" aria-hidden="true"><img src="assets/project-boards/frame-1.svg" alt="" loading="lazy" decoding="async" /></span>
        <span class="project-card-face project-card-back" aria-hidden="true" inert><img src="assets/project-boards/frame-2.svg" alt="" loading="lazy" decoding="async" /></span>
      </div></div>
      <div class="project-flip-card crop-tr" data-side="back"><div class="project-card-inner">
        <a class="project-card-face project-card-front" href="?project=haochao" aria-label="查看好巢项目" inert><img src="assets/project-boards/frame-1.svg" alt="" loading="lazy" decoding="async" /></a>
        <a class="project-card-face project-card-back" href="?project=haochao" aria-label="查看好巢项目"><img src="assets/project-boards/frame-2.svg" alt="" loading="lazy" decoding="async" /></a>
      </div></div>
      <div class="project-flip-card crop-bl" data-side="front"><div class="project-card-inner">
        <a class="project-card-face project-card-front" href="?project=nomaster" aria-label="查看 NoMaster 项目"><img src="assets/project-boards/frame-1.svg" alt="" loading="lazy" decoding="async" /></a>
        <a class="project-card-face project-card-back" href="?project=nomaster" aria-label="查看 NoMaster 项目" inert><img src="assets/project-boards/frame-2.svg" alt="" loading="lazy" decoding="async" /></a>
      </div></div>
      <div class="project-flip-card crop-br" data-side="back"><div class="project-card-inner">
        <a class="project-card-face project-card-front" href="?project=veccirc" aria-label="查看 VECGIRC 项目" inert><img src="assets/project-boards/frame-1.svg" alt="" loading="lazy" decoding="async" /></a>
        <a class="project-card-face project-card-back" href="?project=veccirc" aria-label="查看 VECGIRC 项目"><img src="assets/project-boards/frame-2.svg" alt="" loading="lazy" decoding="async" /></a>
      </div></div>
      </div>
      <p class="project-board-side project-board-year">2026</p>
    </div>`;
  document.querySelector('.home-intro').before(boardSection);
  document.body.classList.add('board-projects-ready');
  const flipCards = [...boardSection.querySelectorAll('.project-flip-card')];
  const flipCard = async (card, axis, direction) => {
    if (card.dataset.turning === 'true') return;
    card.dataset.turning = 'true';
    const inner = card.querySelector('.project-card-inner');
    const front = card.querySelector('.project-card-front');
    const back = card.querySelector('.project-card-back');
    const toBack = card.dataset.side !== 'back';
    const currentFace = toBack ? front : back;
    const nextFace = toBack ? back : front;
    const duration = 520;
    front.inert = back.inert = true;
    card.classList.add('is-turning');
    currentFace.style.transform = `rotate${axis}(0deg)`;
    nextFace.style.transform = `rotate${axis}(${-direction * 180}deg)`;
    const animation = inner.animate(
      [{transform:`rotate${axis}(0deg)`},{transform:`rotate${axis}(${direction * 180}deg)`}],
      {duration,easing:'cubic-bezier(.45,.05,.25,1)',fill:'forwards'}
    );
    await animation.finished;
    animation.cancel();
    currentFace.style.transform = '';
    nextFace.style.transform = '';
    card.dataset.side = toBack ? 'back' : 'front';
    card.classList.remove('is-turning');
    front.inert = toBack; back.inert = !toBack;
    card.dataset.turning = 'false';
  };
  if (!reducedMotion.matches) {
    const sequence = [[0,'Y',-1],[1,'X',1],[2,'Y',1],[3,'X',-1]];
    let inView = false;
    let timer;
    let step = 0;
    let flipIndex = 0;
    const cycleCards = () => {
      const [index,baseAxis,direction] = sequence[step];
      const axis = Math.floor(flipIndex / 4) % 2 ? (baseAxis === 'Y' ? 'X' : 'Y') : baseAxis;
      const card = flipCards[index];
      if (inView && !document.hidden && !card.matches(':hover') && !card.matches(':focus-within')) flipCard(card,axis,direction);
      step = (step + 1) % sequence.length;
      flipIndex += 1;
      const delay = step === 0 ? 1500 : 720;
      timer = window.setTimeout(cycleCards,delay);
    };
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      if (inView && !timer) timer = window.setTimeout(cycleCards,500);
    }, {threshold:.18});
    observer.observe(boardSection);
  }
}
const facts = {
  haochao: ['商业项目 · 已落地', 'Logo 更新与创意', '围绕东方生活方式的品牌更新', '从旧标志到新标志，关注品牌气质与识别表达的变化。', '已落地；本案例中的职责范围为 Logo 更新与创意。'],
  nomaster: ['概念项目 · 独立完成', '品牌视觉设计', '宠物拥有自己的生活', '围绕品牌概念展开标志、角色与传播语言，呈现不同视觉形式的组合。', '虚拟项目，用于展示完整的视觉创意与系统延展。'],
  veccirc: ['概念项目 · 独立完成', '品牌视觉设计', '从雕塑造型到品牌图形', '以实体造型与二维图形之间的联系，呈现具有个人辨识度的品牌表达。', '虚拟项目；雕塑背景与图形转译是本案例的重点。'],
  daidai: ['概念项目 · 独立完成', 'IP 形象设计', '从角色设定到场景延展', '通过角色设定、三视图与应用，展示 IP 的形象与延展可能。', '虚拟项目。'],
  crocs: ['概念项目 · 独立完成', '插画与创意视觉', '以插画构建色彩世界', '以人物、图形与色彩组织视觉画面，探索插画在品牌场景中的表达。', '自主虚拟项目，非 Crocs 官方委托或联名合作。']
};
const features = document.querySelector('.home-feature-grid');
const haochaoCard = features.querySelector('a[href="?project=haochao"]').closest('article');
const nomasterCard = features.querySelector('a[href="?project=nomaster"]').closest('article');
haochaoCard.className = 'home-project home-project-wide col-12';
nomasterCard.className = 'home-project col-12 col-md-6';
features.prepend(haochaoCard);
features.querySelectorAll('article').forEach(article => {
  const key = new URL(article.querySelector('a').href).searchParams.get('project');
  article.querySelector('p').textContent = facts[key][0];
  article.querySelector('span').textContent = facts[key][1] + ' →';
});
if (project && facts[activeProject]) {
  const fact = facts[activeProject];
  const overview = document.createElement('section');
  overview.className = 'case-overview'; overview.id = 'case-overview';
  const eyebrow = document.createElement('p'); eyebrow.textContent = fact[0];
  const title = document.createElement('h1'); title.textContent = project.title;
  const heading = document.createElement('h2'); heading.textContent = fact[2];
  const description = document.createElement('p'); description.textContent = fact[3];
  const role = document.createElement('p'); role.textContent = '我的职责 / ' + fact[1];
  const status = document.createElement('p'); status.className = 'case-status'; status.textContent = fact[4];
  const link = document.createElement('a'); link.href = '#page-' + pad(project.start); link.textContent = '浏览设计内容 ↓';
  overview.append(eyebrow, title, heading, description, role, status, link);
  pages.prepend(overview);
  const end = document.createElement('section'); end.className = 'case-overview case-next';
  const order = ['haochao','nomaster','veccirc','daidai','crocs'];
  const next = order[(order.indexOf(activeProject) + 1) % order.length];
  end.innerHTML = `<p>继续浏览</p><a href="?project=${next}">下一个项目 / ${projects[next].title} ↗</a><a href="?view=home">返回首页</a>`;
  pages.append(end);
}
// Keep the target heading accessible when following the home navigation.
if (homeView && ['#selected-projects', '#selected-projects-board'].includes(location.hash)) {
  addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView())));
}
