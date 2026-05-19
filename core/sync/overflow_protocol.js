// ============================================
// Overflow Protocol - Escape Mode Handler
// Version: 1.0.0
// ============================================

const OverflowProtocol = {
  initialized: false,

  injectPanel() {
    if (document.getElementById("escape-panel")) return;

    const panel = document.createElement("div");
    panel.id = "escape-panel";
    panel.innerHTML = `
      <h3>🔓 Escape the Brackets</h3>
      <p>System overflow caught. Brackets successfully escaped.</p>
      <pre>\\{\n  "stress": false,\n  "state": "grounded"\n\\}</pre>
      <button onclick="document.getElementById('escape-panel').remove()" style="cursor:pointer; width:100%;">Close Panel</button>
    `;
    document.body.appendChild(panel);
    console.log('✅ Escape Mode Panel rendered.');
  },

  init() {
    if (this.initialized) return;

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.injectPanel();
      }
    });

    this.initialized = true;
    console.log('🔄 OverflowProtocol armed. Press Escape to activate.');
  }
};

window.addEventListener('DOMContentLoaded', () => OverflowProtocol.init());
