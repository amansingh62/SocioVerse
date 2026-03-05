"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/axios";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!username || username.length < 3) return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setUsernameStatus("checking");

        const { data } = await api.get("/auth/check-username", {
          params: { username },
          signal: controller.signal,
        });

        setUsernameStatus(data.available ? "available" : "taken");
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            setUsernameStatus("idle");
          }
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [username]);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameStatus === "taken") {
      alert("Username already taken");
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        username,
        email,
        password,
      });

      router.push("/dashboard");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-4 max-w-md mx-auto mt-20"
    >

      <input
        className="border p-2"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="flex flex-col">
        <input
          className="border p-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          required
        />

        {usernameStatus === "checking" && (
          <span className="text-gray-500 text-sm">Checking...</span>
        )}

        {usernameStatus === "available" && (
          <span className="text-green-600 text-sm">✔ Username available</span>
        )}

        {usernameStatus === "taken" && (
          <span className="text-red-600 text-sm">✖ Username already taken</span>
        )}
      </div>

      <input
        className="border p-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button className="bg-black text-white p-2">Register</button>
    </form>
  );
}
