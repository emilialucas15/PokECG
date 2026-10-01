/* ============================================================
   PokECG — Menu Logic + Settings
   ============================================================ */

// ===== BOTONES DEL MENÚ =====
document.querySelectorAll(".menu-btn").forEach(btn => {
    btn.onclick = () => {
        const action = btn.dataset.action;
        switch (action) {
            case "game":       window.location.href = "game.html"; break;
            case "learning":   window.location.href = "learning.html"; break;
            case "prediction": window.location.href = "prediction.html"; break;
            case "settings":   openSettings(); break;
        }
    };
});

// ===== SETTINGS =====
const settingsModal = document.getElementById("settingsModal");
const volumeSlider = document.getElementById("volumeSlider");
const brightnessSlider = document.getElementById("brightnessSlider");
const volumeValue = document.getElementById("volumeValue");
const brightnessValue = document.getElementById("brightnessValue");
const closeBtn = document.getElementById("closeSettingsBtn");

// Cargar valores guardados (con mínimo de seguridad)
const savedVolume = localStorage.getItem("pokecg_volume") || 70;
let savedBrightness = parseInt(localStorage.getItem("pokecg_brightness")) || 100;

// Nunca permitir menos de 70% para evitar pantalla oscura
if (savedBrightness < 70 || isNaN(savedBrightness)) {
    savedBrightness = 100;
}

volumeSlider.value = savedVolume;
brightnessSlider.value = savedBrightness;
volumeValue.textContent = savedVolume + "%";
brightnessValue.textContent = savedBrightness + "%";

applyBrightness(savedBrightness);
applyVolume(savedVolume);

function openSettings() {
    settingsModal.classList.add("active");
}
function closeSettings() {
    settingsModal.classList.remove("active");
}
closeBtn.onclick = closeSettings;

// Cerrar al hacer clic fuera del modal
settingsModal.onclick = (e) => {
    if (e.target === settingsModal) closeSettings();
};

// ===== VOLUME =====
volumeSlider.oninput = () => {
    const val = volumeSlider.value;
    volumeValue.textContent = val + "%";
    applyVolume(val);
    localStorage.setItem("pokecg_volume", val);
};

function applyVolume(percent) {
    const vol = percent / 100;
    document.querySelectorAll("audio").forEach(a => { a.volume = vol; });
    const video = document.getElementById("menuVideo");
    if (video) video.volume = vol;
}

// ===== BRIGHTNESS =====
brightnessSlider.oninput = () => {
    let val = parseInt(brightnessSlider.value);
    // Forzar mínimo 70%
    if (val < 70) val = 70;
    brightnessValue.textContent = val + "%";
    applyBrightness(val);
    localStorage.setItem("pokecg_brightness", val);
};

function applyBrightness(percent) {
    const bright = percent / 100;
    document.documentElement.style.setProperty("--brightness", bright);
}

// ===== APLICAR AL CARGAR =====
window.addEventListener("load", () => {
    applyBrightness(savedBrightness);
    applyVolume(savedVolume);
});