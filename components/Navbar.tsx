"use client";

import { supabase } from "@/lib/supabase";

export default function Navbar() {
  // Logs the user out using Supabase authentication
  const handleLogout = async () => {
    await supabase.auth.signOut();

    // Redirect to login page after logout
    window.location.href = "/login";
  };

  return (
    // Main navigation container
    <nav className="w-full border-b border-slate-800 bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* App logo / brand name (redirects to dashboard) */}
        <a href="/dashboard" className="text-xl font-bold">
          SkillForge
        </a>
  
        {/* Navigation links and actions */}
        <div className="flex gap-4 items-center">
          
          {/* Dashboard link */}
          <a href="/dashboard" className="text-slate-300 hover:text-white">
            Dashboard
          </a>
  
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>

          {/* Profile page link */}
          <a href="/profile" className="text-slate-300 hover:text-white">
            Profile
          </a>
        </div>
      </div>
    </nav>
  );
}