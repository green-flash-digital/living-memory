import { seedSuperUser } from "./seed.super-user.js";

const seedScripts = [seedSuperUser];

for (const seedScript of seedScripts) {
  try {
    await seedScript();
  } catch (error) {
    throw new Error(String(error));
  }
}
