import pc from "picocolors";

/**
 * Color utilities for Cloudflare Workers.
 * Forces color support since picocolors may not detect TTY support in Workers.
 */
export const colors = pc.createColors(true);
