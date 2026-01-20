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

  // Progress API - now uses Supabase if available
  async function readProgress() {
    try {
      const user = await getUser();
      if (user) {
        const supabase = initSupabase();
        const { data, error } = await supabase
          .from('progress')
          .select('course_id, module_id, complete, score')
          .eq('user_id', user.id);
        if (error) throw error;
        const progress = {};
        data.forEach(item => {
          if (!progress[item.course_id]) progress[item.course_id] = {};
          progress[item.course_id][item.module_id] = { complete: item.complete, score: item.score };
        });
        return progress;
      }
    } catch (e) {
      console.warn('Failed to load progress from Supabase, using localStorage', e);
    }
    // Fallback to localStorage
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); }
    catch { return {}; }
  }
  async function writeProgress(state) {
    try {
      const user = await getUser();
      if (user) {
        const supabase = initSupabase();
        // First, delete existing progress for user
        await supabase.from('progress').delete().eq('user_id', user.id);
        // Then insert new progress
        const inserts = [];
        for (const courseId in state) {
          for (const moduleId in state[courseId]) {
            inserts.push({
              user_id: user.id,
              course_id: courseId,
              module_id: moduleId,
              complete: state[courseId][moduleId].complete,
              score: state[courseId][moduleId].score || null
            });
          }
        }
        if (inserts.length) {
          const { error } = await supabase.from('progress').insert(inserts);
          if (error) throw error;
        }
        return;
      }
    } catch (e) {
      console.warn('Failed to save progress to Supabase, using localStorage', e);
    }
    // Fallback to localStorage
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  }
  async function setModuleComplete(courseId, moduleId, score = null) {
    const s = await readProgress();
    if (!s[courseId]) s[courseId] = {};
    if (!s[courseId][moduleId]) s[courseId][moduleId] = {};
    s[courseId][moduleId].complete = true;
    if (score !== null) s[courseId][moduleId].score = score;
    await writeProgress(s);
  }
  async function getCourseProgress(courseId, modules = []) {
    const s = await readProgress();
    const items = s[courseId] || {};
    const done = modules.filter(m => items[m.id]?.complete).length;
    const pct = modules.length ? Math.round((done / modules.length) * 100) : 0;
    return { done, total: modules.length, pct };
  }
  async function isCourseCompleted(course) {
    const s = await readProgress();
    const items = s[course.id] || {};
    const total = course.modules.length;
    const done = course.modules.filter(m => items[m.id]?.complete).length;
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
  async function renderCourseCards(targetSelector, courses) {
    const mount = document.querySelector(targetSelector);
    if (!mount || !Array.isArray(courses)) return;
    const progressPromises = courses.map(c => window.SustHub.getCourseProgress(c.id, c.modules));
    const progressResults = await Promise.all(progressPromises);
    mount.innerHTML = courses.map((c, i) => {
      const p = progressResults[i].pct;
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

  document.addEventListener('DOMContentLoaded', async () => {
    if (window.COURSES) {
      const featured = window.COURSES.slice(0, 6);
      await renderCourseCards('#featured-courses', featured);
      await renderCourseCards('#catalog-courses', window.COURSES);
    }
  });
})();
