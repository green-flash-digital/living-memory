import { resolve } from "node:path";
import { config } from "dotenv";

config({
  path: [
    resolve(import.meta.dirname, "../../.env"),
    resolve(import.meta.dirname, "../.dev.vars"),
  ],
});
