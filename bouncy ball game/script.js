const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const player = { 
    x: 50,
    y: 200,
    r: 16,
    vx: 300,
    vy: 250,
    impactTimer: 0
};

    let last = 0;

function update(dt) {

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    let hit = false;

    if (player.x + player.r > canvas.width) {
        player.x = canvas.width - player.r;
        player.vx *= -1;
        hit = true;
    } else if (player.x - player.r < 0) {
        player.x = player.r;
        player.vx *= -1;
        hit = true;
    }

    if (player.y + player.r > canvas.height) {
        player.y = canvas.height - player.r;
        player.vy *= -1;
        hit = true;
    } else if (player.y - player.r < 0) {
        player.y = player.r;
        player.vy *= -1;
        hit = true;
    }

    if (hit) {
        player.impactTimer = 0.2; 
    }

    if (player.impactTimer > 0) {
        player.impactTimer -= dt;
    }
}

function draw(dt) {

    ctx.fillStyle = "rgba(34, 34, 34, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (player.impactTimer > 0) {
        ctx.fillStyle = "#ff0055";
    } else {
        ctx.fillStyle = "#30e742ff";
    }

    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    let ms = (dt * 1000).toFixed(1);
    let fps = dt > 0 ? Math.round(1 / dt) : 0;

    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`dt: ${ms} ms`, 10, 20);
    ctx.fillText(`FPS: ~${fps}`, 10, 38);
}

function loop(ts) {
    if (!last) last = ts; 

    let dt = Math.min(0.05, (ts - last) / 1000); 
    last = ts;

    update(dt);
    draw(dt);

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);