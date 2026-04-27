export default function Header() {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="brand-icon">CAN</div>
          <div className="brand-text">
            <span className="brand-name">Notice Generator</span>
            <span className="brand-sub">Computer Association of NERIST · CSE Department</span>
          </div>
        </div>
        <div className="header-badge">
          <span className="badge-dot"></span>
          Template Locked
        </div>
      </div>
    </header>
  );
}
