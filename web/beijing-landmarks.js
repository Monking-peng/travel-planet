import {palace,tiananmen,heaven,summer,greatWall,beihai,drumBell} from './beijing-heritage.js';
import {jingshan} from './beijing-jingshan.js';
import {nest,watercube,theatre,cctv} from './beijing-modern.js';

export const LANDMARKS=[
  {id:'palace',name:'故宫',area:'中轴线 · 紫禁城',x:0,z:.66,height:.38,distance:3.2,view:[.45,1.15,1.2],description:'午门、三大殿、内廷与宫墙角楼组成连续院落。金黄屋瓦、朱红柱廊、三层白石台基与护城河共同呈现紫禁城的轴线和层级。为核心建筑群微缩表达。',source:'https://www.dpm.org.cn/explore/building/236465.html'},
  {id:'tiananmen',name:'天安门·金水桥',area:'中轴线 · 城楼与广场',x:0,z:1.89,height:.43,distance:2.7,view:[.35,.70,1.3],description:'宽阔朱红城台、五座券门、九开间柱廊与金黄重檐，前接金水河、七座白石桥和华表。以城楼、桥梁和前庭组成微缩中轴景观。',source:'https://korean.beijing.gov.cn/travellinginbeijing/attractions/202604/t20260403_4574593.html'},
  {id:'heaven',name:'天坛·祈年殿',area:'南城 · 礼制建筑',x:1.55,z:1.02,height:.51,distance:2.4,view:[.45,.7,1.3],description:'蓝色琉璃瓦三重圆檐，朱红殿身立于三层汉白玉圆台之上。东西配殿、皇乾殿、祈年门与柏树围合，保留开阔祭坛和轴线。',source:'https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/201912/t20191211_1048233.html'},
  {id:'beihai',name:'北海·白塔',area:'皇家园林 · 琼华岛',x:-1.45,z:-.10,height:.60,distance:2.3,view:[.3,.6,1.2],description:'白色覆钵式塔身、层叠相轮与金色宝顶，置于湖心林丘。永安寺山门、石桥与湖面构成前后层次，不做普通楼阁塔。',source:'https://www.beijing.gov.cn/tsbj/sxym/202512/t20251212_4338563.html'},
  {id:'jingshan',name:'景山·五亭',area:'中轴线 · 御苑山林',x:0,z:-1.07,height:.66,distance:3.2,view:[.38,.90,1.35],description:'中央万春亭以三重黄瓦檐为主，两侧绿瓦八角亭与蓝瓦圆亭依次降落在林坡上。南麓绮望楼、北麓寿皇殿和林间登山路组成完整御苑缩影；沿中轴连接故宫与钟鼓楼。',source:'https://gygl.beijing.gov.cn/mlgy/mlgy_lsmy/201911/t20191129_732675.html'},
  {id:'drum',name:'钟鼓楼',area:'中轴线 · 晨钟暮鼓',x:0,z:-1.99,height:.48,distance:2.3,view:[.55,.65,1.1],description:'前方朱红鼓楼与后方灰砖钟楼独立成组，保留厚重台座、通高门洞、绿瓦重檐和两楼之间的广场。',source:'https://www.beijing.gov.cn/renwen/rwzyd/qxdw/zmzhzhpgj/zhgl/202309/t20230919_3262298.html'},
  {id:'theatre',name:'国家大剧院',area:'长安街 · 钛与玻璃',x:-1.32,z:1.28,height:.25,distance:2.4,view:[.4,.48,1.2],description:'银色钛金属半椭球，中央玻璃幕墙如拉开的帷幕。低矮舒展的壳体位于独立水池中，灯光以温柔透光为主。',source:'https://www.chncpa.org/cgylx/jyjg/'},
  {id:'cctv',name:'央视总部',area:'国贸 · 立体环形',x:1.45,z:-.60,height:.78,distance:2.6,view:[.8,.35,1.3],description:'两座倾斜玻璃塔身在顶部错位相连，留下巨大的中央空洞。深色菱形结构网格和缓慢变化的窗灯强调立体环形轮廓。',source:'https://www.turnerconstruction.com/projects/china-central-television-headquarters-cctv'},
  {id:'summer',name:'颐和园',area:'西郊 · 昆明湖与万寿山',x:-.77,z:.65,hemisphere:-1,height:.80,distance:3.1,view:[.45,.9,1.3],description:'佛香阁以八面三层四重檐呈现：橙黄瓦心与深绿脊边、朱柱回廊、青蓝金色梁枋和内收窗棂。下方石台、白石栏杆与山坡分层，长廊和昆明湖保留园林关系；为主要景观缩影。',source:'https://s.visitbeijing.com.cn/index.php/line/463'},
  {id:'wall',name:'八达岭长城',area:'北部山地 · 关城',x:-.40,z:-1.10,hemisphere:-1,height:.44,distance:3.2,view:[.4,.9,1.3],description:'沿起伏山脊连续延伸的灰砖城墙、垛口、石阶和四座敌楼。山势与城墙共同变化，步道保持通透，不以平直围墙代替。',source:'https://www.beijing.gov.cn/renwen/bjgk/yqgk/fg/202212/t20221202_2870249.html'},
  {id:'nest',name:'鸟巢',area:'奥林匹克 · 国家体育场',x:.85,z:.73,hemisphere:-1,height:.32,distance:2.4,view:[.45,.75,1.2],description:'椭圆体育场以交织的银灰钢构包覆红色看台，屋顶中央开口。外壳、入口和内碗分层制作，夜间让暖红内场透过钢网。',source:'https://www.l-a-v-a.net/projects/beijing-watercube/'},
  {id:'watercube',name:'水立方',area:'奥林匹克 · 国家游泳中心',x:1.44,z:-.52,hemisphere:-1,height:.25,distance:2.1,view:[.65,.5,1.2],description:'扁平蓝色方体由不规则气枕表皮覆盖，屋顶与四侧连续成面。夜间青蓝光缓慢呼吸，保留透明气泡材质的层次。',source:'https://www.l-a-v-a.net/projects/beijing-watercube/'},
].map(item=>({...item,grounded:true}));
const builders={jingshan,palace,tiananmen,heaven,summer,wall:greatWall,beihai,drum:drumBell,nest,watercube,theatre,cctv};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Beijing landmark: ${id}`);return builders[id](k);}
