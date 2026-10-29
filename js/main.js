/* ==========================================
   ПОРТФОЛИО ЯРОСЛАВА (Atlix_TT)
   Основной скрипт — навигация, тема, модалки, анимации
   ========================================== */

// === Данные проектов для модального окна ===
const PROJECTS = {
  kindergarten: {
    tag: 'Курсовая работа',
    title: 'Учёт детей в детском саду',
    // TODO: указать реальную технологию реализации
    tech: 'TODO: указать технологию',
    features: [
      'Главная панель со статистикой (всего детей, групп, воспитателей, присутствующих сегодня)',
      'Быстрые действия с главного экрана',
      'Боковое меню: Главная, Дети, Группы, Воспитатели, Родители, Журнал посещаемости, Электронный журнал, Мероприятия, Пользователи, Логи системы, Настройки',
      'Список детей с поиском, добавлением и удалением',
    ],
    images: [
      { src: 'assets/works/ЛицоПриложения.png', alt: 'Главная панель приложения' },
      { src: 'assets/works/ДетскаяГруппа.png', alt: 'Список детей в группе' },
      { src: 'assets/works/ПанельНавигации.png', alt: 'Боковое меню навигации' },
    ],
  },
};

// === Инициализация после загрузки DOM ===
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBurger();
  initActiveNav();
  initScrollAnimations();
  initSkillBars();
  initModal();
  initHeaderShadow();
  renderAiLog();
});

// ------------------------------------------
// 1. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
// ------------------------------------------
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Определяем начальную тему: localStorage → системная настройка
  const saved = localStorage.getItem('theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

// ------------------------------------------
// 2. БУРГЕР-МЕНЮ
// ------------------------------------------
function initBurger() {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const links = nav.querySelectorAll('.nav__link');

  // Открыть / закрыть меню
  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    burger.classList.toggle('is-active', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Закрыть меню при клике на ссылку
  links.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Закрыть меню при клике вне навигации
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !burger.contains(e.target)) {
      nav.classList.remove('is-open');
      burger.classList.remove('is-active');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
}

// ------------------------------------------
// 3. ПОДСВЕТКА АКТИВНОГО ПУНКТА НАВИГАЦИИ
// ------------------------------------------
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  // Наблюдатель: когда секция попадает в видимую область
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('data-section') === id);
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px', // срабатывает, когда секция в верхней трети экрана
    }
  );

  sections.forEach(section => observer.observe(section));
}

// ------------------------------------------
// 4. ТЕНЬ ШАПКИ ПРИ ПРОКРУТКЕ
// ------------------------------------------
function initHeaderShadow() {
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ------------------------------------------
// 5. АНИМАЦИИ ПОЯВЛЕНИЯ СЕКЦИЙ
// ------------------------------------------
function initScrollAnimations() {
  // Если пользователь предпочитает без анимаций — показываем всё сразу
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // анимация один раз
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ------------------------------------------
// 6. АНИМАЦИЯ ПОЛОСОК НАВЫКОВ
// ------------------------------------------
function initSkillBars() {
  const fills = document.querySelectorAll('.skill__fill');

  // Если предпочитают без анимаций — показываем сразу
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fills.forEach(fill => fill.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  fills.forEach(fill => observer.observe(fill));
}

// ------------------------------------------
// 7. МОДАЛЬНОЕ ОКНО
// ------------------------------------------
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('modal-close');
  let previousFocus = null; // запоминаем, откуда открыли

  // Открытие по клику на карточку проекта
  document.querySelectorAll('.work-card[data-project]').forEach(card => {
    const handler = () => openModal(card.dataset.project);
    card.addEventListener('click', handler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handler();
      }
    });
  });

  // Закрытие
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });

  function openModal(projectId) {
    const project = PROJECTS[projectId];
    if (!project) return;

    // Заполняем содержимое
    document.getElementById('modal-tag').textContent = project.tag;
    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-tech').textContent = '🛠 ' + project.tech;

    // Список возможностей
    const featuresList = document.getElementById('modal-features-list');
    featuresList.innerHTML = project.features
      .map(f => `<li>${f}</li>`)
      .join('');

    // Галерея скриншотов
    const gallery = document.getElementById('modal-gallery');
    gallery.innerHTML = project.images
      .map(img => `<img src="${img.src}" alt="${img.alt}" loading="lazy">`)
      .join('');

    // Показываем модалку
    previousFocus = document.activeElement;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeBtn.focus();

    // Ловушка фокуса: Tab циклит внутри модалки
    modal.addEventListener('keydown', trapFocus);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modal.removeEventListener('keydown', trapFocus);

    // Возвращаем фокус туда, откуда открыли
    if (previousFocus) previousFocus.focus();
  }

  // Ловушка фокуса: Tab и Shift+Tab остаются внутри модалки
  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

// ------------------------------------------
// 8. ОТРИСОВКА РАЗДЕЛА «КАК СОЗДАВАЛСЯ САЙТ»
// ------------------------------------------
function renderAiLog() {
  // Проверяем, что данные загружены
  if (typeof AI_LOG_DATA === 'undefined') return;

  renderModelsTable();
  renderTimeline();
  renderSummary();
}

// Таблица использованных моделей
function renderModelsTable() {
  const container = document.getElementById('models-table');
  if (!container || !AI_LOG_DATA.models.length) return;

  const rows = AI_LOG_DATA.models
    .map(m => `<tr><td>${m.name}</td><td>${m.usage}</td></tr>`)
    .join('');

  container.innerHTML = `
    <table class="process__table">
      <thead>
        <tr>
          <th>Нейросеть</th>
          <th>Для чего использована</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// Таймлайн шагов
function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container || !AI_LOG_DATA.steps.length) return;

  container.innerHTML = AI_LOG_DATA.steps.map(step => {
    const ratingClass = step.rating === 'good' ? 'timeline__badge--good' : 'timeline__badge--warning';
    const ratingIcon = step.rating === 'good' ? '✅' : '⚠️';
    const noteHtml = step.note
      ? `<div class="timeline__detail"><span class="timeline__detail-label">Момент:</span><span class="timeline__detail-value">${step.note}</span></div>`
      : '';

    return `
      <div class="timeline__item">
        <div class="timeline__dot"></div>
        <div class="timeline__item-title">Шаг ${step.id}. ${step.title}</div>
        <div class="timeline__item-model">${step.model}</div>
        <div class="timeline__details">
          <div class="timeline__detail">
            <span class="timeline__detail-label">Хотели:</span>
            <span class="timeline__detail-value">${step.wanted}</span>
          </div>
          <div class="timeline__detail">
            <span class="timeline__detail-label">Получили:</span>
            <span class="timeline__detail-value">${step.got}</span>
          </div>
          <div class="timeline__detail">
            <span class="timeline__detail-label">Поправили:</span>
            <span class="timeline__detail-value">${step.fixed}</span>
          </div>
          ${noteHtml}
          <span class="timeline__badge ${ratingClass}">${ratingIcon} ${step.ratingText}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Итоговый блок
function renderSummary() {
  const container = document.getElementById('process-summary');
  if (!container || !AI_LOG_DATA.summary) return;

  const s = AI_LOG_DATA.summary;
  container.innerHTML = `
    <div class="process__summary animate-on-scroll">
      <h3>Итоги</h3>
      <div class="process__summary-item">
        <strong>Чему научился:</strong>
        <p>${s.learned}</p>
      </div>
      <div class="process__summary-item">
        <strong>Где ИИ помог:</strong>
        <p>${s.aiHelped}</p>
      </div>
      <div class="process__summary-item">
        <strong>Где ИИ ошибался:</strong>
        <p>${s.aiMistakes}</p>
      </div>
      <div class="process__summary-item">
        <strong>Что пришлось проверять руками:</strong>
        <p>${s.manualChecks}</p>
      </div>
    </div>
  `;
}
