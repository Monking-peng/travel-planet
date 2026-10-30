import {yuelu,aiwan,dufu,tianxin} from './changsha-heritage.js';
import {ifs,hunanMuseum,xie} from './changsha-modern.js';
import {meixi} from './changsha-meixi.js';
import {juzhouBridge} from './changsha-bridge.js';
import {juzizhou} from './changsha-juzizhou.js';

export const LANDMARKS=[
  {id:'juzizhou',name:'橘子洲·青年雕塑',area:'橘子洲头 · 山水中的石雕',x:.054,z:1.012,height:.24,focusY:.095,distance:1.18,view:[.12,.42,1.65],waterfront:true,description:'青年毛泽东艺术雕塑以宽阔肩部、侧扬的发束和浅灰粉花岗岩形成洲头轮廓。草坪与低矮花境留出正面视线，夜间用柔和暖光照亮石材；据实拍制作的艺术化缩微模型。原作：黎明、胡建国。',source:'https://www.icswb.com/h/160/20231205/843614.html'},
  {id:'dufu',name:'杜甫江阁',area:'湘江东岸 · 飞檐与江灯',x:1.26,z:.78,height:.94,distance:3.0,view:[.40,.62,1.7],description:'临江楼阁以层层飞檐、红柱、白色回廊和宽石阶构成。夜间用檐线、灯笼和楼内暖光分出层次，灯光缓慢变化。',source:'https://enghunan.gov.cn/hneng/News/UpcomingEvents/202408/t20240801_33417827.html'},
  {id:'yuelu',name:'岳麓书院',area:'岳麓山东麓 · 千年庭院',x:-1.27,z:.78,height:.43,distance:3.0,view:[.25,1.24,1.4],description:'书院沿山麓展开，灰瓦白墙的多进庭院串起讲学轴线，侧院文庙保留赭黄色屋顶。御书楼、门楼、游廊、古树和石阶共同组成书院。',source:'https://ylsy.hnu.edu.cn/info/1011/9009.htm'},
  {id:'aiwan',name:'爱晚亭',area:'岳麓山 · 绿瓦枫林',x:-1.10,z:-1.01,height:.70,distance:2.8,view:[.45,.68,1.5],description:'绿琉璃瓦重檐、灰色外柱与红色内柱，藏在起伏的枫林中。石阶随山坡下降，夜间只照亮亭子和主要步道；秋色为艺术化场景。',source:'https://whhlyt.hunan.gov.cn/ggwh/201408/t20140804_5430585.html'},
  {id:'tianxin',name:'天心阁',area:'城南 · 古城墙上的楼阁',x:1.03,z:.77,hemisphere:-1,height:.89,distance:2.9,view:[.45,.58,1.7],description:'三层主阁和两侧小阁立在厚重城墙上，保留垛口、砖石纹理、拱洞与山坡。深色木构和瓦顶以暖色檐光衬托。',source:'https://www.highspeed.mtr.com.hk/en/travel/changsha.html'},
  {id:'juzhouBridge',name:'橘子洲大桥',area:'湘江 · 洲岛与桥梁',x:0,z:-.15,height:.23,distance:3.5,view:[.18,1.25,-1.8],waterfront:true,description:'连续低拱横跨湘江，环形匝道落向狭长洲岛。两岸步道、桥上车流和克制的夜间灯带，连接山麓与城市；按航拍关系作缩微表达。',source:'https://www.icswb.com/h/152/20160518/415626.html'},
  {id:'ifs',name:'长沙国金中心',area:'五一商圈 · 双塔与露台',x:1.12,z:-1.02,hemisphere:1,height:1.67,distance:3.5,view:[.55,.62,1.8],description:'两座塔楼保持明显高低差，保留深蓝玻璃、退台塔冠和竖向构件。裙楼露台与暖色店铺围绕双塔，窗灯和轮廓光缓慢变化。',source:'https://www.wongtung.com/cn/projects/changsha-international-finance-square-2/'},
  {id:'museum',name:'湖南博物院',area:'开福 · 悬挑屋盖与玻璃大厅',x:-1.10,z:.80,hemisphere:-1,height:.49,distance:2.8,view:[.4,.55,1.7],description:'宽大的深色悬挑屋盖、中央通高玻璃大厅和两侧浅色展馆体量。台阶、框架与横向遮阳线条保留实景的主要结构。',source:'https://travel.voc.com.cn/article/201712/201712010956426419.html'},
  {id:'meixi',name:'梅溪湖艺术中心',area:'梅溪湖 · 三组流动建筑',x:1.12,z:-1.01,hemisphere:-1,height:.47,distance:3.0,view:[.5,1.1,1.5],description:'四瓣大剧场、三瓣艺术馆与单瓣小剧场围绕中央广场展开。浅色曲面在凹口处翻起，青蓝玻璃入口与窗带嵌在屋盖下；弯曲绿地和暖色步道灯连接三组场馆。',source:'https://www.biad.com.cn/project/id/8/'},
  {id:'xie',name:'谢子龙影像艺术馆',area:'洋湖 · 清水混凝土与水院',x:-1.12,z:-1.05,hemisphere:-1,height:.42,distance:2.8,view:[.45,.68,1.5],description:'浅色混凝土悬挑体量、狭长水平窗和架空水院，窄步道穿过水面，楼梯藏在入口下方。夜间保留克制的檐下照明。',source:'https://xjxq.hunan.gov.cn/hnxjxq/sytpxw/202003/t20200318_11814798.html'},
].map(item=>({...item,grounded:true}));
const builders={dufu,yuelu,aiwan,tianxin,juzhouBridge,juzizhou,ifs,museum:hunanMuseum,meixi,xie};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Changsha landmark: ${id}`);return builders[id](k);}
