import {raffles,hongya,qiansimen} from './chongqing-riverfront.js';
import {greatHall,monument,theatre} from './chongqing-culture.js';
import {liziba,cableway} from './chongqing-transit.js';
export const LANDMARKS=[
 {id:'hongya',name:'洪崖洞',area:'嘉陵江岸 · 吊脚楼群',x:-1.05,z:.91,height:.95,distance:3.1,view:[.24,.50,1.8],description:'临江山墙、黑木框架与浅色墙板沿崖层层升高。露台、外部石阶和吊脚柱串起不同楼层；夜间以金色檐灯、柱廊和红灯笼衬托暗窗。',source:'https://kr.trip.com/moments/detail/chongqing-158-130928534/'},
 {id:'raffles',name:'来福士·朝天门',area:'两江交汇 · 水晶连廊',x:1.12,z:1.09,height:1.62,distance:3.65,view:[.30,.64,1.8],description:'八座微弯塔楼以六低两高组成天际线。水晶连廊中段为玻璃展厅，两端露天花园保持通透；连接高塔的短桥、退台裙楼、屋顶花园和临江宽阶形成层次。',source:'https://www.safdiearchitects.com/projects/raffles-city-chongqing'},
 {id:'qiansimen',name:'千厮门大桥',area:'嘉陵江 · 单塔双层桥',x:-1.08,z:-.96,height:.76,distance:3.0,view:[.30,.65,1.8],description:'白色天梭形独塔、单索面斜拉索、金红色钢桁架与上下两层桥面。按设计单位照片区分千厮门独塔和东水门双塔，不混用两座桥。',source:'https://www.cmct.cn/index.php?c=show&id=557'},
 {id:'theatre',name:'重庆大剧院',area:'江北嘴 · 浅绿玻璃',x:1.08,z:-.94,height:.60,distance:2.9,view:[.55,.75,1.8],description:'倾斜的浅绿色玻璃壳体围合两座舞台高塔，立面保留细密分缝和不规则开口。夜晚采用透光的冷绿层次，呈现江畔的折面轮廓。',source:'https://www.gmp.de/en/projects/472/chongqing-grand-theater'},
 {id:'greatHall',name:'重庆人民大礼堂',area:'人民广场 · 绿瓦红柱',x:-1.06,z:.94,hemisphere:-1,height:.79,distance:3.05,view:[.20,.65,1.8],description:'中央圆殿、三层绿色琉璃屋面、两翼红柱长廊和前方三门牌坊。按实拍保留对称结构与台阶轴线；夜间灯光落在檐口和柱廊。',source:'https://www.hlhbsc.org/spot_detail.aspx?city=22&spot=1009'},
 {id:'monument',name:'人民解放纪念碑',area:'解放碑 · 八角钟楼',x:1.05,z:.91,hemisphere:-1,height:.84,distance:2.65,view:[.30,.65,1.8],description:'浅米色八角碑体、竖向金色线脚、四面时钟与透空冠部。保留碑身题字和围绕基座的花坛，呈现纪念碑本体，不用普通商业楼填满广场。',source:'https://www.cq.gov.cn/zjcq/cycq/jplyxl/dsy/dsjp/202608/t20260826_15982337.html'},
 {id:'liziba',name:'李子坝·单轨穿楼',area:'山城交通 · 楼中车站',x:-1.08,z:-.94,hemisphere:-1,height:.88,distance:2.85,view:[-.80,.64,1.8],description:'车站层留出真实通道，双线轨道从住宅楼中穿过；淡灰与浅橙立面保留阳台、空调和层间横线。青绿色列车是实拍中出现过的涂装，并非实时运营车辆。',source:'https://hk.trip.com/moments/detail/chongqing-158-136314677/'},
 {id:'cableway',name:'长江索道',area:'两岸之间 · 空中走廊',x:1.10,z:-.94,hemisphere:-1,height:.55,distance:2.9,view:[.40,.70,1.8],description:'两岸站房、下垂的钢索、悬挂支架和黄色大窗轿厢。参照历史实拍提炼黄色涂装，保留双向运行的空间关系；这里不显示实时班次和票价。',source:'https://you.ctrip.com/sight/chongqing158/109940.html'},
].map(item=>({...item,grounded:true}));
const builders={raffles,hongya,qiansimen,greatHall,monument,theatre,liziba,cableway};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Chongqing landmark: ${id}`);return builders[id](k);}
