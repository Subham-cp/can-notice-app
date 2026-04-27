import { useState, useCallback, useRef } from "react";
import NoticeForm from "./components/NoticeForm";
import PreviewPanel from "./components/PreviewPanel";
import Header from "./components/Header";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [formData, setFormData] = useState({
    ref_number: "",
    date: "",
    subject: "",
    body: "",
  });

  const [previewImage, setPreviewImage]   = useState(null);
  const [originalBody, setOriginalBody]   = useState(null); // for compare
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isImproving, setIsImproving]     = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError]                 = useState(null);
  const [showCompare, setShowCompare]     = useState(false);

  const generatePreview = useCallback(async (data = formData) => {
    if (!data.body.trim()) {
      setError("Please enter notice body content.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Preview failed");
      setPreviewImage(json.preview_image);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  }, [formData]);

  const handleImprove = async () => {
    if (!formData.body.trim()) {
      setError("Nothing to improve.");
      return;
    }
    setIsImproving(true);
    setError(null);
    setOriginalBody(formData.body); // save for compare
    try {
      const res = await fetch(`${API_BASE}/api/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: formData.body, subject: formData.subject }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Improvement failed");
      setFormData(prev => ({ ...prev, body: json.improved_body }));
      setShowCompare(true);
    } catch (e) {
      setError(e.message);
      setOriginalBody(null);
    } finally {
      setIsImproving(false);
    }
  };

  const handleDownload = async () => {
    if (!formData.body.trim()) {
      setError("Please enter notice body content.");
      return;
    }
    setIsDownloading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Download failed");
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `CAN_Notice_${formData.ref_number || "draft"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRevertBody = () => {
    if (originalBody !== null) {
      setFormData(prev => ({ ...prev, body: originalBody }));
      setOriginalBody(null);
      setShowCompare(false);
    }
  };

  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <div className="split-layout">
          <NoticeForm
            formData={formData}
            setFormData={setFormData}
            onPreview={() => generatePreview()}
            onImprove={handleImprove}
            onDownload={handleDownload}
            isGenerating={isGenerating}
            isImproving={isImproving}
            isDownloading={isDownloading}
            error={error}
            showCompare={showCompare}
            originalBody={originalBody}
            onRevert={handleRevertBody}
          />
          <PreviewPanel
            previewImage={previewImage}
            isGenerating={isGenerating}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
