/* ============================================================
   PokECG — Game Logic (Full Flow)
   Flow: Oak → Center Exterior → Center Interior (Joy) → Map → Battles → Trophy
   ============================================================ */

// ===== ESTADO =====
let playerName = "Ash";
let caughtCount = 0;
let caughtIds = new Set();
let playerPos = { x: 45, y: 70 };
let currentEnemy = null;
let currentPokemonId = null;
let currentPathologyId = null;
let answered = false;
let audioTimeout = null;
let battleMusicTimeout = null;
let battleInProgress = false;

// ===== MAPEO ALEATORIO =====
let pokemonMapping = null;

// ===== REFERENCIAS AUDIO =====
const audioRefs = {
    lab:     document.getElementById("labMusic"),
    route:   document.getElementById("routeMusic"),
    center:  document.getElementById("centerMusic"),
    battle:  document.getElementById("battleMusic"),
    win:     document.getElementById("winMusic"),
    lose:    document.getElementById("loseMusic"),
    trophy:  document.getElementById("trophyMusic"),
    pathology: document.getElementById("pathologyAudio")
};

// ===== CONTROL DE AUDIO =====
function stopAllMusic() {
    Object.values(audioRefs).forEach(a => {
        if (a && a.pause) { a.pause(); a.currentTime = 0; }
    });
    if (battleMusicTimeout) { clearTimeout(battleMusicTimeout); battleMusicTimeout = null; }
    if (audioTimeout) { clearTimeout(audioTimeout); audioTimeout = null; }
}

function playMusic(ref, loop = true) {
    if (!ref) return;
    ref.loop = loop;
    ref.currentTime = 0;
    ref.play().catch(() => {});
}

// ===== ESCENAS =====
function showScene(id) {
    document.querySelectorAll(".scene").forEach(s => s.classList.remove("active"));
    const scene = document.getElementById(id);
    if (scene) scene.classList.add("active");
}

// ============================================================
// ALEATORIEDAD: MAPEO DE POKÉMON A PATOLOGÍAS
// ============================================================
function generateRandomMapping() {
    const pokemonIds = [...Array(27).keys()].map(i => i + 1);

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    const shuffled = shuffle(pokemonIds);
    pokemonMapping = {};

    POKEDEX.forEach((p, index) => {
        pokemonMapping[index + 1] = shuffled[index];
    });

    console.log("🎲 Mapeo aleatorio generado");
}

// ============================================================
// ESCENA 1: OAK INTRO
// ============================================================
const oakLines = [
    "Hello there! Welcome to the world of PokECG!",
    "My name is Professor Oak.",
    "This is a world where Pokémon and cardiac medicine come together.",
    "Here you will learn to identify 27 heart pathologies using the ECG.",
    "Let me introduce you to your partner: Pikachu!",
    "Together you will catch the 27 escaped Pokémon.",
    "Before we begin... what is your name?"
];
let oakIndex = 0;
let oakChar = 0;
const oakTextEl = document.getElementById("oakText");

function typeOakLine() {
    if (oakIndex >= oakLines.length) {
        document.getElementById("nameInputContainer").style.display = "block";
        return;
    }
    const line = oakLines[oakIndex];
    if (oakChar < line.length) {
        oakTextEl.textContent += line.charAt(oakChar);
        oakChar++;
        setTimeout(typeOakLine, 35);
    } else {
        oakIndex++;
        oakChar = 0;
        setTimeout(() => {
            oakTextEl.textContent = "";
            typeOakLine();
        }, 1400);
    }
}

document.getElementById("nameOkBtn").onclick = () => {
    const name = document.getElementById("playerName").value.trim() || "Ash";
    playerName = name;
    stopAllMusic();
    goToCenterExterior();
};

// ============================================================
// ESCENA 2: CENTRO POKÉMON EXTERIOR
// ============================================================
function goToCenterExterior() {
    showScene("scene-center-exterior");
    playMusic(audioRefs.center);
    setTimeout(() => {
        document.addEventListener("keydown", centerExteriorKeyHandler);
    }, 500);
}

function centerExteriorKeyHandler(e) {
    if (e.key === "Enter") {
        document.removeEventListener("keydown", centerExteriorKeyHandler);
        goToCenterInterior();
    }
}

// ============================================================
// ESCENA 3: CENTRO POKÉMON INTERIOR (JOY)
// ============================================================
function goToCenterInterior() {
    showScene("scene-center");
    const nurseText = document.getElementById("nurseText");
    const lines = [
        "Welcome to the Pokémon Center!",
        "Some Pokémon escaped into the forest...",
        "You must identify them by their ECG and catch all 27!",
        "Go out there and become a PokECG Master!"
    ];
    let i = 0, c = 0;
    nurseText.textContent = "";
    document.getElementById("nurseOkBtn").style.display = "none";

    function type() {
        if (i >= lines.length) {
            document.getElementById("nurseOkBtn").style.display = "inline-block";
            return;
        }
        if (c < lines[i].length) {
            nurseText.textContent += lines[i].charAt(c);
            c++;
            setTimeout(type, 35);
        } else {
            i++; c = 0;
            setTimeout(() => { nurseText.textContent = ""; type(); }, 1200);
        }
    }
    type();
}

document.getElementById("nurseOkBtn").onclick = () => {
    stopAllMusic();
    goToMap();
};

// ============================================================
// ESCENA 4: MAPA DEL BOSQUE
// ============================================================
// Posiciones ajustadas para que TODOS estén en zonas caminables
// Repartidos en 4 filas para cubrir todo el mapa
// Esquivando: lago (abajo-der), Centro Pokémon (arriba-centro), casa (arriba-der)
const POKEMON_POSITIONS = [
    // ===== FILA 1: Bosque superior (izq a der) =====
    {x:12, y:22}, {x:22, y:18}, {x:32, y:24}, {x:42, y:20},
    {x:52, y:26}, {x:62, y:22}, {x:72, y:28}, {x:82, y:24},

    // ===== FILA 2: Bosque centro (izq a der) =====
    {x:18, y:38}, {x:28, y:42}, {x:38, y:36}, {x:48, y:44},
    {x:58, y:38}, {x:68, y:46}, {x:78, y:40}, {x:88, y:48},

    // ===== FILA 3: Bosque centro-bajo =====
    {x:15, y:55}, {x:25, y:60}, {x:35, y:54}, {x:45, y:62},
    {x:55, y:56}, {x:65, y:62},

    // ===== FILA 4: Bosque inferior (esquivando lago) =====
    {x:12, y:72}, {x:22, y:78}, {x:32, y:72}, {x:42, y:80}, {x:55, y:75}
];

function goToMap() {
    showScene("scene-map");
    playMusic(audioRefs.route);
    document.getElementById("hudCount").textContent = `${caughtCount} / 27`;

    if (!pokemonMapping) {
        generateRandomMapping();
    }

    spawnPokemon();
    updatePlayerSprite();
    updateHudCount();

    battleInProgress = false;
}

function spawnPokemon() {
    const layer = document.getElementById("pokemonLayer");
    layer.innerHTML = "";

    POKEDEX.forEach((p, i) => {
        const pokemonId = i + 1;
        const pathologyId = pokemonMapping[pokemonId];

        const img = document.createElement("img");
        img.src = p.pokemonImg;
        img.className = "map-pokemon";
        img.style.left = POKEMON_POSITIONS[i].x + "%";
        img.style.top = POKEMON_POSITIONS[i].y + "%";
        img.dataset.id = pokemonId;
        img.dataset.pathologyId = pathologyId;
        img.onclick = () => {
            if (!battleInProgress) {
                triggerBattle(pokemonId);
            }
        };
        if (caughtIds.has(pathologyId)) img.classList.add("caught");
        layer.appendChild(img);
    });
}

function updatePlayerSprite() {
    const sprite = document.getElementById("playerSprite");
    if (!sprite) return;
    sprite.style.left = playerPos.x + "%";
    sprite.style.top = playerPos.y + "%";
}

function updateHudCount() {
    document.getElementById("hudCount").textContent = `${caughtCount} / 27`;
}

// ============================================================
// DETECCIÓN DE COLISIONES (HÍBRIDA: viewport + rectángulo)
// ============================================================
let movementStarted = false;

function checkCollisions() {
    if (battleInProgress) return;
    if (!document.getElementById("scene-map").classList.contains("active")) return;

    const mapW = window.innerWidth;
    const mapH = window.innerHeight;

    // Área de colisión (basada en el viewport)
    const COLLISION_RADIUS_X = mapW * 0.035;  // 3.5% del ancho
    const COLLISION_RADIUS_Y = mapH * 0.05;   // 5% del alto

    POKEDEX.forEach((p, i) => {
        const pokemonId = i + 1;
        const pathologyId = pokemonMapping[pokemonId];

        if (caughtIds.has(pathologyId)) return;

        const pokemonPos = POKEMON_POSITIONS[i];

        const ashX = (playerPos.x / 100) * mapW;
        const ashY = (playerPos.y / 100) * mapH;
        const pokeX = (pokemonPos.x / 100) * mapW;
        const pokeY = (pokemonPos.y / 100) * mapH;

        const dx = Math.abs(ashX - pokeX);
        const dy = Math.abs(ashY - pokeY);

        if (dx < COLLISION_RADIUS_X && dy < COLLISION_RADIUS_Y) {
            battleInProgress = true;
            triggerBattle(pokemonId);
        }
    });
}

// Movimiento con flechas
function startMovement() {
    if (movementStarted) return;
    movementStarted = true;

    document.addEventListener("keydown", (e) => {
        if (!document.getElementById("scene-map").classList.contains("active")) return;
        if (battleInProgress) return;

        const step = 2;
        const sprite = document.getElementById("playerSprite");

        switch (e.key) {
            case "ArrowUp":    playerPos.y = Math.max(0, playerPos.y - step); if (sprite) sprite.src = "Images/characters/Ash_up.png"; break;
            case "ArrowDown":  playerPos.y = Math.min(95, playerPos.y + step); if (sprite) sprite.src = "Images/characters/Ash_down.png"; break;
            case "ArrowLeft":  playerPos.x = Math.max(0, playerPos.x - step); if (sprite) sprite.src = "Images/characters/Ash_left.png"; break;
            case "ArrowRight": playerPos.x = Math.min(95, playerPos.x + step); if (sprite) sprite.src = "Images/characters/Ash_right.png"; break;
            default: return;
        }

        updatePlayerSprite();
        checkCollisions();
    });
}

// ============================================================
// ESCENA 5: BATALLA
// ============================================================
function triggerBattle(pokemonId) {
    const img = document.querySelector(`.map-pokemon[data-id="${pokemonId}"]`);
    if (!img) return;

    const pathologyId = +img.dataset.pathologyId;

    if (caughtIds.has(pathologyId)) {
        battleInProgress = false;
        return;
    }

    currentPokemonId = pokemonId;
    currentPathologyId = pathologyId;
    currentEnemy = getPathology(pathologyId);
    answered = false;
    battleInProgress = true;

    showScene("scene-battle");
    stopAllMusic();

    document.getElementById("enemyName").textContent = "???";
    document.getElementById("battleEcgGif").src = currentEnemy.gifECG;
    document.getElementById("battleQuestion").textContent = "What pathology does this ECG show?";

    const optsDiv = document.getElementById("battleOptions");
    optsDiv.innerHTML = "";
    const wrongs = POKEDEX.filter(p => p.id !== pathologyId).sort(() => Math.random() - 0.5).slice(0, 5);
    const options = [currentEnemy, ...wrongs].sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = opt.patologia;
        btn.onclick = () => handleAnswer(btn, opt.id === pathologyId, pokemonId, pathologyId);
        optsDiv.appendChild(btn);
    });

    playMusic(audioRefs.battle);
    battleMusicTimeout = setTimeout(() => {
        audioRefs.battle.pause();
        playPathologySound(pathologyId);
    }, 5000);
}

function playPathologySound(id) {
    const p = getPathology(id);
    if (!p || !p.audio) {
        beepFallback();
        return;
    }
    const audio = audioRefs.pathology;
    audio.src = p.audio;
    audio.currentTime = 0;
    audio.play().catch(() => beepFallback());

    if (audioTimeout) clearTimeout(audioTimeout);
    audioTimeout = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, 10000);
}

function beepFallback() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 440;
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.4);
    } catch (e) {}
}

function handleAnswer(btn, correct, pokemonId, pathologyId) {
    if (answered) return;
    answered = true;

    stopAllMusic();

    if (correct) {
        // ===== RESPUESTA CORRECTA =====
        btn.classList.add("correct");
        document.getElementById("enemyName").textContent = currentEnemy.patologia;

        playMusic(audioRefs.win, false);

        caughtIds.add(pathologyId);
        caughtCount++;
        updateHudCount();

        document.querySelectorAll(`.map-pokemon[data-id="${pokemonId}"]`).forEach(el => {
            el.classList.add("caught");
        });

        // ⏱️ Esperar 6 SEGUNDOS
        setTimeout(() => {
            if (audioRefs.win && !audioRefs.win.paused) audioRefs.win.pause();

            if (caughtCount >= 27) {
                goToTrophy();
            } else {
                battleInProgress = false;
                goToMap();
                // Alejar a Ash para evitar re-colisión
                playerPos.x += 8;
                playerPos.y += 8;
                updatePlayerSprite();
            }
        }, 6000);

    } else {
        // ===== RESPUESTA INCORRECTA =====
        btn.classList.add("wrong");
        [...document.getElementById("battleOptions").children].forEach(b => {
            if (b.textContent === currentEnemy.patologia) b.classList.add("correct");
        });

        playMusic(audioRefs.lose, false);

        // ⏱️ Esperar 5 SEGUNDOS
        setTimeout(() => {
            if (audioRefs.lose && !audioRefs.lose.paused) audioRefs.lose.pause();

            const retry = confirm("Wrong! Do you want to try again?");
            if (retry) {
                triggerBattle(pokemonId);
            } else {
                battleInProgress = false;
                goToMap();
                playerPos.x += 8;
                playerPos.y += 8;
                updatePlayerSprite();
            }
        }, 5000);
    }
}

// ============================================================
// ESCENA 6: TROFEO
// ============================================================
function goToTrophy() {
    showScene("scene-trophy");
    stopAllMusic();
    playMusic(audioRefs.trophy);
    document.getElementById("trophyName").textContent = `🏆 CHAMPION: ${playerName.toUpperCase()} 🏆`;
}

// ============================================================
// INICIO
// ============================================================
window.addEventListener("load", () => {
    showScene("scene-intro");
    playMusic(audioRefs.lab);
    startMovement();
    setTimeout(typeOakLine, 800);
});