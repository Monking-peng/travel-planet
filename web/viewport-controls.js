// Keep the shorter viewport dimension framed; a portrait screen must not crop the city.
export function viewportFov(base, width, height) {
  const aspect = Math.max(.1, width / Math.max(1, height));
  return 2 * Math.atan(Math.tan(base * Math.PI / 360) / Math.min(1, aspect)) * 180 / Math.PI;
}

// Once a gesture moves or uses two fingers, no remaining finger may select a landmark.
export function createTapTracker() {
  const pointers = new Map();
  let blocked = false;
  return {
    down(e) {
      if (!pointers.size) blocked = false;
      pointers.set(e.pointerId, [e.clientX, e.clientY]);
      if (pointers.size > 1 || (e.button != null && e.button !== 0)) blocked = true;
    },
    move(e) {
      const origin = pointers.get(e.pointerId);
      if (origin && Math.hypot(e.clientX - origin[0], e.clientY - origin[1]) > 6) blocked = true;
    },
    up(e) {
      this.move(e);
      const tap = pointers.has(e.pointerId) && pointers.size === 1 && !blocked;
      pointers.delete(e.pointerId);
      return tap;
    },
    cancel(e) { blocked = true; pointers.delete(e.pointerId); },
  };
}
