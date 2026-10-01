/* ============================================================
   PokECG — Heart Disease Prediction
   18 Parameters Version with Clinical Risk Assessment
   + Physiological Coherence Validation (v2 - Adjusted)
   References:
   - Framingham Risk Score (10-year CV risk)
   - AHA/ACC Guidelines
   - ESC Guidelines 2025
   - CHA2DS2-VASc Score
   - MSD Manuals, Merck Manuals
   - Braunwald's Heart Disease
   ============================================================ */

// ============================================================
// PRECARGAR GIFs
// ============================================================
window.addEventListener("load", () => {
    POKEDEX.forEach(p => {
        const img = new Image();
        img.src = p.gifECG;
    });
});

// ============================================================
// CONDICIONES ASOCIADAS POR PATOLOGÍA (basadas en literatura)
// ============================================================
const ASSOCIATED_CONDITIONS = {
    "Sinus Bradycardia": [
        { name: "Hypothyroidism", ref: "Thyroid disease and bradyarrhythmias" },
        { name: "Increased Vagal Tone", ref: "Physiological bradycardia" },
        { name: "Sleep Apnea", ref: "Nocturnal bradycardia" },
        { name: "Drug Toxicity (beta-blockers, digoxin)", ref: "Pharmacological causes" }
    ],
    "Sinus Tachycardia": [
        { name: "Fever", ref: "Physiological response" },
        { name: "Anemia", ref: "Compensatory tachycardia" },
        { name: "Hyperthyroidism", ref: "Thyroid disease and tachyarrhythmias" },
        { name: "Dehydration", ref: "Physiological response" },
        { name: "Anxiety", ref: "Sympathetic activation" }
    ],
    "Sinus Exit Block": [
        { name: "Drug Toxicity (digoxin, beta-blockers)", ref: "SA node suppression" },
        { name: "Myocardial Ischemia", ref: "SA node ischemia" },
        { name: "Myocarditis", ref: "Inflammatory SA node damage" },
        { name: "Aging", ref: "Degenerative changes" }
    ],
    "Sinus Arrest": [
        { name: "Sick Sinus Syndrome", ref: "ARIC/CHS Study, JACC 2014" },
        { name: "Sleep Apnea", ref: "Nocturnal pauses" },
        { name: "Drug Toxicity", ref: "SA node suppression" },
        { name: "Myocardial Ischemia", ref: "SA node ischemia" }
    ],
    "NSR with PAC": [
        { name: "Stress", ref: "Sympathetic activation" },
        { name: "Caffeine", ref: "Adenosine receptor antagonist" },
        { name: "Alcohol", ref: "Holiday heart syndrome" },
        { name: "Hyperthyroidism", ref: "Thyroid disease" },
        { name: "Lung Disease", ref: "Atrial stretch" }
    ],
    "SVT": [
        { name: "Wolff-Parkinson-White Syndrome", ref: "Accessory pathway" },
        { name: "Caffeine", ref: "Trigger" },
        { name: "Stress", ref: "Trigger" },
        { name: "Alcohol", ref: "Trigger" }
    ],
    "Atrial Fibrillation": [
        { name: "Hypertension", ref: "Framingham Heart Study" },
        { name: "Heart Failure", ref: "Framingham Heart Study" },
        { name: "Valvular Heart Disease", ref: "Mitral stenosis association" },
        { name: "Hyperthyroidism", ref: "Thyroid disease and AF" },
        { name: "Sleep Apnea", ref: "Intermittent hypoxia" },
        { name: "Obesity", ref: "Metabolic syndrome" },
        { name: "Alcohol Use", ref: "Holiday heart syndrome" }
    ],
    "Atrial Flutter": [
        { name: "COPD", ref: "Right atrial enlargement" },
        { name: "Heart Failure", ref: "Atrial stretch" },
        { name: "Valvular Heart Disease", ref: "Atrial remodeling" },
        { name: "Hyperthyroidism", ref: "Thyroid disease" },
        { name: "Post-Surgery", ref: "Post-cardiac surgery" }
    ],
    "NSR with 1° AVB": [
        { name: "Drug Toxicity (beta-blockers, digoxin)", ref: "AV node suppression" },
        { name: "Myocardial Ischemia", ref: "AV node ischemia" },
        { name: "Myocarditis", ref: "Inflammatory damage" },
        { name: "Aging", ref: "Degenerative changes" }
    ],
    "2° AVB Type I": [
        { name: "Athletes", ref: "Increased vagal tone" },
        { name: "Inferior MI", ref: "AV node ischemia" },
        { name: "Drug Toxicity (beta-blockers, digoxin)", ref: "AV node suppression" },
        { name: "Myocarditis", ref: "Inflammatory damage" }
    ],
    "2° AVB Type II": [
        { name: "Anterior MI", ref: "Bundle branch ischemia" },
        { name: "Idiopathic Fibrosis", ref: "Lev's disease" },
        { name: "Aging", ref: "Degenerative changes" },
        { name: "Cardiomyopathy", ref: "Structural damage" }
    ],
    "2° AVB 2:1": [
        { name: "Anterior MI", ref: "Bundle branch ischemia" },
        { name: "Idiopathic Fibrosis", ref: "Lev's disease" },
        { name: "Cardiomyopathy", ref: "Structural damage" },
        { name: "Drug Toxicity", ref: "AV node suppression" }
    ],
    "3° AV Block": [
        { name: "Anterior MI", ref: "Bundle branch ischemia" },
        { name: "Idiopathic Fibrosis", ref: "Lev's disease" },
        { name: "Cardiomyopathy", ref: "Structural damage" },
        { name: "Drug Toxicity", ref: "AV node suppression" },
        { name: "Lyme Disease", ref: "Infectious cause" }
    ],
    "NSR with PJC": [
        { name: "Digoxin Toxicity", ref: "Increased automaticity" },
        { name: "Inferior MI", ref: "AV junction ischemia" },
        { name: "Myocarditis", ref: "Inflammatory damage" },
        { name: "Post-Surgery", ref: "Surgical trauma" }
    ],
    "Junctional Rhythm": [
        { name: "Digoxin Toxicity", ref: "Increased automaticity" },
        { name: "Inferior MI", ref: "AV junction ischemia" },
        { name: "Myocarditis", ref: "Inflammatory damage" },
        { name: "Hyperkalemia", ref: "Electrolyte imbalance" }
    ],
    "Accel Junctional": [
        { name: "Digoxin Toxicity", ref: "Increased automaticity" },
        { name: "Myocardial Ischemia", ref: "AV junction ischemia" },
        { name: "Post-Surgery", ref: "Surgical trauma" },
        { name: "Myocarditis", ref: "Inflammatory damage" }
    ],
    "Junctional Tachy": [
        { name: "Digoxin Toxicity", ref: "Increased automaticity" },
        { name: "Myocardial Ischemia", ref: "AV junction ischemia" },
        { name: "Cardiomyopathy", ref: "Structural damage" },
        { name: "Post-Surgery", ref: "Surgical trauma" }
    ],
    "NSR with PVC": [
        { name: "Ischemic Heart Disease", ref: "Myocardial ischemia" },
        { name: "Cardiomyopathy", ref: "Structural damage" },
        { name: "Hypoxia", ref: "Myocardial irritability" },
        { name: "Caffeine", ref: "Adenosine receptor antagonist" },
        { name: "Stress", ref: "Sympathetic activation" },
        { name: "Electrolyte Imbalance", ref: "Hypokalemia, hypomagnesemia" }
    ],
    "Idioventricular": [
        { name: "Severe Ischemia", ref: "Complete AV block" },
        { name: "Complete AV Block", ref: "Escape rhythm" },
        { name: "Drug Toxicity", ref: "Severe conduction depression" },
        { name: "End-stage Heart Disease", ref: "Terminal rhythm" }
    ],
    "Accelerated IVR": [
        { name: "Reperfusion Post-MI", ref: "Reperfusion arrhythmia" },
        { name: "Digoxin Toxicity", ref: "Increased automaticity" },
        { name: "Cardiomyopathy", ref: "Structural damage" }
    ],
    "VTach": [
        { name: "Ischemic Heart Disease", ref: "MSD Manuals" },
        { name: "Cardiomyopathy", ref: "MSD Manuals" },
        { name: "Valvular Heart Disease", ref: "Structural damage" },
        { name: "Electrolyte Imbalance", ref: "Hypokalemia, hypomagnesemia" },
        { name: "Drug Toxicity", ref: "Proarrhythmic drugs" }
    ],
    "VFib": [
        { name: "Ischemic Cardiomyopathy", ref: "MSD Manuals" },
        { name: "Hypertrophic Cardiomyopathy", ref: "MSD Manuals" },
        { name: "Dilated Cardiomyopathy", ref: "MSD Manuals" },
        { name: "Electrolyte Abnormalities", ref: "Severe imbalance" },
        { name: "Acidosis", ref: "Metabolic derangement" },
        { name: "Hypoxemia", ref: "Respiratory failure" },
        { name: "Myocardial Ischemia", ref: "Acute MI" }
    ],
    "Paced Ventricular": [
        { name: "Complete AV Block", ref: "Pacemaker indication" },
        { name: "Sinus Node Dysfunction", ref: "Pacemaker indication" },
        { name: "Post-Surgery", ref: "Surgical AV block" }
    ]
};

// ============================================================
// CONDICIONES DE RIESGO CV (basadas en Framingham)
// ============================================================
const RISK_FACTORS = {
    "Hypertension": {
        max: 14,
        rules: [
            { cond: p => p.sbp > 140, pts: 3, ref: "JNC Guidelines" },
            { cond: p => p.dbp > 90, pts: 3, ref: "JNC Guidelines" },
            { cond: p => p.age > 60, pts: 2, ref: "Framingham" },
            { cond: p => p.smoke, pts: 1, ref: "Smoking OR 1.82" },
            { cond: p => p.chol > 240, pts: 1, ref: "Metabolic syndrome" }
        ]
    },
    "Coronary Artery Disease": {
        max: 11,
        rules: [
            { cond: p => p.smoke, pts: 3, ref: "Smoking OR 6.7" },
            { cond: p => p.chol > 240, pts: 3, ref: "Independent predictor" },
            { cond: p => p.age > 60, pts: 2, ref: "Traditional risk factor" },
            { cond: p => p.sbp > 140, pts: 2, ref: "HTN OR 3.3" },
            { cond: p => p.dbp > 90, pts: 1, ref: "HTN OR 2.7" }
        ]
    },
    "Heart Failure": {
        max: 5,
        rules: [
            { cond: p => p.age > 60, pts: 2, ref: "AHA HF Prevention" },
            { cond: p => p.sbp > 140, pts: 2, ref: "AHA HF Prevention" },
            { cond: p => p.hr > 100, pts: 1, ref: "Tachycardia in HF" }
        ]
    },
    "Stroke Risk": {
        max: 8,
        rules: [
            { cond: p => p.dx === "Atrial Fibrillation", pts: 3, ref: "CHA2DS2-VASc" },
            { cond: p => p.sbp > 140, pts: 3, ref: "CHA2DS2-VASc" },
            { cond: p => p.age > 60, pts: 2, ref: "CHA2DS2-VASc" }
        ]
    },
    "COPD": {
        max: 6,
        rules: [
            { cond: p => p.smoke, pts: 5, ref: "Main risk factor" },
            { cond: p => p.age > 60, pts: 1, ref: "Independent risk" }
        ]
    },
    "Sick Sinus Syndrome": {
        max: 6,
        rules: [
            { cond: p => p.age > 60, pts: 3, ref: "HR 1.73 per 5yr (ARIC/CHS)" },
            { cond: p => p.hr < 60, pts: 2, ref: "Lower HR is risk factor" },
            { cond: p => p.dx === "Sinus Bradycardia", pts: 1, ref: "Common cause" }
        ]
    },
    "Hypothyroidism": {
        max: 8,
        rules: [
            { cond: p => p.thyroid === "High", pts: 6, ref: "TSH High = Hypothyroidism" },
            { cond: p => p.hr < 60, pts: 2, ref: "Reversible bradycardia" }
        ]
    },
    "Hyperthyroidism": {
        max: 8,
        rules: [
            { cond: p => p.thyroid === "Low", pts: 6, ref: "TSH Low = Hyperthyroidism" },
            { cond: p => p.hr > 100, pts: 2, ref: "Tachycardia in hyperthyroidism" }
        ]
    },
    "Ischemic Heart Disease": {
        max: 8,
        rules: [
            { cond: p => p.smoke, pts: 3, ref: "Smoking OR 6.7" },
            { cond: p => p.chol > 240, pts: 3, ref: "Independent predictor" },
            { cond: p => p.age > 60, pts: 2, ref: "Traditional risk factor" }
        ]
    },
    "Drug Toxicity": {
        max: 6,
        rules: [
            { cond: p => p.medications === "Beta-blockers", pts: 3, ref: "AV node suppression" },
            { cond: p => p.medications === "Digoxin", pts: 3, ref: "Increased automaticity" }
        ]
    },
    "Sleep Apnea": {
        max: 7,
        rules: [
            { cond: p => p.apnea, pts: 4, ref: "Intermittent hypoxia" },
            { cond: p => p.bmi === "Obese", pts: 3, ref: "Obesity risk factor" }
        ]
    },
    "Increased Vagal Tone": {
        max: 6,
        rules: [
            { cond: p => p.athlete, pts: 4, ref: "Physiological in athletes" },
            { cond: p => p.hr < 60, pts: 2, ref: "Bradycardia pattern" }
        ]
    },
    "Holiday Heart (Alcohol)": {
        max: 5,
        rules: [
            { cond: p => p.alcohol, pts: 3, ref: "Alcohol-related arrhythmia" },
            { cond: p => p.dx === "Atrial Fibrillation", pts: 2, ref: "Common trigger" }
        ]
    },
    "Anemia": {
        max: 5,
        rules: [
            { cond: p => p.anemia, pts: 3, ref: "Compensatory tachycardia" },
            { cond: p => p.hr > 100, pts: 2, ref: "Tachycardia pattern" }
        ]
    },
    "Fever": {
        max: 5,
        rules: [
            { cond: p => p.fever, pts: 3, ref: "Physiological response" },
            { cond: p => p.hr > 100, pts: 2, ref: "Tachycardia pattern" }
        ]
    },
    "Obesity": {
        max: 5,
        rules: [
            { cond: p => p.bmi === "Obese", pts: 3, ref: "Metabolic syndrome" },
            { cond: p => p.dx === "Atrial Fibrillation", pts: 2, ref: "Risk factor for AF" }
        ]
    },
    "High Stress": {
        max: 5,
        rules: [
            { cond: p => p.stress, pts: 3, ref: "Sympathetic activation" },
            { cond: p => p.hr > 100, pts: 2, ref: "Tachycardia pattern" }
        ]
    }
};

// ============================================================
// CALCULAR ASOCIADAS
// ============================================================
function calculateAssociatedConditions(dx, params) {
    const conditions = [];
    const fixedConditions = ASSOCIATED_CONDITIONS[dx] || [];

    for (const [condition, config] of Object.entries(RISK_FACTORS)) {
        let score = 0;
        let matchedRules = [];

        for (const rule of config.rules) {
            if (rule.cond(params)) {
                score += rule.pts;
                matchedRules.push(rule.ref);
            }
        }

        if (score > 0) {
            const ratio = score / config.max;
            let likelihood;
            if (ratio >= 0.7) likelihood = { level: "VERY LIKELY", icon: "🥇", color: "#c64b39" };
            else if (ratio >= 0.5) likelihood = { level: "LIKELY", icon: "🥈", color: "#d69e2e" };
            else if (ratio >= 0.3) likelihood = { level: "POSSIBLE", icon: "🥉", color: "#dd6b20" };
            else likelihood = { level: "LESS LIKELY", icon: "⚪", color: "#718096" };

            conditions.push({
                name: condition,
                score: score,
                max: config.max,
                likelihood: likelihood,
                refs: matchedRules.join(", ")
            });
        }
    }

    conditions.sort((a, b) => b.score - a.score);
    return { fixed: fixedConditions, ranked: conditions };
}

// ============================================================
// VALIDACIÓN DE COHERENCIA FISIOLÓGICA (v2 - AJUSTADA)
// ============================================================
function validatePhysiologicalCoherence(params) {
    const { hr, sbp, dbp, qrswidth, avConduction, rr, pwave } = params;
    const incoherences = [];

    // ===== NIVEL 1: IMPOSIBLES (Fisiológicamente imposibles) =====

    // 1. VFib = paro cardíaco → presión arterial SIEMPRE 0
    if (hr === 0 && (sbp > 0 || dbp > 0)) {
        incoherences.push({
            severity: "IMPOSSIBLE",
            title: "CARDIAC ARREST",
            detail: `HR 0 (VFib) means no cardiac output. Blood pressure MUST be 0/0. Current: ${sbp}/${dbp} mmHg.`,
            reference: "Physiology: CO = HR × SV. If HR = 0, CO = 0, BP = 0"
        });
    }

    // ===== NIVEL 2: HALLAZGOS INUSUALES (Raros pero no imposibles) =====

    // 2. Bradicardia extrema + presión alta
    if (hr > 0 && hr < 20 && sbp > 120) {
        incoherences.push({
            severity: "UNUSUAL",
            title: "EXTREME BRADYCARDIA",
            detail: `HR < 20 bpm usually causes profound hypotension. SBP > 120 is unusual.`,
            reference: "Physiology: Severe bradycardia reduces cardiac output"
        });
    }

    // 3. Taquicardia extrema + presión muy alta
    if (hr > 200 && sbp > 160) {
        incoherences.push({
            severity: "UNUSUAL",
            title: "EXTREME TACHYCARDIA",
            detail: `HR > 200 bpm usually reduces ventricular filling. SBP > 160 is unusual.`,
            reference: "Physiology: Tachycardia reduces diastolic filling time"
        });
    }

    // 4. VTach + presión MUY alta (solo si HR > 180 Y presión > 140)
    if (qrswidth === "Wide" && hr > 180 && sbp > 140 && dbp > 90) {
        incoherences.push({
            severity: "UNUSUAL",
            title: "VTACH WITH HYPERTENSION",
            detail: `VTach with very high HR (>180) AND hypertension is unusual. VTach usually causes hypotension.`,
            reference: "MSD Manuals: VTach often causes hemodynamic compromise"
        });
    }

    // 5. 3° AV Block con HR muy bajo + presión MUY alta
    if (avConduction === "3° AVB" && hr < 35 && sbp > 140) {
        incoherences.push({
            severity: "UNUSUAL",
            title: "COMPLETE AV BLOCK WITH HYPERTENSION",
            detail: `3° AV Block with HR < 35 bpm usually causes low BP. SBP > 140 is unusual.`,
            reference: "Braunwald's: Complete AV block causes bradycardia and hypotension"
        });
    }

    // 6. Bradicardia moderada + hipertensión severa
    if (hr >= 40 && hr < 60 && sbp > 180) {
        incoherences.push({
            severity: "UNUSUAL",
            title: "BRADYCARDIA + SEVERE HYPERTENSION",
            detail: `HR < 60 bpm with SBP > 180 mmHg is unusual. Consider other causes.`,
            reference: "Clinical correlation recommended"
        });
    }

    // ===== NIVEL 3: ADVERTENCIAS CLÍNICAS (Requieren atención médica) =====

    // 7. Crisis hipertensiva
    if (hr >= 60 && hr <= 100 && sbp > 180) {
        incoherences.push({
            severity: "CLINICAL",
            title: "HYPERTENSIVE CRISIS",
            detail: `SBP > 180 mmHg at normal HR is a hypertensive emergency. Requires immediate medical attention.`,
            reference: "AHA/ACC: Hypertensive crisis guidelines"
        });
    }

    // 8. Shock hipotensivo
    if (hr >= 60 && hr <= 100 && sbp < 80 && sbp > 0) {
        incoherences.push({
            severity: "CLINICAL",
            title: "HYPOTENSIVE SHOCK",
            detail: `SBP < 80 mmHg at normal HR suggests shock. Requires immediate medical attention.`,
            reference: "AHA/ACC: Shock guidelines"
        });
    }

    // ❌ ELIMINADO: AFib con RVR + presión normal
    // Razón: AFib con RVR es una presentación clínica VÁLIDA

    // ❌ ELIMINADO: Idioventricular con presión normal
    // Razón: Es posible en pacientes compensados

    return incoherences;
}

// ============================================================
// ANALYZE STATS
// ============================================================
document.getElementById("predictBtn").onclick = () => {

    // ===== RECOGER PARÁMETROS (18) =====
    const age = +document.getElementById("p_age").value;
    const sex = document.getElementById("p_sex").value;

    const hr = +document.getElementById("p_hr").value;
    const qrs = +document.getElementById("p_qrs").value;
    const rr = document.getElementById("p_rr").value;
    const qrswidth = document.getElementById("p_qrswidth").value;
    const pwave = document.getElementById("p_pwave").value;
    const avConduction = document.getElementById("p_avconduction").value;
    const pacing = document.getElementById("p_pacing").value;

    const sbp = +document.getElementById("p_sbp").value;
    const dbp = +document.getElementById("p_dbp").value;
    const chol = +document.getElementById("p_chol").value;
    const smoke = document.getElementById("p_smoke").value === "Yes";

    const thyroid = document.getElementById("p_thyroid").value;
    const medications = document.getElementById("p_medications").value;
    const bmi = document.getElementById("p_bmi").value;

    const athlete = document.getElementById("p_athlete").checked;
    const apnea = document.getElementById("p_apnea").checked;
    const alcohol = document.getElementById("p_alcohol").checked;
    const stress = document.getElementById("p_stress").checked;

    const fever = document.getElementById("p_fever").checked;
    const anemia = document.getElementById("p_anemia").checked;

    // ============================================================
    // VALIDACIÓN DE COHERENCIA FISIOLÓGICA
    // ============================================================
    const incoherences = validatePhysiologicalCoherence({
        hr, sbp, dbp, qrswidth, avConduction, rr, pwave
    });

    if (incoherences.length > 0) {
        let message = "⚠️ PHYSIOLOGICAL COHERENCE CHECK:\n\n";
        incoherences.forEach((inc, i) => {
            const icon = inc.severity === "IMPOSSIBLE" ? "❌" :
                         inc.severity === "CLINICAL" ? "🚨" : "⚠️";
            message += `${icon} ${inc.severity}: ${inc.title}\n`;
            message += `   ${inc.detail}\n`;
            message += `   Reference: ${inc.reference}\n\n`;
        });
        message += "Do you want to continue anyway?\n\n";
        message += "In clinical practice, these values would need re-evaluation.";

        const proceed = confirm(message);
        if (!proceed) {
            return;
        }
    }

    // ============================================================
    // SISTEMA DE REGLAS (27 PATOLOGÍAS)
    // ============================================================
    let dx = "Sinus Rhythm";
    let reason = "All parameters within normal limits.";

    if (pwave === "Absent" && rr === "Irregularly Irregular" && hr === 0) {
        dx = "VFib"; reason = "Chaotic electrical activity, no identifiable QRS.";
    }
    else if (qrswidth === "Wide" && hr > 100) {
        dx = "VTach"; reason = "Wide QRS tachycardia > 100 bpm.";
    }
    else if (qrswidth === "Wide" && hr < 40 && hr > 0) {
        dx = "Idioventricular"; reason = "Wide QRS escape rhythm, rate 20-40 bpm.";
    }
    else if (qrswidth === "Wide" && hr >= 40 && hr <= 100 && avConduction === "Normal") {
        dx = "Accelerated IVR"; reason = "Ventricular rhythm, rate 40-100 bpm.";
    }
    else if (pacing === "Ventricular") {
        dx = "Paced Ventricular"; reason = "Ventricular pacing spike before wide QRS.";
    }
    else if (pacing === "Atrial") {
        dx = "Paced Atrial"; reason = "Atrial pacing spike before P wave.";
    }
    else if (avConduction === "3° AVB") {
        dx = "3° AV Block"; reason = "Complete AV dissociation.";
    }
    else if (avConduction === "2° AVB Type II") {
        dx = "2° AVB Type II"; reason = "Sudden dropped QRS without PR prolongation.";
    }
    else if (avConduction === "2° AVB 2:1") {
        dx = "2° AVB 2:1"; reason = "2:1 AV block, every other P wave conducted.";
    }
    else if (avConduction === "2° AVB Type I") {
        dx = "2° AVB Type I"; reason = "Progressive PR prolongation until dropped QRS.";
    }
    else if (avConduction === "1° AVB" && hr >= 60 && hr <= 100) {
        dx = "NSR with 1° AVB"; reason = "PR interval > 200 ms.";
    }
    else if (rr === "Irregularly Irregular" && pwave === "Absent") {
        dx = "Atrial Fibrillation"; reason = "Irregularly irregular R-R with no distinct P waves.";
    }
    else if (pwave === "Sawtooth") {
        dx = "Atrial Flutter"; reason = "Sawtooth flutter waves (f waves).";
    }
    else if (hr > 150 && qrswidth === "Narrow" && rr === "Regular") {
        dx = "SVT"; reason = "Regular narrow-complex tachycardia > 150 bpm.";
    }
    else if (hr > 100 && pwave === "Normal" && qrswidth === "Narrow") {
        dx = "Sinus Tachycardia"; reason = "HR > 100 bpm with normal P waves.";
    }
    else if (hr < 60 && hr >= 40 && pwave === "Normal" && rr === "Regular" && qrswidth === "Narrow") {
        dx = "Sinus Bradycardia"; reason = "HR < 60 bpm with normal P waves.";
    }
    else if (rr === "Irregular" && pwave === "Normal" && hr >= 60 && hr <= 100) {
        dx = "Sinus Arrhythmia"; reason = "Varying P-P intervals phasic with respiration.";
    }
    else if (pwave === "Normal" && rr === "Regular" && avConduction === "2° AVB Type II" && hr >= 40 && hr <= 60) {
        dx = "Sinus Exit Block"; reason = "Pause is exact multiple of P-P interval.";
    }
    else if (pwave === "Normal" && rr === "Irregular" && avConduction !== "Normal" && hr >= 40) {
        dx = "Sinus Arrest"; reason = "Pause NOT related to P-P cycle.";
    }
    else if (pwave === "Inverted" && rr === "Regular" && hr >= 60 && hr <= 100) {
        dx = "Wandering Pacemaker"; reason = "Pacemaker shifts between SA node, atria, and AV junction.";
    }
    else if ((pwave === "Absent" || pwave === "Inverted") && hr >= 40 && hr <= 60 && qrswidth === "Narrow") {
        dx = "Junctional Rhythm"; reason = "Rhythm from AV junction, rate 40-60 bpm.";
    }
    else if ((pwave === "Absent" || pwave === "Inverted") && hr > 60 && hr <= 100 && qrswidth === "Narrow") {
        dx = "Accel Junctional"; reason = "Junctional rhythm, rate 60-100 bpm.";
    }
    else if ((pwave === "Absent" || pwave === "Inverted") && hr > 100 && qrswidth === "Narrow") {
        dx = "Junctional Tachy"; reason = "Junctional rhythm, rate > 100 bpm.";
    }
    else if (pwave === "Normal" && rr === "Irregular" && hr >= 60 && hr <= 100 && qrswidth === "Narrow") {
        dx = "NSR with PAC"; reason = "Premature atrial contraction.";
    }
    else if ((pwave === "Absent" || pwave === "Inverted") && rr === "Irregular" && hr >= 60) {
        dx = "NSR with PJC"; reason = "Premature junctional contraction.";
    }
    else if (qrswidth === "Wide" && rr === "Irregular") {
        dx = "NSR with PVC"; reason = "Premature ventricular contraction.";
    }
    else if (sbp > 140 || dbp > 90) {
        dx = "Sinus Rhythm"; reason = "Elevated blood pressure. Risk for cardiac disease.";
    }
    else if (chol > 240 || smoke) {
        dx = "Sinus Rhythm"; reason = "High cholesterol and/or smoking. CAD risk.";
    }

    const p = getPathologyByName(dx) || getPathology(1);

    // ============================================================
    // CÁLCULO DE RIESGO CLÍNICO
    // ============================================================
    const ARRHYTHMIA_LEVELS = {
        "normal":   { level: "LOW",      color: "#38a169", pct: "<5%" },
        "mild":     { level: "MILD",     color: "#d69e2e", pct: "5-10%" },
        "moderate": { level: "MODERATE", color: "#dd6b20", pct: "10-20%" },
        "severe":   { level: "HIGH",     color: "#c64b39", pct: "20-30%" },
        "critical": { level: "CRITICAL", color: "#8b0000", pct: ">30%" }
    };

    const arrhythmiaInfo = ARRHYTHMIA_LEVELS[p.severity] || ARRHYTHMIA_LEVELS["normal"];
    const arrhythmiaLevel = arrhythmiaInfo.level;
    const arrhythmiaColor = arrhythmiaInfo.color;
    const arrhythmiaPct = arrhythmiaInfo.pct;

    const cvRiskFactors = [];
    if (age > 60) cvRiskFactors.push("Age > 60");
    if (smoke) cvRiskFactors.push("Smoker");
    if (chol > 240) cvRiskFactors.push("Cholesterol > 240");
    if (sbp > 140) cvRiskFactors.push("SBP > 140");
    if (dbp > 90) cvRiskFactors.push("DBP > 90");

    const cvRiskScore = cvRiskFactors.length;

    let cvLevel, cvColor, cvPct;
    if (cvRiskScore >= 4) { cvLevel = "VERY HIGH"; cvColor = "#8b0000"; cvPct = ">30%"; }
    else if (cvRiskScore === 3) { cvLevel = "HIGH"; cvColor = "#c64b39"; cvPct = "20-30%"; }
    else if (cvRiskScore === 2) { cvLevel = "MODERATE"; cvColor = "#dd6b20"; cvPct = "10-20%"; }
    else if (cvRiskScore === 1) { cvLevel = "MILD"; cvColor = "#d69e2e"; cvPct = "5-10%"; }
    else { cvLevel = "LOW"; cvColor = "#38a169"; cvPct = "<5%"; }

    const RISK_HIERARCHY = { "LOW": 1, "MILD": 2, "MODERATE": 3, "HIGH": 4, "VERY HIGH": 5, "CRITICAL": 6 };
    const arrScore = RISK_HIERARCHY[arrhythmiaLevel] || 1;
    const cvScore = RISK_HIERARCHY[cvLevel] || 1;
    const maxScore = Math.max(arrScore, cvScore);

    let level, color;
    if (maxScore >= 6) { level = "CRITICAL"; color = "#8b0000"; }
    else if (maxScore === 5) { level = "VERY HIGH"; color = "#8b0000"; }
    else if (maxScore === 4) { level = "HIGH"; color = "#c64b39"; }
    else if (maxScore === 3) { level = "MODERATE"; color = "#dd6b20"; }
    else if (maxScore === 2) { level = "MILD"; color = "#d69e2e"; }
    else { level = "LOW"; color = "#38a169"; }

    const associated = calculateAssociatedConditions(dx, {
        age, hr, sbp, dbp, chol, smoke, dx,
        thyroid, medications, bmi,
        athlete, apnea, alcohol, stress,
        fever, anemia
    });

    let associatedHTML = '<p><strong>Associated Conditions:</strong></p>';

    if (associated.fixed.length > 0) {
        associatedHTML += `<div class="conditions-section">
            <h4>📚 Typical Causes (Literature)</h4>
            <p class="section-subtitle">Common causes of this arrhythmia in the population</p>`;
        associated.fixed.forEach(c => {
            associatedHTML += `<div class="condition-item fixed">
                <span class="condition-name">📖 ${c.name}</span>
                <span class="condition-ref">${c.ref}</span>
            </div>`;
        });
        associatedHTML += `</div>`;
    }

    if (associated.ranked.length > 0) {
        associatedHTML += `<div class="conditions-section">
            <h4>📊 Patient CV Risk Profile</h4>
            <p class="section-subtitle">Conditions likely in this patient based on their data</p>`;
        associated.ranked.slice(0, 6).forEach(c => {
            associatedHTML += `<div class="condition-item">
                <span class="condition-icon">${c.likelihood.icon}</span>
                <span class="condition-name">${c.name}</span>
                <span class="condition-score">${c.score}/${c.max}</span>
                <span class="condition-ref">${c.refs}</span>
            </div>`;
        });
        associatedHTML += `</div>`;
    }

    let recommendation;
    if (level === "CRITICAL") recommendation = "EMERGENCY: Immediate cardiology consult.";
    else if (level === "VERY HIGH") recommendation = "Urgent cardiology consult + ECG + Holter.";
    else if (level === "HIGH") recommendation = "Immediate cardiology consult + ECG + Holter.";
    else if (level === "MODERATE") recommendation = "Schedule cardiology follow-up.";
    else if (level === "MILD") recommendation = "Routine check-up. Monitor symptoms.";
    else recommendation = "No intervention needed. Healthy lifestyle.";

    document.getElementById("res-level").innerHTML = `<span style="color:${color};">${level}</span>`;
    document.getElementById("res-arrhythmia").innerHTML = 
        `<span style="color:${arrhythmiaColor};">${arrhythmiaLevel}</span> (${arrhythmiaPct})`;
    document.getElementById("res-cv").innerHTML = 
        `<span style="color:${cvColor};">${cvLevel}</span> (${cvPct}) - ${cvRiskScore} factors`;
    document.getElementById("res-reason").textContent = reason;
    document.getElementById("res-diag").textContent = dx;
    document.getElementById("res-def").textContent = p.definicion;
    document.getElementById("res-associated").innerHTML = associatedHTML;
    document.getElementById("res-rec").textContent = recommendation;
    document.getElementById("res-treat").textContent = p.diagnostico;
    document.getElementById("miniEcgGif").src = p.gifECG;
};

// ===== RESET =====
document.getElementById("resetBtn").onclick = () => {
    document.getElementById("p_age").value = "50";
    document.getElementById("p_sex").value = "Male";
    document.getElementById("p_hr").value = "75";
    document.getElementById("p_qrs").value = "90";
    document.getElementById("p_rr").value = "Regular";
    document.getElementById("p_qrswidth").value = "Narrow";
    document.getElementById("p_pwave").value = "Normal";
    document.getElementById("p_avconduction").value = "Normal";
    document.getElementById("p_pacing").value = "No";
    document.getElementById("p_sbp").value = "130";
    document.getElementById("p_dbp").value = "85";
    document.getElementById("p_chol").value = "180";
    document.getElementById("p_smoke").value = "No";
    document.getElementById("p_thyroid").value = "Normal";
    document.getElementById("p_medications").value = "None";
    document.getElementById("p_bmi").value = "Normal";
    document.getElementById("p_athlete").checked = false;
    document.getElementById("p_apnea").checked = false;
    document.getElementById("p_alcohol").checked = false;
    document.getElementById("p_stress").checked = false;
    document.getElementById("p_fever").checked = false;
    document.getElementById("p_anemia").checked = false;
};