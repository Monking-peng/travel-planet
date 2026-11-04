import {museum,orient} from './suzhou-modern.js';
import {humble,lingering} from './suzhou-gardens.js';
import {tiger,hanshan,panmen,pingjiang} from './suzhou-heritage.js';
export const LANDMARKS=[
 {id:'museum',name:'苏州博物馆',area:'东北街 · 几何水院',x:-1.08,z:.94,height:.48,distance:2.95,view:[.33,1.05,1.8],description:'八角主厅、灰石菱格坡顶、下沉玻璃天窗与通透连廊围住主水院。片石山水靠白墙展开，细栏折桥连接八角平台，竹丛与少量浮叶衬托留白。',source:'https://pei-architects.com/projects/suzhou-museum/'},
 {id:'humble',name:'拙政园',area:'江南园林 · 荷风四面',x:1.08,z:.94,height:.44,distance:2.85,view:[.35,.95,1.8],description:'以荷塘、六角荷风四面亭和远香堂为核心，补入曲桥、廊屋、竹丛与临水树冠。保留园林的水面和留白，不把庭园铺成密集房屋。',source:'https://lhsr.sh.gov.cn/jnylwh/20230731/97e84acfec034f0a930b23fdadbe390f.html'},
 {id:'lingering',name:'留园·冠云峰',area:'太湖石 · 一峰三叠',x:-1.08,z:-.94,height:.50,distance:2.75,view:[.25,.80,1.8],description:'冠云峰、两侧配石、浣云沼、冠云楼与围廊构成层次。太湖石保留穿透孔洞，月洞门和木格窗围住安静的庭院。',source:'https://ylj.suzhou.gov.cn/szsylj/sjyc/201905/b7c0f2058c75498c9ecbacf234e25b08.shtml'},
 {id:'tiger',name:'虎丘·云岩寺塔',area:'虎丘山 · 七层砖塔',x:1.08,z:-.94,height:1.23,distance:3.05,view:[.4,.74,1.8],description:'七层八角砖塔整体微倾，厚重砖层与斑驳浅墙交错。凹进的壶门、砖柱、斗拱和叠涩细檐保留现存砖塔特征；夜间以暖光显出砖石层次。',source:'https://ylj.suzhou.gov.cn/szsylj/ylwh/201604/f3f52d3ee502486b8a4873c36b0d24e0.shtml'},
 {id:'hanshan',name:'寒山寺·普明宝塔',area:'枫桥 · 黄墙木塔',x:-1.08,z:.94,hemisphere:-1,height:1.22,distance:3.10,view:[.42,.75,1.8],description:'五层方塔以宽挑灰瓦檐、红褐木构和粉色墙面逐级收束。四面回廊、深窗栅、斗拱和高石台围绕塔身，石阶接入矩形山门；夜间暖光沿檐口与栏杆展开。',source:'https://www.szscgj.com/a/list_29/204.html'},
 {id:'orient',name:'东方之门',area:'金鸡湖 · 城市之门',x:1.08,z:.94,hemisphere:-1,height:1.44,distance:3.05,view:[.46,.65,1.8],description:'双塔在高处合拢，留下尖拱形通透空间。蓝灰玻璃、银色水平鳍片与圆润肩部还原轮廓，夜间窗灯和细轮廓光缓慢变化。',source:'https://rmjm.com/portfolio/gate-to-the-east-china/'},
 {id:'panmen',name:'盘门水陆城门',area:'古城南 · 水陆双门',x:-1.08,z:-.94,hemisphere:-1,height:.79,distance:2.95,view:[.55,.95,1.8],description:'两重水门贯通河道，错位陆门围出露天瓮城。灰砖券洞、内侧登城石阶与内门上的红柱灰瓦城楼共同表现水陆双门；瓦垄、雕饰屋脊和藤蔓保留近看细节。',source:'https://www.suzhou.gov.cn/szwgjyhsj/yhsjjbgk/202110/3ad7341d62c24548bd075701ca6bbeda.shtml'},
 {id:'pingjiang',name:'平江路·胡厢使桥',area:'水巷 · 白墙灰瓦',x:1.08,z:-.94,hemisphere:-1,height:.46,distance:2.9,view:[.5,1.0,1.8],description:'石拱桥跨过狭长水巷，白墙灰瓦、木格门窗与沿河石路贴水展开。街屋只组成这段具名历史街景，夜间以门窗和红灯笼点亮。',source:'https://swzfw.suzhou.gov.cn/swzfw/pasz/202309/ae5591e44c534d26ae81e329c43a0396.shtml'}
].map(item=>({...item,grounded:true}));
const builders={museum,humble,lingering,tiger,hanshan,orient,panmen,pingjiang};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Suzhou landmark: ${id}`);return builders[id](k);}
