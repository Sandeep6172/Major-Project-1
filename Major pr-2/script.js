/* =============================================
   CyberShield AI — script.js
   Moderate-level cybersecurity dashboard
   ============================================= */

// =============================================
// 1. LIVE CLOCK
// =============================================
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('live-clock').textContent = `${h}:${m}:${s}`;
}
updateClock();
setInterval(updateClock, 1000);


// =============================================
// 2. BUILD BAR CHART (Traffic Last 12h)
// =============================================
const trafficData = [
  { hour: '00', pct: 45, type: 'b-normal' },
  { hour: '02', pct: 32, type: 'b-normal' },
  { hour: '04', pct: 28, type: 'b-normal' },
  { hour: '06', pct: 38, type: 'b-normal' },
  { hour: '08', pct: 65, type: 'b-elevated' },
  { hour: '10', pct: 78, type: 'b-normal' },
  { hour: '12', pct: 95, type: 'b-anomaly' },
  { hour: '14', pct: 70, type: 'b-normal' },
  { hour: '16', pct: 82, type: 'b-elevated' },
  { hour: '18', pct: 60, type: 'b-normal' },
  { hour: '20', pct: 50, type: 'b-normal' },
  { hour: '22', pct: 88, type: 'b-anomaly' },
];

function buildBarChart() {
  const container = document.getElementById('barChart');
  container.innerHTML = '';

  trafficData.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'bar-wrap';

    const bar = document.createElement('div');
    bar.className = `bar ${item.type}`;
    bar.style.height = '0%';             // start at 0 for animation
    bar.title = `${item.hour}:00 — ${item.pct}% load`;

    const lbl = document.createElement('div');
    lbl.className = 'bar-lbl';
    lbl.textContent = item.hour;

    wrap.appendChild(bar);
    wrap.appendChild(lbl);
    container.appendChild(wrap);

    // Animate bars in after a short delay
    setTimeout(() => {
      bar.style.height = item.pct + '%';
    }, 100);
  });
}

buildBarChart();


// =============================================
// 3. SIDEBAR ITEM CLICK
// =============================================
document.querySelectorAll('.sidebar-item').forEach(item => {
  item.addEventListener('click', function () {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
  });
});


// =============================================
// 4. NAVBAR PAGE SWITCHER
// =============================================
function setPage(el) {
  document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
  el.classList.add('active');
}


// =============================================
// 5. THREAT TABLE — FILTER BY SEVERITY
// =============================================
function filterThreats(severity) {
  const rows = document.querySelectorAll('#threatBody tr');
  rows.forEach(row => {
    const sev = row.getAttribute('data-sev');
    row.style.display = (severity === 'all' || sev === severity) ? '' : 'none';
  });
}


// =============================================
// 6. BLOCK THREAT BUTTON
// =============================================
function blockThreat(btn) {
  btn.textContent = '✓ Blocked';
  btn.classList.remove('danger');
  btn.classList.add('blocked');
  btn.disabled = true;

  // Add a log entry for this action
  const row = btn.closest('tr');
  const type = row ? row.cells[1].textContent : 'Threat';
  addLogEntry('ok', `[OK] Blocked: ${type} threat manually`);
}


// =============================================
// 7. QUICK ACTION BUTTONS
// =============================================
function qaAction(btn) {
  btn.classList.add('active-flash');
  const label = btn.textContent.trim();
  addLogEntry('ok', `[OK] Action executed: ${label}`);

  setTimeout(() => btn.classList.remove('active-flash'), 700);
}


// =============================================
// 8. RUN SCAN BUTTON
// =============================================
function runScan() {
  addLogEntry('info', '[INFO] Full network scan initiated by admin...');
  addLogEntry('warn', '[WARN] Scanning 192.168.0.0/16 — elevated traffic expected');

  setTimeout(() => {
    addLogEntry('ok', '[OK] Scan complete — 0 new critical threats found');
  }, 2500);
}


// =============================================
// 9. LIVE LOG — ADD ENTRIES
// =============================================
const logMessages = [
  { type: 'info',  text: '[INFO] AI model heartbeat: threat_score=0.91' },
  { type: 'warn',  text: '[WARN] Unusual DNS queries: 847 requests/min' },
  { type: 'ok',    text: '[OK]   IDS rule matched: Mirai botnet variant' },
  { type: 'error', text: '[CRIT] RCE attempt blocked: /admin/upload' },
  { type: 'info',  text: '[INFO] Network baseline updated — 48h window' },
  { type: 'ok',    text: '[OK]   Honeypot triggered: 192.168.4.22' },
  { type: 'warn',  text: '[WARN] SSL cert mismatch: api.internal.corp' },
  { type: 'info',  text: '[INFO] Signature DB synced: 312 new entries' },
  { type: 'error', text: '[CRIT] Zero-day signature detected: CVE-2024-3821' },
  { type: 'ok',    text: '[OK]   Firewall policies synced across 12 nodes' },
];

let logIdx = 0;

function addLogEntry(type, text) {
  const container = document.getElementById('logContainer');
  if (!container) return;

  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

  const line = document.createElement('div');
  line.className = `log-line ${typeToClass(type)}`;

  const typeLabels = { ok: 'ok', info: 'info', warn: 'warn', error: 'crit' };

  line.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-tag ${typeLabels[type] || 'info'}">${text.substring(0, text.indexOf(']') + 1) || '[INFO]'}</span>
    <span>${text.substring(text.indexOf(']') + 1).trim()}</span>
  `;

  // Insert at top
  container.insertBefore(line, container.firstChild);

  // Keep max 30 lines
  while (container.children.length > 30) {
    container.removeChild(container.lastChild);
  }
}

function typeToClass(type) {
  const map = { ok: 'ok', info: 'info', warn: 'warn', error: 'error' };
  return map[type] || 'info';
}

// Auto-add log entries every 3 seconds
function autoLog() {
  const msg = logMessages[logIdx % logMessages.length];
  logIdx++;
  addLogEntry(msg.type, msg.text);
}

setInterval(autoLog, 3000);


// =============================================
// 10. CLEAR LOG
// =============================================
function clearLog() {
  const container = document.getElementById('logContainer');
  container.innerHTML = '';
  addLogEntry('info', '[INFO] Log cleared by admin');
}


// =============================================
// 11. ANIMATE HEALTH BARS ON LOAD
// =============================================
// The health bars are already set via inline style.
// This simulates a small fluctuation every 5s.
const healthData = [
  { fill: document.querySelectorAll('.health-fill')[0], base: 62, color: '#00d4ff' },
  { fill: document.querySelectorAll('.health-fill')[1], base: 48, color: '#00ff88' },
  { fill: document.querySelectorAll('.health-fill')[2], base: 81, color: '#ff9900' },
];

function updateHealth() {
  healthData.forEach(h => {
    if (!h.fill) return;
    const variation = Math.floor(Math.random() * 8) - 4;   // ±4%
    const newVal = Math.min(99, Math.max(10, h.base + variation));
    h.fill.style.width = newVal + '%';

    // Update the text next to it
    const parent = h.fill.closest('.health-item');
    if (parent) {
      const spans = parent.querySelectorAll('span');
      if (spans[1]) spans[1].textContent = newVal + '%';
    }
  });
}

setInterval(updateHealth, 4000);
