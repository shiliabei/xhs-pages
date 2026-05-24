const { posts, categories, placeholderPages } = window.SITE_DATA;

const els = {
  searchInput: document.querySelector('#searchInput'),
  categoryTabs: document.querySelector('#categoryTabs'),
  statsLine: document.querySelector('#statsLine'),
  cardGrid: document.querySelector('#cardGrid'),
  discoverSection: document.querySelector('#discoverSection'),
  meSection: document.querySelector('#meSection'),
  placeholderSection: document.querySelector('#placeholderSection'),
  placeholderTitle: document.querySelector('#placeholderTitle'),
  placeholderText: document.querySelector('#placeholderText'),
  modal: document.querySelector('#detailModal'),
  modalClose: document.querySelector('#modalClose'),
  modalImage: document.querySelector('#modalImage'),
  modalVideo: document.querySelector('#modalVideo'),
  modalAvatar: document.querySelector('#modalAvatar'),
  modalAuthor: document.querySelector('#modalAuthor'),
  modalMeta: document.querySelector('#modalMeta'),
  modalTitle: document.querySelector('#modalTitle'),
  modalContent: document.querySelector('#modalContent'),
  modalTags: document.querySelector('#modalTags'),
  commentTitle: document.querySelector('#commentTitle'),
  commentList: document.querySelector('#commentList'),
  likeBtn: document.querySelector('#likeBtn'),
  favBtn: document.querySelector('#favBtn'),
  likeCount: document.querySelector('#likeCount'),
  favCount: document.querySelector('#favCount'),
  commentCount: document.querySelector('#commentCount'),
  prevMedia: document.querySelector('#prevMedia'),
  nextMedia: document.querySelector('#nextMedia'),
  mediaCounter: document.querySelector('#mediaCounter'),
  mediaDots: document.querySelector('#mediaDots')
};

let state = {
  category: '推荐',
  keyword: '',
  activePost: null,
  activeImageIndex: 0
};

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function getLocalState(postId, type) {
  return localStorage.getItem(`xhs-demo-${type}-${postId}`) === '1';
}

function setLocalState(postId, type, value) {
  localStorage.setItem(`xhs-demo-${type}-${postId}`, value ? '1' : '0');
}

function getLikeTotal(post) {
  return safeNumber(post.baseLikes) + (getLocalState(post.id, 'like') ? 1 : 0);
}

function getFavoriteTotal(post) {
  return safeNumber(post.baseFavorites) + (getLocalState(post.id, 'fav') ? 1 : 0);
}

function countComments(comments = []) {
  return comments.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies || []);
  }, 0);
}

function formatNumber(num) {
  const value = safeNumber(num);
  if (value >= 10000) return `${(value / 10000).toFixed(1).replace('.0', '')}万`;
  return String(value);
}

function createCategoryTabs() {
  els.categoryTabs.innerHTML = categories.map(category => `
    <button class="category-tab ${category === state.category ? 'active' : ''}" data-category="${category}">${category}</button>
  `).join('');

  els.categoryTabs.querySelectorAll('.category-tab').forEach(button => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategoryTabs();
      renderCards();
    });
  });
}

function renderCategoryTabs() {
  els.categoryTabs.querySelectorAll('.category-tab').forEach(button => {
    button.classList.toggle('active', button.dataset.category === state.category);
  });
}

function getCoverImage(post) {
  const index = safeNumber(post.coverIndex);
  return post.images?.[index] || post.images?.[0] || '';
}

function isVideoSource(src = '') {
  return /\.(mp4|webm|ogg)$/i.test(src.split('?')[0]);
}

function getFilteredPosts() {
  const keyword = state.keyword.trim().toLowerCase();
  return posts.filter(post => {
    const matchCategory = state.category === '推荐' || post.category === state.category;
    const haystack = [
      post.title,
      post.author,
      post.content,
      post.category,
      ...(post.tags || [])
    ].join(' ').toLowerCase();
    const matchKeyword = !keyword || haystack.includes(keyword);
    return matchCategory && matchKeyword;
  });
}

function renderCards() {
  const list = getFilteredPosts();
  els.statsLine.textContent = `当前展示 ${list.length} 条笔记，数据来自 js/data.js，评论数会自动递归统计。`;

  if (!list.length) {
    els.cardGrid.innerHTML = `<div class="empty-state">没有找到相关笔记，换个关键词试试。</div>`;
    return;
  }

  els.cardGrid.innerHTML = list.map(post => {
    const cover = getCoverImage(post);
    const commentTotal = countComments(post.comments);
    const badge = post.type === 'video'
      ? `<span class="video-badge">▶</span>`
      : (post.images?.length > 1 ? `<span class="multi-badge">${post.images.length}</span>` : '');
    const coverMedia = isVideoSource(cover)
      ? `<video src="${cover}" muted playsinline preload="metadata"></video>`
      // ? `<video src="${cover}" muted autoplay loop playsinline preload="metadata"></video>`
      : `<img src="${cover}" alt="${post.title} 封面" loading="lazy" />`;

    return `
      <article class="note-card" data-post-id="${post.id}" tabindex="0" aria-label="打开 ${post.title}">
        <div class="cover-wrap">
          ${coverMedia}
          ${badge}
        </div>
        <h2 class="card-title">${post.title}</h2>
        <div class="card-footer">
          <div class="author-mini">
            <img src="${post.avatar}" alt="${post.author} 头像" />
            <span>${post.author}</span>
          </div>
          <div class="card-actions">
            <span>♡ ${formatNumber(getLikeTotal(post))}</span>
            <span>💬 ${formatNumber(commentTotal)}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  els.cardGrid.querySelectorAll('.note-card').forEach(card => {
    const open = () => openModal(card.dataset.postId);
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter') open();
    });
  });
}

function showSection(section) {
  document.querySelectorAll('.side-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });

  if (section === 'discover') {
    els.discoverSection.hidden = false;
    els.discoverSection.classList.add('show');
    els.meSection.hidden = true;
    els.placeholderSection.hidden = true;
    return;
  }

  if (section === 'me') {
    els.discoverSection.hidden = true;
    els.meSection.hidden = false;
    els.placeholderSection.hidden = true;
    return;
  }

  const page = placeholderPages[section] || { title: '功能待开发', text: '这里已经预留了入口。' };
  els.placeholderTitle.textContent = page.title;
  els.placeholderText.textContent = page.text;
  els.discoverSection.hidden = true;
  els.meSection.hidden = true;
  els.placeholderSection.hidden = false;
}

function openModal(postId) {
  const post = posts.find(item => item.id === postId);
  if (!post) return;

  state.activePost = post;
  state.activeImageIndex = safeNumber(post.coverIndex);
  if (state.activeImageIndex >= post.images.length) state.activeImageIndex = 0;

  els.modal.classList.add('show');
  els.modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  renderModal();
}

function closeModal() {
  els.modalVideo.pause();
  els.modalVideo.removeAttribute('src');
  els.modalVideo.load();
  els.modal.classList.remove('show');
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  state.activePost = null;
}

function renderModal() {
  const post = state.activePost;
  if (!post) return;

  const media = post.images[state.activeImageIndex] || getCoverImage(post);
  const commentTotal = countComments(post.comments);

  if (isVideoSource(media)) {
    els.modalImage.style.display = 'none';
    els.modalImage.removeAttribute('src');
    els.modalVideo.style.display = 'block';
    els.modalVideo.src = media;
  } else {
    els.modalVideo.pause();
    els.modalVideo.style.display = 'none';
    els.modalVideo.removeAttribute('src');
    els.modalImage.style.display = 'block';
    els.modalImage.src = media;
    els.modalImage.alt = `${post.title} 第 ${state.activeImageIndex + 1} 张图`;
  }
  els.modalAvatar.src = post.avatar;
  els.modalAuthor.textContent = post.author;
  els.modalMeta.textContent = `${post.date || ''}${post.location ? ` · ${post.location}` : ''}`;
  els.modalTitle.textContent = post.title;
  els.modalContent.textContent = post.content || '';
  els.modalTags.innerHTML = (post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('');
  els.commentTitle.textContent = `共 ${commentTotal} 条评论`;
  els.commentCount.textContent = formatNumber(commentTotal);

  els.likeCount.textContent = formatNumber(getLikeTotal(post));
  els.favCount.textContent = formatNumber(getFavoriteTotal(post));
  els.likeBtn.classList.toggle('active', getLocalState(post.id, 'like'));
  els.favBtn.classList.toggle('active', getLocalState(post.id, 'fav'));

  els.prevMedia.style.display = post.images.length > 1 ? 'grid' : 'none';
  els.nextMedia.style.display = post.images.length > 1 ? 'grid' : 'none';
  els.mediaCounter.textContent = `${state.activeImageIndex + 1}/${post.images.length}`;
  els.mediaCounter.style.display = post.images.length > 1 ? 'block' : 'none';
  els.mediaDots.innerHTML = post.images.map((_, index) => `
    <button class="media-dot ${index === state.activeImageIndex ? 'active' : ''}" data-index="${index}" aria-label="第 ${index + 1} 张"></button>
  `).join('');

  els.mediaDots.querySelectorAll('.media-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      state.activeImageIndex = Number(dot.dataset.index);
      renderModal();
    });
  });

  els.commentList.innerHTML = renderComments(post.comments || []);
}

function renderComments(comments = [], isReply = false) {
  if (!comments.length && !isReply) {
    return `<div class="empty-state" style="min-height: 110px;">暂时没有评论，后续可在 data.js 中添加。</div>`;
  }

  return comments.map(comment => `
    <div class="comment-item ${isReply ? 'reply' : ''}">
      <img class="comment-avatar" src="${comment.avatar}" alt="${comment.user} 头像" />
      <div>
        <div class="comment-name">${comment.user}</div>
        <div class="comment-text">${comment.text}</div>
        <div class="comment-meta"><span>${comment.time || ''}</span><span>♡ ${formatNumber(comment.likes || 0)}</span><span>回复</span></div>
      </div>
    </div>
    ${comment.replies?.length ? renderComments(comment.replies, true) : ''}
  `).join('');
}

function switchImage(direction) {
  const post = state.activePost;
  if (!post || post.images.length <= 1) return;
  const total = post.images.length;
  state.activeImageIndex = (state.activeImageIndex + direction + total) % total;
  renderModal();
}

function bindEvents() {
  els.searchInput.addEventListener('input', event => {
    state.keyword = event.target.value;
    showSection('discover');
    renderCards();
  });

  document.querySelectorAll('[data-section]').forEach(button => {
    button.addEventListener('click', () => {
      showSection(button.dataset.section);
    });
  });

  els.modalClose.addEventListener('click', closeModal);
  els.modal.addEventListener('click', event => {
    if (event.target === els.modal) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (!state.activePost) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') switchImage(-1);
    if (event.key === 'ArrowRight') switchImage(1);
  });

  els.prevMedia.addEventListener('click', () => switchImage(-1));
  els.nextMedia.addEventListener('click', () => switchImage(1));

  els.likeBtn.addEventListener('click', () => {
    const post = state.activePost;
    if (!post) return;
    setLocalState(post.id, 'like', !getLocalState(post.id, 'like'));
    renderModal();
    renderCards();
  });

  els.favBtn.addEventListener('click', () => {
    const post = state.activePost;
    if (!post) return;
    setLocalState(post.id, 'fav', !getLocalState(post.id, 'fav'));
    renderModal();
    renderCards();
  });
}

createCategoryTabs();
renderCards();
bindEvents();
