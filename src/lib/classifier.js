const MODELS = {
  general: "google/vit-base-patch16-224",
  emotion: "trpakov/vit-face-expression",
  medical: "nickmuchi/vit-finetuned-chest-xray",
};
export async function classifyImage(imageFile, mode = "general") {
  const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
  if (!HF_TOKEN) throw new Error("Hugging Face token not set. Add VITE_HF_TOKEN in Workspace Settings → Build Secrets.");
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${MODELS[mode]}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageFile,
    }
  );
  if (!res.ok) throw new Error(`HF error: ${res.status}`);
  const results = await res.json();
  return {
    topLabel: results[0].label,
    confidence: results[0].score,
    allResults: results,
  };
}
