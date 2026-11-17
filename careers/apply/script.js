
  // ─────────────────────────────────────────────────────────────
//  Paste the /exec URL of your DEPLOYED Apps Script web app.
//  Deploy → New deployment → Web app → Execute as: Me → Anyone
// ─────────────────────────────────────────────────────────────
const APPLY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzrxq565jxH_ne6OY5QuVcfG3EL7VnIWDa1qdmxvbt2syZRmp7pJf4dbqiNnQW3Oxdv/exec';
const MAX_FILE_MB = 10;

document.addEventListener('DOMContentLoaded', displayJobDetails);

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function displayJobDetails() {
  const container = document.getElementById('job-details');
  if (!container) return;

  const jobId = new URLSearchParams(window.location.search).get('id');
  const job = jobId && (window.JOBS || {})[jobId];

  if (!jobId) {
    container.innerHTML = notFound('No position specified.');
    return;
  }
  if (!job) {
    container.innerHTML = notFound(`Position "${esc(jobId)}" does not exist.`);
    return;
  }

  container.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-white fade-in">${esc(job.title)}</h1>

      <div class="glass-card p-8 rounded-xl mb-10 shadow-lg">
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <div class="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
            <p class="text-blue-400 font-medium"><i class="fas fa-map-marker-alt mr-1"></i> ${esc(job.location)}</p>
          </div>
          <div class="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700/50">
            <p class="text-green-400 font-medium"><i class="fas fa-clock mr-1"></i> ${esc(job.type)}</p>
          </div>
        </div>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold mb-4 text-white">Job Description</h2>
          <p class="text-gray-300 leading-relaxed">${esc(job.description)}</p>
        </section>

        <section>
          <h2 class="text-2xl font-semibold mb-4 text-white">Requirements</h2>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${(job.requirements || []).map(req => `
              <li class="flex items-center gap-2 text-gray-300">
                <i class="fas fa-check-circle text-blue-500"></i>${esc(req)}
              </li>
            `).join('')}
          </ul>
        </section>
      </div>

      <div class="glass-card p-8 rounded-xl shadow-lg">
        <h2 class="text-2xl font-semibold mb-6 text-white">Apply Now</h2>
        ${renderForm(job)}
      </div>
    </div>
  `;
}

function notFound(msg) {
  return `
    <div class="glass-card p-8 rounded-xl text-center">
      <p class="text-red-400 text-lg mb-4">${msg}</p>
      <a href="/careers" class="text-blue-400 hover:text-blue-300 font-medium">
        <i class="fas fa-arrow-left mr-2"></i>Back to all openings
      </a>
    </div>
  `;
}

function renderForm(job) {
  return `
    <form id="application-form" class="space-y-6" data-job-title="${esc(job.title)}">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col">
          <label for="name" class="text-gray-300 font-medium mb-2">Full Name</label>
          <input type="text" id="name" name="name" autocomplete="name" required
            class="input-dark rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
        </div>
        <div class="flex flex-col">
          <label for="email" class="text-gray-300 font-medium mb-2">Email Address</label>
          <input type="email" id="email" name="email" autocomplete="email" required
            class="input-dark rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
        </div>
      </div>

      <div class="flex flex-col">
        <label for="resume" class="text-gray-300 font-medium mb-2">
          Resume/CV <span class="text-gray-500 text-sm">(PDF, DOC, DOCX — max ${MAX_FILE_MB} MB)</span>
        </label>
        <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" required
          class="input-dark rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition">
      </div>

      <div class="flex flex-col">
        <label for="cover" class="text-gray-300 font-medium mb-2">Cover Letter</label>
        <textarea id="cover" name="cover" rows="4" required
          class="input-dark rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Tell us why you're the perfect fit for this role..."></textarea>
      </div>

      <p id="form-status" class="hidden text-sm rounded-lg px-4 py-3" role="status" aria-live="polite"></p>

      <button type="submit"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed">
        Submit Application
      </button>
    </form>
  `;
}
/* ---------- waiting-room nonsense ---------- */

const WAIT_STEPS = [
  'Verifying your email address…',
  'Cross-checking your criminal record…',
  'Reviewing your 2009 Facebook posts…',
  'Calling your last three employers…',
  'Confirming you actually know what Tailwind is…',
  'Uploading your resume to the CIA…',
  'Waiting for the CIA to finish reading it…',
  'Running it past the office goldfish for a second opinion…',
  'Compressing your hopes and dreams into a .zip…',
  'Bribing the hiring manager with baklava…',
  'Sharpening pencils in your honour…'
];

const STATUS_CLASS = {
  info:    'text-sm rounded-lg px-4 py-3 bg-white/5 text-gray-300 border border-white/10',
  success: 'text-sm rounded-lg px-4 py-3 bg-green-500/10 text-green-300 border border-green-500/30',
  error:   'text-sm rounded-lg px-4 py-3 bg-red-500/10 text-red-300 border border-red-500/30'
};

let waitTimer = null;

function startWaitTicker(el) {
  // className (not classList) so the original "hidden" class gets wiped
  el.className = STATUS_CLASS.info;
  let i = 0;
  el.textContent = WAIT_STEPS[i];
  waitTimer = setInterval(() => {
    i = Math.min(i + 1, WAIT_STEPS.length - 1);
    el.textContent = WAIT_STEPS[i];
  }, 900);
}

function stopWaitTicker() {
  if (waitTimer !== null) {
    clearInterval(waitTimer);
    waitTimer = null;
  }
}

/* ---------- submit ---------- */

document.addEventListener('submit', async (e) => {
  const form = e.target;
  if (form.id !== 'application-form') return;
  e.preventDefault();

  const status = form.querySelector('#form-status');
  const btn    = form.querySelector('button[type="submit"]');
  const label  = btn.textContent;
  const file   = form.querySelector('#resume').files[0];

  const fail = (msg) => {
    stopWaitTicker();
    status.className = STATUS_CLASS.error;
    status.textContent = msg;
  };

  if (!file) return fail('Please attach your resume.');
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return fail(`Resume must be under ${MAX_FILE_MB} MB.`);
  }

  btn.disabled = true;
  btn.textContent = 'Submitting…';
  startWaitTicker(status);

  try {
    const fd = new FormData();
    fd.append('name',         form.querySelector('#name').value.trim());
    fd.append('email',        form.querySelector('#email').value.trim());
    fd.append('cover',        form.querySelector('#cover').value.trim());
    fd.append('jobTitle',     form.dataset.jobTitle || '');
    fd.append('resumeBase64', await fileToBase64(file));
    fd.append('resumeName',   file.name);
    fd.append('resumeMime',   file.type || 'application/octet-stream');

    const res = await fetch(APPLY_ENDPOINT, {
      method: 'POST',
      body: fd,
      redirect: 'follow'
    });
    if (!res.ok) throw new Error('server returned ' + res.status);

    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('unexpected server response'); }

    if (!data.ok) throw new Error(data.message || 'submission failed');

    stopWaitTicker();
    status.className = STATUS_CLASS.success;
    status.innerHTML = `
      Thanks — your application is in. We'll reach out if there's a fit.
      <span class="block mt-3 pt-3 border-t border-green-500/20 text-xs text-green-200/70 leading-relaxed">
        And no, none of that was real. Nobody checked your criminal record,
        the CIA has politely declined, and your resume went straight into a
        private Drive folder. Uploading a file just takes a few seconds, and
        a few seconds of nonsense beats a spinning circle — that's the entire
        reason for the theatrics.
      </span>`;
    form.reset();
  } catch (err) {
    console.error('[apply]', err);
    fail('Sorry — ' + err.message + '. Please try again.');
  } finally {
    stopWaitTicker();
    btn.disabled = false;
    btn.textContent = label;
  }
});

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('could not read the file'));
    reader.readAsDataURL(file);
  });
}