import { tool } from "ai";
import { z } from "zod";

export const diagnoseTool = tool({
  description: "Analyze attached plant photos for health issues (pests, disease, deficiencies, stress). Returns an ephemeral analysis — no writeback. Use when the user asks 'what's wrong' or wants identification/treatment advice.",
  inputSchema: z.object({
    image_urls: z.array(z.string().url()).min(1, "at least one image required"),
    question: z.string().optional(),
  }),
  // No execute() — the AI SDK calls Claude vision directly via the messages parameter.
  // This tool is "signal-only": its presence tells Claude "the user wants a diagnosis,"
  // and Claude's vision-enabled response IS the diagnosis. The chat route doesn't need
  // to round-trip; just let streamText emit the assistant message.
});

// Phase 2 tools (propose_photo_tags, draft_daily_log, commit_to_github) added in Tasks 23–26.

export const phase1Tools = { diagnose: diagnoseTool };
