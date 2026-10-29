const {COMPONENTS,DEFAULT_COMPONENTS,focusAngles,inspectionView}=require('../../utils/scenery');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
Component({
  properties:{selected:{type:Array,value:DEFAULT_COMPONENTS,observer:'selectionChanged'},paused:{type:Boolean,value:false},editing:{type:Boolean,value:false,observer:'editingChanged'}},
  data:{assetsReady:false,modelsReady:false,assets:COMPONENTS,visiblePieces:DEFAULT_COMPONENTS.map(id=>({id})),cameraFov:34,worldY:0},
  lifetimes:{
    attached(){this.view={x:-.35,y:-.20,z:.25,zoom:1};this.autoRotate=true;this.selectionChanged(this.data.selected);this.alive=true;Promise.all(['scenery','sceneryExtra','sceneryMore'].map(name=>new Promise((resolve,reject)=>wx.loadSubpackage({name,success:resolve,fail:reject})))).then(()=>{if(this.alive)this.setData({assetsReady:true});}).catch(()=>{if(this.alive)this.error();});},
    detached(){this.alive=false;this.scene=null;this.gesture=null;}
  },
  pageLifetimes:{hide(){this.hidden=true;this.gesture=null;this.lastTick=0;},show(){this.hidden=false;this.lastTick=0;}},
  methods:{
    selectionChanged(value){const selected=Array.isArray(value)?value:DEFAULT_COMPONENTS;this.setData({visiblePieces:COMPONENTS.filter(c=>selected.includes(c.id)).map(c=>({id:c.id}))});},
    ready(e){this.scene=e.detail.value;this.xr=wx.getXrFrameSystem();},
    loaded(){if(this.alive){this.setData({modelsReady:true});this.triggerEvent('loaded');this.notify();}},
    error(){this.triggerEvent('error');},
    notify(){this.triggerEvent('viewchange',{zoom:Math.round(this.view.zoom*100),autoRotate:this.autoRotate});},
    hold(){this.resumeAt=Date.now()+4000;},
    tick(){
      const now=Date.now(),dt=this.lastTick?Math.min((now-this.lastTick)/1000,.05):0;this.lastTick=now;
      if(!this.alive||!this.scene||!this.data.modelsReady||!this.view)return;
      if(this.autoRotate&&!this.data.paused&&!this.data.editing&&!this.hidden&&!this.gesture&&now>=(this.resumeAt||0))this.view.y+=dt*.07;
      const transform=this.scene.getElementById('world')?.getComponent(this.xr.Transform);if(transform){transform.rotation.x=this.view.x;transform.rotation.y=this.view.y;transform.rotation.z=this.view.z;}
    },
    setZoom(value){this.view.zoom=clamp(value,.8,4.5);this.setData({cameraFov:2*Math.atan(Math.tan(34*Math.PI/360)/this.view.zoom)*180/Math.PI});this.hold();this.notify();},
    zoomBy(factor){if(this.view)this.setZoom(this.view.zoom*factor);},
    focusComponent(id,size){const target=size?inspectionView(id,size.width,size.height):focusAngles(id);if(!this.view||!target)return;this.view={...target};this.setData({worldY:target.offsetY});this.setZoom(target.zoom);},
    reset(){if(!this.view)return;this.view.x=-.35;this.view.y=-.20;this.view.z=.25;this.view.offsetY=0;this.setData({worldY:0});this.setZoom(1);},
    toggleRotation(){this.autoRotate=!this.autoRotate;this.resumeAt=0;this.notify();},
    editingChanged(value){if(!this.view)return;if(value){this.savedView={...this.view};this.reset();}else if(this.savedView){this.view={...this.savedView};this.setData({worldY:this.view.offsetY||0});this.setZoom(this.view.zoom);this.savedView=null;}this.gesture=null;this.hold();},
    touches(e){return (e.touches||[]).map(p=>({x:p.clientX===undefined?p.pageX:p.clientX,y:p.clientY===undefined?p.pageY:p.clientY}));},
    rebase(points){this.gesture=points.length>1?{type:'pinch',distance:Math.max(1,Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)),zoom:this.view.zoom}:points.length?{type:'drag',point:points[0],x:this.view.x,y:this.view.y}:null;},
    touchStart(e){if(!this.view||this.data.paused)return;this.hold();this.rebase(this.touches(e));},
    touchMove(e){if(!this.gesture)return;const p=this.touches(e);this.hold();if(this.gesture.type==='pinch'&&p.length>1)this.setZoom(this.gesture.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/this.gesture.distance);else if(p.length===1){this.view.y=this.gesture.y+(p[0].x-this.gesture.point.x)*.006/this.view.zoom;this.view.x=clamp(this.gesture.x+(p[0].y-this.gesture.point.y)*.004/this.view.zoom,-Math.PI,Math.PI);}},
    touchEnd(e){if(this.view){this.rebase(this.touches(e));this.hold();}},
    touchCancel(){this.gesture=null;this.hold();}
  }
});
