import fs from "fs/promises";
import path from "path";

export type ProjectFile = {
  path: string;
  content: string;
};

export type ProjectSnapshot = {
  projectId: string;
  projectName: string;
  files: ProjectFile[];
};

const PROJECTS_ROOT = path.join(process.cwd(), "projects");

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "nchartpro";
}

export function resolveProjectId(input?: string) {
  return sanitizeSegment(input || "nchartpro");
}

async function ensureDirectory(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function ensureProjectWorkspace(projectId: string, projectName: string) {
  const root = path.join(PROJECTS_ROOT, projectId);
  await fs.mkdir(root, { recursive: true });

  const metadataPath = path.join(root, "project.json");
  const existing = await readProjectSnapshot(projectId).catch(() => null);

  if (!existing) {
    await fs.writeFile(
      metadataPath,
      JSON.stringify({ projectId, projectName, createdAt: new Date().toISOString() }, null, 2),
      "utf8"
    );
  }

  return root;
}

export async function writeProjectFiles(projectId: string, files: ProjectFile[]) {
  const root = path.join(PROJECTS_ROOT, projectId);
  await fs.mkdir(root, { recursive: true });

  for (const file of files) {
    const target = path.join(root, file.path);
    await ensureDirectory(target);
    await fs.writeFile(target, file.content, "utf8");
  }
}

export async function listProjectFiles(projectId: string) {
  const root = path.join(PROJECTS_ROOT, projectId);
  const results: ProjectFile[] = [];

  async function walk(current: string, prefix = "") {
    const entries = await fs.readdir(current, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === "project.json") {
        continue;
      }

      const absolute = path.join(current, entry.name);
      const relative = prefix ? path.posix.join(prefix, entry.name) : entry.name;

      if (entry.isDirectory()) {
        await walk(absolute, relative);
        continue;
      }

      const content = await fs.readFile(absolute, "utf8");
      results.push({ path: relative.split(path.sep).join("/"), content });
    }
  }

  await walk(root);
  return results.sort((a, b) => a.path.localeCompare(b.path));
}

export async function readProjectFile(projectId: string, filePath: string) {
  const root = path.join(PROJECTS_ROOT, projectId);
  const target = path.join(root, filePath);
  return fs.readFile(target, "utf8");
}

export async function readProjectSnapshot(projectId: string): Promise<ProjectSnapshot> {
  const metadataPath = path.join(PROJECTS_ROOT, projectId, "project.json");
  const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8")) as { projectName?: string };

  return {
    projectId,
    projectName: metadata.projectName || projectId,
    files: await listProjectFiles(projectId),
  };
}
