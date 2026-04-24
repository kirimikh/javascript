const container = document.getElementById("posts-container");
const searchInput = document.getElementById("search");
const statusArea = document.getElementById("status-area");
const loadMoreBtn = document.getElementById("load-more");
const sentinel = document.getElementById("sentinel");

let currentPage = 1;
let currentQuery = "";
const limit = 10;
let isFetching = false;
let hasMore = true;
let debounceTimer;

function renderPosts(posts, append = false) {
  const html = posts
    .map(
      (post) => `
        <div class="post">
            <h3>${post.title}</h3>
            <p>${post.body}</p>
        </div>
    `,
    )
    .join("");

  if (append) {
    container.insertAdjacentHTML("beforeend", html);
  } else {
    container.innerHTML = html;
  }
}

async function fetchPosts(page, query = "", replace = false) {
  if (isFetching) return;
  isFetching = true;

  statusArea.innerHTML = '<div class="loader">Загрузка...</div>';
  loadMoreBtn.disabled = true;

  const url = `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}&q=${query}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Не удалось загрузить данные");

    const data = await response.json();
    statusArea.innerHTML = "";

    if (data.length === 0) {
      if (page === 1) {
        container.innerHTML = '<div class="empty">Ничего не найдено</div>';
      }
      hasMore = false;
      loadMoreBtn.textContent = "Больше постов нет";
    } else {
      renderPosts(data, !replace);
      hasMore = data.length === limit;
      loadMoreBtn.textContent = hasMore ? "Загрузить ещё" : "Конец списка";
      loadMoreBtn.disabled = !hasMore;
    }
  } catch (err) {
    statusArea.innerHTML = `<div class="error">Ошибка: ${err.message}</div>`;
  } finally {
    isFetching = false;
  }
}

searchInput.oninput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    currentQuery = searchInput.value;
    currentPage = 1;
    hasMore = true;
    fetchPosts(currentPage, currentQuery, true);
  }, 300);
};

loadMoreBtn.onclick = () => {
  if (hasMore && !isFetching) {
    currentPage++;
    fetchPosts(currentPage, currentQuery);
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && hasMore && !isFetching) {
      currentPage++;
      fetchPosts(currentPage, currentQuery);
    }
  },
  { threshold: 0.1 },
);

observer.observe(sentinel);

fetchPosts(currentPage);
