import type { Route } from "./+types/home";
import { authClient } from "../lib/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Living Memory" },
    { name: "description", content: "Welcome to Living Memory!" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const session = await authClient.getSession();
  return { user: session?.data?.user || null };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welcome to Living Memory
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            A monorepo for managing and preserving digital memories
          </p>
        </div>

        <div className="mt-12">
          {loaderData.user ? (
            <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Welcome back, {loaderData.user.name || loaderData.user.email}!
              </h2>
              <div className="space-y-2">
                <a
                  href="/protected"
                  className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Protected Page
                </a>
                <a
                  href="/logout"
                  className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Logout
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Get Started
              </h2>
              <div className="space-y-2">
                <a
                  href="/login"
                  className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Create Account
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
