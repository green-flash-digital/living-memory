import { redirect } from "react-router";
import type { Route } from "./+types/protected";
import { authClient } from "../lib/auth.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Protected Page - Living Memory" },
    { name: "description", content: "Protected content" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const session = await authClient.getSession();

  if (!session?.data?.session) {
    throw redirect("/login");
  }

  return { user: session.data.user };
}

export default function Protected({ loaderData }: Route.ComponentProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Protected Page
          </h1>
          <p className="text-gray-600 mb-4">
            This is a protected route. Only authenticated users can see this.
          </p>
          <div className="bg-gray-50 rounded p-4">
            <h2 className="font-semibold text-gray-900 mb-2">User Info:</h2>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {loaderData.user?.email}
            </p>
            {loaderData.user?.name && (
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {loaderData.user.name}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <strong>ID:</strong> {loaderData.user?.id}
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/logout"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
