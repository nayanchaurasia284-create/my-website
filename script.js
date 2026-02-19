class AviatorGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.balance = 1000;
        this.betAmount = 100;
        this.multiplier = 1;
        this.gameState = 'waiting'; // waiting, betting, flying, crashed
        this.history = [];
        this.planeX = 50;
        this.planeY = 300;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.getElementById('betAmount').addEventListener('input', (e) => {
            this.betAmount = parseInt(e.target.value) || 100;
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.placeBet());
        document.getElementById('cashoutBtn').addEventListener('click', () => this.cashout());
        
        this.gameLoop();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    placeBet() {
        if (this.betAmount > this.balance) {
            alert('Insufficient balance!');
            return;
        }
        this.gameState = 'betting';
        document.getElementById('status').textContent = 'Game starting...';
        setTimeout(() => this.startFlight(), 3000);
    }
    
    startFlight() {
        this.balance -= this.betAmount;
        this.multiplier = 1.00;
        this.planeX = 50;
        this.planeY = this.canvas.height - 100;
        this.gameState = 'flying';
        document.getElementById('cashoutBtn').disabled = false;
        this.updateUI();
    }
    
    cashout() {
        const winnings = this.betAmount * this.multiplier;
        this.balance += winnings;
        this.gameState = 'crashed';
        this.addToHistory(this.multiplier.toFixed(2) + 'x');
        document.getElementById('status').textContent = `Cashed out at ${this.multiplier.toFixed(2)}x! Won $${winnings.toFixed(0)}`;
        document.getElementById('cashoutBtn').disabled = true;
        setTimeout(() => this.nextRound(), 3000);
    }
    
    nextRound() {
        this.gameState = 'waiting';
        document.getElementById('status').textContent = 'Place your bet for next round!';
        this.updateUI();
    }
    
    updateGame() {
        if (this.gameState === 'flying') {
            this.multiplier += 0.05;
            this.planeX += 3;
            this.planeY -= 0.5;
            
            // Random crash (1-100x)
            if (Math.random() < 0.015 && this.multiplier > 1.5) {
                this.crash();
                return;
            }
            
            if (this.planeX > this.canvas.width) {
                this.cashout();
            }
        }
    }
    
    crash() {
        this.gameState = 'crashed';
        document.getElementById('status').textContent = `💥 Crashed at ${this.multiplier.toFixed(2)}x!`;
        document.getElementById('cashoutBtn').disabled = true;
        this.addToHistory(this.multiplier.toFixed(2) + 'x');
        setTimeout(() => this.nextRound(), 2000);
    }
    
    addToHistory(multiplier) {
        this.history.unshift(multiplier);
        if (this.history.length > 10) this.history.pop();
        const list = document.getElementById('historyList');
        list.innerHTML = this.history.map(m => `<span class="history-item">${m}</span>`).join('');
    }
    
    updateUI() {
        document.getElementById('balance').textContent = this.balance.toFixed(0);
        document.querySelector('.multiplier').textContent = this.multiplier.toFixed(2) + 'x';
    }
    
    gameLoop() {
        this.updateGame();
        this.draw();
        this.updateUI();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Clouds
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.arc(100 + i * 200 + Math.sin(Date.now() * 0.001 + i) * 20, 80 + i * 20, 30, 0, Math.PI * 2);
            this.ctx.arc(130 + i * 200 + Math.sin(Date.now() * 0.001 + i) * 20, 70 + i * 20, 40, 0, Math.PI * 2);
            this.ctx.arc(160 + i * 200 + Math.sin(Date.now() * 0.001 + i) * 20, 85 + i * 20, 25, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Ground
        const gradient = this.ctx.createLinearGradient(0, this.canvas.height - 100, 0, this.canvas.height);
        gradient.addColorStop(0, '#98D8C8');
        gradient.addColorStop(1, '#F0E68C');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.canvas.height - 100, this.canvas.width, 100);
        
        // Plane
        if (this.gameState === 'flying' || this.gameState === 'betting') {
            this.ctx.save();
            this.ctx.translate(this.planeX, this.planeY);
            this.ctx.rotate(Math.sin(Date.now() * 0.005) * 0.1);
            
            // Plane body
            this.ctx.fillStyle = '#ff4444';
            this.ctx.beginPath();
            this.ctx.moveTo(0, -15);
            this.ctx.lineTo(40, 0);
            this.ctx.lineTo(0, 15);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Wings
            this.ctx.fillStyle = '#cc0000';
            this.ctx.fillRect(-5, -8, 15, 16);
            
            // Window
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.beginPath();
            this.ctx.arc(15, 0, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        // Multiplier text
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.multiplier.toFixed(2)}x`, this.canvas.width / 2, 80);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText(`${this.multiplier.toFixed(2)}x`, this.canvas.width / 2, 78);
    }
}

// Start game
const game = new AviatorGame();
