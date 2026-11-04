import {bell,drum,pagoda,smallPagoda} from './xian-towers.js';
import {wall,historyMuseum,furong,warriors} from './xian-places.js';
export const LANDMARKS=[
  {id:'bell',name:'西安钟楼',area:'古城中心 · 绿瓦红柱',x:-.89,z:.83,height:.80,distance:2.6,view:[.38,.65,1.75],description:'三重绿琉璃瓦、三开间红门与外廊、青绿金彩绘梁枋和层叠斗拱。方台保留贯通券洞、石栏与铜钟，夜间暖光照亮楼身，绿瓦和红柱保留原色。',source:'https://www.xakpw.com/single/23539'},
  {id:'drum',name:'西安鼓楼',area:'钟鼓楼广场 · 暮鼓',x:-1.12,z:-.83,height:.73,distance:2.7,view:[.30,.59,1.7],description:'七开间木构、通透回廊与三重檐歇山顶，红色山墙、青绿彩绘和两列鼓架丰富细节。青砖台基保留贯通券洞，两侧石阶登楼，夜间以檐下暖光衬托木构。',source:'https://www.xakpw.com/single/23806'},
  {id:'wall',name:'城墙·永宁门',area:'南门 · 瓮城与护城河',x:1.05,z:.83,height:.63,distance:3.0,view:[.36,1.0,1.7],description:'厚重城墙围合瓮城，贯通券洞、城楼、垛口、登城坡阶与护城河形成完整场地。夜间灯笼和檐下暖光勾勒城防轮廓。',source:'https://dp.pconline.com.cn/photo/5086132.html'},
  {id:'pagoda',name:'大雁塔·大慈恩寺',area:'城南 · 七层方塔',x:1.11,z:-1.00,height:1.27,distance:3.2,view:[.30,.70,1.75],description:'七层灰褐砖塔逐层收分，券窗、砖仿木柱和叠涩出檐形成细节。底层入口与两侧碑龛分开，葫芦塔刹、灰瓦寺院与石阶共同组成完整场地。',source:'https://www.hkcd.com/content_p/2013-12/09/content_1991.html'},
  {id:'smallPagoda',name:'小雁塔·荐福寺',area:'荐福寺 · 密檐古塔',x:-1.02,z:.85,hemisphere:-1,height:1.27,distance:2.9,view:[.33,.73,1.7],description:'十三层砖塔向上渐密收分，南北券窗与叠涩砖檐保留细节，四角残墙围合塔顶。石门、台阶、灰瓦殿堂和古树组成荐福寺院落，夜间以低亮暖光呈现砖色。',source:'https://m.thepaper.cn/newsDetail_forward_28705852'},
  {id:'museum',name:'陕西历史博物馆',area:'雁塔区 · 唐风殿堂',x:1.07,z:.95,hemisphere:-1,height:.53,distance:3.0,view:[.35,.73,1.7],description:'独立前门、重檐主殿、四角楼与连续柱廊围合庭院，灰瓦、浅石柱和宽阶保留唐风馆舍层次。入口水池与灰底金字石牌面向广场，夜间以廊下暖光和低矮庭灯分层。',source:'https://www.cscec.com/ztzl_new/mhsjd81_new/bq/201812/2899627.html'},
  {id:'furong',name:'大唐芙蓉园·紫云楼',area:'曲江 · 临水唐风园林',x:-1.10,z:-.88,hemisphere:-1,height:.72,distance:3.0,view:[.45,1.0,1.6],description:'紫云楼、侧亭、台阶与临水广场面向芙蓉湖。夜间以暖金檐光衬托深色屋顶和水面；这是现代仿唐园林的缩微表达。',source:'https://dp.pconline.com.cn/photo/list_4848079.html'},
  {id:'warriors',name:'秦始皇帝陵博物院',area:'临潼 · 兵马俑展馆',x:1.10,z:-1.08,hemisphere:-1,height:.30,distance:3.1,view:[.35,.80,1.7],description:'一号坑长拱顶、连续脊部天窗和浅拱玻璃端墙，搭配米灰石柱入口、灰瓦小檐与相邻保护展厅。宽阶、草坪和低矮庭灯连接前院，展示现有馆舍外观。',source:'https://www.bmy.com.cn/pitone.html'},
].map(item=>({...item,grounded:true}));
const builders={bell,drum,wall,pagoda,smallPagoda,museum:historyMuseum,furong,warriors};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Xian landmark: ${id}`);return builders[id](k);}
