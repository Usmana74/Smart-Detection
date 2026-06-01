# Smart Detection

> **Production multi-modal Vision Transformer pipeline for real-time image classification across three domains.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-smart--detection.vercel.app-blue)](https://smart-detection.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[→ Live at smart-detection.vercel.app](https://smart-detection.vercel.app)**

---

## Overview

Smart Detection is a full-stack AI application integrating **three Hugging Face Vision Transformer (ViT) models** into a single production pipeline. Upload any image and the system routes it through the appropriate classification head — returning predictions with confidence scores persisted to a PostgreSQL database.

| Mode | Model | Classes | Task |
|------|-------|---------|------|
| **General** | `google/vit-base-patch16-224` | 1,000 (ImageNet-1K) | General object classification |
| **Emotion** | `trpakov/vit-face-expression` | 7 (anger, disgust, fear, happy, neutral, sad, surprise) | Facial emotion recognition |
| **Medical** | `nickmuchi/vit-finetuned-chest-xray-classification` | CheXpert pathology classes | Chest X-ray pathology detection |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React 18 / TypeScript Frontend (Vercel)                    │
│  Drag-and-drop upload → mode selection → result display     │
│  Classification history dashboard · Confidence scoring UI   │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS (Vercel serverless proxy)
                       │ [CORS resolved via proxy rewrite]
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI Backend                                            │
│  /predict endpoint → model router → HuggingFace Inference  │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐    ┌──────────────────────────────────┐
│  Hugging Face    │    │  Supabase PostgreSQL             │
│  Inference API   │    │  classifications table           │
│  (3 ViT models)  │    │  Row Level Security (SQL)        │
└──────────────────┘    │  prediction history persistence  │
                        └──────────────────────────────────┘
```

**Key engineering decisions:**
- **CORS via Vercel serverless proxy** — Hugging Face Inference API does not allow direct browser requests; all model calls are proxied through a Vercel rewrite rule to avoid CORS errors without exposing API keys client-side
- **Row Level Security** — Supabase PostgreSQL enforces RLS via SQL policies; each user's classification history is isolated at the database level
- **Binary inference routing** — the frontend mode selector (General / Emotion / Medical) maps to separate model endpoints; no single multi-head model, keeping each ViT specialised and replaceable independently

---

## Features

- **Drag-and-drop image upload** with instant preview
- **Three classification modes** — switch between General, Emotion, Medical with a single click
- **Confidence scoring UI** — visual confidence bar per prediction
- **Classification history dashboard** — all predictions persisted in Supabase, browsable per session
- **Responsive mobile layout** — works on all screen sizes
- **Serverless deployment** — zero cold-start penalty on Vercel edge network

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |
| ML Models | Hugging Face Transformers (ViT) |
| Database | Supabase (PostgreSQL + RLS) |
| Deployment | Vercel (frontend + serverless proxy) |
| Auth/Storage | Supabase Row Level Security |

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account (free tier works)
- Hugging Face API token

### Frontend

```bash
git clone https://github.com/Usmana74/smart-detection
cd smart-detection
npm install
cp .env.example .env.local
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, HF_API_TOKEN
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
HF_API_TOKEN=your_huggingface_token
```

---

## Models

### General Classification — ViT-Base-Patch16-224
Google's base ViT model fine-tuned on ImageNet-1K. 86M parameters, patch size 16×16, input resolution 224×224. Returns top-5 predictions with confidence scores across 1,000 object categories.

### Facial Emotion Recognition — ViT Face Expression
ViT fine-tuned on facial expression datasets. Classifies into 7 universal emotion categories (Ekman's basic emotions). Input: any face image; pre-processing handles detection and crop implicitly.

### Chest X-Ray Pathology — CheXpert ViT
ViT fine-tuned on the CheXpert chest X-ray dataset. Detects common thoracic pathologies. Intended for research and educational demonstration only — **not validated for clinical use**.

> ⚠️ **Medical disclaimer**: The chest X-ray classification feature is a research demonstration. It is not intended for clinical diagnosis and has not been validated for medical use.

---

## Limitations & Future Work

- [ ] Add confidence calibration — raw softmax scores are not well-calibrated probabilities
- [ ] Multi-image batch processing
- [ ] Model performance metrics dashboard (per-class accuracy on validation sets)
- [ ] Replace Hugging Face Inference API with self-hosted ONNX models for lower latency
- [ ] Add GradCAM visualisation — highlight which image regions drove the prediction

---

## Repository Structure

```
smart-detection/
├── src/
│   ├── components/        # React UI components
│   ├── pages/             # Next.js / React Router pages
│   └── lib/               # Supabase client, API utilities
├── backend/
│   ├── main.py            # FastAPI app + /predict endpoint
│   └── requirements.txt
├── public/
├── .env.example
├── vercel.json            # Proxy rewrite rules (CORS fix)
└── README.md
```

---

## Citation

```bibtex
@misc{ahmad2026smartdetection,
  author = {Ahmad, Mohammad Usman},
  title  = {Smart Detection: Multi-Modal Vision Transformer Classification Pipeline},
  year   = {2026},
  url    = {https://github.com/Usmana74/smart-detection}
}
```

---

## Author

**Mohammad Usman Ahmad**
BS Computer Science (AI/CV), PMAS Arid Agriculture University, Pakistan · CGPA: 3.8/4.0

[Live Demo](https://smart-detection.vercel.app) · [GitHub](https://github.com/Usmana74) · [LinkedIn](https://linkedin.com/in/usman-ahmad-297b63262) · [PyPI — dataaudit](https://pypi.org/project/dataaudit-tool/)
