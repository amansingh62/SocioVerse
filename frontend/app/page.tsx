"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">Welcome to Socioverse</h1>

      <button
        onClick={() => router.push("/login")}
        className="px-6 py-2 bg-blue-600 text-white rounded"
      >
        Login
      </button>

      <button
        onClick={() => router.push("/register")}
        className="px-6 py-2 border rounded"
      >
        Create Account
      </button>
    </div>
  );
}