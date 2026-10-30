# 长沙地图与造型参考

长沙入口为 `changsha.html`，含九组可独立添加或移除的地标。当前交付景观地图，未接入长沙多人旅行目录；杭州、上海和武汉旅行保持。

## 实景与模型

| 地标 | 实际观察与模型特征 | 来源 |
| --- | --- | --- |
| 岳麓书院 | 灰瓦白墙、多进院落、讲学中轴、御书楼及侧院赭黄色文庙 | [湖南大学建筑资料](https://ylsy.hnu.edu.cn/info/1011/9009.htm)、[院落航拍](https://m.app.dawuhanapp.com/wuhan/p/31648525.html) |
| 爱晚亭 | 绿色重檐、灰色外柱和红色内柱、山坡石阶和枫林 | [湖南文旅资料](https://whhlyt.hunan.gov.cn/ggwh/201408/t20140804_5430585.html)、[中南大学照片](https://px.csu.edu.cn/info/1015/1207.htm) |
| 杜甫江阁 | 三层飞檐、红柱、白色回廊、正面石阶与夜间暖光 | [湖南省英文资料](https://enghunan.gov.cn/hneng/News/UpcomingEvents/202408/t20240801_33417827.html)、[夜间实拍](https://bbs.zol.com.cn/dcbbs/d34024_4316.html) |
| 天心阁 | 深色木构与瓦顶、主阁和侧阁、灰砖厚城墙与垛口 | [港铁长沙景点照片](https://www.highspeed.mtr.com.hk/en/travel/changsha.html) |
| 橘子洲大桥 | 连续低拱、桥墩、双向车道、岛上环形匝道与狭长绿洲 | [长沙晚报航拍](https://www.icswb.com/h/152/20160518/415626.html)、[湖南省橘子洲资料](https://www.hunan.gov.cn/hnszf/c101474/202108/t20210827_20403826.html) |
| 长沙国金中心 | 高低双塔、深蓝玻璃、退台塔冠、竖向构件与商场裙楼 | [建筑事务所资料](https://www.wongtung.com/cn/projects/changsha-international-finance-square-2/)、[整体建筑实拍](https://www.kinlong.com/case-landmark/9.html) |
| 湖南博物院 | 宽大的深色悬挑屋盖、通高玻璃、两侧浅色展馆与下层入口 | [正立面实拍](https://travel.voc.com.cn/article/201712/201712010956426419.html) |
| 梅溪湖艺术中心 | 大剧场、小剧场与艺术馆三组流动体量、白色折带、玻璃缝隙和连通前场 | [北京市建筑设计研究院](https://www.biad.com.cn/project/id/8/)、[航拍照片](https://www.hunantoday.cn/news/xhn/202609/33876599.html) |
| 谢子龙影像艺术馆 | 浅色清水混凝土、悬挑与架空水院、狭长窗、窄桥与入口楼梯 | [湖南湘江新区照片](https://xjxq.hunan.gov.cn/hnxjxq/sytpxw/202003/t20200318_11814798.html) |

制作前已实际查看照片，修正了屋顶开口、城墙支承、场馆体量相交、玻璃与白色外墙比例。原始照片仅用于观察，未作为贴图或打包至仓库。来源页面可用性由原网站决定，不依据这些页面提供票价、开放或预约承诺。

## 表达边界

地图是艺术化微缩景观，保留主要轮廓和材质，并非精确测绘。湘江、洲地、尺寸和双半球位置经过重排；洲地为地形表达，未制作橘子洲人物雕塑。秋色、灯光和缓慢变化用于场景表现，不代表真实景区当日状态或完整灯光秀。

八组建筑分布于两个半球，橘子洲大桥作为第九个独立模块横跨湘江。岳麓山直接由球面地形起伏形成，山林避开书院和爱晚亭；两岸步道连接景点入口。每组建筑的台阶、植物、广场与灯光跟随整个模块增删；共享山地、河道、岛屿与岸边步道保留，桥梁和桥上灯光整体移除。减少动态效果设置会停止窗灯和轮廓光动画。

`npm test` 检查全部模型顶点落地、主河道避让、景点间距、完整模块及资源释放，并用射线检查书院屋顶闭合、城门通道、山体避让庭院及桥面连续性和桥下通道。`python tools/destination-check.py changsha` 使用独立内存服务检查日夜近看、触屏、键盘、窄屏、保存恢复和 WebGL 故障重试。手机模拟不等于真机性能验收。

## 实际网页画面

![岳麓书院院落](images/changsha-yuelu.png)

![梅溪湖三组场馆夜景](images/changsha-meixi-night.png)


![长沙山水洲城全景](images/changsha-overview.png)

![橘子洲大桥与两岸](images/changsha-bridge.png)
