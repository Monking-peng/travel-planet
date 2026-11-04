import {wuhou,dufu,anshun} from './chengdu-heritage.js';
import {ifs,pandaTower,tianfu} from './chengdu-modern.js';
import {jinsha,dongan} from './chengdu-culture.js';
export const LANDMARKS=[
 {id:'wuhou',name:'武侯祠·汉昭烈庙',area:'红墙古柏 · 入口庭院',x:-1.06,z:.96,height:.48,distance:2.8,view:[.24,.68,1.8],description:'灰黑瓦顶、深木门、红柱与四盏灯笼，前方石狮和台阶连接入口。红墙竹影与古树围合庭院，中央通道保持开放；呈现汉昭烈庙入口片段，不代表整个武侯祠。',source:'https://en.wuhouci.net.cn/about'},
 {id:'anshun',name:'安顺廊桥',area:'锦江 · 三孔廊桥',x:1.01,z:.87,height:.65,distance:2.8,view:[.25,.50,1.8],description:'三孔尖拱与桥肩圆洞保留真实开口，灰石砌缝、雕纹石栏、双层亭阁和红柱回廊补齐层次。两端台阶沿桥轴连接桥面；夜间暖光照亮檐下与拱腹，瓦顶保持深灰。',source:'https://unsplash.com/photos/photography-of-building-and-bridge-during-nighttime-ogCzbpkxdK4'},
 {id:'ifs',name:'成都IFS·爬墙熊猫',area:'春熙路 · I AM HERE',x:-1.04,z:-.87,height:1.14,distance:2.9,view:[.25,.65,1.8],description:'黑白熊猫攀在商场外墙，前爪越过屋顶，后腿悬在立面上；玻璃塔楼和暖色店面保留商业街层次。雕塑原作由 Lawrence Argent 创作，此处为几何缩微表达。',source:'https://www.hkcd.com.hk/content_p/2024-07/01/content_173280.html'},
 {id:'pandaTower',name:'熊猫基地·熊猫塔',area:'芙蓉花塔 · 铜色外肋',x:1.09,z:-.87,height:1.24,distance:2.8,view:[.26,.69,1.8],description:'十一层逐级收窄的观景平台、铜色花瓣外肋和高起的三片尖梢。正面留出透空切口，可以看到内层平台、扶手与支撑。',source:'https://www.gooood.cn/panda-tower-in-chengdu-research-base-of-giant-panda-breeding-udg-atelier-alpha.htm'},
 {id:'dufu',name:'杜甫草堂·茅屋故居',area:'浣花溪 · 竹林茅屋',x:-1.00,z:.88,hemisphere:-1,height:.41,distance:2.6,view:[.28,.63,1.8],description:'低矮土墙、木格门窗、厚茅草屋面和竹林水院。呈现草堂内茅屋故居这一处景观，避免将整个博物馆简化成一栋古宅。',source:'https://you.ctrip.com/sight/chengdu104/4226.html'},
 {id:'tianfu',name:'天府美术馆',area:'天府艺术公园 · 芙蓉曲面',x:1.18,z:1.17,hemisphere:-1,height:.43,distance:3.3,view:[.25,.60,1.8],description:'五片宽翼舒展成白色芙蓉屋顶，中央留出下沉庭院，玻璃后可见两层展厅和曲线楼梯。暖色檐底与室内灯光分层，临水步道在背面接回陆地。',source:'https://www.archiposition.com/items/71382578ed'},
 {id:'jinsha',name:'金沙遗址博物馆·陈列馆',area:'古蜀文明 · 斜屋面',x:-1.04,z:-.89,hemisphere:-1,height:.30,distance:2.8,view:[.30,.85,1.8],description:'低缓斜屋面、圆形采光凹口、细长天窗和内退玻璃入口。前方独立呈现太阳神鸟纪念雕塑；图案为几何提炼，并非文物扫描。',source:'https://www.jinshasitemuseum.com/node/188'},
 {id:'dongan',name:'东安湖·主体育场',area:'大运场馆 · 太阳神鸟',x:1.08,z:-.87,hemisphere:-1,height:.25,distance:2.9,view:[.32,.95,1.7],description:'圆形开放屋盖、连续看台碗、玻璃立面与太阳神鸟纹样。夜间以暖金屋面和冷色外缘形成层次，展示主体育场而非整个一场三馆。',source:'https://www.thepaper.cn/newsDetail_forward_24034888'},
].map(item=>({...item,grounded:true}));
const builders={wuhou,dufu,anshun,ifs,pandaTower,tianfu,jinsha,dongan};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Chengdu landmark: ${id}`);return builders[id](k);}
