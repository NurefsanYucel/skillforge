"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Shows success or error messages to the user
  const [message, setMessage] = useState("");

  // Logs the user in using Supabase authentication
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Login successful!");

      // Redirect user to dashboard after successful login
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Login</h1>

      {/* Email input */}
      <input
        className="border p-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Password input */}
      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Login button */}
      <button
        className="bg-green-600 text-white px-4 py-2"
        onClick={handleLogin}
      >
        Log In
      </button>

      {/* Feedback message */}
      <p>{message}</p>
    </div>
  );
}