// assets/js/certificates.js
// Sustainability Hub – Certificates (printable PDF via browser Print dialog)

(function () {
  const CERTS_KEY = 'susthub:certs:v1'; // [{ id, courseId, courseTitle, name, dateISO }]
  const PASS_PCT = window.QUIZ_PASS_PCT || 70;

  function readCerts() {
    try { return JSON.parse(localStorage.getItem(CERTS_KEY) || '[]'); }
    catch { return []; }
  }
  function writeCerts(list) { localStorage.setItem(CERTS_KEY, JSON.stringify(list)); }

  function hasCertificate(courseId) {
    return !!readCerts().find(c => c.courseId === courseId);
    }

  function saveCertificate({ id, courseId, courseTitle, name, dateISO }) {
    const list = readCerts();
    list.push({ id, courseId, courseTitle, name, dateISO });
    writeCerts(list);
  }

  function generateId(courseId) {
    // Simple readable ID (not cryptographically unique)
    const stamp = Date.now().toString(36).toUpperCase().slice(-8);
    return `SH-${courseId.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}-${stamp}`;
  }

  function ensureLearnerName() {
    let name = window.SustHub?.getLearnerName() || '';
    if (!name) {
      name = prompt('Enter your full name for the certificate:') || '';
      name = name.trim();
      if (name) window.SustHub?.setLearnerName(name);
    }
    return name;
  }

  function openCertificateWindow({ name, courseTitle, dateISO, certId }) {
    const date = new Date(dateISO);
    const dateDisplay = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

    const w = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800');
    if (!w) {
      alert('Please allow pop-ups to view your certificate.');
      return;
    }

    const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Certificate – ${name}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  @page { size: A4 landscape; margin: 18mm; }
  :root {
    --brand: #21c58e;
    --brand2: #2ea8a6;
    --ink: #0e2723;
    --muted: #3a5550;
  }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: "Segoe UI", Roboto, system-ui, -apple-system, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    color: var(--ink); background: #fff;
  }
  .wrap {
    height: 100vh; display: grid; place-items: center; padding: 16mm;
    box-sizing: border-box;
  }
  .cert {
    width: 100%; height: 100%; border: 10px double var(--brand);
    background: radial-gradient(ellipse at top left, rgba(33,197,142,0.06), transparent 55%),
                radial-gradient(ellipse at bottom right, rgba(46,168,166,0.06), transparent 55%);
    display: grid; grid-template-rows: auto 1fr auto; gap: 1rem;
    padding: 18mm; box-sizing: border-box;
  }
  .head {
    display: flex; justify-content: space-between; align-items: center;
  }
  .brand {
    display: inline-flex; align-items: center; gap: .6rem; font-weight: 800; letter-spacing: .3px; color: var(--muted);
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(135deg, var(--brand), var(--brand2)); display: inline-block; }
  h1 {
    text-align: center; margin: 0; font-size: 42px; letter-spacing: .3px;
  }
  .subtitle { text-align: center; color: var(--muted); margin-top: 0; font-size: 16px; }
  .name {
    text-align: center; font-size: 34px; font-weight: 800; margin: 12px 0 4px;
  }
  .course {
    text-align: center; font-size: 20px; margin: 4px 0 16px; color: var(--muted);
  }
  .row { display: flex; justify-content: space-between; align-items: end; gap: 1rem; }
  .panel {
    border-top: 2px solid var(--brand);
    padding-top: .4rem; min-width: 200px; text-align: center;
  }
  .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .6px; }
  .val { font-weight: 700; font-size: 14px; }
  .foot {
    display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-top: .5rem;
    color: var(--muted);
  }
  .id { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 700; letter-spacing: .6px; }
  .actions { position: fixed; right: 14px; bottom: 14px; }
  .btn {
    background: linear-gradient(180deg, var(--brand), var(--brand2));
    color: #062114; border: none; border-radius: 10px; padding: 10px 14px; font-weight: 800; cursor: pointer;
    box-shadow: 0 6px 18px rgba(0,0,0,.12);
  }
  @media print {
    .actions { display: none; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="cert" role="document" aria-label="Certificate of Completion">
    <div class="head">
      <div class="brand"><span class="dot" aria-hidden="true"></span><span>Sustainability&nbsp;Hub</span></div>
      <div style="text-align:right;">
        <div class="label">Date</div>
        <div class="val">${dateDisplay}</div>
      </div>
    </div>
    <div>
      <h1>Certificate of Completion</h1>
      <p class="subtitle">This certifies that</p>
      <div class="name">${name}</div>
      <div class="course">has successfully completed the course</div>
      <div class="name" style="font-size:28px;">${courseTitle}</div>
    </div>
    <div>
      <div class="row">
        <div class="panel">
          <div class="label">Authorised by</div>
          <div class="val">Sustainability Hub</div>
        </div>
        <div class="panel">
          <div class="label">Certificate ID</div>
          <div class="val id">${certId}</div>
        </div>
      </div>
      <div class="foot" style="margin-top:14px;">
        <span>Verify internally using Certificate ID.</span>
        <span>© ${new Date().getFullYear()} Sustainability Hub</span>
      </div>
    </div>
  </div>
</div>
<div class="actions">
  <button class="btn" onclick="window.print()">Print / Save as PDF</button>
</div>
</body>
</html>
    `.trim();

    w.document.open();
    w.document.write(html);
    w.document.close();
    // Optional auto-print
    // w.addEventListener('load', () => w.print(), { once: true });
  }

  function createCertificateForCourse(course) {
    const name = ensureLearnerName();
    if (!name) return;

    const certId = generateId(course.id);
    const dateISO = new Date().toISOString();

    // Persist
    saveCertificate({
      id: certId,
      courseId: course.id,
      courseTitle: course.title,
      name,
      dateISO
    });

    // Open certificate window
    openCertificateWindow({ name, courseTitle: course.title, dateISO, certId });
  }

  function eligible(course) {
    // Requires: 100% modules completed AND all quizzes passed at PASS_PCT
    const status = window.SustHub?.isCourseCompleted(course) || { completed: false, allQuizzesPassed: false };
    return status.completed && status.allQuizzesPassed;
  }

  function insertCertificateCTA(course) {
    const mount = document.getElementById('cert-cta') || document.getElementById('course-root');
    if (!mount) return;

    // Remove old CTA if any
    const old = document.getElementById('cert-cta-inner');
    if (old) old.remove();

    const awarded = hasCertificate(course.id);
    const canAward = eligible(course);

    const wrapper = document.createElement('div');
    wrapper.id = 'cert-cta-inner';
    wrapper.innerHTML = `
      <div class="card" style="margin-top:1rem;">
        <h2 style="margin:0 0 .4rem;">Certificate</h2>
        <p class="meta">
          ${awarded
            ? 'You have earned a certificate for this course. You can re-open and print it at any time.'
            : canAward
              ? 'Congratulations! You have completed this course and met the pass criteria.'
              : 'Complete all modules and pass all quizzes to earn a certificate.'}
        </p>
        <div>
          ${canAward && !awarded ? `<button class="btn primary" id="cert-download-btn">Download certificate</button>` : ''}
          ${awarded ? `<a class="btn" id="cert-view-btn" href="javascript:void(0)">View certificate</a>` : ''}
        </div>
      </div>
    `;

    mount.appendChild(wrapper);

    document.getElementById('cert-download-btn')?.addEventListener('click', () => createCertificateForCourse(course));

    document.getElementById('cert-view-btn')?.addEventListener('click', () => {
      const cert = readCerts().find(c => c.courseId === course.id);
      if (cert) openCertificateWindow({
        name: cert.name, courseTitle: cert.courseTitle, dateISO: cert.dateISO, certId: cert.id
      });
    });
  }

  function initCourseCertificateCTA(course) {
    insertCertificateCTA(course);

    // Re-check when the page might update (e.g., user completes last quiz, navigates back)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) insertCertificateCTA(course);
    });
  }

  // Certificates list (for certificates.html)
  function listCertificates() {
    return readCerts().sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
  }

  function renderCertificatesList() {
    const mount = document.getElementById('cert-list');
    if (!mount) return;
    const list = listCertificates();
    if (!list.length) {
      mount.innerHTML = `<p>You haven’t earned any certificates yet.</p>`;
      return;
    }
    mount.innerHTML = list.map(c => `
      <article class="card">
        <h3>${c.courseTitle}</h3>
        <p class="meta">Name: <strong>${c.name}</strong> • Date: ${new Date(c.dateISO).toLocaleDateString()} • ID: <code>${c.id}</code></p>
        <div><button class="btn" data-id="${c.id}">Open certificate</button></div>
      </article>
    `).join('');

    mount.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cert = list.find(x => x.id === btn.dataset.id);
        if (cert) openCertificateWindow({
          name: cert.name, courseTitle: cert.courseTitle, dateISO: cert.dateISO, certId: cert.id
        });
      });
    });
  }

  window.SustHubCerts = {
    initCourseCertificateCTA,
    renderCertificatesList
  };
})();
