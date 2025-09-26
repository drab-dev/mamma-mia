// ES module syntax
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

// Load env variables
dotenv.config({ path: ".env.development" });

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://127.0.0.1:3000", // Vite dev server
      "http://localhost:3000", // just in case
    ],
    credentials: true,
  })
);

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// --- Route 1: Text to Diagram ---
app.post("/v1/ai/text-to-diagram/generate", async (req, res) => {
  try {
    const { prompt, diagramType } = req.body;
    console.log("🔥 Text-to-diagram request:", { prompt, diagramType });

    // Default to flowchart if no diagramType is passed
    const type = diagramType || "flowchart";

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: `Create a **${type}** in Mermaid syntax for the following description: "${prompt}".
                        Only output Mermaid code, no explanations, no markdown fences.`,
            },
          ],
        }),
      }
    );

    const data = await groqResponse.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error("❌ Invalid Groq response:", data);
      return res.status(500).json({ error: "AI generation failed", details: data });
    }

    const raw = data.choices[0].message.content;
    const mermaidCode = raw.replace(/```mermaid|```/g, "").trim();

    res.json({ generatedResponse: mermaidCode });
  } catch (err) {
    console.error("❌ Error in text-to-diagram:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Route 2: Wireframe to Code ---
app.post("/v1/ai/diagram-to-code/generate", async (req, res) => {
  try {
    const { elements, texts, theme } = req.body;
    console.log("🔥 Wireframe-to-code request:", { elements, texts, theme });

    // Construct prompt for AI
    const prompt = `Convert the following wireframe JSON into a React functional component using Tailwind CSS.
    Interpret common UI patterns:
    - Rectangle + text inside → <button>.
    - Rectangle alone → <div>.
    - Lines at the top → <header>.
    - Input-like rectangles → <input>.
    - Use semantic HTML (button, input, form, header, etc.) where appropriate.
    - Ignore absolute positions unless essential.
    - DO NOT explain the code.
    - DO NOT include markdown fences (like \`\`\`).
    - Return ONLY valid JSX code.
      
    Wireframe JSON:
    ${JSON.stringify(elements, null, 2)}`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await groqResponse.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error("❌ Invalid Groq response:", data);
      return res.status(500).json({ error: "AI generation failed", details: data });
    }

    // ✅ Extract raw code and strip fences
    let reactCode = data.choices[0].message.content.trim();
    reactCode = reactCode.replace(/```[a-zA-Z]*\n?/g, "").replace(/```/g, "").trim();

    // ✅ Escape < and >
    const escapedCode = reactCode.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // ✅ Return formatted <pre><code> block
    res.json({
      html: `<pre style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;white-space:pre-wrap;word-break:break-word;font-family:monospace;font-size:14px;"><code>${escapedCode}</code></pre>`,
    });
  } catch (err) {
    console.error("❌ Error in wireframe-to-code:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log("✅ Backend running on http://localhost:3000");
});
