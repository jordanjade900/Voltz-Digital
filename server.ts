import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Dodo Payments Checkout Endpoint
  app.post("/api/checkout", async (req, res) => {
    const { amount, currency, productId, customerEmail } = req.body;

    try {
      // Logic to talk to Dodo Payments securely
      // Replace with your actual Dodo Payments API call
      // const response = await fetch('https://api.dodopayments.com/v1/checkout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     amount,
      //     currency,
      //     productId,
      //     customerEmail,
      //     success_url: `${req.headers.origin}/success`,
      //     cancel_url: `${req.headers.origin}/cancel`
      //   })
      // });
      // const data = await response.json();
      
      // Mocking for now
      res.json({ 
        url: "https://checkout.dodopayments.com/mock-session",
        message: "This is a mock checkout URL. Configure DODO_PAYMENTS_API_KEY to use real payments."
      });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Dodo Payments Webhook Endpoint
  app.post("/api/webhooks/dodo", (req, res) => {
    const event = req.body;
    
    // Logic to handle payment success messages
    // Verify webhook signature here
    
    console.log("Received Dodo Webhook:", event);
    
    if (event.type === "payment.succeeded") {
      // Update Firebase database here
      console.log("Payment succeeded for:", event.data.customer_email);
    }
    
    res.json({ received: true });
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
