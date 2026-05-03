"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

// Type definition for user activity logs
type Activity = {
  id: string;
  action: string;
  created_at: string;
};

export default function Profile() {
  // Profile information states
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // UI feedback and loading states
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Stores the user's recent activity logs
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    async function loadProfile() {
      // Get the currently logged-in user
      const { data: userData } = await supabase.auth.getUser();

      // Redirect unauthenticated users to login page
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      setEmail(userData.user.email ?? "");

      // Fetch profile data from the profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, avatar_url")
        .eq("id", userData.user.id)
        .single();

      // Fill profile fields if profile data exists
      if (profile) {
        setUsername(profile.username ?? "");
        setFullName(profile.full_name ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
      }

      // Fetch latest user activity logs
      const { data: activityData } = await supabase
        .from("activity_logs")
        .select("id, action, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setActivities(activityData || []);
      setLoading(false);
    }

    loadProfile();
  }, []);

  // Uploads profile picture to Supabase Storage
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Store each user's avatar inside their own folder
    const filePath = `${userData.user.id}/avatar.png`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        // Allows replacing the existing profile picture
        upsert: true,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    // Get public URL for the uploaded avatar
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Add timestamp to refresh cached image immediately
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    setMessage("Profile picture updated!");
  };

  // Saves username, full name, and avatar URL to the profiles table
  const handleSave = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    // Remove cache-busting timestamp before saving URL to database
    const cleanAvatarUrl = avatarUrl.split("?")[0];

    const { error } = await supabase.from("profiles").upsert({
      id: userData.user.id,
      username,
      full_name: fullName,
      avatar_url: cleanAvatarUrl,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile saved successfully!");
    }
  };

  // Show loading state while profile data is being fetched
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>

          {/* Show username if available, otherwise show email */}
          <p className="text-slate-400 mb-6">
            {username ? `@${username}` : email}
          </p>

          {/* Profile edit card */}
          <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              {/* Display avatar or fallback placeholder */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile picture"
                  className="w-24 h-24 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">No Image</span>
                </div>
              )}

              {/* Hidden file input controlled by styled label */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />

                <div className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition">
                  Edit Profile Picture
                </div>
              </label>
            </div>

            {/* Username input */}
            <input
              className="border border-slate-700 bg-slate-950 text-white p-2 rounded"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            {/* Full name input */}
            <input
              className="border border-slate-700 bg-slate-950 text-white p-2 rounded"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Profile
            </button>

            {/* Success or error message */}
            {message && <p className="text-slate-300">{message}</p>}
          </div>

          {/* Recent activity section */}
          <div className="border border-slate-800 bg-slate-900 rounded-2xl p-6 shadow-xl mt-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

            {activities.length === 0 ? (
              <p className="text-slate-400">No activity yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-b border-slate-800 pb-2 text-slate-300"
                  >
                    <p>{activity.action}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}