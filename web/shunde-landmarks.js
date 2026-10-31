import {bijiang} from './shunde-gardens.js';
import {qinghui} from './shunde-qinghui.js';
import {baolin} from './shunde-temple.js';
import {fengjian,huagai} from './shunde-streets.js';
import {shunfeng} from './shunde-park.js';
import {hem,theatre} from './shunde-modern.js';

export const LANDMARKS=[
  {id:'qinghui',name:'清晖园',area:'大良 · 岭南园林',x:-.99,z:.66,height:.43,distance:2.65,view:[.45,1.0,1.4],description:'双层船厅以灰砖、赭红木窗和细栏杆临水展开；澄漪亭架在方池边，碧溪草堂圆洞竹纹、六角亭、荷叶与游廊形成前后层次。依据实拍压缩主要景观，并非完整测绘复原。',source:'https://www.sdqinghuiyuan.cn/list/foldId/20.html'},
  {id:'shunfeng',name:'顺峰山公园',area:'大良 · 湖山与古塔',x:1.18,z:.70,height:.82,distance:3.5,view:[.45,1.10,1.5],description:'五行桥和牌坊连接开阔湖景，青龙阁伸入水面，九曲桥通向青云塔与林丘。保留红白塔身、灰绿檐口和橙瓦楼阁，夜间以桥栏、檐下和路径暖光呈现层次。景观为艺术化压缩，并非实际导览地图。',source:'https://cj.sina.com.cn/articles/view/5787187353/158f1789902001c98z'},
  {id:'hem',name:'和美术馆',area:'北滘 · 当代建筑',x:.83,z:-1.75,height:.51,distance:2.45,view:[.7,.75,1.4],description:'错位叠加的圆形楼层逐层外扩，细密竖向构件、低层方形展厅与水池共同表现建筑。采用灰白混凝土、银色格栅和深色玻璃。',source:'https://hem.org/zh/about/architecture'},
  {id:'huagai',name:'华盖路步行街',area:'大良 · 骑楼街景',x:-1.05,z:-1.13,height:.67,distance:2.75,view:[.40,1.0,1.4],description:'沿步行街排列的拱廊骑楼、粉彩立面、钟楼入口与灯笼。街道作为完整景点呈现，保留贯通的柱廊和可行走的中间空间。',source:'https://shundeplus.shundecity.com/index.php/phone/index/article?id=190752'},
  {id:'fengjian',name:'逢简水乡',area:'杏坛 · 石桥与进士牌坊',x:-1.01,z:.70,hemisphere:-1,height:.61,distance:2.6,view:[.6,.85,1.4],description:'水道穿过石拱桥，桥头的进士牌坊以深色柱架、金色装饰和上翘瓦檐表现。岸边保留树荫、石阶与小船，不用成片虚构民居填充。',source:'https://www.sohu.com/a/450999353_341089'},
  {id:'theatre',name:'顺德演艺中心',area:'大良 · 城市文化',x:1.03,z:.72,hemisphere:-1,height:.54,distance:2.65,view:[.5,.65,1.5],description:'通透的长方体玻璃外立面包裹红色折面屋顶，旁边是卵形石质音乐厅与灯塔。台阶、临水平台和暖色内部照明构成文化建筑群。',source:'https://web.p-t-group.com/sc/project-detail.php?projects_category_id=4&projects_id=52&projects_name=Shunde-Library-and-Performing-Arts-Centre'},
  {id:'bijiang',name:'碧江金楼',area:'北滘 · 灰砖与木雕',x:-.97,z:-1.02,hemisphere:-1,height:.48,distance:2.4,view:[.50,.75,1.5],description:'灰砖外墙、硬山瓦顶、木构阳台和侧院月洞门；金色细节集中在楼内木雕与梁架，外立面保持青灰和木色。',source:'https://www.sohu.com/a/190764153_743740'},
  {id:'baolin',name:'宝林寺',area:'大良 · 山林寺院',x:1.18,z:-1.20,hemisphere:-1,height:1.0,distance:3.35,view:[.35,1.05,1.5],description:'宽阔石阶沿山坡上升，串联三孔绿瓦山门、天王殿、钟鼓楼和大雄宝殿。灰砖、红柱、深色门窗与绿边暖瓦依实拍简化；夜间以檐下和步道暖光呈现山林寺院。此为压缩景观，并非完整导览地图。',source:'https://k.sina.cn/article_2407500342_8f7f8a360010022hp.html'},
].map(item=>({...item,grounded:true}));
const builders={qinghui,shunfeng,hem,huagai,fengjian,theatre,bijiang,baolin};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Shunde landmark: ${id}`);return builders[id](k);}
