// Wraps the OpenNext-generated worker so we can add a Cron Trigger handler
// alongside the normal Next.js request handling. See wrangler.toml [triggers].

// @ts-ignore — generated at build time by `opennextjs-cloudflare build`
import { default as handler } from "./.open-next/worker.js";
import { sendWeeklySummary } from "./src/lib/weekly-summary";

// Must match the Monday entries in wrangler.toml [triggers].
const WEEKLY_CRONS = ["0 8 * * 1", "0 9 * * 1"];

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
    // Any cron other than the two Monday ones is a one-off test, so send
    // immediately instead of waiting for 9am UK time.
    const isWeekly = WEEKLY_CRONS.includes(controller.cron);
    ctx.waitUntil(sendWeeklySummary(new Date(controller.scheduledTime), !isWeekly));
  },
};
