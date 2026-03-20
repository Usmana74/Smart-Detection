const MEDICAL_LABELS = {
  LABEL_0: "No Finding",
  LABEL_1: "Cardiomegaly",
  LABEL_2: "Edema",
  LABEL_3: "Consolidation",
  LABEL_4: "Pneumonia",
  LABEL_5: "Pleural Effusion",
};

const MODELS = {
  general: "microsoft/resnet-50",
  emotion: "dima806/facial_emotions_image_detection",
  medical: "codewithdark/vit-chest-xray",
};


function mapLabel(label, mode) {
  if (mode === "medical") {
    return MEDICAL_LABELS[label] ?? label;
  }
  return label;
}

export async function classifyImage(imageFile, mode = "general") {
  const res = await fetch(
    `/api/classify?model=${MODELS[mode]}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageFile,
    }
  );

  if (!res.ok) {
    if (res.status === 503) throw new Error("Model is loading, wait 20 seconds and retry.");
    throw new Error(`HF error: ${res.status}`);
  }

  const results = await res.json();
  const list = Array.isArray(results) ? results : results[0];

  const mapped = list.map((r) => ({
    ...r,
    label: mapLabel(r.label, mode),
  }));

  return {
    topLabel: mapped[0].label,
    confidence: mapped[0].score,
    allResults: mapped,
  };
}

