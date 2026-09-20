/** Tiny runtime shims for older Android WebView / iOS Safari. */

if (typeof Array.prototype.at !== "function") {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, "at", {
    configurable: true,
    writable: true,
    value: function at(this: unknown[], index: number) {
      const len = this.length;
      const n = Math.trunc(index) || 0;
      const k = n < 0 ? len + n : n;
      if (k < 0 || k >= len) return undefined;
      return this[k];
    },
  });
}
