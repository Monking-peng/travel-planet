# 北京地图与造型参考

北京提供独立地标地图，入口为 `beijing.html`。杭州、上海、武汉的多人旅行继续保留；北京当前没有多人旅行目录或排程，不将景观坐标用于旅行距离计算。

## 十二组地标

| 地标 | 已制作的主要特征 | 参考 |
| --- | --- | --- |
| 故宫 | 午门、三大殿、内廷、宫墙角楼、黄瓦朱柱与三层台基 | [故宫博物院·太和殿](https://www.dpm.org.cn/explore/building/236465.html)；[宫城俯瞰照片](https://n.sinaimg.cn/sinakd2021615s/52/w2048h1204/20210615/a31e-krpikqf2031862.jpg) |
| 天安门·金水桥 | 宽城台、五券门、九开间柱廊、重檐、七座桥与华表 | [北京市介绍](https://korean.beijing.gov.cn/travellinginbeijing/attractions/202604/t20260403_4574593.html)；[正立面照片](https://bivitour.com/Uploads/images/BaiViet/chuyen-phat-nhanh-bac-kinh.png) |
| 天坛·祈年殿 | 三重蓝瓦圆檐、朱柱、三层白石圆台、围栏与配殿 | [北京市公园管理中心](https://gygl.beijing.gov.cn/mlgy/mlgy_gyjg01/201912/t20191211_1048233.html)；[俯瞰照片](https://p0.itc.cn/images03/20200528/b38a3a4604f14b3d87bed0a07f656df4.jpeg) |
| 颐和园 | 昆明湖、万寿山、八角佛香阁、橙黄瓦心与深绿脊边、红柱外廊、青蓝金色梁枋、依山石阶、长廊与拱桥 | [北京旅游介绍](https://s.visitbeijing.com.cn/index.php/line/463)；[佛香阁照片](https://stat.ameba.jp/user_images/20240520/10/sisiza1949/c1/e1/j/o0640048015441067520.jpg) |
| 八达岭长城 | 连续山脊、随坡城墙、垛口、石阶与四座敌楼 | [北京市山地照片](https://www.beijing.gov.cn/renwen/bjgk/yqgk/fg/202212/t20221202_2870249.html) |
| 北海·白塔 | 湖心林丘、覆钵塔身、相轮、宝顶、山门和桥梁 | [北京市介绍](https://www.beijing.gov.cn/tsbj/sxym/202512/t20251212_4338563.html)；[白塔与山门照片](https://adventurepatches.com/wp-content/uploads/2015/09/Sept-14-2015-Beihai-Park-102-copy.jpg) |
| 钟鼓楼 | 前红后灰的两座城楼、厚台座、绿瓦重檐和独立广场 | [北京市介绍](https://www.beijing.gov.cn/renwen/rwzyd/qxdw/zmzhzhpgj/zhgl/202309/t20230919_3262298.html)；[鼓楼照片](https://r1.visitbeijing.com.cn/vbj-spanish/2024/0929/e94fc9f258a099da319ea34ce5cdb84f.jpg) |
| 国家大剧院 | 银灰半椭球、中央玻璃帷幕、分缝与环绕水池 | [国家大剧院建筑介绍](https://www.chncpa.org/cgylx/jyjg/)；[外观照片](https://k.sinaimg.cn/n/sinacn/20170801/36db-fyinvwu4442225.jpg/w700d1q75cms.jpg) |
| 央视总部 | 倾斜环形、真实穿孔、错位深度、菱形结构网与动态窗灯 | [承建方介绍](https://www.turnerconstruction.com/projects/china-central-television-headquarters-cctv)；[CTBUH 外观照片](https://images.skyscrapercenter.com/building/cctv_2_arup.jpg) |
| 鸟巢 | 椭圆外壳、交织钢构、红色内碗与开口屋顶 | [奥林匹克场馆照片](https://www.l-a-v-a.net/assets/Uploads/_resampled/croppedimage755510-0802-watercube-opening-10151.jpg) |
| 水立方 | 蓝色扁方体、屋面与立面不规则气枕、缓慢呼吸灯光 | [设计团队项目资料](https://www.l-a-v-a.net/projects/beijing-watercube/) |
| 景山·五亭 | 横向林丘、万春亭三重黄檐、内侧绿瓦八角亭、两端蓝瓦圆亭、南麓绮望楼与北麓寿皇殿 | [公园管理中心](https://gygl.beijing.gov.cn/mlgy/mlgy_lsmy/201911/t20191129_732675.html)；[白天全山实拍](https://yllhj.beijing.gov.cn/ztxx/kpjd/202312/W020231222579337960747.jpg)；[周赏亭形制](https://gygl.beijing.gov.cn/whgy/whgy_wsgc/201912/t20191206_885594.html)；[寿皇殿整体实拍](https://r1.visitbeijing.com.cn/vbj-s/2022/0507/b157687de149cd6a2173b27b42da9cec.jpg) |

## 表达范围

模型为程序化微缩景观。保留辨识度较高的轮廓、材质和场地关系；建筑规模、相对位置、附属院落和细部有压缩，装饰图像未复刻。灯光为适合地图浏览的艺术化设计，不模拟真实演出时间或全部灯光程序。参考照片用于观察，没有作为产品贴图或提交包素材。

新城市共用的浏览器控制位于 `destination-viewer.js`，整组管理位于 `destination-module-panel.js`。北京模型与原三城模型独立；每组建筑、树木、水池和灯光一同增删，保存仅作用于当前浏览器。景山的亭阁、山体、林地、院落和灯光是一个完整模块。连接天安门、故宫、景山、钟鼓楼的球面步道属于公共景观，保留北南关系，但不是实际道路导航，删除地标后保留。

## 验收

自动检查包含有限几何、球面间距、真实穿孔、移除后的灯光和资源释放、日夜颜色以及减少动态效果。`python tools/destination-check.py beijing` 检查桌面与手机视口、全部近看入口、触屏拖动与缩放、夜景变化、保存恢复以及 WebGL 丢失后的重试。手机检查采用浏览器模拟；实际设备性能仍需真机验证。


![景山五亭、林丘与南麓绮望楼](images/beijing-jingshan.png)

![景山夜间檐口与林间步道](images/beijing-jingshan-night.png)


0.26.0 对照[北京旅游网佛香阁实拍](https://s.visitbeijing.com.cn/attraction/120932)和[公园管理中心形制说明](https://gygl.beijing.gov.cn/whgy/whgy_wsgc/201912/t20191206_885777.html)，重做八角主体、四重瓦檐、入口层、两层外廊和顶部窗带。外廊保留真实进深，门窗向内收，台基石缝与白石栏杆和红色木栏分开；夜景使用低亮度暖光，保留瓦面和梁枋配色。本批只修主体和台基，不宣称完整还原颐和园平面。

![佛香阁与下方园林](images/beijing-summer.png)

![佛香阁夜景](images/beijing-summer-night.png)


0.27.0 对照 [LAVA 设计团队水立方照片](https://www.l-a-v-a.net/projects/beijing-watercube/)，将硬折面改为浅蓝灰连续气枕，细化接缝和底部玻璃入口雨棚。球面贴合保留气枕平滑法线，夜间蓝光集中在膜块边缘，中心保留较暗层次。原页面室内照片、剖面模型未当作外墙依据；夜景为缩微表达，不复刻特定灯光秀。

![水立方白天](images/beijing-watercube.png)

![水立方夜景](images/beijing-watercube-night.png)


0.34.0 对照[北京市八达岭全景](https://english.beijing.gov.cn/specials/wanderinginbeijing/route4/scenicspots/202304/t20230427_3082028.html)、[北京日报山林实拍](https://xinwen.bjd.com.cn/channels/5b165687a010550e5ddc0e6a/contentShare/5de8be9be4b0fe93cc167bbc/AP64524bd6e4b05339adcd025c.html)和[步道游记照片](https://www.zhangchengwei.work/camera/beijing-3)，重做长城的连续山脊、灰褐砖石、阶梯、垛口和贯通拱门敌楼。灌木沿坡组织，塔基与地形相接。采用低亮度路径灯和暖色建筑照明，不复刻实际夜游安排；山势和路线为艺术化压缩。

![八达岭山脊与城墙](images/beijing-wall.png)

![长城夜间建筑与石阶](images/beijing-wall-night.png)
