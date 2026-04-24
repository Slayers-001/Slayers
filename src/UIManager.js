export class UIManager {
  constructor() {
    this.bootOverlay = document.querySelector('#boot-overlay');
    this.levelText = document.querySelector('#level-text');
    this.xpBar = document.querySelector('#xp-bar');
    this.questTracker = document.querySelector('#quest-tracker');
    this.toast = document.querySelector('#toast');
    this.infoPanel = document.querySelector('#info-panel');
    this.journalPanel = document.querySelector('#journal-panel');
    this.fpsLabel = document.querySelector('#fps');
  }

  hideBootOverlay() { this.bootOverlay.classList.add('hidden'); }

  updateProgress(level, xp, nextXp) {
    this.levelText.textContent = `Level ${level} · XP ${xp}/${nextXp}`;
    this.xpBar.style.width = `${(xp / nextXp) * 100}%`;
  }

  setQuestHtml(html) { this.questTracker.innerHTML = html; }

  showInfo(title, body) {
    this.infoPanel.innerHTML = `<h3>${title}</h3><p>${body}</p><p class="interaction-hint">Press E to interact.</p>`;
    this.infoPanel.classList.remove('hidden');
    requestAnimationFrame(() => this.infoPanel.classList.add('visible'));
  }

  hideInfo() {
    this.infoPanel.classList.remove('visible');
    setTimeout(() => this.infoPanel.classList.add('hidden'), 250);
  }

  showJournal(entries) {
    const content = entries.length ? entries.map((entry, i) => `<div>${i + 1}. ${entry}</div>`).join('') : '<p>No discoveries yet.</p>';
    this.journalPanel.innerHTML = `<h3>Explorer Journal</h3>${content}`;
    this.journalPanel.classList.remove('hidden');
    requestAnimationFrame(() => this.journalPanel.classList.add('visible'));
  }

  hideJournal() {
    this.journalPanel.classList.remove('visible');
    setTimeout(() => this.journalPanel.classList.add('hidden'), 250);
  }

  toastMessage(message) {
    this.toast.textContent = message;
    this.toast.classList.remove('hidden');
    setTimeout(() => this.toast.classList.add('hidden'), 2100);
  }

  setFpsVisible(enabled) { this.fpsLabel.classList.toggle('hidden', !enabled); }
  setFps(value) { this.fpsLabel.textContent = `${value.toFixed(1)} FPS`; }
}
