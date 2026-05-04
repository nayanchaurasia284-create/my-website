// =============================================
// KALYAAN — VIP.JS
// VIP levels, tasks, daily VIP bonus
// =============================================

const VIP_TASKS = [
  { id: 'bet100', icon: '🎯', name: 'Place 100 Bets',  key: 'totalBets', target: 100, reward: 50  },
  { id: 'dep500', icon: '💳', name: 'Deposit ₹500',    key: 'totalDep',  target: 500, reward: 30  },
  { id: 'ref5',   icon: '👥', name: 'Refer 5 Friends', key: 'totalRef',  target: 5,   reward: 200 },
  { id: 'win50',  icon: '🏆', name: 'Win 50 Rounds',   key: 'totalWin',  target: 50,  reward: 100 },
  { id: 'login7', icon: '📅', name: 'Login 7 Days',    key: 'loginDays', target: 7,   reward: 25  },
];

// ─── INIT ─────────────────────────────────────────────────
function initVip() {
  const user = requireAuth();
  updateAllBalanceDisplays(user.balance);

  const bets = getBets();
  const totalBet = bets.reduce((s, b) => s + (b.amt || 0), 0);
  const currentLevel = getVipLevel(totalBet);
  const nextLevel = VIP_LEVELS[currentLevel.id + 1];

  updateVipHero(currentLevel, nextLevel, totalBet);
  renderLevelCards(currentLevel.id);
  renderVipTasks(user);
  checkVipClaimBtn(currentLevel);
}

// ─── HERO UPDATE ──────────────────────────────────────────
function updateVipHero(currentLevel, nextLevel, totalBet) {
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  const setStyle = (id, prop, val) => { const e = document.getElementById(id); if (e) e.style[prop] = val; };

  set('vipCrown', currentLevel.emoji);
  set('vipLevelName', currentLevel.name.toUpperCase());
  setStyle('vipLevelName', 'color', currentLevel.color);

  // Progress
  const prevReq = currentLevel.req;
  const nextReq = nextLevel ? nextLevel.req : currentLevel.req;
  const progress = nextLevel ? Math.min(100, ((totalBet - prevReq) / (nextReq - prevReq)) * 100) : 100;

  const fill = document.getElementById('vipProgressFill');
  if (fill) fill.style.width = progress + '%';

  set('progressFrom', currentLevel.name);
  set('progressTo', nextLevel ? nextLevel.name : 'MAX');

  if (nextLevel) {
    set('progressFooter', `Bet ₹${(nextReq - totalBet).toLocaleString('en-IN')} more to reach ${nextLevel.name}`);
  } else {
    set('progressFooter', '🎉 You have reached the highest VIP level!');
  }

  set('totalBetStat', '₹' + totalBet.toLocaleString('en-IN'));
  set('vipLevelNumStat', currentLevel.id);
  set('vipBonusStat', '₹' + (currentLevel.dailyBonus * 30).toLocaleString('en-IN'));
}

// ─── LEVEL CARDS ──────────────────────────────────────────
function renderLevelCards(currentLevelId) {
  const container = document.getElementById('levelCards');
  if (!container) return;

  container.innerHTML = VIP_LEVELS.map(vl => {
    const isCurrent = vl.id === currentLevelId;
    const isLocked = vl.id > currentLevelId;
    const rewards = [
      `🎁 ₹${vl.dailyBonus} Daily`,
      `💳 ${vl.cashback}% Cashback`,
      `👥 ${vl.refComm}% Ref`,
    ];
    return `
      <div class="vip-level-card ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}">
        <div class="vlc-header">
          <div class="vip-badge" style="background:rgba(255,255,255,0.06);border:2px solid ${vl.color}40;">
            ${vl.emoji}
            ${isCurrent ? '<div class="current-tag">YOU</div>' : ''}
          </div>
          <div class="vlc-info">
            <div class="vlc-name" style="color:${vl.color}">${vl.name}</div>
            <div class="vlc-req">${vl.req === 0 ? 'Free to join' : 'Min. ₹' + vl.req.toLocaleString('en-IN') + ' total bet'}</div>
          </div>
          <div style="font-size:22px;">${isLocked ? '🔒' : '✅'}</div>
        </div>
        <div class="vlc-rewards-wrap">
          <div class="vlc-rewards-title">Rewards & Benefits</div>
          <div class="reward-chips">
            ${rewards.map(r => `<div class="reward-chip">${r}</div>`).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ─── TASKS ────────────────────────────────────────────────
function renderVipTasks(user) {
  const container = document.getElementById('tasksList');
  if (!container) return;

  const refData = getReferralData();
  const bets = getBets();
  const claimedTasks = JSON.parse(localStorage.getItem('k_claimed_tasks') || '[]');

  const progress = {
    totalBets: bets.length,
    totalDep: 0,
    totalRef: refData.members.length,
    totalWin: user.totalWin || 0,
    loginDays: parseInt(localStorage.getItem('k_login_days') || '1'),
  };

  container.innerHTML = VIP_TASKS.map(task => {
    const current = progress[task.key] || 0;
    const pct = Math.min(100, (current / task.target) * 100);
    const done = current >= task.target;
    const claimed = claimedTasks.includes(task.id);

    return `
      <div class="task-card">
        <div class="task-icon">${task.icon}</div>
        <div class="task-info">
          <div class="task-name">${task.name}</div>
          <div class="task-progress">${current} / ${task.target} (${pct.toFixed(0)}%)</div>
          <div class="progress-bar-wrap" style="margin-top:6px;">
            <div class="progress-bar-fill" style="width:${pct}%;background:${done ? 'var(--green)' : 'linear-gradient(90deg,var(--red),var(--violet))'}"></div>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="task-reward">₹${task.reward}</div>
          ${done && !claimed
            ? `<button onclick="claimVipTask('${task.id}',${task.reward})" style="background:var(--green);border:none;border-radius:6px;padding:5px 10px;font-family:var(--font-ui);font-size:11px;font-weight:700;color:#fff;cursor:pointer;margin-top:4px;width:100%;">CLAIM</button>`
            : claimed
            ? `<div style="font-family:var(--font-ui);font-size:11px;color:var(--green);margin-top:4px;">✅ Claimed</div>`
            : ''
          }
        </div>
      </div>
    `;
  }).join('');
}

// ─── CLAIM VIP TASK ───────────────────────────────────────
function claimVipTask(id, rewardAmt) {
  const claimed = JSON.parse(localStorage.getItem('k_claimed_tasks') || '[]');
  if (claimed.includes(id)) { showToast('Already claimed!', 'error'); return; }
  claimed.push(id);
  localStorage.setItem('k_claimed_tasks', JSON.stringify(claimed));

  const user = getUser();
  user.balance += rewardAmt;
  saveUser(user);
  updateAllBalanceDisplays(user.balance);
  showToast(`🎉 ₹${rewardAmt} Task Reward Claimed!`, 'success');
  renderVipTasks(user);
}

// ─── VIP DAILY BONUS ──────────────────────────────────────
function checkVipClaimBtn(currentLevel) {
  const btn = document.getElementById('claimVipBtn');
  if (!btn) return;
  if (currentLevel.id > 0) {
    btn.style.display = 'flex';
    btn.textContent = `🎁 Claim VIP Daily Bonus ₹${currentLevel.dailyBonus}`;
  }
}

function claimVipBonus() {
  const today = new Date().toDateString();
  if (localStorage.getItem('k_vip_claim') === today) {
    showToast('VIP bonus already claimed today!', 'error');
    return;
  }

  const bets = getBets();
  const totalBet = bets.reduce((s, b) => s + (b.amt || 0), 0);
  const level = getVipLevel(totalBet);

  localStorage.setItem('k_vip_claim', today);
  const user = getUser();
  user.balance += level.dailyBonus;
  saveUser(user);
  updateAllBalanceDisplays(user.balance);
  showToast(`🎁 ₹${level.dailyBonus} VIP Daily Bonus Added!`, 'success');
  launchConfetti();
}
