import {mausoleum,museum,fuzimiao} from './nanjing-heritage.js';
import {zhonghua,jiming} from './nanjing-fortifications.js';
import {baoen,zifeng,eye} from './nanjing-modern.js';
export const LANDMARKS=[
 {id:'mausoleum',name:'中山陵',area:'钟山 · 蓝瓦白石',x:-1.08,z:.94,height:.66,distance:3.0,view:[.24,.8,1.8],description:'层层石阶沿中轴升起，祭堂保留蓝色琉璃瓦、白石立面、三座门洞与两侧石墙。两列林木围合庄重的登临路径。',source:'https://zschina.nanjing.gov.cn/lyzx/202504/t20250425_5135983.html'},
 {id:'fuzimiao',name:'夫子庙·秦淮河',area:'秦淮 · 檐影画舫',x:1.08,z:.94,height:.49,distance:3.0,view:[.32,.83,1.8],description:'大成殿、两侧廊屋、临水亭与红色照壁围绕秦淮水面。石栏、木格窗和画舫保留尺度层次，夜间用檐下暖光照出水岸。',source:'https://js.cnr.cn/whly/20220418/t20220418_525798755.shtml'},
 {id:'zhonghua',name:'中华门瓮城',area:'明城墙 · 三重瓮城',x:-1.08,z:-.94,height:.42,distance:3.0,view:[.70,1.0,1.8],description:'三重内瓮城、贯通门洞、两层主城台、藏兵洞和两侧登城马道。按现存城台建模，城顶不加已经毁失的木构城楼。',source:'https://wlj.nanjing.gov.cn/ztzl/mcq/gzqk/202302/t20230228_3838766.html'},
 {id:'museum',name:'南京博物院',area:'历史馆 · 仿辽大殿',x:1.08,z:-.94,height:.47,distance:2.9,view:[.25,.68,1.8],description:'宽阔低缓的棕色瓦面、金色屋脊、朱红柱廊、木格门窗和白石台阶。以历史馆大殿为主体，保留两侧配殿与开阔前庭。',source:'https://zfgbpx.nju.edu.cn/7c/d1/c46023a556241/page.htm'},
 {id:'jiming',name:'鸡鸣寺·药师佛塔',area:'鸡笼山 · 黄墙古塔',x:-1.08,z:.94,hemisphere:-1,height:1.0,distance:3.05,view:[.45,.75,1.8],description:'黄色院墙与殿堂沿坡叠升，七层八角药师佛塔露出深色翘檐与金色塔刹。石阶连接各层庭院，树冠围住寺院侧后方。',source:'https://you.ctrip.com/sight/nanjing9/1677.html'},
 {id:'baoen',name:'大报恩寺遗址新塔',area:'长干里 · 玻璃保护塔',x:1.08,z:.94,hemisphere:-1,height:1.14,distance:2.85,view:[.40,.68,1.8],description:'九层八角玻璃塔、纤细外框、层间透光平台与金色塔刹。表现遗址上的现代保护建筑，夜间分出暖金层灯和上层冷色玻璃。',source:'https://www.waclighting.com.cn/cases-detail/27'},
 {id:'zifeng',name:'紫峰大厦',area:'鼓楼 · 层叠天际线',x:-1.08,z:-.94,hemisphere:-1,height:1.59,distance:3.2,view:[.40,.64,1.8],description:'错开的上下玻璃体量、外露设备层、银色竖片、圆弧侧面和细长尖塔。夜景保留银灰建筑原色，窗灯缓慢明暗变化。',source:'https://www.smithgill.com/work/zifeng_tower/'},
 {id:'eye',name:'南京眼步行桥',area:'长江夹江 · 倾斜双环',x:1.08,z:-.94,hemisphere:-1,height:.72,distance:3.05,view:[1.0,.80,1.6],description:'两座倾斜椭圆钢塔、双索面细钢索与轻薄步行桥面。桥面从双环内部穿过，夜间以冷白轮廓光勾出桥塔与栏杆。',source:'https://gjzx.nanjing.gov.cn/xmqk/qabxq/202509/t20250903_5641986.html'}
].map(item=>({...item,grounded:true}));
const builders={mausoleum,museum,fuzimiao,zhonghua,jiming,baoen,zifeng,eye};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Nanjing landmark: ${id}`);return builders[id](k);}
