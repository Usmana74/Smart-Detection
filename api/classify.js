export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const model = req.query.model;
  if (!model) return res.status(400).json({ error: "Model required" });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);

    const url = `https://api-inference.huggingface.co/models/${model}`;
    console.log("Calling HF URL:", url);
    console.log("Token exists:", !!process.env.HF_TOKEN);
    console.log("Body size:", body.length);

    const hfRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      body,
    });

    console.log("HF status:", hfRes.status);
    const text = await hfRes.text();
    console.log("HF response preview:", text.slice(0, 200));

    res.setHeader("Content-Type", "application/json");
    return res.status(hfRes.status).send(text);

  } catch (err) {
    console.error("Classify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}