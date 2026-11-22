const shelf = document.querySelector('.bookshelf');
const originals = [...shelf.children];
const count = originals.length;
const before = originals.map(item => item.cloneNode(true));
const after = originals.map(item => item.cloneNode(true));
shelf.prepend(...before);
shelf.append(...after);
const items = [...shelf.children];
let selected = count;
let scheduled = false;

function centerOf(index) {
  const item = items[index];
  return shelf.scrollLeft + item.getBoundingClientRect().left - shelf.getBoundingClientRect().left + item.getBoundingClientRect().width / 2 - shelf.clientWidth / 2;
}
function markSelected(index) {
  selected = index;
  items.forEach((item, position) => {
    item.classList.toggle('is-focused', position === index);
    if (position !== index) item.querySelector('.opening-book').classList.remove('is-open');
  });
  [index - 1, index, index + 1].forEach(position => {
    const neighbor = items[position];
    if (!neighbor) return;
    neighbor.querySelectorAll('iframe[data-src]').forEach(frame => {
      if (!frame.hasAttribute('src')) frame.src = frame.dataset.src;
    });
  });
}
function updateFocus() {
  if (document.body.classList.contains('camera-entering')) { scheduled = false; return; }
  const middle = shelf.getBoundingClientRect().left + shelf.clientWidth / 2;
  let nearest = selected;
  let distance = Infinity;
  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const delta = Math.abs(rect.left + rect.width / 2 - middle);
    if (delta < distance) { nearest = index; distance = delta; }
  });
  markSelected(nearest);
  scheduled = false;
}
function goTo(index, smooth = true) {
  shelf.scrollTo({left: centerOf(index), behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant'});
}
shelf.addEventListener('scroll', () => {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateFocus); }
}, {passive:true});
shelf.addEventListener('scrollend', () => {
  if (document.body.classList.contains('camera-entering')) return;
  if (selected < count || selected >= count * 2) {
    const normalized = count + selected % count;
    goTo(normalized, false);
    markSelected(normalized);
  }
});
items.forEach((item, index) => {
  const book = item.querySelector('.opening-book');
  book.tabIndex = 0;
  const open = item.querySelector('.inside-page a');
  open.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (document.body.classList.contains('camera-entering')) return;
    const destination = item.querySelector('.inside-page a').getAttribute('href');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.assign(destination);
      return;
    }
    markSelected(index);
    open.setAttribute('aria-busy', 'true');
    const frame = item.querySelector('.inside-page iframe');
    const bounds = frame.getBoundingClientRect();
    const initialScale = bounds.width / window.innerWidth;
    item.classList.add('active-project', 'zoom-project');
    document.body.classList.add('camera-entering');
    frame.style.transition = 'none';
    frame.style.width = window.innerWidth + 'px';
    frame.style.height = window.innerHeight + 'px';
    frame.style.transformOrigin = '0 0';
    frame.style.transform = 'translate(' + bounds.left + 'px,' + bounds.top + 'px) scale(' + initialScale + ')';
    
    frame.getBoundingClientRect();
    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;
      frame.removeEventListener('transitionend', onTransition);
      document.body.classList.add('reading-project');
      frame.removeAttribute('tabindex');
      frame.focus({preventScroll:true});
      try {
        const updateReturnBlur = () => {
          const distance = frame.contentWindow.scrollY;
          const amount = Math.min(1, Math.max(0, distance / 240));
          document.body.style.setProperty('--return-blur-progress', amount);
        };
        frame.contentWindow.addEventListener('scroll', updateReturnBlur, {passive:true});
        frame.addEventListener('load', () => {
          frame.contentWindow.addEventListener('scroll', updateReturnBlur, {passive:true});
          updateReturnBlur();
        });
        updateReturnBlur();
      } catch {
        document.body.style.setProperty('--return-blur-progress', 0);
      }

    };
    const onTransition = event => {
      if (event.target === frame && event.propertyName === 'transform') land();
    };
    frame.addEventListener('transitionend', onTransition);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      frame.style.transition = 'transform .95s cubic-bezier(.22,.6,.25,1)';
      frame.style.transform = 'translate(0px,0px) scale(1)';
    }));
    window.setTimeout(land, 1200);

  });

});
document.getElementById('previous-project').addEventListener('click', () => goTo(Math.max(0, selected - 1)));
document.getElementById('next-project').addEventListener('click', () => goTo(Math.min(items.length - 1, selected + 1)));
window.addEventListener('load', () => { goTo(count, false); markSelected(count); });
window.addEventListener('resize', () => goTo(selected, false));

window.addEventListener('pageshow', () => {
  document.querySelectorAll('.project-portal').forEach(portal => portal.remove());
  document.body.classList.remove('entering-project', 'camera-entering');
  document.querySelectorAll('.destination-frame').forEach(frame => frame.remove());
  const scene = document.querySelector('main');
  scene.removeAttribute('inert');
  scene.style.transition = '';
  scene.style.transform = '';
  scene.style.transformOrigin = '';
  document.querySelectorAll('.launching').forEach(item => item.classList.remove('launching'));
  document.querySelectorAll('.inside-page a').forEach(link => link.removeAttribute('aria-busy'));
});

function fitBookPreviews() {
  if (document.body.classList.contains('camera-entering')) return;
  document.querySelectorAll('.opening-book').forEach(book => {
    const scale = book.clientWidth / window.innerWidth;
    book.querySelectorAll('.live-project').forEach(frame => {
      frame.style.width = window.innerWidth + 'px';
      frame.style.height = window.innerHeight + 'px';
      frame.style.transform = 'scale(' + scale + ')';
    });
  });
}
window.addEventListener('load', fitBookPreviews);
window.addEventListener('resize', fitBookPreviews);
fitBookPreviews();

const returnButton = document.createElement('button');
returnButton.type = 'button';
returnButton.className = 'return-to-shelf';
returnButton.textContent = 'Back to Portfolio';
returnButton.addEventListener('click', () => {
  document.body.classList.remove('reading-project', 'camera-entering');
  document.body.style.setProperty('--return-blur-progress', 0);
  document.querySelectorAll('.active-project').forEach(item => {
    const book = item.querySelector('.opening-book');
    book.style.transform = '';
    book.style.transition = '';
    item.classList.remove('active-project', 'zoom-project');
    const frame = item.querySelector('.inside-page iframe');
    frame.style.transition = '';
    frame.style.transformOrigin = '';
  });
  const scene = document.querySelector('main');
  scene.style.transition = '';
  scene.style.transform = '';
  scene.style.transformOrigin = '';
  scene.style.transition = '';
  document.querySelectorAll('.inside-page a').forEach(link => link.removeAttribute('aria-busy'));
  fitBookPreviews();
  items[selected].querySelector('.opening-book').focus({preventScroll:true});
});
const returnStrip = document.createElement('div');
returnStrip.className = 'portfolio-return-strip';
returnStrip.append(returnButton);
document.body.append(returnStrip);
