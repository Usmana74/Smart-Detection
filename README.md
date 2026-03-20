# Smart Detection — Multi-Modal Image Classification App

A full-stack AI web application that classifies images across three domains in real time — general objects, facial emotions, and chest X-ray pathologies.

Built with React, Supabase, and the Hugging Face Inference API as a portfolio project demonstrating practical AI integration and full-stack development skills.

---

## Live Demo

>https://smart-detection.vercel.app/

---

## Screenshots

<img width="947" height="414" alt="medical" src="https://github.com/user-attachments/assets/7770466d-5385-4497-8792-dc6cee3a153a" />


---

## Features

- **Three classification modes** — General objects, Facial emotions, Chest X-ray pathology detection
- **Real-time AI inference** via Hugging Face Inference API (Vision Transformer models)
- **Image upload** with drag-and-drop support and live preview
- **Confidence scoring** with circular progress ring and ranked prediction list
- **Classification history** stored in Supabase with image thumbnails and timestamps
- **Dashboard stats** — total classifications, average confidence, last mode used
- **Responsive layout** — works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Plain CSS (no framework) |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI Models | Hugging Face Inference API |
| Deployment | Vercel |

---

## AI Models Used

| Mode | Model | Task |
|------|-------|------|
| General | `google/vit-base-patch16-224` | 1000-class ImageNet classification |
| Emotion | `dima806/facial_emotions_image_detection` | 7 facial expression classes |
| Medical | `codewithdark/vit-chest-xray` | Chest pathology detection (CheXpert) |

All three models use the Vision Transformer (ViT) architecture fine-tuned for their respective domains.

---

## Project Structure

```
src/
├── lib/
│   ├── classifier.js     # Hugging Face API calls + label mapping
│   ├── actions.js        # Supabase storage upload + DB insert/fetch
│   └── supabaseClient.js # Supabase client initialization
├── VisionApp.tsx         # Main dashboard component
└── main.tsx
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smart-detection.git
cd smart-detection
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set up Supabase

Create a project at [supabase.com](https://supabase.com) and run this SQL in the SQL Editor:

```sql
create table classifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  image_url text not null,
  mode text not null,
  top_label text not null,
  confidence float not null,
  all_results jsonb
);

alter table classifications disable row level security;
```

Then go to **Storage** and create a public bucket named `classification-images`.

### 4. Add environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_HF_TOKEN=your_hugging_face_token
```

- Supabase keys: Project Settings → API
- HF token: [huggingface.co](https://huggingface.co) → Settings → Access Tokens → New Token (Read)

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

---

## How It Works

1. User selects a classification mode (General / Emotion / Medical)
2. User uploads an image via drag-and-drop or file picker
3. On classify, the image is sent as binary to the Hugging Face Inference API
4. The API returns a ranked list of labels with confidence scores
5. Results are displayed in the dashboard with a confidence ring and bar chart
6. The image is uploaded to Supabase Storage and the result is saved to the database
7. Classification history is fetched and displayed in the Recent Activity panel

---

## Deployment

This project is deployed on Vercel. To deploy your own:

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add the three environment variables in Vercel's project settings
4. Deploy

---

## Disclaimer

The medical classification mode is intended for educational and demonstration purposes only. It is **not** suitable for clinical use or real medical diagnosis.

---

## Author

**Usman Ahmad**


[LinkedIn](https://linkedin.com/in/your-profile) · [GitHub](https://github.com/your-username)

---

## License

MIT
