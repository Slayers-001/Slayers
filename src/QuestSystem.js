export class QuestSystem {
  constructor(ui) {
    this.ui = ui;
    this.quests = [
      { id: 'park', title: 'Find 5 objects in park/museum', required: 5, progress: 0, done: false },
      { id: 'museum', title: 'Explore museum hall', required: 1, progress: 0, done: false }
    ];
    this.render();
  }

  onDiscover(discovery) {
    const q1 = this.quests[0];
    if (!q1.done) {
      q1.progress += 1;
      if (q1.progress >= q1.required) q1.done = true;
    }
    const q2 = this.quests[1];
    if (discovery.area.includes('Museum')) {
      q2.progress = 1;
      q2.done = true;
    }
    this.render();
  }

  render() {
    const html = `<h4>Quests</h4>${this.quests
      .map((q) => `<div class="objective ${q.done ? 'done' : ''}">${q.done ? '✓' : '•'} ${q.title} (${Math.min(q.progress, q.required)}/${q.required})</div>`)
      .join('')}`;
    this.ui.setQuestHtml(html);
  }
}
