// Wraps the OpenNext-generated worker so we can add a Cron Trigger handler
// alongside the normal Next.js request handling. See wrangler.toml [triggers].

// @ts-ignore — generated at build time by `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";
import { sendWeeklySummary } from "./src/lib/weekly-summary";

interface ScheduledController {
  scheduledTime: number;
  cron: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  fetch: handler.fetch,

  async scheduled(controller: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    ctx.waitUntil(sendWeeklySummary(new Date(controller.scheduledTime)));
  },
};
