// 4ward — student (peer) intake. Saves an opted-in student to localStorage so
// they appear as a "✓ On 4ward" card in other students' Connections > Peers.
// (Prototype: same-browser storage. Production would POST to a shared backend.)

const $ = (id) => document.getElementById(id);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initialsFor(name) {
  const words = (name || '?').replace(/[^a-zA-Z ]/g, '').trim().split(/\s+/);
  return ((words[0]?.[0] || '') + (words[1]?.[0] || '')).toUpperCase() || '★';
}

// Accept "linkedin.com/in/x", "www.linkedin.com/in/x", or a full URL. Optional here.
function normalizeLinkedin(raw) {
  let v = (raw || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v.replace(/^\/+/, '');
  try {
    const u = new URL(v);
    if (!/(^|\.)linkedin\.com$/i.test(u.hostname)) return null; // not a LinkedIn URL
    return u.href;
  } catch {
    return null;
  }
}

function loadPeers() {
  try { return JSON.parse(localStorage.getItem('figuredPeers')) || []; } catch { return []; }
}

function savePeer(p) {
  const list = loadPeers();
  list.unshift(p);
  localStorage.setItem('figuredPeers', JSON.stringify(list));
}

function showError(msg) {
  const el = $('pError');
  el.textContent = msg;
  el.hidden = false;
}

function renderPreview(p) {
  $('peerPreview').innerHTML = `
    <article class="product-card mentor-app-card">
      <div class="mentor-avatar">${esc(p.initials)}</div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.sub || '')}</p>
      <span class="opted-badge">✓ On 4ward</span>
      <small>${esc(p.why || '')}</small>
      ${p.linkedin ? `<a class="opp-link opted" href="${esc(p.linkedin)}" target="_blank" rel="noopener">View profile →</a>` : ''}
    </article>`;
}

$('pSubmit').addEventListener('click', () => {
  const name = $('pName').value.trim();
  const sub = $('pSchoolYear').value.trim();
  const field = $('pField').value.trim();
  const linkedin = normalizeLinkedin($('pLinkedin').value);
  const why = $('pWhy').value.trim();
  const consent = $('pConsent').checked;

  if (!name) return showError('Add your name so students know who they\'re talking to.');
  if (!sub) return showError('Add your school and year.');
  if (!why) return showError('Add a sentence on what you\'ve done that others can learn from.');
  if (linkedin === null) return showError('That doesn\'t look like a LinkedIn URL. Leave it blank or copy it from your profile (linkedin.com/in/...).');
  if (!consent) return showError('Please confirm students can see your card and reach out.');

  const peer = { name, sub, field, why, linkedin, initials: initialsFor(name) };
  savePeer(peer);

  $('peerSuccessHeadline').textContent = `You're on 4ward, ${name.split(' ')[0]}.`;
  renderPreview(peer);
  $('pError').hidden = true;
  $('peerForm').classList.remove('active');
  $('peerSuccess').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
