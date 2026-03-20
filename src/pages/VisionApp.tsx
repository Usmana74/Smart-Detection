import { useState, useEffect, useCallback } from "react";
import { classifyImage } from "@/lib/classifier";
import { uploadAndSave, fetchHistory, fetchCount } from "@/lib/actions";
import {
  Upload, Loader2, AlertTriangle, ImageIcon,
  Clock, CheckCircle2, BarChart2, Globe, Smile, Stethoscope
} from "lucide-react";

const MODES = [
  {
    key: "general",
    label: "General",
    icon: Globe,
    iconColor: "#2563eb",
    iconBg: "#eff6ff",
    iconActiveBg: "#2563eb",
    placeholder: "Any image — objects, animals, scenes",
  },
  {
    key: "emotion",
    label: "Emotion",
    icon: Smile,
    iconColor: "#d97706",
    iconBg: "#fffbeb",
    iconActiveBg: "#d97706",
    placeholder: "A photo with a clear human face",
  },
  {
    key: "medical",
    label: "Medical",
    icon: Stethoscope,
    iconColor: "#059669",
    iconBg: "#ecfdf5",
    iconActiveBg: "#059669",
    placeholder: "A chest X-ray — detects chest pathologies",
  },
];

function CircleRing({ value, color }: { value: number; color: string }) {
  const r = 30, circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="76" height="76" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="38" cy="38" r={r} fill="none" stroke="#ede9f5" strokeWidth="5" />
      <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

export default function VisionApp() {
  const [mode, setMode]             = useState("general");
  const [file, setFile]             = useState<File | null>(null);
  const [preview, setPreview]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [results, setResults]       = useState<any>(null);
  const [history, setHistory]       = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [drag, setDrag]             = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    fetchHistory().then(setHistory).catch(() => {});
    fetchCount().then(setTotalCount).catch(() => {});
  }, []);

  const pickFile = useCallback((f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults(null);
    setError("");
  }, []);

  const handleClassify = async () => {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const res = await classifyImage(file, mode);
      setResults(res);
      await uploadAndSave(file, mode, res).catch(() => {});
      const h = await fetchHistory().catch(() => []);
      setHistory(h);
      const c = await fetchCount().catch(() => totalCount);
      setTotalCount(c);
    } catch (e: any) {
      setError(e.message || "Classification failed.");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer?.files?.[0];
    if (f?.type.startsWith("image/")) pickFile(f);
  };

  const current  = MODES.find(m => m.key === mode)!;
  const confPct  = results ? +(results.confidence * 100).toFixed(1) : 0;
  const topScore = results ? results.allResults[0].score * 100 : 1;
  const lowConf  = results && mode === "emotion" && confPct < 40;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0eff4; font-family: 'Plus Jakarta Sans', sans-serif; }

        .page { min-height: 100vh; background: #f0eff4; padding: 0 20px 80px; }

        /* Navbar */
        .navbar {
          max-width: 900px; margin: 0 auto;
          padding: 20px 0 18px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #e4e2ec; margin-bottom: 36px;
        }
        .navbar-logo {
          display: flex; align-items: center; gap: 8px;
          font-size: 17px; font-weight: 700; color: #1a1523; letter-spacing: -0.3px;
        }
        .navbar-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #7c6fa0; }
        .navbar-badge {
          font-size: 11px; font-weight: 500; padding: 4px 10px;
          border-radius: 20px; background: #ede9f5; color: #7c6fa0; letter-spacing: 0.2px;
        }

        /* Stats */
        .stats-row { display: flex; gap: 12px; max-width: 900px; margin: 0 auto 20px; }
        .stat-box {
          flex: 1; background: #fff; border-radius: 14px;
          border: 1px solid #e8e5f0; padding: 16px 18px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .stat-val { font-size: 24px; font-weight: 700; color: #1a1523; letter-spacing: -0.5px; }
        .stat-lbl { font-size: 11px; color: #9590a8; margin-top: 3px; }

        /* Grid */
        .grid {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }
        @media (max-width: 680px) { .grid { grid-template-columns: 1fr; } }
        .col-left  { display: flex; flex-direction: column; gap: 20px; }
        .col-right { display: flex; flex-direction: column; gap: 20px; }

        /* Card */
        .card {
          background: #fff; border-radius: 14px;
          border: 1px solid #e8e5f0; padding: 22px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .card-title {
          font-size: 13px; font-weight: 600; color: #1a1523;
          margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
        }
        .card-title-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: #f3f0f8; display: flex; align-items: center;
          justify-content: center; color: #7c6fa0;
        }

        /* Mode list */
        .mode-list { display: flex; flex-direction: column; gap: 8px; }
        .mode-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 14px; border-radius: 9px;
          border: 1.5px solid transparent;
          cursor: pointer; transition: all 0.15s ease;
          background: #faf9fc;
        }
        .mode-item:hover { background: #f5f2fb; border-color: #d4cee8; }
        .mode-item-icon {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s ease;
        }
        .mode-item-text { flex: 1; }
        .mode-item-label { font-size: 13px; font-weight: 600; color: #1a1523; }
        .mode-item-sub   { font-size: 11px; color: #9590a8; margin-top: 1px; }
        .mode-item-radio {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid #d4cee8; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .mode-item-radio-dot {
          width: 7px; height: 7px; border-radius: 50%;
          opacity: 0; transition: opacity 0.15s;
        }

        /* Upload */
        .upload-zone {
          border: 1.5px dashed #d4cee8; border-radius: 10px;
          min-height: 170px; display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          transition: all 0.18s ease; background: #faf9fc;
          overflow: hidden; margin-bottom: 14px;
        }
        .upload-zone:hover { border-color: #7c6fa0; background: #f3f0f8; }
        .upload-zone.drag  { border-color: #7c6fa0; background: #ede9f5; }
        .upload-empty {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 36px 20px; text-align: center;
        }
        .upload-icon-box {
          width: 40px; height: 40px; border-radius: 9px;
          border: 1px solid #e4e2ec; background: #fff;
          display: flex; align-items: center; justify-content: center; color: #9590a8;
        }
        .upload-text { font-size: 13px; color: #6b6880; line-height: 1.5; max-width: 180px; }
        .upload-hint { font-size: 11px; color: #b0acbf; }
        .upload-preview { width: 100%; max-height: 200px; object-fit: contain; padding: 10px; border-radius: 10px; }

        /* Button */
        .btn-classify {
          width: 100%; padding: 12px; border-radius: 9px; border: none;
          background: #7c6fa0; color: #fff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.18s ease; letter-spacing: 0.1px;
        }
        .btn-classify:hover:not(:disabled) {
          background: #6b5f8e; transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(124,111,160,0.3);
        }
        .btn-classify:disabled { background: #e4e2ec; color: #b0acbf; cursor: not-allowed; }

        /* Alerts */
        .alert {
          display: flex; align-items: flex-start; gap: 9px;
          padding: 11px 13px; border-radius: 8px;
          font-size: 13px; line-height: 1.5; margin-top: 12px;
          animation: fadeUp 0.25s ease both;
        }
        .alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
        .alert-warn  { background: #fffbeb; border: 1px solid #fde68a; color: #b45309; }

        /* Results */
        .results-hero {
          display: flex; align-items: center; gap: 16px;
          padding: 18px; border-radius: 10px;
          background: #f8f7fc; margin-bottom: 16px;
        }
        .results-hero-ring {
          position: relative; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .results-ring-label {
          position: absolute; font-size: 13px;
          font-weight: 700; letter-spacing: -0.3px;
        }
        .results-hero-body { flex: 1; min-width: 0; }
        .results-mode-tag {
          font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: #9590a8; margin-bottom: 4px;
        }
        .results-top-label {
          font-size: 20px; font-weight: 700; color: #1a1523;
          text-transform: capitalize; letter-spacing: -0.3px; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .results-sub { font-size: 12px; color: #9590a8; margin-top: 3px; }

        .results-divider {
          font-size: 10px; font-weight: 600; letter-spacing: 1.5px;
          text-transform: uppercase; color: #b0acbf; margin-bottom: 10px;
        }
        .result-row {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 0; border-bottom: 1px solid #f3f0f8;
        }
        .result-row:last-child { border-bottom: none; }
        .result-idx   { font-size: 11px; color: #c4c0d4; width: 14px; text-align: right; flex-shrink: 0; }
        .result-lbl   { flex: 1; font-size: 13px; text-transform: capitalize; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .result-lbl.top  { color: #1a1523; font-weight: 600; }
        .result-lbl.rest { color: #6b6880; }
        .result-track { width: 60px; height: 3px; border-radius: 99px; background: #ede9f5; flex-shrink: 0; }
        .result-fill  { height: 100%; border-radius: 99px; transition: width 0.7s cubic-bezier(.4,0,.2,1); }
        .result-pct   { font-size: 12px; width: 36px; text-align: right; flex-shrink: 0; }
        .result-pct.top  { font-weight: 600; }
        .result-pct.rest { color: #b0acbf; }

        /* Empty state */
        .empty-results {
          display: flex; flex-direction: column; align-items: center;
          gap: 10px; padding: 36px 20px; text-align: center;
        }
        .empty-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: #f3f0f8; border: 1px solid #e4e2ec;
          display: flex; align-items: center; justify-content: center; color: #b0acbf;
        }
        .empty-text { font-size: 13px; color: #9590a8; }
        .empty-sub  { font-size: 11px; color: #c4c0d4; }

        /* History */
        .history-list { display: flex; flex-direction: column; }
        .history-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid #f3f0f8;
          transition: background 0.12s;
        }
        .history-row:last-child { border-bottom: none; }
        .history-thumb {
          width: 36px; height: 36px; border-radius: 7px;
          object-fit: cover; background: #f3f0f8;
          border: 1px solid #e8e5f0; flex-shrink: 0;
        }
        .history-body { flex: 1; min-width: 0; }
        .history-label { font-size: 13px; font-weight: 600; color: #1a1523; text-transform: capitalize; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .history-meta  { font-size: 11px; color: #9590a8; margin-top: 1px; }
        .history-pill  {
          display: inline-block; padding: 2px 7px; border-radius: 5px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
          text-transform: uppercase; flex-shrink: 0;
        }
        .history-conf { font-size: 12px; font-weight: 600; flex-shrink: 0; }

        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fadein { animation: fadeUp 0.3s ease both; }
      `}</style>

      <div className="page">

        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-logo">
            <div className="navbar-logo-dot" />
            Smart Detection
          </div>
          <span className="navbar-badge">Image Classifier</span>
        </nav>

        {/* Stats */}
        {totalCount > 0 && (
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-val">{totalCount}</div>
              <div className="stat-lbl">Total classifications</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">
                {history.length > 0
                  ? (history.reduce((a, r) => a + r.confidence, 0) / history.length * 100).toFixed(0) + "%"
                  : "—"}
              </div>
              <div className="stat-lbl">Avg. confidence</div>
            </div>
            <div className="stat-box">
              <div className="stat-val" style={{ textTransform: "capitalize" }}>
                {history[0]?.mode ?? "—"}
              </div>
              <div className="stat-lbl">Last mode used</div>
            </div>
          </div>
        )}

        <div className="grid">

          {/* ── Left column ── */}
          <div className="col-left">

            {/* Mode selector */}
            <div className="card">
              <div className="card-title">
                <div className="card-title-icon"><BarChart2 size={14} /></div>
                Classification mode
              </div>
              <div className="mode-list">
                {MODES.map(({ key, label, icon: Icon, iconColor, iconBg, iconActiveBg, placeholder }) => {
                  const isActive = mode === key;
                  return (
                    <div
                      key={key}
                      className={`mode-item ${isActive ? "active" : ""}`}
                      style={isActive ? { borderColor: iconColor, background: iconBg } : {}}
                      onClick={() => { setMode(key); setResults(null); setError(""); }}
                    >
                      <div
                        className="mode-item-icon"
                        style={{
                          background: isActive ? iconActiveBg : iconBg,
                          color: isActive ? "#fff" : iconColor,
                        }}
                      >
                        <Icon size={15} />
                      </div>
                      <div className="mode-item-text">
                        <div className="mode-item-label">{label}</div>
                        <div className="mode-item-sub">{placeholder}</div>
                      </div>
                      <div
                        className="mode-item-radio"
                        style={isActive ? { borderColor: iconColor } : {}}
                      >
                        <div
                          className="mode-item-radio-dot"
                          style={{ background: iconColor, opacity: isActive ? 1 : 0 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upload */}
            <div className="card">
              <div className="card-title">
                <div className="card-title-icon"><Upload size={14} /></div>
                Upload image
              </div>
              <div
                className={`upload-zone ${drag ? "drag" : ""}`}
                onClick={() => document.getElementById("fi")?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
              >
                <input id="fi" type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => pickFile(e.target.files?.[0])} />
                {preview
                  ? <img src={preview} alt="preview" className="upload-preview" />
                  : (
                    <div className="upload-empty">
                      <div className="upload-icon-box"><Upload size={17} /></div>
                      <p className="upload-text">{current.placeholder}</p>
                      <span className="upload-hint">JPG, PNG, WEBP</span>
                    </div>
                  )}
              </div>

              <button className="btn-classify" onClick={handleClassify} disabled={!file || loading}>
                {loading
                  ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />Analysing...</>
                  : <><CheckCircle2 size={15} />Classify Image</>}
              </button>

              {error   && <div className="alert alert-error"><AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}
              {lowConf && <div className="alert alert-warn"><AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />Low confidence — make sure the image contains a clear human face.</div>}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="col-right">

            {/* Results */}
            <div className="card">
              <div className="card-title">
                <div
                  className="card-title-icon"
                  style={{ background: current.iconBg, color: current.iconColor }}
                >
                  <current.icon size={14} />
                </div>
                Results
              </div>

              {results ? (
                <div className="fadein">
                  <div className="results-hero" style={{ background: `${current.iconBg}` }}>
                    <div className="results-hero-ring">
                      <CircleRing value={confPct} color={current.iconColor} />
                      <span className="results-ring-label" style={{ color: current.iconColor }}>
                        {confPct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="results-hero-body">
                      <div className="results-mode-tag">{current.label} mode</div>
                      <div className="results-top-label">{results.topLabel}</div>
                      <div className="results-sub">Confidence score</div>
                    </div>
                  </div>

                  <div className="results-divider">Top predictions</div>
                  <div>
                    {results.allResults.slice(0, 5).map((r: any, i: number) => {
                      const pct = r.score * 100;
                      const isTop = i === 0;
                      return (
                        <div key={i} className="result-row">
                          <span className="result-idx">{i + 1}</span>
                          <span className={`result-lbl ${isTop ? "top" : "rest"}`}>{r.label}</span>
                          <div className="result-track">
                            <div className="result-fill" style={{
                              width: `${(pct / topScore) * 100}%`,
                              background: isTop ? current.iconColor : "#d4cee8",
                            }} />
                          </div>
                          <span
                            className={`result-pct ${isTop ? "top" : "rest"}`}
                            style={isTop ? { color: current.iconColor } : {}}
                          >
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="empty-results">
                  <div className="empty-icon"><BarChart2 size={20} /></div>
                  <p className="empty-text">No results yet</p>
                  <p className="empty-sub">Upload an image and click Classify</p>
                </div>
              )}
            </div>

            {/* History */}
            <div className="card">
              <div className="card-title">
                <div className="card-title-icon"><Clock size={14} /></div>
                Recent activity
                {totalCount > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#9590a8", fontWeight: 400 }}>
                    {totalCount} total
                  </span>
                )}
              </div>

              {history.length > 0 ? (
                <div className="history-list">
                  {history.slice(0, 6).map(row => {
                    const rowMode = MODES.find(m => m.key === row.mode) ?? MODES[0];
                    return (
                      <div key={row.id} className="history-row">
                        {row.image_url
                          ? <img src={row.image_url} className="history-thumb" alt="" />
                          : <div className="history-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <ImageIcon size={14} color="#b0acbf" />
                            </div>
                        }
                        <div className="history-body">
                          <div className="history-label">{row.top_label}</div>
                          <div className="history-meta">
                            {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <span
                          className="history-pill"
                          style={{ background: rowMode.iconBg, color: rowMode.iconColor }}
                        >
                          {row.mode}
                        </span>
                        <span className="history-conf" style={{ color: rowMode.iconColor }}>
                          {(row.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-results" style={{ padding: "24px 20px" }}>
                  <div className="empty-icon"><Clock size={18} /></div>
                  <p className="empty-text">No history yet</p>
                  <p className="empty-sub">Your classifications will appear here</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}