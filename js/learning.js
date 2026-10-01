/* ============================================================
   PokECG — Learning (Pokédex + 27 TCG Cards)
   ============================================================ */

const audioRefs = {
    pokedexMusic: document.getElementById("pokedexMusic"),
    pathology:    document.getElementById("pathologyAudio")
};

let currentAudioTimeout = null;

// ===== PANTALLA DE CARGA (6 segundos) =====
window.addEventListener("load", () => {
    if (audioRefs.pokedexMusic) {
        audioRefs.pokedexMusic.play().catch(() => {});
    }

    setTimeout(() => {
        if (audioRefs.pokedexMusic) {
            audioRefs.pokedexMusic.pause();
            audioRefs.pokedexMusic.currentTime = 0;
        }
        document.getElementById("pokedexLoading").classList.remove("active");
        document.getElementById("pokedexGrid").classList.add("active");
        renderCards();
    }, 6000);  // ← 6 SEGUNDOS
});

// ===== RENDERIZAR CARTAS =====
function renderCards() {
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    POKEDEX.forEach(p => {
        const card = document.createElement("div");
        card.className = "tcg-card";
        card.setAttribute("data-severity", p.severity);

        card.innerHTML = `
            <div class="tcg-header">
                <div class="tcg-name">${p.patologia}</div>
                <div class="tcg-hp">HP ${p.hr}</div>
            </div>

            <div class="tcg-ecg-frame">
                <img src="${p.gifECG}" alt="${p.patologia}">
            </div>

            <div class="tcg-stats">
                ❤️ HEART RATE: ${p.hr} bpm<br>
                📏 PR INTERVAL: ${p.pr} ms<br>
                📐 QRS DURATION: ${p.qrs} ms<br>
                🔁 R-R: ${p.rr}
            </div>

            <div class="tcg-section">
                <span class="tcg-section-title">📋 DEFINITION</span>
                ${p.definicion}
            </div>

            <div class="tcg-section">
                <span class="tcg-section-title">🩺 DIAGNOSIS / TREATMENT</span>
                ${p.diagnostico}
            </div>

            <button class="tcg-audio-btn" data-audio-id="${p.id}">🔊 PLAY SOUND</button>

            <div class="tcg-footer">#${String(p.id).padStart(3,"0")}</div>
        `;

        container.appendChild(card);
    });

    // Event listeners para botones de audio
    document.querySelectorAll(".tcg-audio-btn").forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            playAudio(+btn.dataset.audioId);
        };
    });
}

// ===== REPRODUCIR AUDIO =====
function playAudio(id) {
    const p = getPathology(id);
    const audio = audioRefs.pathology;

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    if (currentAudioTimeout) {
        clearTimeout(currentAudioTimeout);
        currentAudioTimeout = null;
    }

    if (!p || !p.audio) {
        beepFallback();
        return;
    }

    audio.src = p.audio;
    audio.currentTime = 0;
    audio.play().catch(() => beepFallback());

    currentAudioTimeout = setTimeout(() => {
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