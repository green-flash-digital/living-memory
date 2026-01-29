import "../../dev-utils/loadLocalEnvVars.js";
import { auth } from "../../src/auth.js";

/**
 * Creates a super user using Better Auth API methods
 * Now works seamlessly in Node.js without WASM issues!
 */
export async function seedSuperUser() {
  const email = process.env.SUPER_USER_EMAIL;
  const password = process.env.SUPER_USER_PASSWORD;
  const name = process.env.SUPER_USER_NAME;

  if (!email || !password || !name) {
    throw new Error("SUPER_USER_EMAIL, SUPER_USER_PASSWORD, and SUPER_USER_NAME must be set");
  }

  console.log(`Creating super user with email: ${email}`);

  try {
    // Create mock headers for Better Auth API (required for auth.api methods)
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    // Use auth.api.signUpEmail() to create the user
    // This now works perfectly in Node.js with Drizzle!
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name
      },
      headers
    });

    if (result.user) {
      console.log("✅ Super user created successfully!");
      console.log(`   User ID: ${result.user.id}`);
      console.log(`   Email: ${result.user.email}`);
      console.log(`   Name: ${result.user.name || "N/A"}`);
    }
  } catch (error: any) {
    // Check if user already exists
    if (
      error.message?.includes("already exists") ||
      error.message?.includes("unique constraint") ||
      error.code === "23505" // PostgreSQL unique violation
    ) {
      console.log(`⚠️  User with email ${email} already exists. Skipping creation.`);
      return null;
    }

    console.error("Failed to create super user:", error);
    throw error;
  }
}
