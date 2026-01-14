import "../../dev-utils/loadLocalEnvVars";
import { getEnvVar } from "../../src/utils";

import { auth } from "../../src/utils/auth";

/**
 * Creates a super user using Better Auth API methods
 */
export async function seedSuperUser() {
  const email = getEnvVar("SUPER_USER_EMAIL");
  const password = getEnvVar("SUPER_USER_PASSWORD");
  const name = getEnvVar("SUPER_USER_NAME");

  console.log(`Creating super user with email: ${email}`);

  try {
    // Use auth.api.signUpEmail() to create the user
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
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
      error.message?.includes("unique constraint")
    ) {
      console.log(
        `⚠️  User with email ${email} already exists. Skipping creation.`
      );
      return null;
    }

    console.error("Failed to create super user:", error);
    throw error;
  }
}
