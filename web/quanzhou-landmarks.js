import {kaiyuan,tianhou,wenmiao,luojia} from './quanzhou-temples.js';
import {qingjing,clock,luoyang} from './quanzhou-civic.js';
import {laojun} from './quanzhou-sculpture.js';
export const LANDMARKS=[
 {"id": "kaiyuan", "name": "开元寺·东西塔", "area": "五层石塔 · 闽南古寺", "x": -1.08, "z": 0.94, "height": 0.94, "distance": 3.0, "view": [0.4, 0.83, 1.8], "description": "五层八角石塔保留逐层错开的四门四龛、石斗拱、人物浮雕与须弥座，东塔略高于西塔。宽阔的重檐大殿与前庭相连；夜间柔光显出花岗岩层次，保留石材原色。", "source": "https://www.quanzhou.gov.cn/zfb/xxgk/ztxxgk/ggwhty/whssml/202305/t20230516_2880608.htm", "grounded": true},
 {"id": "laojun", "name": "清源山·老君岩", "area": "山林石刻 · 席地坐像", "x": 1.08, "z": 0.94, "height": 0.65, "distance": 2.8, "view": [0.2, 0.62, 1.8], "description": "按实拍保留长髯、垂耳、依膝与凭几的席地坐姿，石像后方以山石和林冠围合。它是自然山麓石刻，不凭空补一座大殿遮住。", "source": "https://www.quanzhou.gov.cn/lyb/lswh/zdww/201609/t20160913_372298.htm", "grounded": true},
 {"id": "qingjing", "name": "清净寺", "area": "尖拱石门 · 海丝遗存", "x": -1.08, "z": -0.94, "height": 0.65, "distance": 3.1, "view": [0.38, 1.0, 1.8], "description": "高挑灰白石门、递进尖拱与望月台保留纵深；无顶奉天坛以通透石窗、凹龛和立柱围成庭院，后方明善堂与碑亭分别呈现木石细节。", "source": "https://www.media.sdu.edu.cn/info/1002/33093.htm", "grounded": true},
 {"id": "tianhou", "name": "泉州天后宫", "area": "妈祖庙宇 · 剪瓷雕脊", "x": 1.08, "z": -0.94, "height": 0.57, "distance": 3.2, "view": [0.3, 0.92, 1.8], "description": "三段燕尾山门、朝内戏台、重檐天后殿与后方寝殿沿轴线展开。灰橙瓦、剪瓷龙脊、石雕柱与红砖花窗保留闽南色彩，暖灯藏于檐下。", "source": "https://you.ctrip.com/sight/quanzhou243/8877.html", "grounded": true},
 {"id": "luoyang", "name": "洛阳桥", "area": "跨海石梁 · 船形桥墩", "x": -1.08, "z": 0.94, "height": 0.62, "distance": 3.15, "view": [0.48, 0.88, 1.8], "description": "厚条石梁跨过带尖头基础的石墩，桥中岛保留灰石亭与树荫，月光菩萨塔和五层石塔各有不同轮廓。桥长与跨数作微缩压缩，保留石桥结构、水平石栏和潮痕。", "source": "https://www.thepaper.cn/newsDetail_forward_29703375", "grounded": true, "hemisphere": -1},
 {"id": "clock", "name": "泉州钟楼", "area": "四面时钟 · 古城十字街", "x": 1.08, "z": 0.94, "height": 0.74, "distance": 2.7, "view": [0.4, 0.68, 1.8], "description": "白色钟楼保留四脚底架、方形楼身、四面罗马数字时钟、八角顶部与方向标。路口与行人作为比例参照，周边不以无名房屋填空。", "source": "https://news.ijjnews.com/system/2019/12/31/030004231.shtml", "grounded": true, "hemisphere": -1},
 {"id": "luojia", "name": "石狮·洛伽寺", "area": "礁石海岛 · 红瓦殿堂", "x": -1.08, "z": -0.94, "height": 0.66, "distance": 3.25, "view": [0.38, 1.05, 1.8], "description": "重檐圆通宝殿、低矮前殿、黄墙绿瓦山门、钟鼓楼与两层长廊围合临海前庭。橙红瓦垄、剪瓷龙脊、石柱和花岗岩海堤按实拍保留；灯光从檐下与柱廊透出。", "source": "https://www.mnw.cn/shishi/news/2946517.html", "grounded": true, "hemisphere": -1},
 {"id": "wenmiao", "name": "泉州府文庙", "area": "大成殿 · 泮池石桥", "x": 1.08, "z": -0.94, "height": 0.54, "distance": 3.15, "view": [0.38, 1.35, 1.8], "description": "宽阔七间大成殿、暖橙重檐和剪瓷脊保留宋式庑殿轮廓；石龙柱与菱格红门面向露台、古榕和泮池。平缓石梁桥连接大成门，两侧长廊围合庭院。", "source": "https://www.mnw.cn/quanzhou/licheng/3057699.html", "grounded": true, "hemisphere": -1},
];
const builders={kaiyuan,laojun,qingjing,tianhou,luoyang,clock,luojia,wenmiao};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Quanzhou landmark: ${id}`);return builders[id](k);}
