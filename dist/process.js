/* Scroll colors geometry only. Text is always present and readable, even without JS. */
(() => {
  const section = document.querySelector('.process');
  if (!section) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const rows = [...section.querySelectorAll('.process-step')].map(element => ({
    element, panel: element.querySelector('.process-panel'),
    path: element.querySelector('.process-blue'), progress: 0, length: 1, height: 1
  }));
  const clamp = value => Math.max(0, Math.min(1, value));
  let frame = 0, needsMeasure = true;
  function measure() {
    rows.forEach(row => {
      const w = row.panel.clientWidth, h = row.panel.clientHeight;
      // Preserve navbar angle until narrow/tall cards require a bounded cut.
      const cut = Math.min(h * .3014, w * .14), y = 54;
      row.panel.style.setProperty('--panel-cut', `${cut}px`);
      const x = 1 + cut * (y - 1) / Math.max(1, h - 2);
      const d = `M ${x} ${y} L 1 1 L ${w-cut-1} 1 L ${w-1} ${h-1} L ${cut+1} ${h-1} Z`;
      row.panel.querySelectorAll('path').forEach(path => path.setAttribute('d', d));
      row.length = row.path.getTotalLength();
      row.path.style.strokeDasharray = row.length;
      row.height = row.element.offsetHeight;
    });
    needsMeasure = false;
  }
  function render() {
    frame = 0;
    if (needsMeasure) measure();
    // All reads before writes; includes rows skipped in a single fast scroll jump.
    const tops = rows.map(row => row.element.getBoundingClientRect().top);
    rows.forEach((row, i) => {
      const candidate = reduced.matches ? 1 : clamp((innerHeight * .82 - tops[i]) / Math.min(row.height, innerHeight * .44));
      row.progress = Math.max(row.progress, candidate);
      const p = row.progress;
      const node = i === rows.length - 1 ? 1 : Math.min(1,79 / row.height);
      const stem = node * clamp(p/.22) + (1-node) * clamp((p-.85)/.15);
      row.element.style.setProperty('--stem', stem);
      row.element.style.setProperty('--badge', clamp((p-.16)/.18));
      row.element.style.setProperty('--branch', clamp((p-.29)/.17));
      row.path.style.strokeDashoffset = row.length * (1-clamp((p-.4)/.5));
    });
    section.classList.add('is-ready');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  const resize = () => { needsMeasure = true; schedule(); };
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', resize, {passive:true});
  addEventListener('pageshow', resize);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(resize).observe(section.querySelector('.process-steps'));
  document.fonts?.ready.then(resize);
  render();
})();
