/*
  静态内容配置文件。
  你后续主要改这个文件，就能更新网站内容。

  关键字段说明：
  - images：一篇笔记的全部图片路径；可以放 ./assets/xxx.jpg，也可以放线上图片地址。
  - coverIndex：封面图序号，从 0 开始。例如 coverIndex: 1 表示用 images 里的第 2 张做封面。
  - comments：评论区数据；replies 是楼中楼回复。评论总数会自动递归统计。
  - baseLikes/baseFavorites：初始点赞、收藏数。访客点击后的变化会保存在自己浏览器的 localStorage 里。
*/

window.SITE_DATA = {
  categories: ["推荐", "穿搭", "美食", "彩妆", "影视", "职场", "情感", "家居", "游戏", "旅行", "健身"],
  placeholderPages: {
    live: {
      title: "直播功能待开发",
      text: "这里先保留直播入口。后续可以接入直播列表、预约卡片、直播间预告等静态或动态模块。"
    },
    publish: {
      title: "发布功能待开发",
      text: "GitHub Pages 没有后端数据库，真正的用户投稿需要接入后端或第三方服务。目前可以先通过修改 js/data.js 手动发布笔记。"
    },
    notice: {
      title: "通知功能待开发",
      text: "这里可以后续加入点赞、收藏、评论提醒等前端展示框架。"
    },
    me: {
      title: "个人主页待开发",
      text: "后续可以做个人资料、作品列表、收藏夹、关注列表等静态页面。"
    },
    more: {
      title: "更多功能框架",
      text: "可以继续扩展设置、夜间模式、帮助中心、友情链接等功能。"
    },
    about: {
      title: "关于我们",
      text: "这里预留网站介绍、联系方式、版权说明、免责声明等内容。"
    },
    creator: {
      title: "创作中心待开发",
      text: "这里可以做选题管理、数据看板、内容规范、图片尺寸建议等页面。"
    },
    business: {
      title: "业务合作待开发",
      text: "这里可以放合作介绍、表单入口、联系方式、案例展示等内容。"
    }
  },
  posts: [
    {
      id: "p001",
      title: "为了这种日子，我愿意把云朵熨平",
      category: "推荐",
      author: "晴天保管员",
      avatar: "assets/avatars/avatar-1.svg",
      location: "江苏",
      date: "4天前",
      type: "image",
      baseLikes: 6897,
      baseFavorites: 232,
      images: [
        "assets/examples/post-1-cover.png",
        "assets/examples/post-1-2.png",
        "assets/examples/post-1-3.png"
      ],
      coverIndex: 0,
      content: "蓝天、草帽、奔跑的小孩，还有一个努力把平凡日子抱紧的人。\n\n有时候幸福不是烟花，是午后风吹过来，心里轻轻说：就这样吧，也很好。",
      tags: ["晴天", "温柔日常", "动画截图"],
      comments: [
        {
          user: "云朵售票员",
          avatar: "assets/avatars/avatar-2.svg",
          text: "这组图像把夏天泡进蜂蜜里了。",
          time: "4天前",
          likes: 26,
          replies: [
            { user: "晴天保管员", avatar: "assets/avatars/avatar-1.svg", text: "是的，甜到需要配一杯无糖冰水。", time: "3天前", likes: 18, replies: [] },
            { user: "momo", avatar: "assets/avatars/avatar-3.svg", text: "小孩跑过去那张，快乐已经先我一步下班。", time: "2天前", likes: 12, replies: [] }
          ]
        },
        {
          user: "风也路过",
          avatar: "assets/avatars/avatar-4.svg",
          text: "第三张突然变燃，生活：偶尔也要开大招。",
          time: "1天前",
          likes: 31,
          replies: []
        }
      ]
    },
    {
      id: "p002",
      title: "被羊群包围的人类，嘴角会自动开花",
      category: "旅行",
      author: "草地小分队",
      avatar: "assets/avatars/avatar-2.svg",
      location: "广东",
      date: "昨天",
      type: "image",
      baseLikes: 2368,
      baseFavorites: 88,
      images: ["assets/examples/post-2-cover.png"],
      coverIndex: 0,
      content: "今日份治愈：小朋友闯进毛茸茸宇宙，羊群负责柔软，草地负责发光。\n\n看完只想请假去牧场，职位是临时摸羊官。",
      tags: ["牧场", "治愈", "快乐库存"],
      comments: [
        { user: "奶泡羊毛", avatar: "assets/avatars/avatar-3.svg", text: "这不是牧场，这是软乎乎的充电站。", time: "8小时前", likes: 41, replies: [] },
        { user: "路过的草莓", avatar: "assets/avatars/avatar-5.svg", text: "小朋友笑得太亮，太阳都要续费。", time: "5小时前", likes: 19, replies: [] }
      ]
    },
    {
      id: "p003",
      title: "天空冒险守则：成功以后先大喊一声",
      category: "影视",
      author: "风之见习生",
      avatar: "assets/avatars/avatar-3.svg",
      location: "北京",
      date: "2天前",
      type: "image",
      baseLikes: 997,
      baseFavorites: 41,
      images: [
        "assets/examples/post-3-cover.png",
        "assets/examples/post-3-2.png"
      ],
      coverIndex: 0,
      content: "第一张是少年把风抓住，第二张是反派把表情包演活。\n\n冒险的尽头也许没有宝藏，但一定有一句：成功啦。",
      tags: ["冒险", "天空", "童话感"],
      comments: [
        { user: "会飞的便当", avatar: "assets/avatars/avatar-4.svg", text: "第一张好自由，像周五下午五点半。", time: "1天前", likes: 33, replies: [] },
        { user: "帽子别跑", avatar: "assets/avatars/avatar-1.svg", text: "第二张笑得太有事业心了。", time: "12小时前", likes: 17, replies: [
          { user: "风之见习生", avatar: "assets/avatars/avatar-2.svg", text: "反派：我也要上年度喜剧榜。", time: "刚刚", likes: 6, replies: [] }
        ] }
      ]
    },
    {
      id: "p004",
      title: "废墟里点一盏小灯，夜色就坐下来听故事",
      category: "情感",
      author: "月光修补匠",
      avatar: "assets/avatars/avatar-4.svg",
      location: "福建",
      date: "4天前",
      type: "image",
      baseLikes: 421,
      baseFavorites: 19,
      images: ["assets/examples/post-4-cover.png"],
      coverIndex: 0,
      content: "石头很冷，夜很蓝，但两个人坐在一起，世界就有了小小的壁炉。\n\n重要的事常常不是轰轰烈烈，是有人愿意陪你把沉默坐暖。",
      tags: ["夜晚", "陪伴", "小灯"],
      comments: [
        { user: "晚风慢慢", avatar: "assets/avatars/avatar-1.svg", text: "这张好安静，像一句没说出口的晚安。", time: "3小时前", likes: 22, replies: [] },
        { user: "口袋月亮", avatar: "assets/avatars/avatar-3.svg", text: "小灯一亮，废墟都变温柔了。", time: "1小时前", likes: 16, replies: [] }
      ]
    },
    {
      id: "p005",
      title: "三口之家登场，背景光都自动鼓掌",
      category: "家居",
      author: "抱抱研究所",
      avatar: "assets/avatars/avatar-5.svg",
      location: "上海",
      date: "今天",
      type: "image",
      baseLikes: 60,
      baseFavorites: 7,
      images: ["assets/examples/post-5-cover.png"],
      coverIndex: 0,
      content: "一个高冷大人，一个开心小孩，一只端庄大白狗。\n\n这画面像家庭相册首页：严肃负责撑场面，可爱负责把世界搅成奶油。",
      tags: ["家庭感", "可爱", "治愈"],
      comments: [
        { user: "软糖观察员", avatar: "assets/avatars/avatar-1.svg", text: "小孩举手那一下，快乐已经溢出屏幕。", time: "3小时前", likes: 28, replies: [] },
        { user: "白狗绅士", avatar: "assets/avatars/avatar-4.svg", text: "狗狗的领结很有年会主持风范。", time: "2小时前", likes: 14, replies: [] }
      ]
    },
    {
      id: "p006",
      title: "早八暂停，梦乡小队正在加载",
      category: "情感",
      author: "被窝诗人",
      avatar: "assets/avatars/avatar-2.svg",
      location: "浙江",
      date: "5小时前",
      type: "image",
      baseLikes: 1204,
      baseFavorites: 153,
      images: ["assets/examples/post-6-cover.png"],
      coverIndex: 0,
      content: "睡帽、枕头、小玩偶，全都到齐。\n\n这不是赖床，这是把灵魂放进云朵里回炉重造。请勿打扰，除非带早餐。",
      tags: ["晚安", "赖床文学", "被窝"],
      comments: [
        { user: "闹钟已阵亡", avatar: "assets/avatars/avatar-3.svg", text: "看到这张图，我的起床计划当场辞职。", time: "1小时前", likes: 35, replies: [] },
        { user: "早餐来敲门", avatar: "assets/avatars/avatar-5.svg", text: "除非是热豆浆，否则别叫醒她。", time: "42分钟前", likes: 11, replies: [] }
      ]
    },
    {
      id: "p007",
      title: "玻璃那边的小朋友，眼睛里有十万颗星",
      category: "彩妆",
      author: "星星收纳盒",
      avatar: "assets/avatars/avatar-3.svg",
      location: "河南",
      date: "昨天",
      type: "image",
      baseLikes: 503,
      baseFavorites: 64,
      images: [
        "assets/examples/post-7-cover.png",
        "assets/examples/post-7-2.png"
      ],
      coverIndex: 0,
      content: "隔着圆圆的窗，她把惊喜贴成两只小手印。\n\n第二张又笑成了春天，感觉整个房间都被可爱袭击了。",
      tags: ["星星眼", "可爱暴击", "笑容"],
      comments: [
        { user: "闪光捕手", avatar: "assets/avatars/avatar-2.svg", text: "这个眼睛亮度，建议接入城市照明系统。", time: "昨天", likes: 44, replies: [] },
        { user: "快乐管理员", avatar: "assets/avatars/avatar-4.svg", text: "第二张太甜了，牙医看了沉默。", time: "9小时前", likes: 25, replies: [] }
      ]
    },
    {
      id: "p008",
      title: "今天的笑容，是牧场限定甜度",
      category: "推荐",
      author: "羊毛云事务所",
      avatar: "assets/avatars/avatar-5.svg",
      location: "江苏",
      date: "2天前",
      type: "image",
      baseLikes: 21,
      baseFavorites: 3,
      images: ["assets/examples/post-8-cover.png"],
      coverIndex: 0,
      content: "草地亮晶晶，小孩笑眯眯，旁边的羊负责把烦恼嚼碎。\n\n如果快乐有质地，大概就是这一身软软的羊毛。",
      tags: ["牧场日记", "笑容", "治愈"],
      comments: [
        { user: "今天也很软", avatar: "assets/avatars/avatar-4.svg", text: "想把这张设成工作日急救包。", time: "7小时前", likes: 32, replies: [] },
        { user: "草地邮递员", avatar: "assets/avatars/avatar-2.svg", text: "羊：本场景由我们赞助可爱。", time: "6小时前", likes: 18, replies: [] }
      ]
    },
    {
      id: "p009",
      title: "今日份小狗：尾巴负责写诗，爪爪负责盖章",
      category: "推荐",
      author: "小狗放映室",
      avatar: "assets/avatars/my-avatar.png",
      location: "上海",
      date: "刚刚",
      type: "video",
      baseLikes: 128,
      baseFavorites: 18,
      images: ["assets/examples/post-9-cover.mp4"],
      coverIndex: 0,
      content: "一条小狗路过生活，把今天摇成了晴天。\n\n画面还没开始，心已经自动蹲下：你好呀，毛茸茸的小导演。",
      tags: ["狗狗", "可爱视频", "生活小甜饼"],
      comments: [
        { user: "汪汪翻译机", avatar: "assets/avatars/avatar-1.svg", text: "它一出现，我的烦恼自动装睡。", time: "刚刚", likes: 12, replies: [] },
        { user: "爪印收藏家", avatar: "assets/avatars/avatar-3.svg", text: "建议授予今日快乐最佳主演。", time: "刚刚", likes: 8, replies: [] }
      ]
    }
  ]
};
