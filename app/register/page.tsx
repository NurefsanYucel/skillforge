"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isValidPassword = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleRegister = async () => {
    if (!isValidEmail) {
      setMessage("❌ Please enter a valid email.");
      return;
    }

    if (!isValidPassword) {
      setMessage("❌ Password does not meet requirements.");
      return;
    }

    if (!passwordsMatch) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Registration successful!");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Register</h1>

      <input
        className="border p-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value.trim())}
      />

      <p className="text-sm text-gray-600">
        Email must be valid, for example: user@email.com
      </p>

      <input
        className="border p-2"
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="border p-2"
        type={showPassword ? "text" : "password"}
        placeholder="Confirm Password"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        type="button"
        className="text-sm text-blue-600 underline"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "Hide password" : "Show password"}
      </button>

      <div className="text-sm">
        <p className="font-medium">Password must contain:</p>
        <ul className="text-gray-600 list-disc pl-5">
          <li className={passwordChecks.length ? "text-green-600" : ""}>
            At least 8 characters
          </li>
          <li className={passwordChecks.upper ? "text-green-600" : ""}>
            One uppercase letter
          </li>
          <li className={passwordChecks.lower ? "text-green-600" : ""}>
            One lowercase letter
          </li>
          <li className={passwordChecks.number ? "text-green-600" : ""}>
            One number
          </li>
          <li className={passwordChecks.special ? "text-green-600" : ""}>
            One special character
          </li>
          <li className={passwordsMatch ? "text-green-600" : ""}>
            Passwords must match
          </li>
        </ul>
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 disabled:bg-gray-400"
        onClick={handleRegister}
        disabled={!isValidEmail || !isValidPassword || !passwordsMatch}
      >
        Sign Up
      </button>

      <p>{message}</p>
    </div>
  );
}