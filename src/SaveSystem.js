const KEY = 'slayers-save-v1';

export class SaveSystem {
  load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch {
      return {};
    }
  }

  save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  merge(defaults) {
    return { ...defaults, ...this.load() };
  }
}
