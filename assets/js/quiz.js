// Sustainability Hub – Quiz Engine
// Expects window.QUIZZES with key `${courseId}:${moduleId}` -> questions[]

(function () {
  const qs = new URLSearchParams(location.search);
  const courseId = qs.get('course');
  const moduleId = qs.get('module');

  const key = `${courseId}:${moduleId}`;
  const questions = window.QUIZZES?.[key] || [];

  const mount = document.getElementById('quiz-mount');
  const submitBtn = document.getElementById('quiz-submit');
  const resultsEl = document.getElementById('quiz-results');

  if (!mount) return;

  // Render
  function render() {
    if (!questions.length) {
      mount.innerHTML = `<p>No quiz found for this module.</p>`;
      submitBtn?.setAttribute('disabled', 'true');
      return;
    }

    mount.innerHTML = questions.map((q, i) => {
      const name = `q${i}`;
      const choices = q.choices.map((c, j) => `
        <label>
          <input type="radio" name="${name}" value="${j}" aria-labelledby="q${i}-label" />
          <span>${c}</span>
        </label>
      `).join('');
      return `
        <div class="q" role="group" aria-labelledby="q${i}-label">
          <div id="q${i}-label"><strong>Q${i + 1}.</strong> ${q.text}</div>
          <div class="choices">${choices}</div>
        </div>
      `;
    }).join('');
  }

  async function grade() {
    let correct = 0;
    const total = questions.length;
    questions.forEach((q, i) => {
      const chosen = document.querySelector(`input[name="q${i}"]:checked`);
      if (chosen && Number(chosen.value) === q.answer) correct++;
    });

    const scorePct = Math.round((correct / total) * 100);
    const passed = scorePct >= (window.QUIZ_PASS_PCT || 70);
    resultsEl.innerHTML = `
      <p class="${passed ? 'feedback ok' : 'feedback bad'}" role="status">
        ${passed ? 'Great job! ' : 'Keep going! '}You scored <strong>${scorePct}%</strong> (${correct}/${total}).
        ${passed ? 'Module completed.' : `You need ${(window.QUIZ_PASS_PCT || 70)}% to pass.`}
      </p>
    `;

    // Persist module completion
    if (passed && window.SustHub) {
      await window.SustHub.setModuleComplete(courseId, moduleId, scorePct);
    }
  }

  document.addEventListener('DOMContentLoaded', render);
  submitBtn?.addEventListener('click', grade);
})();
