import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Defaults are right for this site: every page is either static or rendered on
 * demand, and there is nothing worth an incremental cache for a one-day event.
 */
export default defineCloudflareConfig();
