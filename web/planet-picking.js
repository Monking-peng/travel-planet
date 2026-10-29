import {Raycaster,Vector2} from 'three';

// The closest surface decides the target. Do not click a hidden landmark
// through water, terrain, another building, or an unlabelled foreground object.
export function createPlanetPicker(root,camera){
  const ray=new Raycaster(),point=new Vector2();
  return (x,y,width,height)=>{
    if(!(width>0&&height>0)||x<0||y<0||x>width||y>height)return null;
    point.set(x/width*2-1,1-y/height*2);root.updateMatrixWorld(true);camera.updateMatrixWorld(true);ray.setFromCamera(point,camera);
    let object=ray.intersectObject(root,true)[0]?.object,componentId='',placeId='';
    while(object&&object!==root){componentId ||= object.userData.componentId||'';placeId ||= object.userData.placeId||'';object=object.parent;}
    return componentId||placeId?{componentId,placeId}:null;
  };
}
