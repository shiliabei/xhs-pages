from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, g, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DB_DIR = BASE_DIR / "data"
DB_PATH = DB_DIR / "app.db"

app = Flask(__name__, static_folder=None)
app.config["SECRET_KEY"] = "local-xhs-demo-change-me"

CATEGORIES = ["推荐", "穿搭", "美食", "彩妆", "影视", "职场", "情感", "家居", "游戏", "旅行", "健身"]

SEED_POSTS = [
    {
        "id": "p001",
        "title": "为了这种晴天，我愿意把云朵熬成糖",
        "category": "推荐",
        "author": "晴天保管员",
        "avatar": "assets/avatars/avatar-1.svg",
        "location": "江苏",
        "date": "4 天前",
        "type": "image",
        "baseLikes": 6897,
        "baseFavorites": 232,
        "images": ["assets/examples/post-1-cover.png", "assets/examples/post-1-2.png", "assets/examples/post-1-3.png"],
        "coverIndex": 0,
        "content": "蓝天、草帽、奔跑的小孩，还有一个努力把平凡日子抱紧的人。\n\n有时候幸福不是烟花，是午后风吹过来，心里轻轻说：就这样吧，也很好。",
        "tags": ["晴天", "温柔日常", "动画截图"],
        "comments": [
            ("云朵售票员", "assets/avatars/avatar-2.svg", "这组图像把夏天泡进蜂蜜里了。"),
            ("风也路过", "assets/avatars/avatar-4.svg", "第三张突然变燃，生活偶尔也要开大招。"),
        ],
    },
    {
        "id": "p002",
        "title": "被羊群包围的人类，嘴角会自动开花",
        "category": "旅行",
        "author": "草地小分队",
        "avatar": "assets/avatars/avatar-2.svg",
        "location": "广东",
        "date": "昨天",
        "type": "image",
        "baseLikes": 2368,
        "baseFavorites": 88,
        "images": ["assets/examples/post-2-cover.png"],
        "coverIndex": 0,
        "content": "今日份治愈：小朋友闯进毛茸茸宇宙，羊群负责柔软，草地负责发光。",
        "tags": ["牧场", "治愈", "快乐库存"],
        "comments": [("奶泡羊毛", "assets/avatars/avatar-3.svg", "这不是牧场，这是软乎乎的充电站。")],
    },
    {
        "id": "p003",
        "title": "天空冒险守则：成功以后先大喊一声",
        "category": "影视",
        "author": "风之见习生",
        "avatar": "assets/avatars/avatar-3.svg",
        "location": "北京",
        "date": "2 天前",
        "type": "image",
        "baseLikes": 997,
        "baseFavorites": 41,
        "images": ["assets/examples/post-3-cover.png", "assets/examples/post-3-2.png"],
        "coverIndex": 0,
        "content": "第一张是少年把风抓住，第二张是反派把表情包演活。",
        "tags": ["冒险", "天空", "童话感"],
        "comments": [("会飞的便签", "assets/avatars/avatar-4.svg", "第一张好自由，像周五下午五点半。")],
    },
    {
        "id": "p004",
        "title": "废墟里点一盏小灯，夜色就坐下来听故事",
        "category": "情感",
        "author": "月光修补匠",
        "avatar": "assets/avatars/avatar-4.svg",
        "location": "福建",
        "date": "4 天前",
        "type": "image",
        "baseLikes": 421,
        "baseFavorites": 19,
        "images": ["assets/examples/post-4-cover.png"],
        "coverIndex": 0,
        "content": "石头很冷，夜很蓝，但两个人坐在一起，世界就有了小小的壁炉。",
        "tags": ["夜晚", "陪伴", "小灯"],
        "comments": [("晚风慢慢", "assets/avatars/avatar-1.svg", "这张好安静，像一句没说出口的晚安。")],
    },
    {
        "id": "p005",
        "title": "三口之家登场，背景光都自动鼓掌",
        "category": "家居",
        "author": "抱枕研究所",
        "avatar": "assets/avatars/avatar-5.svg",
        "location": "上海",
        "date": "今天",
        "type": "image",
        "baseLikes": 60,
        "baseFavorites": 7,
        "images": ["assets/examples/post-5-cover.png"],
        "coverIndex": 0,
        "content": "一个高冷大人，一个开心小孩，一只端庄大白狗。家庭相册首页就该这样。",
        "tags": ["家庭感", "可爱", "治愈"],
        "comments": [("软糖观察员", "assets/avatars/avatar-1.svg", "小孩举手那一下，快乐已经溢出屏幕。")],
    },
    {
        "id": "p006",
        "title": "早八暂停，梦乡小队正在加载",
        "category": "情感",
        "author": "被窝诗人",
        "avatar": "assets/avatars/avatar-2.svg",
        "location": "浙江",
        "date": "5 小时前",
        "type": "image",
        "baseLikes": 1204,
        "baseFavorites": 153,
        "images": ["assets/examples/post-6-cover.png"],
        "coverIndex": 0,
        "content": "睡帽、枕头、小玩偶，全都到齐。请勿打扰，除非带早餐。",
        "tags": ["晚安", "赖床文学", "被窝"],
        "comments": [("闹钟已阵亡", "assets/avatars/avatar-3.svg", "看到这张图，我的起床计划当场辞职。")],
    },
    {
        "id": "p007",
        "title": "玻璃那边的小朋友，眼睛里有十万颗星",
        "category": "彩妆",
        "author": "星星收纳盒",
        "avatar": "assets/avatars/avatar-3.svg",
        "location": "河南",
        "date": "昨天",
        "type": "image",
        "baseLikes": 503,
        "baseFavorites": 64,
        "images": ["assets/examples/post-7-cover.png", "assets/examples/post-7-2.png"],
        "coverIndex": 0,
        "content": "隔着圆圆的窗，她把惊喜贴成两只小手印。第二张又笑成了春天。",
        "tags": ["星星眼", "可爱暴击", "笑容"],
        "comments": [("闪光捕手", "assets/avatars/avatar-2.svg", "这个眼睛亮度，建议接入城市照明系统。")],
    },
    {
        "id": "p008",
        "title": "今天的笑容，是牧场限定甜度",
        "category": "推荐",
        "author": "羊毛云事务所",
        "avatar": "assets/avatars/avatar-5.svg",
        "location": "江苏",
        "date": "2 天前",
        "type": "image",
        "baseLikes": 21,
        "baseFavorites": 3,
        "images": ["assets/examples/post-8-cover.png"],
        "coverIndex": 0,
        "content": "草地亮晶晶，小孩笑眯眯，旁边的羊负责把烦恼嚼碎。",
        "tags": ["牧场日记", "笑容", "治愈"],
        "comments": [("今天也很软", "assets/avatars/avatar-4.svg", "想把这张设成工作日急救包。")],
    },
    {
        "id": "p009",
        "title": "今日份小狗：尾巴负责写诗，爪爪负责盖章",
        "category": "推荐",
        "author": "小狗放映室",
        "avatar": "assets/avatars/my-avatar.png",
        "location": "上海",
        "date": "刚刚",
        "type": "video",
        "baseLikes": 128,
        "baseFavorites": 18,
        "images": ["assets/examples/post-9-cover.mp4"],
        "coverIndex": 0,
        "content": "一条小狗路过生活，把今天摇成了晴天。",
        "tags": ["狗狗", "可爱视频", "生活小甜饼"],
        "comments": [("爪印收藏家", "assets/avatars/avatar-3.svg", "建议授予今日快乐最佳主演。")],
    },
]


def get_db() -> sqlite3.Connection:
    if "db" not in g:
        DB_DIR.mkdir(exist_ok=True)
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_: Exception | None = None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          avatar TEXT NOT NULL DEFAULT 'assets/avatars/my-avatar.png',
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          author TEXT NOT NULL,
          avatar TEXT NOT NULL,
          location TEXT,
          date_label TEXT,
          type TEXT NOT NULL,
          base_likes INTEGER NOT NULL DEFAULT 0,
          base_favorites INTEGER NOT NULL DEFAULT 0,
          images_json TEXT NOT NULL,
          cover_index INTEGER NOT NULL DEFAULT 0,
          content TEXT NOT NULL,
          tags_json TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id TEXT NOT NULL,
          user_id INTEGER,
          username TEXT NOT NULL,
          avatar TEXT NOT NULL,
          text TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS likes (
          user_id INTEGER NOT NULL,
          post_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          PRIMARY KEY (user_id, post_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS favorites (
          user_id INTEGER NOT NULL,
          post_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          PRIMARY KEY (user_id, post_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        );
        """
    )
    if db.execute("SELECT COUNT(*) FROM posts").fetchone()[0] == 0:
        seed_posts(db)
    db.commit()


def seed_posts(db: sqlite3.Connection) -> None:
    for post in SEED_POSTS:
        db.execute(
            """
            INSERT INTO posts (
              id, title, category, author, avatar, location, date_label, type,
              base_likes, base_favorites, images_json, cover_index, content, tags_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                post["id"],
                post["title"],
                post["category"],
                post["author"],
                post["avatar"],
                post["location"],
                post["date"],
                post["type"],
                post["baseLikes"],
                post["baseFavorites"],
                json.dumps(post["images"], ensure_ascii=False),
                post["coverIndex"],
                post["content"],
                json.dumps(post["tags"], ensure_ascii=False),
            ),
        )
        for username, avatar, text in post["comments"]:
            db.execute(
                """
                INSERT INTO comments (post_id, user_id, username, avatar, text, created_at)
                VALUES (?, NULL, ?, ?, ?, ?)
                """,
                (post["id"], username, avatar, text, "示例评论"),
            )


@app.before_request
def prepare_database() -> None:
    init_db()


def current_user() -> sqlite3.Row | None:
    user_id = session.get("user_id")
    if not user_id:
        return None
    return get_db().execute("SELECT id, username, avatar FROM users WHERE id = ?", (user_id,)).fetchone()


def require_user() -> sqlite3.Row:
    user = current_user()
    if not user:
        response = jsonify({"error": "请先登录"})
        response.status_code = 401
        raise UnauthorizedResponse(response)
    return user


class UnauthorizedResponse(Exception):
    def __init__(self, response):
        self.response = response


@app.errorhandler(UnauthorizedResponse)
def handle_unauthorized(error: UnauthorizedResponse):
    return error.response


def serialize_user(user: sqlite3.Row | None) -> dict | None:
    if not user:
        return None
    return {"id": user["id"], "username": user["username"], "avatar": user["avatar"]}


def serialize_post(row: sqlite3.Row, user_id: int | None) -> dict:
    db = get_db()
    post_id = row["id"]
    comment_rows = db.execute(
        """
        SELECT
          id,
          username,
          avatar,
          text,
          created_at AS createdAt,
          user_id = ? AS canDelete
        FROM comments
        WHERE post_id = ?
        ORDER BY id DESC
        """,
        (user_id, post_id),
    ).fetchall()
    like_extra = db.execute("SELECT COUNT(*) FROM likes WHERE post_id = ?", (post_id,)).fetchone()[0]
    favorite_extra = db.execute("SELECT COUNT(*) FROM favorites WHERE post_id = ?", (post_id,)).fetchone()[0]
    liked = bool(user_id and db.execute("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?", (user_id, post_id)).fetchone())
    favorited = bool(user_id and db.execute("SELECT 1 FROM favorites WHERE user_id = ? AND post_id = ?", (user_id, post_id)).fetchone())
    return {
        "id": post_id,
        "title": row["title"],
        "category": row["category"],
        "author": row["author"],
        "avatar": row["avatar"],
        "location": row["location"],
        "date": row["date_label"],
        "type": row["type"],
        "baseLikes": row["base_likes"],
        "baseFavorites": row["base_favorites"],
        "likeCount": row["base_likes"] + like_extra,
        "favoriteCount": row["base_favorites"] + favorite_extra,
        "images": json.loads(row["images_json"]),
        "coverIndex": row["cover_index"],
        "content": row["content"],
        "tags": json.loads(row["tags_json"]),
        "likedByMe": liked,
        "favoritedByMe": favorited,
        "commentCount": len(comment_rows),
        "comments": [dict(comment) for comment in comment_rows],
    }


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path: str):
    return send_from_directory(BASE_DIR, path)


@app.get("/api/me")
def me():
    return jsonify({"user": serialize_user(current_user())})


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    if not 2 <= len(username) <= 24:
        return jsonify({"error": "用户名长度需要在 2 到 24 个字符之间"}), 400
    if len(password) < 4:
        return jsonify({"error": "密码至少 4 位"}), 400
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
            (username, generate_password_hash(password), datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "用户名已经被注册"}), 409
    session["user_id"] = cursor.lastrowid
    return jsonify({"user": serialize_user(current_user())})


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    user = get_db().execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "用户名或密码不正确"}), 401
    session["user_id"] = user["id"]
    return jsonify({"user": serialize_user(user)})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.delete("/api/account")
def delete_account():
    user = require_user()
    db = get_db()
    db.execute("DELETE FROM likes WHERE user_id = ?", (user["id"],))
    db.execute("DELETE FROM favorites WHERE user_id = ?", (user["id"],))
    db.execute("DELETE FROM comments WHERE user_id = ?", (user["id"],))
    db.execute("DELETE FROM users WHERE id = ?", (user["id"],))
    db.commit()
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/posts")
def list_posts():
    user = current_user()
    rows = get_db().execute("SELECT * FROM posts ORDER BY rowid").fetchall()
    return jsonify({
        "categories": CATEGORIES,
        "posts": [serialize_post(row, user["id"] if user else None) for row in rows],
    })


@app.post("/api/posts/<post_id>/like")
def toggle_like(post_id: str):
    user = require_user()
    db = get_db()
    exists = db.execute("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?", (user["id"], post_id)).fetchone()
    if exists:
        db.execute("DELETE FROM likes WHERE user_id = ? AND post_id = ?", (user["id"], post_id))
        liked = False
    else:
        db.execute("INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)", (user["id"], post_id, datetime.now().isoformat(" ", "seconds")))
        liked = True
    db.commit()
    return jsonify({"liked": liked})


@app.post("/api/posts/<post_id>/favorite")
def toggle_favorite(post_id: str):
    user = require_user()
    db = get_db()
    exists = db.execute("SELECT 1 FROM favorites WHERE user_id = ? AND post_id = ?", (user["id"], post_id)).fetchone()
    if exists:
        db.execute("DELETE FROM favorites WHERE user_id = ? AND post_id = ?", (user["id"], post_id))
        favorited = False
    else:
        db.execute("INSERT INTO favorites (user_id, post_id, created_at) VALUES (?, ?, ?)", (user["id"], post_id, datetime.now().isoformat(" ", "seconds")))
        favorited = True
    db.commit()
    return jsonify({"favorited": favorited})


@app.post("/api/posts/<post_id>/comments")
def add_comment(post_id: str):
    user = require_user()
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"error": "评论不能为空"}), 400
    if len(text) > 300:
        return jsonify({"error": "评论最多 300 个字符"}), 400
    db = get_db()
    if not db.execute("SELECT 1 FROM posts WHERE id = ?", (post_id,)).fetchone():
        return jsonify({"error": "笔记不存在"}), 404
    db.execute(
        "INSERT INTO comments (post_id, user_id, username, avatar, text, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (post_id, user["id"], user["username"], user["avatar"], text, datetime.now().strftime("%Y-%m-%d %H:%M")),
    )
    db.commit()
    return jsonify({"ok": True})


@app.delete("/api/posts/<post_id>/comments/<int:comment_id>")
def delete_comment(post_id: str, comment_id: int):
    user = require_user()
    db = get_db()
    comment = db.execute(
        "SELECT user_id FROM comments WHERE id = ? AND post_id = ?",
        (comment_id, post_id),
    ).fetchone()
    if not comment:
        return jsonify({"error": "评论不存在"}), 404
    if comment["user_id"] != user["id"]:
        return jsonify({"error": "只能删除自己的评论"}), 403
    db.execute("DELETE FROM comments WHERE id = ? AND post_id = ?", (comment_id, post_id))
    db.commit()
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
