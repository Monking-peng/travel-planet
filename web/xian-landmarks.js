import {bell,drum,pagoda,smallPagoda} from './xian-towers.js';
import {wall,historyMuseum,furong,warriors} from './xian-places.js';
export const LANDMARKS=[
  {id:'bell',name:'西安钟楼',area:'古城中心 · 绿瓦红柱',x:-.89,z:.83,height:.79,distance:2.6,view:[.38,.65,1.75],description:'三重绿琉璃屋檐、红柱彩画与石砌台基，保留四向券洞、白石栏杆和角落铜钟。夜间用暖光照亮檐下与楼身，保持绿瓦的原色。',source:'https://www.cnr.cn/sxpd/sx/20181105/t20181105_524405062.shtml'},
  {id:'drum',name:'西安鼓楼',area:'钟鼓楼广场 · 暮鼓',x:-1.12,z:-.83,height:.73,distance:2.7,view:[.30,.59,1.7],description:'宽阔的楼身、深灰瓦三重檐、正面阶梯与台基上的鼓列。按实拍区分鼓楼与钟楼的比例和木构颜色。',source:'https://www.xakpw.com/single/23806'},
  {id:'wall',name:'城墙·永宁门',area:'南门 · 瓮城与护城河',x:1.05,z:.83,height:.63,distance:3.0,view:[.36,1.0,1.7],description:'厚重城墙围合瓮城，贯通券洞、城楼、垛口、登城坡阶与护城河形成完整场地。夜间灯笼和檐下暖光勾勒城防轮廓。',source:'https://dp.pconline.com.cn/photo/5086132.html'},
  {id:'pagoda',name:'大雁塔·大慈恩寺',area:'城南 · 七层方塔',x:1.11,z:-.85,height:1.17,distance:2.8,view:[.30,.70,1.75],description:'七层方形砖塔逐层收分，四面券窗和细密砖缝保留厚重的土黄色。前殿、侧廊、台阶和庭树共同组成寺院。',source:'https://www.hkcd.com/content_p/2013-12/09/content_1991.html'},
  {id:'smallPagoda',name:'小雁塔·荐福寺',area:'荐福寺 · 密檐古塔',x:-1.02,z:.85,hemisphere:-1,height:1.14,distance:2.7,view:[.33,.73,1.7],description:'十三层密檐、逐渐收窄的砖身与残缺塔冠，置于寺院古树之间。保持小雁塔与大雁塔不同的轮廓，不补造完整塔刹。',source:'https://media-cdn.tripadvisor.com/media/photo-o/0f/87/76/3e/small-wild-goose-pagoda.jpg'},
  {id:'museum',name:'陕西历史博物馆',area:'雁塔区 · 唐风殿堂',x:1.07,z:.85,hemisphere:-1,height:.46,distance:2.7,view:[.35,.73,1.7],description:'浅色柱廊、深灰宽檐、对称展馆与入口水院，依据张锦秋设计的现有馆舍外观制作。柱间空间、屋脊和石牌分层呈现。',source:'https://www.cscec.com/ztzl_new/mhsjd81_new/bq/201812/2899627.html'},
  {id:'furong',name:'大唐芙蓉园·紫云楼',area:'曲江 · 临水唐风园林',x:-1.10,z:-.88,hemisphere:-1,height:.72,distance:3.0,view:[.45,1.0,1.6],description:'紫云楼、侧亭、台阶与临水广场面向芙蓉湖。夜间以暖金檐光衬托深色屋顶和水面；这是现代仿唐园林的缩微表达。',source:'https://dp.pconline.com.cn/photo/list_4848079.html'},
  {id:'warriors',name:'秦始皇帝陵博物院',area:'临潼 · 兵马俑展馆',x:1.10,z:-.88,hemisphere:-1,height:.40,distance:3.0,view:[.45,1.0,1.65],description:'保留一号坑展厅的大跨度拱壳、天窗与竖向玻璃端墙，搭配相邻展厅和入口院落。展示的是现有保护展馆外观，非露天陶俑阵列。',source:'https://www.bmy.com.cn/index.htm'},
].map(item=>({...item,grounded:true}));
const builders={bell,drum,wall,pagoda,smallPagoda,museum:historyMuseum,furong,warriors};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Xian landmark: ${id}`);return builders[id](k);}
