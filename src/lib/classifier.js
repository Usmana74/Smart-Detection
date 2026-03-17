const MODELS = {
  general: "google/vit-base-patch16-224",
  emotion: "trpakov/vit-face-expression",
  medical: "nickmuchi/vit-finetuned-chest-xray",
};
export async function classifyImage(imageFile, mode = "general") {
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${MODELS[mode]}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
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
