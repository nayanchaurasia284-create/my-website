// =============================================
// KALYAAN — COMMON.JS
// Shared utilities, auth, toast, storage
// =============================================

const WHATSAPP_NUM = '918517923368';

// ─── USER AUTH ────────────────────────────────────────────
function getUser() {
  return JSON.parse(localStorage.getItem('kalyaan_user') || 'null');
}

function saveUser(user) {
  localStorage.setItem('kalyaan_user', JSON.stringify(user));
}

function requireAuth() {
  const user = getUser();
  if (!user) window.location.href = 'index.html';
  return user;
}

function logout() {
  if (!confirm('Are you sure you want to logout?')) return;
  localStorage.removeItem('kalyaan_user');
  window.location.href = 'index.html';
}

// ─── BALANCE ──────────────────────────────────────────────
function formatBalance(amount) {
  return parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function updateAllBalanceDisplays(balance) {
  document.querySelectorAll('.bal-display').forEach(el => {
    el.textContent = formatBalance(balance);
  });
}

// ─── TOAST ────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💡'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── CONFETTI ─────────────────────────────────────────────
function launchConfetti(containerId = 'confettiWrap') {
  let wrap = document.getElementById(containerId);
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'confetti-wrap';
    wrap.id = containerId;
    document.body.appendChild(wrap);
  }
  const colors = ['#f0444b', '#00c896', '#9b59f5', '#f5c842', '#fff', '#ff7a28'];
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'cf';
    const size = 6 + Math.random() * 8;
    el.style.cssText = `
      left:${Math.random() * 100}vw;
      top:-10px;
      width:${size}px;
      height:${size}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration:${1.5 + Math.random() * 2.5}s;
      animation-delay:${Math.random() * 0.6}s;
      border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ─── DAILY BONUS ──────────────────────────────────────────
function checkDailyBonusClaimed() {
  return localStorage.getItem('k_daily_bonus') === new Date().toDateString();
}

function claimDailyBonus(amount = 10) {
  if (checkDailyBonusClaimed()) {
    showToast('Daily bonus already claimed!', 'error');
    return false;
  }
  const user = getUser();
  if (!user) return false;
  localStorage.setItem('k_daily_bonus', new Date().toDateString());
  user.balance += amount;
  saveUser(user);
  showToast(`🎁 ₹${amount} Daily Bonus Added!`, 'success');
  launchConfetti();
  return true;
}

// ─── CLIPBOARD ────────────────────────────────────────────
async function copyToClipboard(text, successMsg = 'Copied!') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg, 'success');
  } catch {
    showToast(text, 'info');
  }
}

async function pasteFromClipboard(inputId) {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById(inputId).value = text;
  } catch {
    showToast('Tap and hold to paste', 'info');
  }
}

// ─── STORAGE HELPERS ──────────────────────────────────────
function getBets() {
  return JSON.parse(localStorage.getItem('k_bets') || '[]');
}

function saveBets(bets) {
  localStorage.setItem('k_bets', JSON.stringify(bets));
}

function getResults() {
  return JSON.parse(localStorage.getItem('k_results') || '[]');
}

function saveResults(results) {
  localStorage.setItem('k_results', JSON.stringify(results));
}

function getTxns() {
  return JSON.parse(localStorage.getItem('k_txns') || '[]');
}

function saveTxns(txns) {
  localStorage.setItem('k_txns', JSON.stringify(txns));
}

function getReferralData() {
  return JSON.parse(localStorage.getItem('k_referrals') || '{"members":[],"commissions":{"l1":0,"l2":0,"l3":0},"pending":0}');
}

function saveReferralData(data) {
  localStorage.setItem('k_referrals', JSON.stringify(data));
}

// ─── NUMBER COLOR MAP ─────────────────────────────────────
const NUM_COLORS = {
  0: 'rv', 1: 'green', 2: 'red', 3: 'green', 4: 'red',
  5: 'gv', 6: 'red', 7: 'green', 8: 'red', 9: 'green'
};

function getResultColorLabel(num) {
  const rc = NUM_COLORS[num];
  const map = {
    rv: `${num} (Red+Violet)`,
    gv: `${num} (Green+Violet)`,
    red: `${num} (Red)`,
    green: `${num} (Green)`
  };
  return map[rc] || `${num}`;
}

function getResultDotClass(rc) {
  const map = { rv: 'r-rv', gv: 'r-gv', red: 'r-red', green: 'r-green' };
  return map[rc] || 'r-red';
}

// ─── VIP LEVELS ───────────────────────────────────────────
const VIP_LEVELS = [
  { id: 0, name: 'Bronze',  emoji: '🥉', color: '#CD7F32', req: 0,      dailyBonus: 10,  cashback: 0,   refComm: 3   },
  { id: 1, name: 'Silver',  emoji: '🥈', color: '#C0C0C0', req: 10000,  dailyBonus: 25,  cashback: 0.5, refComm: 3.5 },
  { id: 2, name: 'Gold',    emoji: '🥇', color: '#FFD700', req: 50000,  dailyBonus: 75,  cashback: 1,   refComm: 4   },
  { id: 3, name: 'Diamond', emoji: '💎', color: '#00BFFF', req: 200000, dailyBonus: 200, cashback: 2,   refComm: 5   },
];

function getVipLevel(totalBet) {
  let level = VIP_LEVELS[0];
  for (const vl of VIP_LEVELS) {
    if (totalBet >= vl.req) level = vl;
  }
  return level;
}

// ─── WHATSAPP ─────────────────────────────────────────────
function openWhatsApp(msg) {
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ─── URL PARAMS ───────────────────────────────────────────
function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ─── DATE HELPERS ─────────────────────────────────────────
function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}
