import { sounds } from './audio.js';

// Confirmation and Alert Dialog Service

class DialogManager {
  constructor() {
    this.overlayEl = null;
  }

  ensureDOM() {
    if (!this.overlayEl || !document.body.contains(this.overlayEl)) {
      this.overlayEl = document.createElement('div');
      this.overlayEl.id = 'custom-dialog-overlay';
      this.overlayEl.className = 'dialog-overlay';
      document.body.appendChild(this.overlayEl);
    }
  }

  confirm({
    title = 'Megerősítés szükséges',
    message = 'Biztosan végrehajtod ezt a műveletet?',
    confirmText = 'Igen',
    cancelText = 'Mégsem',
    type = 'danger' // 'danger' | 'warning' | 'info'
  }) {
    return new Promise((resolve) => {
      this.ensureDOM();
      sounds.playTap();

      const iconSVG = type === 'danger' ? `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ` : `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
      `;

      this.overlayEl.innerHTML = `
        <div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title-text">
          <div class="dialog-header-row">
            <div class="dialog-icon-box ${type}">
              ${iconSVG}
            </div>
            <div class="dialog-title" id="dialog-title-text">${title}</div>
          </div>
          <div class="dialog-message">${message}</div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn-cancel" id="dialog-btn-cancel">
              ${cancelText}
            </button>
            <button class="dialog-btn ${type === 'danger' ? 'dialog-btn-danger' : 'dialog-btn-primary'}" id="dialog-btn-confirm">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      requestAnimationFrame(() => {
        this.overlayEl.classList.add('open');
      });

      const cleanup = (result) => {
        sounds.playTap();
        window.removeEventListener('keydown', handleKey);
        this.overlayEl.classList.remove('open');
        setTimeout(() => {
          this.overlayEl.innerHTML = '';
          resolve(result);
        }, 180);
      };

      const handleKey = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          cleanup(true);
        }
      };

      window.addEventListener('keydown', handleKey);

      const confirmBtn = document.getElementById('dialog-btn-confirm');
      const cancelBtn = document.getElementById('dialog-btn-cancel');

      if (confirmBtn) {
        confirmBtn.onclick = () => cleanup(true);
        confirmBtn.focus();
      }
      if (cancelBtn) {
        cancelBtn.onclick = () => cleanup(false);
      }

      this.overlayEl.onclick = (e) => {
        if (e.target === this.overlayEl) {
          cleanup(false);
        }
      };
    });
  }

  alert({
    title = 'Értesítés',
    message = '',
    confirmText = 'Rendben',
    type = 'info'
  }) {
    return new Promise((resolve) => {
      this.ensureDOM();
      sounds.playTap();

      const iconSVG = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 16v-4m0-4h.01" />
        </svg>
      `;

      this.overlayEl.innerHTML = `
        <div class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title-text">
          <div class="dialog-header-row">
            <div class="dialog-icon-box ${type}">
              ${iconSVG}
            </div>
            <div class="dialog-title" id="dialog-title-text">${title}</div>
          </div>
          <div class="dialog-message">${message}</div>
          <div class="dialog-actions">
            <button class="dialog-btn dialog-btn-primary" id="dialog-btn-ok">
              ${confirmText}
            </button>
          </div>
        </div>
      `;

      requestAnimationFrame(() => {
        this.overlayEl.classList.add('open');
      });

      const cleanup = () => {
        sounds.playTap();
        window.removeEventListener('keydown', handleKey);
        this.overlayEl.classList.remove('open');
        setTimeout(() => {
          this.overlayEl.innerHTML = '';
          resolve();
        }, 180);
      };

      const handleKey = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          cleanup();
        }
      };

      window.addEventListener('keydown', handleKey);

      const okBtn = document.getElementById('dialog-btn-ok');
      if (okBtn) {
        okBtn.onclick = () => cleanup();
        okBtn.focus();
      }

      this.overlayEl.onclick = (e) => {
        if (e.target === this.overlayEl) {
          cleanup();
        }
      };
    });
  }
}

export const dialog = new DialogManager();
