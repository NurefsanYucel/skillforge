export default function Home() {
  return (
    // Full-screen centered landing page
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      
      {/* Main card container */}
      <div className="max-w-2xl text-center bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl">
        
        {/* App title */}
        <h1 className="text-5xl font-bold mb-4">SkillForge</h1>
        
        {/* Short description of the app */}
        <p className="text-slate-300 text-lg mb-8">
          Track your learning goals, save resources, and monitor your progress.
        </p>

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4">
          
          {/* Redirects new users to registration page */}
          <a
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-500"
          >
            Get Started
          </a>

          {/* Redirects existing users to login page */}
          <a
            href="/login"
            className="border border-slate-600 px-6 py-3 rounded-lg font-medium hover:bg-slate-800"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  );
}