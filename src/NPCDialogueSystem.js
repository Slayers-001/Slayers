export class NPCDialogueSystem {
  constructor(uiToast, panelEl) {
    this.uiToast = uiToast;
    this.panelEl = panelEl;
    this.dialogues = [
      'Guide: Welcome, slayer. Start by exploring the museum zone.',
      'Guide: Track your journal with J and quests on the top-right.',
      'Guide: Admin panel can help testing. Password is Slayers.',
      'Guide: Rain mode and night mode change visibility, plan your route.'
    ];
    this.index = 0;
  }

  talk() {
    const line = this.dialogues[this.index % this.dialogues.length];
    this.index += 1;
    this.panelEl.innerHTML = `<h3>NPC Guide</h3><p>${line}</p>`;
    this.panelEl.classList.remove('hidden');
    requestAnimationFrame(() => this.panelEl.classList.add('visible'));
    this.uiToast('💬 Guide updated your objective hints.');
    setTimeout(() => {
      this.panelEl.classList.remove('visible');
      setTimeout(() => this.panelEl.classList.add('hidden'), 250);
    }, 2600);
  }
}
