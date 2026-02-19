const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let balance = parseFloat(localStorage.getItem('balance')) || 1000;
let multiplier = 1.1; // start from 1.1
let running = false;
let crashPoint = 0;
let betAmount = 0;
let x = 0;
let points = [];
let planeTrail = [];

document.getElementById('balance').innerText = balance.toFixed(2);

const takeoffSound = document.getElementById('takeoff');
const crashSound = document.getElementById('crash');

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('cashBtn').addEventListener('click', cashout);

function startGame() {
    if (running) return;

    betAmount = parseFloat(document.getElementById('bet').value);
    if (betAmount > balance || betAmount <= 0) return;

    balance -= betAmount;
    updateBalance();
    multiplier = 1.1; // reset start multiplier

    // Crash logic based on requested percentages
    let chance = Math.random();
    if (chance < 0.85) { 
        crashPoint = Math.random() * (1.95 - 1.1) + 1.1; // 85% ≤ 1.95
    } else if (chance < 0.95) {
        crashPoint = Math.random() * (3 - 1.95) + 1.95; // 10% ≤ 3
    } else {
        crashPoint = Math.random() * 3 + 3; // 5% > 3
    }

    running = true;
    x = 0;
    points = [];
    planeTrail = [];
    takeoffSound.play();
    requestAnimationFrame(drawGraph);
}

function drawGraph() {
    if (!running) return;

    // 2x slow multiplier growth
    multiplier += 0.0015;

    x += 3;
    let oscillation = Math.sin(x * 0.05) * 20; // plane up-down
    let newY = canvas.height - Math.log(multiplier + 1) * 120 + oscillation;

    // restrict plane inside canvas
    if(newY < 50) newY = 50;
    if(newY > canvas.height - 30) newY = canvas.height - 30;

    points.push({x: x, y: newY});
    planeTrail.push({x: x, y: newY});
    if (planeTrail.length > 30) planeTrail.shift();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw curved line
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

    // plane trail
    planeTrail.forEach((p,i) => {
        ctx.fillStyle = `rgba(0,255,0,${i/planeTrail.length})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y-5, 4, 0, Math.PI*2);
        ctx.fill();
    });

    // plane icon
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("✈", points[points.length-1].x, points[points.length-1].y - 10);

    // multiplier display
    ctx.fillStyle = (Math.floor(multiplier*100) % 2 === 0) ? "white" : "lime";
    ctx.font = "25px Arial";
    ctx.fillText(multiplier.toFixed(2)+"x", 10, 30);

    // crash logic
    if (multiplier >= crashPoint){
        running = false;
        // small upward jump on crash
        points[points.length-1].y -= 15;
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
        balance += (multiplier * betAmount);
        updateBalance();
        running = false;
    }
}

function updateBalance() {
    document.getElementById('balance').innerText = balance.toFixed(2);
    localStorage.setItem('balance', balance);
        }
