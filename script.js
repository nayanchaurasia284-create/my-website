const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let balance = parseInt(localStorage.getItem('balance')) || 1000;
let multiplier = 1.0;
let running = false;
let crashPoint = 0;
let betAmount = 0;
let x = 0;
let points = [];
let planeTrail = [];

document.getElementById('balance').innerText = balance;

const takeoffSound = document.getElementById('takeoff');
const crashSound = document.getElementById('crash');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('cashBtn').addEventListener('click', cashout);

function startGame() {
    if (running) return;

    betAmount = parseInt(document.getElementById('bet').value);
    if (betAmount > balance || betAmount <= 0) return;

    balance -= betAmount;
    updateBalance();
    multiplier = 1.0;
    crashPoint = Math.random() * 4 + 1.5;
    running = true;
    x = 0;
    points = [];
    planeTrail = [];
    takeoffSound.play();
    requestAnimationFrame(drawGraph);
}

function drawGraph() {
    if (!running) return;

    multiplier += 0.03;
    x += 3;
    let newY = canvas.height - Math.log(multiplier + 1) * 120;
    points.push({x: x, y: newY});
    planeTrail.push({x: x, y: newY});

    if (planeTrail.length > 30) planeTrail.shift();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00ff00";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 50);
    for (let i = 1; i < points.length; i++) {
        let midX = (points[i-1].x + points[i].x)/2;
        let midY = (points[i-1].y + points[i].y)/2;
        ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, midX, midY);
    }
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.shadowBlur = 0;

    planeTrail.forEach((p,i) => {
        ctx.fillStyle = `rgba(0,255,0,${i/planeTrail.length})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y-5, 4, 0, Math.PI*2);
        ctx.fill();
    });

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("✈", points[points.length-1].x, points[points.length-1].y - 10);

    ctx.fillStyle = (Math.floor(multiplier*10) % 2 === 0) ? "white" : "lime";
    ctx.font = "25px Arial";
    ctx.fillText(multiplier.toFixed(2)+"x", 10, 30);

    if (multiplier >= crashPoint){
        running = false;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(points[points.length-1].x, points[points.length-1].y, 15, 0, Math.PI*2);
        ctx.fill();
        crashSound.play();
        return;
    }

    requestAnimationFrame(drawGraph);
}

function cashout() {
    if (running) {
        balance += Math.floor(multiplier * betAmount);
        updateBalance();
        running = false;
    }
}

function updateBalance() {
    document.getElementById('balance').innerText = balance;
    localStorage.setItem('balance', balance);
}