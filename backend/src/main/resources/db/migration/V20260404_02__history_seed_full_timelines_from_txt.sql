-- Generated from src/main/resources/history/history.txt by backend/scripts/generate_history_seed_from_txt.py
-- This migration replaces older sample timeline entries for the managed countries with smaller year-split history event cards.

INSERT INTO history_country (country_code, name_zh, name_en, map_slot, marker_lon, marker_lat)
VALUES
  ('RU', '俄罗斯', 'Russia', 'ASIA_NORTH', 105.3188, 61.5240),
  ('JP', '日本', 'Japan', 'ASIA_SOUTH', 138.2529, 36.2048),
  ('DE', '德国', 'Germany', 'EUROPE', 10.4515, 51.1657),
  ('FR', '法国', 'France', 'EUROPE', 2.2137, 46.2276),
  ('GB', '英国', 'United Kingdom', 'EUROPE', -3.4360, 55.3781),
  ('US', '美国', 'United States', 'NA_NORTH', -95.7129, 37.0902)
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh),
  name_en = VALUES(name_en),
  map_slot = VALUES(map_slot),
  marker_lon = VALUES(marker_lon),
  marker_lat = VALUES(marker_lat);

DELETE e
FROM history_event e
JOIN history_country c ON c.id = e.country_id
WHERE c.country_code IN ('RU', 'JP', 'DE', 'FR', 'GB', 'US');

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '彼得一世亲政后，于1697-1698年发起"大使团"西欧考察，回国后开启全面西化改革。军事上，建立正规陆军与波罗的海舰队，打赢大北方战争（1700-1721），夺取"通向欧洲的窗口"。行政上，废除大贵族杜马，设立枢密院（1711），推行"官秩表"（1722），以功绩取代门第决定官僚等级。经济上，兴建冶金与纺织工厂，大量使用农奴劳工。文化上，强迫贵族剃须、穿西服，创办科学院（1724）。', NULL, 1697
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1762年，彼得三世发布《贵族自由宣言》，免除贵族强制服役义务。叶卡捷琳娜二世在位期间（1762-1796），召开立法委员会（1767）试图编纂法典，颁布《贵族宪章》（1785），确认贵族垄断土地、免除体罚、享有自治权利。同时，她发动三次瓜分波兰（1772、1793、1795），将俄国版图向西推进至中欧。', NULL, 1762
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '亚历山大一世即位后，曾成立"密友委员会"酝酿改革，允许自由购买农奴、放宽书刊检查、设立教育部与大学（1802-1804）。拿破仑战争（1812）后，俄国军队进入巴黎，大批军官接触到西欧自由思想，返国后秘密组织"救国协会""幸福协会"等团体，酝酿变革。1825年亚历山大一世猝死，十二月党人利用皇位空悬之际发动起义，被尼古拉一世血腥镇压。', NULL, 1802
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '尼古拉一世（1825-1855）将统治基础确立为"官方民族性"三原则，东正教、专制、民族性。思想界分裂为两大阵营：西方派（以亚历山大·赫尔岑、维萨里昂·别林斯基为代表）主张废除农奴制、走西欧宪政道路；斯拉夫派（以伊万·基列耶夫斯基、康斯坦丁·阿克萨科夫为代表）强调俄国独特的历史使命，认为村社（Obshchina）与东正教蕴含比西方资本主义更优越的社会原则。', NULL, 1825
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '克里米亚战争（1853-1856）成为决定性转折。俄国以黑海舰队为赌注，与英法奥斯曼联军交战，暴露了农奴制军队的全面落后：帆船对蒸汽舰、滑膛枪对线膛枪、人拉辎重对铁路运输。塞瓦斯托波尔围城战（1854-1855）中，俄军英勇但徒劳地牺牲，最终战败。尼古拉一世在战争结束前夕服毒自杀（一说）。', NULL, 1853
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '亚历山大二世即位后，于1861年2月19日签署《废除农奴制宣言》，2300万地主农奴获得法律上的自由。改革方案极其复杂：农民获得人身自由，但土地归地主所有，农民需以"赎买"方式获得份地，政府垫付赎金后，农民需在49年内偿还本息。实际结果是：农民支付了高于市价数倍的价格，赎买后仍因"割地"失去大量优质土地，被迫以"对分制"继续为地主耕作。', NULL, 1861
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '随后推进地方自治改革（1864），在省县两级设立地方自治局（Zemstvo），由贵族、农民、市民三方选举产生，负责教育、医疗、道路等地方事务。同年推行司法改革，引入陪审团、律师制度、公开审判、法官终身制，这是当时欧洲最先进的司法体系之一。军事改革（1874）废除25年兵役制，实行全民义务兵役，缩短服役年限。', NULL, 1864
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '改革释放了社会活力，但也催生了激进运动。车尔尼雪夫斯基的小说《怎么办？》（1863）成为民粹派思想圣经，提出"通过村社直接过渡到社会主义"。青年学生发起"到民间去"运动（1873-1874），穿农民服装下乡宣传革命，但被农民举报逮捕。部分民粹派转向恐怖主义，成立"土地与自由社"后分裂出"民意党"，将刺杀沙皇作为策略。1881年3月1日，民意党炸死亚历山大二世。', NULL, 1863
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '亚历山大三世（1881-1894）推行"反改革"，加强地方行政长官权力、限制地方自治局权限、强化书刊检查。但他的财政大臣维特伯爵（1892-1903掌权）却开启了俄国工业化的狂飙时期。维特推行金本位（1897）、以高关税保护国内市场、大量引进外资（法国为主）、修建西伯利亚大铁路（1891-1916）。十年间，生铁产量翻倍，煤炭产量增长三倍，铁路里程从3万公里增至7万公里。', NULL, 1881
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工业化带来了严重的城市贫困与无产阶级的形成。1905年1月9日，圣彼得堡工人由东正教神父加邦率领，前往冬宫向沙皇请愿（要求八小时工作制、最低工资、立宪会议），遭军警开枪，死伤数千人，史称"流血星期日"。事件引爆了1905年革命，全国爆发总罢工、农民暴动、水兵起义（"波将金号"起义）。尼古拉二世被迫发布《十月宣言》，承诺设立国家杜马（民选议会）、保障公民自由。', NULL, 1905
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '革命平息后，斯托雷平（1906-1911任总理）推行土地改革，允许农民退出村社、获得个人土地产权（"斯托雷平改革"），试图培育富农阶级（"强有力者"）作为农村秩序支柱。改革初见成效，但遭遇村社传统与右翼保守派的双重抵制。1911年斯托雷平遇刺身亡，改革停滞。', NULL, 1906
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '俄国参加一战（1914-1917）导致全面崩溃。前线损失数百万军队，后方粮食供应断裂，彼得格勒出现面包短缺。1917年2月（俄历），彼得格勒工人与士兵起义，尼古拉二世退位，罗曼诺夫王朝覆灭。临时政府（自由派与立宪民主党人主导）继续战争，未能解决土地与和平问题。列宁回国后提出"四月提纲"（全部政权归苏维埃、土地归农民、立即停战）。1917年11月7日（俄历10月25日），布尔什维克通过武装起义夺取政权。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '十月革命后，布尔什维克立即颁布《土地法令》（废除土地私有制）、《和平法令》（呼吁停战）。1918年3月签订《布列斯特和约》，以割让乌克兰、波兰、波罗的海三国为代价退出战争，引发左派社会革命党人抗议退出政府。', NULL, 1918
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1918年夏，国内战争全面爆发。白军（前沙俄军官）、哥萨克、捷克军团、协约国干涉军（英法美日）从四面八方围攻苏维埃政权。布尔什维克宣布"社会主义祖国在危险中"，推行战时共产主义政策：余粮收集制（农民除口粮与种子外全部上交）、全面国有化（大型企业全部收归国有，后扩展至中小企业）、取消自由贸易、实行实物配给、强制劳动义务制。', NULL, 1918
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '托洛茨基组建红军，实行"铁腕纪律"，征召前沙俄军官（以家属为人质），建立政治委员制度，将一支溃散的赤卫队改造为500万人的正规军。三年内战中，白军各派缺乏统一指挥，未能协调进攻，加之"白色恐怖"（对犹太人、工人、农民的暴力）使其失去民心，红军逐一击败邓尼金、高尔察克、尤登尼奇等白军主力。', NULL, 1917
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '但战时共产主义带来了灾难性后果，1920年农业产量仅为战前的一半，工业产量为七分之一，喀琅施塔得海军基地爆发兵变（1921年3月），水兵（曾被视为"十月革命光荣"）要求"取消余粮收集制、恢复贸易自由、苏维埃自由选举"。', NULL, 1920
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1921年3月，俄共（布）十大通过《关于以实物税代替余粮收集制》决议，开启新经济政策（NEP）。核心内容包括：粮食税（农民完税后可自由出售剩余产品）、允许小企业私营（零售业、餐饮业、轻工业）、恢复商品交换与市场、引入外资特许经营、实行货币改革（稳定卢布）。', NULL, 1921
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, 'NEP带来了惊人的经济复苏，到1926年，农业产量恢复至战前水平，工业产量恢复至战前的75%，消费市场活跃，城市出现"耐普曼"（新经济政策时期的私营商人阶层）。文化生活也相对活跃，电影、戏剧、出版迎来"二十年代白银时代"的余晖。', NULL, 1926
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '但NEP引发激烈的党内意识形态争论。左翼反对派（托洛茨基、季诺维也夫、加米涅夫）主张加速工业化、强制积累、压制富农（"库拉克"）；右翼（布哈林、李可夫、托姆斯基）主张"向农民妥协"，通过市场机制、以轻工业带动重工业，保持NEP的延续性。列宁去世后，斯大林在派系斗争中采取"先左后右"的策略：先与布哈林联合击败托洛茨基（1925），再转向左翼激进路线，于1927-1928年将布哈林打成"右倾投降主义"。', NULL, 1925
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1928年10月，第一个五年计划启动，核心目标是"用十年时间走完西方一百年的工业化道路"。1929年，斯大林宣布"消灭富农阶级"，实施农业全盘集体化：农民被强制加入集体农庄（Kolkhoz），富农被没收财产后驱逐至西伯利亚。集体化遭遇激烈抵抗，1929-1933年间爆发大规模饥荒（尤以乌克兰"大饥荒"为甚），死亡人数估计在300-800万之间。但国家通过集体化控制了粮食，得以支撑出口换汇与城市工人供应。', NULL, 1928
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工业化以重工业（钢铁、机械、电力）为核心，通过行政指令配置资源，不计成本地追求产量目标。第聂伯河水电站（1932）、乌拉尔重型机械厂（1933）、马格尼托哥尔斯克钢铁厂（1932）等巨型项目在五年内建成。1937年，苏联工业产值跃居欧洲第一、世界第二。但代价是：消费品严重短缺，城市住房极端拥挤，劳动纪律军事化（1938年实行"劳动手册"制度，旷工可被判刑）。', NULL, 1932
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '政治体制全面极权化。1934年基洛夫遇刺后，斯大林发动大清洗（1936-1938）：超过130万人被捕，约70万人被处决，包括大部分红军将领、旧布尔什维克党人、科学家、工程师。古拉格集中营系统容纳数百万"人民敌人"从事强制劳动。1936年颁布"斯大林宪法"，宣布"阶级消灭、社会主义建成"，但实质上是将绝对权力法律化。', NULL, 1934
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1941年6月22日，纳粹德国发动"巴巴罗萨行动"，苏德战争爆发。苏联在战争初期损失惨重：1941年全年损失300万兵力、大片工业区沦陷。但苏联在极短时间内将1500多家大型工厂从西部搬迁至乌拉尔、西伯利亚，恢复军工生产。斯大林格勒战役（1942-1943）成为战争转折点，苏军歼灭德军第六集团军。1943年库尔斯克战役后，红军掌握战略主动权，1945年5月攻克柏林。', NULL, 1941
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '战争动员了全社会，2700万苏联军民丧生（占全国人口14%），1700座城镇被摧毁。但战争也强化了斯大林模式的合法性——它证明了这个体制在最极端条件下的生存能力。战后，斯大林将"战争胜利"归功于社会主义制度与个人领导，进一步巩固了个人崇拜。', NULL, 1941
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '冷战开启后，苏联凭借占领东欧的优势，建立起"东方阵营"。1949年成功试验原子弹，打破美国核垄断；1953年斯大林去世时，氢弹已进入最后研发阶段。苏联成为仅次于美国的超级大国，但其经济结构在战后并未转型：军费占GDP比重高达20%以上，重工业优先原则延续，农业与消费品工业持续落后。', NULL, 1949
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '斯大林去世后，经过贝利亚被捕处决（1953）、马林科夫与赫鲁晓夫的权力斗争，赫鲁晓夫逐步确立领导地位。1956年2月，苏共二十大闭幕前夕，赫鲁晓夫作了"秘密报告"《关于个人崇拜及其后果》，系统批判斯大林在大清洗中的罪行、对战争的错误判断、个人崇拜。这一报告在苏联国内外引发地震，东欧出现波兹南事件（1956）与匈牙利事件（1956），赫鲁晓夫出动坦克镇压匈牙利革命。', NULL, 1953
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济上，赫鲁晓夫试图"修补"斯大林模式。农业改革是重点：1954年启动"开垦处女地"计划（主要在哈萨克），1958年取消机器拖拉机站，将农业机械卖给集体农庄。但改革治标不治本，农业始终是短板。工业上推行"国民经济委员会"改革，将部门管理改为地区管理，导致指挥链混乱。住房建设方面推动"赫鲁晓夫楼"（预制板五层公寓），缓解了城市住房危机。', NULL, 1954
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '对外政策提出"和平共处、和平竞赛、和平过渡"三原则，1962年古巴导弹危机达到顶峰，赫鲁晓夫在冲突中退让，导致其威望严重受损。1964年10月，勃列日涅夫联合苏斯洛夫、谢列平等人发动政变，以"主动退休"名义解除赫鲁晓夫职务。', NULL, 1962
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '勃列日涅夫上台后，政治上推行"干部稳定化"——取消赫鲁晓夫的干部轮换制，各级领导干部终身任职，形成"老人政治"。意识形态上回归保守，1968年入侵捷克斯洛伐克，确立"有限主权论"（苏联有权干预社会主义阵营任何国家的内政）。', NULL, 1968
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济上，1965年推行"柯西金改革"，试图在企业层面引入利润指标、扩大自主权，但因官僚体系抵制，改革在1970年代初期基本夭折。苏联依靠西伯利亚石油开发与1973年石油危机带来的油价暴涨（从每桶3美元涨至30美元以上），获得大量"石油美元"。这些外汇用于从西方进口粮食（弥补农业短缺）与消费品（维持表面繁荣），但并未投入经济结构转型。', NULL, 1965
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1970年代是苏联的"黄金期"与"停滞期"并存，一方面，民众生活水平稳步提升（住房、养老金、免费医疗、教育）；另一方面，经济增速逐年下降（1960年代年均5%，1970年代降至3%，1980年代初接近零），科技革命滞后，军费开支持续膨胀（占GDP的15-20%）。1979年入侵阿富汗，陷入十年泥潭。', NULL, 1970
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1982年勃列日涅夫去世后，安德罗波夫与契尔年科在短时间内相继去世，苏共领导层陷入瘫痪。', NULL, 1982
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '戈尔巴乔夫1985年上台时年仅54岁，是战后最年轻的苏联领导人。他最初推行"加速战略"（Uskoreniye），试图通过技术升级与纪律整顿（反酗酒运动）振兴经济，但收效甚微。1986年切尔诺贝利核事故暴露了体制的官僚主义与封闭性，促使他转向更激进的改革。', NULL, 1985
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '公开性（Glasnost）允许对历史问题（斯大林时期、勃列日涅夫时期）进行批判，媒体开始报道过去属于禁忌的话题。1987年，戈尔巴乔夫出版《改革与新思维》，提出"民主化"与"多元化的社会主义"。1988年苏共第十九次代表会议决定成立"人民代表大会"，实行有限竞争选举。', NULL, 1987
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '新思维外交包括，从阿富汗撤军（1988-1989）、放弃对东欧盟国的军事干预（"辛纳屈主义"，即"各走各的路"）、与里根达成中导条约（1987）、结束冷战对峙。这一系列政策赢得了西方赞誉，但也动摇了苏联的东欧缓冲区。', NULL, 1988
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济改革混乱无序。1987年《国有企业法》试图下放企业自主权，但未建立市场机制，形成"既非计划、也非市场"的真空。1989年，消费品严重短缺，配给制恢复。1990年，沙塔林与亚夫林斯基提出"500天计划"（激进市场化改革），戈尔巴乔夫犹豫后转向保守派，错失窗口。', NULL, 1987
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '政治失控。1990年3月，波罗的海三国率先宣布独立。1991年6月，叶利钦以高票当选俄罗斯联邦总统，成为戈尔巴乔夫的实际对手。1991年8月，保守派发动"八一九政变"试图挽救苏联，政变三天后失败，叶利钦借机掌控实权。1991年12月，俄罗斯、乌克兰、白俄罗斯签署《别洛韦日协议》，宣布苏联停止存在。12月25日，戈尔巴乔夫宣布辞职。', NULL, 1990
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '叶利钦执政后，任命35岁的经济学家叶戈尔·盖达尔为代总理，推行休克疗法（1992年1月2日启动）。核心内容包括：一次性放开价格（物价瞬间上涨300%）、实施紧缩货币政策、大规模私有化。私有化通过"私有化券"（每人领取面值1万卢布的凭证）形式推进，但因通胀恶性（1992年通胀率达2500%），多数民众的凭证被"私有化基金"低价收购，大量国有资产落入少数人手中，形成寡头阶级。', NULL, 1992
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济崩溃。1992-1998年，GDP下降超过40%，工业产量腰斩，农业产量下降三分之一。失业率飙升，死亡率骤增（1990年代初人均寿命下降近5岁）。国家基本放弃社会职能，养老、医疗、教育体系濒临崩溃。', NULL, 1992
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '政治危机。1993年，叶利钦与最高苏维埃（议会）爆发尖锐冲突，10月叶利钦下令坦克炮轰议会大厦（"白宫"），镇压持续两周，造成数百人死亡。随后通过新宪法，确立超级总统制：总统有权解散议会、任命总理、颁布法令，议会权力被严重削弱。', NULL, 1993
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1994年发动第一次车臣战争，俄军屡战屡败，伤亡惨重，1996年被迫停火（实际上车臣获得事实独立）。1996年大选，叶利钦依靠寡头（别列佐夫斯基、古辛斯基、霍多尔科夫斯基等）的媒体与资金支持击败俄共候选人久加诺夫连任。1998年金融危机爆发，卢布贬值三分之二，国家债务违约（"8·17违约"），银行系统瘫痪。1999年8月，叶利钦任命弗拉基米尔·普京为总理，12月31日突然辞职，将权力移交给普京。', NULL, 1994
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '普京上台后提出"政权三支柱"，强有力的国家、有效的市场经济、统一的法律体系。政治上建立垂直权力体系：设立七个联邦区（2000）、总统直接任命地方行政长官（2004取消地方行政长官直选）、整顿寡头。', NULL, 2000
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2003年，普京逮捕尤科斯石油公司总裁霍多尔科夫斯基，罪名包括欺诈、逃税。尤科斯被拆分，核心资产收归国有（归属俄罗斯石油公司）。这一事件标志着"权力再分配"——国家明确宣告：政治权力高于经济权力，寡头必须"臣服"而非与政府平起平坐。', NULL, 2003
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济上，受益于2000年代油价暴涨（从每桶20美元升至2008年的140美元），俄罗斯经济年均增长7%。国家建立稳定基金（2004，后拆分为储备基金与福利基金），将石油美元存入海外账户，应对未来风险。税制改革实行13%统一税率的个人所得税，简化税收体系。农业、零售业、服务业恢复增长，中产阶级初步形成。', NULL, 2000
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '对外关系上，普京初期采取"与西方合作"姿态（支持美国反恐战争），后因北约东扩、美国退出反导条约、格鲁吉亚"玫瑰革命"（2003）、乌克兰"橙色革命"（2004）而转向强硬。2007年慕尼黑安全会议上，普京发表"慕尼黑演讲"，公开批评美国单极霸权。', NULL, 2003
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2008年，普京卸任总统，由梅德韦杰夫接任，普京担任总理。"梅普组合"期间，梅德韦杰夫提出"现代化"口号，强调科技创新、法治建设、反腐败。2008年8月，俄格战争爆发，俄军五天内击败格鲁吉亚军队，实际控制南奥塞梯与阿布哈兹。', NULL, 2008
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '全球金融危机对俄国经济造成重创，2009年GDP下降7.8%，石油价格一度跌至40美元以下。但凭借储备基金（至2008年累积至2200亿美元），俄国未出现1998年式崩溃。危机后，经济复苏乏力，年均增速降至2%左右。', NULL, 2009
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2011-2012年，普京宣布参加总统选举，引发大规模抗议（"博洛特纳亚广场抗议"），民众要求"没有普京的俄罗斯"。普京连任后，政治转向保守：立法限制非政府组织、加大互联网管控、恢复"爱国教育"。2012年"朋克祈祷"事件（Pussy Riot乐队被捕）标志着对公民社会的压制加剧。', NULL, 2011
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2014年乌克兰危机爆发，基辅独立广场抗议推翻亲俄总统亚努科维奇。普京迅速推动克里米亚"公投入俄"（3月），随后支持乌克兰东部顿巴斯地区武装分离。西方实施制裁（金融、能源、军工、个人），石油价格再次暴跌，卢布贬值超过50%，经济陷入衰退。', NULL, 2014
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022年2月，俄罗斯对乌克兰发动"特别军事行动"，乌克兰危机全面升级。西方实施史上最严厉制裁：冻结俄罗斯央行约3000亿美元外汇储备、将主要银行踢出SWIFT系统、限制能源与技术出口、逾千家企业撤出俄罗斯。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '俄国经济转向"战时堡垒化"模式。央行行长纳比乌林娜实施资本管制、强制结汇、大幅加息至20%，稳定了金融体系。财政政策转向大规模扩张：国防预算占GDP比重从2021年的2.7%升至2023年的6%以上，军工订单刺激工业生产（2023年工业增长3.5%）。经济呈现"分裂"特征：军工与相关产业繁荣，民用消费与投资萎缩；劳动力短缺（动员、移民流出、低生育率）加剧通胀压力。', NULL, 2021
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '对外经贸重构，欧洲能源市场关闭后，转向中国、印度、土耳其。2023年，中俄贸易额达2400亿美元（占俄外贸总额30%以上），但俄国沦为"原材料附庸"的趋势加剧（能源、矿产出口换机械、电子产品）。', NULL, 2023
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '政治体制进一步固化。2020年宪法修正案通过，允许普京在2024年再次参选（并连任至2036年），强调"传统家庭价值观"、禁止"LGBT宣传"。反对派领袖纳瓦利内2024年在狱中去世，人权状况持续恶化。', NULL, 2020
FROM history_country c
WHERE c.country_code = 'RU';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1853年，美国海军准将佩里率领四艘"黑船"驶入江户湾，炮口对准幕府心脏。这一事件不仅撕裂了日本二百余年的锁国体制，更在精神层面引发了前所未有的存在危机。面对西方列强的坚船利炮，幕府内部迅速分裂为"开国派"与"攘夷派"，而基层的武士阶层则在"尊王攘夷"的旗帜下，开始质疑幕府统治的合法性。', NULL, 1853
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1853-1854年，黑船来航与《神奈川条约》，佩里以炮舰外交迫使德川幕府开国。美国的要求很简单：补给煤水、保护遇难船员。但这扇门一旦打开，英国、俄国、荷兰紧随其后，一系列"不平等条约"让日本陷入了半殖民地的边缘。', NULL, 1853
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1860年，樱田门外之变，水户藩激进浪士在江户城樱田门外刺杀幕府大老井伊直弼。此事件象征着幕府权威的彻底崩塌，此后"尊王攘夷"运动从口号演变为武装暴动。', NULL, 1860
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1867-1868年，大政奉还与戊辰战争，末代将军德川庆喜在萨摩、长州两藩的军事压力下，"奉还"政权于天皇。但幕府势力不甘失败，双方爆发内战（戊辰战争）。1869年，明治天皇迁都江户（改名东京），新政府正式成立。', NULL, 1867
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '新政权建立后，面临的首要任务是"富国强兵"——这四个字在当时的语境下，意味着必须迅速拥有能够抵御西方的工业能力和军事力量。明治政府选择了一条极其特殊的道路：国家充当"企业家"，直接创办工厂、矿山、交通设施，然后再将其转交给民间。', NULL, 1870
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1871年，废藩置县，新政府将全国260余个藩改设为中央直辖府县，彻底瓦解封建割据，为统一征税、征兵与立法奠定制度基础。', NULL, 1871
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1873年，地税改革，新政府发布《地税改革条例》，废除封建土地所有制，承认土地私有，并以货币地税取代实物年贡。这一改革确立了国家稳定的财政来源（地税占政府收入一度达80%），同时造就了一大批自耕农，但也为后来的农村凋敝埋下隐患。', NULL, 1873
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '殖产兴业政策，政府设立工部省（1870）和内务省（1873），直接兴办官营工厂。其中最著名的是富冈制丝厂（1872）、佐渡金山、以及一系列军工企业（横须贺造船厂、大阪炮兵工厂）。这些企业不仅是技术引进的试验场，更是培育产业工人的"母体"。', NULL, 1870
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1877年，西南战争，西乡隆盛领导鹿儿岛士族发动日本最后一场内战，最终被政府军镇压。此战标志着武士阶级彻底退出历史舞台，也耗尽了政府财政，迫使政府将经营重心从"镇压"转向"产业"。', NULL, 1877
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '进入1880年代，明治政府面临两大难题，一是官营企业亏损累累，二是通货膨胀严重（因纸币滥发）。此时，接替大久保利通的"理财圣手"松方正义登场，他的一系列政策不仅解决了财政危机，更深刻重塑了日本的资本主义形态。', NULL, 1880
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1881年，松方通货紧缩，松方正义就任大藏卿（财政部长），推行"超紧缩"政策。他通过停止发行纸币、设立"纸币兑换准备金"、增加税收、削减支出，强行将纸币回收。这一政策虽然抑制了通胀，但也引发了严重的通缩萧条，大量中小商人破产。', NULL, 1881
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '官营企业"払下"（低价出售），在松方的主导下，政府将除军工、通信外的绝大部分官营工厂，以极低价格出售给与政府关系密切的商人。例如，三井财阀接收了三池煤矿、三菱财阀接收了长崎造船所。这一过程被称为"政商资本"的形成——财阀的崛起不是通过市场竞争，而是通过国家扶植。', NULL, 1880
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1889年，大日本帝国宪法颁布，这是一部以普鲁士宪法为蓝本的钦定宪法。它确立了天皇的绝对主权（"大权"），但同时设立了议会（众议院由民选产生，贵族院由皇族和华族组成）。这部宪法的核心逻辑是"国家高于议会"，天皇统而不治，实权掌握在"元老"和官僚手中。', NULL, 1889
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1890年，第一次国会召开，虽然国会设立，但权力极为有限。议会的预算审议权受"预算先议权"的限制（如果议会否决预算，政府可以按上一年度执行）。此后，议会中的"民党"（自由党、改进党等）与政府展开了长达十余年的对抗。', NULL, 1890
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '20世纪初，日本完成了从"资本原始积累"向"重工业革命"的跨越。推动这一跨越的核心动力，是战争。1894-1895年的甲午战争让日本获得了台湾和巨额赔款，而1904-1905年的日俄战争，则让日本真正跻身列强行列。', NULL, 1894
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1904-1905年，日俄战争，日本与俄国在中国东北和朝鲜半岛的争夺最终爆发战争。日本以惨胜告终（战死8.8万人），但通过《朴茨茅斯和约》获得了南满铁路、库页岛南部以及朝鲜半岛的"保护权"。这场战争的意义在于：它是非西方国家第一次战胜欧洲列强，极大提振了日本民族的自信心。', NULL, 1904
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '足尾铜山矿毒事件，足尾铜山是日本最大的铜矿，但矿山排出的废水和废渣严重污染了渡良濑川流域，导致农田荒芜、村民病亡。此事引发了日本最早的"公害抗议运动"，政治家田中正造三度向天皇直接上书，要求停止矿山作业。虽然最终未能成功，但它标志着"增长优先"模式开始遭到社会质疑。', NULL, 1900
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1900年，《治安警察法》颁布，随着工人运动（工会）和社会主义思潮的兴起，政府出台《治安警察法》，禁止工人结社和罢工。此后又颁布《新闻纸法》，加强舆论管控。', NULL, 1900
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1910年，"大逆事件"，政府以"暗杀天皇"的莫须有罪名，逮捕了幸德秋水等26名社会主义者，并处以12人死刑。这是日本近代史上最大规模的政治镇压，此后社会主义运动转入地下。', NULL, 1910
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第一次世界大战为日本带来了前所未有的繁荣，同时也催生了短暂的"大正民主"时期。这是一段看似自由、实则暗流涌动的岁月。', NULL, 1910
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1914-1918年，一战景气，欧洲列强忙于战争，无暇顾及亚洲市场。日本的出口额激增，从1913年的6.3亿日元增长到1918年的18.5亿日元。工业结构也从轻工业（纺织）向重工业（造船、钢铁、化学）升级。更重要的是，日本从"债务国"变成了"债权国"——第一次拥有了资本输出能力。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1918年，米骚动，由于物价飞涨（尤其是大米价格暴涨），富山县渔民妻子率先发起抗议，迅速蔓延至全国。这场规模空前的"民变"迫使寺内正毅内阁下台，原敬（日本第一位平民出身的总理）组阁。原敬推行"立宪政治"，扩大了议会的权力，被称为"大正民主的顶点"。', NULL, 1918
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1923年，关东大地震，东京、横滨地区发生7.9级大地震，死亡人数超过10万。地震不仅造成了巨大的经济破坏，还引发了"虐杀朝鲜人"的惨剧（谣言称朝鲜人纵火投毒，导致数千人被私刑处死），暴露出日本社会中根深蒂固的排外心理和治安失控的危险。', NULL, 1923
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1925年，普通选举法颁布，经过多年的"普选运动"，政府最终颁布普通选举法，废除了财产限制，实现了25岁以上男子的普选（当时约有1200万人获得选举权）。但同一年，政府也颁布了《治安维持法》，将"改变国体"或"否定私有财产"的行为列为犯罪——这是"胡萝卜加大棒"的典型组合。', NULL, 1925
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1929年，美国华尔街崩盘，全球大萧条迅速传导至日本。这场危机彻底摧毁了脆弱的政党政治，将日本推向了军国主义的深渊。', NULL, 1929
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1927年，昭和金融危机，在大萧条之前，日本已经经历了一场严重的金融危机。多家银行因不良债权破产，政府被迫实行"银行停业令"。这场危机暴露了金融体系的脆弱性，也为后来军部"整顿金融"提供了理由。', NULL, 1927
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1930年，金解禁与恐慌加剧，滨口雄幸内阁试图通过解除黄金出口禁令（金本位复归）来稳定日元，但恰逢大萧条冲击，导致出口崩溃、失业率飙升。滨口首相在东京站被右翼青年刺杀（1930），政治暴力常态化。', NULL, 1930
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1931年，满洲事变（九一八事变），关东军参谋石原莞尔等人擅自发动满洲事变，占领中国东北。这一事件标志着"军部"彻底摆脱了内阁的控制，开始独立决定外交和军事政策。此后，政府试图"不扩大事态"的努力全部失败，军部通过"统帅权独立"绑架了国家。', NULL, 1931
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1932年，五一五事件，海军青年军官刺杀首相犬养毅。此事件后，政党政治彻底终结，此后历任首相均由军人或官僚担任。', NULL, 1932
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1936年，二二六事件，陆军"皇道派"青年军官发动政变，刺杀多名内阁大臣，占领东京市中心数日。虽然政变最终被镇压，但军部借此清洗了反对派，确立了"军部主导"的政治体制。', NULL, 1936
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1937年至1945年，日本经历了人类历史上最极端的国家动员。所有资源、人力、舆论都被纳入战争机器，自由市场彻底消失。', NULL, 1937
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1938年，国家总动员法，这部法律赋予了政府无限权力——可以强制征用土地、工厂、劳动力，可以控制物价、分配物资、管制言论。这是日本历史上第一部"经济宪法"，标志着"国家主导"模式达到了极致。', NULL, 1938
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1940年，大政翼赞会成立，政府解散所有政党，建立"大政翼赞会"作为唯一的政治组织，试图建立"一国一党"的体制。这一组织未能真正整合社会，反而加剧了官僚与军部的内斗。', NULL, 1940
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1941年，太平洋战争爆发，日本偷袭珍珠港，对美国宣战。这一决策是基于"南方资源"的战略需求，但完全低估了美国的工业能力。此后，日本进入了"自给自足"的封闭经济——石油、橡胶、铁矿石全部依赖占领区。', NULL, 1941
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1944年，马里亚纳海战与本土空袭，战局急转直下。美军B-29轰炸机开始对日本本土进行大规模空袭，东京、大阪、名古屋等城市被炸成废墟。1945年3月10日，东京大空袭一夜烧死10万人。', NULL, 1944
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945年8月，战败，广岛、长崎原子弹爆炸，苏联对日宣战。8月15日，裕仁天皇通过"玉音放送"宣布无条件投降。', NULL, 1945
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945年至1952年，美国占领当局（GHQ）对日本进行了彻底的"非军事化"与"民主化"改造。这一改造虽然是外来的，但其深刻程度远超明治维新。', NULL, 1945
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945-1947年，GHQ改革三件套，财阀解体，GHQ命令将三井、三菱、住友、安田等15大财阀的控股公司强制解散，并将子公司股票分散给公众。虽然这一改革因冷战爆发而中途终止（部分财阀后来重组），但它彻底摧毁了战前的"政商结合"模式，农地改革，GHQ强制收购地主手中的土地，低价出售给佃农。这一改革使自耕农比例从战前的30%飙升至90%，彻底改变了农村的社会结构——农民从"受压迫阶级"变成了"小资产阶级"，成为战后保守政权的社会基础。', NULL, 1945
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '劳动改革，颁布《劳动组合法》（1945）、《劳动关系调整法》（1946），承认工人有组织工会、集体谈判和罢工的权利。工会会员人数从战前的不足10万暴增至1949年的660万，形成了强大的"劳方力量"。', NULL, 1945
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1946年，和平宪法颁布，在GHQ的起草下，日本颁布了新的宪法。其核心是"主权在民"（取代"天皇主权"）、放弃战争（第九条）、保障基本人权。这部宪法彻底改变了日本的政治逻辑——从此，政治合法性不再来自"天皇大权"，而是来自"国民授权"。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1947年，战后第一次大选，社会党成为第一大党，片山哲组成联合内阁。虽然社会党执政时间不长，但"55年体制"的雏形已经显现。', NULL, 1947
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1950年，朝鲜战争爆发，朝鲜战争对日本的意义堪比"明治维新第二弹"。美军将日本作为"后勤基地"，大量"特需"订单涌入日本，直接拉动了战后经济的起飞。同时，战争也促使美国改变了对日政策——从"惩罚"转向"扶持"。', NULL, 1950
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '从朝鲜战争特需到1960年代，日本实现了经济高速增长。这一时期的核心特征是"国家主导型市场经济"——通商产业省（MITI）通过"行政指导"、产业政策、金融护航，引导民间资本向重化工业集中。', NULL, 1960
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1955年，保守合同与55年体制确立，自由党与民主党合并为自由民主党（自民党），形成了"保守派一党独大、革新派在野"的稳定格局。此后38年，自民党一直执政（除1993年短暂下野）。', NULL, 1955
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1955-1973年，高速增长期，年均GDP增长率超过10%。核心产业是钢铁、造船、化学、汽车、电子。政府通过"产业政策"引导资源向这些行业集中——例如，政府控制外汇配额，只允许企业进口"战略性"技术；政府通过"日本开发银行"提供长期低息贷款。', NULL, 1955
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1960年，国民收入倍增计划，池田勇人内阁提出"十年内国民收入翻倍"的计划。这一计划标志着政府从"产业优先"转向"消费优先"——通过增加公共投资、减税、提高工资，扩大内需。', NULL, 1960
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1960年，安保斗争，岸信介内阁强行通过《日美安保条约》修订案，引发了战后最大的社会运动。数百万学生、工人、知识分子走上街头，包围国会。最终岸信介下台，但安保条约通过。此后，自民党吸取教训，转向"低政治、高经济"的路线。', NULL, 1960
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '这一阶段延续了上一阶段的高速增长，但环境污染与社会代价集中爆发，成为日本发展模式中的关键转折点。', NULL, 1960
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '四大公害诉讼，1960年代，四大公害诉讼（水俣病、新泻水俣病、痛痛病、四日市哮喘）相继进入诉讼阶段。受害者控告企业（窒素、三井金属等）和政府（未及时制止污染）。1970年代初，法院相继判决受害者胜诉，确认了"环境权"的概念。', NULL, 1960
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1968年，公害对策基本法，在舆论压力下，政府出台《公害对策基本法》，明确了"污染者负担"原则。1971年，政府设立环境厅（后升格为环境省）。', NULL, 1968
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1973年石油危机是日本经济的分水岭。高增长时代结束，滞胀来袭。但日本通过"官民协调"下的"减量经营"，成功实现了产业升级。', NULL, 1973
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1973年，石油危机与"日本列岛改造论"破产，田中角荣内阁提出"日本列岛改造论"，计划通过大规模基建来拉动增长。但石油危机导致通胀失控，土地投机崩盘，改造论破产。', NULL, 1973
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1974年，战后首次负增长，1974年GDP实际增长率-1.2%，通胀率超过20%。政府被迫放弃高速增长目标，转向"稳定增长"。', NULL, 1974
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '减量经营，在通产省的"行政指导"下，企业开始"减量经营"——压缩过剩产能（如铝、石化）、裁员、节能降耗。同时，政府引导企业向"知识密集型产业"（半导体、汽车、电子）转型。', NULL, 1970
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1978年，第二次石油危机，伊朗革命引发第二次石油危机，但此时日本已大幅降低了对石油的依赖（石油占比从1973年的77%降至1978年的71%），应对能力明显增强。', NULL, 1978
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1980年代是日本经济的"黄金时代"，也是"泡沫时代"。在日美贸易摩擦的压力下，日本被迫进行"金融自由化"，叠加过度宽松的货币政策，最终酿成了史上最大的资产泡沫。', NULL, 1980
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1985年，广场协议，美国、日本、西德、法国、英国在纽约广场饭店签署协议，联合干预外汇市场，促使美元贬值。日元从1美元=240日元飙升至1987年的1美元=120日元，出口竞争力大幅受损。', NULL, 1985
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1986-1987年，极度宽松货币政策，为应对日元升值带来的衰退风险，日本央行连续降息（基准利率从5%降至2.5%），并维持了两年多的超低利率。大量资金涌入股市和房地产市场。', NULL, 1986
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1987年，前川报告，政府发布《前川报告》，提出"内需主导型增长"战略，建议扩大公共投资、减税、放松管制。但实际效果是，放松管制进一步刺激了金融投机。', NULL, 1987
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '泡沫经济（1986-1991），地价和股价飙升。1989年底，日经225指数达到38915点的历史高点（至今未破）；东京23区的地价总值一度超过美国全境。企业、个人、银行全部卷入投机狂潮。', NULL, 1986
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1989年，日本第一，这一年，日本企业在国际市场上疯狂并购——三菱地产收购纽约洛克菲勒中心、索尼收购哥伦比亚电影公司。日本人自信"日本第一"，但泡沫的破裂已在眼前。', NULL, 1989
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '泡沫破裂后，日本陷入了长达十年的"资产负债表衰退"。企业、银行、家庭都在"去杠杆"，导致经济长期停滞。', NULL, 1990
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1991-1995年，不良债权问题爆发，泡沫破裂后，银行积累了巨额不良债权（最高峰时估计达100万亿日元）。但政府和银行采取"拖延"策略——通过"账面处理"掩盖不良，拒绝处置僵尸企业。', NULL, 1991
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1997年，山一证券破产，1997年，亚洲金融危机冲击日本，山一证券（四大证券公司之一）宣布"自主废业"，北海道拓殖银行破产。这一事件标志着"护送船团"式监管模式的崩溃——政府终于承认，银行"大而不倒"的时代结束了。', NULL, 1997
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1996-1998年，桥本龙太郎"六大改革"，桥本内阁推行行政改革、财政改革、金融改革、社会保障改革、教育改革、经济结构改革。其中最重要的是"金融大爆炸"——废除银行、证券、保险的业务壁垒，引入市场竞争。但改革与亚洲金融危机叠加，导致经济进一步恶化。', NULL, 1996
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1998年，金融再生法案，政府终于下定决心处置不良债权，投入60万亿日元公共资金对银行进行注资（实质国有化）。此后，金融体系逐渐稳定。', NULL, 1998
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年，小泉纯一郎以"无圣域的结构改革"为口号上台，明确否定战后"55年体制"的财政动员模式，试图通过缩小政府边界来激活经济。', NULL, 2001
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年，小泉上台与"无圣域改革"，小泉提出"改革没有禁区"——邮政民营化、削减公共投资、废除特殊法人、放宽劳务派遣法。其核心逻辑是"小政府、大市场"。', NULL, 2001
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2005年，邮政民营化，小泉将"邮政民营化"视为改革的象征。在自民党内部反对的情况下，小泉解散众议院，以"邮政选举"赌上政治生命，最终获胜。邮政民营化法案通过，日本邮政被拆分出售。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2003-2004年，派遣法修订，政府修订《劳动者派遣法》，大幅放宽对"派遣劳动"的限制。企业可以用更低成本雇佣非正式员工（而非终身雇佣的正式员工）。这一改革虽然增加了企业灵活性，但也导致"非正式雇佣"从1990年代初的10%飙升至2010年的35%，贫富差距急剧拉大。', NULL, 2003
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '不良债权最终处理，小泉政府动用"金融再生"机制，对主要银行进行强力注资，最终在2005年左右基本解决了泡沫时期遗留的不良债权问题。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2008年全球金融危机重创日本经济，同时自民党因应对不力而在2009年大选中惨败，民主党首次上台执政。但民主党政权在应对危机、处理外交、应对灾害方面表现不佳，迅速垮台。', NULL, 2008
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2008年，雷曼危机，美国雷曼兄弟破产引发全球金融海啸。日本经济（高度依赖出口）遭受重创，2009年GDP萎缩5.2%。', NULL, 2008
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2009年，民主党政权更迭，民主党在众议院选举中取得压倒性胜利（获得308席，自民党仅119席），实现了战后首次"政党轮替"。民主党提出"友爱社会"口号，主张"生活优先"——增加儿童补贴、免收高速公路费、废除汽油税暂定税率、重新审查日美安保条约。', NULL, 2009
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2011年，东日本大地震与福岛核灾，3月11日，日本东北地区发生9.0级大地震，引发海啸和福岛第一核电站核泄漏事故。这是日本战后最严重的自然灾害。民主党政府在救灾、核事故处理、信息发布等方面表现不佳，支持率暴跌。', NULL, 2011
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2012年，消费税增税，民主党首相野田佳彦强行通过"消费税增税法案"（从5%分两阶段提至10%），以此作为换取公明党支持的条件。这一决定导致民主党分裂，最终在2012年大选中惨败（仅剩57席）。', NULL, 2012
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '安倍第二次执政（2012-2020）长达8年，是日本战后执政时间最长的首相。他推出的"安倍经济学"在金融、财政、结构改革三个维度同时发力，试图用"强政府"的手段来推进"新自由主义"的目标。', NULL, 2012
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2013年，"异次元"金融宽松，安倍任命黑田东彦为日本央行行长，推出"量化质化宽松"（QQE），将央行资产负债表规模从GDP的30%扩张至100%以上，试图通过"通胀目标2%"来打破通缩预期。', NULL, 2013
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2014年，企业治理改革，政府推出"日本版公司治理准则"，要求上市公司引入独立董事、提高ROE、重视股东回报。这一改革成功提升了企业利润率，但也加剧了企业内部的"工资压制"。', NULL, 2014
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2014年、2019年，消费税两次上调，安倍在2014年将消费税从5%提至8%，2019年再提至10%。每次增税都导致消费萎缩，经济陷入短暂衰退。', NULL, 2014
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2015年，新安保法案，安倍强行通过"和平安全法制整备法案"（即"新安保法案"），允许日本行使"集体自卫权"——即盟友受到攻击时，日本可以出兵。这是对和平宪法第九条的重大突破。', NULL, 2015
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2019年，日美贸易协定，安倍与特朗普签署《日美贸易协定》，进一步开放日本农产品市场（牛肉、猪肉、小麦），换取美国不对日本汽车加征关税。', NULL, 2019
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2020年以来，新冠疫情、俄乌战争、全球通胀三重冲击叠加，安倍时代通过金融宽松掩盖的结构性问题（贫富分化、地区衰退、少子化）彻底暴露。日本正处于"新自由主义范式"的清算期，但新的范式尚未形成。', NULL, 2020
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2020-2021年，新冠疫情与大规模财政刺激，菅义伟内阁（2020-2021）推出总额超过100万亿日元（占GDP约20%）的疫情应对措施，包括向企业发放补贴、向民众发放现金（每人10万日元）、支持旅游业（Go To Travel）。这是战后最大规模的财政扩张。', NULL, 2020
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2021年，岸田文雄"新资本主义"，岸田文雄接替菅义伟出任首相，提出"新资本主义"理念，明确表示要修正新自由主义的副作用——强调"增长与分配的良性循环"，提出"令和版收入倍增计划"，主张对"人"进行投资（教育、医疗、育儿），而非仅对"物"投资。', NULL, 2021
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022年，俄乌战争与输入性通胀，俄乌战争导致能源和食品价格暴涨，日本（高度依赖进口）遭受严重冲击。2022年，日本消费者物价指数（CPI）涨幅一度超过4%，是1991年以来最高水平。长期通缩的日本首次面临"通胀压力"，但通胀主要来自"成本推动"，而非"需求拉动"。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022-2023年，日圆历史性贬值，美联储大幅加息（基准利率从0%升至5%），日本央行坚持负利率（-0.1%），导致日圆对美元汇率从110跌至150（2022年10月），创32年新低。进口成本飙升，贸易逆差创历史新高。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2024年，日本央行结束负利率，2024年3月，日本央行宣布结束负利率政策，将基准利率上调至0%-0.1%区间。这是日本2007年以来首次加息，标志着"异次元金融宽松"时代的终结。', NULL, 2024
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '当前日本正处于"新自由主义范式"的清算期，但新的范式尚未成型。岸田的"新资本主义"试图在"增长"与"分配"、"国家"与"市场"之间找到第三条道路，但其政策效果尚不明朗。可以确定的是，安倍时代"金融宽松"驱动的增长模式已走到尽头，日本必须寻找一种更可持续的增长模式——可能是"地方创生"式的内需驱动，也可能是"数字转型"式的产业升级，抑或是"移民开放"式的人口重构。', NULL, 2020
FROM history_country c
WHERE c.country_code = 'JP';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '普鲁士的关税改革（1818），普鲁士财政部长汉斯·冯·比洛率先废除了所有内部关税，实行统一的低关税（约10%），建立了覆盖普鲁士本土的关税区。这被视为德国"秩序政策"的雏形——用统一的法律框架取代特权与混乱。', NULL, 1818
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '关税同盟（1834），由普鲁士主导，联合巴伐利亚、符腾堡等18个邦国正式建立"德意志关税同盟"。这是人类历史上第一个跨国自由贸易区，内部取消关税，对外实行统一关税。它的意义远超经济：第一次在政治上将德意志各邦国联合在一个共同制度之下，被海涅称为"德意志统一的先声"。', NULL, 1834
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '铁路建设与国家推动，1835年德国第一条铁路（纽伦堡---菲尔特）建成后，各邦国纷纷意识到铁路的战略价值。普鲁士政府通过"铁路债券"和土地征用权大规模介入铁路规划，形成了"国家规划、私人运营、政府担保"的混合模式，而非英国的纯粹私人铁路。', NULL, 1835
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"钢铁与黑麦的联盟"，俾斯麦通过高关税政策（1879年关税法），同时对进口谷物和进口铁征收高额关税，保护了东部的容克地主和鲁尔的重工业家，形成了这两个看似矛盾阶级的政治联盟，构成了帝国时期的基本权力基础。', NULL, 1879
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国家社会主义立法（1881-1889），为瓦解社会主义运动（当时社民党已获得议会约25%选票），俾斯麦在1880年代史无前例地推出了三部分社会保障立法，《疾病保险法》（1883）：覆盖工人、雇员，保费由雇主与工人分担，这是世界第一部国家强制医保。', NULL, 1883
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国家社会主义立法（1881-1889），为瓦解社会主义运动（当时社民党已获得议会约25%选票），俾斯麦在1880年代史无前例地推出了三部分社会保障立法，《事故保险法》（1884）：由雇主全额承担，覆盖工伤事故。', NULL, 1884
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国家社会主义立法（1881-1889），为瓦解社会主义运动（当时社民党已获得议会约25%选票），俾斯麦在1880年代史无前例地推出了三部分社会保障立法，《养老保险法》（1889）：70岁以上老人可获得国家养老金（后降至65岁）。', NULL, 1889
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '这是人类历史上第一个现代社会保障体系，比美国《社会保障法》早50年。俾斯麦的逻辑清晰而冷酷："给工人一点面包，他们就不会去追随革命。"', NULL, 1881
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '银行与工业的融合，以德意志银行（1870年成立）为代表的"全能银行"模式形成。银行不仅是贷款者，还直接持有工业企业股份、派员进入监事会，形成了"银行主导型"的金融资本主义，与英美"市场主导型"形成鲜明对比。', NULL, 1870
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '世界政策与造舰计划，1897年，海军上将阿尔弗雷德·冯·提尔皮茨出任海军国务秘书，推动《舰队法》（1898、1900、1906、1912年四次修订），计划建立一支足以挑战英国皇家海军的公海舰队。为此，国家向克虏伯等军工巨头提供巨额订单和补贴，国家与工业资本的关系从"合作"升级为"绑定"。', NULL, 1897
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工业巨头的崛起，这一时期出现了"德意志工业巨头"——克虏伯的炮钢、蒂森的钢铁、西门子的电气、巴斯夫的化工。这些企业与国家形成了共生关系：国家提供关税保护、军备订单和海外殖民地的资源渠道，企业则成为国家实力的工业支撑。', NULL, 1890
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '卡特尔化浪潮，与英美反托拉斯不同，德国法律对卡特尔（企业联合垄断）持宽容态度。1905年德国已有约400个卡特尔，涵盖钢铁、煤炭、化工、水泥等行业。国家甚至强制成立卡特尔（如1904年强制成立的莱茵-威斯特法伦煤炭辛迪加），视其为"稳定市场、避免恶性竞争"的手段。这与美国的《谢尔曼反托拉斯法》（1890）形成了鲜明对比。', NULL, 1905
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '一战动员（1914-1918），战争爆发后，德国迅速转向战时指令经济。1916年成立的"最高战争局"由将军格勒纳领导，实行强制卡特尔化、原材料统配、劳动力强制调配。这一时期的"兴登堡计划"要求武器产量翻倍，国家对经济的控制达到了前所未有的程度。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1923年超级通胀，为支付战争赔款和应对占领鲁尔（法国为索取赔款而派军占领德国工业核心区）造成的生产停滞，魏玛政府开动印钞机。1923年底，物价较战前上涨了1.4万亿倍，马克一文不值。工人一天领两次工资，拿到后立刻跑去买面包；中产阶级的储蓄被彻底清零，这成为纳粹后来获得中产阶级支持的关键原因。', NULL, 1923
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《道威斯计划》（1924）与"黄金二十年代"，美国通过《道威斯计划》向德国注入巨额贷款，魏玛经济短暂复苏。这一时期的特征是国家干预与外资依赖并存：一方面，国家仍维持着俾斯麦时代以来的社会保障体系；另一方面，政府对外资几乎不加限制，金融高度开放。', NULL, 1924
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大萧条与布吕宁的紧缩灾难（1930-1932），1929年大萧条爆发，美国资本撤离，德国失业率飙升至30%以上（1932年约600万人失业）。总理海因里希·布吕宁信奉"只能通过痛苦来治愈痛苦"，采取极端通缩政策：削减政府支出、提高税收、降低工资和价格。结果经济非但没有好转，反而陷入更深的萧条，失业率继续攀升。布吕宁的政策被后世经济史学家批评为"把德国推向了纳粹的怀抱"——在绝望中，选民开始大规模投向承诺"面包与工作"的希特勒。', NULL, 1930
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《魏玛宪法》第48条，魏玛宪法允许总统在"紧急状态"下颁布紧急法令。这一条款在1930-1933年间被反复滥用（布吕宁的紧缩政策就是通过紧急法令实施的），事实上架空了议会民主，为希特勒上台铺平了法律通道。', NULL, 1930
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"MEFO汇票"与隐蔽的财政扩张，为避免通胀记忆被唤醒，纳粹发明了"MEFO汇票"——一种由"金属研究有限公司"（MEFO）发行的虚拟货币，实际由政府担保，但不计入公开预算。通过这种方式，1933-1938年间纳粹进行了人类历史上规模最大的隐蔽财政扩张，用于修建高速公路（高速公路项目，1933-1943）、重整军备和建设兵工厂。到1938年，德国军费已占国民生产总值的17%，远超任何和平时期国家。', NULL, 1933
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '消除失业与劳动力强制，通过大规模公共工程（高速公路）、普遍兵役制（1935年恢复）、以及将妇女和犹太人逐出劳动力市场，纳粹在1936年实现了"零失业"。但所谓的"经济奇迹"是建立在完全消除工会、禁止罢工、工资冻结的基础之上的。1936年的"四年计划"（由戈林负责）目标是"四年之内德国经济必须能够支持战争"，将经济完全转向战争轨道。', NULL, 1935
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '指令经济的运作机制，纳粹经济部长亚尔马·沙赫特（后由冯克接任）建立了一套复杂的配给与许可证制度。原材料、外汇、劳动力全部由国家分配；企业利润被严格控制，股息上限为6%；所有企业必须加入"帝国经济院"，成为国家的下级执行机构。1937年通过的《德国公司法》取消了股东权利，允许国家直接任命企业管理者。', NULL, 1937
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '战时经济（1939-1945），二战爆发后，德国进入了彻底的战争指令经济。1942年施佩尔被任命为军备部长后，通过"工业自我责任"体制提高了效率，在轰炸中军备生产反而在1944年达到顶峰。但这是建立在强制劳动（约1200万外国劳工与战俘被强制在德国工厂劳动）和对占领区的系统性掠夺之上的。', NULL, 1939
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '货币改革与价格放开（1948），1948年6月20日，美占区与英占区用"德国马克"取代已成废纸的帝国马克，每人只允许兑换40马克，大量货币存量被清零。三天后，美占区经济部长路德维希·艾哈德在没有通知盟军当局的情况下，通过广播宣布取消所有价格管制和物资配给，代之以"竞争"。这是现代经济史上最大胆的一次自由化实验。艾哈德后来说："那天晚上，我知道我赌了一把。"', NULL, 1948
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"社会市场经济"理念的形成，艾哈德的理论来源是弗莱堡学派的"秩序自由主义"（Ordoliberalism），代表人物有瓦尔特·欧肯、弗朗茨·伯姆等。其核心逻辑是：国家不应干预市场运行（如价格、工资），但国家必须建立并维护市场运行的"秩序"——包括独立的央行、反垄断法、稳定的货币政策、私有产权保护。艾哈德的名言是："市场越自由，国家就越强大。但这里的''强大''指的是国家执行法律、制定规则的能力，而不是干预经济的能力。"', NULL, 1948
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《德意志联邦银行法》（1957），1957年，德国将各州央行合并为德意志联邦银行，并赋予其"价格稳定优先于充分就业"的法定目标，且独立于政府指令。这是对魏玛通胀和纳粹国家掠夺的彻底否定，也为后来的"欧洲央行"提供了制度模板。', NULL, 1957
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《反对限制竞争法》（反卡特尔法，1957），这是对德国历史上卡特尔传统的彻底决裂。该法禁止企业之间达成垄断协议，并设立联邦卡特尔局作为独立的执法机构。它确立了"竞争作为国家价值观"的理念——国家可以容忍很多事，但绝不容忍垄断。', NULL, 1957
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"经济奇迹"的起飞，1948-1965年间，西德工业产值年均增长约10%，失业率从1948年的10%以上降至1960年的不足1%。这一成就的根基是：稳定的货币（联邦银行）、有序的竞争（反垄断）、以及社会保障体系的恢复。艾哈德将这种模式称为"大众资本主义"——让尽可能多的人通过市场获得财富，而不是依赖国家分配。', NULL, 1948
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《促进经济稳定与增长法》（1967），这部法律被称为"凯恩斯主义入宪"。它规定联邦政府有义务在制定经济政策时追求"四驾马车"（价格稳定、充分就业、外贸平衡、适度增长）的宏观平衡。法律授权政府在经济下行时实施逆周期财政政策——包括投资计划、税收调整、甚至强制企业增加库存。这是对艾哈德"政府不干预周期"理念的重大修正。', NULL, 1967
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"总体经济调控"实践，1967-1969年，在社民党经济部长席勒主导下，联邦政府连续实施"景气计划"，通过财政赤字来刺激总需求。1969年社民党总理勃兰特上台后，这一趋势进一步强化。政府债务从1966年的约200亿马克增至1975年的近2000亿马克。', NULL, 1967
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会福利大扩张，勃兰特提出"内政改革"纲领，大规模扩张福利体系，《教育促进法》（1971）：引入联邦教育助学金（BAföG），大幅提高教育可及性。', NULL, 1971
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会福利大扩张，勃兰特提出"内政改革"纲领，大规模扩张福利体系，养老金改革（1972）：引入"动态养老金"机制，养老金与当前工资挂钩而非与缴费挂钩，大幅提高替代率（从1960年代的约60%提高到1970年代的近70%）。', NULL, 1972
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会福利大扩张，勃兰特提出"内政改革"纲领，大规模扩张福利体系，失业保障扩张，失业金替代率提高、领取期限延长。', NULL, 1966
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会福利大扩张，勃兰特提出"内政改革"纲领，大规模扩张福利体系，石油危机与滞胀（1973-1975）：1973年石油危机爆发后，西德经济陷入战后首次严重衰退。失业率从1973年的0.8%飙升至1975年的4.7%（在当时被视为危机水平）。更为棘手的是，通胀与失业同时上升，打破了凯恩斯主义"菲利普斯曲线"的假设。社民党政府（1974年起由施密特担任总理）试图用更多财政刺激来对抗衰退，但效果递减，政府债务继续膨胀。', NULL, 1973
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会福利大扩张，勃兰特提出"内政改革"纲领，大规模扩张福利体系，"趋势逆转"与成本危机：1970年代末，社民党内部开始出现反思。联邦银行行长奥特马尔·埃明格尔和卡尔·奥托·珀尔不断警告通胀风险。施密特政府被迫在1979年开始转向财政整顿，但效果有限。到1982年，西德政府债务占GDP比例已从1966年的约15%升至近35%。', NULL, 1970
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1980年代的"转向"（Wende），科尔上台后，提出了"精神-道德转向"（geistig-moralische Wende），在经济领域进行有限度的自由化，财政整顿，削减赤字、减少补贴，私有化，出售联邦在车企（大众）、航空（汉莎）、能源（VEBA、VIAG）的股份，税收改革，降低所得税最高税率（从56%降至53%）、取消部分财产税。', NULL, 1980
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '但与同期英国撒切尔、美国里根的激进自由化相比，德国的调整相当温和。工会权力、高福利、反垄断法基本未动。德国的失业率在1980年代中期仍高达8-9%，被称为"欧洲病夫"的早期征兆。', NULL, 1980
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '两德统一与"转移支付"国家（1990-1995，货币联盟（1990），1990年7月1日，西德马克以1:1的汇率（实际价值约1:4）兑换东德马克，东德居民的储蓄被大幅高估。这一决定由科尔出于政治考量强行推进，被联邦银行行长珀尔激烈反对（认为将导致通胀和财政负担）。', NULL, 1990
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '两德统一与"转移支付"国家（1990-1995，《团结条约》，为重建东德，西德启动了人类历史上最大规模的区域转移支付。通过"团结税"（1991年开征，税率为所得税的5.5%至今）、联邦补贴、社保基金转移，每年向东德净转移约1000-1500亿欧元（1990年代币值），持续至今。', NULL, 1991
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '两德统一与"转移支付"国家（1990-1995，经济后果，高估的货币使东德工业在瞬间丧失竞争力，东德工业生产在1990-1991年间暴跌约70%。失业率在1990年代中期达到20%以上，至今仍明显高于西德（2023年东德约7.5%，西德约5.5%）。', NULL, 1990
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"欧洲病夫"时期（1995-2005），统一带来的财政负担、1980年代积累的结构僵化、以及欧元启动后竞争力暴露，使德国在1990年代后半期陷入长期低迷，失业率：1997年达到11%以上，失业人口超过400万。', NULL, 1997
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"欧洲病夫"时期（1995-2005），统一带来的财政负担、1980年代积累的结构僵化、以及欧元启动后竞争力暴露，使德国在1990年代后半期陷入长期低迷，经济增长：1995-2005年德国年均增长率仅1.1%，低于欧元区平均水平。', NULL, 1995
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"欧洲病夫"时期（1995-2005），统一带来的财政负担、1980年代积累的结构僵化、以及欧元启动后竞争力暴露，使德国在1990年代后半期陷入长期低迷，财政赤字：多次违反《马斯特里赫特条约》规定的3%赤字上限（1996、2002、2003、2004年）。', NULL, 1996
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"欧洲病夫"时期（1995-2005），统一带来的财政负担、1980年代积累的结构僵化、以及欧元启动后竞争力暴露，使德国在1990年代后半期陷入长期低迷，结构问题：劳动力市场僵化（解雇保护法、工会覆盖率高、失业救济优厚）、养老金负担沉重（人口老龄化）、企业竞争力下降（单位劳动力成本1990-2000年累计上升约20%）。', NULL, 1990
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《2010议程》（Agenda 2010）的提出，2003年3月14日，施罗德在联邦议院发表了纲领性演讲，宣布"我们将削减国家福利，鼓励个人责任，唤醒经济活力"。纲领的核心目标是"让德国在2010年前成为欧洲增长最快的国家"。', NULL, 2010
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈茨改革（Hartz IV），这是改革的核心，由大众汽车人事董事彼得·哈茨领导的委员会设计，分为四个阶段，哈茨 I &II（2003）：建立"临时雇佣"制度（Personaldienstleistungen），允许企业更灵活地雇佣和解雇；将失业金与就业促进挂钩，引入"迷你工作"（minijob）等低薪就业形式。', NULL, 2003
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈茨改革（Hartz IV），这是改革的核心，由大众汽车人事董事彼得·哈茨领导的委员会设计，分为四个阶段，哈茨 III（2004）：将联邦就业局重组为"联邦就业机构"（Bundesagentur für Arbeit），大幅削减管理层级、引入绩效管理。', NULL, 2004
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈茨改革（Hartz IV），这是改革的核心，由大众汽车人事董事彼得·哈茨领导的委员会设计，分为四个阶段，哈茨IV（2005）：最核心、最具争议的部分。将失业金与社会救济合并为"失业金II"（Arbeitslosengeld II），标准大幅降低：此前失业后长期可领取原工资的60-67%的失业金（无时间上限），改革后失业金I只能领取12个月（55岁以上18个月），之后只能领取统一的、远低于工资的失业金II（2024年约563欧元/月+房租）。改革还引入了"要求与促进"原则——失业者必须接受任何"合理工作"，否则将削减福利。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈茨改革（Hartz IV），这是改革的核心，由大众汽车人事董事彼得·哈茨领导的委员会设计，分为四个阶段，解雇保护削弱：2004年修订《解雇保护法》，将豁免范围从员工10人以下的企业扩大到5人以下的企业（后因政治压力回调）。', NULL, 2004
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈茨改革（Hartz IV），这是改革的核心，由大众汽车人事董事彼得·哈茨领导的委员会设计，分为四个阶段，手工业放开：取消了92种手工业的"大工匠证书"（Meisterzwang）强制要求，允许无需证书即可开设手工作坊。', NULL, 2003
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈茨改革（Hartz IV），这是改革的核心，由大众汽车人事董事彼得·哈茨领导的委员会设计，分为四个阶段，养老金改革：引入"里斯特养老金"（Riester-Rente）——私人养老金与政府补贴结合，以应对人口老龄化。', NULL, 2003
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈茨改革（Hartz IV），这是改革的核心，由大众汽车人事董事彼得·哈茨领导的委员会设计，分为四个阶段，政治后果与社会撕裂：哈茨IV引发了德国历史上最大规模的社会抗议。2004-2005年间，每周有数万人走上街头，社民党基层党员大规模退党。2005年，社民党在北威州（传统大本营）选举中惨败，施罗德被迫提前举行大选，最终丢掉了总理职位。部分左翼党员脱离社民党，与东德的"左翼党"（PDS）合并组建"左翼党"（Die Linke），成为德国政治版图永久性的左翼力量。', NULL, 2004
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"债务刹车"写入宪法（2009），2008年金融危机后，默克尔政府推动将"债务刹车"写入《基本法》。规定：自2016年起，联邦政府的结构性赤字不得超过GDP的0.35%，各州不得有任何结构性赤字。这是对魏玛通胀、战后债务扩张以及统一后财政失控的最终制度锁定。2016年至今，联邦政府连续多年实现零赤字甚至盈余（2020年新冠疫情前）。', NULL, 2009
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《短时工作制》（Kurzarbeit）的危机应对，2008-2009年金融危机期间，德国出口断崖式下跌（2009年GDP萎缩5.7%）。联邦就业局大规模启用"短时工作制"——企业减少员工工时，政府补贴员工损失的净工资的60-67%。2009年5月，约150万人领取短时工作补贴。这一制度成功避免了大规模裁员：2008-2010年间，德国失业率仅从7.5%微升至7.8%（同期美国从5.8%升至9.6%），危机后迅速恢复。这是德国"社会市场经济"在危机管理中的标志性政策。', NULL, 2008
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '出口繁荣的机制，2010年代德国的经济表现远超其他欧洲国家，被称为"出口冠军"，欧元区低汇率，欧元区整体汇率低于德国自主货币应有的水平，相当于德国获得了持续的"隐性贬值。', NULL, 2010
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '单位劳动力成本优势，2010议程使2000-2015年间德国单位劳动力成本累计下降约15%，而同期西班牙、意大利等南欧国家上升约20-30%。', NULL, 2000
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '中小企业（Mittelstand），德国拥有大量"隐形冠军"——在细分领域全球领先的中小企业，它们聚焦高端制造、研发投入高、出口依赖强。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工业占GDP比重，2015年德国工业占GDP比重约为23%，远高于美英（约10-13%），是发达国家中"去工业化"程度最低的国家之一。', NULL, 2015
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"欧洲病夫"变"欧洲引擎"，2005-2019年间，德国GDP年均增长率约1.8%（高于欧元区平均水平），失业率从2005年的11%降至2019年的3.1%（两德统一以来最低），政府债务占GDP比重从2010年的81%降至2019年的59.5%。默克尔在2015年"难民危机"后获得"欧洲实际领导人"的称号。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '新冠疫情与"债务刹车"暂停（2020-2021，财政大扩张，2020年3月，德国政府决定暂停"债务刹车"，推出总额达1.2万亿欧元的救助计划，包括对中小企业直接补贴（"新冠援助"）、延期纳税、短时工作制的大规模扩容（2020年4月短时工作人数达600万）。', NULL, 2020
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '新冠疫情与"债务刹车"暂停（2020-2021，"债务刹车"的合法性危机，这一轮扩张后，联邦政府债务占GDP比重从2019年的59.5%跃升至2021年的69.3%。关于"债务刹车"是否已成为增长障碍的辩论开始爆发。', NULL, 2019
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '俄乌战争与能源危机的"时代转折"（2022，"时代转折"演讲，2022年2月27日，朔尔茨总理在联邦议院发表历史性演讲，宣布"我们正在经历一个时代转折（Zeitenwende）"，承诺设立1000亿欧元特别国防基金，并将国防开支提高到GDP的2%以上（此前长期低于1.5%）。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '能源危机与干预，俄罗斯天然气供应中断后，德国政府采取了一系列史无前例的干预措施，2000亿欧元"防御盾"计划（2022年10月）：对天然气、电力价格进行补贴，相当于GDP的5%。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '能源危机与干预，俄罗斯天然气供应中断后，德国政府采取了一系列史无前例的干预措施，国有化能源企业：将天然气进口商Uniper、石油子公司Rosneft Germany等关键能源企业收归国有（或托管）。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '能源危机与干预，俄罗斯天然气供应中断后，德国政府采取了一系列史无前例的干预措施，重启煤电：暂时延长煤电厂运营（原定2030年退煤，现推迟至2038年）。', NULL, 2030
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '能源危机与干预，俄罗斯天然气供应中断后，德国政府采取了一系列史无前例的干预措施，能源价格高企的长期影响：2022-2024年，德国能源密集型产业（化工、玻璃、钢铁）面临去工业化压力。巴斯夫（BASF）等企业宣布将部分产能转移至中国和美国。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"债务刹车"第二次暂停与产业政策的回归（2023-2024，2023年底，德国政府因联邦宪法法院裁定"新冠剩余资金用于气候转型"违宪，导致预算危机，被迫再次暂停"债务刹车"并重新编制预算。', NULL, 2023
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《通胀削减法案》（IRA）的冲击，美国2022年通过的《通胀削减法案》向绿色技术提供3690亿美元补贴，对德国工业构成巨大"补贴拉力"。德国被迫反击，推出"欧洲版IRA"讨论，欧盟层面的《净零工业法案》（Net-Zero Industry Act，芯片法案，联邦政府承诺为英特尔在马格德堡的晶圆厂提供100亿欧元补贴，为台积电在德累斯顿的工厂提供50亿欧元补贴——这是德国战后最大规模的单项产业补贴。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"德国基金"（Deutschlandfonds），2023年提出设立数百亿欧元基金，用于直接补贴战略产业（半导体、电池、氢能）。', NULL, 2023
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '移民政策与劳动力短缺，2015年难民危机后，德国面临严重的劳动力短缺（2023年岗位空缺约200万）。2023年通过《技术移民法》改革，大幅降低非欧盟技术移民门槛（取消德语门槛、引入"机会卡"积分制），这是对传统"非移民国家"身份的重大突破。', NULL, 2015
FROM history_country c
WHERE c.country_code = 'DE';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国家直接创办皇家工场（如哥布林挂毯厂），生产奢侈品以替代进口。', NULL, 1660
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '统一度量衡、修建道路桥梁、开凿运河（如南运河）', NULL, 1660
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '对出口产品给予补贴，对进口工业品征收高关税。', NULL, 1660
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '建立殖民贸易公司（西印度公司、东印度公司），由国家授予垄断权。', NULL, 1660
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1789年制宪会议初期，8月4日通过《八月法令》，废除封建制度、取消贵族特权、废除行会。"自由放任"达到顶点——政府不再监管谷物贸易、取消价格管制，结果粮价飞涨，农村骚乱四起。', NULL, 1789
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1793年雅各宾派上台，面对外敌入侵和国内叛乱，救国委员会实行战时国家动员，《全面限价法》，对粮食、燃料等必需品设定最高限价，违者严惩，强制征收粮食，政府成为最大的粮食分配者，关闭所有反对派报刊，建立革命法庭，全民征兵（"全民皆兵"），国家直接管理军工厂。', NULL, 1793
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '财政与金融，1800年建立法兰西银行，由国家授予纸币发行垄断权，结束了革命时期的恶性通胀。银行虽为私有，但高管由政府任命，始终服务于国家财政需求。', NULL, 1800
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '法律与行政，《拿破仑法典》确立了私有财产不可侵犯、契约自由、遗产平等原则，为资本主义发展提供法律框架。同时建立高度中央集权的行政体系——省长由巴黎任命、全国统一的大学制度、国家控制的中学教育。', NULL, 1800
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '基础设施建设，国家主导修建阿尔卑斯山辛普隆山口公路、塞纳河疏浚工程，使巴黎成为欧洲最现代化的城市。', NULL, 1800
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大陆封锁体系（1806年起），为打击英国经济，拿破仑下令欧洲大陆禁止与英国贸易。国家以行政命令强行推动工业化——在法国北部和比利时建立纺织厂、在里昂发展丝织业，由国家提供订单和资金。', NULL, 1806
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '政治背景，波旁王朝复辟（1815）和七月王朝（1830-1848）时期，行政权力相对收缩。国王路易十八曾称："我们要让法国人忘记革命，也要让他们忘记旧制度。"实际政策是让资产阶级自由发展。', NULL, 1815
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '基佐时代，历史学家基佐是七月王朝的实际掌权者，他的名言是"发财致富！"——鼓励资产阶级通过经商积累财富，政府不做过多干预。', NULL, 1815
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '铁路建设，1830年代开始修建铁路，但政府采用"混合模式"——国家征用土地、提供地质勘探，由私营公司修建和运营。结果铁路建设缓慢、资本不足，且由于缺乏统一规划，线路之间互不连接。', NULL, 1830
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会后果，自由放任导致工业革命初期工人阶级处境恶化——童工普遍、工作时间长达15小时、没有劳动保护。1831年和1834年里昂纺织工人两次起义，提出"要么工作，要么死亡"的口号，成为欧洲最早的工人运动之一。', NULL, 1831
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1848年革命，经济危机、腐败丑闻、拒绝扩大选举权最终引爆革命，推翻了七月王朝。二月革命后成立的临时政府立即设立"国家工场"，为失业者提供工作，标志着国家干预的回归。', NULL, 1848
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '拿破仑三世的经济理念，他在流亡期间接触过圣西门主义（一种主张由国家主导工业化、改善工人处境的空想社会主义），上台后试图走"第三条道路"——既不同于复辟时期的自由放任，也不同于雅各宾派的恐怖统治。', NULL, 1850
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国家主导的巴黎改造，1853年任命奥斯曼男爵为塞纳省省长，开展人类历史上规模最大的城市更新，国家强制征收土地（约60%的征收款用于补偿地主，拆除中世纪狭窄街巷，修建12条放射性大道、85公里林荫道，国家投资建设供水系统、下水道网络（维克多·雨果在《悲惨世界》中详细描写过巴黎下水道，新建歌剧院、中央菜市场（后来成为左拉小说《巴黎之腹》的背景。', NULL, 1853
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '资金来源，国家发行市政债券、设立土地银行，用土地增值收益偿还债务。这开创了"国家以基础设施建设带动土地升值、再以土地收益反哺基建"的模式，后来被世界各地借鉴。', NULL, 1850
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '自由帝国时期（1860年代），面对反对派压力，拿破仑三世逐步放松新闻管制、允许工会合法化、降低关税（1860年与英国签订自由贸易协定）。这种"先国家主导、后自由化"的路径，反映了法国在干预与放任之间的长期摇摆。', NULL, 1860
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第三共和国的建立，1870年普法战争失败后，巴黎公社被镇压，第三共和国在妥协中诞生。掌权的"温和共和派"信奉自由放任，认为政府不应干预经济，也不应资助教会学校。', NULL, 1870
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '费里教育法（1881-1882），这是该时期少数国家干预的例外——确立免费、义务、世俗初等教育。但推动立法的主因是政治需要（削弱教会影响力），而非经济干预逻辑。', NULL, 1881
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '巴拿马运河丑闻（1889-1893），政府将运河工程交给私营公司，监管形同虚设。公司高管贿赂数百名议员和部长以掩盖财务困境，最终公司倒闭，80万小投资者血本无归。这暴露了"政商勾结"的腐败，让"自由放任"模式彻底失去道德合法性。', NULL, 1889
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '劳工运动兴起，无政府主义、工团主义、马克思主义在工人中广泛传播。1886年德卡兹维尔煤矿罢工、1892年卡尔莫煤矿罢工均遭军队镇压，激化了阶级矛盾。', NULL, 1886
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '激进党崛起，激进党（名义上为左翼，实为中间派）以"反教权、重分配"为纲领上台。1905年通过《政教分离法》，国家从教会手中夺回教育权，并开始征收教会财产。', NULL, 1905
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '累进所得税的漫长斗争，激进党从1907年起推动累进所得税立法，遭到参议院（由富裕农民和资产阶级控制）的强烈反对。经过7年博弈，终于在1914年7月通过——但已是第一次世界大战爆发前夕。', NULL, 1907
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '劳动保护立法，1900年将妇女和儿童工时限制在10小时；1906年确立每周一天强制休息；1910年建立工人与农民的养老保险制度（虽覆盖面有限，但标志着国家开始承担社会保障责任）。', NULL, 1900
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '思想转变，这一时期，法国左翼开始形成"社会团结"理论——认为国家有义务通过再分配缓解贫富差距，否则社会将走向解体。这种思想成为后来"人民阵线"和战后福利国家的理论基础。', NULL, 1900
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '神圣联盟，1914年8月，各党派宣布停止争斗、一致对外。社会党领袖让·饶勒斯在战争爆发前三天被刺杀，左翼最终选择加入政府。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '军火工业国有化，政府接管雷诺、雪铁龙等汽车工厂，转为生产坦克和炮弹。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '价格与工资管制，对粮食、煤炭、钢铁实行最高限价；禁止罢工，仲裁机制解决劳资纠纷。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '资源配置，政府设立"军火部"，统一分配原材料、燃料和劳动力。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '进口垄断，国家控制所有战略物资进口（小麦、石油、硝酸盐等）', NULL, 1914
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济后果，到1918年，国家支出占GDP比重从战前的15%飙升至50%以上。战后政府被迫出售部分国有工厂，但"国家在危机时可以全面动员"的观念深入人心。', NULL, 1918
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '马蒂尼翁协议（1936年6月），布鲁姆召集工会代表和雇主联合会谈判，促成历史性协议，承认工会自由和集体谈判权，资方接受平均7-15%的加薪，建立企业内部调解机制。', NULL, 1936
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '带薪年假法，所有雇员每年享有15天带薪假期，这是法国工人阶级奋斗数十年的成果。', NULL, 1936
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '每周40小时工作制，从战前的48小时或更长降至40小时。', NULL, 1936
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国有化，将部分军火工业（如航空制造业）收归国有。', NULL, 1936
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '抵抗运动的精神遗产，二战期间，抵抗运动各派在1944年3月签署《全国抵抗委员会纲领》，承诺战后建立"真正的经济民主"——包括将银行、能源、交通等"经济制高点"国有化，建立全民社会保障。', NULL, 1944
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945年国有化浪潮，法兰西银行和四大存款银行（里昂信贷、兴业银行等）收归国有，电力（法国电力EDF）、天然气（法国燃气GDF）、煤炭（法国煤炭局）、航空（法国航空）、雷诺汽车（因与维希政府合作被没收）全部国有化。', NULL, 1945
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '计划化，1946年，让·莫内创立国家规划委员会，制定第一个"现代化与装备计划"（莫内计划）。其核心理念是：国家不直接命令企业，但通过提供信贷、补贴、基础设施承诺，引导私人投资向优先领域（煤炭、钢铁、水泥、交通）倾斜。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会保障体系，1945年10月通过《社会保障法令》，建立覆盖全民的医疗保险、家庭津贴、养老保险。资金来自雇主和雇员缴费，但由国家统一管理。', NULL, 1945
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"光辉三十年"，1945-1973年间，法国GDP年均增长5%以上，工业产量增长4倍，农业人口从占总就业的35%降至10%。这一成就通常归功于国家主导与市场活力的结合。', NULL, 1945
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第一次石油危机（1973），油价从每桶3美元飙升至12美元，法国作为石油进口国遭受重创。通胀率升至两位数，经济增长率从6%骤降至3%左右。', NULL, 1973
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '传统干预的困境，1970年代政府仍试图用传统手段应对危机——价格管制、补贴企业、扩张财政。但这些措施加剧了财政赤字，却未能遏制通胀。1976年，总理雷蒙·巴尔开始推行紧缩政策，被称为"法国的撒切尔"，但遭到工会和左翼强烈反对。', NULL, 1970
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《共同纲领》（1972），社会党和共产党签署共同执政纲领，提出"打破资本主义"的激进主张——将九大工业集团（包括通用电气、汤姆逊、佩西尼等）、两大金融控股公司收归国有。1974年总统选举中，左翼候选人密特朗以微弱劣势败选，但这一纲领成为1981年左翼上台后的施政蓝图。', NULL, 1972
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '思想转变，1970年代末，法国知识界开始反思干预主义。1978年出版的法语版《自由选择》（米尔顿·弗里德曼）意外畅销，标志着新自由主义思潮开始进入法国。', NULL, 1970
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1981年密特朗当选，社会党时隔23年重掌政权。政府迅速实施《共同纲领》——将五大工业集团、36家银行、两家金融控股公司收归国有，国有经济比重从战后的15%骤升至32%。', NULL, 1981
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济危机与转向（1983年），国有化未能刺激增长，反而加剧财政赤字。法郎面临贬值压力，资本外逃严重。1983年3月，密特朗面临选择：要么退出欧洲货币体系、实行资本管制，要么放弃干预主义、转向紧缩。', NULL, 1983
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"紧缩计划"，密特朗选择留在欧洲货币体系，全面转向，取消价格管制，冻结公共部门工资，削减公共开支，暂停部分国有化计划，不再将"打破资本主义"作为目标。', NULL, 1980
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '私有化浪潮（1986年），右翼在议会选举中获胜，希拉克出任总理，开启法国首次大规模私有化——出售圣戈班、巴黎银行、兴业银行等国有企业。社会党1988年重新执政后也未逆转私有化进程，仅保留法国电力、法国燃气等核心企业。', NULL, 1986
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《马斯特里赫特条约》（1992），条约规定加入欧元区的条件——财政赤字不超过GDP的3%，公共债务不超过60%。这意味着法国的财政政策不再完全自主，必须服从"布鲁塞尔"的纪律。', NULL, 1992
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '削减赤字，1990年代，历届政府（无论是社会党的若斯潘，还是右翼的巴拉迪尔）都致力于削减赤字，1993年巴拉迪尔政府削减公共开支，提高增值税。', NULL, 1993
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '削减赤字，1990年代，历届政府（无论是社会党的若斯潘，还是右翼的巴拉迪尔）都致力于削减赤字，1997-2002年若斯潘政府推行"35小时工作制"以分摊就业，但同时控制财政支出。', NULL, 1997
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"35小时工作制"，这是1990年代法国左翼最著名的社会干预措施。其初衷是将工作时长从39小时降至35小时，企业若执行可获政府补贴，旨在通过"工作分摊"降低失业率。但批评者认为这增加了企业用工成本，且与欧盟的"灵活就业"导向相悖。', NULL, 1990
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会断裂，1995年，希拉克当选总统后试图削减公务员养老金和社保，引发全国性大罢工，最终被迫放弃。这一事件表明，法国社会对新自由主义改革的抵触已达到临界点。', NULL, 1995
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '公投失败（2005年），法国就是否批准《欧盟宪法条约》举行全民公投，55%的选民投下反对票。反对阵营包括极左翼（认为条约过于"新自由主义"）和极右翼（认为损害主权）。这标志着法国社会对"欧盟主导的改革"的强烈抵触。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2005年巴黎郊区骚乱，两名北非裔少年在躲避警察时触电身亡，引发持续三周的全国性骚乱，近万辆车被烧毁。骚乱揭示了"光辉三十年"未能解决的深层问题——移民后代在经济停滞中承受着失业和歧视。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '经济停滞，2000年代，法国经济增长率在1-2%之间徘徊，失业率长期在8-10%高位，年轻人失业率超过20%。购买力停滞成为最敏感的政治议题。', NULL, 2000
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '危机前兆，2007-2008年，法国银行深度参与美国次级抵押贷款市场。2008年9月雷曼兄弟倒闭后，法国银行（尤其是兴业银行和法国巴黎银行）面临流动性危机，政府被迫出手救助。', NULL, 2007
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2008年救助银行，政府向银行系统注入3600亿欧元担保，实际出资320亿欧元收购兴业银行等股份。这是1980年代以来最大规模的国家干预。', NULL, 2008
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '欧债危机与紧缩（2010-2012），希腊、爱尔兰等国债务危机爆发后，欧盟要求各国削减赤字。法国右翼政府（萨科齐）推行养老金改革（退休年龄从60岁延至62岁），引发全国罢工。', NULL, 2010
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '奥朗德政府的摇摆（2012-2017），初期"左翼试验"，提高"财富税"税率至75%（针对年收入超100万欧元者），增加公共支出，试图刺激增长。但企业信心受挫，经济未见起色。', NULL, 2012
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '转向"供给侧改革"，2014年任命埃马纽埃尔·马克龙为经济部长，推动《马克龙法案》——放宽商店周日营业限制、开放受保护职业（如公证人）、放松长途客运管制。这是社会党政府推出的最"自由放任"的法案。', NULL, 2014
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"黑夜站立"运动（2016年），政府试图通过《劳动法改革法案》（允许企业更灵活调整工时和解雇员工），引发持续数月的抗议和罢工，最终政府强行通过法案。', NULL, 2016
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '马克龙的"第三条道路"，2017年，马克龙以"非左非右"姿态当选，明确宣称要终结1990年代的"福利僵化"，取消"财富税"（改为仅对房地产征税），降低资本利得税，改革劳动法（赋予企业更多灵活性，削减公共部门岗位，推动公务员制度改革。', NULL, 2017
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"黄背心"运动（2018年11月），政府提高燃油税以推动绿色转型，引发全国性抗议。抗议者穿上黄色荧光背心（法国规定车内必须配备），每周六在环城路和市中心示威。运动持续一年多，暴露了城乡差距和购买力焦虑。', NULL, 2018
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '疫情与战时干预（2020-2021），新冠疫情迫使国家重新扮演"最后贷款人"，实施"部分失业"计划，国家为停工企业员工支付84%的净工资，向航空、汽车、旅游业提供数百亿欧元救助，国家担保3000亿欧元企业贷款。', NULL, 2020
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '绿色产业与主权回归（2022-2024，《绿色工业法案》（2023），为电池、光伏、氢能等绿色产业提供税收抵免和补贴，目标是"在法国生产"', NULL, 2023
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '绿色产业与主权回归（2022-2024，将法国电力（EDF）重新完全国有化（2023），以推动核电建设。', NULL, 2023
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '绿色产业与主权回归（2022-2024，限制外国投资，保护战略行业（半导体、电动汽车）', NULL, 2022
FROM history_country c
WHERE c.country_code = 'FR';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '亨利八世宗教改革，解散修道院，没收教会土地（约全国1/4的可耕地）', NULL, 1530
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '玛丽一世短暂复辟天主教，血腥镇压新教徒。', NULL, 1553
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '伊丽莎白一世即位，确立英国国教（安立甘宗）的中间路线。', NULL, 1558
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '授予东印度公司皇家特许状，开启特许公司垄断贸易模式。', NULL, 1600
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '击败西班牙无敌舰队，确立海上霸权开端。', NULL, 1588
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1534年《至尊法案》，确立国王为英国教会最高首脑。', NULL, 1534
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1536-1541年一系列《修道院解散法案》，土地所有权大规模转移，催生新的乡绅阶层。', NULL, 1536
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1600年东印度公司特许状，确立"特许公司+国家特许"的重商主义模式。', NULL, 1600
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '议会向查理一世递交《权利请愿书》，反对未经议会同意征税。', NULL, 1628
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '查理一世"十一年暴政"，未经议会统治，强制征收"船税"', NULL, 1629
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '苏格兰起义迫使查理一世重开议会（长期议会）', NULL, 1640
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英国内战（议会派vs保王派）', NULL, 1642
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '查理一世被处决，克伦威尔成立共和国（英吉利共和国）', NULL, 1649
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '克伦威尔护国公时期，军事独裁统治。', NULL, 1653
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '斯图亚特王朝复辟（查理二世）', NULL, 1660
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '光荣革命，威廉与玛丽接受《权利法案》即位。', NULL, 1688
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英格兰银行成立。', NULL, 1694
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1628年《权利请愿书》，禁止未经议会同意征税、禁止强制征用民房、禁止戒严法。', NULL, 1628
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1641年《三年法案》，规定议会至少每三年召开一次。', NULL, 1641
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1679年《人身保护法》，禁止非法拘禁，确立公民人身自由。', NULL, 1679
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1689年《权利法案》，确立议会主权、国王不得中止法律、不得在和平时期维持常备军、议会选举自由。', NULL, 1689
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1694年《三年法案》（修订），议会至少每三年召开一次，强化议会定期性。', NULL, 1694
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1694年英格兰银行成立，国债制度化，为财政-军事国家提供金融基础设施。', NULL, 1694
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '九年战争（对法）', NULL, 1689
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '西班牙王位继承战争。', NULL, 1701
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英格兰与苏格兰合并（《联合法案》），大不列颠王国成立。', NULL, 1707
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第一次詹姆斯党叛乱（斯图亚特复辟企图）', NULL, 1715
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '南海泡沫（南海公司股价崩盘，引发金融危机）', NULL, 1720
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '罗伯特·沃波尔长期担任"首席财政大臣"（事实上第一任首相），推行和平与稳定政策。', NULL, 1721
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第二次詹姆斯党叛乱（最终失败）', NULL, 1745
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '七年战争（对法、对西班牙），英国取得加拿大和印度控制权。', NULL, 1756
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1707年《联合法案》，苏格兰放弃独立议会，换取自由贸易权和对英格兰殖民地的准入权。', NULL, 1707
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1720年《泡沫法案》，为应对南海泡沫，限制股份公司设立，直到1825年才废除。', NULL, 1720
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国债体系制度化，英格兰银行成为战争融资核心，长期国债（永久国债）成为政府主要融资工具。', NULL, 1688
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '瓦特改良蒸汽机（1769年专利），阿克莱特水力纺纱机（1769），开启工厂制时代。', NULL, 1760
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '北美《印花税法案》引发抗议。', NULL, 1765
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '美国独立战争。', NULL, 1775
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '戈登暴动（反天主教暴乱，伦敦失控一周）', NULL, 1780
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '伦敦通讯会、伯明翰月社等激进改革协会兴起。', NULL, 1780
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1765年《印花税法案》及后续《汤森法案》，试图向北美殖民地征税，引发"无代表不纳税"抗议。', NULL, 1765
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1783年《巴黎条约》，承认美国独立，英国丧失13个殖民地。', NULL, 1783
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1774年《魁北克法案》，允许法属加拿大保留天主教和法国法，防止其加入北美反叛。', NULL, 1774
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1786年《合并关税法案》，统一英格兰与苏格兰关税，但爱尔兰仍受限制。', NULL, 1786
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '法国大革命爆发，英国激进派欢呼。', NULL, 1789
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '潘恩发表《人权论》，销量超20万册，引发统治集团恐慌。', NULL, 1791
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '伦敦通讯会等激进组织规模扩大。', NULL, 1792
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '法国革命战争（第一次反法同盟）', NULL, 1793
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '皮特政府中止人身保护法，起诉潘恩（缺席审判）、逮捕激进派领袖。', NULL, 1794
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '联合爱尔兰人起义，被血腥镇压。', NULL, 1798
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '联合法案（合并爱尔兰）', NULL, 1800
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '拿破仑战争。', NULL, 1803
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '滑铁卢战役胜利，拿破仑战争结束。', NULL, 1815
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1794年《中止人身保护法》（多次延续至1801），允许不经审判无限期拘留。', NULL, 1794
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1799年《结社禁止法》（Combination Acts），禁止工人结社和罢工。', NULL, 1799
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1799年所得税首次开征，战时临时措施，战后即废除（但1842年永久化）', NULL, 1799
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1800年《联合法案》，废除爱尔兰议会，大不列颠及爱尔兰联合王国成立。', NULL, 1800
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《谷物法》通过，禁止进口外国小麦直到国内价格达到80先令/夸特。', NULL, 1815
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '彼得卢屠杀（曼彻斯特圣彼得广场集会，骑兵冲入，11死400余伤）', NULL, 1819
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '卡托街阴谋（激进派刺杀内阁成员的阴谋被破获）', NULL, 1820
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '结社禁止法部分废除，工会开始合法化（但1825年又限制）', NULL, 1824
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '天主教解放法案（允许天主教徒担任公职）', NULL, 1829
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '威灵顿公爵内阁倒台，辉格党格雷伯爵上台。', NULL, 1830
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '议会改革法案通过。', NULL, 1832
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1815年《谷物法》，禁止进口小麦直到国内价格达80先令，保护土地贵族利益，引发工业资产阶级强烈反对。', NULL, 1815
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1819年《六项法案》，禁止军事训练、限制集会、授权搜查武器，被称为"禁制法"', NULL, 1819
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1824-1825年《结社法》调整，1824年废除结社禁止法（工人可结社），1825年又通过新法限制工会为"工资谈判"目的。', NULL, 1824
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1829年《天主教解放法案》，允许天主教徒担任公职（此前被排除），是第一次重大宗教宽容立法。', NULL, 1829
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1832年《议会改革法案》，废除"腐朽选区"，新增工业城市代表席位（如曼彻斯特、伯明翰），选民从约50万增加到约81万（成年男性比例从约5%上升到约8%）', NULL, 1832
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '宪章运动兴起（工人阶级首次独立政治运动）', NULL, 1836
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '反《谷物法》同盟成立（科布登、布莱特领导）', NULL, 1838
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '宪章运动第一次请愿（约130万人签名，被议会否决）', NULL, 1839
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '宪章运动第二次请愿（约330万人签名，被否决）', NULL, 1842
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '爱尔兰马铃薯饥荒爆发，数百万爱尔兰人死亡或移民。', NULL, 1845
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '罗伯特·皮尔首相废除《谷物法》', NULL, 1846
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1834年《济贫法修正案》，废除户外救济，建立"习艺所"（workhouse）制度，要求穷人进入条件恶劣的习艺所才能获得救济，旨在迫使劳动者接受低工资。', NULL, 1834
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1844年《银行法》，将英格兰银行分为发行部和银行部，限制纸币发行，为金本位奠定基础。', NULL, 1844
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1846年《谷物法废除法案》，分阶段降低谷物进口关税，1849年完全废除。', NULL, 1846
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1847年《十小时工作法》，限制妇女和青少年日工作不超过10小时（此前1833年工厂法已限制童工工时）', NULL, 1847
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '伦敦世界博览会（万国工业博览会），水晶宫展示英国工业成就。', NULL, 1851
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '克里米亚战争（与俄国战争，暴露军队后勤和医疗问题）', NULL, 1853
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '印度兵变（印度民族起义），东印度公司统治终结，英国直接统治印度（1858）', NULL, 1857
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第二次议会改革法案（迪斯雷利推动）', NULL, 1867
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '教育法案（福斯特法案），开始普及公立小学教育。', NULL, 1870
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工会合法化（《工会法》）', NULL, 1871
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1858年《印度政府法》，东印度公司统治终结，印度成为"英属印度"，维多利亚女王加冕"印度女皇"（1876）', NULL, 1858
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1867年《议会改革法案》（第二次），选民从约100万扩大到约200万（成年男性比例从约8%上升到约16%），城镇工人阶级（"贵族工人"）首次获得选举权。', NULL, 1867
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1870年《教育法》，建立公立小学体系（学校董事会），强制5-12岁儿童接受教育（但直到1880年才强制执行）', NULL, 1870
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1871年《工会法》，工会合法化，工会财产受法律保护。', NULL, 1871
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1875年《公共卫生法》，统一全国卫生标准，地方卫生委员会有权强制改善住房和排水。', NULL, 1875
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"长期萧条"（各国经济衰退、价格下跌、农业危机）', NULL, 1873
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '维多利亚女王加冕"印度女皇"', NULL, 1877
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第三次议会改革法案（选民扩大到大部分男性户主）', NULL, 1884
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '费边社成立（社会主义改良组织）', NULL, 1884
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '柏林会议，欧洲瓜分非洲。', NULL, 1884
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '伦敦码头工人大罢工（"火柴女工"罢工等，新工会主义兴起）', NULL, 1888
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '布尔战争（南非对荷兰裔布尔人的战争，暴露帝国治理危机）', NULL, 1899
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1884年《议会改革法案》（第三次），选民从约300万扩大到约500万（成年男性比例从约16%上升到约28%），农村劳动者获得选举权。', NULL, 1884
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1885年《红河法案》等，帝国在非洲的扩张，英国控制苏伊士运河（1882）、埃及（1882）、尼日利亚（1880s）、肯尼亚（1880s）', NULL, 1885
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1889年《伦敦码头法》等，部分城市开始改善贫民窟（但无全国性住房立法）', NULL, 1889
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1890年《谢尔曼白银购买法》等（美国）引发的全球银价波动，冲击英国金本位。', NULL, 1890
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '劳工代表委员会成立（后改工党），工会与社会主义团体联合。', NULL, 1900
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '教育法案引发非国教派抗议（"拒绝交税"运动）', NULL, 1902
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '张伯伦提出"关税改革"主张（帝国特惠制），导致保守党内部分裂。', NULL, 1903
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '自由党压倒性胜选（以"自由贸易"为竞选口号）', NULL, 1906
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '劳合·乔治提出"人民预算"（累进税+养老金），上院否决引发宪政危机。', NULL, 1909
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '两次大选（解决上院否决权问题）', NULL, 1910
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '议会法通过（废除上院否决权，改为延迟权）', NULL, 1911
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国民保险法（健康保险和失业保险）', NULL, 1911
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1906年《劳动争议法》，工会免受罢工造成的损害赔偿，保护工会权利。', NULL, 1906
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1908年《养老金法》，70岁以上老人每周领取5先令养老金（需经过收入调查），国家首次承担养老责任。', NULL, 1908
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1909年"人民预算"，征收累进所得税（对高收入者征收附加税）、土地税（未开发土地）、遗产税，用于养老金和海军。', NULL, 1909
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1911年《议会法》，废除上院对财政法案的否决权，对其他法案的否决权改为可被下院两次通过的延迟权（两年）', NULL, 1911
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1911年《国民保险法》，第一部分为健康保险（工人缴费、雇主缴费、国家补贴），第二部分为失业保险（建筑、工程等周期性行业）', NULL, 1911
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1914年8月4日，英国对德宣战。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国防法案（DORA）通过，政府获得全面管制权力。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '联合政府成立（阿斯奎斯保守党-自由党联合）', NULL, 1915
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '劳合·乔治任首相，成立小规模战时内阁。', NULL, 1916
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '强制性兵役引入（首次和平时期征兵）', NULL, 1916
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '俄国革命引发英国工人激进情绪。', NULL, 1917
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（"卡其布大选"），妇女首次获得部分选举权。', NULL, 1918
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1918年11月11日，停战协定。', NULL, 1918
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1914年《国防法案》（DORA），政府有权征用工厂、控制物价、实行新闻审查、划定禁区，战时持续延续。', NULL, 1914
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1915年《军工法》，将军工企业收归国家控制，禁止罢工（违反者判刑），冻结利润。', NULL, 1915
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1916年《兵役法》，实行强制性兵役，首次打破英国"自愿兵役"传统。', NULL, 1916
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1917年《康邦报告》，提出战后重建计划，包括住房、教育、公共卫生全面改善。', NULL, 1917
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1918年《人民代表法》，选民从约800万扩大到约2100万（成年男性普选，30岁以上女性获得选举权）', NULL, 1918
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1918年《教育法》（费舍法案），将义务教育年龄提高到14岁，建立地方教育当局。', NULL, 1918
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1918年大选，劳合·乔治"卡其布大选"（联合政府胜选）', NULL, 1918
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '战后繁荣与1921年急剧衰退（"战后萧条"）', NULL, 1919
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '爱尔兰独立战争（《英爱条约》签订，爱尔兰南部26郡成立自由邦）', NULL, 1921
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '丘吉尔（财政大臣）宣布重返金本位（战前平价，1英镑=4.86美元）', NULL, 1925
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '总罢工（5月4日-12日，约170万工人罢工，支持煤矿工人）', NULL, 1926
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《人民代表法》修正，妇女获得与男性平等的选举权（21岁）', NULL, 1928
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选，工党首次成为第一大党（拉姆齐·麦克唐纳首相）', NULL, 1929
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1919年《住房法》（艾迪生法案），国家补贴地方政府建造公共住房（目标50万套，实际建成约20万套），标志国家承担住房责任。', NULL, 1919
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1920年《失业保险费法》，将失业保险扩大到几乎所有工人（此前只覆盖部分行业）', NULL, 1920
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1921年《英爱条约》，爱尔兰南部26郡成立"爱尔兰自由邦"（英联邦自治领），北爱尔兰6郡选择留在英国。', NULL, 1921
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1925年《金本位法》，重返金本位（战前平价），导致英镑高估，出口受挫，失业率上升。', NULL, 1925
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1927年《劳资争议法》，总罢工后通过，宣布总罢工非法，限制工会政治捐款。', NULL, 1927
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1928年《人民代表法》，妇女获得与男性平等的选举权（21岁），实现成年普选。', NULL, 1928
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1929年10月，华尔街崩盘，英国出口受挫。', NULL, 1929
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1931年5月，麦克唐纳政府财政危机（预算赤字、黄金储备外流）', NULL, 1931
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1931年8月，麦克唐纳组建"国民内阁"（工党分裂，保守党和自由党加入）', NULL, 1931
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1931年9月，英国放弃金本位（英镑贬值30%）', NULL, 1931
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '渥太华帝国会议，实施帝国特惠制（保护主义）', NULL, 1932
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《特别区法》（Special Areas Act），对高失业地区进行干预。', NULL, 1934
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '重整军备加速（因德国威胁）', NULL, 1936
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1939年9月3日，对德宣战（二战爆发）', NULL, 1939
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1931年《国家经济法》，放弃金本位后，英镑贬值，出口竞争力恢复。', NULL, 1931
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1932年《进口关税法》，结束自由贸易传统，对非英联邦商品征收10%关税。', NULL, 1932
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1932年《渥太华协定》，帝国特惠制，英联邦内部贸易享受优惠关税。', NULL, 1932
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1934年《特别区法》，对高失业地区（苏格兰、威尔士、东北英格兰）提供财政补贴和区域发展支持，标志国家主动干预区域经济。', NULL, 1934
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1936年《公共健康法》，重组地方公共卫生体系。', NULL, 1936
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1939年《兵役法》，和平时期首次实行征兵制（因德国威胁）', NULL, 1939
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1939年9月3日，对德宣战。', NULL, 1939
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1940年5月，张伯伦下台，丘吉尔任首相（战时联合政府）', NULL, 1940
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '不列颠之战（德国空袭英国，英国皇家空军保卫领空）', NULL, 1940
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《大西洋宪章》（丘吉尔与罗斯福签署，提出战后"免于匮乏的自由"）', NULL, 1941
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《贝弗里奇报告》（《社会保险与相关服务》）发表，提出"五大恶"（匮乏、疾病、无知、肮脏、懒惰）和全民社保方案。', NULL, 1942
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《教育法》（巴特勒法案）通过。', NULL, 1944
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945年5月8日，欧洲胜利日（VE Day）', NULL, 1945
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945年7月，大选，工党压倒性胜选（艾德礼接替丘吉尔）', NULL, 1945
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1940年《紧急权力法》，政府获得全面管制权力（比一战DORA更广泛）', NULL, 1940
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1941年《基本物资与产业法》，国家全面控制原材料、能源、运输。', NULL, 1941
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1942年《贝弗里奇报告》，提出全民社保方案（统一缴费、统一待遇、覆盖所有人），成为战后福利国家的蓝图。', NULL, 1942
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1944年《教育法》（巴特勒法案），将义务教育年龄提高到15岁（后1947年提高到15岁），建立三级教育体系（文法、技术、现代中学）', NULL, 1944
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1944年《就业政策白皮书》，政府承诺维持"高且稳定的就业水平"，标志充分就业成为政府目标。', NULL, 1944
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945年《家庭补助法》，为第二个及后续子女提供现金补助（家庭津贴）', NULL, 1945
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1945年7月，工党压倒性胜选（393席，保守党213席）', NULL, 1945
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国民保险法、国民医疗服务法、新城镇法通过。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '煤炭国有化、电力国有化、交通国有化；英镑可兑换危机（被迫放弃）', NULL, 1947
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '国民医疗服务体系（NHS）正式启动（7月5日）；铁路国有化。', NULL, 1948
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英镑贬值（从4.03美元贬至2.80美元）', NULL, 1949
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（工党微弱多数，315席）', NULL, 1950
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '钢铁国有化（引发上院争议）；工党下台（保守党丘吉尔上台）', NULL, 1951
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1946年《国民保险法》，整合所有社会保险（失业、疾病、养老、工伤、丧偶），统一缴费、统一待遇，覆盖所有人。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1946年《国民医疗服务法》，创建NHS（1948年7月5日启动），免费医疗（医生和医院服务），资金来自一般税收。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1946年《新城镇法》，创建新城镇（如斯蒂文尼奇、克劳利），解决战后住房短缺和人口疏散。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1946年《煤炭工业国有化法》，将煤矿（约800个煤矿，70万工人）收归国有。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1947年《交通法》，将铁路、公路运输、运河、码头收归国有（创建英国交通委员会）', NULL, 1947
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1947年《电力法》，将电力供应收归国有（创建英国电力管理局）', NULL, 1947
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1949年《钢铁法》，将钢铁工业收归国有（引发上院争议，最终通过议会法强制通过）', NULL, 1949
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1948年《国家援助法》，为无家可归者、贫困家庭提供住房和基本生活保障（最后一块福利拼图）', NULL, 1948
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '丘吉尔保守党上台（但接受福利国家和国有化）', NULL, 1951
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英国首次核试验成功（成为第三个核国家）', NULL, 1952
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '伊丽莎白二世加冕（帝国向英联邦转型的象征）', NULL, 1953
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '苏伊士运河危机（英国入侵埃及，美国逼迫撤军，标志英国不再是世界强国）', NULL, 1956
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '麦克米伦"从未如此美好"演讲（宣称英国"从未如此繁荣"）', NULL, 1957
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（保守党麦克米伦胜选，口号"生活更美好"）', NULL, 1959
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英国加入欧洲自由贸易联盟（EFTA，对欧洲共同市场的回应）', NULL, 1960
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '普罗富莫事件（战争大臣性丑闻，暴露政治腐败）', NULL, 1963
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（工党威尔逊以微弱多数上台，结束13年保守党统治）', NULL, 1964
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '保守党保持NHS和国有化基本框架，但废除了钢铁国有化（1953年《钢铁法》）和部分道路运输国有化。', NULL, 1951
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '食物配给制完全取消（最后取消的是肉类和培根）', NULL, 1954
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1956年《清洁空气法》，应对1952年伦敦烟雾事件（约4000人死亡），禁止燃煤取暖，标志环境立法开端。', NULL, 1956
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1959年《城镇发展法》，继续推进新城镇建设（1950-1964年建成约100万套公共住房）', NULL, 1959
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英国首次申请加入欧洲经济共同体（EEC），被戴高乐否决（1963年再次被否）', NULL, 1961
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1963年《贝钦报告》，提出大学扩张计划（"罗宾斯原则"），为高等教育大众化奠定基础。', NULL, 1963
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工党威尔逊上台（微弱多数，口号"技术白热化"）', NULL, 1964
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（工党多数，94席）', NULL, 1966
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英镑贬值（从2.80美元贬至2.40美元）；第二次申请加入EEC被戴高乐否决。', NULL, 1967
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '北爱尔兰民权运动开始，后演变为"动乱"（The Troubles）', NULL, 1968
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（保守党希思上台）', NULL, 1970
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '希思政府推行"罗姆尼法案"（限制工会）', NULL, 1971
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '煤矿罢工（导致"三日工作周"）', NULL, 1972
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1973年1月，英国加入欧洲经济共同体（EEC）', NULL, 1973
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '石油危机、矿工罢工（1974年2月，希思宣布大选"谁统治英国？"）', NULL, 1973
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工党威尔逊上台（少数政府，后多数）', NULL, 1974
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, 'IMF危机（英国向国际货币基金组织借款39亿美元）', NULL, 1976
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"不满之冬"（Winter of Discontent），大规模罢工（卡车司机、垃圾工人、护士）', NULL, 1978
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1979年3月，工党政府不信任案通过（1票之差），大选撒切尔胜选。', NULL, 1979
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1965年《城乡规划法》，建立"绿化带"政策，限制城市扩张。', NULL, 1965
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1967年《堕胎法》、《同性恋犯罪法》（沃尔芬登报告），社会自由主义立法，标志"道德解放"', NULL, 1967
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1968年《唐纳森报告》，推动高等教育扩张（创建"新大学"如沃里克、约克等）', NULL, 1968
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1971年《劳资关系法》（罗姆尼法案），限制工会权利（罢工前须投票、设立国家劳资关系法院），引发工会激烈反抗，1974年工党上台后废除。', NULL, 1971
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1972年《工业法》，希思"U型转弯"，为破产企业提供国家补贴（如克莱德造船、罗尔斯·罗伊斯）', NULL, 1972
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '加入EEC公投（67%支持，33%反对）', NULL, 1975
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, 'IMF紧缩计划（削减公共支出，限制货币供应增长）', NULL, 1976
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1979年5月，撒切尔保守党胜选（339席）', NULL, 1979
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '初期衰退（失业率从5%升至10%以上）', NULL, 1980
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '364名经济学家联名反对撒切尔经济政策（公开信）', NULL, 1981
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '福克兰群岛战争（阿根廷入侵，英国出兵获胜，提振撒切尔声望）', NULL, 1982
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（保守党压倒性胜选，397席）', NULL, 1983
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '矿工大罢工（全国矿工工会，持续近一年，最终失败）', NULL, 1984
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英美签署"里根-撒切尔"经济宣言（自由市场、减税、放松监管）', NULL, 1985
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '金融大爆炸（Big Bang），放松伦敦金融城监管。', NULL, 1986
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（保守党胜选，376席）', NULL, 1987
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '人头税（社区税）在苏格兰提前实施（引发大规模抗税）', NULL, 1989
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '人头税在英格兰和威尔士实施（大规模抗议，百万英镑抗税）；11月撒切尔被迫辞职（因党内不信任投票）', NULL, 1990
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1980年《住房法》，规定公共住房租户有权购买所租住房（"购买权"），到1990年售出约150万套公共住房。', NULL, 1980
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1980年《就业法》，限制工会权利（缩小工会豁免范围、限制纠察）', NULL, 1980
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1980年《竞争法》，废除价格和收入管制（1970年代延续）', NULL, 1980
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1982年《就业法》，进一步限制工会（工会领导须直选、罢工前须投票）', NULL, 1982
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1984年《电信法》，私有化英国电信（BT），开启私有化浪潮。', NULL, 1984
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1984年《工会法》，要求罢工前举行会员投票（秘密投票），进一步削弱工会。', NULL, 1984
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1986年《金融服务法》（金融大爆炸），放松伦敦金融城监管（取消固定佣金、允许外资进入、分业经营限制放松）', NULL, 1986
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1988年《教育改革法》，引入全国统一课程、学校选择权（家长择校）、学校脱离地方教育当局（"拨款学校"）', NULL, 1988
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1989-1990年《社区税法》（人头税），取代房产税，按人头征收（每人统一金额），引发大规模抗议，1993年被废除。', NULL, 1989
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '私有化清单，英国电信（1984）、英国燃气（1986）、英国航空（1987）、钢铁（1988）、电力（1990-1991）、自来水（1989），国有部门占GDP比重从1979年的约20%降至1990年的约5%。', NULL, 1984
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1990年11月，约翰·梅杰接任首相（党内选举，击败迈克尔·赫塞尔廷）', NULL, 1990
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英国参与第一次海湾战争。', NULL, 1991
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1992年4月，大选（保守党胜选，336席，梅杰"出乎意料"获胜）', NULL, 1992
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1992年9月，黑色星期三（英国被迫退出欧洲汇率机制ERM，英镑贬值15%）', NULL, 1992
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '保守党内欧洲问题公开分裂（"马斯特里赫特叛军"）', NULL, 1993
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '工党领袖约翰·史密斯去世，托尼·布莱尔接任，开始"新工党"改革。', NULL, 1994
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '梅杰辞去党魁（重新参选，以微弱优势击败约翰·雷德伍德）', NULL, 1995
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1997年5月，大选，工党压倒性胜选（418席，保守党165席），梅杰辞职。', NULL, 1997
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1990年《社区税废除法》，废除人头税（撒切尔遗产），恢复房产税（但税率上限被限制）', NULL, 1990
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1991年《公民宪章》，梅杰的"第三条道路"，强调公共服务质量和消费者权利（但被批评为"空谈"）', NULL, 1991
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1992年《马斯特里赫特条约》批准，英国加入欧洲联盟（EU），但获得"选择退出"（opt-out）社会宪章和单一货币。', NULL, 1992
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1993年《铁路法》，私有化英国铁路（1994-1997年分拆为100多家公司），是撒切尔未完成的私有化（撒切尔反对私有化铁路）', NULL, 1993
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1994年《地方政府法》，引入"强制性竞争招标"，地方政府服务外包。', NULL, 1994
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1994年《北爱尔兰和平进程》，英爱联合声明（唐宁街宣言），开启北爱尔兰和平进程（1998年《贝尔法斯特协议》）', NULL, 1994
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1997年5月，布莱尔压倒性胜选（418席，保守党165席），结束18年保守党统治。', NULL, 1997
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '戴安娜王妃去世（8月31日），布莱尔称"人民的王妃"，赢得公众信任。', NULL, 1997
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《贝尔法斯特协议》（耶稣受难日协议）签署，北爱尔兰和平进程突破。', NULL, 1998
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '苏格兰和威尔士权力下放（议会成立）', NULL, 1999
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '上院改革（废除世袭贵族在议会的自动席位）', NULL, 1999
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '油价抗议（燃油税抗议，全国性交通瘫痪）', NULL, 2000
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（工党胜选，413席，保守党166席）', NULL, 2001
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，9·11袭击后，布莱尔坚定支持美国，派兵阿富汗。', NULL, 2001
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '伊拉克战争（布莱尔支持美国入侵伊拉克，英国派兵4.6万）', NULL, 2003
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大选（工党胜选，355席，保守党198席）', NULL, 2005
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2007年6月，布莱尔辞职（因伊拉克战争支持率下降，党内压力），戈登·布朗接任。', NULL, 2007
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '赋予英格兰银行独立（设定利率的权力），货币政策与财政政策分离。', NULL, 1997
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '大规模公共支出增长（NHS预算翻倍、教育预算增长60%、交通投资增加）', NULL, 1997
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1998年《人权法》，将《欧洲人权公约》纳入英国法律（1998年通过，2000年生效）', NULL, 1998
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1998年《苏格兰法》《威尔士政府法》《北爱尔兰法》，权力下放（苏格兰议会、威尔士议会、北爱尔兰议会）', NULL, 1998
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1998年《贝尔法斯特协议》，北爱尔兰和平协议（权力共享、释放政治犯、北爱尔兰议会）', NULL, 1998
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1999年《上院法》，废除世袭贵族在议会的自动席位（保留92名世袭贵族作为过渡）', NULL, 1999
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1999年《金融服务与市场法》，整合金融监管（金融服务管理局FSA成立，取代分业监管）', NULL, 1999
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2000年《信息自由法》，赋予公民获取政府信息的权利。', NULL, 2000
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2003年《高等教育法》，引入大学学费（上限3000英镑/年），引发学生抗议。', NULL, 2003
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2004年《民事合伙法》，承认同性伴侣关系（2005年生效）', NULL, 2004
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2007年9月，北岩银行挤兑（Northern Rock），英国首次银行挤兑事件（1866年以来）', NULL, 2007
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2008年9月，雷曼兄弟倒闭，英国银行业危机（苏格兰皇家银行、哈利法克斯银行国有化）', NULL, 2008
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2008年10月，布朗政府推出银行救助计划（5000亿英镑：担保、注资、购买资产）', NULL, 2008
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2010年5月，大选（无多数党议会，保守党306席，工党258席，自由民主党57席），卡梅伦-克莱格联合政府成立。', NULL, 2010
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '紧缩计划（削减公共支出、提高增值税、冻结公共部门工资）', NULL, 2010
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英国干预利比亚（卡梅伦推动）', NULL, 2011
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2014年9月，苏格兰独立公投（55%反对独立，45%支持）', NULL, 2014
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2015年5月，大选（保守党胜选，330席，卡梅伦多数政府）', NULL, 2015
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2016年6月23日，脱欧公投（51.9%支持脱欧，48.1%支持留欧）', NULL, 2016
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2016年7月，卡梅伦辞职，特蕾莎·梅接任首相。', NULL, 2016
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2008-2009年银行救助，苏格兰皇家银行（RBS）和哈利法克斯银行（HBOS）国有化，注资约1200亿英镑。', NULL, 2008
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2009年《银行法》，建立特别解决机制（SRR），处理濒临倒闭的银行。', NULL, 2009
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2010-2015年紧缩计划，削减公共支出（约810亿英镑），包括福利削减（住房福利、残疾福利）、地方当局预算削减40%、公共部门工资冻结（2010-2015年）', NULL, 2010
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2011年《健康与社会保障法》，NHS改革（增加私人部门竞争），引发争议。', NULL, 2011
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2011年《固定任期议会法》，固定议会任期（5年），废除首相提前大选的权力（后2022年废除）', NULL, 2011
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2012年《福利改革法》，引入"通用福利"（Universal Credit），合并六种福利，削减福利支出。', NULL, 2012
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2013年《婚姻法》，同性婚姻合法化（英格兰和威尔士）', NULL, 2013
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2014年《苏格兰独立公投法》，授权苏格兰独立公投（2014年9月18日）', NULL, 2014
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2015年《欧盟公投法》，授权脱欧公投（2016年6月23日）', NULL, 2015
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2017年6月，大选（特蕾莎·梅提前大选，保守党失去多数，318席，依靠民主统一党DUP支持）', NULL, 2017
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '脱欧谈判僵局（梅的"脱欧协议"三次被议会否决）', NULL, 2017
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2019年7月，鲍里斯·约翰逊接任首相。', NULL, 2019
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2019年12月，大选（约翰逊胜选，365席，工党202席，保守党"红墙"突破）', NULL, 2019
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2020年1月31日，英国正式脱欧（过渡期至2020年12月31日）', NULL, 2020
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '新冠疫情（多次封锁、大规模财政刺激、疫苗接种计划）', NULL, 2020
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '英国与欧盟签署《贸易与合作协定》（圣诞夜协议）', NULL, 2021
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022年2月，俄乌战争爆发，能源价格飙升，通胀达40年高点（11.1%）', NULL, 2022
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022年7月，约翰逊辞职（因"派对门"丑闻和党内不信任）', NULL, 2022
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022年9月，莉兹·特拉斯接任首相（9月6日），推出"迷你预算"（9月23日），引发金融市场危机（英镑跌至1.03美元，国债收益率飙升），特拉斯辞职（10月20日，任期44天，英国最短命首相）', NULL, 2022
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022年10月，里希·苏纳克接任首相（首位印度裔首相）', NULL, 2022
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '苏纳克稳定经济（通胀从11%降至4%），但保守党支持率持续低迷。', NULL, 2023
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2024年7月4日，大选，工党压倒性胜选（基尔·斯塔默，411席，保守党121席），结束14年保守党统治。', NULL, 2024
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2017-2019年脱欧谈判，梅政府与欧盟达成《脱欧协议》（北爱尔兰"后备协议"），三次被议会否决。', NULL, 2017
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2019年《脱欧协议法》（约翰逊），与欧盟达成新协议（北爱尔兰议定书），2020年1月31日正式脱欧。', NULL, 2019
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2020年《新冠疫情应对法》，政府获得紧急权力（封锁、关闭企业、限制集会），财政刺激总额约4000亿英镑（休假计划、企业贷款、自雇支持）', NULL, 2020
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2021年《贸易与合作协定》，英国与欧盟达成零关税、零配额贸易协定（但增加边境检查和文书工作）', NULL, 2021
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2022年"迷你预算"（特拉斯），大规模减税（取消45%最高税率、削减国民保险、取消公司税上调），未附带支出削减计划，引发金融市场恐慌，大部分措施在10月被撤销。', NULL, 2022
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2023年《北爱尔兰议定书法》（温莎框架），苏纳克与欧盟达成新协议，解决北爱尔兰贸易问题（"温莎框架"）', NULL, 2023
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2023年《非法移民法》，苏纳克政府推动的"卢旺达计划"（将非法移民送往卢旺达），引发人权争议（最高法院2023年裁定非法）', NULL, 2023
FROM history_country c
WHERE c.country_code = 'GB';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '独立战争结束，美国在《邦联条例》下运作。邦联政府无权征税、无权管理州际贸易，财政濒临崩溃，各州互相设立关税，内乱频发（如谢斯起义，1786-1787）。', NULL, 1783
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '制宪会议在费城召开。核心争论，詹姆斯·麦迪逊与亚历山大·汉密尔顿主张废除邦联，建立强有力的联邦政府，拥有征税、征兵、管理州际贸易的权力，反联邦主义者（如帕特里克·亨利）担心强中央政府会复辟暴政，要求保留州权、加入权利法案。', NULL, 1787
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '妥协产物，宪法确立联邦主权，但通过参议院平等代表制（每州两席）和《权利法案》（1791年批准）安抚反联邦派。', NULL, 1791
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '汉密尔顿作为首任财政部长，推出"大计划"，联邦承接各州战争债务（增强联邦信用。', NULL, 1790
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '建立第一合众国银行（1791年），仿照英格兰银行，发行统一货币、管理财政；', NULL, 1791
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '提出制造业报告，主张保护性关税、国家基建、鼓励工业发展。', NULL, 1780
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '杰斐逊-麦迪逊的反击，托马斯·杰斐逊认为汉密尔顿的路线将造就"英格兰式的贵族与贫民"，主张重农、限权、州权。1790年代形成联邦党（汉密尔顿）与民主共和党（杰斐逊）的政党雏形。', NULL, 1790
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1800年革命，杰斐逊当选总统，自称"1800年革命"。主要措施，废除《客籍法和镇压叛乱法》（联邦党压制言论的法律，削减联邦开支、裁撤内陆税收（包括威士忌税）、缩小陆军和海军。', NULL, 1800
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '允许第一合众国银行特许状在1811年到期后不再续签（银行被废除）。', NULL, 1811
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '路易斯安那购地。杰斐逊面临巨大矛盾：宪法未明文授权总统购买领土，但他为了西部扩张的机会，以"条约权力"为名完成交易，使美国领土翻倍。此举被批评者认为严重背离其"限权政府"原则。', NULL, 1803
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第二次独立战争（对英战争）。暴露了废除银行、缺乏中央财政和军事准备的弊端：战争期间政府濒临破产、各州拒绝配合联邦征兵。', NULL, 1812
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '战后民族主义高涨，麦迪逊（原杰斐逊派）签署法案，建立第二合众国银行，并授权联邦内部改善（基建拨款）。民主共和党实质上部分继承了联邦党的政策。', NULL, 1816
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '杰克逊就任总统。他自视为"普通人"的代言人，敌视一切他认为的特权机构。', NULL, 1829
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第二合众国银行行长尼古拉斯·比德尔寻求提前续签特许状（原1836年到期）。国会通过续签法案，但杰克逊否决。否决演说中，他谴责银行是"贵族阶层的工具"，声称只有"彻底平等"才能保护民主。', NULL, 1832
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '杰克逊进一步行动，将联邦存款从第二合众国银行撤出，存入各州"宠物银行"（亲政府的州立银行）。此举引发金融市场混乱。', NULL, 1833
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《硬币流通令》规定购买联邦土地必须用金银币支付，旨在遏制投机，但加速了1837年大恐慌（金融危机）。', NULL, 1836
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '马丁·范布伦执政期间，大恐慌演变为长期萧条。范布伦提出"独立国库制度"（联邦资金与所有银行脱钩），这是杰克逊反银行逻辑的延续。', NULL, 1837
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '南北战争期间，共和党控制的国会（南方民主党缺席）通过一系列立法，《宅地法》（1862年）：联邦向定居者免费授予160英亩西部土地，推动西部开发；', NULL, 1862
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '南北战争期间，共和党控制的国会（南方民主党缺席）通过一系列立法，《太平洋铁路法案》（1862年）：联邦以土地赠予和贷款补贴的方式，资助联合太平洋铁路与中央太平洋铁路修建横贯大陆铁路（1869年合龙）；', NULL, 1862
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '南北战争期间，共和党控制的国会（南方民主党缺席）通过一系列立法，《莫里尔土地赠予法案》（1862年）：联邦向各州赠地，用于建立"赠地大学"（如康奈尔、麻省理工等前身），推动农业与技术教育；', NULL, 1862
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '南北战争期间，共和党控制的国会（南方民主党缺席）通过一系列立法，国家银行法（1863年）：建立联邦特许的国家银行体系，发行统一货币（绿背纸币），为战争筹款，也部分恢复了中央金融监管。', NULL, 1863
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '南北战争期间，共和党控制的国会（南方民主党缺席）通过一系列立法，1865年后，战争结束，但联邦政府的积极角色并未完全退潮。共和党主导的"激进重建"时期，联邦军队驻扎南方，强制推行黑人公民权、选举权（第十四、第十五修正案，1868、1870）。', NULL, 1865
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '海斯-蒂尔登妥协，联邦军队撤出南方，重建结束。此后联邦政府基本放弃对南方的干预，放任种族隔离。', NULL, 1877
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '铁路大扩张，联邦通过土地赠予和贷款补贴了约1.8亿英亩土地给铁路公司，造就了范德比尔特、古尔德等铁路大亨；', NULL, 1870
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '垄断形成，洛克菲勒（标准石油）、卡内基（钢铁）、摩根（金融）通过信托、控股公司等方式形成托拉斯，控制全国80-90%的行业份额；', NULL, 1870
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '社会达尔文主义，威廉·萨姆纳等学者宣扬"适者生存"，主张政府不应干预贫富分化。', NULL, 1870
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '最高法院通过"正当程序"条款（第十四修正案）保护企业，在"圣克拉拉县诉南太平洋铁路公司"（1886）中，判定公司享有"自然人"权利；', NULL, 1886
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '联邦政府极少干预市场，仅通过《州际商业法》（1887）和《谢尔曼反托拉斯法》（1890）进行象征性监管，但早期执行几乎为零。', NULL, 1887
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1877年铁路大罢工，联邦出动军队镇压，开启联邦干预劳工运动的先例；', NULL, 1877
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1894年普尔曼罢工，克利夫兰总统派遣联邦军队，司法部以"阻碍邮件"为由逮捕工会领袖德布斯；', NULL, 1894
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '民粹主义运动兴起，农民联盟、平民党（人民党）抗议铁路垄断、高关税、金本位剥削农民。', NULL, 1870
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1893年大恐慌，因铁路投机过度、金本位下的货币紧缩引发大萧条，持续四年，失业率一度达20%。', NULL, 1893
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '西奥多·罗斯福继任总统（麦金莱遇刺）。他提出"公平交易"（Square。', NULL, 1901
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '起诉北方证券公司（摩根控制的铁路垄断），最高法院1904年裁定解散；', NULL, 1902
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《纯净食品与药品法》《肉类检查法》（厄普顿·辛克莱《屠场》揭露食品业乱象后推动）；', NULL, 1906
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '推动联邦干预煤矿罢工（1902年），首次以"仲裁者"身份介入劳资纠纷。', NULL, 1902
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '塔夫脱（罗斯福继任）与罗斯福决裂，共和党分裂。民主党伍德罗·威尔逊当选，提出"新自由"（New。', NULL, 1912
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '联邦储备法——建立联邦储备系统，终结了自杰克逊时代以来近80年无中央银行的状态；', NULL, 1913
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '联邦贸易委员会法与克莱顿反托拉斯法——明确禁止价格歧视、捆绑销售等行为，并豁免工会反垄断起诉（承认工会合法性）；', NULL, 1914
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第十六修正案（1913年）批准，授权联邦征收所得税（取代关税作为主要财政收入）。', NULL, 1913
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '美国参加一战。联邦政府通过"战时工业委员会"大规模干预生产、定价、劳工关系，联邦预算从1916年的7亿美元飙升至1919年的180亿美元。', NULL, 1917
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '沃伦·哈定当选，提出"回归常态"（Return to Normalcy），意指回归战前的小政府、低税收、高关税状态。', NULL, 1920
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '哈定政府大幅削减所得税（最高税率从73%降至25%），削减联邦预算，放松进步时代的监管。', NULL, 1921
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '卡尔文·柯立芝继任，延续放松路线。他名言"美国的事业就是商业"。', NULL, 1923
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1920年代特征，汽车、收音机、家电消费爆发，但依赖分期付款（信贷扩张。', NULL, 1920
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '佛罗里达地产泡沫（1925-1926）崩盘；', NULL, 1925
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '股市投机狂热，道琼斯指数从1921年的60多点涨至1929年9月的381点，保证金交易（借钱炒股）盛行；', NULL, 1921
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '联邦监管极度松弛，美联储在投机热潮中未能有效收紧货币，反而在1927年降息（应欧洲要求稳定金本位）。', NULL, 1927
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '农业萧条，整个1920年代，农产品价格因战后需求下降而持续低迷，农民未分享繁荣。', NULL, 1920
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1929年10月，黑色星期四（10月24日）、黑色星期二（10月29日），股市崩盘，大萧条开始。', NULL, 1929
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '赫伯特·胡佛总统（共和党，签署《斯穆特-霍利关税法》（1930），大幅提高关税，引发全球贸易战，加剧萧条；', NULL, 1930
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '赫伯特·胡佛总统（共和党，成立复兴金融公司（1932），向银行、铁路、保险公司提供紧急贷款（"向企业注资，等待涓滴"），但未直接救助失业者；', NULL, 1932
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '赫伯特·胡佛总统（共和党，1932年，失业率达25%，数千家银行倒闭，民众爆发"奖金军"抗议（一战老兵讨要补贴，被麦克阿瑟将军武力驱散）。', NULL, 1932
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '1933年3月，富兰克林·罗斯福就任，开启"百日新政"（1933年3-6月），银行休整，宣布全国银行休业，通过《紧急银行法》重组银行体系，联邦救助，建立联邦紧急救济署，直接向各州拨款救助失业者，创造就业，民间资源保护队（CCC，雇佣青年从事环保项目）、公共工程管理局（PWA，大规模基建，农业调整法（AAA），政府补贴农民减产，以提高农产品价格（争议：减产政策在萧条初期遭批评，田纳西河流域管理局（TVA），联邦直接成立公司，在贫困地区建设水坝、发电、防洪，是区域规划与公共电力的标志性实验。', NULL, 1933
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '证券法（1933）与证券交易法（1934），建立证券交易委员会（SEC），监管股市。', NULL, 1933
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"第二新政"启动，《社会保障法》（1935年8月），建立养老金制度（退休保险）、失业保险、对贫困儿童和盲人的救助。这是美国历史上第一个永久性联邦福利体系；', NULL, 1935
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"第二新政"启动，《瓦格纳法》（国家劳动关系法），明确工人有权组织工会、集体谈判，成立国家劳动关系委员会（NLRB）保护工会权利；', NULL, 1935
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"第二新政"启动，《税收法》（1935），提高高收入者与企业税率（被称为"财富税法案"）。', NULL, 1935
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"第二新政"启动，1936年，罗斯福以压倒性优势连任。但最高法院频繁推翻新政立法（如AAA、NIRA），罗斯福提出"法院填塞计划"（1937）——试图增加大法官人数——引发激烈反对，但随后最高法院态度转变，开始认可新政立法。', NULL, 1936
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"第二新政"启动，1937-1938年，罗斯福削减开支后经济二次探底（"罗斯福萧条"），失业率回升。随后通过《公平劳动标准法》（1938），确立联邦最低工资、最长工时（44小时/周）、禁止童工。', NULL, 1937
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '"第二新政"启动，1941-1945年，二战动员。联邦通过"战时生产委员会"全面规划经济：价格管制、物资配给、军工产能扩张。联邦预算从1940年的90亿美元增至1945年的980亿美元。战争彻底结束了大萧条，失业率降至近零。', NULL, 1941
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《就业法》——标志性立法。联邦政府承诺"利用一切手段"促进最大就业、生产和购买力。成立经济顾问委员会，将凯恩斯主义（政府通过财政政策调节经济）正式纳入联邦政策框架。', NULL, 1946
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '塔夫脱-哈特利法——共和党控制的国会通过，限制工会权力（允许总统下令80天"冷却期"制止罢工、禁止工会政治捐款），是对《瓦格纳法》的修正，但未动摇福利国家基本盘。', NULL, 1947
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '艾森豪威尔（共和党）延续新政遗产，1956年，《联邦援助公路法》——拨款250亿美元（当时巨资），建设州际公路系统（4.1万英里），是史上最大公共工程；', NULL, 1956
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '艾森豪威尔（共和党）延续新政遗产，维持最高税率在90%左右（高收入阶层），未试图废除社保；', NULL, 1950
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '艾森豪威尔（共和党）延续新政遗产，艾森豪威尔名言，"如果任何政党试图废除社保、劳工法、农业项目，你在我这一代不会再听到那个政党。"', NULL, 1950
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '林登·约翰逊"伟大社会"计划（1964-1966，1964年，《民权法》——禁止种族歧视，赋予联邦政府强制执行民权的权力；', NULL, 1964
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '林登·约翰逊"伟大社会"计划（1964-1966，1965年，《投票权法》——废除南方对黑人投票的限制；', NULL, 1965
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '林登·约翰逊"伟大社会"计划（1964-1966，1965年，建立医疗保险（Medicare，覆盖65岁以上老人）与医疗补助（Medicaid，覆盖穷人），这是自1935年社保法以来最大的福利扩张；', NULL, 1965
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '林登·约翰逊"伟大社会"计划（1964-1966，1965年，《中小学教育法》——联邦首次大规模资助中小学教育；', NULL, 1965
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '林登·约翰逊"伟大社会"计划（1964-1966，1966年，示范城市计划、住房与城市发展部成立。', NULL, 1966
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '尼克松（共和党）宣布"新经济政策"，暂停美元与黄金兑换（结束布雷顿森林体系），实施90天工资与物价冻结。尼克松名言"我们现在都是凯恩斯主义者"。', NULL, 1971
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '石油输出国组织（OPEC）石油禁运，油价暴涨四倍。阿拉伯石油禁运（因赎罪日战争）暴露美国能源脆弱性。', NULL, 1973
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '严重衰退，GDP下降3.2%，失业率达9%。同时通胀持续高企（"滞胀"一词流行）。', NULL, 1973
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '第二次石油危机（伊朗革命），油价再翻倍，通胀率突破13%。', NULL, 1979
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '凯恩斯主义主张，衰退时应减税增支；通胀时应加税减支。滞胀发生时，无法同时应对两个问题；', NULL, 1970
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '尼克松-福特-卡特政府尝试各种干预（工资-物价指导线、能源管制），但效果有限，公众形成"政府无能"印象。', NULL, 1970
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '卡特任命保罗·沃尔克任美联储主席。沃尔克大幅加息（联邦基金利率最高达20%），以剧烈衰退为代价压制通胀（1981-1982年失业率达10.8%）。', NULL, 1979
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，最高所得税率从70%降至50%，后降至28%（1986年税改）；', NULL, 1986
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，企业投资加速折旧；', NULL, 1981
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，大幅削减国内社会项目支出（食品券、住房补贴、职业教育），但增加国防开支（对抗苏联）。', NULL, 1981
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，1981年：摧毁空中交通管制员工会（PATCO罢工）。里根解雇1.1万名罢工的联邦雇员，被视为向劳工运动的公开宣战，标志着战后工会权力巅峰的终结。', NULL, 1981
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，废除石油价格管制（1981年）；', NULL, 1981
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，大幅削减环保署、职业安全与健康管理局的执法力度；', NULL, 1981
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，放松储蓄贷款协会监管（1982年《加恩-圣日耳曼法》），直接导致1980年代末储蓄贷款协会危机（纳税人承担约1500亿美元救助成本）。', NULL, 1982
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，1987年：里根任命艾伦·格林斯潘任美联储主席，开启长达19年的"格林斯潘时代"（以宽松监管、低通胀优先著称）。', NULL, 1987
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '里根就任总统。首年推动《经济复苏税法，1987年10月："黑色星期一"——道指单日暴跌22.6%（史上最大单日跌幅）。但美联储迅速注入流动性，市场未引发系统性崩盘，被视为新自由主义"市场弹性"的验证案例。', NULL, 1987
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '比尔·克林顿当选，提出"第三条道路"——声称超越传统左右，主张"机会而非权利""责任而非依赖"。', NULL, 1992
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《综合预算协调法》——克林顿推动增税（最高税率从31%提至39.6%）与减支，1998年实现联邦预算盈余（自1969年以来首次）。', NULL, 1993
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '共和党"金里奇革命"控制国会，福利改革成为核心议程。克林顿两次否决激进版本，但最终签署《个人责任与工作机会协调法》（1996年，废除1935年建立的"对有子女家庭的援助计划"（AFDC，即传统现金救济）；', NULL, 1935
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '共和党"金里奇革命"控制国会，福利改革成为核心议程。克林顿两次否决激进版本，但最终签署《个人责任与工作机会协调法》（1996年，改为"贫困家庭临时援助"（TANF），设置终身领取上限（5年）、强制工作要求；', NULL, 1994
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '共和党"金里奇革命"控制国会，福利改革成为核心议程。克林顿两次否决激进版本，但最终签署《个人责任与工作机会协调法》（1996年，克林顿宣称"终结我们已知的福利"。', NULL, 1994
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '克林顿签署《金融服务现代化法》（废除《格拉斯-斯蒂格尔法》1933，1933年法案将商业银行、投资银行、保险业务分离（防止1929年风险混业）；', NULL, 1933
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '克林顿签署《金融服务现代化法》（废除《格拉斯-斯蒂格尔法》1933，1999年废除后，金融业全面混业经营，为2008年金融危机埋下结构隐患。', NULL, 1999
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '克林顿签署《金融服务现代化法》（废除《格拉斯-斯蒂格尔法》1933，自由贸易，克林顿推动《北美自由贸易协定》（NAFTA，1994年生效）与支持中国加入世界贸易组织（WTO，2000年），将自由贸易视为新自由主义核心支柱。', NULL, 1994
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '乔治·W·布什当选。推动《经济增长与减税协调法》（2001、2003），将最高所得税率从39.6%降至35%，降低资本利得税、股息税，废除遗产税（后延长）。', NULL, 2000
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，《爱国者法案》（2001年）：大幅扩张联邦监控与执法权力；', NULL, 2001
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，国土安全部成立（2002年）：联邦政府二战以来最大规模重组；', NULL, 2002
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，阿富汗战争（2001-2021）与伊拉克战争（2003-2011），军费开支激增（至2011年，两战总成本约2万亿美元）。', NULL, 2001
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，布什政府反对任何对衍生品（尤其是信用违约掉期CDS）的监管；', NULL, 2001
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，证券交易委员会（SEC）2004年放松投资银行杠杆率限制（五大投行杠杆率达30-40倍）；', NULL, 2004
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，次级抵押贷款爆炸式增长（不审查收入、零首付、可调利率），金融创新缺乏透明监管。', NULL, 2001
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，2005年：布什推动《防止滥用破产与消费者保护法》，使消费者更难通过破产减免债务（信用卡公司等金融机构推动）。', NULL, 2005
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '2001年9月11日，恐怖袭击。随后，2007-2008年：次贷危机爆发。2008年9月，雷曼兄弟倒闭（财政部长保尔森拒绝救助），引发全球金融危机。', NULL, 2007
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '布什与奥巴马政府应对危机，问题资产救助计划（TARP，2008年10月），7000亿美元用于救助银行、汽车公司（通用、克莱斯勒）；', NULL, 2008
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '布什与奥巴马政府应对危机，美联储量化宽松（QE），购买国债与抵押贷款支持证券，注入流动性。', NULL, 2008
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '奥巴马就任后推动 《美国复苏与再投资法》（ARRA，7870亿美元），基建投资、绿色能源补贴、教育支出、对州政府转移支付（避免裁减教师、警察，被批评者称为"大政府回归"，但规模（约占GDP 5%）远小于大萧条时期。', NULL, 2009
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '奥巴马签署 《多德-弗兰克华尔街改革与消费者保护法》，建立消费者金融保护局（CFPB，设立金融稳定监督委员会，将大型非银行金融机构纳入监管，沃尔克规则，限制银行自营交易（投机性投资，但法案未能拆分大银行，也未能重建《格拉斯-斯蒂格尔法》的严格防火墙。', NULL, 2010
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '《平价医疗法案》（ACA，奥巴马医改）通过，建立医保交易所，要求个人购买医保（"个人强制令，扩大Medicaid覆盖范围。', NULL, 2010
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '是美国自1965年Medicare以来最大规模医保扩张，但未建立全民医保。', NULL, 1965
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '政治反制，2010年"茶党"运动兴起，要求减税、废除奥巴马医改、削减债务。共和党在2010年中期选举中横扫众议院，开启持续的"财政悬崖"僵局（2011年债务上限危机，美国信用评级首次被标普下调）。', NULL, 2010
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '唐纳德·特朗普就任。推动《减税与就业法》（2017），企业所得税从35%降至21%，个人所得税临时减免，但主要惠及高收入阶层。', NULL, 2017
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '未削减福利支出，联邦赤字大幅扩张（2019年突破1万亿美元）。', NULL, 2019
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '贸易政策转向，特朗普放弃自由贸易共识，退出《跨太平洋伙伴关系协定》（TPP，重新谈判《北美自由贸易协定》为《美墨加协定》（USMCA。', NULL, 2017
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '对中国发动贸易战（2018-2019），加征数千亿美元关税。', NULL, 2018
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '新冠疫情冲击。特朗普与拜登政府连续推出《冠状病毒援助、救济与经济安全法》（CARES，2.2万亿美元）、《美国救助计划》（1.9万亿美元）等，联邦财政赤字达GDP的15%以上（二战以来最高）。', NULL, 2020
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '乔·拜登推动"拜登经济学，《两党基础设施法》（2021），1.2万亿美元投资公路、桥梁、宽带、电网；', NULL, 2021
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '乔·拜登推动"拜登经济学，《芯片与科学法》（2022），提供约520亿美元补贴国内半导体制造，开启"产业政策"回归；', NULL, 2022
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '乔·拜登推动"拜登经济学，《通胀削减法》（2022），3690亿美元补贴清洁能源（太阳能、电动车、电池），附加处方药价格谈判（Medicare首次获准谈判药价）；', NULL, 2022
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '乔·拜登推动"拜登经济学，标志着放弃1990年代"不干预产业"的新自由主义原则，转向国家主导的战略产业扶持。', NULL, 1990
FROM history_country c
WHERE c.country_code = 'US';

INSERT INTO history_event (country_id, summary_zh, summary_en, start_year)
SELECT c.id, '乔·拜登推动"拜登经济学，2025年后，特朗普再次当选后，推出"对等关税"政策，对全球贸易伙伴加征高额关税，标志着美国彻底放弃二战后的自由贸易框架。', NULL, 2025
FROM history_country c
WHERE c.country_code = 'US';
