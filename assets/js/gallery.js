// ----- Filtering -----
const btns = document.querySelectorAll('.filter-btn');
const items = document.querySelectorAll('.masonry .item');
btns.forEach((b) =>
  b.addEventListener('click', () => {
    btns.forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    const f = b.dataset.filter;
    items.forEach((it) => {
      const show = f === '*' || it.dataset.category === f;
      it.style.display = show ? '' : 'none';
    });
  }),
);

// ----- Lightbox with image + video support -----
const dlg = document.getElementById('lightbox');
const lbInner = document.querySelector('.lb-inner');
const lbImg = document.getElementById('lbImg');
const lbCap = document.getElementById('lbCaption');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
const lbClose = document.getElementById('lbClose');

const figures = Array.from(document.querySelectorAll('.masonry figure'));
let idx = -1;

function clearMedia() {
  // remove any injected video and restore image element
  const v = lbInner.querySelector('video.lb-video');
  if (v) {
    try {
      v.pause();
    } catch (e) {}
    v.remove();
  }
  lbImg.style.display = '';
  lbImg.removeAttribute('src');
  lbImg.removeAttribute('alt');
}

function openAt(i) {
  idx = i;
  const fig = figures[idx];
  const type = fig.dataset.type || 'image';
  const captionText = fig.querySelector('figcaption')?.textContent || '';
  lbCap.textContent = captionText;

  clearMedia();

  if (type === 'video') {
    const src = fig.dataset.src;
    const poster = fig.dataset.poster || '';
    lbImg.style.display = 'none';
    const vid = document.createElement('video');
    vid.className = 'lb-video';
    vid.src = src;
    vid.poster = poster;
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.style.maxWidth = '100%';
    vid.style.maxHeight = '86vh';
    lbInner.insertBefore(vid, lbCap);
  } else {
    const img = fig.querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || '';
  }

  if (typeof dlg.showModal === 'function') {
    dlg.showModal();
  } else {
    dlg.setAttribute('open', '');
  }
}

function closeLB() {
  clearMedia();
  if (dlg.open) dlg.close();
  else dlg.removeAttribute('open');
}

function step(dir) {
  idx = (idx + dir + figures.length) % figures.length;
  openAt(idx);
}

figures.forEach((fig, i) => {
  fig.addEventListener('click', () => openAt(i));
});

lbPrev.addEventListener('click', () => step(-1));
lbNext.addEventListener('click', () => step(1));
lbClose.addEventListener('click', closeLB);
dlg.addEventListener('click', (e) => {
  if (e.target === dlg) closeLB();
});
window.addEventListener('keydown', (e) => {
  if (!dlg.open) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});
