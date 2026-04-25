export class ProgressionSystem {
  constructor(ui, snapshot = null) {
    this.ui = ui;
    this.level = snapshot?.level ?? 1;
    this.xp = snapshot?.xp ?? 0;
    this.nextXp = snapshot?.nextXp ?? 110;
    this.journalEntries = snapshot?.journalEntries ?? [];
    this.achievements = new Set(snapshot?.achievements ?? []);
    this.discoveredIds = new Set(snapshot?.discoveredIds ?? []);
    this.ui.updateProgress(this.level, this.xp, this.nextXp);
  }

  serialize() {
    return {
      level: this.level,
      xp: this.xp,
      nextXp: this.nextXp,
      journalEntries: this.journalEntries,
      achievements: [...this.achievements],
      discoveredIds: [...this.discoveredIds]
    };
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
