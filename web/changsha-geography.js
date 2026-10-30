// Shared island and river profiles keep the land, water, walks and placement
// checks on one continuous shape. The southern forecourt widens within two
// open river branches; the long northern part remains narrow.
export const channelX=angle=>.065*Math.sin(angle*2);
const southern=angle=>Math.exp(-(((Math.atan2(Math.sin(angle),Math.cos(angle))-.49)/.24)**2));
export const channelWidth=angle=>.46+.50*southern(angle);
export const islandWidth=angle=>{
  const t=(angle+.65)/1.40;
  if(t<=0||t>=1)return 0;
  return .19*Math.pow(Math.sin(t*Math.PI),.65)+.55*southern(angle)*Math.min(1,(1-t)*9);
};
