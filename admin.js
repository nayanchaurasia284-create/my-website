// =============================================
// KALYAAN — ADMIN.JS
// Full admin panel logic
// =============================================

const ADMIN_PASSWORD = 'admin123';
let gameMode = 'rng';
let overrideResult = null;
let allUsers = [];
let selectedAdminUser = null;

// ─── LOGIN ────────────────────────────────────────────────
function adminLogin() {
  const pass = document.getElementById('adminPassInput')?.value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    initAdmin();
  } else {
    showToast('Incorrect password!', 'error');
    if (document.getElementById('adminPassInput')) document.getElementById('adminPassInput').value = '';
  }
}

function adminLogout() {
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminLogin').style.display = 'flex';
  if (document.getElementById('adminPassInput')) document.getElementById('adminPassInput').value = '';
}

// ─── INIT ADMIN ───────────────────────────────────────────
function initAdmin() {
  loadAdminUsers();
  loadDashboard();
  buildOverrideGrid();
  loadResultHistory();
  loadReports();
  startAdminLiveTimer();
}

// ─── NAV ──────────────────────────────────────────────────
function switchAdminSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-pill').forEach(p => p.classList.remove('active'));
  const section = document.getElementById('section-' + id);
  if (section) section.classList.add('active');
  const navItems = ['dashboard', 'users', 'game', 'wallet', 'referral', 'reports', 'settings'];
  const idx = navItems.indexOf(id);
  const pills = document.querySelectorAll('.admin-nav-pill');
  if (pills[idx]) pills[idx].classList.add('active');
  if (id === 'reports') loadReports();
}

// ─── USERS ────────────────────────────────────────────────
function loadAdminUsers() {
  const stored = JSON.parse(localStorage.getItem('kalyaan_user') || 'null');
  const demoUsers = JSON.parse(localStorage.getItem('k_admin_users') || '[]');
  allUsers = stored ? [stored, ...demoUsers] : [...demoUsers];
  renderAdminUsers(allUsers);

  const countEl = document.getElementById('userCount');
  if (countEl) countEl.textContent = allUsers.length;
  const dsUsers = document.getElementById('ds-users');
  if (dsUsers) dsUsers.textContent = allUsers.length;
  const rptUsers = document.getElementById('rpt-users');
  if (rptUsers) rptUsers.textContent = allUsers.length;
}

function renderAdminUsers(users) {
  const list = document.getElementById('usersList');
  if (!list) return;
  if (!users.length) {
    list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);font-family:var(--font-ui);">No users found</div>';
    return;
  }
  const bets = JSON.parse(localStorage.getItem('k_bets') || '[]');
  list.innerHTML = users.map((u, i) => {
    const banned = localStorage.getItem('k_banned_' + u.uid);
    return `
      <div class="user-row">
        <div class="ur-top">
          <div class="ur-avatar">${u.name.charAt(0)}</div>
          <div style="flex:1;">
            <div class="ur-name">${u.name} ${banned ? '<span style="color:var(--red);font-size:11px;">[BANNED]</span>' : ''}</div>
            <div class="ur-phone">+91${u.phone} · UID: ${u.uid}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-ui);font-size:14px;font-weight:700;color:var(--gold);">₹${u.balance.toFixed(0)}</div>
            <div style="font-family:var(--font-ui);font-size:11px;color:var(--muted);">${bets.length} bets</div>
          </div>
        </div>
        <div class="ur-actions">
          <button class="ur-btn ur-add"    onclick="quickAddBalance(${i})">+₹ Add</button>
          <button class="ur-btn ur-remove" onclick="quickRemoveBalance(${i})">-₹ Remove</button>
          <button class="ur-btn ur-ban"    onclick="toggleBanUser(${i})">${banned ? 'Unban' : 'Ban'}</button>
          <button class="ur-btn ur-msg"    onclick="msgUser(${i})">💬 WA</button>
        </div>
      </div>
    `;
  }).join('');
}

function filterAdminUsers(query) {
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.phone.includes(query) ||
    u.uid.toLowerCase().includes(query.toLowerCase())
  );
  renderAdminUsers(filtered);
}

function quickAddBalance(idx) {
  const u = allUsers[idx];
  const amt = parseFloat(prompt(`Add balance to ${u.name}?\nCurrent: ₹${u.balance}\nEnter amount:`) || '0');
  if (!amt || amt <= 0) return;
  u.balance += amt;
  localStorage.setItem('kalyaan_user', JSON.stringify(u));
  loadAdminUsers();
  showToast(`₹${amt} added to ${u.name}`, 'success');
}

function quickRemoveBalance(idx) {
  const u = allUsers[idx];
  const amt = parseFloat(prompt(`Remove from ${u.name}?\nCurrent: ₹${u.balance}\nEnter amount:`) || '0');
  if (!amt || amt <= 0) return;
  if (amt > u.balance) { showToast('Amount exceeds balance!', 'error'); return; }
  u.balance -= amt;
  localStorage.setItem('kalyaan_user', JSON.stringify(u));
  loadAdminUsers();
  showToast(`₹${amt} removed from ${u.name}`, 'success');
}

function toggleBanUser(idx) {
  const u = allUsers[idx];
  const key = 'k_banned_' + u.uid;
  const banned = localStorage.getItem(key);
  if (banned) { localStorage.removeItem(key); showToast(`${u.name} unbanned`, 'success'); }
  else { localStorage.setItem(key, '1'); showToast(`${u.name} banned`, 'error'); }
  loadAdminUsers();
}

function msgUser(idx) {
  const u = allUsers[idx];
  const msg = `Hello ${u.name}! This is a message from Kalyaan Support.`;
  window.open(`https://wa.me/91${u.phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function addTestUser() {
  const phone = document.getElementById('addUserPhone')?.value;
  const bal = parseFloat(document.getElementById('addUserBal')?.value) || 100;
  if (!phone || phone.length !== 10) { showToast('Invalid phone number', 'error'); return; }
  const newUser = {
    phone, name: 'Player' + Math.floor(Math.random() * 9000 + 1000),
    balance: bal, uid: 'USR' + Date.now(),
    joinDate: new Date().toISOString(), vipLevel: 0, totalBets: 0, totalWin: 0
  };
  const existing = JSON.parse(localStorage.getItem('k_admin_users') || '[]');
  existing.push(newUser);
  localStorage.setItem('k_admin_users', JSON.stringify(existing));
  loadAdminUsers();
  showToast('User added successfully!', 'success');
  if (document.getElementById('addUserPhone')) document.getElementById('addUserPhone').value = '';
}

// ─── GAME CONTROL ─────────────────────────────────────────
function setGameMode(mode) {
  gameMode = mode;
  document.getElementById('modeRng')?.classList.toggle('active', mode === 'rng');
  document.getElementById('modeOverride')?.classList.toggle('active', mode === 'override');
  const panel = document.getElementById('overridePanel');
  if (panel) panel.style.display = mode === 'override' ? 'block' : 'none';
  localStorage.setItem('k_game_mode', mode);
  showToast(mode === 'rng' ? 'Random mode activated' : 'Override mode activated', 'info');
}

function buildOverrideGrid() {
  const grid = document.getElementById('ovGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i <= 9; i++) {
    const btn = document.createElement('button');
    btn.className = 'rov-btn';
    btn.textContent = i;
    btn.id = `rov-${i}`;
    btn.onclick = () => {
      document.querySelectorAll('.rov-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel');
      overrideResult = i;
      const disp = document.getElementById('overrideDisplay');
      if (disp) disp.textContent = `Number ${i}`;
      localStorage.setItem('k_override_result', i);
    };
    grid.appendChild(btn);
  }
}

function setColorOverride(color) {
  const colorNums = { green: [1, 3, 7, 9], violet: [0, 5], red: [2, 4, 6, 8] };
  const nums = colorNums[color] || [0];
  const pick = nums[Math.floor(Math.random() * nums.length)];
  document.querySelectorAll('.rov-btn').forEach(b => b.classList.remove('sel'));
  const btn = document.getElementById(`rov-${pick}`);
  if (btn) btn.classList.add('sel');
  overrideResult = pick;
  const disp = document.getElementById('overrideDisplay');
  if (disp) disp.textContent = `${color.toUpperCase()} → Number ${pick}`;
  localStorage.setItem('k_override_result', pick);
}

function applyOverride() {
  if (overrideResult === null) { showToast('Select a number first!', 'error'); return; }
  showToast(`✅ Override set! Next result: ${overrideResult}`, 'success');
}

function toggleGamePause(start) {
  localStorage.setItem('k_game_paused', start ? '0' : '1');
  showToast(start ? '▶️ Game resumed!' : '⏸️ Game paused!', 'info');
}

function forceNextRound() {
  localStorage.setItem('k_force_next', '1');
  showToast('⏭️ Next round forced!', 'success');
}

function loadResultHistory() {
  const results = getResults();
  const el = document.getElementById('adminResultHistory');
  if (!el) return;
  if (!results.length) {
    el.innerHTML = '<div style="color:var(--muted);font-family:var(--font-ui);text-align:center;padding:16px;">No results yet</div>';
    return;
  }
  const bgMap = {
    red: 'var(--red)',
    green: 'var(--green)',
    rv: 'linear-gradient(135deg,var(--red) 50%,var(--violet) 50%)',
    gv: 'linear-gradient(135deg,var(--green) 50%,var(--violet) 50%)'
  };
  el.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:4px;">' +
    results.slice(0, 10).map(r => {
      const bg = bgMap[r.rc] || 'var(--red)';
      return `<div style="width:30px;height:30px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;font-family:var(--font-ui);font-weight:700;font-size:13px;">${r.num}</div>`;
    }).join('') + '</div>';
}

// ─── WALLET CONTROL ───────────────────────────────────────
function adminAdjustBalance(action) {
  const target = document.getElementById('walletTargetUser')?.value?.trim();
  const amt = parseFloat(document.getElementById('walletAmount')?.value);
  const note = document.getElementById('walletNote')?.value;
  if (!target) { showToast('Enter user UID or phone', 'error'); return; }
  if (!amt || amt <= 0) { showToast('Enter valid amount', 'error'); return; }

  const user = JSON.parse(localStorage.getItem('kalyaan_user') || 'null');
  if (!user || (!user.uid.includes(target) && !user.phone.includes(target))) {
    showToast('User not found', 'error'); return;
  }
  if (action === 'add') {
    user.balance += amt;
    showToast(`₹${amt} added to ${user.name}. Note: ${note}`, 'success');
  } else {
    if (amt > user.balance) { showToast('Amount exceeds user balance', 'error'); return; }
    user.balance -= amt;
    showToast(`₹${amt} removed from ${user.name}`, 'success');
  }
  localStorage.setItem('kalyaan_user', JSON.stringify(user));
  loadAdminUsers();
}

// ─── DASHBOARD ────────────────────────────────────────────
function loadDashboard() {
  const bets = getBets();
  const totalBetAmt = bets.reduce((s, b) => s + (b.amt || 0), 0);
  const totalPayout = bets.filter(b => b.won).reduce((s, b) => s + (b.amt || 0) + (b.profit || 0), 0);
  const profit = Math.max(0, totalBetAmt - totalPayout);

  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set('ds-revenue', '₹' + profit.toFixed(0));
  set('ds-bets', bets.length);
  set('ds-pending', '0');

  const recentEl = document.getElementById('recentActivity');
  if (!recentEl) return;
  if (!bets.length) {
    recentEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted);font-family:var(--font-ui);">No activity yet</div>';
    return;
  }
  recentEl.innerHTML = bets.slice(0, 8).map(b => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-family:var(--font-ui);">
      <div>
        <div style="font-size:13px;font-weight:700;">Bet: ${b.bet}</div>
        <div style="font-size:11px;color:var(--muted);">Period: ${b.period}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px;font-weight:700;color:${b.won ? 'var(--green)' : 'var(--red)'};">${b.won ? '+₹' + b.profit : '-₹' + b.amt}</div>
        <div style="font-size:11px;color:var(--muted);">${b.result}</div>
      </div>
    </div>
  `).join('');
}

// ─── REPORTS ──────────────────────────────────────────────
function loadReports() {
  const bets = getBets();
  const txns = getTxns();
  const totalBetAmt = bets.reduce((s, b) => s + (b.amt || 0), 0);
  const totalPayout = bets.filter(b => b.won).reduce((s, b) => s + (b.amt || 0) + (b.profit || 0), 0);
  const profit = Math.max(0, totalBetAmt - totalPayout);
  const totalDep = txns.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amt, 0);
  const totalWd = txns.filter(t => t.type === 'withdraw').reduce((s, t) => s + t.amt, 0);

  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set('rpt-bets', '₹' + totalBetAmt.toFixed(0));
  set('rpt-winnings', '₹' + totalPayout.toFixed(0));
  set('rpt-profit', '₹' + profit.toFixed(0));
  set('rpt-comm', '₹0');
  set('rpt-net', '₹' + profit.toFixed(0));
  set('rpt-dep', '₹' + totalDep.toFixed(0));
  set('rpt-wd', '₹' + totalWd.toFixed(0));
  set('rpt-refcomm', '₹0');
  set('rpt-users', allUsers.length);
}

function exportAdminReport() {
  const bets = getBets();
  const totalBetAmt = bets.reduce((s, b) => s + (b.amt || 0), 0);
  const msg = `📊 *KALYAAN DAILY REPORT*\n━━━━━━━━━━━━━━━━\n📅 Date: ${new Date().toLocaleDateString('en-IN')}\n🎯 Total Bets: ${bets.length}\n💵 Bet Volume: ₹${totalBetAmt}\n👥 Users: ${allUsers.length}\n━━━━━━━━━━━━━━━━\nGenerated by Kalyaan Admin`;
  openWhatsApp(msg);
}

function broadcastMessage() {
  const msg = prompt('Enter broadcast message:');
  if (!msg) return;
  const waMsg = `📢 *KALYAAN ANNOUNCEMENT*\n\n${msg}\n\n— Kalyaan Team`;
  window.open(`https://wa.me/?text=${encodeURIComponent(waMsg)}`, '_blank');
}

// ─── LIVE TIMER ───────────────────────────────────────────
function startAdminLiveTimer() {
  setInterval(() => {
    const period = localStorage.getItem('k_period') || '---';
    const bets = getBets();
    const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('livePeriod', period);
    set('liveBets', bets.length);
  }, 2000);
}

// ─── KEYBOARD LOGIN ───────────────────────────────────────
document.addEventListener('keypress', e => {
  const loginDiv = document.getElementById('adminLogin');
  if (e.key === 'Enter' && loginDiv && loginDiv.style.display !== 'none') adminLogin();
});
