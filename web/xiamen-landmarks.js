import {bagua,sunlight,shuzhuang} from './xiamen-island.js';
import {putuo,jiannan,jimei} from './xiamen-heritage.js';
import {twins,haicang} from './xiamen-modern.js';
export const LANDMARKS=[
 {id:'bagua',name:'鼓浪屿·八卦楼',area:'红穹顶 · 环绕柱廊',x:-1.08,z:.94,height:.83,distance:2.9,view:[.45,.80,1.8],description:'红色八棱穹顶叠在八角顶座上，四面中央柱廊向内退进，奶白柱式与红褐色四段百叶门扇分出层次。补入瓦面、天窗、细栏与入口石阶；夜间以柔光呈现立面，保留红顶与浅色石材。',source:'https://www.glyylq.cn/article.php?id=156'},
 {id:'twins',name:'世茂海峡双子塔',area:'海湾 · 双帆',x:1.08,z:.94,height:1.40,distance:3.1,view:[.5,.62,1.8],description:'两片高低错落的玻璃帆，斜切圆弧顶部、细密水平分缝与低矮裙房相连。夜景用紫蓝细边与缓慢变化的窗灯，保留玻璃的蓝灰底色。',source:'https://www.gensler.com/projects/xiamen-shimao-straits-tower'},
 {id:'putuo',name:'南普陀寺',area:'绿瓦飞檐 · 山寺荷塘',x:-1.08,z:-.94,height:.72,distance:3.05,view:[.35,1.02,1.8],description:'沿中轴排布入口殿、大雄宝殿与八角大悲殿，补入荷塘、台阶和两侧院廊。闽南翘脊、红柱与绿瓦相互区分，寺院后方以树冠收拢。',source:'https://twtemple.pixnet.net/blog/posts/16099080626'},
 {id:'jiannan',name:'厦门大学·建南大会堂',area:'嘉庚建筑 · 上弦场',x:1.08,z:-.94,height:.82,distance:3.15,view:[.42,.78,1.8],description:'中央高楼、递降两翼与后方红瓦礼堂形成完整体量。绿瓦燕尾脊下保留高窗和石栏，四根石柱撑起通高门廊；红褐百叶窗、细部花窗与上弦场石阶在日夜中保持各自的材质。',source:'https://jjc.xmu.edu.cn/info/1018/53831.htm'},
 {id:'sunlight',name:'鼓浪屿·日光岩',area:'花岗岩峰 · 登高观海',x:-1.08,z:.94,hemisphere:-1,height:.75,distance:2.85,view:[.48,.78,1.8],description:'高出林冠的圆钝花岗岩、岩面裂隙、贴岩石阶与顶部小观景台。峰顶保持开敞，不在岩顶凭空添加殿堂。',source:'https://teavanilla.com/51480.html'},
 {id:'shuzhuang',name:'菽庄花园·四十四桥',area:'藏海园 · 临海曲桥',x:1.08,z:.94,hemisphere:-1,height:.40,distance:2.9,view:[.32,1.1,1.8],description:'沿海礁石、曲折白栏桥、桥亭与岸上的闽南园屋。桥面高于海水，底部桥柱和转折栏杆可见，建筑留在岸上。',source:'https://www.chinadiscovery.com/xiamen-tours/gulangyu.html'},
 {id:'jimei',name:'集美学村·南薰楼',area:'龙舟池 · 嘉庚楼群',x:-1.08,z:-.94,hemisphere:-1,height:.88,distance:3.0,view:[.35,.85,1.8],description:'南薰楼逐层收起的塔身与红砖楼翼面向龙舟池，池中保留亭台和连接步道。夜间重点点亮屋脊与门窗，表现临水的嘉庚建筑。',source:'https://m.thepaper.cn/baijiahao_9143453'},
 {id:'haicang',name:'海沧大桥',area:'跨海悬索 · 海湾门户',x:1.08,z:-.94,hemisphere:-1,height:.61,distance:3.05,view:[.55,.86,1.8],description:'双门式桥塔、连续下垂主缆、竖向吊杆和悬空车道跨过海湾。夜间用细灯带描出主缆和桥面，不把悬索桥做成放射状斜拉索。',source:'https://k.sina.cn/article_1740522895_67be458f027011wyn.html'}
].map(item=>({...item,grounded:true}));
const builders={bagua,twins,putuo,jiannan,sunlight,shuzhuang,jimei,haicang};
export function createLandmark(k,id){if(!builders[id])throw new Error(`Unknown Xiamen landmark: ${id}`);return builders[id](k);}
