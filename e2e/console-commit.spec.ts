import { test, expect } from "@playwright/test";

test("commit flow renders Open PR CTA", async ({ page }) => {
  // Stub the history fetch to start empty (registered before navigation
  // so the ChatPanel mount-time fetch is intercepted on first load).
  await page.route("**/api/console/history", route => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ history: [] }),
  }));

  // Stub the chat stream to emit a tool-result for commit_to_github.
  // AI SDK v6 DefaultChatTransport expects SSE framing: `data: <json>\n\n`,
  // terminated by `data: [DONE]\n\n`. Each JSON payload is validated against
  // uiMessageChunkSchema. To register a tool result, the client must see a
  // matching `tool-input-available` (which creates the ToolUIPart) before a
  // `tool-output-available` (which fills its `output`). We also include the
  // standard `start` / `start-step` / `finish-step` / `finish` framing.
  await page.route("**/api/console/chat", route => {
    const toolCallId = "call_test_1";
    const chunks = [
      { type: "start", messageId: "msg_test_1" },
      { type: "start-step" },
      { type: "text-start", id: "txt_1" },
      { type: "text-delta", id: "txt_1", delta: "Committing..." },
      { type: "text-end", id: "txt_1" },
      {
        type: "tool-input-available",
        toolCallId,
        toolName: "commit_to_github",
        input: {},
      },
      {
        type: "tool-output-available",
        toolCallId,
        output: {
          url: "https://github.com/Sierra458/gardenos-web/pull/99",
          number: 99,
          message: "PR #99 opened",
        },
      },
      { type: "finish-step" },
      { type: "finish" },
    ];
    const body =
      chunks.map(c => `data: ${JSON.stringify(c)}\n\n`).join("") +
      "data: [DONE]\n\n";
    route.fulfill({
      status: 200,
      headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
      body,
    });
  });

  // Log in with admin password to land on /console
  await page.goto("/console/login");
  await page.getByLabel("Admin password").fill("test-admin-password");
  await page.getByRole("button", { name: /enter console/i }).click();
  await expect(page).toHaveURL("/console");

  // Send "commit it" message
  await page.locator("input[placeholder='Ask Claude…']").fill("commit it");
  await page.getByRole("button", { name: /send/i }).click();

  // Assert the Open PR CTA appears within a reasonable timeout
  await expect(page.getByText("#99 — Review & merge →")).toBeVisible({ timeout: 10000 });
});
