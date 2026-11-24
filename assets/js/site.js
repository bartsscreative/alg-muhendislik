const nav = document.querySelector('#site-nav');
const menu = document.querySelector('.menu-toggle');
const compact = matchMedia('(max-width: 900px)');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const dropdowns = [...nav.querySelectorAll('details')];

function setMenu(open) {
  nav.hidden = compact.matches && !open;
  nav.classList.toggle('menu-open', compact.matches && open);
  menu.setAttribute('aria-expanded', String(compact.matches && open));
  if (!open) dropdowns.forEach(item => { item.open = false; });
}

function syncMenu() {
  if (!compact.matches) setMenu(false);
  if (!compact.matches && document.activeElement === menu) nav.querySelector('a').focus();
  menu.hidden = !compact.matches;
  if (compact.matches && nav.contains(document.activeElement)) menu.focus();
  setMenu(false);
}

function openService() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches('.service-card')) target.open = true;
}

syncMenu();
openService();
compact.addEventListener('change', syncMenu);
window.addEventListener('hashchange', openService);
menu.addEventListener('click', () => setMenu(nav.hidden));
nav.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  const target = document.getElementById(link.hash.slice(1));
  if (target?.matches('.service-card')) target.open = true;
  setMenu(false);
  if (target && target !== document.body) {
    const focusTarget = target.querySelector('summary') && target.matches('.service-card')
      ? target.querySelector('summary')
      : target;
    if (!focusTarget.matches('summary')) focusTarget.tabIndex = -1;
    focusTarget.focus({ preventScroll: true });
  }
});
dropdowns.forEach(item => item.addEventListener('toggle', () => {
  if (item.open) dropdowns.filter(other => other !== item).forEach(other => { other.open = false; });
}));
document.addEventListener('click', event => {
  dropdowns.filter(item => !item.contains(event.target)).forEach(item => { item.open = false; });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const open = dropdowns.find(item => item.open);
  if (open) {
    open.open = false;
    open.querySelector('summary').focus();
  } else if (compact.matches && !nav.hidden) {
    setMenu(false);
    menu.focus();
  }
});

const hero = document.querySelector('.hero');
const slides = [...hero.querySelectorAll('.slide')];
const controls = hero.querySelector('.slider-controls');
const dots = [...controls.querySelectorAll('.dot')];
const toggle = controls.querySelector('.slide-toggle');
let current = 0;
let playing = !motion.matches;
let timer;
let touchStart;

function showSlide(index) {
  current = (index + slides.length) % slides.length;
  slides.forEach((slide, position) => {
    slide.classList.toggle('active', position === current);
    dots[position].setAttribute('aria-pressed', String(position === current));
  });
}

function schedule() {
  clearTimeout(timer);
  if (playing && !document.hidden) timer = setTimeout(() => {
    showSlide(current + 1);
    schedule();
  }, 6000);
}

function setPlaying(value) {
  playing = value;
  toggle.setAttribute('aria-label', value ? 'Otomatik geçişi durdur' : 'Otomatik geçişi başlat');
  toggle.querySelector('use').setAttribute('href', 'assets/icons/icons.svg#' + (value ? 'pause' : 'play'));
  schedule();
}

if (slides.length > 1) {
  controls.hidden = false;
  setPlaying(playing);
  toggle.addEventListener('click', () => setPlaying(!playing));
  motion.addEventListener('change', event => { if (event.matches) setPlaying(false); });
  document.addEventListener('visibilitychange', schedule);
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    setPlaying(false);
    showSlide(index);
  }));
  controls.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setPlaying(false);
    showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
    dots[current].focus();
  });
  hero.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  hero.addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.clientX;
    const dy = touch.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
    setPlaying(false);
    showSlide(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  hero.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
}

if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(({ target }) => {
      target.classList.add('reveal');
      observer.unobserve(target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.service-card').forEach(card => observer.observe(card));
}

