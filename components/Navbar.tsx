"use client";

import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <a href="/dashboard" className="text-xl font-bold">
          SkillForge
        </a>
  
        <div className="flex gap-4 items-center">
          <a href="/dashboard" className="text-slate-300 hover:text-white">
            Dashboard
          </a>
  
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>

          <a href="/profile" className="text-slate-300 hover:text-white">
            Profile
          </a>
        </div>
      </div>
    </nav>
  );
}