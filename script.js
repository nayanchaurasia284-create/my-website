class AviatorGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.balance = 1000;
        this.betAmount = 100;
        this.multiplier = 1;
        this.gameState = 'waiting'; 
        this.history = [];
        this.planeX = 50;
        this.planeY = 300; // Fixed Y position - upar neeche नहीं
        this.trail = [];   // Blury trail के लिए
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // ✅ BET & CASHOUT BUTTONS PERFECTLY WORKING
        document.getElementById('betAmount').addEventListener('input', (e) => {
            this.betAmount = Math.max(10, Math.min(1000, parseInt(e.target.value) || 100));
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.placeBet());
        document.getElementById('cashoutBtn').addEventListener('click', () => this.cashout());
        
        this.gameLoop();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.planeY = this.canvas.height * 0.4; // Fixed height
    }
    
    // ✅ 85% = 1.95x, 10% = 3x, 5% = 3x+ RANDOM
    calculateCrashPoint() {
        const rand = Math.random();
        if (rand < 0.85) {
            return 1 + (0.95 * Math.random()); // 1.00x - 1.95x (85%)
        } else if (rand < 0.95) {
            return 3.0; // Exactly 3x (10%)
        } else {
            return 3 + (Math.random() * 97); // 3x - 100x (5%)
        }
    }
    
    placeBet() {
        if (this.betAmount > this.balance) {
            document.getElementById('status').textContent = '❌ Insufficient balance!';
            setTimeout(() => document.getElementById('status').textContent = 'Waiting...', 2000);
            return;
        }
        
        this.gameState = 'betting';
        document.getElementById('status').textContent = '3... 2... 1...';
        document.getElementById('startBtn').disabled = true;
        
        let countdown = 3;
        const timer = setInterval(() => {
            countdown--;
            document.getElementById('status').textContent = `${countdown}...`;
            if (countdown <= 0) {
                clearInterval(timer);
                this.startFlight();
            }
        }, 1000);
    }
    
    startFlight() {
        this.balance -= this.betAmount;
        this.multiplier = 1.00;
        this.planeX = 50;
        this.planeY = this.canvas.height * 0.4; // FIXED POSITION
        this.trail = []; // Reset trail
        this.gameState = 'flying';
        document.getElementById('cashoutBtn').disabled = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('status').textContent = '✈️ Plane flying... Cash out anytime!';
        
        // Calculate crash point at start (hidden)
        this.crashMultiplier = this.calculateCrashPoint();
        this.updateUI();
    }
    
    cashout() {
        const winnings = Math.floor(this.betAmount * this.multiplier);
        this.balance += winnings;
        this.endRound(`✅ Cashed out at ${this.multiplier.toFixed(2)}x! +$${winnings}`);
    }
    
    updateGame() {
        if (this.gameState === 'flying') {
            this.multiplier += 0.03; // Speed controlled
            this.planeX += 2.5;
            
            // ✅ FIXED POSITION - बस peeche blur trail
            this.planeY = this.canvas.height * 0.4 + Math.sin(Date.now() * 0.008) * 8;
            
            // Trail effect
            this.trail.unshift({x: this.planeX - 30, alpha: 0.8});
            if (this.trail.length > 20) this.trail.pop();
            
            // Check crash
            if (this.multiplier >= this.crashMultiplier) {
                this.crash();
            }
        }
    }
    
    crash() {
        this.endRound(`💥 CRASHED at ${this.multiplier.toFixed(2)}x! Lost $${this.betAmount}`);
    }
    
    endRound(message) {
        this.gameState = 'crashed';
        document.getElementById('status').textContent = message;
        document.getElementById('cashoutBtn').disabled = true;
        this.addToHistory(this.multiplier.toFixed(2) + 'x');
        
        setTimeout(() => {
            this.gameState = 'waiting';
            document.getElementById('status').textContent = 'Place bet for next round!';
            document.getElementById('startBtn').disabled = false;
            document.getElementById('betAmount').focus();
            this.updateUI();
        }, 4000);
    }
    
    addToHistory(multiplier) {
        this.history.unshift(multiplier);
        if (this.history.length > 12) this.history.pop();
        const list = document.getElementById('historyList');
        list.innerHTML = this.history.map(m => {
            const val = parseFloat(m);
            let color = val < 2 ? '#ff4444' : val < 3 ? '#ffaa00' : '#00ff88';
            return `<span class="history-item" style="background: ${color}20">${m}</span>`;
        }).join('');
    }
    
    updateUI() {
        document.getElementById('balance').textContent = this.balance.toFixed(0);
        document.querySelector('.multiplier').textContent = this.multiplier.toFixed(2) + 'x';
    }
    
    gameLoop() {
        this.updateGame();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98D8C8');
        gradient.addColorStop(1, '#F0E68C');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clouds (animated)
        this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 4; i++) {
            const x = (100 + i * 180 + (Date.now() * 0.03 + i * 100) % 300) % this.canvas.width;
            this.ctx.beginPath();
            this.ctx.arc(x, 80 + i * 25, 25, 0, Math.PI * 2);
            this.ctx.arc(x + 30, 75 + i * 25, 35, 0, Math.PI * 2);
            this.ctx.arc(x + 60, 85 + i * 25, 20, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // ✅ BLUR TRAIL EFFECT
        this.trail.forEach((point, i) => {
            this.ctx.save();
            this.ctx.globalAlpha = point.alpha * (1 - i / this.trail.length);
            this.ctx.fillStyle = '#ff4444';
            this.ctx.beginPath();
            this.ctx.arc(point.x, this.planeY, 12 - i * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // Plane (FIXED POSITION)
        if (this.gameState === 'flying' || this.gameState === 'betting') {
            this.ctx.save();
            this.ctx.translate(this.planeX, this.planeY);
            
            // Plane body
            this.ctx.fillStyle = '#ff4444';
            this.ctx.shadowColor = '#ff6666';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -12);
            this.ctx.lineTo(35, 0);
            this.ctx.lineTo(0, 12);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Wings
            this.ctx.fillStyle = '#cc0000';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(-3, -6, 12, 12);
            
            // Window glow
            this.ctx.shadowColor = '#87CEEB';
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.beginPath();
            this.ctx.arc(12, 0, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
            this.ctx.shadowBlur = 0;
        }
        
        // BIG MULTIPLIER TEXT
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.font = `bold ${Math.min(60, this.canvas.width * 0.12)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.multiplier.toFixed(2)}x`, this.canvas.width / 2, 100);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = `bold ${Math.min(55, this.canvas.width * 0.11)}px Arial`;
        this.ctx.fillText(`${this.multiplier.toFixed(2)}x`, this.canvas.width / 2, 95);
        
        // Status overlay
        if (this.gameState === 'betting') {
            this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
            this.ctx.fillRect(0, this.canvas.height * 0.4, this.canvas.width, 80);
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GET READY!', this.canvas.width / 2, this.canvas.height * 0.45);
        }
    }
}

// 🔥 START GAME
const game = new AviatorGame();
