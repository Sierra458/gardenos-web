import { describe, it, expect, vi, beforeEach } from "vitest";

beforeEach(() => vi.resetModules());

describe("createAiPr", () => {
  it("rejects file paths outside the allowlist", async () => {
    vi.doMock("@octokit/rest", () => ({ Octokit: vi.fn() }));
    const { createAiPr, AllowlistError } = await import("./github");
    await expect(createAiPr({
      title: "x", body: "y",
      files: [{ path: "../etc/passwd", content: "" }],
    })).rejects.toBeInstanceOf(AllowlistError);
    await expect(createAiPr({
      title: "x", body: "y",
      files: [{ path: ".env", content: "" }],
    })).rejects.toBeInstanceOf(AllowlistError);
  });

  it("rejects more than 50 files per PR", async () => {
    vi.doMock("@octokit/rest", () => ({ Octokit: vi.fn() }));
    const { createAiPr } = await import("./github");
    const files = Array.from({ length: 51 }, (_, i) => ({ path: `content/x${i}.md`, content: "x" }));
    await expect(createAiPr({ title: "t", body: "b", files })).rejects.toThrow(/file count/);
  });

  it("rejects files > 5MB", async () => {
    vi.doMock("@octokit/rest", () => ({ Octokit: vi.fn() }));
    const { createAiPr } = await import("./github");
    const big = "x".repeat(5 * 1024 * 1024 + 1);
    await expect(createAiPr({ title: "t", body: "b", files: [{ path: "content/big.md", content: big }] })).rejects.toThrow(/file size/);
  });

  it("creates a branch + commits files + opens a PR", async () => {
    const calls: any[] = [];
    const fakeOctokit = {
      rest: {
        repos: {
          getBranch: vi.fn().mockResolvedValue({ data: { commit: { sha: "main-sha" } } }),
          createOrUpdateFileContents: vi.fn().mockImplementation(async (args: any) => { calls.push(args); return {}; }),
        },
        git: { createRef: vi.fn().mockResolvedValue({}) },
        pulls: { create: vi.fn().mockResolvedValue({ data: { html_url: "https://github.com/x/y/pull/1", number: 1 } }) },
        issues: { addLabels: vi.fn().mockResolvedValue({}) },
      },
    };
    vi.doMock("@octokit/rest", () => ({ Octokit: vi.fn(() => fakeOctokit) }));
    process.env.GITHUB_TOKEN = "token";

    const { createAiPr } = await import("./github");
    const r = await createAiPr({
      title: "AI: photos 2026-05-18",
      body: "x",
      files: [
        { path: "content/photos/2026-05-18.md", content: "repo-shape" },
        { path: "vault-inbox/photos/2026-05-18.md", content: "vault-shape" },
      ],
    });
    expect(r.url).toBe("https://github.com/x/y/pull/1");
    expect(r.number).toBe(1);
    expect(calls).toHaveLength(2);
    expect(calls[0].path).toBe("content/photos/2026-05-18.md");
    expect(calls[1].path).toBe("vault-inbox/photos/2026-05-18.md");
    expect(fakeOctokit.rest.issues.addLabels).toHaveBeenCalled();
  });
});
