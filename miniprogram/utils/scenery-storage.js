const {normalizeSelection,restoreSelection,restorePreviousSelection}=require('./scenery');
const KEY='travel-planet-scenery-v3';
function read(){
  try{
    const current=wx.getStorageSync(KEY);
    if(Array.isArray(current))return normalizeSelection(current);
    const previous=wx.getStorageSync('travel-planet-scenery-v2');
    const selected=Array.isArray(previous)?restorePreviousSelection(previous):restoreSelection(wx.getStorageSync('travel-planet-scenery-v1'));
    try{wx.setStorageSync(KEY,selected);}catch{}
    return selected;
  }catch{return normalizeSelection(null);}
}
function write(selected){wx.setStorageSync(KEY,normalizeSelection(selected));}
module.exports={read,write};
