"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

// Type definition for each goal and its related resources
type Goal = {
  id: string;
  title: string;
  resources: { status: string }[];
};

export default function Dashboard() {
  // Stores the username if available, otherwise the user's email
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Goal input and goals list state
  const [title, setTitle] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);

  // Loading state while user and goal data are being fetched
  const [loading, setLoading] = useState(true);

  // States used for editing an existing goal
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Search input state for filtering goals
  const [search, setSearch] = useState("");

  // Calculates goal progress based on completed resources
  const getProgress = (goal: Goal) => {
    if (goal.resources.length === 0) return 0;

    const completed = goal.resources.filter(
      (resource) => resource.status === "completed"
    ).length;

    return Math.round((completed / goal.resources.length) * 100);
  };

  // Filters goals based on the search input
  const filteredGoals = goals.filter((goal) =>
    goal.title.toLowerCase().includes(search.toLowerCase())
  );

  // Fetches all goals with their related resource statuses
  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("id, title, resources(status)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setGoals(data);
    }
  };

  useEffect(() => {
    async function getUser() {
      // Get the currently logged-in user
      const { data } = await supabase.auth.getUser();

      // Redirect unauthenticated users to the login page
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      // Fetch username from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      // Show username if it exists, otherwise fall back to email
      setDisplayName(profile?.username || data.user.email || "User");

      await fetchGoals();
      setLoading(false);
    }

    getUser();
  }, []);

  // Adds a new goal for the logged-in user
  const handleAddGoal = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user || !title.trim()) return;

    await supabase.from("goals").insert({
      title: title.trim(),
      user_id: userData.user.id,
    });

    // Save activity log after creating a goal
    await supabase.from("activity_logs").insert({
      user_id: userData.user.id,
      action: "Created a goal",
    });

    setTitle("");
    fetchGoals();
  };

  // Deletes a goal by id
  const handleDeleteGoal = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    fetchGoals();
  };

  // Enables edit mode for the selected goal
  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingTitle(goal.title);
  };

  // Saves the updated goal title
  const handleUpdateGoal = async () => {
    if (!editingGoalId || !editingTitle.trim()) return;

    await supabase
      .from("goals")
      .update({ title: editingTitle.trim() })
      .eq("id", editingGoalId);

    setEditingGoalId(null);
    setEditingTitle("");
    fetchGoals();
  };

  // Show loading screen while data is being loaded
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

      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center gap-6 p-6">
        {/* Page header */}
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400">Welcome: {displayName}</p>
        </div>

        {/* Add new goal form */}
        <div className="border border-slate-800 bg-slate-900 rounded-2xl p-4 w-full max-w-2xl flex gap-2 shadow-xl">
          <input
            className="border border-slate-700 bg-slate-950 text-white p-2 rounded flex-1"
            placeholder="New goal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            onClick={handleAddGoal}
            disabled={!title.trim()}
            className={`px-4 py-2 rounded ${
              title.trim()
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-slate-700 cursor-not-allowed"
            } text-white`}
          >
            Add Goal
          </button>
        </div>

        {/* Search goals input */}
        <input
          className="border border-slate-700 bg-slate-950 text-white p-2 rounded w-full max-w-2xl"
          placeholder="Search goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Goals list */}
        <div className="w-full max-w-2xl">
          {filteredGoals.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <p className="text-lg">No goals found 🚀</p>
              <p className="text-sm mt-2">
                Add a new goal or try a different search.
              </p>
            </div>
          ) : (
            filteredGoals.map((goal) => {
              const progress = getProgress(goal);

              return (
                <div
                  key={goal.id}
                  className="border border-slate-800 bg-slate-900 rounded-2xl p-4 mb-3 shadow-xl"
                >
                  <div className="flex justify-between items-center gap-3 mb-2">
                    {/* Show input while editing, otherwise show goal link */}
                    {editingGoalId === goal.id ? (
                      <input
                        className="border border-slate-700 bg-slate-950 text-white p-2 rounded flex-1"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                      />
                    ) : (
                      <a
                        href={`/goals/${goal.id}`}
                        className="font-semibold hover:underline"
                      >
                        {goal.title}
                      </a>
                    )}

                    {/* Edit, save, and delete buttons */}
                    <div className="flex gap-2">
                      {editingGoalId === goal.id ? (
                        <button
                          onClick={handleUpdateGoal}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditing(goal)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Progress percentage */}
                  <div className="flex justify-between text-sm mb-1 text-slate-300">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded h-3">
                    <div
                      className="bg-green-500 h-3 rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}