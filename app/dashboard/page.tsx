"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

type Goal = {
  id: string;
  title: string;
  resources: { status: string }[];
};

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [search, setSearch] = useState("");

  const getProgress = (goal: Goal) => {
    if (goal.resources.length === 0) return 0;

    const completed = goal.resources.filter(
      (resource) => resource.status === "completed"
    ).length;

    return Math.round((completed / goal.resources.length) * 100);
  };

  const filteredGoals = goals.filter((goal) =>
    goal.title.toLowerCase().includes(search.toLowerCase())
  );

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
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUserEmail(data.user.email ?? null);
      await fetchGoals();
      setLoading(false);
    }

    getUser();
  }, []);

  const handleAddGoal = async () => {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user || !title.trim()) return;

    await supabase.from("goals").insert({
      title: title.trim(),
      user_id: userData.user.id,
    });

    await supabase.from("activity_logs").insert({
      user_id: userData.user.id,
      action: "Created a goal",
    });

    setTitle("");
    fetchGoals();
  };

  const handleDeleteGoal = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    fetchGoals();
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditingTitle(goal.title);
  };

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
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400">Welcome: {userEmail}</p>
        </div>

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

        <input
          className="border border-slate-700 bg-slate-950 text-white p-2 rounded w-full max-w-2xl"
          placeholder="Search goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

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

                  <div className="flex justify-between text-sm mb-1 text-slate-300">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>

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