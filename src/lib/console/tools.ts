import { tool } from "ai";
import { z } from "zod";
import { createAiPr } from "./github";

// Exported separately so tests can call .safeParse without wrestling the
// AI SDK v6 FlexibleSchema wrapper type that tool({inputSchema}) returns.
export const diagnoseInputSchema = z.object({
  image_urls: z.array(z.string().url()).min(1, "at least one image required"),
  question: z.string().optional(),
});

export const diagnoseTool = tool({
  description: "Analyze attached plant photos for health issues (pests, disease, deficiencies, stress). Returns an ephemeral analysis — no writeback. Use when the user asks 'what's wrong' or wants identification/treatment advice.",
  inputSchema: diagnoseInputSchema,
  // No execute() — the AI SDK calls Claude vision directly via the messages parameter.
  // This tool is "signal-only": its presence tells Claude "the user wants a diagnosis,"
  // and Claude's vision-enabled response IS the diagnosis. The chat route doesn't need
  // to round-trip; just let streamText emit the assistant message.
});

// Phase 2 tools (propose_photo_tags, draft_daily_log, commit_to_github) added in Tasks 23–26.

export const phase1Tools = { diagnose: diagnoseTool };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const proposePhotoTagsInputSchema = z.object({
  image_urls: z.array(z.string().url()).min(1),
  date: z.string().regex(ISO_DATE, "must be YYYY-MM-DD"),
  filenames: z.array(z.string()).optional(),
});

export const proposePhotoTagsTool = tool({
  description: "Generate a Photos/<date>.md note from attached images. Returns proposed content (frontmatter + body) for preview. Does NOT commit.",
  inputSchema: proposePhotoTagsInputSchema,
  // Same signal-only pattern as diagnoseTool — Claude's response IS the proposed content.
});

export const draftDailyLogInputSchema = z.object({
  date: z.string().regex(ISO_DATE, "must be YYYY-MM-DD"),
  notes: z.string().optional(),
  image_urls: z.array(z.string().url()).optional(),
});

export const draftDailyLogTool = tool({
  description: "Draft a Daily Log/<date> — Garden Monitor.md entry. Reads carry-forward from the previous log automatically. Returns proposed content for preview. Does NOT commit.",
  inputSchema: draftDailyLogInputSchema,
  // Signal-only — Claude's response IS the proposed content. The chat route injects
  // carry-forward items from the previous log into the system prompt before calling streamText.
});

export const phase2Tools = {
  ...phase1Tools,
  propose_photo_tags: proposePhotoTagsTool,
  draft_daily_log: draftDailyLogTool,
};

const fileSchema = z.object({
  path: z.string(),
  content: z.string(),
  isBinary: z.boolean().optional(),
});

export const commitToGithubInputSchema = z.object({
  title: z.string(),
  body: z.string(),
  files: z.array(fileSchema).min(1).max(50),
});

export const commitToGithubTool = tool({
  description: "Open a PR with the proposed files. ONLY call this after the user has explicitly confirmed in chat (e.g. 'yes, commit'). Files must be under content/, vault-inbox/, or public/_assets/.",
  inputSchema: commitToGithubInputSchema,
  execute: async ({ title, body, files }) => {
    const pr = await createAiPr({ title, body, files });
    return { url: pr.url, number: pr.number, message: `PR #${pr.number} opened — review and merge: ${pr.url}` };
  },
});

export const allTools = {
  ...phase2Tools,
  commit_to_github: commitToGithubTool,
};
