import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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

  // Helper to send onboarding briefing email to workspace
  const sendBriefingEmail = async (submission: any) => {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `Voltz Onboarding <${smtpUser || "no-reply@voltz.digital"}>`;
    const targetEmail = process.env.WORKSPACE_EMAIL || "jordanjade900@voltzdigitalja.com";

    // If config does not exist, log a clear notice explaining SMTP is unconfigured.
    if (!smtpUser || !smtpPass || !smtpHost) {
      const errorMsg = "SMTP properties are not configured in your .env file. To send briefing emails, please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS. Refer to .env.example.";
      console.warn(`[Onboarding Mailer] ${errorMsg}`);
      console.warn(`[Onboarding Mailer] Client detail briefing was securely saved to file, but could not send email to ${targetEmail}.`);
      throw new Error(errorMsg);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const { data } = submission;
      const bName = data.businessName || "Unnamed Business";
      const ownerName = `${data.ownerFirstName || ""} ${data.ownerLastName || ""}`.trim() || "N/A";

      const textBody = `
Voltz Digital - New Onboarding dossier
---------------------------------------
Submission ID: ${submission.id}
Submitted At: ${submission.submittedAt}

BUSINESS DETAILS
Business Name: ${bName}
Owner Name: ${ownerName}
Personal Email: ${data.personalEmail || "N/A"}
Personal Phone: ${data.personalNumber || "N/A"}
Business Email (Customer-Facing): ${data.businessEmail || "N/A"}
Business Phone (Customer-Facing): ${data.businessNumber || "N/A"}
Existing Website: ${data.websiteAddress || "None"}

UNDERSTANDING THE COMPANY
Business Description: ${data.businessDescription || "N/A"}
Why Choose Us: ${data.whyChooseUs || "N/A"}
Special Sauce / Unique Factor: ${data.specialSauce || "N/A"}
Services Offered: ${data.servicesOffered || "N/A"}
Special Offers / Promotions: ${data.specialOffers || "N/A"}

DEEP DIVE DETAILS
Company History: ${data.companyHistory || "N/A"}
Key Competitors: ${data.competitors || "N/A"}
Owner Vision: ${data.ownerVision || "N/A"}
FAQs: ${data.faq || "N/A"}

HANDOVER DETAILS
Website Admin Username: ${data.adminUsername || "N/A"}
Login Password/Code: ${data.adminLoginCode || "N/A"}
Additional Notes / Hosting Details: ${data.additionalNotes || "N/A"}
      `.trim();

      const htmlBody = `
        <div style="background-color: #f4f6f8; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
            
            <!-- Header Section -->
            <div style="background-color: #0b0f19; padding: 30px 20px; text-align: center; border-bottom: 3px solid #00D4FF;">
              <img src="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" alt="Voltz Digital" style="height: 48px; width: auto; margin-bottom: 12px; display: inline-block; referrer-policy: no-referrer;" />
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">Client Onboarding Brief</h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">Submission Ref: <strong style="font-family: monospace; color: #00D4FF;">${submission.id}</strong></p>
            </div>

            <!-- Content Body -->
            <div style="padding: 30px 25px; color: #1e293b; line-height: 1.6; background-color: #ffffff;">
              
              <!-- Client Overview Callout -->
              <div style="background-color: #f0f9ff; padding: 18px 20px; border-radius: 10px; border-left: 4px solid #00D4FF; margin-bottom: 30px;">
                <h2 style="font-size: 13px; margin: 0 0 8px 0; color: #0369a1; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Client Overview</h2>
                <p style="margin: 0; font-size: 14px; color: #0284c7;"><strong>Company:</strong> ${bName}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #0f172a;"><strong>Lead Partner:</strong> ${ownerName}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #0f172a;"><strong>Submitted On:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
              </div>

              <!-- Contact Dossier Table -->
              <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 6px; border-bottom: 2px solid #f1f5f9;">Contact Dossier</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #475569; width: 180px;">Personal Email</td>
                    <td style="padding: 10px 12px; color: #0f172a;">${data.personalEmail || "—"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #475569;">Personal Mobile</td>
                    <td style="padding: 10px 12px; color: #0f172a;">${data.personalNumber || "—"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #475569;">Business Email</td>
                    <td style="padding: 10px 12px; color: #0f172a;">${data.businessEmail || "—"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #475569;">Business Phone</td>
                    <td style="padding: 10px 12px; color: #0f172a;">${data.businessNumber || "—"}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
                    <td style="padding: 10px 12px; font-weight: 600; color: #475569;">Current Website</td>
                    <td style="padding: 10px 12px;"><a href="${data.websiteAddress ? (data.websiteAddress.startsWith('http') ? data.websiteAddress : 'https://' + data.websiteAddress) : '#'}" style="color: #0284c7; font-weight: 600; text-decoration: underline;">${data.websiteAddress || "No current website"}</a></td>
                  </tr>
                </tbody>
              </table>

              <!-- Understanding the Company -->
              <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 6px; border-bottom: 2px solid #f1f5f9;">Understanding the Company</h3>
              
              <div style="margin-bottom: 18px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Description &amp; History</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.businessDescription || "N/A"}</div>
              </div>
              
              <div style="margin-bottom: 18px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Why Choose Us / Differentiators</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.whyChooseUs || "N/A"}</div>
              </div>

              <div style="margin-bottom: 18px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Core Special Services Offered</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.servicesOffered || "N/A"}</div>
              </div>

              <div style="margin-bottom: 18px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Unique Feature / Special Sauce</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.specialSauce || "N/A"}</div>
              </div>

              <div style="margin-bottom: 30px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Special Promos/Discounts</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.specialOffers || "N/A"}</div>
              </div>

              <!-- Deep Dive Details -->
              <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em; padding-bottom: 6px; border-bottom: 2px solid #f1f5f9;">Deep Dive Details</h3>
              
              <div style="margin-bottom: 18px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Company History</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.companyHistory || "N/A"}</div>
              </div>

              <div style="margin-bottom: 18px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Owner Vision</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.ownerVision || "N/A"}</div>
              </div>

              <div style="margin-bottom: 18px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Known Competitors</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.competitors || "N/A"}</div>
              </div>

              <div style="margin-bottom: 30px;">
                <p style="font-size: 13px; color: #475569; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">Brief FAQs</p>
                <div style="font-size: 14px; color: #334155; background-color: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; line-height: 1.5;">${data.faq || "N/A"}</div>
              </div>

              <!-- Handovers & Security Section -->
              <div style="margin-bottom: 10px; padding: 18px 20px; border-radius: 10px; background-color: #fffbeb; border: 1px solid #f59e0b; border-left: 4px solid #f59e0b;">
                <h3 style="color: #b45309; font-size: 13px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Handovers &amp; Security Info</h3>
                <p style="margin: 0; font-size: 14px; color: #451a03;"><strong>Admin Access Username:</strong> <span style="font-family: monospace; background-color: #fef3c7; padding: 2px 6px; border-radius: 4px;">${data.adminUsername || "N/A"}</span></p>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: #451a03;"><strong>Admin Access Code/Password:</strong> <span style="font-family: monospace; background-color: #fef3c7; padding: 2px 6px; border-radius: 4px;">${data.adminLoginCode || "N/A"}</span></p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #d97706; font-style: italic;">Always handle access details with professional care.</p>
              </div>

            </div>

            <!-- Footer Section with Brand Logo -->
            <div style="background-color: #0b0f19; padding: 35px 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
              <img src="https://i.postimg.cc/1XL45pYk/Can-u-make-only-the-outline-of-the-lightning-be-wh-delpmaspu-removebg-preview.png" alt="Voltz Digital" style="height: 38px; width: auto; margin-bottom: 12px; display: inline-block; referrer-policy: no-referrer;" />
              <p style="margin: 0; color: #ffffff; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;">Voltz Digital</p>
              <p style="margin: 6px 0 0 0; color: #64748b; font-size: 11px; max-width: 320px; margin-left: auto; margin-right: auto; line-height: 1.4;">High-Velocity Digital Infrastructure & Web Design. Custom builds delivered in record time.</p>
              <p style="margin: 15px 0 0 0; color: #475569; font-size: 10px;">This briefing is auto-generated upon onboarding submission securely inside the Client Portal.</p>
            </div>

          </div>
        </div>
      `;

      await transporter.sendMail({
        from: smtpFrom,
        to: targetEmail,
        subject: `🔔 New Client Onboarding Dossier: ${bName}`,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[Onboarding Mailer] Notification email successfully sent to ${targetEmail}`);
    } catch (mailError) {
      console.error("[Onboarding Mailer] Failed to send briefing email:", mailError);
      throw mailError;
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

      // Trigger briefing email dispatch asynchronously (failsafe)
      sendBriefingEmail(newSubmission).catch(err => {
        console.error("Async sending briefing email errored:", err);
      });

      res.status(201).json({ success: true, id: newSubmission.id });
    } catch (error) {
      console.error("Error saving onboarding submission:", error);
      res.status(500).json({ error: "Failed to save submission." });
    }
  });

  // POST: Send test-email manually (Admin protected)
  app.post("/api/onboarding/test-email", async (req, res) => {
    try {
      const providedPassword = req.headers["x-admin-password"] || req.query.password;
      const masterPassword = process.env.ADMIN_PASSWORD || "voltz2026";

      if (providedPassword !== masterPassword) {
         res.status(401).json({ error: "Unauthorized access: Incorrect credentials." });
         return;
      }

      const { submissionId } = req.body || {};
      const submissions = readSubmissions();
      let submission = submissions.find(s => s.id === submissionId);
      if (!submission && submissions.length > 0) {
        submission = submissions[0]; // fallback to first submission
      }

      if (!submission) {
        // Create a dummy submission for testing
        submission = {
          id: "test-diagnostic-uuid",
          submittedAt: new Date().toISOString(),
          status: "new",
          data: {
            businessName: "Voltz Digital Test Labs",
            ownerFirstName: "Test",
            ownerLastName: "User",
            personalEmail: "tester@voltzdigital.com",
            personalNumber: "+1 (876) 555-0199",
            businessEmail: "hello@voltzdigital.com",
            businessNumber: "+1 (876) 555-0100",
            websiteAddress: "https://voltzdigital.com",
            businessDescription: "This is a diagnostic test email to verify that your Nodemailer integration and workspace briefing notification are fully operational.",
            whyChooseUs: "We wanted to ensure seamless, real-time client intake briefings directly to your workspace.",
            specialSauce: "Automated real-time briefing payloads delivered securely.",
            servicesOffered: "Web Design, Software Integration, Digital Growth Marketing",
            specialOffers: "20% off system checkups for the first 3 months",
            companyHistory: "Formed in 2026 to elevate digital infrastructure.",
            competitors: "No competition, we lead.",
            ownerVision: "Continuous improvement and robust system integrity.",
            faq: "Q: Is SMTP working? A: Yes, if you received this!",
            adminUsername: "admin_tester",
            adminLoginCode: "voltz_secure_pass_2026",
            additionalNotes: "Diagnostic dispatch triggered manually via the Admin Portal."
          }
        };
      }

      await sendBriefingEmail(submission);
      res.json({ success: true, message: `Onboarding briefing email dispatched successfully to ${process.env.WORKSPACE_EMAIL || "jordanjade900@voltzdigitalja.com"}.` });
    } catch (error: any) {
      console.error("Manual test email failed:", error);
      res.status(500).json({ error: error.message || "Failed to dispatch test email." });
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
