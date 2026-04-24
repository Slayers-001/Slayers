export class QuestSystem {
  constructor(ui) {
    this.ui = ui;
    this.quests = [
      { id: 'find-five', title: 'Find 5 objects in the world', progress: 0, goal: 5, done: false },
      { id: 'museum', title: 'Explore Museum Hall', progress: 0, goal: 1, done: false },
      { id: 'npc', title: 'Talk to the Guide NPC', progress: 0, goal: 1, done: false }
    ];
    this.render();
  }

  onInteract(item) {
    this.increment('find-five', 1);
    if (item.area === 'Museum Hall') this.increment('museum', 1);
    if (item.type === 'npc') this.increment('npc', 1);
    this.render();
  }

  increment(id, amount) {
    const quest = this.quests.find((q) => q.id === id);
    if (!quest || quest.done) return;
    quest.progress = Math.min(quest.goal, quest.progress + amount);
    quest.done = quest.progress >= quest.goal;
  }

  render() {
    const html = `<h4>Active Quests</h4>${this.quests.map((q) => `<div class="objective ${q.done ? 'done' : ''}">${q.done ? '✓' : '•'} ${q.title} (${q.progress}/${q.goal})</div>`).join('')}`;
    this.ui.setQuestHtml(html);
  }
}
