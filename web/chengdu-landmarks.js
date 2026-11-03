import {wuhou,dufu,anshun} from './chengdu-heritage.js';
import {ifs,pandaTower,tianfu} from './chengdu-modern.js';
import {jinsha,dongan} from './chengdu-culture.js';
export const LANDMARKS=[
 {id:'wuhou',name:'武侯祠·汉昭烈庙',area:'红墙古柏 · 入口庭院',x:-.96,z:.86,height:.39,distance:2.6,view:[.24,.68,1.8],description:'灰瓦五开间门屋、红墙、石狮和竹影小径。根据入口与林荫实拍制作，呈现武侯祠的前庭片段，不将它冒充整个祠庙建筑群。',source:'https://news.cri.cn/20230723/399db06e-9fb9-6b3b-66b0-938a43027c0f.html'},
 {id:'anshun',name:'安顺廊桥',area:'锦江 · 三孔廊桥',x:1.01,z:.87,height:.65,distance:2.8,view:[.25,.50,1.8],description:'三座透空桥拱、桥肩圆洞、长屋脊与两端亭阁。暖金灯光勾勒桥洞和檐口，保留灰白桥身与深色瓦顶。',source:'https://unsplash.com/photos/photography-of-building-and-bridge-during-nighttime-ogCzbpkxdK4'},
 {id:'ifs',name:'成都IFS·爬墙熊猫',area:'春熙路 · I AM HERE',x:-1.04,z:-.87,height:1.14,distance:2.9,view:[.25,.65,1.8],description:'黑白熊猫攀在商场外墙，前爪越过屋顶，后腿悬在立面上；玻璃塔楼和暖色店面保留商业街层次。雕塑原作由 Lawrence Argent 创作，此处为几何缩微表达。',source:'https://www.hkcd.com.hk/content_p/2024-07/01/content_173280.html'},
 {id:'pandaTower',name:'熊猫基地·熊猫塔',area:'芙蓉花塔 · 铜色外肋',x:1.09,z:-.87,height:1.24,distance:2.8,view:[.26,.69,1.8],description:'十一层逐级收窄的观景平台、铜色花瓣外肋和高起的三片尖梢。正面留出透空切口，可以看到内层平台、扶手与支撑。',source:'https://www.gooood.cn/panda-tower-in-chengdu-research-base-of-giant-panda-breeding-udg-atelier-alpha.htm'},
 {id:'dufu',name:'杜甫草堂·茅屋故居',area:'浣花溪 · 竹林茅屋',x:-1.00,z:.88,hemisphere:-1,height:.41,distance:2.6,view:[.28,.63,1.8],description:'低矮土墙、木格门窗、厚茅草屋面和竹林水院。呈现草堂内茅屋故居这一处景观，避免将整个博物馆简化成一栋古宅。',source:'https://you.ctrip.com/sight/chengdu104/4226.html'},
 {id:'tianfu',name:'天府美术馆',area:'天府艺术公园 · 芙蓉曲面',x:1.06,z:.87,hemisphere:-1,height:.49,distance:2.9,view:[.25,.60,1.8],description:'舒展的白色花瓣屋面、暖色檐底、内退玻璃与倒影水院，按实拍提炼大跨度曲面。细分缝和檐下照明强调结构层次。',source:'https://www.lopochina.com/tianfu-art-museum-in-metallic-glazed-terracotta.html'},
 {id:'jinsha',name:'金沙遗址博物馆·陈列馆',area:'古蜀文明 · 斜屋面',x:-1.04,z:-.89,hemisphere:-1,height:.30,distance:2.8,view:[.30,.85,1.8],description:'低缓斜屋面、圆形采光凹口、细长天窗和内退玻璃入口。前方独立呈现太阳神鸟纪念雕塑；图案为几何提炼，并非文物扫描。',source:'https://www.jinshasitemuseum.com/node/188'},
 {id:'dongan',name:'东安湖·主体育场',area:'大运场馆 · 太阳神鸟',x:1.08,z:-.87,hemisphere:-1,height:.25,distance:2.9,view:[.32,.95,1.7],description:'圆形开放屋盖、连续看台碗、玻璃立面与太阳神鸟纹样。夜间以暖金屋面和冷色外缘形成层次，展示主体育场而非整个一场三馆。',source:'https://www.thepaper.cn/newsDetail_forward_24034888'},
].map(item=>({...item,grounded:true}));
const builders={wuhou,dufu,anshun,ifs,pandaTower,tianfu,jinsha,dongan};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Chengdu landmark: ${id}`);return builders[id](k);}
