import {theatre} from './beijing-theatre.js';
import {greatWall} from './beijing-greatwall.js';
import {palace,tiananmen,heaven,summer,beihai,drumBell} from './beijing-heritage.js';
import {jingshan} from './beijing-jingshan.js';
import {nest,cctv} from './beijing-modern.js';
import {watercube} from './beijing-watercube.js';

export const LANDMARKS=[
  {id:'palace',name:'故宫',area:'中轴线 · 紫禁城',x:0,z:.45,height:.48,distance:3.9,view:[.45,1.15,1.2],description:'凹字形午门、内金水河与五座石桥，串起太和门、三大殿和内廷。赭金瓦垄、深朱红柱廊、青绿梁枋与灰白石院逐层展开，外接护城河与中轴步道。为核心殿院的微缩表达。',source:'https://www.dpm.org.cn/explore/building/236465.html'},
  {id:'tiananmen',name:'天安门·金水桥',area:'中轴线 · 城楼与广场',x:0,z:1.97,height:.43,distance:3.0,view:[.35,.70,1.3],description:'宽阔朱红城台、五座券门、九开间柱廊与金黄重檐，前接金水河、七座白石桥和华表。以城楼、桥梁和前庭组成微缩中轴景观。',source:'https://korean.beijing.gov.cn/travellinginbeijing/attractions/202604/t20260403_4574593.html'},
  {id:'heaven',name:'天坛·祈年殿',area:'南城 · 礼制建筑',x:1.55,z:1.24,height:.62,distance:2.4,view:[.45,.7,1.3],description:'三重蓝色琉璃瓦圆檐、十二根外檐朱柱和蓝绿梁枋，金边竖匾悬于上檐下。细瓦垄、瓦当与叠层斗拱分出屋顶层次；三层白石圆台、配殿和柏树保留开阔轴线。',source:'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/201912/t20191211_1048233.html'},
  {id:'beihai',name:'北海·白塔',area:'皇家园林 · 琼华岛',x:-1.73,z:-.12,height:.60,distance:2.3,view:[.3,.6,1.2],description:'白色覆钵式塔身、层叠相轮与金色宝顶，置于湖心林丘。永安寺山门、石桥与湖面构成前后层次，不做普通楼阁塔。',source:'https://www.beijing.gov.cn/tsbj/sxym/202512/t20251212_4338563.html'},
  {id:'jingshan',name:'景山·五亭',area:'中轴线 · 御苑山林',x:0,z:-1.48,height:.66,distance:3.2,view:[.38,.90,1.35],description:'中央万春亭以三重黄瓦檐为主，两侧绿瓦八角亭与蓝瓦圆亭依次降落在林坡上。南麓绮望楼、北麓寿皇殿和林间登山路组成完整御苑缩影；沿中轴连接故宫与钟鼓楼。',source:'https://gygl.beijing.gov.cn/mlgy/mlgy_lsmy/201911/t20191129_732675.html'},
  {id:'drum',name:'钟鼓楼',area:'中轴线 · 晨钟暮鼓',x:0,z:-2.12,height:.48,distance:2.3,view:[.55,.65,1.1],description:'前方朱红鼓楼与后方灰砖钟楼独立成组，保留厚重台座、通高门洞、绿瓦重檐和两楼之间的广场。',source:'https://www.beijing.gov.cn/renwen/rwzyd/qxdw/zmzhzhpgj/zhgl/202309/t20230919_3262298.html'},
  {id:'theatre',name:'国家大剧院',area:'长安街 · 钛与玻璃',x:-1.65,z:1.16,height:.25,distance:2.4,view:[.4,.48,1.2],description:'银灰钛金属半椭球包裹宽阔玻璃帷幕，内部暖金剧场与多层回廊透出层次。细分缝和稀疏灯点勾出曲面，独立水池下可见玻璃通道顶。',source:'https://www.chncpa.org/cgylx/jyjg/'},
  {id:'cctv',name:'央视总部',area:'国贸 · 立体环形',x:1.84,z:-.44,height:.78,distance:2.6,view:[.8,.35,1.3],description:'两座倾斜玻璃塔身在顶部错位相连，留下巨大的中央空洞。深色菱形结构网格和缓慢变化的窗灯强调立体环形轮廓。',source:'https://www.turnerconstruction.com/projects/china-central-television-headquarters-cctv'},
  {id:'summer',name:'颐和园',area:'西郊 · 昆明湖与万寿山',x:-.77,z:.65,hemisphere:-1,height:.80,distance:3.1,view:[.45,.9,1.3],description:'佛香阁以八面三层四重檐呈现：橙黄瓦心与深绿脊边、朱柱回廊、青蓝金色梁枋和内收窗棂。下方石台、白石栏杆与山坡分层，长廊和昆明湖保留园林关系；为主要景观缩影。',source:'https://s.visitbeijing.com.cn/index.php/line/463'},
  {id:'wall',name:'八达岭长城',area:'北部山地 · 关城',x:0,z:-1.30,hemisphere:-1,height:.55,distance:6.7,view:[.15,1.7,1.1],description:'灰褐色砖墙沿连续山脊起伏，石阶穿过十座开有真实拱洞的敌楼；垛口、石基、灌木与裸露岩壁呈现长城和山林的层次。长城横贯背面山地，按实拍提炼并延展的景观缩微，不作实际地理或游览路线。',source:'https://www.beijing.gov.cn/renwen/bjgk/yqgk/fg/202212/t20221202_2870249.html'},
  {id:'nest',name:'鸟巢',area:'奥林匹克 · 国家体育场',x:.85,z:.93,hemisphere:-1,height:.32,distance:2.4,view:[.45,.75,1.2],description:'椭圆体育场以交织的银灰钢构包覆红色看台，屋顶中央开口。外壳、入口和内碗分层制作，夜间让暖红内场透过钢网。',source:'https://www.l-a-v-a.net/projects/beijing-watercube/'},
  {id:'watercube',name:'水立方',area:'奥林匹克 · 国家游泳中心',x:1.62,z:.03,hemisphere:-1,height:.25,distance:2.1,view:[.65,.5,1.2],description:'浅蓝灰气枕覆盖扁平屋面与四侧，膜块轻微鼓起，细接缝围合不规则多边形。夜间边缘呈柔和亮蓝，中心保持较暗的层次；底部玻璃入口带与独立雨棚分开表现。',source:'https://www.l-a-v-a.net/projects/beijing-watercube/'},
].map(item=>({...item,grounded:true}));
const builders={jingshan,palace,tiananmen,heaven,summer,wall:greatWall,beihai,drum:drumBell,nest,watercube,theatre,cctv};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Beijing landmark: ${id}`);return builders[id](k);}
