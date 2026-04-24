export class ProgressionSystem {
  constructor(ui) {
    this.ui = ui;
    this.level = 1;
    this.xp = 0;
    this.nextXP = 100;
    this.journal = [];
    this.achievements = new Set();
    this.updateUI();
  }

  discover(entry) {
    this.journal.push(`${entry.name} (${entry.area})`);
    this.gainXP(35);
    if (this.journal.length >= 3) this.unlock('Keen Observer');
    if (this.journal.length >= 6) this.unlock('Master Explorer');
  }

  gainXP(amount) {
    this.xp += amount;
    while (this.xp >= this.nextXP) {
      this.xp -= this.nextXP;
      this.level += 1;
      this.nextXP = Math.floor(this.nextXP * 1.2);
      this.ui.toastAchievement(`Level Up! Reached Level ${this.level}`);
    }
    this.updateUI();
  }

  unlock(name) {
    if (this.achievements.has(name)) return;
    this.achievements.add(name);
    this.ui.toastAchievement(`Achievement Unlocked: ${name}`);
  }

  updateUI() {
    this.ui.updateXP(this.level, this.xp, this.nextXP);
  }
}
