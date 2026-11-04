import {kaiyuan,tianhou,wenmiao,luojia} from './quanzhou-temples.js';
import {qingjing,clock,luoyang} from './quanzhou-civic.js';
import {laojun} from './quanzhou-sculpture.js';
export const LANDMARKS=[
 {"id": "kaiyuan", "name": "开元寺·东西塔", "area": "五层石塔 · 闽南古寺", "x": -1.08, "z": 0.94, "height": 0.94, "distance": 3.0, "view": [0.4, 0.83, 1.8], "description": "五层八角石塔保留逐层错开的四门四龛、石斗拱、人物浮雕与须弥座，东塔略高于西塔。宽阔的重檐大殿与前庭相连；夜间柔光显出花岗岩层次，保留石材原色。", "source": "https://www.quanzhou.gov.cn/zfb/xxgk/ztxxgk/ggwhty/whssml/202305/t20230516_2880608.htm", "grounded": true},
 {"id": "laojun", "name": "清源山·老君岩", "area": "山林石刻 · 席地坐像", "x": 1.08, "z": 0.94, "height": 0.65, "distance": 2.8, "view": [0.2, 0.62, 1.8], "description": "按实拍保留长髯、垂耳、依膝与凭几的席地坐姿，石像后方以山石和林冠围合。它是自然山麓石刻，不凭空补一座大殿遮住。", "source": "https://www.quanzhou.gov.cn/lyb/lswh/zdww/201609/t20160913_372298.htm", "grounded": true},
 {"id": "qingjing", "name": "清净寺", "area": "尖拱石门 · 海丝遗存", "x": -1.08, "z": -0.94, "height": 0.54, "distance": 2.75, "view": [0.35, 0.74, 1.8], "description": "灰白石砌门楼、层层尖拱与开敞的旧礼拜殿遗存，和后方较小的中式明善堂区分。门洞保持真实贯通，石墙保留砌缝。", "source": "https://www.media.sdu.edu.cn/info/1002/33093.htm", "grounded": true},
 {"id": "tianhou", "name": "泉州天后宫", "area": "妈祖庙宇 · 剪瓷雕脊", "x": 1.08, "z": -0.94, "height": 0.55, "distance": 2.9, "view": [0.3, 0.92, 1.8], "description": "山门、前庭、两侧院廊与后方正殿沿轴线排列。入口龙柱、红灯笼、灰绿瓦和屋脊双龙形成闽南识别点，暖光从柱廊与门内透出。", "source": "https://you.ctrip.com/sight/quanzhou243/8877.html", "grounded": true},
 {"id": "luoyang", "name": "洛阳桥", "area": "跨海石梁 · 船形桥墩", "x": -1.08, "z": 0.94, "height": 0.43, "distance": 2.85, "view": [0.48, 0.88, 1.8], "description": "条石梁面跨在船形石墩上，补入桥亭、石塔和石栏。桥下保留清楚的水面与墩间空隙，不把古代梁桥画成拱桥。", "source": "https://www.thepaper.cn/newsDetail_forward_29703375", "grounded": true, "hemisphere": -1},
 {"id": "clock", "name": "泉州钟楼", "area": "四面时钟 · 古城十字街", "x": 1.08, "z": 0.94, "height": 0.74, "distance": 2.7, "view": [0.4, 0.68, 1.8], "description": "白色钟楼保留四脚底架、方形楼身、四面罗马数字时钟、八角顶部与方向标。路口与行人作为比例参照，周边不以无名房屋填空。", "source": "https://news.ijjnews.com/system/2019/12/31/030004231.shtml", "grounded": true, "hemisphere": -1},
 {"id": "luojia", "name": "石狮·洛伽寺", "area": "礁石海岛 · 红瓦殿堂", "x": -1.08, "z": -0.94, "height": 0.64, "distance": 3.0, "view": [0.38, 1.05, 1.8], "description": "完整寺院落在有石砌海堤的礁石岛上，以步桥连向岸边。橙红瓦、黄色墙体、主殿重檐和两侧楼阁共同面向海面。", "source": "https://www.mnw.cn/shishi/news/2946517.html", "grounded": true, "hemisphere": -1},
 {"id": "wenmiao", "name": "泉州府文庙", "area": "大成殿 · 泮池石桥", "x": 1.08, "z": -0.94, "height": 0.54, "distance": 2.9, "view": [0.3, 0.95, 1.8], "description": "双檐大成殿、石刻龙柱、泮池与小石桥串起前庭，两侧榕树和院廊留出观赏视线。夜晚保留木门与瓦面的原色。", "source": "https://www.mnw.cn/quanzhou/licheng/3057699.html", "grounded": true, "hemisphere": -1},
];
const builders={kaiyuan,laojun,qingjing,tianhou,luoyang,clock,luojia,wenmiao};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Quanzhou landmark: ${id}`);return builders[id](k);}
