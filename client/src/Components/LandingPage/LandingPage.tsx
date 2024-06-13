import { useState } from "react";
import { slug_words } from "../../config";
import { useNavigate } from "react-router-dom";

const SERVICE_URL = import.meta.env.VITE_BACKEND_SERVICE_URL;

function getRandomSlug() {
  let slug = "";
  for (let i = 0; i < 3; i++) {
    slug += slug_words[Math.floor(Math.random() * slug_words.length)];
  }
  return slug;
}

function LandingPage() {
  const [replId, setReplId] = useState(getRandomSlug());
  const [language, setLanguage] = useState("node-js");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  return (
    <section className="h-full w-full  flex items-center justify-center">
      <div className="flex flex-col w-[420px]  space-y-5">
        <h1 className="text-lg font-bold">Create a Project</h1>
        <input
          className="bg-slate-100 p-2 border-2 border-red-100"
          type="text"
          placeholder="Enter you slug"
          value={replId}
          onChange={(e) => setReplId(e.target.value)}
        />
        <div id="langOptionsContainer" className="flex items-center gap-2">
          <p className="text-md font-bold">Choose you tech stack:</p>
          <select
            className="bg-slate-100 cursor-pointer p-2"
            name="language"
            id="language"
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="node-js">node-js</option>
            <option value="python">python</option>
          </select>
        </div>
        <div className="flex justify-center">
          <button
            className="bg-slate-400 p-2 px-5 rounded-md text-white"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await fetch(`${SERVICE_URL}/api/v1/project/create`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ replId, language }),
              });
              setLoading(false);
              navigate(`/coding/?replId=${replId}`);
            }}
          >
            {loading ? "Starting..." : "Start Coding"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default LandingPage;
