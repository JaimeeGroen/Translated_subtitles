// ---------------------------------------------------------------------------
// Language data (ISO 639-1 / 639-3 codes supported by ElevenLabs Scribe)
// ---------------------------------------------------------------------------
const LANGUAGES = [
    { code: "en",  label: "English",             iso3: "eng" },
    { code: "zh",  label: "Chinese (Mandarin)",   iso3: "zho" },
    { code: "es",  label: "Spanish",              iso3: "spa" },
    { code: "hi",  label: "Hindi",                iso3: "hin" },
    { code: "ar",  label: "Arabic",               iso3: "ara" },
    { code: "pt",  label: "Portuguese",            iso3: "por" },
    { code: "bn",  label: "Bengali",              iso3: "ben" },
    { code: "ru",  label: "Russian",              iso3: "rus" },
    { code: "ja",  label: "Japanese",             iso3: "jpn" },
    { code: "de",  label: "German",               iso3: "deu" },
    { code: "fr",  label: "French",               iso3: "fra" },
    { code: "ko",  label: "Korean",               iso3: "kor" },
    { code: "it",  label: "Italian",              iso3: "ita" },
    { code: "nl",  label: "Dutch",                iso3: "nld" },
    { code: "pl",  label: "Polish",               iso3: "pol" },
    { code: "sv",  label: "Swedish",              iso3: "swe" },
    { code: "da",  label: "Danish",               iso3: "dan" },
    { code: "fi",  label: "Finnish",              iso3: "fin" },
    { code: "no",  label: "Norwegian",            iso3: "nor" },
    { code: "tr",  label: "Turkish",              iso3: "tur" },
    { code: "uk",  label: "Ukrainian",            iso3: "ukr" },
    { code: "cs",  label: "Czech",                iso3: "ces" },
    { code: "el",  label: "Greek",                iso3: "ell" },
    { code: "he",  label: "Hebrew",               iso3: "heb" },
    { code: "hu",  label: "Hungarian",            iso3: "hun" },
    { code: "id",  label: "Indonesian",            iso3: "ind" },
    { code: "ms",  label: "Malay",                iso3: "msa" },
    { code: "ro",  label: "Romanian",             iso3: "ron" },
    { code: "sk",  label: "Slovak",               iso3: "slk" },
    { code: "th",  label: "Thai",                 iso3: "tha" },
    { code: "vi",  label: "Vietnamese",            iso3: "vie" },
    { code: "af",  label: "Afrikaans",            iso3: "afr" },
    { code: "bg",  label: "Bulgarian",            iso3: "bul" },
    { code: "ca",  label: "Catalan",              iso3: "cat" },
    { code: "hr",  label: "Croatian",             iso3: "hrv" },
    { code: "et",  label: "Estonian",             iso3: "est" },
    { code: "lv",  label: "Latvian",              iso3: "lav" },
    { code: "lt",  label: "Lithuanian",           iso3: "lit" },
    { code: "sl",  label: "Slovenian",            iso3: "slv" },
    { code: "sr",  label: "Serbian",              iso3: "srp" },
    { code: "tl",  label: "Tagalog",              iso3: "tgl" },
    { code: "sw",  label: "Swahili",              iso3: "swa" },
    { code: "ta",  label: "Tamil",                iso3: "tam" },
    { code: "te",  label: "Telugu",               iso3: "tel" },
    { code: "ur",  label: "Urdu",                 iso3: "urd" },
];

// ---------------------------------------------------------------------------
// Populate language dropdowns
// ---------------------------------------------------------------------------
function populateLanguageSelects() {
    const source = document.getElementById("source-language");
    const target = document.getElementById("target-language");

    LANGUAGES.forEach((lang) => {
        // Source (optional – first option is auto-detect, already in HTML)
        const srcOpt = document.createElement("option");
        srcOpt.value = lang.iso3;
        srcOpt.textContent = lang.label;
        source.appendChild(srcOpt);

        // Target (required)
        const tgtOpt = document.createElement("option");
        tgtOpt.value = lang.code;
        tgtOpt.textContent = lang.label;
        tgtOpt.dataset.iso3 = lang.iso3;
        target.appendChild(tgtOpt);
    });
}

// ---------------------------------------------------------------------------
// File upload UX
// ---------------------------------------------------------------------------
function setupFileUpload() {
    const wrapper = document.getElementById("file-upload-wrapper");
    const input = document.getElementById("file-upload");
    const nameEl = document.getElementById("file-name");

    input.addEventListener("change", () => {
        if (input.files.length) {
            nameEl.textContent = input.files[0].name;
        }
    });

    wrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        wrapper.classList.add("dragover");
    });

    wrapper.addEventListener("dragleave", () => {
        wrapper.classList.remove("dragover");
    });

    wrapper.addEventListener("drop", (e) => {
        e.preventDefault();
        wrapper.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
            input.files = e.dataTransfer.files;
            nameEl.textContent = e.dataTransfer.files[0].name;
        }
    });
}

// ---------------------------------------------------------------------------
// Tab switching
// ---------------------------------------------------------------------------
function setupTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const target = tab.dataset.tab;
            document.getElementById("tab-original").hidden = target !== "original";
            document.getElementById("tab-translated").hidden = target !== "translated";
        });
    });
}

// ---------------------------------------------------------------------------
// Progress helpers
// ---------------------------------------------------------------------------
function showProgress(pct, text) {
    const section = document.getElementById("progress-section");
    section.hidden = false;
    document.getElementById("progress-bar").style.width = pct + "%";
    document.getElementById("progress-text").textContent = text;
}

function hideProgress() {
    document.getElementById("progress-section").hidden = true;
}

function showError(msg) {
    const section = document.getElementById("error-section");
    section.hidden = false;
    document.getElementById("error-text").textContent = msg;
}

function hideError() {
    document.getElementById("error-section").hidden = true;
}

// ---------------------------------------------------------------------------
// ElevenLabs Speech-to-Text API call
// ---------------------------------------------------------------------------
async function transcribeAudio(apiKey, file, modelId, languageCode, numSpeakers, tagAudioEvents) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_id", modelId);

    if (languageCode) {
        formData.append("language_code", languageCode);
    }
    if (numSpeakers) {
        formData.append("num_speakers", numSpeakers);
    }
    if (tagAudioEvents) {
        formData.append("tag_audio_events", "true");
    }
    // Request word-level timestamps
    formData.append("timestamps_granularity", "word");

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
        method: "POST",
        headers: {
            "xi-api-key": apiKey,
        },
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail?.message || err.detail || `ElevenLabs API error: ${response.status}`);
    }

    return response.json();
}

// ---------------------------------------------------------------------------
// Build subtitle segments from the transcription response
// Group words into subtitle lines (~10 words each)
// ---------------------------------------------------------------------------
function buildSegments(transcription) {
    const words = (transcription.words || []).filter(
        (w) => w.type === "word" || w.type === "audio_event"
    );

    if (words.length === 0 && transcription.text) {
        // Fallback: no word-level data, return full text as one segment
        return [{ start: 0, end: 10, text: transcription.text }];
    }

    const WORDS_PER_LINE = 10;
    const segments = [];
    let i = 0;

    while (i < words.length) {
        const chunk = words.slice(i, i + WORDS_PER_LINE);
        const start = chunk[0].start;
        const end = chunk[chunk.length - 1].end;
        const text = chunk.map((w) => w.text).join(" ");
        segments.push({ start, end, text });
        i += WORDS_PER_LINE;
    }

    return segments;
}

// ---------------------------------------------------------------------------
// Translation via MyMemory API (free, no key required)
// Translates text in batches to respect length limits.
// ---------------------------------------------------------------------------
async function translateSegments(segments, sourceLang, targetLang) {
    const translated = [];

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const langPair = `${sourceLang}|${targetLang}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(seg.text)}&langpair=${encodeURIComponent(langPair)}`;

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Translation API error: ${res.status}`);
        }
        const data = await res.json();
        const translatedText =
            data.responseData?.translatedText || seg.text;

        translated.push({
            start: seg.start,
            end: seg.end,
            text: translatedText,
        });

        // Update progress (translation phase is 50-95%)
        const pct = 50 + Math.round(((i + 1) / segments.length) * 45);
        showProgress(pct, `Translating segment ${i + 1} of ${segments.length}...`);
    }

    return translated;
}

// ---------------------------------------------------------------------------
// SRT / VTT formatters
// ---------------------------------------------------------------------------
function formatTime(seconds, format) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    const mss = String(ms).padStart(3, "0");

    if (format === "vtt") {
        return `${hh}:${mm}:${ss}.${mss}`;
    }
    // SRT uses comma
    return `${hh}:${mm}:${ss},${mss}`;
}

function segmentsToSRT(segments) {
    return segments
        .map((seg, i) => {
            const start = formatTime(seg.start, "srt");
            const end = formatTime(seg.end, "srt");
            return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
        })
        .join("\n");
}

function segmentsToVTT(segments) {
    const lines = segments
        .map((seg, i) => {
            const start = formatTime(seg.start, "vtt");
            const end = formatTime(seg.end, "vtt");
            return `${i + 1}\n${start} --> ${end}\n${seg.text}\n`;
        })
        .join("\n");
    return `WEBVTT\n\n${lines}`;
}

// ---------------------------------------------------------------------------
// Download helper
// ---------------------------------------------------------------------------
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Detect source language from transcription response or dropdown
// ---------------------------------------------------------------------------
function detectSourceLangCode(transcription, selectedSourceLang) {
    // If the user picked a specific source language, map ISO-639-3 to ISO-639-1
    if (selectedSourceLang) {
        const match = LANGUAGES.find((l) => l.iso3 === selectedSourceLang);
        return match ? match.code : "en";
    }
    // Try to use detected language from response
    if (transcription.language_code) {
        const match = LANGUAGES.find(
            (l) => l.iso3 === transcription.language_code || l.code === transcription.language_code
        );
        return match ? match.code : transcription.language_code;
    }
    return "en";
}

// ---------------------------------------------------------------------------
// Main form handler
// ---------------------------------------------------------------------------
async function handleSubmit(e) {
    e.preventDefault();
    hideError();

    const apiKey = document.getElementById("api-key").value.trim();
    const file = document.getElementById("file-upload").files[0];
    const modelId = document.getElementById("model-id").value;
    const sourceLang = document.getElementById("source-language").value;
    const targetLangEl = document.getElementById("target-language");
    const targetLang = targetLangEl.value;
    const numSpeakers = document.getElementById("num-speakers").value;
    const tagAudioEvents = document.getElementById("tag-audio-events").checked;
    const outputFormat = document.getElementById("output-format").value;

    if (!apiKey || !file || !targetLang) {
        showError("Please fill in all required fields.");
        return;
    }

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-text").hidden = true;
    submitBtn.querySelector(".btn-loading").hidden = false;
    document.getElementById("results-section").hidden = true;

    try {
        // Step 1: Transcribe
        showProgress(5, "Uploading and transcribing audio...");
        const transcription = await transcribeAudio(
            apiKey,
            file,
            modelId,
            sourceLang,
            numSpeakers || null,
            tagAudioEvents
        );
        showProgress(40, "Transcription complete. Building subtitle segments...");

        // Step 2: Build segments
        const segments = buildSegments(transcription);
        showProgress(45, `Built ${segments.length} subtitle segments.`);

        // Step 3: Generate original subtitles
        const originalSubtitles =
            outputFormat === "vtt" ? segmentsToVTT(segments) : segmentsToSRT(segments);

        // Step 4: Determine source language code for translation
        const srcLangCode = detectSourceLangCode(transcription, sourceLang);

        // Step 5: Check if translation is needed
        let translatedSubtitles;
        if (srcLangCode === targetLang) {
            // Same language – no translation needed
            translatedSubtitles = originalSubtitles;
            showProgress(95, "Source and target language are the same. Skipping translation.");
        } else {
            showProgress(50, "Starting translation...");
            const translatedSegments = await translateSegments(segments, srcLangCode, targetLang);
            translatedSubtitles =
                outputFormat === "vtt"
                    ? segmentsToVTT(translatedSegments)
                    : segmentsToSRT(translatedSegments);
        }

        showProgress(100, "Done!");

        // Show results
        document.getElementById("original-output").textContent = originalSubtitles;
        document.getElementById("translated-output").textContent = translatedSubtitles;
        document.getElementById("results-section").hidden = false;

        // Switch to translated tab
        document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        document.querySelector('[data-tab="translated"]').classList.add("active");
        document.getElementById("tab-original").hidden = true;
        document.getElementById("tab-translated").hidden = false;

        // Download handlers
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const ext = outputFormat;
        const targetLabel = targetLangEl.options[targetLangEl.selectedIndex].text;

        document.getElementById("download-original").onclick = () => {
            downloadFile(originalSubtitles, `${baseName}_original.${ext}`);
        };
        document.getElementById("download-translated").onclick = () => {
            downloadFile(translatedSubtitles, `${baseName}_${targetLabel}.${ext}`);
        };
    } catch (err) {
        showError(err.message || "An unexpected error occurred.");
        hideProgress();
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector(".btn-text").hidden = false;
        submitBtn.querySelector(".btn-loading").hidden = true;
    }
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    populateLanguageSelects();
    setupFileUpload();
    setupTabs();
    document.getElementById("subtitle-form").addEventListener("submit", handleSubmit);
});
