const api = {
  async request(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || '请求失败');
      error.status = response.status;
      throw error;
    }
    return data;
  },
  me: () => api.request('/api/me'),
  posts: () => api.request('/api/posts'),
  login: (payload) => api.request('/api/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload) => api.request('/api/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => api.request('/api/logout', { method: 'POST' }),
  deleteAccount: () => api.request('/api/account', { method: 'DELETE' }),
  toggleLike: (postId) => api.request(`/api/posts/${postId}/like`, { method: 'POST' }),
  toggleFavorite: (postId) => api.request(`/api/posts/${postId}/favorite`, { method: 'POST' }),
  comment: (postId, text) => api.request(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text })
  }),
  deleteComment: (postId, commentId) => api.request(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE'
  })
};

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
  commentForm: document.querySelector('#commentForm'),
  commentInput: document.querySelector('#commentInput'),
  likeBtn: document.querySelector('#likeBtn'),
  favBtn: document.querySelector('#favBtn'),
  likeCount: document.querySelector('#likeCount'),
  favCount: document.querySelector('#favCount'),
  commentCount: document.querySelector('#commentCount'),
  prevMedia: document.querySelector('#prevMedia'),
  nextMedia: document.querySelector('#nextMedia'),
  mediaCounter: document.querySelector('#mediaCounter'),
  mediaDots: document.querySelector('#mediaDots'),
  authOpenBtn: document.querySelector('#authOpenBtn'),
  authModal: document.querySelector('#authModal'),
  authCloseBtn: document.querySelector('#authCloseBtn'),
  authTitle: document.querySelector('#authTitle'),
  authForm: document.querySelector('#authForm'),
  authUsername: document.querySelector('#authUsername'),
  authPassword: document.querySelector('#authPassword'),
  authSubmitBtn: document.querySelector('#authSubmitBtn'),
  authSwitchBtn: document.querySelector('#authSwitchBtn'),
  authMessage: document.querySelector('#authMessage'),
  userMenu: document.querySelector('#userMenu'),
  userName: document.querySelector('#userName'),
  logoutBtn: document.querySelector('#logoutBtn'),
  deleteAccountBtn: document.querySelector('#deleteAccountBtn')
};

const placeholderPages = {
  live: ['直播功能待开发', '这里可以继续接直播列表、预约卡片、直播间预告等模块。'],
  publish: ['发布功能待开发', '目前先做本地测试版，后续可以继续扩展发布笔记和上传图片。'],
  notice: ['通知中心', '点赞、收藏、评论已经接入本地后端，通知列表可以在下一步扩展。'],
  me: ['我的主页', '登录后可以点赞、收藏、评论，也可以在右上角注销本地账号。'],
  more: ['更多功能', '这里可以放设置、帮助中心、夜间模式等入口。'],
  about: ['关于本项目', '这是 Flask + SQLite 的本地测试版，所有账号和互动数据只保存在你的电脑里。'],
  creator: ['创作中心', '后续可以加入草稿、数据看板、内容管理。'],
  business: ['业务合作', '这里预留合作说明和表单入口。']
};

let state = {
  user: null,
  posts: [],
  categories: [],
  category: '推荐',
  keyword: '',
  activePost: null,
  activeImageIndex: 0,
  authMode: 'login'
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function safeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function formatNumber(num) {
  const value = safeNumber(num);
  if (value >= 10000) return `${(value / 10000).toFixed(1).replace('.0', '')}万`;
  return String(value);
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
  return state.posts.filter((post) => {
    const matchCategory = state.category === '推荐' || post.category === state.category;
    const haystack = [post.title, post.author, post.content, post.category, ...(post.tags || [])].join(' ').toLowerCase();
    return matchCategory && (!keyword || haystack.includes(keyword));
  });
}

function getActivePost() {
  return state.posts.find((post) => post.id === state.activePost?.id) || state.activePost;
}

function renderUser() {
  if (state.user) {
    els.authOpenBtn.hidden = true;
    els.userMenu.hidden = false;
    els.userName.textContent = state.user.username;
    els.commentInput.placeholder = '写下你的评论';
    els.commentInput.disabled = false;
  } else {
    els.authOpenBtn.hidden = false;
    els.userMenu.hidden = true;
    els.userName.textContent = '';
    els.commentInput.placeholder = '登录后写评论';
    els.commentInput.disabled = true;
  }
}

function createCategoryTabs() {
  els.categoryTabs.innerHTML = state.categories.map((category) => `
    <button class="category-tab ${category === state.category ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join('');

  els.categoryTabs.querySelectorAll('.category-tab').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategoryTabs();
      renderCards();
    });
  });
}

function renderCategoryTabs() {
  els.categoryTabs.querySelectorAll('.category-tab').forEach((button) => {
    button.classList.toggle('active', button.dataset.category === state.category);
  });
}

function renderCards() {
  const list = getFilteredPosts();
  els.statsLine.textContent = `当前展示 ${list.length} 条笔记。登录后可点赞、收藏、评论，刷新后数据仍保留在本地 SQLite。`;

  if (!list.length) {
    els.cardGrid.innerHTML = '<div class="empty-state">没有找到相关笔记，换个关键词试试。</div>';
    return;
  }

  els.cardGrid.innerHTML = list.map((post) => {
    const cover = getCoverImage(post);
    const badge = post.type === 'video'
      ? '<span class="video-badge">▶</span>'
      : (post.images?.length > 1 ? `<span class="multi-badge">${post.images.length}</span>` : '');
    const coverMedia = isVideoSource(cover)
      ? `<video src="${escapeHtml(cover)}" muted playsinline preload="metadata"></video>`
      : `<img src="${escapeHtml(cover)}" alt="${escapeHtml(post.title)} 封面" loading="lazy" />`;

    return `
      <article class="note-card" data-post-id="${escapeHtml(post.id)}" tabindex="0" aria-label="打开 ${escapeHtml(post.title)}">
        <div class="cover-wrap">
          ${coverMedia}
          ${badge}
        </div>
        <h2 class="card-title">${escapeHtml(post.title)}</h2>
        <div class="card-footer">
          <div class="author-mini">
            <img src="${escapeHtml(post.avatar)}" alt="${escapeHtml(post.author)} 头像" />
            <span>${escapeHtml(post.author)}</span>
          </div>
          <div class="card-actions">
            <span>♥ ${formatNumber(post.likeCount)}</span>
            <span>评论 ${formatNumber(post.commentCount)}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  els.cardGrid.querySelectorAll('.note-card').forEach((card) => {
    const open = () => openModal(card.dataset.postId);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') open();
    });
  });
}

function showSection(section) {
  document.querySelectorAll('.side-item').forEach((item) => {
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

  const page = placeholderPages[section] || ['功能待开发', '这里已经预留了入口。'];
  els.placeholderTitle.textContent = page[0];
  els.placeholderText.textContent = page[1];
  els.discoverSection.hidden = true;
  els.meSection.hidden = true;
  els.placeholderSection.hidden = false;
}

function openModal(postId) {
  const post = state.posts.find((item) => item.id === postId);
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
  const post = getActivePost();
  if (!post) return;
  state.activePost = post;

  const media = post.images[state.activeImageIndex] || getCoverImage(post);

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
  els.modalTags.innerHTML = (post.tags || []).map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join('');
  els.commentTitle.textContent = `共 ${post.commentCount} 条评论`;
  els.commentCount.textContent = formatNumber(post.commentCount);
  els.likeCount.textContent = formatNumber(post.likeCount);
  els.favCount.textContent = formatNumber(post.favoriteCount);
  els.likeBtn.classList.toggle('active', post.likedByMe);
  els.favBtn.classList.toggle('active', post.favoritedByMe);
  els.commentList.innerHTML = renderComments(post.comments || []);

  els.prevMedia.style.display = post.images.length > 1 ? 'grid' : 'none';
  els.nextMedia.style.display = post.images.length > 1 ? 'grid' : 'none';
  els.mediaCounter.textContent = `${state.activeImageIndex + 1}/${post.images.length}`;
  els.mediaCounter.style.display = post.images.length > 1 ? 'block' : 'none';
  els.mediaDots.innerHTML = post.images.map((_, index) => `
    <button class="media-dot ${index === state.activeImageIndex ? 'active' : ''}" data-index="${index}" aria-label="第 ${index + 1} 张"></button>
  `).join('');

  els.mediaDots.querySelectorAll('.media-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      state.activeImageIndex = Number(dot.dataset.index);
      renderModal();
    });
  });
}

function renderComments(comments = []) {
  if (!comments.length) {
    return '<div class="empty-state comment-empty">暂时没有评论，登录后抢个沙发。</div>';
  }

  return comments.map((comment) => `
    <div class="comment-item" data-comment-id="${escapeHtml(comment.id)}">
      <img class="comment-avatar" src="${escapeHtml(comment.avatar)}" alt="${escapeHtml(comment.username)} 头像" />
      <div class="comment-body">
        <div class="comment-name">${escapeHtml(comment.username)}</div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
        <div class="comment-meta"><span>${escapeHtml(comment.createdAt)}</span></div>
      </div>
      ${comment.canDelete ? `
        <div class="comment-more">
          <button class="comment-more-btn" type="button" aria-label="更多操作" aria-expanded="false">...</button>
          <div class="comment-menu" hidden>
            <button class="comment-delete-btn" type="button">删除</button>
          </div>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function closeCommentMenus(exceptButton = null) {
  els.commentList.querySelectorAll('.comment-more-btn').forEach((button) => {
    if (button === exceptButton) return;
    button.setAttribute('aria-expanded', 'false');
    const menu = button.nextElementSibling;
    if (menu) menu.hidden = true;
  });
}

function switchImage(direction) {
  const post = getActivePost();
  if (!post || post.images.length <= 1) return;
  const total = post.images.length;
  state.activeImageIndex = (state.activeImageIndex + direction + total) % total;
  renderModal();
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isLogin = mode === 'login';
  els.authTitle.textContent = isLogin ? '登录本地账号' : '注册本地账号';
  els.authSubmitBtn.textContent = isLogin ? '登录' : '注册';
  els.authSwitchBtn.textContent = isLogin ? '没有账号？注册一个' : '已有账号？去登录';
  els.authMessage.textContent = '';
}

function openAuth(mode = 'login') {
  setAuthMode(mode);
  els.authModal.classList.add('show');
  els.authModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => els.authUsername.focus(), 0);
}

function closeAuth() {
  els.authModal.classList.remove('show');
  els.authModal.setAttribute('aria-hidden', 'true');
  els.authForm.reset();
  els.authMessage.textContent = '';
}

function requireLogin() {
  if (state.user) return true;
  openAuth('login');
  return false;
}

async function loadData() {
  const [meData, postsData] = await Promise.all([api.me(), api.posts()]);
  state.user = meData.user;
  state.posts = postsData.posts;
  state.categories = postsData.categories;
  if (!state.categories.includes(state.category)) state.category = state.categories[0] || '推荐';
  renderUser();
  createCategoryTabs();
  renderCards();
  if (state.activePost) renderModal();
}

async function refreshPosts() {
  const postsData = await api.posts();
  state.posts = postsData.posts;
  state.categories = postsData.categories;
  renderCards();
  if (state.activePost) renderModal();
}

function bindEvents() {
  els.searchInput.addEventListener('input', (event) => {
    state.keyword = event.target.value;
    showSection('discover');
    renderCards();
  });

  document.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => showSection(button.dataset.section));
  });

  els.modalClose.addEventListener('click', closeModal);
  els.modal.addEventListener('click', (event) => {
    if (event.target === els.modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (els.authModal.classList.contains('show') && event.key === 'Escape') closeAuth();
    if (!state.activePost) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') switchImage(-1);
    if (event.key === 'ArrowRight') switchImage(1);
  });

  els.prevMedia.addEventListener('click', () => switchImage(-1));
  els.nextMedia.addEventListener('click', () => switchImage(1));

  els.likeBtn.addEventListener('click', async () => {
    const post = getActivePost();
    if (!post || !requireLogin()) return;
    await api.toggleLike(post.id);
    await refreshPosts();
  });

  els.favBtn.addEventListener('click', async () => {
    const post = getActivePost();
    if (!post || !requireLogin()) return;
    await api.toggleFavorite(post.id);
    await refreshPosts();
  });

  els.commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const post = getActivePost();
    const text = els.commentInput.value.trim();
    if (!post || !text || !requireLogin()) return;
    await api.comment(post.id, text);
    els.commentInput.value = '';
    await refreshPosts();
  });

  els.commentList.addEventListener('click', async (event) => {
    const moreButton = event.target.closest('.comment-more-btn');
    if (moreButton) {
      const menu = moreButton.nextElementSibling;
      const willOpen = menu?.hidden;
      closeCommentMenus(moreButton);
      moreButton.setAttribute('aria-expanded', String(Boolean(willOpen)));
      if (menu) menu.hidden = !willOpen;
      return;
    }

    const deleteButton = event.target.closest('.comment-delete-btn');
    if (!deleteButton) return;
    const post = getActivePost();
    const commentItem = deleteButton.closest('.comment-item');
    if (!post || !commentItem) return;
    const ok = window.confirm('确定删除这条评论吗？');
    if (!ok) return;
    await api.deleteComment(post.id, commentItem.dataset.commentId);
    await refreshPosts();
  });

  document.addEventListener('click', (event) => {
    if (!els.commentList.contains(event.target)) closeCommentMenus();
  });

  els.authOpenBtn.addEventListener('click', () => openAuth('login'));
  els.authCloseBtn.addEventListener('click', closeAuth);
  els.authModal.addEventListener('click', (event) => {
    if (event.target === els.authModal) closeAuth();
  });
  els.authSwitchBtn.addEventListener('click', () => setAuthMode(state.authMode === 'login' ? 'register' : 'login'));

  els.authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      username: els.authUsername.value.trim(),
      password: els.authPassword.value
    };
    try {
      const data = state.authMode === 'login' ? await api.login(payload) : await api.register(payload);
      state.user = data.user;
      closeAuth();
      await refreshPosts();
      renderUser();
    } catch (error) {
      els.authMessage.textContent = error.message;
    }
  });

  els.logoutBtn.addEventListener('click', async () => {
    await api.logout();
    state.user = null;
    renderUser();
    await refreshPosts();
  });

  els.deleteAccountBtn.addEventListener('click', async () => {
    const ok = window.confirm('确定要注销当前本地账号吗？账号、评论、点赞和收藏都会从本机 SQLite 中删除。');
    if (!ok) return;
    await api.deleteAccount();
    state.user = null;
    renderUser();
    await refreshPosts();
  });
}

bindEvents();
loadData().catch((error) => {
  els.cardGrid.innerHTML = `<div class="empty-state">后端未启动或请求失败：${escapeHtml(error.message)}</div>`;
});
