import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readProjectSnapshot } from "../../../lib/projectWorkspace";

type DemoPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { projectId } = await params;

  return {
    title: `Live Demo - ${projectId}`,
    description: "Live preview of the generated NChartPro project.",
  };
}

function buildDemoHtml(projectName: string, prompt: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectName} Live Demo</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        background:
          radial-gradient(circle at top left, rgba(245,158,11,0.15), transparent 30%),
          radial-gradient(circle at top right, rgba(96,165,250,0.15), transparent 28%),
          linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%);
        color: #e5eefc;
        padding: 32px;
      }
      main {
        max-width: 1180px;
        margin: 0 auto;
        border-radius: 32px;
        border: 1px solid rgba(148,163,184,0.18);
        background: rgba(8, 15, 30, 0.78);
        backdrop-filter: blur(18px);
        padding: 28px;
        box-shadow: 0 30px 80px rgba(2, 6, 23, 0.45);
      }
      .hero {
        display: grid;
        gap: 18px;
        padding: 42px 24px 20px;
      }
      .eyebrow {
        color: #f4b860;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        font-size: 12px;
        font-weight: 800;
      }
      h1 {
        margin: 0;
        font-size: clamp(2.8rem, 7vw, 6rem);
        line-height: 0.92;
        max-width: 10ch;
      }
      p {
        margin: 0;
        color: #cbd5e1;
        max-width: 70ch;
        line-height: 1.8;
      }
      .card-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        margin-top: 28px;
      }
      .card {
        border-radius: 22px;
        border: 1px solid rgba(148,163,184,0.16);
        background: linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.88));
        padding: 20px;
      }
      .card strong { display: block; margin-bottom: 8px; font-size: 1.05rem; }
      .prompt-box {
        margin-top: 28px;
        border-radius: 22px;
        padding: 18px 20px;
        background: rgba(15,23,42,0.88);
        border: 1px solid rgba(148,163,184,0.14);
        color: #cbd5e1;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="eyebrow">Live Demo</div>
        <h1>${projectName}</h1>
        <p>${prompt || "This project is being rendered as a live demo."}</p>
      </section>
      <section class="card-grid">
        <div class="card"><strong>Live charts</strong><span>Realtime visual blocks for the NChartPro experience.</span></div>
        <div class="card"><strong>Project edits</strong><span>Review changes and apply them to the workspace.</span></div>
        <div class="card"><strong>Project files</strong><span>The agent writes files into the project workspace itself.</span></div>
      </section>
      <div class="prompt-box">${prompt || "No prompt supplied."}</div>
    </main>
  </body>
</html>`;
}

export default async function DemoProjectPage({ params }: DemoPageProps) {
  const { projectId } = await params;

  try {
    const snapshot = await readProjectSnapshot(projectId);
    return (
      <main style={{ minHeight: "100vh", margin: 0, padding: 0 }}>
        <iframe
          title={`${snapshot.projectName} live demo`}
          srcDoc={buildDemoHtml(snapshot.projectName, snapshot.files.find((file) => file.path === "README.md")?.content || "")}
          style={{ width: "100%", height: "100vh", border: 0, display: "block" }}
          sandbox=""
        />
      </main>
    );
  } catch {
    notFound();
  }
}