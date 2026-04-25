export class QuestSystem {
  constructor(ui, snapshot = null, findGoal = 10) {
    this.ui = ui;
    this.quests = snapshot?.quests ?? [
      { id: 'find-many', title: `Find ${findGoal} relics`, progress: 0, goal: findGoal, done: false },
      { id: 'museum', title: 'Explore Museum Hall', progress: 0, goal: 3, done: false },
      { id: 'market', title: 'Collect items in Market Lane', progress: 0, goal: 3, done: false },
      { id: 'npc', title: 'Talk to the Guide NPC', progress: 0, goal: 1, done: false }
    ];
    this.render();
  }

  serialize() { return { quests: this.quests }; }

  onInteract(item) {
    if (item.type !== 'npc' && !item.wasKnown) this.increment('find-many', 1);
    if (item.area === 'Museum Hall' && !item.wasKnown) this.increment('museum', 1);
    if (item.area === 'Market Lane' && !item.wasKnown) this.increment('market', 1);
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
    const html = `<h4>Competition Objectives</h4>${this.quests
      .map((q) => `<div class="objective ${q.done ? 'done' : ''}">${q.done ? '✓' : '•'} ${q.title} (${q.progress}/${q.goal})</div>`)
      .join('')}`;
    this.ui.setQuestHtml(html);
  }
}
