'use client';

import { useMemo, useState } from 'react';

type GeneratedSite = {
  title?: string;
  description?: string;
  html?: string;
  tsx?: string;
  notes?: string[];
};

const starterPrompts = [
  'Update the NChartPro homepage with a stronger hero section, clearer value proposition, and a more premium visual hierarchy.',
  'Add a new feature section to NChartPro that highlights live charts, analytics, and AI-powered insights.',
  'Rewrite the NChartPro landing page for a lovable-style workflow with a builder-ready layout and a clearer call to action.',
];

const defaultPrompt =
  'Improve the existing NChartPro website. Keep the brand, but make it feel like a modern AI-built product site with a better hero, clearer sections, and edits that can be applied to the current app.';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripCodeFences(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json|tsx|html)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  return trimmed;
}

function parseGeneratedSite(answer: string): GeneratedSite | null {
  const cleaned = stripCodeFences(answer);

  try {
    const parsed = JSON.parse(cleaned) as GeneratedSite;
    return typeof parsed === 'object' && parsed ? parsed : null;
  } catch {
    return null;
  }
}

function buildFallbackPreview(prompt: string) {
  const safePrompt = escapeHtml(prompt || 'Your generated website will appear here.');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nemotron Preview</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #081018;
        --panel: rgba(15, 23, 42, 0.88);
        --text: #f8fafc;
        --muted: #94a3b8;
        --accent: #f4b860;
        --accent-2: #60a5fa;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; background: radial-gradient(circle at top, #10233b 0%, var(--bg) 58%); color: var(--text); font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      body { padding: 32px; }
      .shell {
        min-height: calc(100vh - 64px);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 28px;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.92));
        box-shadow: 0 30px 90px rgba(2, 6, 23, 0.45);
        padding: 48px;
        display: grid;
        align-content: center;
        gap: 24px;
      }
      .eyebrow { color: var(--accent); text-transform: uppercase; letter-spacing: 0.22em; font-size: 12px; }
      h1 { margin: 0; font-size: clamp(2.5rem, 8vw, 6rem); line-height: 0.96; max-width: 10ch; }
      p { margin: 0; max-width: 62ch; color: var(--muted); font-size: 1.02rem; line-height: 1.7; }
      .actions { display: flex; gap: 14px; flex-wrap: wrap; }
      .button {
        display: inline-flex; align-items: center; justify-content: center; border-radius: 999px;
        padding: 14px 20px; text-decoration: none; font-weight: 700;
      }
      .primary { background: linear-gradient(135deg, var(--accent), #f97316); color: #09090b; }
      .secondary { border: 1px solid rgba(148, 163, 184, 0.24); color: var(--text); }
      .prompt {
        border-radius: 22px; padding: 18px 20px; background: var(--panel);
        border: 1px solid rgba(148, 163, 184, 0.14); color: #e2e8f0; line-height: 1.7;
      }
      .glow {
        position: fixed; inset: auto auto 12% 64%; width: 340px; height: 340px; border-radius: 50%;
        background: radial-gradient(circle, rgba(96,165,250,0.2), rgba(96,165,250,0)); filter: blur(12px); pointer-events: none;
      }
      @media (max-width: 720px) {
        body { padding: 16px; }
        .shell { min-height: calc(100vh - 32px); padding: 28px 22px; border-radius: 22px; }
      }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <main class="shell">
      <div class="eyebrow">Nemotron generated concept</div>
      <h1>Build a launch-ready website in minutes.</h1>
      <p>${safePrompt}</p>
      <div class="actions">
        <a class="button primary" href="#">Start building</a>
        <a class="button secondary" href="#">View features</a>
      </div>
      <div class="prompt">The AI-generated layout will replace this fallback preview once Nemotron returns structured HTML.</div>
    </main>
  </body>
</html>`;
}

function formatCode(code?: string) {
  return code?.trim() || 'No code returned yet.';
}

export default function WebsiteBuilderStudio() {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [site, setSite] = useState<GeneratedSite | null>(null);

  const previewSrcDoc = useMemo(() => {
    if (site?.html?.trim()) {
      return site.html;
    }

    return buildFallbackPreview(prompt);
  }, [prompt, site]);

  const codeToShow = site?.tsx || answer;

  async function handleGenerate() {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || loading) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.details || data?.error || 'Nemotron request failed.');
      }

      setAnswer(typeof data?.answer === 'string' ? data.answer : '');
      setSite(data?.parsed && typeof data.parsed === 'object' ? (data.parsed as GeneratedSite) : parseGeneratedSite(data?.answer || ''));
    } catch (err) {
      setSite(null);
      setAnswer('');
      setError(err instanceof Error ? err.message : 'Something went wrong while generating the site.');
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    const value = formatCode(codeToShow);

    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
  }

  return (
    <main className="builder-shell">
      <div className="builder-glow builder-glow-left" />
      <div className="builder-glow builder-glow-right" />

      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow-row">
            <span className="eyebrow-badge">Nemotron via Hugging Face Router</span>
            <span className="status-pill">NChartPro builder</span>
          </div>
          <h1>Update NChartPro like a living product. Nemotron suggests the changes and code.</h1>
          <p>
            Enter the change you want, generate a preview, and copy the Next.js-ready code. The API key stays on the server and the browser only talks to your route.
          </p>
          <div className="starter-row">
            {starterPrompts.map((item) => (
              <button key={item} type="button" className="starter-chip" onClick={() => setPrompt(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <span>Route</span>
            <strong>/api/chat</strong>
          </div>
          <div className="stat-card">
            <span>Model</span>
            <strong>Nemotron 550B</strong>
          </div>
          <div className="stat-card">
            <span>Output</span>
            <strong>HTML + TSX</strong>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="prompt-panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Prompt</p>
              <h2>Shape NChartPro</h2>
            </div>
            <button type="button" className="generate-button" onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate site'}
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="prompt-input"
            placeholder="Describe the NChartPro change you want..."
            rows={10}
          />

          {error ? <div className="error-banner">{error}</div> : null}

          <div className="panel-footer">
            <div>
              <p className="panel-kicker">Tip</p>
              <span>Ask for a homepage revision, new section, copy rewrite, or feature block and the model will fill in the layout.</span>
            </div>
            <button type="button" className="ghost-button" onClick={copyCode} disabled={!codeToShow.trim()}>
              Copy code
            </button>
          </div>
        </div>

        <div className="preview-column">
          <div className="preview-panel">
            <div className="panel-header compact">
              <div>
                <p className="panel-kicker">Live preview</p>
                <h2>{site?.title || 'NChartPro preview'}</h2>
              </div>
              <span className="status-pill">Sandboxed iframe</span>
            </div>

            <div className="iframe-frame">
              <iframe
                title="Nemotron website preview"
                srcDoc={previewSrcDoc}
                sandbox=""
                referrerPolicy="no-referrer"
              />
            </div>

            <p className="preview-note">
              {site?.description || 'The preview updates from structured HTML returned by Nemotron. If the model returns plain text, you still get a styled fallback preview tailored to NChartPro.'}
            </p>
          </div>

          <div className="code-panel">
            <div className="panel-header compact">
              <div>
                <p className="panel-kicker">Generated code</p>
                <h2>Copy into your project</h2>
              </div>
            </div>
            <pre className="code-block">{formatCode(codeToShow)}</pre>
          </div>
        </div>
      </section>

      <section className="notes-bar">
        <div>
          <span className="panel-kicker">What this does</span>
          <p>Browser traffic stays local. The server calls Hugging Face Router with your token and returns the generated site payload.</p>
        </div>
        <div>
          <span className="panel-kicker">Environment</span>
          <p>Add HF_TOKEN to .env.local before generating. Never expose the token in client code.</p>
        </div>
      </section>

      <style jsx>{`
        :global(body) {
          background:
            radial-gradient(circle at top left, rgba(245, 158, 11, 0.16), transparent 28%),
            radial-gradient(circle at top right, rgba(56, 189, 248, 0.16), transparent 24%),
            linear-gradient(180deg, #020617 0%, #050816 50%, #020617 100%);
          color: #e5eefc;
        }

        .builder-shell {
          position: relative;
          min-height: 100vh;
          padding: 32px;
          overflow: hidden;
        }

        .builder-glow {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 999px;
          filter: blur(22px);
          opacity: 0.55;
          pointer-events: none;
        }

        .builder-glow-left {
          top: -100px;
          left: -120px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.42), transparent 60%);
        }

        .builder-glow-right {
          right: -120px;
          bottom: 12%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.36), transparent 60%);
        }

        .hero-panel,
        .prompt-panel,
        .preview-panel,
        .code-panel,
        .notes-bar {
          position: relative;
          z-index: 1;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: rgba(8, 15, 30, 0.72);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 80px rgba(2, 6, 23, 0.42);
        }

        .hero-panel {
          display: grid;
          grid-template-columns: 1.5fr 0.9fr;
          gap: 20px;
          border-radius: 28px;
          padding: 28px;
          margin-bottom: 22px;
        }

        .hero-copy h1,
        .panel-header h2 {
          margin: 0;
          font-family: var(--font-dm-sans), var(--font-geist-sans), sans-serif;
        }

        .hero-copy h1 {
          font-size: clamp(2.4rem, 4vw, 4.75rem);
          line-height: 0.95;
          max-width: 12ch;
          letter-spacing: -0.05em;
        }

        .hero-copy p,
        .preview-note,
        .notes-bar p,
        .panel-footer span,
        .error-banner {
          color: rgba(226, 232, 240, 0.82);
          line-height: 1.7;
        }

        .eyebrow-row,
        .panel-header,
        .panel-footer,
        .starter-row,
        .hero-stats,
        .notes-bar {
          display: flex;
          gap: 12px;
        }

        .eyebrow-row,
        .panel-header,
        .panel-footer {
          justify-content: space-between;
          align-items: center;
        }

        .eyebrow-badge,
        .status-pill,
        .panel-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .eyebrow-badge {
          color: #fbbf24;
        }

        .status-pill {
          color: #93c5fd;
          border: 1px solid rgba(96, 165, 250, 0.25);
          background: rgba(30, 41, 59, 0.7);
          padding: 8px 12px;
          border-radius: 999px;
          letter-spacing: 0.14em;
        }

        .hero-copy {
          display: grid;
          gap: 18px;
        }

        .starter-row {
          flex-wrap: wrap;
        }

        .starter-chip,
        .ghost-button,
        .generate-button {
          border: none;
          cursor: pointer;
          border-radius: 999px;
          transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
        }

        .starter-chip {
          max-width: 100%;
          padding: 12px 16px;
          background: rgba(15, 23, 42, 0.88);
          color: #dbeafe;
          border: 1px solid rgba(148, 163, 184, 0.16);
          text-align: left;
          line-height: 1.45;
          font-size: 0.92rem;
        }

        .starter-chip:hover,
        .ghost-button:hover,
        .generate-button:hover {
          transform: translateY(-1px);
        }

        .hero-stats {
          align-content: start;
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        .stat-card {
          padding: 18px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.82));
          border: 1px solid rgba(148, 163, 184, 0.12);
          display: grid;
          gap: 8px;
        }

        .stat-card span,
        .panel-kicker {
          color: rgba(148, 163, 184, 0.84);
        }

        .stat-card strong,
        .panel-header h2 {
          font-size: 1.15rem;
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 20px;
        }

        .prompt-panel,
        .preview-panel,
        .code-panel {
          border-radius: 28px;
          padding: 22px;
        }

        .prompt-panel {
          display: grid;
          gap: 16px;
          align-content: start;
        }

        .panel-header.compact {
          align-items: start;
        }

        .panel-header h2 {
          font-size: 1.5rem;
          margin-top: 4px;
        }

        .generate-button {
          padding: 14px 18px;
          background: linear-gradient(135deg, #f59e0b, #fb7185);
          color: #09090b;
          font-weight: 800;
          box-shadow: 0 16px 36px rgba(251, 146, 60, 0.25);
        }

        .generate-button:disabled,
        .ghost-button:disabled,
        .starter-chip:disabled {
          cursor: not-allowed;
          opacity: 0.6;
          transform: none;
        }

        .prompt-input {
          width: 100%;
          min-height: 340px;
          resize: vertical;
          border-radius: 22px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(2, 6, 23, 0.78);
          color: #eff6ff;
          padding: 18px;
          font-size: 1rem;
          line-height: 1.7;
          outline: none;
          font-family: inherit;
        }

        .prompt-input:focus {
          border-color: rgba(245, 158, 11, 0.7);
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
        }

        .error-banner {
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid rgba(248, 113, 113, 0.24);
          background: rgba(127, 29, 29, 0.28);
        }

        .ghost-button {
          padding: 12px 16px;
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.86);
          border: 1px solid rgba(148, 163, 184, 0.16);
        }

        .preview-column {
          display: grid;
          gap: 20px;
        }

        .iframe-frame {
          margin-top: 6px;
          min-height: 460px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: #020617;
        }

        .iframe-frame iframe {
          width: 100%;
          height: 100%;
          min-height: 460px;
          border: 0;
          display: block;
          background: #020617;
        }

        .code-block {
          margin: 0;
          min-height: 240px;
          max-height: 340px;
          overflow: auto;
          padding: 18px;
          border-radius: 22px;
          background: rgba(2, 6, 23, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.12);
          color: #dbeafe;
          white-space: pre-wrap;
          word-break: break-word;
          font-family: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace;
          font-size: 0.92rem;
          line-height: 1.7;
        }

        .notes-bar {
          justify-content: space-between;
          align-items: start;
          margin-top: 20px;
          border-radius: 24px;
          padding: 20px 22px;
        }

        .notes-bar > div {
          max-width: 48%;
        }

        @media (max-width: 980px) {
          .hero-panel,
          .workspace-grid {
            grid-template-columns: 1fr;
          }

          .notes-bar {
            display: grid;
          }

          .notes-bar > div {
            max-width: 100%;
          }
        }

        @media (max-width: 720px) {
          .builder-shell {
            padding: 16px;
          }

          .hero-panel,
          .prompt-panel,
          .preview-panel,
          .code-panel,
          .notes-bar {
            border-radius: 22px;
            padding: 18px;
          }

          .panel-header,
          .panel-footer,
          .eyebrow-row {
            flex-direction: column;
            align-items: stretch;
          }

          .generate-button,
          .ghost-button {
            width: 100%;
          }

          .prompt-input,
          .iframe-frame,
          .iframe-frame iframe {
            min-height: 320px;
          }
        }
      `}</style>
    </main>
  );
}