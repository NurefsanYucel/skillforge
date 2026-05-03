"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Register() {
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Used to confirm that the user typed the same password twice
  const [confirmPassword, setConfirmPassword] = useState("");

  // Controls whether password fields are visible or hidden
  const [showPassword, setShowPassword] = useState(false);

  // Shows validation, success, or error messages
  const [message, setMessage] = useState("");

  // Next.js router used for redirecting after successful registration
  const router = useRouter();

  // Checks if the email has a valid format
  const isValidEmail = /\S+@\S+\.\S+/.test(email);

  // Password requirement checks
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // Password is valid only if all requirements are met
  const isValidPassword = Object.values(passwordChecks).every(Boolean);

  // Confirms both password fields match
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  // Registers a new user with Supabase authentication
  const handleRegister = async () => {
    // Validate email before sending request
    if (!isValidEmail) {
      setMessage("❌ Please enter a valid email.");
      return;
    }

    // Validate password strength
    if (!isValidPassword) {
      setMessage("❌ Password does not meet requirements.");
      return;
    }

    // Validate password confirmation
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

      // Redirect user to login page after successful registration
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Register</h1>

      {/* Email input */}
      <input
        className="border p-2"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value.trim())}
      />

      {/* Email requirement helper text */}
      <p className="text-sm text-gray-600">
        Email must be valid, for example: user@email.com
      </p>

      {/* Password input */}
      <input
        className="border p-2"
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Confirm password input */}
      <input
        className="border p-2"
        type={showPassword ? "text" : "password"}
        placeholder="Confirm Password"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {/* Toggle password visibility */}
      <button
        type="button"
        className="text-sm text-blue-600 underline"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? "Hide password" : "Show password"}
      </button>

      {/* Password requirement list */}
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

      {/* Disabled until email, password, and confirmation are valid */}
      <button
        className="bg-blue-500 text-white px-4 py-2 disabled:bg-gray-400"
        onClick={handleRegister}
        disabled={!isValidEmail || !isValidPassword || !passwordsMatch}
      >
        Sign Up
      </button>

      {/* Feedback message */}
      <p>{message}</p>
    </div>
  );
}