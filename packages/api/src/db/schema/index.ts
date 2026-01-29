import * as schemaAll from "./schema.all.js";
import * as schemaAuth from "./schema.auth.js";

export const schema = {
  ...schemaAll,
  ...schemaAuth
};
