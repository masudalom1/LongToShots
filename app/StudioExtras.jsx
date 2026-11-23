"use client";
import { useEffect, useState } from "react";
import {
    Wand2,
    Music,
    Mic,
    Square,
    Play,
    Trash2,
    Plus,
    Type,
    Smile,
    ShieldCheck,
    Download,
    Copy,
    ExternalLink,
    ChevronDown,
    Info,
    Volume2,
    Flag,
} from "lucide-react";
import {
    FILTERS,
    SPEEDS,
    BRAND_POSITIONS,
    STICKERS,
    MUSIC_TRACKS,
    CAPTION_STYLES,
    clamp,
    uid,
    fmtBytes,
} from "./engine";

/* Small shared bits (kept local so this file has no circular import with the page) */

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

function Label({ children, icon: Icon }) {
    return (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-slate-500">
            {Icon && <Icon size={14} className="text-violet-600" />}
            {children}
        </div>
    );
}

function Slider({ label, value, min, max, step, onChange, format }) {
    return (
        <label className="block">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>{label}</span>
                <span className="tabular-nums text-violet-700">{format ? format(value) : value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" aria-label={label} />
        </label>
    );
}

function Section({ title, icon: Icon, children, defaultOpen = false }) {
    return (
        <details open={defaultOpen} className="group rounded-2xl border border-violet-100 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-extrabold text-[#171535]">
                <span className="flex items-center gap-2">
                    <Icon size={17} className="text-violet-600" /> {title}
                </span>
                <ChevronDown size={16} className="text-violet-600 transition group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="space-y-4 border-t border-violet-50 px-4 py-4">{children}</div>
        </details>
    );
}

const inputCls = "w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-violet-400";
const pct = (v) => `${Math.round(v * 100)}%`;

/* ===================== look & motion (sidebar) ===================== */

export function EffectsPanel({ settings, setSetting, filterSupported = true }) {
    return (
        <Section title="Look & motion" icon={Wand2}>
            <div>
                <Label>Filter</Label>
                <div className="grid grid-cols-3 gap-2">
                    {Object.entries(FILTERS).map(([k, f]) => (
                        <Chip key={k} active={settings.filter === k} onClick={() => setSetting("filter", k)} className="px-1">
                            {f.label}
                        </Chip>
                    ))}
                </div>
                {!filterSupported && (
                    <p className="mt-2 text-[11px] leading-4 text-amber-700">Your browser doesn&apos;t support canvas filters (Safari). Use Chrome, Edge or Firefox for filters and colour sliders.</p>
                )}
            </div>

            <Slider label="Brightness" value={settings.brightness} min={0.6} max={1.4} step={0.05} onChange={(v) => setSetting("brightness", v)} format={pct} />
            <Slider label="Contrast" value={settings.contrast} min={0.6} max={1.5} step={0.05} onChange={(v) => setSetting("contrast", v)} format={pct} />
            <Slider label="Saturation" value={settings.saturation} min={0} max={2} step={0.05} onChange={(v) => setSetting("saturation", v)} format={pct} />

            <div>
                <Label>Speed</Label>
                <div className="grid grid-cols-6 gap-1.5">
                    {SPEEDS.map((s) => (
                        <Chip key={s} active={Number(settings.speed) === s} onClick={() => setSetting("speed", s)} className="px-1">
                            {s}×
                        </Chip>
                    ))}
                </div>
            </div>

            <div>
                <Label>Slow zoom</Label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        ["none", "Off"],
                        ["in", "Zoom in"],
                        ["out", "Zoom out"],
                    ].map(([k, l]) => (
                        <Chip key={k} active={settings.zoom === k} onClick={() => setSetting("zoom", k)} className="px-1">
                            {l}
                        </Chip>
                    ))}
                </div>
                {settings.zoom !== "none" && (
                    <div className="mt-3">
                        <Slider label="Zoom amount" value={settings.zoomAmount} min={0.05} max={0.4} step={0.01} onChange={(v) => setSetting("zoomAmount", v)} format={pct} />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Slider label="Fade in" value={settings.fadeIn} min={0} max={3} step={0.5} onChange={(v) => setSetting("fadeIn", v)} format={(v) => (v ? `${v}s` : "Off")} />
                <Slider label="Fade out" value={settings.fadeOut} min={0} max={3} step={0.5} onChange={(v) => setSetting("fadeOut", v)} format={(v) => (v ? `${v}s` : "Off")} />
            </div>

            <label className="flex cursor-pointer items-center justify-between text-sm font-bold text-slate-700">
                Mirror video
                <input type="checkbox" checked={settings.mirror} onChange={(e) => setSetting("mirror", e.target.checked)} className="h-5 w-5 accent-violet-600" />
            </label>

            <div>
                <label className="flex cursor-pointer items-center justify-between text-sm font-bold text-slate-700">
                    Progress bar
                    <input type="checkbox" checked={settings.progressBar} onChange={(e) => setSetting("progressBar", e.target.checked)} className="h-5 w-5 accent-violet-600" />
                </label>
                {settings.progressBar && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                        Colour
                        <input type="color" value={settings.progressColor} onChange={(e) => setSetting("progressColor", e.target.value)} className="h-8 w-12 cursor-pointer rounded-lg border border-violet-100 bg-white" aria-label="Progress bar colour" />
                    </div>
                )}
            </div>

            <div>
                <Label icon={Flag}>Your brand tag</Label>
                <input value={settings.brandText} maxLength={40} onChange={(e) => setSetting("brandText", e.target.value)} placeholder="@yourchannel" className={inputCls} aria-label="Brand tag text" />
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {Object.entries(BRAND_POSITIONS).map(([k, l]) => (
                        <Chip key={k} active={settings.brandPos === k} onClick={() => setSetting("brandPos", k)}>
                            {l}
                        </Chip>
                    ))}
                </div>
                <p className="mt-1.5 text-[11px] leading-4 text-slate-500">Your own handle in the corner. This is your branding, not ours.</p>
            </div>
        </Section>
    );
}

/* ===================== audio (sidebar) ===================== */

export function AudioPanel({ settings, setSetting, onPreviewMusic, musicPreviewing }) {
    return (
        <Section title="Audio & music" icon={Music}>
            <Slider label="Original audio" value={settings.originalVolume} min={0} max={1.5} step={0.05} onChange={(v) => setSetting("originalVolume", v)} format={(v) => (v === 0 ? "Muted" : pct(v))} />
            <div>
                <Label icon={Music}>Royalty-free music</Label>
                <select value={settings.musicTrack} onChange={(e) => setSetting("musicTrack", e.target.value)} aria-label="Background music" className={inputCls}>
                    {MUSIC_TRACKS.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.label}
                        </option>
                    ))}
                </select>
                <p className="mt-1.5 text-[11px] leading-4 text-slate-500">Generated live in your browser from synthesisers. No recordings or samples, so nothing third-party is in your video.</p>
            </div>
            {settings.musicTrack !== "none" && (
                <>
                    <Slider label="Music volume" value={settings.musicVolume} min={0} max={1} step={0.05} onChange={(v) => setSetting("musicVolume", v)} format={pct} />
                    <button
                        type="button"
                        onClick={onPreviewMusic}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-xs font-bold ${musicPreviewing ? "border-red-200 text-red-600 hover:bg-red-50" : "border-violet-200 text-violet-700 hover:bg-violet-50"}`}
                    >
                        {musicPreviewing ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                        {musicPreviewing ? "Stop preview" : "Preview music"}
                    </button>
                </>
            )}
            <Slider label="Voiceover volume" value={settings.voiceVolume} min={0} max={1.5} step={0.05} onChange={(v) => setSetting("voiceVolume", v)} format={pct} />
        </Section>
    );
}

/* ===================== text & sticker overlays (per clip) ===================== */

export function OverlayEditor({ clip, updateClip, getPlayhead }) {
    const list = clip.overlays || [];
    const set = (next) => updateClip(clip.id, { overlays: next });
    const patch = (id, p) => set(list.map((o) => (o.id === id ? { ...o, ...p } : o)));

    const create = (extra) => {
        const t = getPlayhead();
        const start = clamp(t, clip.start, Math.max(clip.start, clip.end - 1));
        const end = Math.min(clip.end, start + 3);
        set([...list, { id: uid(), type: "text", text: "Your text", start: +start.toFixed(2), end: +end.toFixed(2), x: 0.5, y: 0.25, size: 1, style: "bold", anim: "pop", ...extra }]);
    };
    const addOutro = () => {
        const start = Math.max(clip.start, clip.end - 3);
        set([...list, { id: uid(), type: "text", text: "Follow for more!", start: +start.toFixed(2), end: +clip.end.toFixed(2), x: 0.5, y: 0.45, size: 1.1, style: "violet", anim: "pop" }]);
    };

    return (
        <div className="rounded-2xl border border-violet-100 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-extrabold">
                    <Type size={16} className="text-violet-600" /> Text &amp; stickers
                    {list.length > 0 && <span className="text-xs font-semibold text-slate-400">({list.length})</span>}
                </span>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => create({})} className="flex items-center gap-1 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50">
                        <Plus size={13} /> Text
                    </button>
                    <button onClick={() => create({ type: "sticker", text: STICKERS[0], y: 0.2, size: 1 })} className="flex items-center gap-1 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50">
                        <Smile size={13} /> Sticker
                    </button>
                    <button onClick={addOutro} className="flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200">
                        <Flag size={13} /> Outro CTA
                    </button>
                </div>
            </div>

            {list.length === 0 ? (
                <p className="text-xs leading-5 text-slate-500">Add a hook at the start, a sticker, or a call-to-action at the end. Everything you add is original to your video.</p>
            ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                    {list.map((o) => (
                        <div key={o.id} className="space-y-2 rounded-xl border border-violet-100 bg-[#fcfaff] p-3">
                            <div className="flex items-center gap-2">
                                {o.type === "sticker" ? (
                                    <div className="flex flex-wrap gap-1">
                                        {STICKERS.map((s) => (
                                            <button key={s} onClick={() => patch(o.id, { text: s })} aria-label={`Sticker ${s}`} aria-pressed={o.text === s} className={`rounded-lg px-1.5 py-0.5 text-lg ${o.text === s ? "bg-violet-200" : "hover:bg-violet-100"}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <input value={o.text} onChange={(e) => patch(o.id, { text: e.target.value })} aria-label="Overlay text" className="min-w-0 flex-1 rounded-lg border border-violet-100 bg-white px-2 py-1.5 text-sm font-semibold outline-none focus:border-violet-400" />
                                )}
                                <button onClick={() => set(list.filter((x) => x.id !== o.id))} className="shrink-0 text-slate-300 hover:text-red-500" aria-label="Delete overlay">
                                    <Trash2 size={15} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                                <label className="flex items-center gap-1.5">
                                    From
                                    <input type="number" min={0} step={0.5} value={+(o.start - clip.start).toFixed(1)} onChange={(e) => patch(o.id, { start: +clamp(clip.start + Number(e.target.value), clip.start, o.end - 0.3).toFixed(2) })} className="w-16 rounded-lg border border-violet-100 bg-white px-2 py-1" aria-label="Overlay start (seconds into clip)" />s
                                </label>
                                <label className="flex items-center gap-1.5">
                                    To
                                    <input type="number" min={0.3} step={0.5} value={+(o.end - clip.start).toFixed(1)} onChange={(e) => patch(o.id, { end: +clamp(clip.start + Number(e.target.value), o.start + 0.3, clip.end).toFixed(2) })} className="w-16 rounded-lg border border-violet-100 bg-white px-2 py-1" aria-label="Overlay end (seconds into clip)" />s
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {o.type !== "sticker" && (
                                    <select value={o.style} onChange={(e) => patch(o.id, { style: e.target.value })} aria-label="Overlay style" className={inputCls}>
                                        {Object.entries(CAPTION_STYLES).map(([k, s]) => (
                                            <option key={k} value={k}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <select value={o.anim} onChange={(e) => patch(o.id, { anim: e.target.value })} aria-label="Overlay animation" className={inputCls}>
                                    <option value="pop">Pop in</option>
                                    <option value="fade">Fade in</option>
                                    <option value="slide">Slide up</option>
                                    <option value="none">None</option>
                                </select>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                <Slider label="Left–right" value={o.x} min={0.1} max={0.9} step={0.01} onChange={(v) => patch(o.id, { x: v })} format={pct} />
                                <Slider label="Up–down" value={o.y} min={0.08} max={0.92} step={0.01} onChange={(v) => patch(o.id, { y: v })} format={pct} />
                                <Slider label="Size" value={o.size} min={0.5} max={2} step={0.05} onChange={(v) => patch(o.id, { size: v })} format={pct} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ===================== voiceover (per clip) ===================== */

export function VoiceoverCard({ clip, recording, onToggle, onDelete, disabled }) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!clip.voice?.blob) {
            setUrl(null);
            return undefined;
        }
        const u = URL.createObjectURL(clip.voice.blob);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [clip.voice]);

    return (
        <div className="rounded-2xl border border-violet-100 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-extrabold">
                    <Mic size={16} className="text-violet-600" /> Voiceover
                    {clip.voice?.blob && <span className="text-xs font-semibold text-slate-400">({fmtBytes(clip.voice.blob.size)})</span>}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={onToggle}
                        disabled={disabled && !recording}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold disabled:opacity-50 ${recording ? "bg-red-500 text-white" : "bg-violet-100 text-violet-700 hover:bg-violet-200"}`}
                    >
                        {recording ? <Square size={12} fill="currentColor" /> : <Mic size={13} />}
                        {recording ? "Stop recording" : clip.voice ? "Re-record" : "Record"}
                    </button>
                    {clip.voice && !recording && (
                        <button onClick={onDelete} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50">
                            Remove
                        </button>
                    )}
                </div>
            </div>
            {recording ? (
                <p className="flex items-center gap-2 text-xs font-semibold text-red-600" role="status">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Recording while the clip plays. It stops at the end of the clip.
                </p>
            ) : url ? (
                <audio controls src={url} className="h-9 w-full" aria-label="Voiceover preview" />
            ) : (
                <p className="text-xs leading-5 text-slate-500">Narrate over the clip with your microphone. The original sound is muted while you record, but use headphones to avoid echo. Music ducks automatically under your voice.</p>
            )}
        </div>
    );
}

/* ===================== copyright-free kit ===================== */

const FREE_SOURCES = [
    ["Pexels Videos", "https://www.pexels.com/videos/"],
    ["Pixabay Videos", "https://pixabay.com/videos/"],
    ["Mixkit", "https://mixkit.co/free-stock-video/"],
    ["Wikimedia Commons", "https://commons.wikimedia.org/wiki/Category:Videos"],
    ["Internet Archive", "https://archive.org/details/opensource_movies"],
];

export function CopyrightKit({ settings, setSetting, onSafePreset, onDownloadCredits, onCopyCredits, onOutroAll }) {
    const safeAudio = settings.originalVolume === 0 && settings.musicTrack !== "none";
    return (
        <section aria-label="Copyright-safe toolkit" className="rounded-[25px] border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-black text-[#11112f]">
                    <ShieldCheck size={20} className="text-emerald-600" /> Copyright-safe toolkit
                </h2>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${safeAudio ? "bg-emerald-600 text-white" : "bg-white text-slate-500"}`}>
                    {safeAudio ? "Audio: original removed, royalty-free music on" : "Audio: original sound still in use"}
                </span>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-white p-3 text-xs leading-5 text-slate-700">
                <Info size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                <p>
                    Cropping, filters, speed changes or mirroring <b>do not</b> make someone else&apos;s footage copyright-free, and platforms can still claim it. The safe route is to start from footage you filmed, or that is licensed for reuse, and swap any third-party music for the royalty-free tracks here.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                    <button onClick={onSafePreset} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700">
                        <Volume2 size={16} /> Replace original audio with royalty-free music
                    </button>
                    <button onClick={onOutroAll} className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                        <Flag size={14} /> Add a call-to-action ending to every clip
                    </button>

                    <label className="flex cursor-pointer items-start gap-2 text-sm font-semibold text-slate-800">
                        <input type="checkbox" checked={settings.rightsConfirmed} onChange={(e) => setSetting("rightsConfirmed", e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600" />
                        I filmed this footage, or I have the right to reuse it.
                    </label>

                    <div>
                        <Label>Source / licence (goes in the credits file)</Label>
                        <input value={settings.sourceLicense} maxLength={160} onChange={(e) => setSetting("sourceLicense", e.target.value)} placeholder="e.g. Filmed by me · or · Pexels licence, by Jane Doe" className={inputCls} aria-label="Source footage licence" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button onClick={onDownloadCredits} className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                            <Download size={14} /> Credits file (.txt)
                        </button>
                        <button onClick={onCopyCredits} className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                            <Copy size={14} /> Copy for description
                        </button>
                    </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-white p-4">
                    <Label>Free-to-use footage sources</Label>
                    <p className="mb-3 text-xs leading-5 text-slate-600">Check each clip&apos;s licence before use. Right-click a download button, copy the direct .mp4 link and paste it under &ldquo;or paste a direct video link&rdquo; on the upload box, or just download and upload it.</p>
                
                </div>
            </div>
        </section>
    );
}