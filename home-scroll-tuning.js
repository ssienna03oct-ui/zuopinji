(() => {
  if (!document.body.classList.contains('home-view')) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const groups = [
    {section:document.querySelector('.home-identity'), target:document.querySelector('.home-identity')},
    {section:document.querySelector('.project-board-section'), target:document.querySelector('.project-board-heading')},
    {section:document.querySelector('.illustration-worlds'), target:document.querySelector('.illustration-worlds')}
  ].filter(item => item.section && item.target);
  let frame = 0;
  const update = () => {
    groups.forEach(({section,target}) => {
      const rect = section.getBoundingClientRect();
      const progress = reducedMotion ? 0 : Math.max(0,Math.min(1,-rect.top/(innerHeight*.72)));
      target.style.setProperty('--home-title-scale',(1-progress*.3).toFixed(3));
      target.style.setProperty('--home-title-y',`${(-progress*18).toFixed(1)}px`);
      target.style.setProperty('--home-title-opacity',(1-progress*.22).toFixed(3));
    });
    frame=0;
  };
  const requestUpdate=()=>{if(!frame) frame=requestAnimationFrame(update)};
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate);
  requestUpdate();
})();
