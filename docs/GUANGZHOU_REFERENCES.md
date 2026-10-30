# 广州地图与造型参考

广州入口为 `guangzhou.html`，含八组可独立增删的地标。当前为景观地图，未接入广州多人旅行目录；杭州、上海和武汉旅行保持。

## 实景与模型

| 地标 | 实际观察与模型特征 | 来源 |
| --- | --- | --- |
| 广州塔 | 银白色镂空网架、偏上部收腰、观光平台和天线；夜间彩光沿网架变化 | [广州市政府建筑介绍](https://www.eguangzhou.gov.cn/globalgzpastandpresence/content/post_31123.html)、[白天实拍](https://www.52hrtt.com/fr/n/w/info/G1685709784443) |
| 珠江新城东西塔 | 西塔弧面三角平面、菱格结构；东塔浅色竖向构件、分段退台与高低冠顶 | [WilkinsonEyre 西塔](https://wilkinsoneyre.com/projects/guangzhou-international-finance-center)、[KPF 东塔](https://www.kpf.com/project/ctf-finance-centre)、[东塔实拍](https://www.toshiba-airconditioning.com.cn/dongzhi/case/detail?case_id=60373912c8894504fc4a3e44)、[夜景实拍](https://www.baike.com/wiki/%E5%B9%BF%E5%B7%9E%E4%B8%9C%E5%A1%94) |
| 广州大剧院 | 大小两块非规则砾石体量、灰色石材三角面、通透玻璃幕墙与前方水面 | [广州社科院资料](https://www.gzass.gd.cn/whzc/wenhuasheshi/yingjuyuan/120.html)、[夜间实拍](https://jp.trip.com/travel-guide/attraction/guangzhou/guangzhou-grand-theatre-15066938/) |
| 广东省博物馆 | 灰色悬挑盒体、深红凹槽、收进的底层入口和石板立面 | [Rocco 建筑项目资料](https://www.archdaily.com/127122/guangdong-museum-rocco-design-architects)、[外观照片](https://finance.sina.com.cn/wm/2024-08-04/doc-inchmtfq2329372.shtml) |
| 中山纪念堂 | 蓝色层叠八角屋顶、红柱宽门廊、彩绘梁枋与天下为公匾额 | [正面照片](https://dp.pconline.com.cn/photo/list_3205165.html) |
| 陈家祠 | 三进三路厅堂、六个院落、灰砖硬山屋顶与彩色陶塑屋脊 | [广州文旅资料](https://wglj.gz.gov.cn/ztmb/gzhyn/ajjq/4a/content/post_9773088.html)、[航拍](https://huacheng.gz-cmc.com/pages/2022/10/26/3034a897ffc64513872b5c4a4138686b.html) |
| 石室圣心大教堂 | 双尖塔、花岗岩立面、玫瑰窗、尖拱门和长向中殿 | [越秀区资料](https://www.yuexiu.gov.cn/zjyx/yxjd/zjwh/content/post_8665100.html)、[实拍照片](https://www.synotrip.com/sites/default/files/107923/timg_29.jpg) |
| 五羊石像 | 一只高立的主羊和四只姿态不同的石羊、岩石底座及花坛林荫 | [广州社科院资料](https://www.gzass.gd.cn/whzc/wenhuaziyuan/wenhuajingguan/129.html)、[近景实拍](https://newbbs-fd.zol-img.com.cn/t_s1200x5000/g5/M00/03/09/ChMkJlg-Xg-IfuWuAAcNs1dIREwAAYLMwAKQmkABw3L452.jpg) |

上述照片已在制作前查看，仅用于造型参考，没有作为贴图或打包至仓库。外站可用性由原网站决定，不依据这些资料提供票价、开放时间或预约承诺。

## 表达边界

建筑按辨识度保留主要轮廓和材质，并非精确测绘。球面位置、河道、比例和朝向经过艺术化重排；古建筑陶塑和雕像是简化模型。灯光用于表现夜景层次，不代表真实场馆当前照明、演出时段或完整灯光节目。

四组现代地标和四组历史文化景点分布于两个半球，避免模型落入主河道。所属灯光、植物、台阶和广场随整个景点增删。系统减少动态效果时，彩光变化与窗灯动画停止。

`npm test` 覆盖完整几何、水面避让、球面落地、模块间距、整组管理、资源释放和夜间底色；`python tools/destination-check.py guangzhou` 使用独立内存服务检查日夜近看、触屏、键盘、窄屏布局、保存恢复和 WebGL 故障重试。手机模拟不等同于物理手机性能验收。

## 实际网页画面

![广州塔夜景](images/guangzhou-canton-night.png)

![陈家祠庭院](images/guangzhou-chen.png)
