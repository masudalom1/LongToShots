"use client";

import { useState } from "react";

const TOPICS = ["Help & troubleshooting", "Feature request", "Bug report", "Business & partnerships", "Other"];

export default function ContactForm({ email }) {
  const [form, setForm] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (!email) {
    return (
      <p className="text-sm leading-6 text-slate-600">
        The contact email has not been set up yet. Add your address to <code className="rounded bg-violet-50 px-1.5 py-0.5">email</code> in <code className="rounded bg-violet-50 px-1.5 py-0.5">app/site.js</code> and this form will open your email app with the message ready to send.
      </p>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    const subject = `[LongToShorts] ${form.topic}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const field =
    "w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Your name</label>
          <input id="c-name" required value={form.name} onChange={set("name")} className={field} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Your email</label>
          <input id="c-email" type="email" required value={form.email} onChange={set("email")} className={field} autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="c-topic" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Topic</label>
        <select id="c-topic" value={form.topic} onChange={set("topic")} className={field}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="c-msg" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Message</label>
        <textarea id="c-msg" required rows={6} value={form.message} onChange={set("message")} className={field} placeholder="Tell us what you need. For bugs, include your browser, device and video format." />
      </div>
      <button type="submit" className="rounded-full bg-gradient-to-r from-[#4b0cff] to-[#9b18f8] px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-violet-300/50 transition hover:scale-105">
        Send message
      </button>
      <p className="text-xs text-slate-500">This opens your email app with the message ready to send. Nothing is stored on our site.</p>
    </form>
  );
}