import { useState, useEffect, useCallback } from "react";
import { classifyImage } from "@/lib/classifier";
import { uploadAndSave, fetchHistory } from "@/lib/actions";
import { Upload, Loader2, Sparkles, Brain, HeartPulse, ImageIcon } from "lucide-react";

const MODES = [
  { key: "general", label: "General", icon: Sparkles },
  { key: "emotion", label: "Emotion", icon: Brain },
  { key: "medical", label: "Medical", icon: HeartPulse },
];

export default function VisionApp() {
  const [selectedMode, setSelectedMode] = useState("general");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => {});
  }, []);

  const handleFileChange = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setResults(null);
  }, []);

  const handleClassify = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const res = await classifyImage(selectedFile, selectedMode);
      setResults(res);
      await uploadAndSave(selectedFile, selectedMode, res);
      const h = await fetchHistory();
      setHistory(h);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file?.type.startsWith("image/")) handleFileChange(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[640px] px-4 py-12 space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Raster</h1>
          <p className="text-muted-foreground">Upload an image. Get instant AI classification.</p>
        </header>

        {/* Mode selector */}
        <div className="flex justify-center gap-2">
          {MODES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedMode(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedMode === key
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Upload card */}
        <div
          onClick={() => document.getElementById("file-input")?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="Preview" className="mx-auto max-h-64 rounded-lg object-contain" />
          ) : (
            <div className="space-y-3 py-8">
              <Upload className="mx-auto text-muted-foreground" size={40} />
              <p className="text-muted-foreground">Drag image here or click to upload</p>
            </div>
          )}
        </div>

        {/* Classify button */}
        <button
          onClick={handleClassify}
          disabled={!selectedFile || isLoading}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={18} className="animate-spin" /> Classifying...</> : "Classify"}
        </button>

        {/* Results */}
        {results && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold text-foreground">{results.topLabel}</p>
              <p className="text-primary text-lg font-semibold">{(results.confidence * 100).toFixed(1)}%</p>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${results.confidence * 100}%` }}
              />
            </div>
            <div className="space-y-2 pt-2">
              {results.allResults.slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground truncate mr-4">{r.label}</span>
                  <span className="text-muted-foreground whitespace-nowrap">{(r.score * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Past classifications</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="p-3 text-left text-muted-foreground font-medium">Image</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Mode</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Label</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Conf.</th>
                    <th className="p-3 text-left text-muted-foreground font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-0">
                      <td className="p-3">
                        {row.image_url ? (
                          <img src={row.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-muted-foreground" />
                        )}
                      </td>
                      <td className="p-3 capitalize text-foreground">{row.mode}</td>
                      <td className="p-3 text-foreground">{row.top_label}</td>
                      <td className="p-3 text-primary">{(row.confidence * 100).toFixed(1)}%</td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(row.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
