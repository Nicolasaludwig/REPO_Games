const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let dx = 0, dy = 0;
let nextDx = 0, nextDy = 0; // Buffer para bloquear 180° no mesmo frame

let food = { x: 5, y: 5 };
let specialFood = { x: -1, y: -1, active: false, timer: 0 };

let score = 0;
let topScore = localStorage.getItem("byteSnakeScore") || 0;
let topInitials = localStorage.getItem("byteSnakeInitials") || "---";

let lastTime = 0;
let moveTimer = 0;
const speed = 0.12; // Velocidade (Iteração do playtest)

document.getElementById("high-score").innerText = topScore;
document.getElementById("high-score-initials").innerText = topInitials;

function update(dt) {
    moveTimer += dt;
    
    // Decrementa o timer da comida especial
    if (specialFood.active) {
        specialFood.timer -= dt;
        if (specialFood.timer <= 0) specialFood.active = false;
    }

    if (moveTimer >= speed) {
        moveTimer = 0;
        
        // Aplica o input do buffer
        dx = nextDx;
        dy = nextDy;

        if (dx === 0 && dy === 0) return; // Jogo pausado no início

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Game Over: Parede
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            return gameOver();
        }

        // Game Over: Próprio corpo
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return gameOver();
            }
        }

        snake.unshift(head);

        // Comeu comida normal
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById("score").innerText = score;
            spawnFood();
            
            // 20% de chance de spawnar comida especial
            if (!specialFood.active && Math.random() < 0.2) {
                spawnSpecialFood();
            }
        } 
        // Comeu comida especial
        else if (specialFood.active && head.x === specialFood.x && head.y === specialFood.y) {
            score += 30;
            document.getElementById("score").innerText = score;
            specialFood.active = false;
        } 
        else {
            snake.pop(); // Remove a cauda se não comeu
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid (Estética)
    ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
    for(let i=0; i<tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, canvas.height);
        ctx.moveTo(0, i * gridSize); ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Comida Normal (Rosa)
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

    // Comida Especial (Dourada)
    if (specialFood.active) {
        // Pisca quando está acabando
        if (specialFood.timer > 1.5 || Math.floor(specialFood.timer * 10) % 2 === 0) {
            ctx.fillStyle = "#ffcc00";
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#ffcc00";
            ctx.fillRect(specialFood.x * gridSize + 2, specialFood.y * gridSize + 2, gridSize - 4, gridSize - 4);
            ctx.shadowBlur = 0;
        }
    }

    // Snake (Cyan)
    ctx.fillStyle = "#00ffff";
    for (let i = 0; i < snake.length; i++) {
        // Cabeça mais clara
        if (i === 0) ctx.fillStyle = "#e6ffff"; 
        else ctx.fillStyle = "#00ffff";
        
        ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
    }
}

function spawnFood() {
    let valid = false;
    while (!valid) {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        valid = !isOnSnake(food.x, food.y);
    }
}

function spawnSpecialFood() {
    let valid = false;
    while (!valid) {
        specialFood.x = Math.floor(Math.random() * tileCount);
        specialFood.y = Math.floor(Math.random() * tileCount);
        // Não pode nascer na cobra E nem em cima da comida normal
        valid = !isOnSnake(specialFood.x, specialFood.y) && (specialFood.x !== food.x || specialFood.y !== food.y);
    }
    specialFood.active = true;
    specialFood.timer = 6.0; // 6 segundos antes de sumir
}

function isOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

function gameOver() {
    if (score > topScore) {
        let initials = prompt("NOVO RECORDE! Digite suas iniciais (3 letras):", "AAA");
        if (initials) {
            initials = initials.substring(0, 3).toUpperCase();
            localStorage.setItem("byteSnakeScore", score);
            localStorage.setItem("byteSnakeInitials", initials);
        }
    }
    // Reset
    snake = [{ x: 10, y: 10 }];
    dx = 0; dy = 0; nextDx = 0; nextDy = 0;
    score = 0;
    specialFood.active = false;
    document.getElementById("score").innerText = score;
    topScore = localStorage.getItem("byteSnakeScore") || 0;
    topInitials = localStorage.getItem("byteSnakeInitials") || "---";
    document.getElementById("high-score").innerText = topScore;
    document.getElementById("high-score-initials").innerText = topInitials;
    spawnFood();
}

// Input Queue: O nextDx/nextDy evita o bug de apertar Cima+Esquerda muito rápido no mesmo frame
window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && dy === 0) { nextDx = 0; nextDy = -1; }
    if (e.key === "ArrowDown" && dy === 0) { nextDx = 0; nextDy = 1; }
    if (e.key === "ArrowLeft" && dx === 0) { nextDx = -1; nextDy = 0; }
    if (e.key === "ArrowRight" && dx === 0) { nextDx = 1; nextDy = 0; }
});

function loop(ts) {
    if (!lastTime) lastTime = ts;
    let dt = Math.min(0.05, (ts - lastTime) / 1000);
    lastTime = ts;

    update(dt);
    draw();
    requestAnimationFrame(loop);
}

spawnFood();
requestAnimationFrame(loop);