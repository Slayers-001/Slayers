export class ProgressionSystem {
  constructor(ui) {
    this.ui = ui;
    this.level = 1;
    this.xp = 0;
    this.nextXp = 110;
    this.journalEntries = [];
    this.achievements = new Set();
    this.discoveredIds = new Set();
    this.ui.updateProgress(this.level, this.xp, this.nextXp);
  }

  registerDiscovery(item) {
    if (this.discoveredIds.has(item.name)) return false;
    this.discoveredIds.add(item.name);

    this.journalEntries.push(`${item.name} discovered in ${item.area}`);
    this.addXp(item.type === 'easter_egg' ? 80 : 40);

    if (this.discoveredIds.size >= 3) this.unlock('Keen Observer');
    if (this.discoveredIds.size >= 6) this.unlock('Master Explorer');
    if (item.type === 'easter_egg') this.unlock('Treasure Hunter');
    return true;
  }

  addXp(amount) {
    this.xp += amount;
    while (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level += 1;
      this.nextXp = Math.floor(this.nextXp * 1.28);
      this.ui.toastMessage(`⬆️ Level Up! Reached Level ${this.level}`);
    }
    this.ui.updateProgress(this.level, this.xp, this.nextXp);
  }

  unlock(name) {
    if (this.achievements.has(name)) return;
    this.achievements.add(name);
    this.ui.toastMessage(`🏆 Achievement: ${name}`);
  }
}
