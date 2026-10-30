import {pingan,bamboo,diwang,kk100} from './shenzhen-towers.js';
import {civic,cocoon} from './shenzhen-civic.js';
import {wheel,windowWorld,dapeng,lianhua} from './shenzhen-places.js';
import {minghua} from './shenzhen-minghua.js';
import {talentPark} from './shenzhen-talent-park.js';

export const LANDMARKS=[
  {id:'pingan',name:'平安金融中心',area:'福田 · 城市天际线',x:.85,z:-1.15,height:1.24,distance:2.9,view:[.7,.4,1.4],description:'银色立面由八道角柱向上收束，顶部形成分面尖冠。密集窗格、退台裙房与冷白轮廓光保留超高层的修长比例。',source:'https://www.kpf.com/project/ping-an-finance-centre'},
  {id:'bamboo',name:'春笋·华润大厦',area:'后海 · 深圳湾',x:-.80,z:-.85,height:.92,distance:2.4,view:[.6,.4,1.4],description:'饱满的圆形塔身逐渐收尖，密集银色竖肋汇入顶部菱形结构。底层入口与塔冠分别表现交织柱网，夜景保留淡蓝玻璃与白色结构。',source:'https://www.kpf.com/project/china-resources-tower'},
  {id:'diwang',name:'地王大厦',area:'罗湖 · 深南东路',x:1.80,z:-.45,height:1.0,distance:2.6,view:[.55,.36,1.5],description:'青绿色玻璃、成排横向线条与两侧圆柱塔身，顶部保留一对细长塔尖。较低的副楼与主塔构成有层次的整体。',source:'https://www.sz.gov.cn/szstory/202302/content/post_10421146.html'},
  {id:'civic',name:'深圳市民中心',area:'福田 · 城市中轴',x:.85,z:.55,height:.35,distance:2.7,view:[.5,.85,1.5],description:'蓝灰色长屋顶像展开的双翼，中央红色方塔与金色圆塔形成对照。玻璃裙楼、柱廊、台阶和前庭共同组成舒展的市民广场。',source:'https://society.people.com.cn/n1/2018/1124/c1008-30418921.html'},
  {id:'cocoon',name:'深圳湾体育中心·春茧',area:'后海 · 滨海体育',x:-1.80,z:-.30,height:.30,distance:2.65,view:[.5,.9,1.4],description:'连续起伏的白色斜交网壳包裹体育场与体育馆，开放的内碗和闭合屋盖相互衔接。以网壳、玻璃和浅色灯光表达春茧的结构。',source:'https://www.eyeshenzhen.com/content/2023-05/12/content_30192864.htm'},
  {id:'talent',name:'深圳人才公园',area:'后海 · 内湖与星光桥',x:-.75,z:.55,height:.23,distance:3.0,focusY:.12,view:[.18,1.1,1.25],description:'大面积内湖绕过东侧绿坡，蓝色跑道与曲线岸线环湖展开。南侧 π 桥保留弧形木栈道，东侧星光桥排列点状灯柱；岸边石阶、湿地与成片林冠共同组成滨水公园。',source:'https://www.szns.gov.cn/mlns/stns/lc/csgy/content/post_12595660.html'},
  {id:'lianhua',name:'莲花山',area:'福田 · 山顶广场',x:-.20,z:-1.85,height:.49,distance:2.4,view:[.35,.8,1.5],description:'连续山坡、登顶石阶和成片林木围合山顶广场。中央以小尺度铜像和石台表现莲花山的纪念性景观。',source:'https://www.shenzhenshizhi.cn/a/109.html'},
  {id:'kk100',name:'京基100',area:'罗湖 · 蔡屋围',x:1.13,z:-1.14,hemisphere:-1,height:1.06,distance:2.65,view:[.9,.35,1.2],description:'修长玻璃体量向顶部平滑弯曲，银色竖向构件勾勒弧形轮廓。窗灯缓慢变化，保持蓝灰色玻璃和清晰的顶部曲线。',source:'https://farrells.com/project/kk100/'},
  {id:'wheel',name:'欢乐港湾·湾区之光',area:'宝安 · 滨海摩天轮',x:-1.36,z:.08,hemisphere:-1,height:.98,distance:2.65,view:[.30,.32,1.5],description:'悬臂式支架托起通透轮盘，球形轿厢沿圆周排列。夜晚由青蓝、淡紫和暖色轿厢组成缓慢变化的光环，滨海站台保持开阔。',source:'https://www.octohbay.net/'},
  {id:'window',name:'世界之窗·铁塔',area:'南山 · 主题公园',x:1.25,z:.12,hemisphere:-1,height:.90,distance:2.45,view:[.55,.65,1.4],description:'表现深圳世界之窗内的埃菲尔铁塔复制景观：四腿拱门、分层平台与镂空钢架，前方配有水池和规则花坛。并非巴黎原建筑。',source:'https://www.szns.gov.cn/mlns/whns/lyjq/content/post_12590149.html'},
  {id:'minghua',name:'海上世界·明华轮',area:'蛇口 · 白色客轮与喷泉',x:0,z:.88,hemisphere:-1,height:.54,distance:3.0,focusY:.16,focusZ:.03,view:[.63,.68,1.6],description:'白色客轮停泊在独立浅水池中：尖船艏、圆船艉、层叠甲板、深色舷窗和米色桅杆；三组环形喷泉与曲岸步道围在船前。夜间以暖色窗灯和淡蓝紫水景呈现海上世界。',source:'https://sznews.com/news/content/2021-05/29/content_24254471_0.htm'},
  {id:'dapeng',name:'大鹏所城·南门',area:'大鹏 · 海防古城',x:-.56,z:-1.34,hemisphere:-1,height:.47,distance:2.45,view:[.3,.65,1.5],description:'厚重灰砖城墙与真实贯通的拱门，墙上是深色瓦顶木构城楼。垛口、砖缝、登城台阶和暖色灯笼表现南门，不以普通民居堆砌古城。',source:'https://www.dpxq.gov.cn/ztzl/pyxsj/wzdp/zjd/content/post_11551556.html'},
].map(item=>({...item,grounded:true}));
const builders={pingan,bamboo,diwang,kk100,civic,cocoon,wheel,window:windowWorld,dapeng,lianhua,minghua,talent:talentPark};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Shenzhen landmark: ${id}`);return builders[id](k);}
