"use client";

import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Play,
  Pause,
  Upload,
  Download,
  RotateCcw,
  Volume2,
  SlidersHorizontal,
  Sparkles,
  Check,
  Music2,
} from "lucide-react";

const PRESETS = [
  { id: "original", name: "Original", pitch: 0, bass: 0, treble: 0, echo: 0 },
  { id: "slight-deep", name: "Slightly Deep", pitch: -2, bass: 3, treble: -1, echo: 0 },
  { id: "deep", name: "Deep Voice", pitch: -5, bass: 5, treble: -2, echo: 0 },
  { id: "high", name: "High Voice", pitch: 4, bass: -2, treble: 3, echo: 0 },
  { id: "warm", name: "Warm Voice", pitch: -1, bass: 4, treble: -2, echo: 0 },
  { id: "bright", name: "Bright Voice", pitch: 2, bass: -1, treble: 4, echo: 0 },
  { id: "studio", name: "Studio Voice", pitch: 0, bass: 1, treble: 2, echo: 0 },
  { id: "robot", name: "Robot Effect", pitch: 0, bass: 0, treble: 0, echo: 0.2, robot: true },
  { id: "echo", name: "Echo Effect", pitch: 0, bass: 0, treble: 0, echo: 0.45 },
];

const DEFAULT_SETTINGS = {
  pitch: 0,
  bass: 0,
  treble: 0,
  echo: 0,
  robot: false,
};

const CONTROLS = [
  { key: "pitch", label: "Pitch", min: -12, max: 12, step: 1, unit: " semitones" },
  { key: "bass", label: "Bass", min: -12, max: 12, step: 1, unit: " dB" },
  { key: "treble", label: "Treble", min: -12, max: 12, step: 1, unit: " dB" },
  { key: "echo", label: "Echo", min: 0, max: 0.8, step: 0.05, unit: "" },
];

const AUDIO_EXT = /\.(mp3|wav|m4a|aac|ogg|oga|opus|flac|weba|webm|mp4|mov)$/i;

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function audioBufferToWav(buffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const frames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frames * blockAlign;

  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, value) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const data = [];
  for (let c = 0; c < channels; c++) data.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, data[c][i]));
      view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

export default function VoiceEditor() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activePreset, setActivePreset] = useState("original");
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const audioContextRef = useRef(null);
  const animationRef = useRef(null);
  const sourceRef = useRef(null);
  const originalBufferRef = useRef(null);
  const downloadUrlRef = useRef(null);
  const playTokenRef = useRef(0);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  /*
   * IMPORTANT (this was the bug): cleanup must run ONLY on unmount.
   * The old effect depended on [fileUrl], so the cleanup ran as soon as a file was loaded
   * and closed the freshly created AudioContext — every preview then failed.
   */
  useEffect(() => {
    return () => {
      playTokenRef.current++;
      cancelAnimationFrame(animationRef.current);
      try { sourceRef.current?.stop(); } catch {}
      audioContextRef.current?.close?.().catch(() => {});
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    };
  }, []);

  /* Returns a usable (not closed) AudioContext, creating one if needed */
  const getContext = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) throw new Error("Your browser does not support Web Audio.");
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      audioContextRef.current = new AC();
    }
    return audioContextRef.current;
  };

  const stopPlayback = () => {
    playTokenRef.current++;
    cancelAnimationFrame(animationRef.current);
    const s = sourceRef.current;
    if (s) {
      s.onended = null;
      try { s.stop(); } catch {}
      try { s.disconnect(); } catch {}
    }
    sourceRef.current = null;
    setPlaying(false);
  };

  const loadAudio = async (selectedFile) => {
    if (!selectedFile) return;

    const looksLikeAudio =
      selectedFile.type.startsWith("audio/") ||
      selectedFile.type.startsWith("video/") ||
      AUDIO_EXT.test(selectedFile.name);

    if (!looksLikeAudio) {
      setError("Please select an audio file (MP3, WAV, M4A, OGG...).");
      return;
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      setError("File size exceeds the 500 MB limit.");
      return;
    }

    try {
      stopPlayback();
      setError("");

      const context = getContext();
      const arrayBuffer = await selectedFile.arrayBuffer();

      let decoded;
      try {
        decoded = await context.decodeAudioData(arrayBuffer);
      } catch {
        throw new Error("Couldn't decode this file. Try an MP3, WAV or M4A.");
      }

      originalBufferRef.current = decoded;
      setFile(selectedFile);
      setDuration(decoded.duration);
      setCurrentTime(0);
      setSettings(DEFAULT_SETTINGS);
      setActivePreset("original");
    } catch (err) {
      setError(err.message || "Unable to load this audio file.");
    }
  };

  const updateSetting = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setActivePreset("custom");
  };

  const applyPreset = (preset) => {
    setSettings({
      pitch: preset.pitch,
      bass: preset.bass,
      treble: preset.treble,
      echo: preset.echo,
      robot: preset.robot || false,
    });
    setActivePreset(preset.id);
    setError("");
  };

  /* Builds source → bass → treble → (robot) → (echo) → compressor → destination */
  const createAudioGraph = (buffer, context, destination) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    // Pitch via playback rate (also changes speed, like a tape)
    source.playbackRate.value = Math.pow(2, settings.pitch / 12);

    const bassFilter = context.createBiquadFilter();
    bassFilter.type = "lowshelf";
    bassFilter.frequency.value = 250;
    bassFilter.gain.value = settings.bass;

    const trebleFilter = context.createBiquadFilter();
    trebleFilter.type = "highshelf";
    trebleFilter.frequency.value = 3500;
    trebleFilter.gain.value = settings.treble;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 20;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.2;

    source.connect(bassFilter);
    bassFilter.connect(trebleFilter);

    let lastNode = trebleFilter;

    if (settings.robot) {
      const distortion = context.createWaveShaper();
      const curve = new Float32Array(44100);
      for (let i = 0; i < curve.length; i++) {
        const x = (i * 2) / curve.length - 1;
        curve[i] = Math.tanh(x * 4);
      }
      distortion.curve = curve;
      distortion.oversample = "4x";
      lastNode.connect(distortion);
      lastNode = distortion;
    }

    if (settings.echo > 0) {
      const delay = context.createDelay(1);
      delay.delayTime.value = 0.24;

      const feedback = context.createGain();
      feedback.gain.value = Math.min(settings.echo, 0.65);

      const wet = context.createGain();
      wet.gain.value = settings.echo;

      const mixer = context.createGain();

      lastNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);

      lastNode.connect(mixer); // dry
      wet.connect(mixer); // echo
      lastNode = mixer;
    }

    lastNode.connect(compressor);
    compressor.connect(destination);

    return source;
  };

  /* Starts preview from `offset` seconds (position in the original audio) */
  const startPlayback = async (offset = 0) => {
    const buffer = originalBufferRef.current;
    if (!buffer) return;

    stopPlayback();
    const token = ++playTokenRef.current;

    try {
      const context = getContext();
      await context.resume();
      if (token !== playTokenRef.current) return; // a newer start/stop happened

      const rate = Math.pow(2, settings.pitch / 12);
      const startOffset = Math.min(Math.max(0, offset), Math.max(0, buffer.duration - 0.05));

      const source = createAudioGraph(buffer, context, context.destination);

      source.onended = () => {
        if (sourceRef.current === source) {
          stopPlayback();
          setCurrentTime(0);
        }
      };

      sourceRef.current = source;
      const startedAt = context.currentTime;
      source.start(0, startOffset);
      setPlaying(true);

      const tick = () => {
        if (sourceRef.current !== source) return;
        const position = startOffset + (context.currentTime - startedAt) * rate;
        setCurrentTime(Math.min(position, buffer.duration));
        animationRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setPlaying(false);
      setError(`Unable to play preview: ${err?.message || "unknown error"}`);
    }
  };

  const playPreview = () => {
    if (playing) {
      stopPlayback();
      return;
    }
    setError("");
    startPlayback(currentTimeRef.current >= duration - 0.1 ? 0 : currentTimeRef.current);
  };

  // Hear changes instantly: restart from the current position when settings change mid-playback
  useEffect(() => {
    if (!sourceRef.current) return;
    startPlayback(currentTimeRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSeek = (value) => {
    const t = Number(value);
    setCurrentTime(t);
    currentTimeRef.current = t;
    if (sourceRef.current) startPlayback(t);
  };

  const exportAudio = async () => {
    const buffer = originalBufferRef.current;
    if (!buffer || processing) return;

    try {
      setProcessing(true);
      setProgress(5);
      setError("");
      stopPlayback();

      const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const pitchRate = Math.pow(2, settings.pitch / 12);
      const outputDuration = buffer.duration / pitchRate;
      const tail = settings.echo > 0 ? 1.5 : 0; // room for the echo tail
      const sampleRate = buffer.sampleRate;

      const offline = new OfflineCtx(
        buffer.numberOfChannels,
        Math.ceil((outputDuration + tail) * sampleRate),
        sampleRate
      );

      const source = createAudioGraph(buffer, offline, offline.destination);
      source.start(0);
      setProgress(25);

      const rendered = await offline.startRendering();
      setProgress(80);

      const wav = audioBufferToWav(rendered);

      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
      const url = URL.createObjectURL(wav);
      downloadUrlRef.current = url;

      const link = document.createElement("a");
      link.href = url;
      link.download = `longtoshorts-voice-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setProgress(100);
    } catch (err) {
      setError(err?.message || "Audio export failed.");
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const resetEditor = () => {
    applyPreset(PRESETS[0]);
    setError("");
  };

  const changeFile = () => {
    stopPlayback();
    originalBufferRef.current = null;
    setFile(null);
    setDuration(0);
    setCurrentTime(0);
    setError("");
  };

  return (
    <section id="voice-editor" aria-labelledby="voice-title" className="w-full scroll-mt-24 rounded-3xl border border-violet-100 bg-white p-5 shadow-xl shadow-violet-100/50 sm:p-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <AudioLines size={27} />
          </div>
          <div>
            <h2 id="voice-title" className="text-xl font-black text-slate-900">Voice Changer Studio</h2>
            <p className="text-sm text-slate-500">Customize your voice for every Short</p>
          </div>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
          Free · Local processing
        </span>
      </div>

      {/* UPLOAD */}
      {!file && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/60 px-5 py-12 text-center transition hover:bg-violet-100/60">
          <Upload size={35} className="mb-3 text-violet-600" />
          <h3 className="font-bold text-slate-900">Upload your voice audio</h3>
          <p className="mt-2 text-sm text-slate-500">MP3, WAV, M4A, OGG and supported audio formats</p>
          <span className="mt-5 rounded-full bg-violet-700 px-7 py-3 text-sm font-bold text-white">Choose Audio</span>
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac"
            className="hidden"
            aria-label="Upload an audio file"
            onChange={(e) => {
              loadAudio(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {file && (
        <>
          {/* FILE INFORMATION */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-violet-50 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700">
                <Music2 size={23} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1048576).toFixed(2)} MB · {formatTime(duration)}
                </p>
              </div>
            </div>
            <button onClick={changeFile} className="text-sm font-semibold text-red-500">
              Change file
            </button>
          </div>

          {/* PREVIEW */}
          <div className="mb-7 rounded-2xl border border-violet-100 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Voice Preview</h3>
                <p className="text-xs text-slate-500">Listen to your modified voice</p>
              </div>
              <span className="text-xs font-semibold text-violet-700">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="mb-5 flex h-14 items-center justify-center gap-1 overflow-hidden" aria-hidden="true">
              {Array.from({ length: 45 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-violet-300"
                  style={{
                    height: `${12 + Math.abs(Math.sin(i * 0.7)) * 38}px`,
                    opacity: i / 45 < currentTime / (duration || 1) ? 1 : 0.45,
                  }}
                />
              ))}
            </div>

            <input
              type="range"
              min="0"
              max={duration || 1}
              step="0.1"
              value={Math.min(currentTime, duration || 1)}
              onChange={(e) => handleSeek(e.target.value)}
              className="w-full accent-violet-600"
              aria-label="Seek"
            />

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={playPreview}
                className="flex items-center gap-2 rounded-full bg-violet-700 px-6 py-3 text-sm font-bold text-white hover:bg-violet-800"
              >
                {playing ? <Pause size={17} /> : <Play size={17} />}
                {playing ? "Stop Preview" : "Play Preview"}
              </button>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Volume2 size={15} />
                Audio preview
              </span>
            </div>
          </div>

          {/* PRESETS */}
          <div className="mb-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900">Choose Voice Style</h3>
              <Sparkles size={19} className="text-violet-600" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  aria-pressed={activePreset === preset.id}
                  className={`rounded-xl border p-4 text-left transition ${
                    activePreset === preset.id
                      ? "border-violet-600 bg-violet-50 ring-2 ring-violet-200"
                      : "border-slate-200 hover:border-violet-300"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <AudioLines size={21} className={activePreset === preset.id ? "text-violet-700" : "text-slate-400"} />
                    {activePreset === preset.id && <Check size={17} className="text-violet-700" />}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM SETTINGS */}
          <div className="mb-7 rounded-2xl border border-violet-100 p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-extrabold text-slate-900">
                  <SlidersHorizontal size={18} />
                  Customize Voice
                </h3>
                <p className="mt-1 text-xs text-slate-500">Fine-tune your audio settings</p>
              </div>
              <button onClick={resetEditor} className="flex items-center gap-1 text-xs font-bold text-violet-700">
                <RotateCcw size={14} />
                Reset
              </button>
            </div>

            {CONTROLS.map((control) => (
              <div key={control.key} className="mb-6 last:mb-0">
                <div className="mb-3 flex justify-between">
                  <label htmlFor={`vc-${control.key}`} className="text-sm font-bold text-slate-800">
                    {control.label}
                  </label>
                  <span className="text-sm font-semibold text-violet-700">
                    {settings[control.key]}
                    {control.unit}
                  </span>
                </div>
                <input
                  id={`vc-${control.key}`}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={settings[control.key]}
                  onChange={(e) => updateSetting(control.key, Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>
            ))}

            <label className="mt-6 flex cursor-pointer items-center justify-between rounded-xl bg-violet-50 p-4">
              <div>
                <p className="text-sm font-bold text-slate-900">Robot Voice Effect</p>
                <p className="mt-1 text-xs text-slate-500">Add a robotic sound texture</p>
              </div>
              <input
                type="checkbox"
                checked={settings.robot}
                onChange={(e) => updateSetting("robot", e.target.checked)}
                className="h-5 w-5 accent-violet-700"
              />
            </label>
          </div>

          {/* EXPORT */}
          <div className="rounded-2xl bg-gradient-to-r from-[#4b0cff] to-[#9615ef] p-5 text-white">
            <h3 className="font-extrabold">Export Modified Voice</h3>
            <p className="mt-1 text-sm text-violet-100">Download your edited audio without a watermark.</p>

            {processing && (
              <div className="mt-4" role="status">
                <div className="mb-2 flex justify-between text-xs">
                  <span>Processing audio...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button
              onClick={exportAudio}
              disabled={processing}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60"
            >
              <Download size={19} />
              {processing ? "Processing..." : "Download Edited Audio"}
            </button>
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="mt-5 text-center text-xs leading-5 text-slate-400">
        Your audio is processed in your browser. Nothing is uploaded to a paid AI service. Exported audio is WAV format.
      </p>
    </section>
  );
}