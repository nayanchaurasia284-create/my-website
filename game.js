// =============================================
// KALYAAN — GAME.JS
// WinGo game logic: timer, bets, results
// =============================================

// ─── GAME STATE ───────────────────────────────────────────
let timeLeft = 60;
let currentDuration = 60;
let period = parseInt(localStorage.getItem('k_period') || '20250502001');
let timerInterval = null;
let pendingBet = null;
let betAmount = 10;
let selType = null;
let selVal = null;

// ─── INIT GAME ────────────────────────────────────────────
function initGame() {
  buildNumGrid();
  renderResultStrip();
  renderBetsTable();
  buildMarquee();
  checkDailyBannerStatus();
  startTimer();
  updatePeriodDisplay();
}

// ─── NUM GRID ─────────────────────────────────────────────
function buildNumGrid() {
  const grid = document.getElementById('numGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const clsMap = { red: 'nb-red', green: 'nb-green', rv: 'nb-violet', gv: 'nb-violet' };
  for (let i = 0; i <= 9; i++) {
    const c = NUM_COLORS[i];
    const btn = document.createElement('button');
    btn.className = `num-btn ${clsMap[c] || 'nb-red'}`;
    btn.textContent = i;
    btn.id = `nb${i}`;
    btn.onclick = () => selectBet('number', i);
    grid.appendChild(btn);
  }
}

// ─── BET SELECTION ────────────────────────────────────────
function selectBet(type, val) {
  if (timeLeft <= 5) { showToast('Betting closed for this round!', 'error'); return; }
  selType = type;
  selVal = val;
  document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('selected'));
  if (type === 'number') {
    const el = document.getElementById(`nb${val}`);
    if (el) el.classList.add('selected');
  }
  const label = type === 'color' ? val.toUpperCase() : `Number ${val}`;
  showToast(`Selected: ${label}`, 'info');
}

// ─── AMOUNT ───────────────────────────────────────────────
function pickPresetAmount(amount, el) {
  betAmount = amount;
  const input = document.getElementById('betAmtInput');
  if (input) input.value = amount;
  document.querySelectorAll('.amt-chip').forEach(c => c.classList.remove('sel'));
  if (el) el.classList.add('sel');
}

function changeAmount(delta) {
  const input = document.getElementById('betAmtInput');
  betAmount = Math.max(1, (parseFloat(input?.value) || 0) + delta);
  if (input) input.value = betAmount;
}

function multiplyAmount(x) {
  const input = document.getElementById('betAmtInput');
  betAmount = Math.min(10000, (parseFloat(input?.value) || 10) * x);
  if (input) input.value = betAmount;
}

function halveAmount() {
  const input = document.getElementById('betAmtInput');
  betAmount = Math.max(1, Math.floor((parseFloat(input?.value) || 10) / 2));
  if (input) input.value = betAmount;
}

// ─── PLACE BET ────────────────────────────────────────────
function placeBet() {
  const user = getUser();
  if (!user) return;

  if (timeLeft <= 5) { showToast('Betting closed for this round', 'error'); return; }
  if (!selType) { showToast('Select a color or number first!', 'error'); return; }
  if (pendingBet) { showToast('Bet already placed! Wait for result.', 'error'); return; }

  const input = document.getElementById('betAmtInput');
  const amt = parseFloat(input?.value) || betAmount;

  if (amt > user.balance) { showToast('Insufficient balance!', 'error'); return; }
  if (amt < 1) { showToast('Minimum bet is ₹1', 'error'); return; }

  user.balance -= amt;
  saveUser(user);
  updateAllBalanceDisplays(user.balance);

  pendingBet = { type: selType, val: selVal, amt };

  const btn = document.getElementById('placeBetBtn');
  if (btn) {
    btn.textContent = '✅ BET PLACED — WAITING RESULT...';
    btn.style.background = 'linear-gradient(135deg, var(--green), #007a5a)';
    setTimeout(() => {
      btn.textContent = '🎯 PLACE BET';
      btn.style.background = '';
    }, 3000);
  }
  showToast(`✅ Bet placed: ₹${amt}`, 'success');
}

// ─── TIMER ────────────────────────────────────────────────
function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(timerTick, 1000);
  updateTimerDisplay();
}

function timerTick() {
  timeLeft--;
  updateTimerDisplay();
  if (timeLeft <= 5) showBetLock();
  if (timeLeft <= 0) endRound();
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const ms = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  const ids = ['td-m1', 'td-m2', 'td-s1', 'td-s2'];
  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = (i < 2 ? ms : ss)[i < 2 ? i : i - 2];
    el.classList.toggle('urgent', timeLeft <= 10);
  });
}

function showBetLock() {
  const lock = document.getElementById('betLock');
  if (lock) lock.style.display = 'flex';
}

function hideBetLock() {
  const lock = document.getElementById('betLock');
  if (lock) lock.style.display = 'none';
}

function updatePeriodDisplay() {
  const el = document.getElementById('periodNum');
  if (el) el.textContent = period;
}

// ─── END ROUND ────────────────────────────────────────────
function endRound() {
  clearInterval(timerInterval);

  // Check override
  const overrideMode = localStorage.getItem('k_game_mode');
  let resultNum;
  if (overrideMode === 'override') {
    const ov = localStorage.getItem('k_override_result');
    resultNum = ov !== null ? parseInt(ov) : Math.floor(Math.random() * 10);
    localStorage.removeItem('k_override_result');
    localStorage.removeItem('k_game_mode');
  } else {
    resultNum = Math.floor(Math.random() * 10);
  }

  const rc = NUM_COLORS[resultNum];

  // Save result
  const results = getResults();
  results.unshift({ num: resultNum, rc });
  if (results.length > 20) results.pop();
  saveResults(results);
  renderResultStrip();

  // Resolve bet
  if (pendingBet) {
    resolveBet(pendingBet, resultNum, rc);
    pendingBet = null;
  }

  // Next round
  period++;
  localStorage.setItem('k_period', period);
  updatePeriodDisplay();
  timeLeft = currentDuration;
  hideBetLock();
  startTimer();
}

// ─── RESOLVE BET ──────────────────────────────────────────
function resolveBet(bet, rn, rc) {
  let won = false;
  let mult = 1;

  if (bet.type === 'color') {
    if (bet.val === 'green')  { won = rc === 'green' || rc === 'gv'; mult = 2; }
    else if (bet.val === 'red')    { won = rc === 'red'   || rc === 'rv'; mult = 2; }
    else if (bet.val === 'violet') { won = rc === 'rv'    || rc === 'gv'; mult = 4.5; }
  } else {
    won = bet.val === rn;
    mult = 9;
  }

  const profit = won ? Math.floor(bet.amt * mult - bet.amt) : -bet.amt;
  const user = getUser();
  if (won) user.balance += bet.amt * mult;
  user.totalBets = (user.totalBets || 0) + 1;
  if (won) user.totalWin = (user.totalWin || 0) + 1;
  saveUser(user);
  updateAllBalanceDisplays(user.balance);

  const label = getResultColorLabel(rn);
  const bets = getBets();
  bets.unshift({
    period, won,
    bet: bet.type === 'color' ? bet.val : 'No.' + bet.val,
    result: label, amt: bet.amt, profit
  });
  if (bets.length > 30) bets.pop();
  saveBets(bets);
  renderBetsTable();

  showWinModal(won, label, profit, bet.amt);
}

// ─── RENDER RESULT STRIP ──────────────────────────────────
function renderResultStrip() {
  const strip = document.getElementById('resultStrip');
  if (!strip) return;
  strip.innerHTML = '';
  getResults().slice(0, 15).forEach(r => {
    const dot = document.createElement('div');
    dot.className = `r-dot ${getResultDotClass(r.rc)}`;
    dot.textContent = r.num;
    strip.appendChild(dot);
  });
}

// ─── RENDER BETS TABLE ────────────────────────────────────
function renderBetsTable() {
  const tbody = document.getElementById('betsBody');
  if (!tbody) return;
  const bets = getBets();
  if (!bets.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;font-family:var(--font-ui);">No bets yet</td></tr>';
    return;
  }
  tbody.innerHTML = bets.slice(0, 15).map(b => {
    const plCol = b.profit > 0 ? 'var(--green)' : 'var(--red)';
    const plText = b.profit > 0 ? `+₹${b.profit}` : `₹${b.profit}`;
    return `
      <tr>
        <td style="color:var(--muted);font-size:11px">${b.period}</td>
        <td style="text-transform:capitalize;color:var(--text2)">${b.bet}</td>
        <td style="font-size:12px;color:var(--text2)">${b.result}</td>
        <td>₹${b.amt}</td>
        <td style="color:${plCol};font-weight:700">${plText}</td>
      </tr>
    `;
  }).join('');
}

// ─── WIN MODAL ────────────────────────────────────────────
function showWinModal(won, label, profit, amt) {
  const modal = document.getElementById('winModal');
  if (!modal) return;
  document.getElementById('winEmoji').textContent = won ? '🎉' : '😢';
  document.getElementById('winTitle').textContent = won ? 'You Won!' : 'Better Luck!';
  document.getElementById('winTitle').style.color = won ? 'var(--green)' : 'var(--red)';
  document.getElementById('winDetail').textContent = `Result: ${label}`;
  document.getElementById('winAmount').textContent = won ? `+₹${profit}` : `-₹${amt}`;
  document.getElementById('winAmount').style.color = won ? 'var(--gold)' : 'var(--red)';
  modal.classList.add('show');
  if (won) launchConfetti();
}

function closeWinModal() {
  const modal = document.getElementById('winModal');
  if (modal) modal.classList.remove('show');
}

// ─── GAME TAB SWITCH ──────────────────────────────────────
function switchGameTab(mode) {
  const durations = { wingo1: 60, wingo3: 180, wingo5: 300 };
  currentDuration = durations[mode] || 60;
  timeLeft = currentDuration;
  clearInterval(timerInterval);
  startTimer();
  document.querySelectorAll('.game-tab').forEach((t, i) => {
    t.classList.toggle('active', ['wingo1', 'wingo3', 'wingo5'][i] === mode);
  });
  showToast(`Switched to ${mode.replace('wingo', 'WinGo ')} Min`, 'info');
}

// ─── DAILY BONUS BANNER ───────────────────────────────────
function checkDailyBannerStatus() {
  const claimed = checkDailyBonusClaimed();
  const btn = document.getElementById('dbbBtn');
  const sub = document.getElementById('dbbSub');
  if (btn) { btn.textContent = claimed ? 'CLAIMED ✓' : 'CLAIM'; btn.disabled = claimed; }
  if (sub) sub.textContent = claimed ? 'Come back tomorrow!' : 'Claim your ₹10 daily bonus!';
}

function claimHomeDailyBonus() {
  const done = claimDailyBonus(10);
  if (done) {
    checkDailyBannerStatus();
    updateAllBalanceDisplays(getUser().balance);
  }
}

// ─── MARQUEE ──────────────────────────────────────────────
function buildMarquee() {
  const inner = document.getElementById('marqueeInner');
  if (!inner) return;
  const names = ['Ravi ***3421', 'Priya ***8812', 'Amit ***2234', 'Sunita ***6671', 'Karan ***9901', 'Meera ***3345'];
  const amounts = [450, 1200, 890, 2300, 675, 1050];
  const items = [...names, ...names].map((n, i) =>
    `<span class="marquee-item">🏆 ${n} won <strong style="color:var(--gold)">₹${amounts[i % 6]}</strong></span>`
  ).join('');
  inner.innerHTML = items;
}
