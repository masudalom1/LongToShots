"use client";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
    Play,
    Pause,
    UploadCloud,
    Folder,
    FolderOpen,
    Infinity as InfinityIcon,
    Clapperboard,
    Ban,
    Code2,
    IndianRupee,
    Rocket,
    ArrowRight,
    ArrowDown,
    Sparkles,
    Zap,
    Download,
    Cpu,
    WandSparkles,
    Check,
    ChevronDown,
    Menu,
    X,
    Subtitles,
    Crop,
    ShieldCheck,
    Video,
    Heart,
    Loader2,
    Trash2,
    Plus,
    Scissors,
    RotateCcw,
    HardDrive,
    Link2,
    Film,
    Type,
    SlidersHorizontal,
    Clock,
    Database,
    Pencil,
    Square,
    Info,
    CircleAlert,
    CircleCheck,
    Music,
    Mic,
    Layers,
    SplitSquareHorizontal,
} from "lucide-react";
import {
    SR,
    ASPECTS,
    CAPTION_STYLES,
    MODELS,
    LANGUAGES,
    INDIC_LANGUAGES,
    HINDI_MODEL,
    DEFAULT_SETTINGS,
    uid,
    clamp,
    fmtTime,
    fmtTimePrecise,
    fmtBytes,
    slugify,
    downloadBlob,
    isVideoFile,
    probeVideo,
    getDims,
    pickMime,
    ensureCaptionFonts,
    drawFrame,
    buildFrameOpts,
    supportsCanvasFilter,
    createMusicPlayer,
    startVoiceRecording,
    buildCreditsText,
    decodeMonoAudio,
    computeEnergy,
    downsampleEnergy,
    findHighlights,
    evenlySpaced,
    transcribe,
    buildCaptions,
    titleFromText,
    renderClip,
    captureThumb,
    seekTo,
    dbPut,
    dbGet,
    dbDelete,
    dbAll,
} from "./engine";
import { SITE } from "./site";
import { FAQS, USE_CASES } from "./content";
import { EffectsPanel, AudioPanel, OverlayEditor, VoiceoverCard, CopyrightKit } from "./StudioExtras";

/* Loaded client-only: audio tools usually touch AudioContext / window, which don't exist during SSR.
   Adjust the path if this file doesn't live next to the "components" folder. */
const VoiceEditor = dynamic(() => import("../components/VoiceEditor"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center py-16 text-violet-600" role="status">
            <Loader2 className="animate-spin" />
        </div>
    ),
});

/* Brand icons were removed from lucide-react, so we define them inline */
const Instagram = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const Youtube = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
);

const Github = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

const XIcon = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

/* ------------------------------ content ------------------------------ */

const features = [
    { icon: InfinityIcon, title: "Unlimited Processing", description: "Upload and process as many videos as you want.", color: "text-violet-600", bg: "bg-violet-100" },
    { icon: Clapperboard, title: "Unlimited Clips", description: "Generate as many short clips as your video allows.", color: "text-blue-600", bg: "bg-blue-100" },
    { icon: Ban, title: "No Watermark", description: "Your videos, your brand. Always clean exports.", color: "text-red-500", bg: "bg-red-100" },
    { icon: Code2, title: "No Paid APIs", description: "Powered by open-source Whisper AI, run locally.", color: "text-green-600", bg: "bg-green-100" },
    { icon: IndianRupee, title: "100% Free", description: "No subscriptions and no hidden charges.", color: "text-emerald-600", bg: "bg-emerald-100" },
    { icon: Rocket, title: "Local Processing", description: "Runs on your device, right in your browser.", color: "text-orange-500", bg: "bg-orange-100" },
];

const steps = [
    { number: "01", icon: UploadCloud, title: "Upload Video", description: "Add your long video — it never leaves your device" },
    { number: "02", icon: Cpu, title: "Let AI Work", description: "Find highlights by analysing speech & energy" },
    { number: "03", icon: WandSparkles, title: "Fine-tune Shorts", description: "Captions, framing, trims and formats" },
    { number: "04", icon: Download, title: "Download", description: "Export clean MP4s, one by one or all at once" },
];

const SAMPLE_VIDEOS = [
    { title: "Flower", credit: "CC0 · MDN", url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
    { title: "Friday", credit: "CC0 · MDN", url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4" },
];

const CLIP_LENGTHS = [15, 30, 45, 60, 90];

const NAV_LINKS = [
    ["Features", "features"],
    ["Voice Changer", "voice-editor"],
    ["How It Works", "how-it-works"],
    ["Use Cases", "use-cases"],
    ["FAQ", "faq"],
];

const GLOBAL_CSS = `
html { scroll-behavior: smooth; }
body { margin: 0; font-family: Arial, Helvetica, sans-serif; }
::selection { background: #d9c5ff; color: #3b0cbd; }
.hero-bg { background: radial-gradient(circle at 85% 20%, rgba(188,167,255,.36), transparent 32%), radial-gradient(circle at 50% 75%, rgba(220,207,255,.38), transparent 30%), #fbfaff; }
.purple-gradient { background: linear-gradient(110deg, #4b0cff, #9b18f8); }
.gradient-text { background: linear-gradient(100deg, #6410ed, #a315f5); -webkit-background-clip: text; background-clip: text; color: transparent; }
.soft-shadow { box-shadow: 0 15px 45px rgba(89,40,210,.13); }
.video-card { transform: rotate(-3deg); transition: transform .3s ease; }
.video-card:hover { transform: rotate(0deg) translateY(-5px); }
.reel-card { transition: transform .3s ease; }
.reel-card:hover { transform: translateY(-9px); }
.upload-area { transition: all .25s ease; }
.upload-area:hover { border-color: #7218f5; background: rgba(242,235,255,.65); }
.feature-card { transition: all .25s ease; }
.feature-card:hover { transform: translateY(-5px); background: #faf7ff; }
.offscreen-video { position: absolute; width: 2px; height: 2px; opacity: 0; pointer-events: none; left: 0; top: 0; }
@keyframes toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.toast-in { animation: toast-in .25s ease; }
input[type=range] { accent-color: #7c3aed; }
details > summary::-webkit-details-marker { display: none; }
:focus-visible { outline: 2px solid #7c3aed; outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
`;

/* --------------------------- small UI pieces --------------------------- */

function Brand({ light = false }) {
    return (
        <span className={`text-[25px] font-black tracking-tight ${light ? "text-white" : "text-[#11112d]"}`}>
            LongTo<span className={light ? "text-violet-400" : "gradient-text"}>Shorts</span>
        </span>
    );
}

function Chip({ active, onClick, children, className = "", title }) {
    return (
        <button
            type="button"
            title={title}
            aria-pressed={!!active}
            onClick={onClick}
            className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${active
                ? "border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-200"
                : "border-violet-100 bg-white text-slate-700 hover:border-violet-300 hover:text-violet-700"
                } ${className}`}
        >
            {children}
        </button>
    );
}

function Field({ label, icon: Icon, children, hint }) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                {Icon && <Icon size={14} className="text-violet-600" />}
                {label}
            </div>
            {children}
            {hint && <p className="mt-1.5 text-[11px] leading-4 text-slate-500">{hint}</p>}
        </div>
    );
}

function ProgressBar({ value, className = "" }) {
    return (
        <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(clamp(value || 0, 0, 1) * 100)}
            className={`h-2 w-full overflow-hidden rounded-full bg-violet-100 ${className}`}
        >
            <div className="h-full rounded-full purple-gradient transition-[width] duration-200" style={{ width: `${Math.round(clamp(value || 0, 0, 1) * 100)}%` }} />
        </div>
    );
}

/* ================================ PAGE ================================ */

export default function HomeClient() {
    /* ---------- landing state ---------- */
    const [dragging, setDragging] = useState(false);
    const [videoUrlInput, setVideoUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [importing, setImporting] = useState(null);
    const [activeFaq, setActiveFaq] = useState(0);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [year, setYear] = useState(null);
    const fileInputRef = useRef(null);

    /* ---------- toasts ---------- */
    const [toasts, setToasts] = useState([]);
    const toast = useCallback((msg, type = "info") => {
        const id = uid();
        setToasts((t) => [...t, { id, msg, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === "error" ? 8000 : 4500);
    }, []);

    /* ---------- studio state ---------- */
    const [project, setProject] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [meta, setMeta] = useState(null);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [clips, setClips] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [energyPreview, setEnergyPreview] = useState(null);
    const [busy, setBusy] = useState(null);
    const [captionJob, setCaptionJob] = useState(null);
    const [exportsState, setExportsState] = useState({});
    const [exportQueue, setExportQueue] = useState([]);
    const [sortMode, setSortMode] = useState("score");
    const [projects, setProjects] = useState([]);
    const [storageInfo, setStorageInfo] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [curTime, setCurTime] = useState(0);
    const [outputMime, setOutputMime] = useState(null);
    const [filterSupported, setFilterSupported] = useState(true);
    const [recordingId, setRecordingId] = useState(null);
    const [musicPreviewing, setMusicPreviewing] = useState(false);

    const fileRef = useRef(null);
    const audioRef = useRef(null);
    const audioPromiseRef = useRef(null);
    const projectIdRef = useRef(null);
    const projectRef = useRef(null);
    const clipsRef = useRef([]);
    const settingsRef = useRef(DEFAULT_SETTINGS);
    const selectedIdRef = useRef(null);
    const exportsRef = useRef({});
    const editorVideoRef = useRef(null);
    const thumbVideoRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const thumbBusyRef = useRef(false);
    const exportBusyRef = useRef(false);
    const exportAbortRef = useRef(null);
    const captionBusyRef = useRef(false);
    const modelProgressRef = useRef({});
    const recorderRef = useRef(null);
    const previewAcRef = useRef(null);
    const previewPlayerRef = useRef(null);
    const [thumbTick, setThumbTick] = useState(0);

    useEffect(() => { clipsRef.current = clips; }, [clips]);
    useEffect(() => { settingsRef.current = settings; }, [settings]);
    useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
    useEffect(() => { projectRef.current = project; projectIdRef.current = project?.id || null; }, [project]);
    useEffect(() => { exportsRef.current = exportsState; }, [exportsState]);

    const selectedClip = clips.find((c) => c.id === selectedId) || null;
    const setSetting = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
    const updateClip = useCallback((id, patch) => setClips((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c))), []);

    const isIndicLang = INDIC_LANGUAGES.includes(settings.language);
    const modelWeakForIndic = isIndicLang && settings.model !== HINDI_MODEL;

    const handleLanguageChange = (lang) => {
        setSettings((s) => {
            // Hindi & other Indic languages: Whisper Tiny/Base (and the English-only models)
            // produce mostly garbage, so switch to Whisper Small automatically.
            // The user can still pick another model afterwards.
            const nextModel = INDIC_LANGUAGES.includes(lang) ? HINDI_MODEL : s.model;
            const m = MODELS.find((x) => x.id === nextModel) || MODELS[0];
            // Any other non-English language still needs at least a multilingual model
            const safeModel = lang !== "english" && lang !== "auto" && !m.multilingual ? "Xenova/whisper-base" : nextModel;
            return { ...s, language: lang, model: safeModel };
        });
    };

    const addCaptionLine = (clip) => {
        const current = editorVideoRef.current?.currentTime ?? curTime;
        const start = clamp(current, clip.start, Math.max(clip.start, clip.end - 0.5));
        const end = clamp(start + 2.5, start + 0.5, clip.end);
        const newLine = {
            id: uid(),
            start: +start.toFixed(2),
            end: +end.toFixed(2),
            text: "New caption",
        };
        const next = [...(clip.captions || []), newLine].sort((a, b) => a.start - b.start);
        updateClip(clip.id, { captions: next });
    };

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setMobileMenu(false);
    };

    /* ---------- library ---------- */
    const refreshProjects = useCallback(async () => {
        try {
            const all = await dbAll("projects");
            all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            setProjects(all);
            if (navigator.storage?.estimate) setStorageInfo(await navigator.storage.estimate());
        } catch {
            /* IndexedDB unavailable (e.g. private mode) */
        }
    }, []);

    useEffect(() => {
        setYear(new Date().getFullYear());
        setOutputMime(pickMime());
        setFilterSupported(supportsCanvasFilter());
        ensureCaptionFonts(); // preload the Devanagari font so Hindi captions render correctly
        refreshProjects();
        navigator.storage?.persist?.().catch(() => { });
    }, [refreshProjects]);

    // Autosave project metadata (the video blob is stored once on creation)
    useEffect(() => {
        if (!project) return;
        const t = setTimeout(() => {
            dbPut("projects", { ...project, updatedAt: Date.now(), meta, settings, clips, energyPreview })
                .then(refreshProjects)
                .catch(() => { });
        }, 800);
        return () => clearTimeout(t);
    }, [project, meta, settings, clips, energyPreview, refreshProjects]);

    /* ---------- music preview ---------- */
    const stopMusicPreview = useCallback(() => {
        previewPlayerRef.current?.stop();
        previewPlayerRef.current = null;
        previewAcRef.current?.close?.();
        previewAcRef.current = null;
        setMusicPreviewing(false);
    }, []);

    const toggleMusicPreview = async () => {
        if (previewPlayerRef.current) {
            stopMusicPreview();
            return;
        }
        if (settings.musicTrack === "none") return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            const ac = new AC();
            await ac.resume();
            const player = createMusicPlayer(ac, ac.destination, settings.musicTrack, settings.musicVolume);
            if (!player) {
                ac.close?.();
                return;
            }
            player.start();
            previewAcRef.current = ac;
            previewPlayerRef.current = player;
            setMusicPreviewing(true);
        } catch (e) {
            toast(`Couldn't play the preview: ${e.message}`, "error");
        }
    };

    // Keep preview in sync with the track / volume pickers
    useEffect(() => { stopMusicPreview(); }, [settings.musicTrack, stopMusicPreview]);
    useEffect(() => { previewPlayerRef.current?.setVolume(settings.musicVolume); }, [settings.musicVolume]);
    useEffect(() => () => stopMusicPreview(), [stopMusicPreview]);

    /* ---------- voiceover recording ---------- */
    const finishRecording = useCallback(async () => {
        const r = recorderRef.current;
        if (!r) return;
        recorderRef.current = null; // guard against re-entry from the pause event
        const v = editorVideoRef.current;
        v?.pause();
        if (v) v.muted = false;
        setRecordingId(null);
        try {
            const { blob } = await r.rec.stop();
            if (blob.size > 0) updateClip(r.clipId, { voice: { blob } });
        } catch (e) {
            toast(`Voiceover failed: ${e.message}`, "error");
        }
    }, [updateClip, toast]);

    const toggleRecording = async () => {
        if (recorderRef.current) {
            await finishRecording();
            return;
        }
        const v = editorVideoRef.current;
        const clip = selectedClip;
        if (!v || !clip) return;
        try {
            v.pause();
            await seekTo(v, clip.start);
            const rec = await startVoiceRecording();
            recorderRef.current = { rec, clipId: clip.id };
            setRecordingId(clip.id);
            v.muted = true; // so the mic doesn't pick up the original audio
            await v.play();
        } catch (e) {
            if (recorderRef.current) await finishRecording();
            toast(e?.name === "NotAllowedError" ? "Microphone access was blocked. Allow it in your browser's site settings." : `Couldn't start recording: ${e.message}`, "error");
        }
    };

    const resetStudio = useCallback(() => {
        exportAbortRef.current?.abort();
        if (recorderRef.current) {
            recorderRef.current.rec.stop().catch(() => { });
            recorderRef.current = null;
            setRecordingId(null);
        }
        Object.values(exportsRef.current).forEach((e) => e?.url && URL.revokeObjectURL(e.url));
        setVideoUrl((u) => {
            if (u) URL.revokeObjectURL(u);
            return null;
        });
        fileRef.current = null;
        audioRef.current = null;
        audioPromiseRef.current = null;
        modelProgressRef.current = {};
        setProject(null);
        setMeta(null);
        setClips([]);
        setSelectedId(null);
        setEnergyPreview(null);
        setExportsState({});
        setExportQueue([]);
        setBusy(null);
        setCaptionJob(null);
        setPlaying(false);
        setCurTime(0);
    }, []);

    const openFile = async (blob, name) => {
        if (!blob) return;
        if (!isVideoFile(blob, name)) {
            toast("Please select a valid video file.", "error");
            return;
        }
        const url = URL.createObjectURL(blob);
        let m;
        try {
            m = await probeVideo(url);
        } catch {
            URL.revokeObjectURL(url);
            toast("Your browser can't play this video format. Convert it to MP4 (H.264) or WebM and try again.", "error");
            return;
        }
        resetStudio();
        const id = uid();
        const now = Date.now();
        const proj = { id, name: name.replace(/\.[^.]+$/, "") || "Untitled", fileName: name, fileSize: blob.size, fileType: blob.type, createdAt: now, updatedAt: now };
        fileRef.current = blob;
        projectIdRef.current = id;
        setProject(proj);
        setVideoUrl(url);
        setMeta(m);
        setTimeout(() => scrollTo("studio"), 120);
        try {
            await dbPut("files", { id, blob, name });
            await dbPut("projects", { ...proj, meta: m, settings, clips: [], energyPreview: null });
            refreshProjects();
        } catch {
            toast("Couldn't save this video to your local library (storage may be full). You can keep working, but the project won't be saved.", "error");
        }
    };

    const openProject = async (p) => {
        try {
            const rec = await dbGet("files", p.id);
            if (!rec?.blob) {
                toast("The video for this project is missing from local storage.", "error");
                return;
            }
            resetStudio();
            fileRef.current = rec.blob;
            projectIdRef.current = p.id;
            const { meta: m, settings: s, clips: c, energyPreview: e, ...proj } = p;
            setProject(proj);
            setVideoUrl(URL.createObjectURL(rec.blob));
            setMeta(m);
            setSettings({ ...DEFAULT_SETTINGS, ...(s || {}) });
            setClips(c || []);
            setSelectedId(c?.[0]?.id || null);
            setEnergyPreview(e || null);
            setTimeout(() => scrollTo("studio"), 120);
        } catch (err) {
            toast(`Couldn't open project: ${err.message}`, "error");
        }
    };

    const deleteProject = async (p) => {
        if (!window.confirm(`Delete "${p.name}" and its video from this device? This can't be undone.`)) return;
        await dbDelete("projects", p.id).catch(() => { });
        await dbDelete("files", p.id).catch(() => { });
        if (project?.id === p.id) resetStudio();
        refreshProjects();
        toast("Project deleted.", "success");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) openFile(f, f.name);
    };

    const importFromUrl = async (url, nameHint) => {
        let parsed;
        try {
            parsed = new URL(url.trim());
        } catch {
            toast("That doesn't look like a valid link.", "error");
            return;
        }
        setImporting({ label: "Downloading video…", progress: 0 });
        try {
            const res = await fetch(parsed.href);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const total = Number(res.headers.get("content-length")) || 0;
            const reader = res.body.getReader();
            const parts = [];
            let got = 0;
            for (; ;) {
                const { done, value } = await reader.read();
                if (done) break;
                parts.push(value);
                got += value.length;
                setImporting({ label: `Downloading video… ${fmtBytes(got)}`, progress: total ? got / total : 0 });
            }
            let type = (res.headers.get("content-type") || "").split(";")[0];
            const name = nameHint || decodeURIComponent(parsed.pathname.split("/").pop() || "video.mp4");
            if (!type.startsWith("video/")) type = /\.webm$/i.test(name) ? "video/webm" : "video/mp4";
            await openFile(new File(parts, name, { type }), name);
            setVideoUrlInput("");
            setShowUrlInput(false);
        } catch (e) {
            toast(
                `Couldn't import that link (${e.message}). It must be a direct video file link from a server that allows cross-origin downloads. YouTube/Instagram page links won't work — download the video first, then upload it.`,
                "error"
            );
        } finally {
            setImporting(null);
        }
    };

    /* ---------- audio / AI ---------- */
    const ensureAudio = useCallback(async () => {
        if (audioRef.current) return audioRef.current;
        if (!fileRef.current) throw new Error("No video loaded");
        if (!audioPromiseRef.current) {
            const pid = projectIdRef.current;
            audioPromiseRef.current = decodeMonoAudio(fileRef.current)
                .then((s) => {
                    if (projectIdRef.current === pid) audioRef.current = s;
                    return s;
                })
                .catch((e) => {
                    audioPromiseRef.current = null;
                    throw e;
                });
        }
        return audioPromiseRef.current;
    }, []);

    const handleModelProgress = (p) => {
        if (!p) return;
        if (p.status === "ready") {
            setCaptionJob((j) => (j ? { ...j, model: null } : j));
            return;
        }
        if (p.status === "initiate" && p.file) {
            setCaptionJob((j) => (j && !j.model ? { ...j, model: { pct: 0 } } : j));
            return;
        }
        if ((p.status === "progress" || p.status === "done") && p.file) {
            modelProgressRef.current[p.file] = { loaded: p.loaded || p.total || 0, total: p.total || p.loaded || 0 };
            // only track the big model files, not the tiny config/tokenizer files
            const big = Object.values(modelProgressRef.current).filter((v) => v.total > 5e6);
            if (!big.length) return;
            const loaded = big.reduce((s, v) => s + v.loaded, 0);
            const total = big.reduce((s, v) => s + v.total, 0);
            setCaptionJob((j) => (j ? { ...j, model: { pct: Math.min(0.99, loaded / total) } } : j));
        }
    };

    const transcribeClips = async (list) => {
        if (!list.length) return;
        if (captionBusyRef.current) {
            toast("Captions are already being generated — please wait.");
            return;
        }
        captionBusyRef.current = true;
        modelProgressRef.current = {};
        const pid = projectIdRef.current;
        const s = settingsRef.current;
        const model = MODELS.find((m) => m.id === s.model) || MODELS[0];
        const language = model.multilingual && s.language !== "auto" ? s.language : null;
        let ok = 0;
        try {
            await ensureCaptionFonts(); // make sure Devanagari glyphs are ready for preview
            if (INDIC_LANGUAGES.includes(s.language) && s.model !== HINDI_MODEL) {
                toast("Tip: Whisper Small gives much better Hindi accuracy than Tiny/Base. Change it under “Speech model”.");
            } else if (s.language === "auto" && !model.multilingual) {
                toast("You're using an English-only model. Hindi or other languages won't transcribe correctly — pick a Multilingual model.");
            }
            setCaptionJob({ done: 0, total: list.length, label: "Preparing audio…", current: null });
            const samples = await ensureAudio();
            for (let i = 0; i < list.length; i++) {
                if (projectIdRef.current !== pid) break;
                const c = clipsRef.current.find((x) => x.id === list[i].id);
                if (!c) continue;
                setCaptionJob((j) => ({ ...j, done: i, current: c.id, label: `Transcribing clip ${i + 1} of ${list.length}` }));
                const a = Math.max(0, Math.floor(c.start * SR));
                const b = Math.min(samples.length, Math.ceil(c.end * SR));
                if (b - a < SR * 0.3) continue;
                const dur = (b - a) / SR;
                const out = await transcribe(samples.slice(a, b), { model: s.model, language }, handleModelProgress);
                const chunks = out.chunks?.length ? out.chunks : [{ timestamp: [0, dur], text: out.text }];
                const caps = buildCaptions(chunks, c.start, dur, s.wordsPerLine);
                setClips((cs) =>
                    cs.map((x) =>
                        x.id === c.id
                            ? { ...x, captions: caps, transcript: (out.text || "").trim(), title: x.titleEdited ? x.title : titleFromText(out.text, x.title) }
                            : x
                    )
                );
                ok++;
            }
            if (ok) toast(`Captions ready for ${ok} clip${ok > 1 ? "s" : ""}.`, "success");
        } catch (e) {
            toast(`Caption generation failed: ${e.message}`, "error");
        } finally {
            captionBusyRef.current = false;
            setCaptionJob(null);
        }
    };

    const generateClips = async () => {
        if (!meta || busy) return;
        if (clips.length && !window.confirm("Replace your current clips with a fresh set of highlights?")) return;
        const s = settings;
        const len = clamp(Number(s.clipLength) || 30, 3, 600);
        const count = s.allClips ? Infinity : Math.max(1, Math.floor(Number(s.clipCount) || 1));
        let picks;
        let hasAudio = true;
        try {
            setBusy({ label: "Decoding audio track…" });
            const samples = await ensureAudio();
            setBusy({ label: "Scoring highlights…" });
            await new Promise((r) => setTimeout(r, 30));
            const energy = computeEnergy(samples);
            setEnergyPreview(downsampleEnergy(energy));
            picks = findHighlights(energy, meta.duration, len, count);
        } catch (e) {
            hasAudio = false;
            toast(`${e.message}. Using evenly-spaced clips instead.`, "info");
            picks = evenlySpaced(meta.duration, len, count);
        }
        Object.values(exportsRef.current).forEach((e) => e?.url && URL.revokeObjectURL(e.url));
        setExportsState({});
        setExportQueue([]);
        const newClips = picks.map((p, i) => ({
            id: uid(),
            title: `Highlight ${i + 1}`,
            start: p.start,
            end: p.end,
            score: p.score,
            focusX: 0.5,
            captions: null,
            transcript: "",
            thumb: null,
            thumbKey: "",
            overlays: [],
        }));
        clipsRef.current = newClips;
        setClips(newClips);
        setSelectedId(newClips[0]?.id || null);
        setBusy(null);
        toast(`Created ${newClips.length} clip${newClips.length > 1 ? "s" : ""}.`, "success");
        setTimeout(() => scrollTo("clips"), 150);
        if (s.captions && hasAudio) transcribeClips(newClips);
    };

    const addClip = () => {
        if (!meta) return;
        const len = Math.min(meta.duration, clamp(Number(settings.clipLength) || 30, 3, 600));
        const t = editorVideoRef.current?.currentTime || 0;
        const start = clamp(t, 0, Math.max(0, meta.duration - len));
        const c = { id: uid(), title: `Custom clip ${clips.length + 1}`, start: +start.toFixed(2), end: +(start + len).toFixed(2), score: null, focusX: 0.5, captions: null, transcript: "", thumb: null, thumbKey: "", overlays: [] };
        setClips((cs) => [...cs, c]);
        setSelectedId(c.id);
    };

    const deleteClip = (id) => {
        const e = exportsRef.current[id];
        if (e?.url) URL.revokeObjectURL(e.url);
        setExportQueue((q) => q.filter((x) => x !== id));
        setClips((cs) => cs.filter((c) => c.id !== id));
        if (selectedId === id) setSelectedId(clips.find((c) => c.id !== id)?.id || null);
    };

    /* split one clip in two at the playhead */
    const splitClip = (clip) => {
        const t = editorVideoRef.current?.currentTime ?? curTime;
        if (t - clip.start < 1 || clip.end - t < 1) {
            toast("Move the playhead at least 1 second inside the clip to split it.", "error");
            return;
        }
        const cut = +t.toFixed(2);
        const first = {
            ...clip,
            end: cut,
            thumb: null,
            thumbKey: "",
            captions: clip.captions ? clip.captions.filter((c) => c.start < cut) : null,
            overlays: (clip.overlays || []).filter((o) => o.start < cut).map((o) => ({ ...o, end: Math.min(o.end, cut) })),
        };
        const second = {
            ...clip,
            id: uid(),
            title: `${clip.title} (2)`,
            start: cut,
            titleEdited: true,
            thumb: null,
            thumbKey: "",
            voice: undefined,
            score: null,
            captions: clip.captions ? clip.captions.filter((c) => c.end > cut) : null,
            overlays: (clip.overlays || []).filter((o) => o.end > cut).map((o) => ({ ...o, id: uid(), start: Math.max(o.start, cut) })),
        };
        const old = exportsRef.current[clip.id];
        if (old?.url) URL.revokeObjectURL(old.url);
        setExportsState((st) => ({ ...st, [clip.id]: { status: "idle", progress: 0 } }));
        setClips((cs) => cs.flatMap((c) => (c.id === clip.id ? [first, second] : [c])));
        toast("Clip split in two.", "success");
    };

    /* ---------- copyright-safe toolkit ---------- */
    const applySafeAudioPreset = () => {
        setSettings((s) => ({
            ...s,
            originalVolume: 0,
            musicTrack: s.musicTrack === "none" ? "lofi" : s.musicTrack,
            musicVolume: Math.max(s.musicVolume, 0.5),
        }));
        toast("Original audio muted and royalty-free music turned on. Pick another track under Audio & music.", "success");
    };

    const addOutroToAll = () => {
        if (!clips.length) {
            toast("Generate clips first.", "info");
            return;
        }
        setClips((cs) =>
            cs.map((c) => {
                const start = Math.max(c.start, c.end - 3);
                return { ...c, overlays: [...(c.overlays || []), { id: uid(), type: "text", text: "Follow for more!", start: +start.toFixed(2), end: c.end, x: 0.5, y: 0.45, size: 1.1, style: "violet", anim: "pop" }] };
            })
        );
        toast("Added a call-to-action ending to every clip. Edit it under Text & stickers.", "success");
    };

    const creditsText = () => buildCreditsText({ projectName: project?.name, settings, clips });

    const downloadCredits = () => {
        const blob = new Blob([creditsText()], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        downloadBlob(url, `${slugify(project?.name || "longtoshorts") || "longtoshorts"}-credits.txt`);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    };

    const copyCredits = async () => {
        try {
            await navigator.clipboard.writeText(creditsText());
            toast("Credits copied. Paste them into your video description.", "success");
        } catch {
            toast("Couldn't access the clipboard. Use the .txt download instead.", "error");
        }
    };

    /* ---------- exports ---------- */
    const queueExport = (ids) => {
        const fresh = ids.filter((id) => !exportQueue.includes(id));
        if (!fresh.length) return;
        setExportsState((st) => {
            const n = { ...st };
            fresh.forEach((id) => (n[id] = { ...(n[id] || {}), status: "queued", progress: 0 }));
            return n;
        });
        setExportQueue((q) => [...q, ...fresh]);
    };

    const cancelExports = () => {
        const current = exportQueue[0];
        setExportsState((st) => {
            const n = { ...st };
            exportQueue.forEach((id) => {
                if (id !== current && n[id]?.status === "queued") n[id] = { status: "idle", progress: 0 };
            });
            return n;
        });
        setExportQueue((q) => q.slice(0, 1));
        exportAbortRef.current?.abort();
    };

    useEffect(() => {
        if (exportBusyRef.current || !exportQueue.length || !videoUrl) return;
        const id = exportQueue[0];
        const clip = clipsRef.current.find((c) => c.id === id);
        if (!clip) {
            setExportQueue((q) => q.slice(1));
            return;
        }
        exportBusyRef.current = true;
        const ctrl = new AbortController();
        exportAbortRef.current = ctrl;
        const s = settingsRef.current;
        const pid = projectIdRef.current;
        let last = 0;
        setExportsState((st) => ({ ...st, [id]: { status: "rendering", progress: 0 } }));
        (async () => {
            try {
                const { blob, ext } = await renderClip({
                    src: videoUrl,
                    clip,
                    settings: s,
                    signal: ctrl.signal,
                    onProgress: (p) => {
                        const now = performance.now();
                        if (now - last < 250) return;
                        last = now;
                        setExportsState((st) => ({ ...st, [id]: { ...st[id], status: "rendering", progress: p } }));
                    },
                });
                if (projectIdRef.current !== pid) return;
                const url = URL.createObjectURL(blob);
                const idx = clipsRef.current.findIndex((c) => c.id === id);
                const name = `${slugify(projectRef.current?.name || "longtoshorts") || "longtoshorts"}-${String(idx + 1).padStart(2, "0")}-${slugify(clip.title) || "clip"}.${ext}`;
                setExportsState((st) => {
                    if (st[id]?.url) URL.revokeObjectURL(st[id].url);
                    return { ...st, [id]: { status: "done", progress: 1, url, name, size: blob.size } };
                });
                downloadBlob(url, name);
            } catch (e) {
                const cancelled = e.message === "cancelled";
                setExportsState((st) => ({ ...st, [id]: { status: cancelled ? "idle" : "error", progress: 0, error: e.message } }));
                if (!cancelled) toast(`Export failed: ${e.message}`, "error");
            } finally {
                exportBusyRef.current = false;
                exportAbortRef.current = null;
                setExportQueue((q) => q.filter((x) => x !== id));
            }
        })();
    }, [exportQueue, videoUrl, toast]);

    /* ---------- thumbnails (sequential background queue) ---------- */
    useEffect(() => {
        if (!videoUrl || thumbBusyRef.current || !thumbVideoRef.current) return;
        const keyOf = (c) =>
            `${c.start}|${c.focusX}|${settings.aspect}|${settings.layout}|${settings.filter}|${settings.brightness}|${settings.contrast}|${settings.saturation}|${settings.mirror}|${settings.zoom}|${settings.zoomAmount}`;
        const target = clips.find((c) => c.thumbKey !== keyOf(c));
        if (!target) return;
        thumbBusyRef.current = true;
        const key = keyOf(target);
        const pid = projectIdRef.current;
        let fired = false;
        const timer = setTimeout(async () => {
            fired = true;
            let thumb = target.thumb;
            try {
                thumb = await captureThumb(thumbVideoRef.current, target, settings);
            } catch {
                /* keep old thumb */
            }
            if (projectIdRef.current === pid) setClips((cs) => cs.map((c) => (c.id === target.id ? { ...c, thumb, thumbKey: key } : c)));
            thumbBusyRef.current = false;
            setThumbTick((t) => t + 1);
        }, 250);
        return () => {
            // Only release the lock if the capture hasn't started yet
            if (!fired) {
                clearTimeout(timer);
                thumbBusyRef.current = false;
            }
        };
    }, [clips, settings, videoUrl, thumbTick]);

    /* ---------- live preview (same renderer as export) ---------- */
    useEffect(() => {
        if (!videoUrl) return;
        let raf;
        const bg = document.createElement("canvas");
        const loop = () => {
            const cv = previewCanvasRef.current;
            const v = editorVideoRef.current;
            if (cv && v) {
                const s = settingsRef.current;
                const clip = clipsRef.current.find((c) => c.id === selectedIdRef.current);
                const { W, H } = getDims(s.aspect, 360);
                if (cv.width !== W || cv.height !== H) {
                    cv.width = W;
                    cv.height = H;
                }
                const t = v.currentTime;
                drawFrame(cv.getContext("2d"), v, W, H, buildFrameOpts(s, clip, t, bg));
                if (clip && !v.paused && t >= clip.end) {
                    v.pause();
                    v.currentTime = clip.start;
                }
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [videoUrl]);

    // Preview speed + original-audio volume follow the settings
    useEffect(() => {
        const v = editorVideoRef.current;
        if (!v) return;
        v.playbackRate = Number(settings.speed) || 1;
        v.volume = clamp(settings.originalVolume, 0, 1);
    }, [settings.speed, settings.originalVolume, videoUrl, project]);

    // Jump the editor to a newly selected clip
    useEffect(() => {
        const v = editorVideoRef.current;
        const c = clipsRef.current.find((x) => x.id === selectedId);
        if (!v || !c) return;
        v.pause();
        seekTo(v, c.start).catch(() => { });
    }, [selectedId, videoUrl]);

    const togglePlay = () => {
        const v = editorVideoRef.current;
        if (!v) return;
        if (v.paused) {
            if (selectedClip && (v.currentTime < selectedClip.start || v.currentTime >= selectedClip.end - 0.05)) v.currentTime = selectedClip.start;
            v.play().catch(() => { });
        } else v.pause();
    };

    const seekEditor = (t) => {
        const v = editorVideoRef.current;
        if (v) v.currentTime = t;
        setCurTime(t);
    };

    const setClipBounds = (clip, start, end) => {
        const d = meta?.duration || 0;
        let s = clamp(start, 0, d - 1);
        let e = clamp(end, s + 1, d);
        s = +s.toFixed(2);
        e = +e.toFixed(2);
        updateClip(clip.id, { start: s, end: e });
    };

    const sortedClips = useMemo(() => {
        const list = [...clips];
        if (sortMode === "time") list.sort((a, b) => a.start - b.start);
        else list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        return list;
    }, [clips, sortMode]);

    const scoreRange = useMemo(() => {
        const vals = clips.map((c) => c.score).filter((v) => v != null);
        return vals.length ? [Math.min(...vals), Math.max(...vals)] : [0, 1];
    }, [clips]);
    const displayScore = (s) => {
        if (s == null) return null;
        const [lo, hi] = scoreRange;
        return Math.round(hi - lo < 1e-6 ? 90 : 55 + (44 * (s - lo)) / (hi - lo));
    };

    const exporting = exportQueue.length > 0;
    const sourceIsWider = meta ? meta.width / meta.height > ASPECTS[settings.aspect].w / ASPECTS[settings.aspect].h + 0.01 : false;

    const navItems = [
        ["Home", "home"],
        ...(project ? [["Studio", "studio"]] : []),
        ...(projects.length ? [["Projects", "projects"]] : []),
        ...NAV_LINKS,
    ];

    const socials = [
        ["twitter", XIcon, "X (Twitter)"],
        ["instagram", Instagram, "Instagram"],
        ["youtube", Youtube, "YouTube"],
        ["github", Github, "GitHub"],
    ].filter(([k]) => SITE.social[k]);

    /* ================================ RENDER ================================ */

    return (
        <div className="min-h-screen overflow-hidden bg-[#fbfaff] text-[#10102d]">
            <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

            {/* NAVBAR */}
            <header className="sticky top-0 z-50 border-b border-violet-100/60 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 md:px-10 lg:px-14">
                    <a href="#home" className="flex items-center gap-2.5" aria-label={`${SITE.name} home`}>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl purple-gradient text-white shadow-lg shadow-violet-300/50">
                            <Play size={25} fill="white" strokeWidth={1.5} />
                        </div>
                        <Brand />
                    </a>

                    <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
                        {navItems.map(([label, id]) => (
                            <button key={id} onClick={() => scrollTo(id)} className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700">
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="hidden md:block">
                        <button onClick={() => (project ? scrollTo("studio") : scrollTo("upload"))} className="flex items-center gap-2 rounded-full purple-gradient px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/50 transition hover:scale-105">
                            <Zap size={17} fill="white" />
                            {project ? "Open Studio" : "100% Free"}
                        </button>
                    </div>

                    <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-xl border border-violet-100 p-2 md:hidden" aria-label="Toggle navigation" aria-expanded={mobileMenu}>
                        {mobileMenu ? <X size={23} /> : <Menu size={23} />}
                    </button>
                </div>

                {mobileMenu && (
                    <nav aria-label="Mobile navigation" className="absolute left-0 right-0 top-full border-b border-violet-100 bg-white p-5 shadow-xl md:hidden">
                        {[...navItems, ["Upload Video", "upload"]].map(([label, id]) => (
                            <button key={id} onClick={() => scrollTo(id)} className="block w-full rounded-xl px-4 py-3 text-left font-semibold text-slate-700 hover:bg-violet-50">
                                {label}
                            </button>
                        ))}
                    </nav>
                )}
            </header>

            <main>
                {/* HERO */}
                <section id="home" aria-labelledby="hero-title" className="hero-bg relative scroll-mt-20">
                    <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-5 pb-12 pt-14 md:px-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-8 lg:px-14 lg:pb-16 lg:pt-10">
                        <div className="relative z-10">
                            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-gradient-to-r from-orange-100 to-violet-100 px-4 py-2 text-sm font-bold text-[#24134c]">
                                <Sparkles size={16} className="text-violet-700" />
                                Free AI Shorts &amp; Reels Maker
                            </p>

                            <h1 id="hero-title" className="max-w-[750px] text-[38px] font-black leading-[1.08] tracking-[-1.5px] text-[#10102c] sm:text-5xl lg:text-[52px] xl:text-[58px]">
                                Convert Long Videos into <span className="gradient-text relative inline-block">Shorts &amp; Reels</span> — Free
                            </h1>

                            <p className="mt-6 max-w-[650px] text-lg font-medium leading-8 text-[#28264b] md:text-xl">
                                <strong>{SITE.name}</strong> turns your long video into viral YouTube Shorts, Instagram Reels and short clips with AI highlight detection and auto captions — <span className="font-extrabold text-violet-700">completely free</span>, no watermark, unlimited clips, and nothing uploaded to a server.
                            </p>

                            {/* UPLOAD AREA */}
                            <div
                                id="upload"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragging(true);
                                }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                className={`upload-area mt-7 scroll-mt-28 rounded-[25px] border-2 border-dashed p-7 text-center sm:p-8 ${dragging ? "border-violet-600 bg-violet-100" : "border-violet-400 bg-white/40"}`}
                            >
                                {importing ? (
                                    <div className="mx-auto max-w-sm py-4" role="status">
                                        <Loader2 size={42} className="mx-auto mb-3 animate-spin text-violet-600" />
                                        <p className="font-bold text-slate-800">{importing.label}</p>
                                        {importing.progress > 0 && <ProgressBar value={importing.progress} className="mt-3" />}
                                    </div>
                                ) : project ? (
                                    <div className="mx-auto max-w-md">
                                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                                            <Video size={30} />
                                        </div>
                                        <h2 className="break-all text-lg font-bold text-slate-900">{project.fileName}</h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {fmtBytes(project.fileSize)} · {fmtTime(meta?.duration)} · {meta?.width}×{meta?.height}
                                        </p>
                                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                                            <button onClick={() => fileInputRef.current?.click()} className="rounded-full border border-violet-200 bg-white px-5 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50">
                                                Upload another
                                            </button>
                                            <button onClick={() => scrollTo("studio")} className="rounded-full purple-gradient px-5 py-2 text-sm font-bold text-white">
                                                Open Studio <ArrowRight size={15} className="ml-1 inline" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud size={55} strokeWidth={2.1} className="mx-auto mb-2 text-violet-600" />
                                        <h2 className="text-xl font-extrabold text-[#141432]">Upload Your Long Video</h2>
                                        <p className="mt-1 text-sm text-slate-600 sm:text-base">Drag &amp; drop your video here or click to browse</p>
                                        <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">MP4, MOV, WebM, MKV — any length, any number of videos</p>
                                        <button onClick={() => fileInputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-full purple-gradient px-9 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/60 transition hover:scale-105">
                                            <Folder size={19} fill="white" />
                                            Choose File
                                        </button>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*,.mkv,.mov"
                                    className="hidden"
                                    aria-label="Choose a video file"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) openFile(f, f.name);
                                        e.target.value = "";
                                    }}
                                />
                            </div>

                            {/* URL UPLOAD */}
                            {!project && !importing && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-px flex-1 bg-violet-200" />
                                        <button onClick={() => setShowUrlInput(!showUrlInput)} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-violet-700" aria-expanded={showUrlInput}>
                                            <Link2 size={13} /> or paste a direct video link
                                        </button>
                                        <div className="h-px flex-1 bg-violet-200" />
                                    </div>
                                    {showUrlInput && (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                importFromUrl(videoUrlInput);
                                            }}
                                            className="mt-3 flex flex-col gap-2 sm:flex-row"
                                        >
                                            <input
                                                type="url"
                                                required
                                                placeholder="https://example.com/video.mp4"
                                                aria-label="Direct video link"
                                                value={videoUrlInput}
                                                onChange={(e) => setVideoUrlInput(e.target.value)}
                                                className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
                                            />
                                            <button type="submit" className="rounded-xl purple-gradient px-5 py-3 text-sm font-bold text-white">
                                                Import Link
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* SAMPLE VIDEOS */}
                            {!project && (
                                <div className="mt-7">
                                    <div className="mb-3 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500">Try with a sample video</span>
                                        <span className="text-xs text-violet-600">Free CC0 clips</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SAMPLE_VIDEOS.map((sample) => (
                                            <button
                                                key={sample.title}
                                                disabled={!!importing}
                                                onClick={() => importFromUrl(sample.url, `${sample.title.toLowerCase()}-sample.mp4`)}
                                                aria-label={`Try the ${sample.title} sample video`}
                                                className="group relative h-[78px] overflow-hidden rounded-xl bg-violet-900 disabled:opacity-60"
                                            >
                                                <video src={`${sample.url}#t=1.5`} muted playsInline preload="metadata" aria-hidden="true" className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/45" />
                                                <span className="absolute bottom-2 left-2 text-left text-xs font-bold text-white">
                                                    {sample.title}
                                                    <span className="block text-[10px] font-medium opacity-80">{sample.credit}</span>
                                                </span>
                                                <Play size={18} fill="white" className="absolute right-2 top-2 text-white opacity-80" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT HERO - VIDEO VISUAL */}
                        <div className="relative mx-auto w-full max-w-[680px] lg:pl-2">
                            <div className="absolute -right-5 top-0 h-60 w-60 rounded-full bg-violet-300/30 blur-3xl" />
                            <div className="absolute -top-10 left-4 z-10 hidden -rotate-6 text-xl font-bold italic text-[#19104d] sm:block" aria-hidden="true">
                                One Long Video...
                                <ArrowDown size={35} className="ml-24 mt-1 rotate-[-40deg] text-violet-700" />
                            </div>
                            <div className="video-card soft-shadow relative z-10 w-[68%] overflow-hidden rounded-[24px] border-[7px] border-white bg-white">
                                <div className="relative aspect-[1.1/0.8] overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&q=90"
                                        alt="Long 16:9 video being converted into short vertical clips with LongToShorts"
                                        width={1000}
                                        height={730}
                                        fetchPriority="high"
                                        decoding="async"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                        <div className="flex h-[65px] w-[65px] items-center justify-center rounded-full border-2 border-white bg-black/30 text-white backdrop-blur-sm">
                                            <Play size={32} fill="white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-10 text-xs text-white">
                                        <span className="flex items-center gap-2">
                                            <Play size={14} fill="white" />
                                            0:00 / 1:00:00
                                        </span>
                                        <span>HD</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute left-[65%] top-[44%] z-20 text-violet-700" aria-hidden="true">
                                <ArrowRight size={42} strokeWidth={2.5} />
                            </div>
                            <div className="absolute -right-1 -top-6 z-20 hidden rotate-[-5deg] text-lg font-bold italic text-[#19104d] sm:block" aria-hidden="true">Unlimited Shorts!</div>
                            <div className="absolute -right-1 top-[25%] flex w-[42%] gap-2 sm:right-0 sm:gap-3">
                                {[
                                    { image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&q=85", text: "Discover", color: "text-yellow-300", alt: "Vertical 9:16 short clip example – Discover" },
                                    { image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=85", text: "Travel More", color: "text-white", alt: "Vertical 9:16 Instagram Reel example – Travel More" },
                                    { image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=85", text: "Live Better", color: "text-pink-300", alt: "Vertical 9:16 YouTube Short example – Live Better" },
                                ].map((reel, index) => (
                                    <div key={index} className={`reel-card soft-shadow relative aspect-[0.57/1] min-w-0 flex-1 overflow-hidden rounded-[14px] border-[4px] border-white bg-white ${index === 1 ? "mt-4" : index === 2 ? "mt-8" : ""}`}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={reel.image} alt={reel.alt} width={400} height={700} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                                        <div className="absolute bottom-4 left-2 right-1">
                                            <p className={`text-[10px] font-black sm:text-xs ${reel.color}`}>{reel.text}</p>
                                            <p className="mt-1 text-[9px] font-semibold text-white">0:15</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ul className="relative z-20 ml-auto mt-14 flex w-fit flex-wrap items-center justify-center gap-4 rounded-full border border-violet-100 bg-white/90 px-5 py-4 text-xs font-bold text-[#24204a] shadow-lg sm:mt-20 sm:gap-6 sm:px-7 sm:text-sm">
                                {["Auto Captions", "Smart Cropping", "No Watermark"].map((t) => (
                                    <li key={t} className="flex items-center gap-1.5">
                                        <Check size={17} className="text-violet-600" />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* ============================== STUDIO ============================== */}
                {project && meta && (
                    <section id="studio" aria-label="Shorts studio" className="scroll-mt-20 border-y border-violet-100 bg-white py-10">
                        <div className="mx-auto max-w-[1500px] px-5 md:px-10 lg:px-14">
                            {/* hidden helper videos */}
                            <video ref={thumbVideoRef} src={videoUrl || undefined} muted playsInline preload="auto" className="offscreen-video" aria-hidden="true" />

                            {/* header */}
                            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                                        <Scissors size={13} /> Studio · saved on this device
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={project.name}
                                            onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
                                            className="w-full min-w-0 rounded-lg bg-transparent text-2xl font-black text-[#11112f] outline-none ring-violet-200 focus:ring-2 md:text-3xl"
                                            aria-label="Project name"
                                        />
                                        <Pencil size={16} className="shrink-0 text-slate-400" />
                                    </div>
                                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {fmtTime(meta.duration)}</span>
                                        <span className="flex items-center gap-1"><Film size={14} /> {meta.width}×{meta.height}</span>
                                        <span className="flex items-center gap-1"><HardDrive size={14} /> {fmtBytes(project.fileSize)}</span>
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-full border border-violet-200 px-4 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-50">
                                        <UploadCloud size={16} /> New video
                                    </button>
                                    <button onClick={resetStudio} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                                        <X size={16} /> Close
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                                {/* ---------------- SETTINGS ---------------- */}
                                <aside aria-label="Clip settings" className="h-fit space-y-6 rounded-[25px] border border-violet-100 bg-[#fcfaff] p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                                    <Field label="Clip length" icon={Clock}>
                                        <div className="flex flex-wrap gap-2">
                                            {CLIP_LENGTHS.map((l) => (
                                                <Chip key={l} active={Number(settings.clipLength) === l} onClick={() => setSetting("clipLength", l)}>
                                                    {l}s
                                                </Chip>
                                            ))}
                                            <div className="flex items-center gap-1 rounded-xl border border-violet-100 bg-white px-2">
                                                <input
                                                    type="number"
                                                    min={3}
                                                    max={600}
                                                    value={settings.clipLength}
                                                    onChange={(e) => setSetting("clipLength", e.target.value)}
                                                    className="w-12 bg-transparent py-2 text-xs font-bold outline-none"
                                                    aria-label="Custom clip length in seconds"
                                                />
                                                <span className="text-xs text-slate-400">s</span>
                                            </div>
                                        </div>
                                    </Field>

                                    <Field label="Number of clips" icon={InfinityIcon} hint="No quota — “All possible” makes as many clips as the video allows.">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                type="number"
                                                min={1}
                                                disabled={settings.allClips}
                                                value={settings.clipCount}
                                                onChange={(e) => setSetting("clipCount", e.target.value)}
                                                className="w-20 rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-violet-400 disabled:opacity-40"
                                                aria-label="Number of clips"
                                            />
                                            <Chip active={settings.allClips} onClick={() => setSetting("allClips", !settings.allClips)}>
                                                <span className="flex items-center gap-1"><InfinityIcon size={14} /> All possible</span>
                                            </Chip>
                                        </div>
                                    </Field>

                                    <Field label="Format" icon={Crop}>
                                        <div className="grid grid-cols-4 gap-2">
                                            {Object.entries(ASPECTS).map(([k, a]) => (
                                                <Chip key={k} active={settings.aspect === k} onClick={() => setSetting("aspect", k)} title={a.sub} className="px-1">
                                                    {a.label}
                                                </Chip>
                                            ))}
                                        </div>
                                    </Field>

                                    <Field label="Layout" icon={SlidersHorizontal}>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Chip active={settings.layout === "crop"} onClick={() => setSetting("layout", "crop")}>Smart crop</Chip>
                                            <Chip active={settings.layout === "blur"} onClick={() => setSetting("layout", "blur")}>Fit + blur</Chip>
                                        </div>
                                    </Field>

                                    <Field label="Export quality" icon={Film} hint={outputMime ? `Exports as ${outputMime.startsWith("video/mp4") ? "MP4" : "WebM"} in this browser.` : undefined}>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Chip active={settings.quality === "720"} onClick={() => setSetting("quality", "720")}>720p · faster</Chip>
                                            <Chip active={settings.quality === "1080"} onClick={() => setSetting("quality", "1080")}>1080p · sharper</Chip>
                                        </div>
                                    </Field>

                                    <div className="space-y-4 rounded-2xl border border-violet-100 bg-white p-4">
                                        <label className="flex cursor-pointer items-center justify-between">
                                            <span className="flex items-center gap-2 text-sm font-extrabold text-[#171535]">
                                                <Subtitles size={17} className="text-violet-600" /> Auto captions
                                            </span>
                                            <input type="checkbox" checked={settings.captions} onChange={(e) => setSetting("captions", e.target.checked)} className="h-5 w-5 accent-violet-600" />
                                        </label>
                                        {settings.captions && (
                                            <>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(CAPTION_STYLES).map(([k, st]) => (
                                                        <button
                                                            key={k}
                                                            onClick={() => setSetting("captionStyle", k)}
                                                            aria-pressed={settings.captionStyle === k}
                                                            aria-label={`Caption style: ${st.label}`}
                                                            className={`rounded-xl border-2 bg-slate-800 px-2 py-2 text-xs ${settings.captionStyle === k ? "border-violet-500" : "border-transparent"}`}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: st.fill,
                                                                    background: st.box || "transparent",
                                                                    fontFamily: st.font,
                                                                    fontWeight: st.weight,
                                                                    WebkitTextStroke: st.stroke ? `0.6px ${st.stroke}` : undefined,
                                                                    textTransform: st.upper ? "uppercase" : "none",
                                                                    padding: st.box ? "1px 6px" : 0,
                                                                    borderRadius: 4,
                                                                }}
                                                            >
                                                                {st.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <Field label={`Position · ${Math.round(settings.captionPos * 100)}%`} icon={Type}>
                                                    <input type="range" min={0.12} max={0.9} step={0.01} value={settings.captionPos} onChange={(e) => setSetting("captionPos", Number(e.target.value))} className="w-full" aria-label="Caption position" />
                                                </Field>
                                                <Field label={`Size · ${Math.round(settings.captionSize * 100)}%`}>
                                                    <input type="range" min={0.6} max={1.6} step={0.05} value={settings.captionSize} onChange={(e) => setSetting("captionSize", Number(e.target.value))} className="w-full" aria-label="Caption size" />
                                                </Field>
                                                <Field label={`Words per caption · ${settings.wordsPerLine}`} hint="Applies the next time captions are generated.">
                                                    <input type="range" min={1} max={8} step={1} value={settings.wordsPerLine} onChange={(e) => setSetting("wordsPerLine", Number(e.target.value))} className="w-full" aria-label="Words per caption" />
                                                </Field>
                                                <Field
                                                    label="Speech model"
                                                    icon={Cpu}
                                                    hint={
                                                        modelWeakForIndic
                                                            ? "⚠ Tiny/Base are very inaccurate for Hindi. Choose “Whisper Small” for good Hindi captions."
                                                            : "Open-source Whisper, runs locally. Use Multilingual for Hindi and other languages."
                                                    }
                                                >
                                                    <select value={settings.model} onChange={(e) => setSetting("model", e.target.value)} aria-label="Speech model" className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-violet-400">
                                                        {MODELS.map((m) => (
                                                            <option key={m.id} value={m.id}>{m.label}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                                <Field label="Language" hint="Select Hindi directly for best Hindi accuracy (Auto-detect often guesses Urdu or English for Hindi audio).">
                                                    <select value={settings.language} onChange={(e) => handleLanguageChange(e.target.value)} aria-label="Caption language" className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-violet-400">
                                                        {LANGUAGES.map(([v, l]) => (
                                                            <option key={v} value={v}>{l}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                            </>
                                        )}
                                    </div>

                                    {/* NEW: look, motion, audio */}
                                    <EffectsPanel settings={settings} setSetting={setSetting} filterSupported={filterSupported} />
                                    <AudioPanel settings={settings} setSetting={setSetting} onPreviewMusic={toggleMusicPreview} musicPreviewing={musicPreviewing} />

                                    <div>
                                        <button
                                            onClick={generateClips}
                                            disabled={!!busy}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl purple-gradient px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-violet-300/60 transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70"
                                        >
                                            {busy ? <Loader2 size={19} className="animate-spin" /> : <WandSparkles size={19} />}
                                            {busy ? busy.label : clips.length ? "Regenerate clips" : "Generate clips"}
                                        </button>
                                        {captionJob && (
                                            <div className="mt-3 rounded-xl bg-violet-50 p-3 text-xs text-violet-900" role="status">
                                                <div className="flex items-center gap-2 font-bold">
                                                    <Loader2 size={14} className="animate-spin" />
                                                    {captionJob.model ? `Downloading speech model (one-time)… ${Math.round(captionJob.model.pct * 100)}%` : captionJob.label}
                                                </div>
                                                <ProgressBar value={captionJob.model ? captionJob.model.pct : captionJob.done / Math.max(1, captionJob.total)} className="mt-2" />
                                            </div>
                                        )}
                                    </div>
                                </aside>

                                {/* ---------------- MAIN ---------------- */}
                                <div className="min-w-0 space-y-6">
                                    {/* timeline */}
                                    <div className="rounded-[25px] border border-violet-100 bg-[#fcfaff] p-4">
                                        <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                                            <span>Source timeline {energyPreview ? "· audio energy" : ""}</span>
                                            <span>{clips.length} clip{clips.length === 1 ? "" : "s"} · {fmtTime(meta.duration)}</span>
                                        </div>
                                        <svg
                                            viewBox="0 0 1000 60"
                                            preserveAspectRatio="none"
                                            role="img"
                                            aria-label="Source video timeline with audio energy and clip markers"
                                            className="h-16 w-full cursor-pointer rounded-xl bg-white"
                                            onClick={(e) => {
                                                const r = e.currentTarget.getBoundingClientRect();
                                                const t = ((e.clientX - r.left) / r.width) * meta.duration;
                                                const hit = clips.find((c) => t >= c.start && t <= c.end);
                                                if (hit) setSelectedId(hit.id);
                                                if (clips.length) seekEditor(t);
                                            }}
                                        >
                                            {(energyPreview || Array.from({ length: 160 }, () => 0.15)).map((v, i, arr) => {
                                                const w = 1000 / arr.length;
                                                const h = Math.max(2, v * 50);
                                                return <rect key={i} x={i * w} y={30 - h / 2} width={Math.max(1, w - 1)} height={h} fill="#c4b5fd" />;
                                            })}
                                            {clips.map((c) => (
                                                <rect
                                                    key={c.id}
                                                    x={(c.start / meta.duration) * 1000}
                                                    y={0}
                                                    width={Math.max(2, ((c.end - c.start) / meta.duration) * 1000)}
                                                    height={60}
                                                    fill={c.id === selectedId ? "rgba(124,58,237,0.45)" : "rgba(124,58,237,0.16)"}
                                                    stroke={c.id === selectedId ? "#6d28d9" : "none"}
                                                    strokeWidth={2}
                                                />
                                            ))}
                                            {clips.length > 0 && <rect x={(curTime / meta.duration) * 1000 - 1} y={0} width={2} height={60} fill="#111" />}
                                        </svg>
                                    </div>

                                    {/* editor or source preview */}
                                    {clips.length === 0 ? (
                                        <div className="rounded-[25px] border border-violet-100 bg-[#fcfaff] p-5">
                                            <video src={videoUrl || undefined} controls playsInline className="max-h-[440px] w-full rounded-2xl bg-black" />
                                            <div className="mt-5 flex flex-col items-center gap-3 text-center">
                                                <p className="max-w-lg text-sm text-slate-600">
                                                    Choose your settings and press <b>Generate clips</b>. {SITE.name} scans the audio for the most energetic, speech-dense moments and turns each into a ready-to-post short.
                                                </p>
                                                <button onClick={generateClips} disabled={!!busy} className="inline-flex items-center gap-2 rounded-full purple-gradient px-7 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/60 disabled:opacity-70">
                                                    {busy ? <Loader2 size={17} className="animate-spin" /> : <WandSparkles size={17} />}
                                                    {busy ? busy.label : "Generate clips"}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* editor is always mounted once clips exist so the preview loop has a source */}
                                    <div className={clips.length && selectedClip ? "rounded-[25px] border border-violet-100 bg-[#fcfaff] p-5" : "hidden"}>
                                        <video
                                            ref={editorVideoRef}
                                            src={videoUrl || undefined}
                                            playsInline
                                            preload="auto"
                                            className="offscreen-video"
                                            aria-hidden="true"
                                            onPlay={() => setPlaying(true)}
                                            onPause={() => {
                                                setPlaying(false);
                                                if (recorderRef.current) finishRecording();
                                            }}
                                            onTimeUpdate={(e) => setCurTime(e.currentTarget.currentTime)}
                                            onSeeked={(e) => setCurTime(e.currentTarget.currentTime)}
                                        />
                                        {selectedClip && (
                                            <div className="grid gap-6 xl:grid-cols-[auto_1fr]">
                                                {/* preview */}
                                                <div className="mx-auto w-full max-w-[340px] xl:w-[300px]">
                                                    <div className="relative overflow-hidden rounded-2xl bg-black shadow-xl shadow-violet-200">
                                                        <canvas ref={previewCanvasRef} className="block h-auto w-full" aria-label="Live short preview" />
                                                        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center opacity-0 transition hover:opacity-100 focus-visible:opacity-100" aria-label={playing ? "Pause" : "Play"}>
                                                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur">
                                                                {playing ? <Pause size={26} fill="white" /> : <Play size={26} fill="white" />}
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <button onClick={togglePlay} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full purple-gradient text-white" aria-label={playing ? "Pause" : "Play"}>
                                                            {playing ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
                                                        </button>
                                                        <input
                                                            type="range"
                                                            min={selectedClip.start}
                                                            max={selectedClip.end}
                                                            step={0.05}
                                                            value={clamp(curTime, selectedClip.start, selectedClip.end)}
                                                            onChange={(e) => seekEditor(Number(e.target.value))}
                                                            className="w-full"
                                                            aria-label="Seek within clip"
                                                        />
                                                        <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">
                                                            {fmtTime(clamp(curTime - selectedClip.start, 0, 1e9))}/{fmtTime(selectedClip.end - selectedClip.start)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-[11px] leading-4 text-slate-500">The preview plays the original sound. Music and voiceover are mixed in when you export.</p>
                                                </div>

                                                {/* controls */}
                                                <div className="min-w-0 space-y-5">
                                                    <input
                                                        value={selectedClip.title}
                                                        onChange={(e) => updateClip(selectedClip.id, { title: e.target.value, titleEdited: true })}
                                                        className="w-full rounded-xl border border-violet-100 bg-white px-4 py-3 text-lg font-extrabold text-[#171535] outline-none focus:border-violet-400"
                                                        aria-label="Clip title"
                                                    />

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        {[
                                                            ["Start", "start"],
                                                            ["End", "end"],
                                                        ].map(([label, key]) => (
                                                            <div key={key} className="rounded-2xl border border-violet-100 bg-white p-3">
                                                                <div className="mb-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">{label}</div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => setClipBounds(selectedClip, key === "start" ? selectedClip.start - 1 : selectedClip.start, key === "end" ? selectedClip.end - 1 : selectedClip.end)}
                                                                        className="rounded-lg bg-violet-50 px-2 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100"
                                                                        aria-label={`${label} minus 1 second`}
                                                                    >
                                                                        −1s
                                                                    </button>
                                                                    <span className="flex-1 text-center text-base font-black tabular-nums">{fmtTimePrecise(selectedClip[key])}</span>
                                                                    <button
                                                                        onClick={() => setClipBounds(selectedClip, key === "start" ? selectedClip.start + 1 : selectedClip.start, key === "end" ? selectedClip.end + 1 : selectedClip.end)}
                                                                        className="rounded-lg bg-violet-50 px-2 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100"
                                                                        aria-label={`${label} plus 1 second`}
                                                                    >
                                                                        +1s
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const t = editorVideoRef.current?.currentTime ?? curTime;
                                                                        if (key === "start") setClipBounds(selectedClip, t, Math.max(selectedClip.end, t + 1));
                                                                        else setClipBounds(selectedClip, Math.min(selectedClip.start, t - 1), t);
                                                                    }}
                                                                    className="mt-2 w-full rounded-lg border border-violet-100 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-300"
                                                                >
                                                                    Set to playhead
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <button onClick={() => splitClip(selectedClip)} className="flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50">
                                                        <SplitSquareHorizontal size={14} /> Split clip at playhead
                                                    </button>

                                                    {settings.layout === "crop" && sourceIsWider && (
                                                        <Field label={`Horizontal framing · ${Math.round((selectedClip.focusX ?? 0.5) * 100)}%`} icon={Crop} hint="Slide to keep the speaker in frame.">
                                                            <div className="flex items-center gap-3">
                                                                <input type="range" min={0} max={1} step={0.01} value={selectedClip.focusX ?? 0.5} onChange={(e) => updateClip(selectedClip.id, { focusX: Number(e.target.value) })} className="w-full" aria-label="Horizontal framing" />
                                                                <button onClick={() => updateClip(selectedClip.id, { focusX: 0.5 })} className="rounded-lg border border-violet-100 px-2 py-1 text-xs font-semibold text-slate-600" title="Center" aria-label="Center framing">
                                                                    <RotateCcw size={13} />
                                                                </button>
                                                            </div>
                                                        </Field>
                                                    )}

                                                    {/* captions editor */}
                                                    <div className="rounded-2xl border border-violet-100 bg-white p-4">
                                                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                            <span className="flex items-center gap-2 text-sm font-extrabold">
                                                                <Subtitles size={16} className="text-violet-600" /> Captions
                                                                {selectedClip.captions && <span className="text-xs font-semibold text-slate-400">({selectedClip.captions.length} lines)</span>}
                                                            </span>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={() => addCaptionLine(selectedClip)}
                                                                    className="flex items-center gap-1 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50"
                                                                >
                                                                    <Plus size={13} /> Add line
                                                                </button>
                                                                <button
                                                                    onClick={() => transcribeClips([selectedClip])}
                                                                    disabled={!!captionJob}
                                                                    className="flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200 disabled:opacity-50"
                                                                >
                                                                    {captionJob?.current === selectedClip.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                                                    {selectedClip.captions ? "Re-transcribe" : "Generate"}
                                                                </button>
                                                                {selectedClip.captions && (
                                                                    <button onClick={() => updateClip(selectedClip.id, { captions: null })} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50">
                                                                        Clear
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!settings.captions && <p className="mb-2 text-xs text-amber-700">Captions are turned off in settings, so they won&apos;t be burned into exports.</p>}
                                                        {selectedClip.captions?.length ? (
                                                            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                                                                {selectedClip.captions
                                                                    .filter((c) => c.end > selectedClip.start && c.start < selectedClip.end)
                                                                    .map((c) => {
                                                                        const active = curTime >= c.start && curTime < c.end;
                                                                        return (
                                                                            <div key={c.id} className={`flex items-center gap-2 rounded-lg px-2 py-1 ${active ? "bg-violet-100" : ""}`}>
                                                                                <button onClick={() => seekEditor(c.start)} className="w-12 shrink-0 text-left text-[11px] font-semibold tabular-nums text-violet-600 hover:underline">
                                                                                    {fmtTime(c.start - selectedClip.start)}
                                                                                </button>
                                                                                <input
                                                                                    value={c.text}
                                                                                    aria-label="Caption text"
                                                                                    onChange={(e) => updateClip(selectedClip.id, { captions: selectedClip.captions.map((x) => (x.id === c.id ? { ...x, text: e.target.value } : x)) })}
                                                                                    className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm outline-none hover:border-violet-100 focus:border-violet-300 focus:bg-white"
                                                                                />
                                                                                <button onClick={() => updateClip(selectedClip.id, { captions: selectedClip.captions.filter((x) => x.id !== c.id) })} className="text-slate-300 hover:text-red-500" aria-label="Delete caption line">
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs leading-5 text-slate-500">
                                                                No captions yet. Press <b>Generate</b> to transcribe locally with Whisper (supports Hindi &amp; 99 languages), or press <b>Add line</b> to type your own captions.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* NEW: overlays + voiceover */}
                                                    <OverlayEditor
                                                        clip={selectedClip}
                                                        updateClip={updateClip}
                                                        getPlayhead={() => editorVideoRef.current?.currentTime ?? curTime}
                                                    />
                                                    <VoiceoverCard
                                                        clip={selectedClip}
                                                        recording={recordingId === selectedClip.id}
                                                        disabled={!!recordingId}
                                                        onToggle={toggleRecording}
                                                        onDelete={() => updateClip(selectedClip.id, { voice: undefined })}
                                                    />

                                                    <ExportButton state={exportsState[selectedClip.id]} onExport={() => queueExport([selectedClip.id])} large />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* NEW: copyright-safe toolkit */}
                                    <CopyrightKit
                                        settings={settings}
                                        setSetting={setSetting}
                                        onSafePreset={applySafeAudioPreset}
                                        onDownloadCredits={downloadCredits}
                                        onCopyCredits={copyCredits}
                                        onOutroAll={addOutroToAll}
                                    />

                                    {/* clips grid */}
                                    {clips.length > 0 && (
                                        <div id="clips" className="scroll-mt-24">
                                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <h2 className="text-xl font-black text-[#11112f]">
                                                    Your clips <span className="text-violet-600">({clips.length})</span>
                                                </h2>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="flex rounded-full border border-violet-100 bg-white p-1 text-xs font-bold">
                                                        {[
                                                            ["score", "Best first"],
                                                            ["time", "Timeline"],
                                                        ].map(([k, l]) => (
                                                            <button key={k} onClick={() => setSortMode(k)} aria-pressed={sortMode === k} className={`rounded-full px-3 py-1.5 ${sortMode === k ? "bg-violet-600 text-white" : "text-slate-600"}`}>
                                                                {l}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button onClick={addClip} className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50">
                                                        <Plus size={14} /> Add clip
                                                    </button>
                                                    {settings.captions && (
                                                        <button
                                                            onClick={() => transcribeClips(clips.filter((c) => !c.captions))}
                                                            disabled={!!captionJob || clips.every((c) => c.captions)}
                                                            className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-50 disabled:opacity-40"
                                                        >
                                                            <Subtitles size={14} /> Caption all
                                                        </button>
                                                    )}
                                                    {exporting ? (
                                                        <button onClick={cancelExports} className="flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                                                            <Square size={12} fill="currentColor" /> Stop exports ({exportQueue.length})
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => queueExport(sortedClips.map((c) => c.id))} className="flex items-center gap-1.5 rounded-full purple-gradient px-4 py-2 text-xs font-bold text-white shadow-md">
                                                            <Download size={14} /> Export all
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {exporting && (
                                                <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="status">
                                                    <Info size={16} className="mt-0.5 shrink-0" />
                                                    Exporting renders in real time (a 30s clip takes ~30s at 1× speed). Keep this tab open and visible — browsers pause background tabs. Your browser may ask once to allow multiple downloads.
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-5">
                                                {sortedClips.map((c, i) => {
                                                    const ex = exportsState[c.id];
                                                    const sc = displayScore(c.score);
                                                    const ratio = ASPECTS[settings.aspect];
                                                    return (
                                                        <div
                                                            key={c.id}
                                                            className={`group overflow-hidden rounded-2xl border-2 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 ${c.id === selectedId ? "border-violet-500" : "border-violet-100"}`}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedId(c.id);
                                                                    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
                                                                }}
                                                                aria-label={`Edit clip ${i + 1}: ${c.title}`}
                                                                className="relative block w-full overflow-hidden bg-slate-900"
                                                                style={{ aspectRatio: `${ratio.w}/${ratio.h}`, maxHeight: 340 }}
                                                            >
                                                                {c.thumb ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={c.thumb} alt={c.title} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center">
                                                                        <Loader2 className="animate-spin text-violet-300" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                                                                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">#{i + 1}</span>
                                                                {sc != null && (
                                                                    <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-black text-white" title="Highlight score (audio energy & speech activity)">
                                                                        <Zap size={10} fill="white" /> {sc}
                                                                    </span>
                                                                )}
                                                                <span className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-bold text-white">
                                                                    <span>{fmtTime(c.start)}</span>
                                                                    <span className="rounded bg-black/50 px-1.5">{fmtTime(c.end - c.start)}</span>
                                                                </span>
                                                                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                                                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-violet-700">
                                                                        <Pencil size={18} />
                                                                    </span>
                                                                </span>
                                                            </button>
                                                            <div className="p-3">
                                                                <p className="line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-5 text-[#171535]">{c.title}</p>
                                                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                                                                    {c.captions ? (
                                                                        <span className="flex items-center gap-1 text-emerald-600"><CircleCheck size={12} /> Captions</span>
                                                                    ) : captionJob?.current === c.id ? (
                                                                        <span className="flex items-center gap-1 text-violet-600"><Loader2 size={12} className="animate-spin" /> Transcribing</span>
                                                                    ) : (
                                                                        <span>No captions</span>
                                                                    )}
                                                                    {c.overlays?.length > 0 && <span className="flex items-center gap-1 text-violet-600"><Layers size={12} /> {c.overlays.length}</span>}
                                                                    {c.voice && <span className="flex items-center gap-1 text-violet-600"><Mic size={12} /> Voice</span>}
                                                                </div>
                                                                <div className="mt-3 flex items-center gap-2">
                                                                    <ExportButton state={ex} onExport={() => queueExport([c.id])} />
                                                                    <button onClick={() => deleteClip(c.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-500" aria-label="Delete clip">
                                                                        <Trash2 size={15} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ============================== VOICE CHANGER ============================== */}
                <section id="voice-editor" aria-labelledby="voice-title" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:px-10">
                    <div className="mx-auto mb-10 max-w-2xl text-center">
                        <p className="inline-block rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">
                            Free AI Audio Tools
                        </p>
                        <h2 id="voice-title" className="mt-5 text-3xl font-black text-[#11112f] md:text-4xl">
                            Customize Your Voice with <span className="gradient-text">Voice Editor</span>
                        </h2>
                        <p className="mt-4 text-slate-600">
                            Change pitch, adjust tone, add effects and create your own unique audio style.
                        </p>
                    </div>
                    <VoiceEditor />
                </section>

                {/* ============================== PROJECTS ============================== */}
                {projects.length > 0 && (
                    <section id="projects" aria-labelledby="projects-title" className="mx-auto max-w-[1500px] scroll-mt-20 px-5 py-14 md:px-10 lg:px-14">
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 id="projects-title" className="text-3xl font-black text-[#11112f]">
                                    My <span className="gradient-text">Projects</span>
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">Saved privately in this browser. Nothing is uploaded.</p>
                            </div>
                            {storageInfo?.quota ? (
                                <div className="w-full max-w-xs text-xs text-slate-500">
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="flex items-center gap-1"><Database size={12} /> Local storage</span>
                                        <span>{fmtBytes(storageInfo.usage)} / {fmtBytes(storageInfo.quota)}</span>
                                    </div>
                                    <ProgressBar value={storageInfo.usage / storageInfo.quota} />
                                </div>
                            ) : null}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {projects.map((p) => {
                                const thumb = p.clips?.find((c) => c.thumb)?.thumb;
                                const isOpen = project?.id === p.id;
                                return (
                                    <div key={p.id} className={`overflow-hidden rounded-2xl border-2 bg-white ${isOpen ? "border-violet-500" : "border-violet-100"}`}>
                                        <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-[#100747] to-[#4400b9]">
                                            {thumb ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={thumb} alt="" className="h-full w-full object-cover opacity-90" />
                                            ) : (
                                                <Film size={36} className="text-violet-300" />
                                            )}
                                            {isOpen && <span className="absolute left-2 top-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">Open</span>}
                                        </div>
                                        <div className="p-4">
                                            <p className="truncate font-extrabold text-[#171535]">{p.name}</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {p.clips?.length || 0} clips · {fmtTime(p.meta?.duration)} · {fmtBytes(p.fileSize)}
                                            </p>
                                            <p className="text-[11px] text-slate-400">{new Date(p.updatedAt || p.createdAt).toLocaleString()}</p>
                                            <div className="mt-3 flex gap-2">
                                                <button onClick={() => (isOpen ? scrollTo("studio") : openProject(p))} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl purple-gradient py-2 text-xs font-bold text-white">
                                                    <FolderOpen size={14} /> {isOpen ? "Go to studio" : "Open"}
                                                </button>
                                                <button onClick={() => deleteProject(p)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:border-red-200 hover:text-red-500" aria-label={`Delete ${p.name}`}>
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* FEATURES */}
                <section id="features" aria-labelledby="features-title" className="relative z-20 mx-auto mt-10 max-w-[1500px] scroll-mt-24 px-4 md:px-8 lg:px-10">
                    <h2 id="features-title" className="sr-only">{SITE.name} features: free AI video to shorts converter</h2>
                    <div className="grid grid-cols-2 overflow-hidden rounded-[25px] border border-violet-100 bg-white/90 shadow-sm md:grid-cols-3 lg:grid-cols-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className={`feature-card flex flex-col items-center justify-center px-3 py-7 text-center ${index !== 0 ? "border-l border-violet-100" : ""}`}>
                                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}>
                                        <Icon size={31} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-sm font-extrabold text-[#171535] sm:text-base">{feature.title}</h3>
                                    <p className="mt-2 max-w-[180px] text-xs leading-5 text-slate-600 sm:text-sm">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" aria-labelledby="how-title" className="relative mx-auto max-w-[1500px] scroll-mt-20 px-5 py-20 md:px-10 lg:px-14">
                    <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_2.1fr]">
                        <div>
                            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">
                                <Sparkles size={15} />
                                Simple 4-Step Process
                            </p>
                            <h2 id="how-title" className="text-4xl font-black tracking-tight text-[#11112f] md:text-5xl">
                                How to Convert a Long Video to <span className="gradient-text">Shorts</span>
                            </h2>
                            <p className="mt-4 max-w-sm text-base leading-7 text-slate-600">Get your Shorts and Reels in four simple steps. No complex editing skills required.</p>
                        </div>
                        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <li key={step.number} className="relative flex min-h-[190px] flex-col items-center justify-center rounded-[25px] border border-violet-200 bg-gradient-to-b from-white to-violet-50 p-6 text-center transition hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-100">
                                        <div className="absolute -top-3 flex h-8 w-8 items-center justify-center rounded-full purple-gradient text-sm font-black text-white shadow-md" aria-hidden="true">{index + 1}</div>
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                                            <Icon size={34} strokeWidth={2.3} />
                                        </div>
                                        <h3 className="text-base font-extrabold text-[#171535]">{step.title}</h3>
                                        <p className="mt-2 text-sm leading-5 text-slate-600">{step.description}</p>
                                        {index !== 3 && <ArrowRight size={22} className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 text-violet-600 lg:block" aria-hidden="true" />}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </section>

                {/* UNLIMITED BANNER */}
                <section aria-labelledby="unlimited-title" className="mx-auto max-w-[1500px] px-5 pb-20 md:px-10 lg:px-14">
                    <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#100747] via-[#211078] to-[#4400b9] px-7 py-12 text-white shadow-2xl shadow-violet-300/40 md:px-14 md:py-14">
                        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
                        <div className="absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
                        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                            <div>
                                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold">
                                    <InfinityIcon size={19} />
                                    No Artificial Limits
                                </p>
                                <h2 id="unlimited-title" className="text-3xl font-black leading-tight md:text-5xl">
                                    Truly Unlimited.
                                    <br />
                                    <span className="text-violet-300">Just for You.</span>
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-7 text-violet-100 md:text-lg">
                                    No subscriptions. No paid AI APIs. No server. Upload and generate as many videos and clips as your device can process. Your creativity should never have a monthly limit.
                                </p>
                                <button onClick={() => scrollTo(project ? "studio" : "upload")} className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-black/20 transition hover:scale-105">
                                    <Zap size={17} fill="white" />
                                    Start Now — It&apos;s Free
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: InfinityIcon, title: "Unlimited", text: "Video processing" },
                                    { icon: Ban, title: "No Watermark", text: "Clean exports" },
                                    { icon: Code2, title: "Open Source", text: "Free AI models" },
                                    { icon: ShieldCheck, title: "Private", text: "Never leaves your device" },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.title} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                                            <Icon size={29} className="mb-4 text-violet-300" />
                                            <h3 className="font-extrabold">{item.title}</h3>
                                            <p className="mt-1 text-xs text-violet-200">{item.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* EXTRA FEATURES */}
                <section aria-labelledby="tools-title" className="bg-white py-20">
                    <div className="mx-auto max-w-[1250px] px-5 md:px-10">
                        <div className="mx-auto mb-12 max-w-2xl text-center">
                            <p className="inline-block rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">Powerful Tools</p>
                            <h2 id="tools-title" className="mt-6 text-3xl font-black text-[#11112f] md:text-4xl">
                                Everything You Need to Create <span className="gradient-text">Better Shorts</span>
                            </h2>
                            <p className="mt-4 text-slate-600">Create professional short-form content from long videos without expensive editing software.</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                { icon: Subtitles, title: "Automatic Captions", desc: "Speech-to-text with open-source Whisper running locally in your browser — Hindi, English and 99 languages, fully editable." },
                                { icon: Crop, title: "Smart Vertical Cropping", desc: "Reframe landscape 16:9 footage to 9:16 with a framing slider, or fit it on a blurred background." },
                                { icon: Sparkles, title: "AI Highlight Detection", desc: "Scores every moment by loudness, speech activity and energy, then picks the best non-overlapping clips." },
                                { icon: Video, title: "Multiple Video Formats", desc: "Export 9:16, 4:5, 1:1 and 16:9 at 720p or 1080p." },
                                { icon: Download, title: "Batch Downloads", desc: "Export every clip with one click — files download automatically as they finish." },
                                { icon: Database, title: "Local Project Library", desc: "Projects and source videos are saved in your browser, so you can come back and keep editing." },
                                { icon: Music, title: "Royalty-Free Music", desc: "Five original background tracks generated in your browser, with volume control and a one-click switch that mutes third-party audio." },
                                { icon: Layers, title: "Text, Stickers & Effects", desc: "Animated text, emoji stickers, filters, speed, slow zoom, fades, progress bar and your own brand tag." },
                                { icon: Mic, title: "Voiceover & Credits", desc: "Record narration over any clip, split clips at the playhead and download a credits file for your description." },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <article key={item.title} className="rounded-3xl border border-violet-100 bg-[#fcfaff] p-7 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100">
                                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                                            <Icon size={29} />
                                        </div>
                                        <h3 className="text-lg font-extrabold text-[#171535]">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.desc}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* USE CASES */}
                <section id="use-cases" aria-labelledby="use-title" className="mx-auto max-w-[1250px] scroll-mt-20 px-5 py-20 md:px-10">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <p className="inline-block rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">Made for Creators</p>
                        <h2 id="use-title" className="mt-6 text-3xl font-black text-[#11112f] md:text-4xl">
                            Free Video to Shorts Converter for <span className="gradient-text">Every Platform</span>
                        </h2>
                        <p className="mt-4 text-slate-600">From YouTube Shorts to WhatsApp Status — repurpose one long video into content for every feed.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {USE_CASES.map((u) => (
                            <article key={u.title} className="rounded-3xl border border-violet-100 bg-white p-7">
                                <h3 className="text-lg font-extrabold text-[#171535]">{u.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600">{u.text}</p>
                            </article>
                        ))}
                    </div>
                    <div className="mx-auto mt-12 max-w-3xl text-sm leading-7 text-slate-600">
                        <h3 className="mb-2 text-lg font-extrabold text-[#171535]">What is {SITE.name}?</h3>
                        <p>
                            {SITE.name} ({SITE.domain}) is a free long video to shorts converter that runs entirely in your browser. Upload a podcast, interview, lecture, vlog or YouTube video, and the AI finds the most engaging moments, reframes them to vertical 9:16, adds editable auto captions and exports watermark-free clips ready for YouTube Shorts, Instagram Reels, Facebook Reels and WhatsApp Status. Because processing happens on your own device, your footage stays private and there are no upload limits, subscriptions or paid APIs.
                        </p>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-[1000px] scroll-mt-20 px-5 pb-20 md:px-10">
                    <div className="mb-10 text-center">
                        <p className="inline-block rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">Got Questions?</p>
                        <h2 id="faq-title" className="mt-6 text-3xl font-black text-[#11112f] md:text-4xl">
                            Frequently Asked <span className="gradient-text">Questions</span>
                        </h2>
                        <p className="mt-3 text-slate-600">Everything you need to know about {SITE.name}.</p>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map((faq, index) => (
                            <div key={faq.question} className="overflow-hidden rounded-2xl border border-violet-100 bg-white">
                                <h3>
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}
                                        aria-expanded={activeFaq === index}
                                        aria-controls={`faq-panel-${index}`}
                                        id={`faq-btn-${index}`}
                                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                    >
                                        <span className="font-bold text-[#171535]">{faq.question}</span>
                                        <ChevronDown size={20} className={`shrink-0 text-violet-600 transition ${activeFaq === index ? "rotate-180" : ""}`} aria-hidden="true" />
                                    </button>
                                </h3>
                                {/* Always in the DOM (hidden when closed) so the answers stay in the HTML crawlers receive */}
                                <div
                                    id={`faq-panel-${index}`}
                                    role="region"
                                    aria-labelledby={`faq-btn-${index}`}
                                    hidden={activeFaq !== index}
                                    className="border-t border-violet-50 px-6 py-5 text-sm leading-7 text-slate-600"
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer className="bg-[#100b35] text-white">
                <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-10 lg:px-14">
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <a href="#home" className="flex items-center gap-3" aria-label={`${SITE.name} home`}>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl purple-gradient">
                                    <Play size={25} fill="white" />
                                </div>
                                <Brand light />
                            </a>
                            <p className="mt-5 max-w-md text-sm leading-7 text-violet-200">
                                {SITE.name} converts long videos into Shorts, Reels and short clips using open-source AI that runs on your own device. Create more content, spend less time editing and keep your creativity unlimited.
                            </p>
                            {socials.length > 0 && (
                                <div className="mt-6 flex gap-3">
                                    {socials.map(([key, Icon, label]) => (
                                        <a
                                            key={key}
                                            href={SITE.social[key]}
                                            target="_blank"
                                            rel="noopener noreferrer me"
                                            aria-label={`${SITE.name} on ${label}`}
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-violet-200 transition hover:bg-violet-600 hover:text-white"
                                        >
                                            <Icon size={19} />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <nav aria-label="Product">
                            <h3 className="mb-5 font-extrabold">Product</h3>
                            <div className="space-y-3 text-sm text-violet-200">
                                {[
                                    ["Features", "features"],
                                    ["Voice Changer", "voice-editor"],
                                    ["How It Works", "how-it-works"],
                                    ["Use Cases", "use-cases"],
                                    ["Get Started", "upload"],
                                    ["FAQ", "faq"],
                                ].map(([l, id]) => (
                                    <button key={id} onClick={() => scrollTo(id)} className="block hover:text-white">
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </nav>

                        <div className="space-y-10">
                            <nav aria-label="Company">
                                <h3 className="mb-5 font-extrabold">Company</h3>
                                <div className="space-y-3 text-sm text-violet-200">
                                    <a href="/about" className="block hover:text-white">About</a>
                                    <a href="/contact" className="block hover:text-white">Contact</a>
                                    <a href="/privacy" className="block hover:text-white">Privacy Policy</a>
                                    <a href="/terms" className="block hover:text-white">Terms of Service</a>
                                </div>
                            </nav>

                        </div>
                    </div>

                    <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-xs text-violet-300 md:flex-row">
                        <p>© {year ?? SITE.year} {SITE.name} · {SITE.domain}. All rights reserved.</p>
                        <p className="flex items-center gap-1.5">
                            Made with <Heart size={13} fill="#a78bfa" className="text-violet-400" /> for creators.
                        </p>
                        <p>Free. Open Source. Unlimited Creativity.</p>
                    </div>
                </div>
            </footer>

            {/* TOASTS */}
            <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(420px,calc(100vw-32px))] flex-col gap-2" aria-live="polite">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role={t.type === "error" ? "alert" : "status"}
                        className={`toast-in pointer-events-auto flex items-start gap-2 rounded-2xl border p-4 text-sm shadow-xl ${t.type === "error" ? "border-red-200 bg-red-50 text-red-800" : t.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-violet-200 bg-white text-slate-800"
                            }`}
                    >
                        {t.type === "error" ? <CircleAlert size={18} className="mt-0.5 shrink-0" /> : t.type === "success" ? <CircleCheck size={18} className="mt-0.5 shrink-0" /> : <Info size={18} className="mt-0.5 shrink-0 text-violet-600" />}
                        <span className="flex-1">{t.msg}</span>
                        <button onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} className="opacity-50 hover:opacity-100" aria-label="Dismiss">
                            <X size={15} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ExportButton({ state, onExport, large = false }) {
    const base = large ? "w-full rounded-2xl py-3.5 text-sm" : "flex-1 rounded-xl py-2 text-xs";
    if (state?.status === "rendering")
        return (
            <div className={`${large ? "w-full" : "flex-1"} rounded-xl border border-violet-100 bg-violet-50 px-3 py-2`}>
                <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-violet-700">
                    <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Rendering</span>
                    <span>{Math.round((state.progress || 0) * 100)}%</span>
                </div>
                <ProgressBar value={state.progress} />
            </div>
        );
    if (state?.status === "queued")
        return (
            <div className={`${base} flex items-center justify-center gap-1.5 border border-violet-100 font-bold text-slate-500`}>
                <Clock size={13} /> Queued
            </div>
        );
    if (state?.status === "done")
        return (
            <div className={`flex ${large ? "w-full" : "flex-1"} gap-2`}>
                <a href={state.url} download={state.name} className={`${base} flex flex-1 items-center justify-center gap-1.5 bg-emerald-500 font-bold text-white hover:bg-emerald-600`} title={`${state.name} · ${fmtBytes(state.size)}`}>
                    <Download size={14} /> {large ? `Download (${fmtBytes(state.size)})` : "Save"}
                </a>
                <button onClick={onExport} className={`${large ? "rounded-2xl px-4" : "rounded-xl px-2.5"} border border-violet-100 text-violet-700 hover:bg-violet-50`} title="Export again with current settings" aria-label="Re-export">
                    <RotateCcw size={14} />
                </button>
            </div>
        );
    return (
        <button onClick={onExport} className={`${base} flex items-center justify-center gap-1.5 purple-gradient font-bold text-white shadow-md shadow-violet-200 transition hover:brightness-110`}>
            <Download size={14} /> {state?.status === "error" ? "Retry export" : large ? "Export clip (no watermark)" : "Export"}
        </button>
    );
}