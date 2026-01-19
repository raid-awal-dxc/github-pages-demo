// assets/js/app.js
// Sustainability Hub – Core App Utilities (with completion & profile helpers)

(function () {
  const THEME_KEY = 'susthub:theme';
  const PROGRESS_KEY = 'susthub:progress:v1'; // { [courseId]: { [moduleId]: {complete:bool, score:number} } }
  const NAME_KEY = 'susthub:learner-name';

  // Theme handling
  const prefer = localStorage.getItem(THEME_KEY) || 'dark';
  document.documentElement.setAttribute('data-theme', prefer);

  const toggles = document.querySelectorAll('[data-action="toggle-theme"]');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
  });

  // Progress API
  function readProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
    catch { return {}; }
  }
  function writeProgress(state) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  }
  function setModuleComplete(courseId, moduleId, score = null) {
    const s = readProgress();
    if (!s[courseId]) s[courseId] = {};
    if (!s[courseId][moduleId]) s[courseId][moduleId] = {};
    s[courseId][moduleId].complete = true;
    if (score !== null) s[courseId][moduleId].score = score;
    writeProgress(s);
  }
  function getCourseProgress(courseId, modules = []) {
    const s = readProgress();
    const items = s[courseId] || {};
    const done = modules.filter(m => items[m.id]?.complete).length;
    const pct = modules.length ? Math.round((done / modules.length) * 100) : 0;
    return { done, total: modules.length, pct };
  }
  function isCourseCompleted(course) {
    const s = readProgress()[course.id] || {};
    const total = course.modules.length;
    const done = course.modules.filter(m => s[m.id]?.complete).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const passPct = window.QUIZ_PASS_PCT || 70;
    const allQuizzesPassed = course.modules
      .filter(m => m.quiz)
      .every(m => (s[m.id]?.score || 0) >= passPct);
    return { done, total, pct, allQuizzesPassed, completed: pct === 100 && allQuizzesPassed };
  }

  // Learner name helpers (for certificates)
  function getLearnerName() {
    return localStorage.getItem(NAME_KEY) || '';
  }
  function setLearnerName(n) {
    if (typeof n === 'string') localStorage.setItem(NAME_KEY, n.trim());
  }

  window.SustHub = {
    setModuleComplete,
    getCourseProgress,
    readProgress,
    isCourseCompleted,
    getLearnerName,
    setLearnerName
  };

  // Mark active nav item
  const currentPath = location.pathname.split('/').pop();
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Render course cards (index / catalog)
  function renderCourseCards(targetSelector, courses) {
    const mount = document.querySelector(targetSelector);
    if (!mount || !Array.isArray(courses)) return;
    mount.innerHTML = courses.map(c => {
      const p = window.SustHub.getCourseProgress(c.id, c.modules).pct;
      return `
        <article class="card" aria-labelledby="card-${c.id}">
          <div class="badge">${c.level}</div>
          <h3 id="card-${c.id}">${c.title}</h3>
          <p class="meta">${c.category} • ~${c.estimate} mins • ${c.modules.length} modules</p>
          <p>${c.summary}</p>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}">
            <span style="width: ${p}%"></span>
          </div>
          <div>
            <a class="btn" href="course.html?id=${encodeURIComponent(c.id)}">View course</a>
          </div>
        </article>
      `;
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (window.COURSES) {
      const featured = window.COURSES.slice(0, 6);
      renderCourseCards('#featured-courses', featured);
      renderCourseCards('#catalog-courses', window.COURSES);
    }
  });
})();
