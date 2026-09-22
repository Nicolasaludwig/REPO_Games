let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

// x, y - posicionar o objeto
// w, h - Definir o tamanho do personagem
// vx - define a velocidade horizontal
const player = {x: 40, y: 160, w: 32, h: 32, vx: 120};

let last = 0; // marca a posição do último frame

function update(dt){
    player.x += player.vx * dt;
    
    // Bate na parede e volta
    if (player.x + player.w > canvas.width || player.x < 0){
        player.vx *= -1;
    }
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.fillStyle = "#30e742ff"; 
    ctx.fillRect(player.x, player.y, player.w, player.h);

    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x -4, player.y + 32, player.h + 9, player.w - 25);

    ctx.fillText("deltatime (dt) aplicado", 12, 20);
}

function loop(ts){
    // CORREÇÃO 3: Adicionado o "!" para checar se 'last' NÃO tem valor (é zero) no primeiro frame
    if(!last) last = ts; 

    let dt = Math.min(0.05, (ts - last) / 1000); // ms para s
    last = ts;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

// Executa a primeira vez
requestAnimationFrame(loop);