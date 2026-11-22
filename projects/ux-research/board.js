const board = document.querySelector('.board-grid');
const firstItem = board.querySelector('.board-item');
let masonry;

function arrangeCards() {
  masonry?.destroy();
  masonry = new Masonry(board, {
    itemSelector: '.board-item',
    columnWidth: firstItem.getBoundingClientRect().width,
    percentPosition: true,
    resize: false,
    transitionDuration: 0
  });

  
  const cards = [...board.querySelectorAll('.card')];
  const bounds = cards.map(card => card.getBoundingClientRect());
  const expectedColumns = Math.round(board.clientWidth / firstItem.getBoundingClientRect().width);
  const actualColumns = new Set(bounds.map(card => Math.round(card.left))).size;
  const overlaps = bounds.some((a, index) => bounds.slice(index + 1).some(b =>
    a.left < b.right - 1 && a.right > b.left + 1 &&
    a.top < b.bottom - 1 && a.bottom > b.top + 1
  ));

  if (actualColumns !== expectedColumns || overlaps) {
    masonry.destroy();
    masonry = undefined;
  }
}

if (typeof Masonry === 'function') {
  window.addEventListener('load', arrangeCards, { once: true });
  window.addEventListener('resize', arrangeCards);
}
