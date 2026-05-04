// =============================================
// KALYAAN — PROFILE.JS
// Profile, settings, terms, privacy, support
// =============================================

const POLICIES = {
  terms: {
    title: 'Terms & Conditions',
    sections: [
      { h: '1. Acceptance of Terms', p: 'By accessing and using Kalyaan, you accept and agree to be bound by the terms and provision of this agreement. This platform is for entertainment purposes only.' },
      { h: '2. Eligibility', p: 'You must be at least 18 years of age to use this service.', list: ['Must be 18+ years old', 'Must be a resident of India', 'One account per person/device', 'Valid mobile number required'] },
      { h: '3. Deposits & Withdrawals', p: 'All deposits are final and non-refundable once credited. Minimum deposit: ₹100. Minimum withdrawal: ₹200. Withdrawals processed within 24 hours.' },
      { h: '4. Game Rules', p: 'All game results are generated using a certified Random Number Generator (RNG). The platform reserves the right to void bets in case of technical errors.' },
      { h: '5. Prohibited Activities', p: 'The following activities are strictly prohibited:', list: ['Creating multiple accounts', 'Using bots or automated software', 'Exploiting bugs or glitches', 'Money laundering or fraud', 'Sharing account credentials'] },
      { h: '6. Account Suspension', p: 'Kalyaan reserves the right to suspend or terminate accounts at any time for violations without prior notice.' },
      { h: '7. Responsible Gaming', p: 'We encourage responsible gaming. If you feel you have a gambling problem, please reach out to our support team.' },
      { h: '8. Limitation of Liability', p: 'Kalyaan shall not be liable for any losses or damages arising from the use of this platform. All participation is at the user\'s own risk.' },
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { h: 'Information We Collect', p: 'We collect:', list: ['Mobile phone number', 'Device information and IP address', 'Game activity and betting history', 'Transaction records', 'Referral information'] },
      { h: 'How We Use Your Information', p: 'Your information is used to:', list: ['Verify your identity and prevent fraud', 'Process deposits and withdrawals', 'Calculate and pay referral commissions', 'Send promotional offers and bonuses'] },
      { h: 'Data Security', p: 'All sensitive data is encrypted and stored securely. We do not share your personal information with third parties without consent.' },
      { h: 'Data Retention', p: 'We retain your data for as long as your account is active. Upon deletion request, data will be removed within 30 days.' },
      { h: 'Contact Us', p: 'For privacy concerns, contact us via WhatsApp at +91 85179 23368.' },
    ]
  },
  responsible: {
    title: 'Responsible Gaming',
    sections: [
      { h: '⚠️ Play Responsibly', p: 'Kalyaan is a prediction game for entertainment. Never bet more than you can afford to lose.' },
      { h: 'Warning Signs', p: 'Watch out for:', list: ['Spending more than planned', 'Chasing losses', 'Neglecting responsibilities', 'Borrowing money to play'] },
      { h: 'Self-Control Tips', p: '', list: ['Set a daily/weekly budget', 'Never chase losses', 'Take regular breaks', 'Keep gaming as entertainment, not income'] },
      { h: 'Get Help', p: 'Contact our support team to set account limits or take a break from the platform.' },
    ]
  }
};

// ─── INIT ─────────────────────────────────────────────────
function initProfile() {
  const user = requireAuth();
  updateAllBalanceDisplays(user.balance);
  renderProfileInfo(user);
  checkProfileDailyBonus();
}

// ─── RENDER PROFILE ───────────────────────────────────────
function renderProfileInfo(user) {
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };

  set('profileName', user.name);
  set('menuNameSub', user.name);
  set('profilePhone', '+91 ' + user.phone.slice(0, 5) + 'XXXXX');
  set('profileUid', 'UID: ' + user.uid);

  const initial = document.getElementById('avatarInitial');
  if (initial) initial.textContent = user.name.charAt(0).toUpperCase();

  const bets = getBets();
  const wins = bets.filter(b => b.won).length;
  const winRate = bets.length ? ((wins / bets.length) * 100).toFixed(0) : 0;

  set('statBalance', '₹' + user.balance.toFixed(0));
  set('statBets', bets.length);
  set('statWin', winRate + '%');

  // VIP Level badge
  const totalBet = bets.reduce((s, b) => s + (b.amt || 0), 0);
  const level = getVipLevel(totalBet);
  set('profileLevelBadge', `${level.emoji} ${level.name} Member`);
}

// ─── DAILY BONUS ──────────────────────────────────────────
function checkProfileDailyBonus() {
  const claimed = checkDailyBonusClaimed();
  const sub = document.getElementById('dailyBonusSub');
  const badge = document.getElementById('dailyBonusBadge');
  if (sub) sub.textContent = claimed ? 'Already claimed today' : 'Claim your ₹10 daily bonus';
  if (badge) badge.style.display = claimed ? 'none' : '';
}

function profileClaimDailyBonus() {
  const done = claimDailyBonus(10);
  if (done) {
    checkProfileDailyBonus();
    const user = getUser();
    updateAllBalanceDisplays(user.balance);
    document.getElementById('statBalance').textContent = '₹' + user.balance.toFixed(0);
  }
}

// ─── EDIT NAME ────────────────────────────────────────────
function openEditName() {
  const user = getUser();
  const input = document.getElementById('newNameInput');
  if (input) input.value = user.name;
  const modal = document.getElementById('editNameModal');
  if (modal) {
    modal.classList.add('show');
    setTimeout(() => input?.focus(), 300);
  }
}

function closeEditName() {
  const modal = document.getElementById('editNameModal');
  if (modal) modal.classList.remove('show');
}

function saveName() {
  const name = document.getElementById('newNameInput')?.value?.trim();
  if (!name || name.length < 2) { showToast('Enter at least 2 characters', 'error'); return; }
  const user = getUser();
  user.name = name;
  saveUser(user);
  closeEditName();
  renderProfileInfo(user);
  showToast('Name updated successfully!', 'success');
}

// ─── POLICY MODAL ─────────────────────────────────────────
function showPolicy(type) {
  const policy = POLICIES[type];
  if (!policy) return;
  const titleEl = document.getElementById('policyTitle');
  const bodyEl = document.getElementById('policyBody');
  if (titleEl) titleEl.textContent = policy.title;
  if (bodyEl) {
    bodyEl.innerHTML = policy.sections.map(s => `
      <div class="policy-section">
        <div class="policy-h">${s.h}</div>
        ${s.p ? `<div class="policy-p">${s.p}</div>` : ''}
        ${s.list ? `<ul class="policy-list">${s.list.map(i => `<li>${i}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('');
  }
  const modal = document.getElementById('policyModal');
  if (modal) modal.classList.add('show');
}

function closePolicy() {
  const modal = document.getElementById('policyModal');
  if (modal) modal.classList.remove('show');
}

// ─── SUPPORT ──────────────────────────────────────────────
function openSupportWhatsApp() {
  const user = getUser();
  const msg = `Hello! I need help with my Kalyaan account.\nUID: ${user?.uid}\nPhone: +91${user?.phone}`;
  openWhatsApp(msg);
}

function openTelegram() {
  window.open('https://t.me/KalyaanOfficial', '_blank');
}

function rateApp() {
  const msg = 'I love Kalyaan! Amazing prediction game ⭐⭐⭐⭐⭐';
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}
