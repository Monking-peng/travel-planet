// Explicitly adding a destination updates only that choice, never private limits.
export function selectPlace(preferences,id){
  return {...preferences,wants:[...new Set([...(preferences.wants||[]),id])],avoid:(preferences.avoid||[]).filter(value=>value!==id)};
}

// The server returns only this browser identity's rooms. Only open rooms in
// the selected city can receive a new destination draft.
export function tripsForPlace(rooms,city){
  return rooms.filter(room=>(room.city||'杭州')===city&&['ideas','confirm'].includes(room.status));
}
