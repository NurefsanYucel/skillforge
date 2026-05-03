"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";

// Type definition for learning resources connected to a goal
type Resource = {
  id: string;
  title: string;
  type: string | null;
  url: string | null;
  status: string;
};

export default function GoalDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Get goal id from dynamic route params
  const { id } = use(params);

  // Goal and resource states
  const [goalTitle, setGoalTitle] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);

  // Form states for adding a new resource
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [url, setUrl] = useState("");

  // Loading state while page data is being fetched
  const [loading, setLoading] = useState(true);

  // Count completed resources
  const completedCount = resources.filter(
    (resource) => resource.status === "completed"
  ).length;

  // Calculate progress percentage for the goal
  const progress =
    resources.length === 0
      ? 0
      : Math.round((completedCount / resources.length) * 100);

  // Fetch selected goal title
  const fetchGoal = async () => {
    const { data } = await supabase
      .from("goals")
      .select("title")
      .eq("id", id)
      .single();

    if (data) setGoalTitle(data.title);
  };

  // Fetch all resources connected to this goal
  const fetchResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("goal_id", id)
      .order("created_at", { ascending: false });

    if (data) setResources(data);
  };

  useEffect(() => {
    async function loadPage() {
      // Check if user is logged in
      const { data } = await supabase.auth.getUser();

      // Redirect unauthenticated users to login page
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      await fetchGoal();
      await fetchResources();
      setLoading(false);
    }

    loadPage();
  }, []);

  // Adds a new learning resource to the current goal
  const handleAddResource = async () => {
    if (!title.trim()) return;

    await supabase.from("resources").insert({
      goal_id: id,
      title: title.trim(),
      type,
      url: url.trim(),
      status: "todo",
    });

    const { data: userData } = await supabase.auth.getUser();

    // Save activity log for profile activity section
    await supabase.from("activity_logs").insert({
      user_id: userData.user?.id,
      action: "Added a resource",
    });

    setTitle("");
    setUrl("");
    fetchResources();
  };

  // Updates resource status: todo, in_progress, or completed
  const handleStatusChange = async (resId: string, status: string) => {
    await supabase.from("resources").update({ status }).eq("id", resId);

    // Log activity only when a resource is completed
    if (status === "completed") {
      const { data: userData } = await supabase.auth.getUser();

      await supabase.from("activity_logs").insert({
        user_id: userData.user?.id,
        action: "Completed a resource",
      });
    }

    fetchResources();
  };

  // Deletes a resource from the current goal
  const handleDeleteResource = async (resId: string) => {
    await supabase.from("resources").delete().eq("id", resId);
    fetchResources();
  };

  // Show loading screen while data is loading
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation back to dashboard */}
        <a href="/dashboard" className="text-blue-400 hover:underline">
          ← Back to Dashboard
        </a>

        <h1 className="text-3xl font-bold mt-6 mb-4">{goalTitle}</h1>

        {/* Goal progress card */}
        <div className="border border-slate-800 bg-slate-900 rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex justify-between mb-2">
            <p className="font-medium">Progress</p>
            <p className="font-bold">{progress}%</p>
          </div>

          <div className="w-full bg-slate-700 rounded h-4">
            <div
              className="bg-green-500 h-4 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-slate-400 mt-2">
            {completedCount} of {resources.length} resources completed
          </p>
        </div>

        {/* Add resource form */}
        <div className="border border-slate-800 bg-slate-900 rounded-2xl p-4 mb-6 flex flex-col gap-3 shadow-xl">
          <h2 className="text-xl font-semibold">Add Resource</h2>

          <input
            className="border border-slate-700 bg-slate-950 text-white p-2 rounded"
            placeholder="Resource title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Select resource type */}
          <select
            className="border border-slate-700 bg-slate-950 text-white p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="video">Video</option>
            <option value="course">Course</option>
            <option value="article">Article</option>
            <option value="book">Book</option>
            <option value="documentation">Documentation</option>
          </select>

          <input
            className="border border-slate-700 bg-slate-950 text-white p-2 rounded"
            placeholder="URL optional"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={handleAddResource}
            disabled={!title.trim()}
            className={`px-4 py-2 rounded ${
              title.trim()
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-slate-700 cursor-not-allowed"
            } text-white`}
          >
            Add Resource
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-3">Resources</h2>

        {/* Empty state when no resources exist */}
        {resources.length === 0 ? (
          <div className="text-center text-slate-400 py-6">
            <p>No resources yet 📚</p>
            <p className="text-sm mt-1">
              Add your first learning resource above
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="border border-slate-800 bg-slate-900 rounded-2xl p-4 shadow-xl"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{resource.title}</h3>
                    <p className="text-sm text-slate-400">{resource.type}</p>

                    {/* Show external link only if URL exists */}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        className="text-blue-400 hover:underline text-sm"
                      >
                        Open resource
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded h-fit hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>

                {/* Update resource status */}
                <select
                  className="border border-slate-700 bg-slate-950 text-white p-2 rounded mt-3"
                  value={resource.status}
                  onChange={(e) =>
                    handleStatusChange(resource.id, e.target.value)
                  }
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}