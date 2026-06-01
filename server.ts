import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cors());

  const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions.json");

  // Helper functions for reading and writing submissions
  const readSubmissions = (): any[] => {
    try {
      if (fs.existsSync(SUBMISSIONS_FILE)) {
        const fileContent = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error("Error reading submissions:", err);
    }
    return [];
  };

  const writeSubmissions = (data: any[]) => {
    try {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing submissions:", err);
    }
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // POST: Save onboarding submission
  app.post("/api/onboarding", (req, res) => {
    try {
      const { formData } = req.body;
      if (!formData) {
         res.status(400).json({ error: "Missing formData parameter." });
         return;
      }

      const submissions = readSubmissions();
      const newSubmission = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        submittedAt: new Date().toISOString(),
        status: "new", // "new" | "reviewed" | "in_progress" | "completed"
        data: formData
      };

      submissions.push(newSubmission);
      writeSubmissions(submissions);

      res.status(201).json({ success: true, id: newSubmission.id });
    } catch (error) {
      console.error("Error saving onboarding submission:", error);
      res.status(500).json({ error: "Failed to save submission." });
    }
  });

  // GET: Retrieve all onboarding submissions (Password protected)
  app.get("/api/onboarding", (req, res) => {
    try {
      const providedPassword = req.query.password || req.headers["x-admin-password"];
      const masterPassword = process.env.ADMIN_PASSWORD || "voltz2026";

      if (providedPassword !== masterPassword) {
         res.status(401).json({ error: "Unauthorized access: Incorrect credentials." });
         return;
      }

      const submissions = readSubmissions();
      // Return sorted from newest to oldest
      submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      res.json({ success: true, submissions });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ error: "Failed to fetch submissions." });
    }
  });

  // PUT: Update step status of onboarding submission
  app.put("/api/onboarding/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const providedPassword = req.headers["x-admin-password"] || req.query.password;
      const masterPassword = process.env.ADMIN_PASSWORD || "voltz2026";

      if (providedPassword !== masterPassword) {
         res.status(401).json({ error: "Unauthorized access." });
         return;
      }

      const submissions = readSubmissions();
      const index = submissions.findIndex(s => s.id === id);

      if (index === -1) {
         res.status(404).json({ error: "Submission not found." });
         return;
      }

      submissions[index].status = status || submissions[index].status;
      writeSubmissions(submissions);

      res.json({ success: true, submission: submissions[index] });
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ error: "Failed to update submission." });
    }
  });

  // DELETE: Remove a submission
  app.delete("/api/onboarding/:id", (req, res) => {
    try {
      const { id } = req.params;
      const providedPassword = req.headers["x-admin-password"] || req.query.password;
      const masterPassword = process.env.ADMIN_PASSWORD || "voltz2026";

      if (providedPassword !== masterPassword) {
         res.status(401).json({ error: "Unauthorized access." });
         return;
      }

      const submissions = readSubmissions();
      const filtered = submissions.filter(s => s.id !== id);

      if (submissions.length === filtered.length) {
         res.status(404).json({ error: "Submission not found." });
         return;
      }

      writeSubmissions(filtered);
      res.json({ success: true, message: "Submission successfully deleted." });
    } catch (error) {
      console.error("Error deleting submission:", error);
      res.status(500).json({ error: "Failed to delete submission." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
