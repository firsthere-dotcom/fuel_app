export function storageGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return Promise.resolve(val ? JSON.parse(val) : fallback);
  } catch {
    return Promise.resolve(fallback);
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
}
