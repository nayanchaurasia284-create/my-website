let balance = 1000;

function bet(amount) {
  if (balance >= amount) {
    balance -= amount;
    document.getElementById("bal").innerText = balance;
    alert("Bet Placed (Demo)");
  } else {
    alert("Insufficient Balance (Demo)");
  }
}
