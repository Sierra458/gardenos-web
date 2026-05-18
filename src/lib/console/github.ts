import { Octokit } from "@octokit/rest";

const REPO_OWNER = "Sierra458";
const REPO_NAME = "gardenos-web";
const BASE_BRANCH = "main";

const PATH_ALLOWLIST_RE = /^(content|vault-inbox|public\/_assets)\/[a-zA-Z0-9_/.-]+\.(md|jpg|jpeg|png|webp)$/;
const DENY_RE = /(\.\.)|(^\/)|(\\)|(\.github\/)|(node_modules\/)|(\.env)|(package(-lock)?\.json)/;

const MAX_FILES_PER_PR = 50;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 30 * 1024 * 1024;

export class AllowlistError extends Error {
  constructor(public path: string) { super(`Path not allowed: ${path}`); this.name = "AllowlistError"; }
}

export interface PrFile {
  path: string;
  content: string;        // utf-8 text or base64 binary
  isBinary?: boolean;     // true → content is already base64
}

export interface CreatedPr {
  url: string;
  number: number;
}

function validateFiles(files: PrFile[]): void {
  if (files.length > MAX_FILES_PER_PR) {
    throw new Error(`Too many files (${files.length}); max ${MAX_FILES_PER_PR} per PR (file count cap)`);
  }
  let total = 0;
  for (const f of files) {
    if (DENY_RE.test(f.path) || !PATH_ALLOWLIST_RE.test(f.path)) {
      throw new AllowlistError(f.path);
    }
    const bytes = f.isBinary ? Math.ceil(f.content.length * 3 / 4) : Buffer.byteLength(f.content, "utf8");
    if (bytes > MAX_FILE_BYTES) throw new Error(`File ${f.path} exceeds file size cap (${MAX_FILE_BYTES} bytes)`);
    total += bytes;
  }
  if (total > MAX_TOTAL_BYTES) throw new Error(`Total PR size ${total} exceeds cap ${MAX_TOTAL_BYTES}`);
}

export async function createAiPr(args: {
  title: string;
  body: string;
  files: PrFile[];
  branchPrefix?: string;
}): Promise<CreatedPr> {
  validateFiles(args.files);
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN missing");
  const octokit = new Octokit({ auth: token });

  // 1. Get main HEAD SHA
  const { data: base } = await octokit.rest.repos.getBranch({ owner: REPO_OWNER, repo: REPO_NAME, branch: BASE_BRANCH });
  const baseSha = base.commit.sha;

  // 2. Create branch
  const branchName = `${args.branchPrefix ?? "ai/garden"}-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;
  await octokit.rest.git.createRef({
    owner: REPO_OWNER, repo: REPO_NAME,
    ref: `refs/heads/${branchName}`,
    sha: baseSha,
  });

  // 3. Commit each file
  for (const f of args.files) {
    const content = f.isBinary ? f.content : Buffer.from(f.content, "utf8").toString("base64");
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER, repo: REPO_NAME,
      path: f.path,
      message: `AI: ${f.path}`,
      content,
      branch: branchName,
    });
  }

  // 4. Open PR
  const { data: pr } = await octokit.rest.pulls.create({
    owner: REPO_OWNER, repo: REPO_NAME,
    title: args.title,
    body: args.body,
    head: branchName,
    base: BASE_BRANCH,
  });

  // 5. Label
  await octokit.rest.issues.addLabels({
    owner: REPO_OWNER, repo: REPO_NAME,
    issue_number: pr.number,
    labels: ["ai-generated"],
  });

  return { url: pr.html_url, number: pr.number };
}

// Helper: read a file from main HEAD (used by chat route to fetch previous log)
export async function readFileFromMain(path: string): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN missing");
  const octokit = new Octokit({ auth: token });
  try {
    const { data } = await octokit.rest.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path, ref: BASE_BRANCH });
    if (Array.isArray(data) || data.type !== "file") return null;
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch (e: any) {
    if (e.status === 404) return null;
    throw e;
  }
}
