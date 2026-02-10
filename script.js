let balance = 1000;
let currentOdds = 0;
let currentMatch = "";

function openSlip(match, odds){
  currentMatch = match;
  currentOdds = odds;
  document.getElementById('slipMatch').innerText = match;
  document.getElementById('slipOdds').innerText = odds;
  document.getElementById('slip').classList.remove('hidden');
}

function closeSlip(){
  document.getElementById('slip').classList.add('hidden');
}

function placeBet(){
  const stake = Number(document.getElementById('stake').value);
  if(!stake || stake<=0){ alert('Enter stake'); return; }
  if(balance < stake){ alert('Insufficient Balance (Demo)'); return; }
  balance -= stake;
  document.getElementById('bal').innerText = balance;
  alert(`Bet Placed on ${currentMatch} @ ${currentOdds} (Demo)`);
  closeSlip();
}
