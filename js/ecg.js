/* ============================================================
   PokECG — ECG Waveform Generator (canvas)
   ============================================================ */

function gauss(x, mu, s) {
    return Math.exp(-Math.pow(x - mu, 2) / (2 * s * s));
}

function ecgMorph(t, amp, pOff) {
    let v = 0;
    v += gauss(t, 0.10 + pOff, 0.025) * amp * 0.18;
    v += -gauss(t, 0.22, 0.012) * amp * 0.12;
    v += gauss(t, 0.25, 0.012) * amp * 1.0;
    v += -gauss(t, 0.28, 0.014) * amp * 0.25;
    v += gauss(t, 0.45, 0.045) * amp * 0.32;
    return v;
}

function generateECG(waveType, width, height, hr, beats) {
    const data = [];
    const baseY = height * 0.65;
    const amp = height * 0.32;
    const beatWidth = width / beats;

    for (let x = 0; x < width; x++) {
        const bp = (x % beatWidth) / beatWidth;
        let y = baseY;
        switch (waveType) {
            case "sinus": case "sinus_arr": case "avb1": case "paced_atrial":
                y = baseY - ecgMorph(bp, amp, waveType === "avb1" ? 0.28 : 0.16);
                break;
            case "sinus_exit": case "sinus_arrest":
                if (Math.floor(x / beatWidth) % 4 === 3) y = baseY;
                else y = baseY - ecgMorph(bp, amp, 0.16);
                break;
            case "pac": case "pjc":
                y = baseY - ecgMorph(bp, amp, 0.16);
                if (Math.floor(x / beatWidth) === 2 && bp < 0.15) y -= amp * 0.5;
                break;
            case "svt": y = baseY - ecgMorph(bp, amp * 0.9, 0.08); break;
            case "afib": y = baseY - ecgMorph(bp, amp, 0.0) - (Math.random() - 0.5) * amp * 0.15; break;
            case "flutter": y = baseY - (bp * 4 % 1 - 0.5) * amp * 0.5 - ecgMorph(bp, amp * 0.7, 0.0); break;
            case "avb2_1":
                if (Math.floor(bp * 2) % 2 === 1) y = baseY;
                else y = baseY - ecgMorph(bp, amp, 0.22);
                break;
            case "avb2_2":
                if (Math.floor(x / beatWidth) % 3 === 2) y = baseY;
                else y = baseY - ecgMorph(bp, amp, 0.18);
                break;
            case "avb3": y = baseY - ecgMorph(bp, amp * 0.6, 0.0) - Math.sin(x * 0.06) * amp * 0.25; break;
            case "junctional": y = baseY - ecgMorph(bp, amp, -0.05); break;
            case "wander": y = baseY - ecgMorph(bp, amp * (0.8 + 0.3 * Math.sin(x * 0.01)), 0.14); break;
            case "pvc":
                y = baseY - ecgMorph(bp, amp, 0.16);
                if (Math.floor(x / beatWidth) === 2) y = baseY - gauss(bp, 0.25, 0.06) * amp * 1.4;
                break;
            case "ivr": case "paced_vent": y = baseY - gauss(bp, 0.25, 0.06) * amp * 1.1; break;
            case "vtach": y = baseY - Math.sin(bp * Math.PI * 2) * amp * 0.9; break;
            case "vfib": y = baseY - (Math.sin(x * 0.15) * amp * 0.4 + Math.sin(x * 0.31) * amp * 0.3 + (Math.random() - 0.5) * amp * 0.3); break;
            default: y = baseY - ecgMorph(bp, amp, 0.16);
        }
        data.push({ x, y });
    }
    return data;
}

function drawECG(canvas, waveType, hr, color, beats) {
    if (!canvas) return;
    color = color || "#00ff88";
    beats = beats || 6;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#0a2a1a"; ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    const data = generateECG(waveType, w, h, hr || 60, beats);
    ctx.strokeStyle = color; ctx.lineWidth = 2.2;
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.beginPath();
    data.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Map patología nombre → wave type (para prediction)
function patologiaToWave(name) {
    const map = {
        "Sinus Rhythm": "sinus",
        "Sinus Bradycardia": "sinus",
        "Sinus Tachycardia": "sinus",
        "Sinus Arrhythmia": "sinus_arr",
        "Sinus Exit Block": "sinus_exit",
        "Sinus Arrest": "sinus_arrest",
        "NSR with PAC": "pac",
        "SVT": "svt",
        "Atrial Fibrillation": "afib",
        "Atrial Flutter": "flutter",
        "Paced Atrial": "paced_atrial",
        "NSR with 1° AVB": "avb1",
        "2° AVB Type I": "avb2_1",
        "2° AVB Type II": "avb2_2",
        "2° AVB 2:1": "avb2_21",
        "3° AV Block": "avb3",
        "NSR with PJC": "pjc",
        "Junctional Rhythm": "junctional",
        "Accel Junctional": "junctional",
        "Junctional Tachy": "junctional",
        "Wandering Pacemaker": "wander",
        "NSR with PVC": "pvc",
        "Idioventricular": "ivr",
        "Accelerated IVR": "ivr",
        "VTach": "vtach",
        "VFib": "vfib",
        "Paced Ventricular": "paced_vent"
    };
    return map[name] || "sinus";
}