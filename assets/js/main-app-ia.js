document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const contentContainer = document.getElementById('content-container');
    const loginForm = document.getElementById('login-form');
    const keyInput = document.getElementById('access-key-input');
    const errorMessage = document.getElementById('error-message');

    const unlockApp = () => {
        loginContainer.classList.add('hidden');
        contentContainer.classList.remove('hidden');
    };
    
    const savedKey = sessionStorage.getItem('valid_access_key');
    if (savedKey) {
        unlockApp();
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const key = keyInput.value;
        errorMessage.classList.add('hidden'); 

        if (!key) {
            errorMessage.textContent = 'Por favor, introduce una clave.';
            errorMessage.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('/netlify/functions/verifyKey.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: key }),
            });

            if (response.ok) {
                sessionStorage.setItem('valid_access_key', key);
                unlockApp();
            } else {
                const errorData = await response.json();
                errorMessage.textContent = errorData.message || 'Clave incorrecta.';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            errorMessage.textContent = 'Error de conexión. Inténtalo de nuevo.';
            errorMessage.classList.remove('hidden');
        }
    });
});

const API_URL = '/netlify/functions/callGemini.js';

let appState = {
    step: 1,
    videoIdea: '',
    videoFormat: '',
    audience: '',
    finalTitle: '',
    generatedContent: {
        script: null,
        description: null,
        tags: null,
        thumbnail: null,
    },
    checklist: {
        script: false,
        description: false,
        tags: false,
        thumbnail: false
    }
};

const elements = {
    loading: document.getElementById('loadingIndicator'),
    steps: [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step5'),
    ],
    audienceDefined: document.getElementById('audienceDefined'),
    audienceInputContainer: document.getElementById('audienceInputContainer'),
    audienceDescription: document.getElementById('audienceDescription'),
    audienceTip: document.getElementById('audienceTip'),
    videoIdea: document.getElementById('videoIdea'),
    videoFormat: document.getElementById('videoFormat'),
    titleOptions: document.getElementById('titleOptions'),
    finalTitle: document.getElementById('finalTitle'),
    seoScoreText: document.getElementById('seoScoreText'),
    clickScoreText: document.getElementById('clickScoreText'),
    seoProgressBar: document.getElementById('seoProgressBar'),
    clickProgressBar: document.getElementById('clickProgressBar'),
    checklistMenu: document.getElementById('checklistMenu'),
    outputContainer: document.getElementById('outputContainer'),
    checklistTitleDisplay: document.getElementById('checklistTitleDisplay'),
    finalSummary: document.getElementById('finalSummary'),
    copyMessage: document.getElementById('copyMessage'),
};

function showMessageBox(title, body) {
    document.getElementById('messageTitle').textContent = title;
    document.getElementById('messageBody').textContent = body;
    document.getElementById('messageBox').classList.remove('hidden');
    document.getElementById('messageBox').classList.add('flex');
}
window.hideMessageBox = hideMessageBox;

function hideMessageBox() {
    document.getElementById('messageBox').classList.add('hidden');
    document.getElementById('messageBox').classList.remove('flex');
}

function toggleLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
    document.querySelectorAll('button').forEach(btn => btn.disabled = show);
}

function updateAudienceInput() {
    const isDefined = elements.audienceDefined.value === 'Si';
    elements.audienceInputContainer.classList.toggle('hidden', !isDefined);
    elements.audienceTip.classList.toggle('hidden', isDefined);
}
if (elements.audienceDefined) {
    elements.audienceDefined.addEventListener('change', updateAudienceInput);
    updateAudienceInput();
}

function displayScores(seo, click) {
    seo = parseInt(seo) || 0;
    click = parseInt(click) || 0;

    if (seo === 0 && click === 0) {
        elements.seoScoreText.textContent = '--/100';
        elements.clickScoreText.textContent = '--/100';
        elements.seoProgressBar.style.width = '0%';
        elements.clickProgressBar.style.width = '0%';
    } else {
        elements.seoScoreText.textContent = `${seo}/100`;
        elements.clickScoreText.textContent = `${click}/100`;
        elements.seoProgressBar.style.width = `${seo}%`;
        elements.clickProgressBar.style.width = `${click}%`;
    }

    elements.seoProgressBar.classList.toggle('progress-bar-completed', seo >= 80);
    elements.clickProgressBar.classList.toggle('progress-bar-completed', click >= 80);
}

function updateScoresFromManualInput() {
    const title = elements.finalTitle.value;
    if (title.length > 5) {
        let seo = Math.min(100, 40 + title.split(' ').length * 5 + (title.includes('cómo') ? 10 : 0));
        let click = Math.min(100, 40 + title.split(/[?!¡¿]/).length * 15 + (title.length > 50 ? 5 : 0));
        displayScores(seo, click);
    } else {
        displayScores(0, 0);
    }
}

window.selectTitle = (title, seo, click) => {
    elements.finalTitle.value = title;
    displayScores(seo, click);
};

function nextStep(targetStep) {
    if (targetStep === 2 && !validateStep1()) return;
    if (targetStep === 3 && !validateStep2()) return;
    
    elements.steps.forEach((el) => {
        el.classList.add('hidden');
        if (el.id === `step${targetStep}`) {
            el.classList.remove('hidden');
            appState.step = targetStep;
        }
    });

    if (targetStep === 2) generateTitles();
    if (targetStep === 3) initializeChecklist();
    if (targetStep === 5) generateFinalSummary();
}
window.nextStep = nextStep;

function validateStep1() {
    appState.videoIdea = elements.videoIdea.value.trim();
    appState.videoFormat = elements.videoFormat.value;
    appState.audience = elements.audienceDefined.value === 'Si'
        ? elements.audienceDescription.value.trim()
        : 'Principiante no técnico de Latinoamérica';

    if (!appState.videoIdea || (elements.audienceDefined.value === 'Si' && !appState.audience)) {
        showMessageBox("Error de Validación", "Por favor, describe tu idea de video y a tu público objetivo.");
        return false;
    }
    return true;
}

function validateStep2() {
    appState.finalTitle = elements.finalTitle.value.trim();
    if (appState.finalTitle.length < 10) {
        showMessageBox("Error de Validación", "El título final es demasiado corto o vacío.");
        return false;
    }
    return true;
}

function initializeChecklist() {
    elements.checklistTitleDisplay.textContent = `Título: "${appState.finalTitle}"`;
    elements.outputContainer.innerHTML = '';
    appState.checklist = { script: false, description: false, tags: false, thumbnail: false };
    
    document.querySelectorAll('.checklist-item').forEach(btn => {
        btn.onclick = () => handleChecklistTask(btn.dataset.task, btn);
        btn.style.textDecoration = 'none';
        btn.classList.remove('border-verde-neon');
        btn.classList.add('border-gray-700');
    });
}

function markTaskCompleted(btn, task) {
    appState.checklist[task] = true;
    btn.style.textDecoration = 'line-through';
    btn.classList.remove('border-gray-700');
    btn.classList.add('border-verde-neon');
}

async function callGeminiApi(userQuery, systemPrompt, responseSchema = null) {
    const payload = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [
            { role: "user", parts: [{ text: userQuery }] }
        ]
    };

    if (responseSchema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Error ${response.status}: ${errText}`);
            }

            const result = await response.json();
            
            if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
                const reason = result.candidates?.[0]?.finishReason || "Respuesta inválida";
                throw new Error(`La IA no generó texto. Razón: ${reason}`);
            }
            
            const text = result.candidates[0].content.parts[0].text;
            return responseSchema ? JSON.parse(text) : text;
        } catch (error) {
            console.error("Error en callGeminiApi, intento " + (attempt + 1), error);
            if (attempt === 2) throw error;
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
    }
    throw new Error("No se pudo obtener respuesta de la API después de 3 intentos.");
}

async function generateTitles() {
    toggleLoading(true);
    elements.titleOptions.innerHTML = '';

    const systemPrompt = `Actúa como un experto en contenido viral y posicionamiento SEO para el público hispanohablante, enfocado en generar títulos claros, impactantes y de alto alcance digital.`;
    const userQuery = `Idea: "${appState.videoIdea}". Formato: ${appState.videoFormat}. Audiencia: ${appState.audience}. Genera 5 títulos virales con puntuación de SEO (1-100) y Clic Emocional (1-100), presentados en una lista clara.`;

    const schema = {
        type: "ARRAY",
        items: {
            type: "OBJECT",
            properties: {
                "title": { "type": "STRING" },
                "seoScore": { "type": "INTEGER" },
                "clickScore": { "type": "INTEGER" }
            },
            required: ["title", "seoScore", "clickScore"]
        }
    };

    try {
        const results = await callGeminiApi(userQuery, systemPrompt, schema);
        results.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = "p-4 rounded-xl border border-gray-700 hover:border-turquesa transition cursor-pointer bg-gray-900";
            itemDiv.innerHTML = `
                <p class="text-lg font-titulos text-turquesa">${index + 1}. ${item.title}</p>
                <div class="flex justify-between text-xs mt-2 text-gray-400">
                    <span>SEO: <span class="text-verde-neon">${item.seoScore}/100</span></span>
                    <span>CTR: <span class="text-morado-neon">${item.clickScore}/100</span></span>
                </div>`;
            itemDiv.onclick = () => selectTitle(item.title, item.seoScore, item.clickScore);
            elements.titleOptions.appendChild(itemDiv);
        });

        if (results.length > 0) {
            selectTitle(results[0].title, results[0].seoScore, results[0].clickScore);
        }
    } catch (error) {
        console.error("Error generando títulos:", error);
        showMessageBox("Error de IA", `No se pudieron generar los títulos. Detalle: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

async function handleChecklistTask(task, btn) {
    if (appState.checklist[task]) {
        showMessageBox("Ya completado", `Ya generaste "${task}".`);
        return;
    }

    toggleLoading(true);
    let systemPrompt, userQuery, resultHtml;

    try {
        switch (task) {
            case 'script':
                systemPrompt = `Actúa como guionista. Crea un guion estructurado, cercano y práctico en formato **Markdown**. Usa encabezados (#, ##) para las secciones (Intro, Hook, Contenido Principal, CTA, Otro).`;
                userQuery = `Título: ${appState.finalTitle}. Idea: ${appState.videoIdea}.`;
                appState.generatedContent.script = await callGeminiApi(userQuery, systemPrompt);
                resultHtml = generateOutputBlock('Guion Paso a Paso', appState.generatedContent.script, task);
                break;
            case 'description':
                systemPrompt = `Genera una descripción SEO optimizada para YouTube en formato **Markdown**. Incluye un resumen atractivo, una llamada a la acción (CTA) y una sección de hashtags.`;
                userQuery = `Título: ${appState.finalTitle}. Guion: ${appState.generatedContent.script || appState.videoIdea}.`;
                appState.generatedContent.description = await callGeminiApi(userQuery, systemPrompt);
                resultHtml = generateOutputBlock('Descripción SEO', appState.generatedContent.description, task);
                break;
            case 'tags':
                systemPrompt = `Genera una lista de 10 a 15 etiquetas (tags) relevantes para un video de YouTube. Devuelve solo las etiquetas separadas por comas, sin texto introductorio.`;
                userQuery = `Título: ${appState.finalTitle}. Idea: ${appState.videoIdea}.`;
                appState.generatedContent.tags = await callGeminiApi(userQuery, systemPrompt);
                resultHtml = generateOutputBlock('Etiquetas (Tags)', appState.generatedContent.tags, task);
                break;
            case 'thumbnail':
                systemPrompt = `Genera la idea visual para una miniatura de YouTube en formato **Markdown**.`;
                userQuery = `Título: ${appState.finalTitle}. Idea: ${appState.videoIdea}.`;
                appState.generatedContent.thumbnail = await callGeminiApi(userQuery, systemPrompt);
                resultHtml = generateOutputBlock('Ideas de Miniatura', appState.generatedContent.thumbnail, task);
                break;
        }

        elements.outputContainer.innerHTML += resultHtml;
        markTaskCompleted(btn, task);
    } catch (error) {
       console.error(`Error generando ${task}:`, error);
       showMessageBox("Error de Generación", `No se pudo generar ${task}. Detalle: ${error.message}`);
    } finally {
        toggleLoading(false);
    }
}

function generateOutputBlock(title, content, task) {
    const editable = (task === 'script' || task === 'description');
    const uniqueId = `output-${task}`; 
    
    const body = editable
        ? `<textarea id="${uniqueId}" rows="10" class="w-full p-3 rounded-lg bg-gray-900 border border-morado-neon text-gray-100 font-mono text-sm">${content}</textarea>`
        : `<pre class="whitespace-pre-wrap p-3 rounded-lg bg-gray-900 border border-morado-neon text-gray-100 font-mono text-sm">${content}</pre>`;
    
    return `<div class="p-4 rounded-xl bg-gray-800/50 my-4">
        <h4 class="text-xl font-titulos text-morado-neon mb-3">${title} (Generado)</h4>${body}</div>`;
}

function getFinalGeneratedContent() {
    const scriptTextarea = document.getElementById('output-script');
    const script = scriptTextarea 
        ? scriptTextarea.value 
        : (appState.generatedContent.script || "Guion no generado.");

    const descTextarea = document.getElementById('output-description');
    const description = descTextarea
        ? descTextarea.value
        : (appState.generatedContent.description || "Descripción no generada.");
    
    return {
        title: appState.finalTitle || "Título no definido.",
        script: script,
        description: description,
        tags: appState.generatedContent.tags || "Etiquetas no generadas.",
        thumbnail: appState.generatedContent.thumbnail || "Idea de miniatura no generada."
    };
}

async function generateFinalSummary() {
    toggleLoading(true);
    
    const content = getFinalGeneratedContent();
    const container = document.getElementById('step5');

    container.innerHTML = `
    <div id="finalBattlePlan" class="p-6 bg-gray-900 rounded-xl border border-turquesa shadow-xl">
        <h2 class="text-3xl font-titulos text-center brand-gradient-text mb-6">PLAN DE BATALLA FINAL</h2>
        <div class="space-y-8 text-gray-100 text-left prose prose-invert max-w-none">
            
            <div><h3 class="text-xl text-verde-neon font-bold mb-2 !mt-0">🎯 TÍTULO FINAL</h3><p class="!my-0">${content.title}</p></div>
            
            <div><h3 class="text-xl text-verde-neon font-bold mb-2">📜 GUION</h3><div>${marked.parse(content.script)}</div></div>
            
            <div><h3 class="text-xl text-verde-neon font-bold mb-2">🔍 DESCRIPCIÓN</h3><div>${marked.parse(content.description)}</div></div>
            
            <div><h3 class="text-xl text-verde-neon font-bold mb-2">🏷️ TAGS</h3><p class="!my-0">${content.tags}</p></div>
            
            <div><h3 class="text-xl text-verde-neon font-bold mb-2">🖼️ MINIATURA</h3><div>${marked.parse(content.thumbnail)}</div></div>
        </div>
        <div class="text-center mt-8 space-y-3">
            <button onclick="copyPlanToClipboard()" class="cta-neon-green px-4 py-2">Copiar para Notion</button>
            <button onclick="downloadPlanMd()" class="cta-secondary-purple px-4 py-2">Descargar .md</button>
        </div>
    </div>`;
    toggleLoading(false);
}

window.copyPlanToClipboard = function() {
    const content = getFinalGeneratedContent();
    const text = `
# 🎯 PLAN DE BATALLA FINAL

## TÍTULO FINAL
${content.title}

---

## 📜 GUION
${content.script}

---

## 🔍 DESCRIPCIÓN
${content.description}

---

## 🏷️ ETIQUETAS
${content.tags}

---

## 🖼️ MINIATURA
${content.thumbnail}
`.trim(); 
    
    navigator.clipboard.writeText(text);
    elements.copyMessage.classList.remove('hidden');
    setTimeout(() => elements.copyMessage.classList.add('hidden'), 3000);
};

window.downloadPlanMd = function() {
    const content = getFinalGeneratedContent();
    const text = `
# 🎯 PLAN DE BATALLA FINAL

## TÍTULO FINAL
${content.title}

---

## 📜 GUION
${content.script}

---

## 🔍 DESCRIPCIÓN
${content.description}

---

## 🏷️ ETIQUETAS
${content.tags}

---

## 🖼️ MINIATURA
${content.thumbnail}
`.trim();
    const blob = new Blob([text], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plan-de-batalla-final.md";
    link.click();
    URL.revokeObjectURL(link.href);
};

window.onload = () => {
    nextStep(1); 
    if (elements.finalTitle) {
        elements.finalTitle.addEventListener('input', updateScoresFromManualInput);
    }
};