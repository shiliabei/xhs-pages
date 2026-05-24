# 小蓝书风格 GitHub Pages 静态网站模板

![alt text](效果图片.png)

网站链接：[text](https://shiliabei.github.io/xhs-pages/)
网站链接：https://shiliabei.github.io/xhs-pages/

这是一个纯静态模板，适合直接部署到 GitHub Pages。它不需要数据库、不需要后端服务器，核心内容都在 `js/data.js` 里维护。

## 已完成的功能

- 左侧 5 栏导航：发现、直播、发布、通知、我
- “发现”页图文瀑布流卡片
- 顶部搜索功能：按标题、作者、正文、标签、分类筛选
- 分类标签：推荐、穿搭、美食、彩妆、影视、职场、情感、家居、游戏、旅行、健身
- 笔记详情弹窗
- 多图轮播
- 可通过 `coverIndex` 选择封面图
- 静态评论区和楼中楼回复
- 评论数量自动递归统计
- 点赞、收藏、评论数量展示
- 点赞、收藏支持本地点击状态，使用浏览器 localStorage 保存
- “更多、关于我们、创作中心、业务合作”等入口已预留框架
- 手机端和电脑端自适应布局

## 文件结构

```text
xhs-pages-demo/
├── index.html          # 页面骨架
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── data.js         # 内容数据，后续主要改这里
│   └── app.js          # 页面渲染和交互逻辑
└── assets/
    ├── avatars/        # 作者和评论头像
    └── examples/       # 示例封面图
```

## 本地预览

在项目根目录运行：

```bash
python -m http.server 8000
```

然后浏览器打开：

```text
http://localhost:8000/index.html
```

```text
如果浏览器还显示旧图或空白，按 Ctrl + F5 强制刷新一下缓存。
```


## 怎么添加一篇新笔记

打开 `js/data.js`，在 `posts: [ ... ]` 数组里新增一项：

```js
{
  id: "p009",
  title: "新笔记标题",
  category: "旅行",
  author: "作者名",
  avatar: "assets/avatars/avatar-1.svg",
  location: "厦门",
  date: "刚刚",
  type: "image",
  baseLikes: 100,
  baseFavorites: 20,
  images: [
    "assets/examples/your-image-1.jpg",
    "assets/examples/your-image-2.jpg"
  ],
  coverIndex: 0,
  content: "这里写正文。",
  tags: ["旅行", "厦门"],
  comments: [
    {
      user: "评论用户",
      avatar: "assets/avatars/avatar-2.svg",
      text: "这是一条评论。",
      time: "刚刚",
      likes: 0,
      replies: [
        {
          user: "回复用户",
          avatar: "assets/avatars/avatar-3.svg",
          text: "这是一条回复。",
          time: "刚刚",
          likes: 0,
          replies: []
        }
      ]
    }
  ]
}
```

## 怎么选择封面

`images` 里可以放多张图，`coverIndex` 表示用第几张作为首页卡片封面。

```js
images: ["1.jpg", "2.jpg", "3.jpg"],
coverIndex: 1
```

上面表示首页卡片封面使用第 2 张图，因为序号从 0 开始。

## 关于评论、点赞、收藏数量

- 评论数量不用手动填，会根据 `comments` 和 `replies` 自动统计。
- 点赞数量 = `baseLikes` + 当前浏览器是否点过赞。
- 收藏数量 = `baseFavorites` + 当前浏览器是否点过收藏。
- 由于 GitHub Pages 是静态站，别人访问后的点赞、收藏、评论不会写回服务器。

## 部署到 GitHub Pages

1. 新建一个仓库，例如 `你的用户名.github.io`。
2. 把本项目所有文件上传到仓库根目录。
3. 进入仓库 Settings → Pages。
4. Source 选择 Deploy from a branch。
5. Branch 选择 `main`，目录选择 `/root`。
6. 保存后等待几分钟，即可访问生成的网站。

## 如果后续要做真正动态功能

GitHub Pages 本身没有后端数据库。如果你想让访客真正发布内容、发表评论，并让所有人都能看到变化，可以考虑接入：

- Supabase：数据库、登录、评论、点赞都比较好做。
- Firebase：适合实时数据和用户系统。
- GitHub Issues + Giscus：适合把评论托管到 GitHub Discussions。
- 自己写后端：例如 Node.js / Python Flask / Django + 数据库。
