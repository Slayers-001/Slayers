export class UIManager {
  constructor() {
    this.panel = document.querySelector('#panel');
    this.questBox = document.querySelector('#quest-box');
    this.xpFill = document.querySelector('#xp-fill');
    this.levelLabel = document.querySelector('#level-label');
    this.toast = document.querySelector('#achievement-toast');
    this.fps = document.querySelector('#fps-counter');
    this.help = document.querySelector('#help-overlay');
  }

  setQuestHtml(html) { this.questBox.innerHTML = html; }

  showPanel(title, body) {
    this.panel.innerHTML = `<h3>${title}</h3><p>${body}</p>`;
    this.panel.classList.remove('hidden');
    requestAnimationFrame(() => this.panel.classList.add('visible'));
  }

  hidePanel() {
    this.panel.classList.remove('visible');
    setTimeout(() => this.panel.classList.add('hidden'), 260);
  }

  updateXP(level, xp, nextXP) {
    this.xpFill.style.width = `${(xp / nextXP) * 100}%`;
    this.levelLabel.textContent = `Level ${level} · XP ${xp}/${nextXP}`;
  }

  toastAchievement(text) {
    this.toast.textContent = `🏆 ${text}`;
    this.toast.classList.remove('hidden');
    setTimeout(() => this.toast.classList.add('hidden'), 2200);
  }

  setFpsVisible(v) { this.fps.classList.toggle('hidden', !v); }
  setFpsText(v) { this.fps.textContent = `${v.toFixed(1)} FPS`; }
  hideHelp() { this.help.classList.add('hidden'); }
}
