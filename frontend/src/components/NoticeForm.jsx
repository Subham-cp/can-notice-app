import { useEffect, useRef } from "react";

export default function NoticeForm({
  formData, setFormData,
  onPreview, onImprove, onDownload,
  isGenerating, isImproving, isDownloading,
  error, showCompare, originalBody, onRevert,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [formData.body]);

  const update = (field) => (e) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <section className="form-panel">
      <div className="form-panel-header">
        <h2 className="panel-title">
          <span className="panel-icon">✏️</span>
          Notice Details
        </h2>
        <p className="panel-subtitle">Fill in the fields below — the template design is preserved automatically.</p>
      </div>

      {error && (
        <div className="error-box">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="form-fields">
        {/* Row: Ref Number + Date */}
        <div className="field-row">
          <div className="field-group">
            <label className="field-label">
              Notice Number
              <span className="field-hint">e.g. 001</span>
            </label>
            <div className="input-prefix-wrap">
              <span className="input-prefix">CAN/26-27/</span>
              <input
                className="field-input prefix-input"
                type="text"
                placeholder="001"
                value={formData.ref_number}
                onChange={update("ref_number")}
                maxLength={20}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">
              Date
              <span className="field-hint">e.g. 25th April 2026</span>
            </label>
            <input
              className="field-input"
              type="text"
              placeholder="25th April 2026"
              value={formData.date}
              onChange={update("date")}
            />
          </div>
        </div>

        {/* Subject */}
        <div className="field-group">
          <label className="field-label">
            Subject / Title
            <span className="field-hint">Optional — placed before the body</span>
          </label>
          <input
            className="field-input"
            type="text"
            placeholder="e.g. Annual Technical Symposium 2026"
            value={formData.subject}
            onChange={update("subject")}
          />
        </div>

        {/* Body */}
        <div className="field-group">
          <label className="field-label">
            Notice Body
            <span className="field-hint required">Required</span>
          </label>

          {/* Compare bar — shown after AI improvement */}
          {showCompare && originalBody !== null && (
            <div className="compare-bar">
              <span className="compare-label">✨ AI improved your text</span>
              <button className="compare-btn revert" onClick={onRevert} type="button">
                ↩ Revert to original
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            className="field-textarea"
            placeholder={`Write the full notice body here.\n\nUse blank lines to separate paragraphs.\n\nExample:\nThis is to inform all students that...\n\nAll interested candidates are requested to...`}
            value={formData.body}
            onChange={update("body")}
            rows={10}
          />
          <div className="textarea-meta">
            {formData.body.length} characters · {formData.body.split('\n').filter(l => l.trim()).length} lines
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-bar">
        <div className="action-left">
          <button
            className="btn btn-ai"
            onClick={onImprove}
            disabled={isImproving || !formData.body.trim()}
            type="button"
          >
            {isImproving ? (
              <><span className="spinner"></span>Improving…</>
            ) : (
              <><span>✨</span>AI Improve</>
            )}
          </button>
        </div>

        <div className="action-right">
          <button
            className="btn btn-preview"
            onClick={onPreview}
            disabled={isGenerating || !formData.body.trim()}
            type="button"
          >
            {isGenerating ? (
              <><span className="spinner"></span>Generating…</>
            ) : (
              <><span>👁</span>Preview</>
            )}
          </button>

          <button
            className="btn btn-download"
            onClick={onDownload}
            disabled={isDownloading || !formData.body.trim()}
            type="button"
          >
            {isDownloading ? (
              <><span className="spinner"></span>Preparing…</>
            ) : (
              <><span>⬇</span>Download PDF</>
            )}
          </button>
        </div>
      </div>

      <div className="workflow-hint">
        <div className="workflow-step">
          <span className="step-num">1</span>
          Fill details
        </div>
        <div className="workflow-arrow">→</div>
        <div className="workflow-step">
          <span className="step-num">2</span>
          (Optional) AI Improve
        </div>
        <div className="workflow-arrow">→</div>
        <div className="workflow-step">
          <span className="step-num">3</span>
          Preview
        </div>
        <div className="workflow-arrow">→</div>
        <div className="workflow-step">
          <span className="step-num">4</span>
          Download
        </div>
      </div>
    </section>
  );
}
