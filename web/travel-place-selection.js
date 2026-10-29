// Explicitly adding a destination updates only that choice, never private limits.
export function selectPlace(preferences,id){
  return {...preferences,wants:[...new Set([...(preferences.wants||[]),id])],avoid:(preferences.avoid||[]).filter(value=>value!==id)};
}
