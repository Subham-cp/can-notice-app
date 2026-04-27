export default function PreviewPanel({ previewImage, isGenerating }) {
  return (
    <section className="preview-panel">
      <div className="preview-panel-header">
        <h2 className="panel-title">
          <span className="panel-icon">📄</span>
          Live Preview
        </h2>
        <p className="panel-subtitle">Exact representation of the generated PDF</p>
      </div>

      <div className="preview-frame">
        {isGenerating ? (
          <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Generating preview…</p>
          </div>
        ) : previewImage ? (
          <div className="preview-image-wrap">
            <img
              src={`data:image/png;base64,${previewImage}`}
              alt="Notice preview"
              className="preview-image"
            />
            <div className="preview-overlay-hint">
              <span>🔍 Scroll to inspect · Download for full quality</span>
            </div>
          </div>
        ) : (
          <div className="preview-empty">
            <div className="preview-empty-icon">📋</div>
            <h3>No preview yet</h3>
            <p>Fill in the notice details and click <strong>Preview</strong> to see how it will look on the official CAN template.</p>
            <div className="preview-empty-tips">
              <div className="tip">✅ Template design is preserved 100%</div>
              <div className="tip">✅ Text is overlaid precisely</div>
              <div className="tip">✅ Ready for official use</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
