const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let dx = 0, dy = 0;
let nextDx = 0, nextDy = 0; 

let food = { x: 5, y: 5 };
let specialFood = { x: -1, y: -1, active: false, timer: 0 };

// portal em linha nas bordas e obstáculo
let portal = { axis: 'h', pos1: 5, pos2: 12, timer: 0 };
let obstacle = { x: -1, y: -1, timer: 0 };

let score = 0;
let topScore = localStorage.getItem("byteSnakeScore") || 0;
let topInitials = localStorage.getItem("byteSnakeInitials") || "---";

let lastTime = 0;
let moveTimer = 0;
const speed = 0.18; 

document.getElementById("high-score").innerText = topScore;
document.getElementById("high-score-initials").innerText = topInitials;

function update(dt) {
    moveTimer += dt;
    
    if (specialFood.active) {
        specialFood.timer -= dt;
        if (specialFood.timer <= 0) specialFood.active = false;
    }

    portal.timer -= dt;
    if (portal.timer <= 0) spawnPortal();

    obstacle.timer -= dt;
    if (obstacle.timer <= 0) spawnObstacle();

    if (moveTimer >= speed) {
        moveTimer = 0;
        
        dx = nextDx;
        dy = nextDy;

        if (dx === 0 && dy === 0) return; 

        let head = { x: snake[0].x + dx, y: snake[0].y + dy };

        let enteredPortal = false;

        // Lógica do Portal nas bordas (Se sair do mapa na posição correta, teleporta)
        if (portal.axis === 'h') {
            if (head.x < 0 && head.y === portal.pos1) {
                head.x = tileCount - 1; // Sai na parede direita
                head.y = portal.pos2;
                enteredPortal = true;
            } else if (head.x >= tileCount && head.y === portal.pos2) {
                head.x = 0; // Sai na parede esquerda
                head.y = portal.pos1;
                enteredPortal = true;
            }
        } else { // Eixo vertical ('v')
            if (head.y < 0 && head.x === portal.pos1) {
                head.y = tileCount - 1; // Sai na parede de baixo
                head.x = portal.pos2;
                enteredPortal = true;
            } else if (head.y >= tileCount && head.x === portal.pos2) {
                head.y = 0; // Sai na parede de cima
                head.x = portal.pos1;
                enteredPortal = true;
            }
        }

        // Game Over: Bateu na parede (se não tiver entrado no portal)
        if (!enteredPortal && (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount)) {
            return gameOver();
        }

        // Game Over: Próprio corpo ou Obstáculo
        for (let i = 0; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return gameOver();
            }
        }
        if (head.x === obstacle.x && head.y === obstacle.y) {
            return gameOver();
        }

        snake.unshift(head);

        // Comeu comida normal
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById("score").innerText = score;
            spawnFood();
            
            if (!specialFood.active && Math.random() < 0.2) spawnSpecialFood();
        } 
        // Comeu comida especial
        else if (specialFood.active && head.x === specialFood.x && head.y === specialFood.y) {
            score += 30;
            document.getElementById("score").innerText = score;
            specialFood.active = false;
        } 
        else {
            snake.pop(); 
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = "rgba(0, 255, 255, 0.05)";
    for(let i=0; i<tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, canvas.height);
        ctx.moveTo(0, i * gridSize); ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Portal (Reto em cima da linha da borda)
    ctx.shadowBlur = 10;
    if (portal.axis === 'h') {
        // Portal Esquerdo (Azul)
        ctx.fillStyle = "#00d4ff"; ctx.shadowColor = "#00d4ff";
        ctx.fillRect(0, portal.pos1 * gridSize, 4, gridSize);
        // Portal Direito (Laranja)
        ctx.fillStyle = "#ff8c00"; ctx.shadowColor = "#ff8c00";
        ctx.fillRect(canvas.width - 4, portal.pos2 * gridSize, 4, gridSize);
    } else {
        // Portal Topo (Azul)
        ctx.fillStyle = "#00d4ff"; ctx.shadowColor = "#00d4ff";
        ctx.fillRect(portal.pos1 * gridSize, 0, gridSize, 4);
        // Portal Fundo (Laranja)
        ctx.fillStyle = "#ff8c00"; ctx.shadowColor = "#ff8c00";
        ctx.fillRect(portal.pos2 * gridSize, canvas.height - 4, gridSize, 4);
    }
    ctx.shadowBlur = 0;

    // Obstáculo Letal
    ctx.fillStyle = "#ff003c";
    ctx.fillRect(obstacle.x * gridSize + 1, obstacle.y * gridSize + 1, gridSize - 2, gridSize - 2);
    ctx.fillStyle = "#4a0011";
    ctx.fillRect(obstacle.x * gridSize + 6, obstacle.y * gridSize + 6, gridSize - 12, gridSize - 12);

    // Comida Normal
    ctx.fillStyle = "#ff0055";
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

    // Comida Especial
    if (specialFood.active) {
        if (specialFood.timer > 1.5 || Math.floor(specialFood.timer * 10) % 2 === 0) {
            ctx.fillStyle = "#ffcc00";
            ctx.shadowBlur = 10; ctx.shadowColor = "#ffcc00";
            ctx.fillRect(specialFood.x * gridSize + 2, specialFood.y * gridSize + 2, gridSize - 4, gridSize - 4);
            ctx.shadowBlur = 0;
        }
    }

    // Snake
    ctx.fillStyle = "#00ffff";
    for (let i = 0; i < snake.length; i++) {
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
        valid = !isOnSnake(food.x, food.y) && !isObstacle(food.x, food.y);
    }
}

function spawnSpecialFood() {
    let valid = false;
    while (!valid) {
        specialFood.x = Math.floor(Math.random() * tileCount);
        specialFood.y = Math.floor(Math.random() * tileCount);
        valid = !isOnSnake(specialFood.x, specialFood.y) && 
                (specialFood.x !== food.x || specialFood.y !== food.y) &&
                !isObstacle(specialFood.x, specialFood.y);
    }
    specialFood.active = true;
    specialFood.timer = 6.0; 
}

function spawnPortal() {
    // Escolhe horizontal (h) ou vertical (v)
    portal.axis = Math.random() < 0.5 ? 'h' : 'v';
    // Sorteia a posição nas bordas (evita as pontas 0 e tileCount-1 para o portal não nascer na quina)
    portal.pos1 = Math.floor(Math.random() * (tileCount - 2)) + 1;
    portal.pos2 = Math.floor(Math.random() * (tileCount - 2)) + 1;
    portal.timer = 12.0;
}

function spawnObstacle() {
    let valid = false;
    while (!valid) {
        obstacle.x = Math.floor(Math.random() * (tileCount - 4)) + 2;
        obstacle.y = Math.floor(Math.random() * (tileCount - 4)) + 2;
        valid = !isOnSnake(obstacle.x, obstacle.y) &&
                !(obstacle.x === food.x && obstacle.y === food.y) &&
                !(specialFood.active && obstacle.x === specialFood.x && obstacle.y === specialFood.y);
    }
    obstacle.timer = 8.0; 
}

function isOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}
function isObstacle(x, y) {
    return x === obstacle.x && y === obstacle.y;
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
    
    snake = [{ x: 10, y: 10 }];
    dx = 0; dy = 0; nextDx = 0; nextDy = 0;
    score = 0;
    document.getElementById("score").innerText = score;
    topScore = localStorage.getItem("byteSnakeScore") || 0;
    topInitials = localStorage.getItem("byteSnakeInitials") || "---";
    document.getElementById("high-score").innerText = topScore;
    document.getElementById("high-score-initials").innerText = topInitials;
    
    specialFood.active = false;
    spawnFood();
    spawnPortal();
    spawnObstacle();
}

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase(); 
    if ((key === "arrowup" || key === "w") && dy === 0) { nextDx = 0; nextDy = -1; }
    if ((key === "arrowdown" || key === "s") && dy === 0) { nextDx = 0; nextDy = 1; }
    if ((key === "arrowleft" || key === "a") && dx === 0) { nextDx = -1; nextDy = 0; }
    if ((key === "arrowright" || key === "d") && dx === 0) { nextDx = 1; nextDy = 0; }
});

function loop(ts) {
    if (!lastTime) lastTime = ts;
    let dt = Math.min(0.05, (ts - lastTime) / 1000);
    lastTime = ts;

    update(dt);
    draw();
    requestAnimationFrame(loop);
}

// Inicializa a primeira vez
spawnFood();
spawnPortal();
spawnObstacle();
requestAnimationFrame(loop);