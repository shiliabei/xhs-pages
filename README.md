# 小蓝书本地测试版

这是一个本地可运行的小红书风格网页测试项目：

- 前端：`index.html`、`css/style.css`、`js/app.js`
- 后端：Python Flask
- 数据库：SQLite，自动生成在 `data/app.db`

已接入注册、登录、退出登录、注销账号、评论、点赞、收藏。点赞、评论、收藏都需要登录，刷新页面后数据仍会保留在本机 SQLite 数据库中。

## 本地准备

1. 确认电脑已安装 Python 3.8 或更新版本。
2. 在项目根目录创建虚拟环境：

```bash
python -m venv .venv
```

3. 激活虚拟环境：

```powershell
.\.venv\Scripts\Activate.ps1
```

4. 安装依赖：

```bash
pip install -r requirements.txt
```

如果安装依赖时网络较慢，可以改用镜像：

```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

如果 pip 报代理或 TLS 错误，通常是本机 pip/代理配置问题。可以先升级 pip，或临时关闭代理后再安装。

5. 启动后端：

```bash
python app.py
```

6. 浏览器打开：

```text
http://127.0.0.1:5000
```

第一次启动会自动创建 `data/app.db` 并写入示例笔记。

## 如何测试

1. 点击右上角“登录 / 注册”。
2. 先切换到注册，输入用户名和密码。
3. 打开任意笔记，测试点赞、收藏、发送评论。
4. 刷新浏览器，数据仍会保留。
5. 点击右上角“退出”可以退出登录。

## 注销账号如何实现

页面右上角登录后会出现“注销账号”按钮。点击确认后，后端会删除当前本地账号，并同步删除该账号产生的点赞、收藏和评论，然后清空登录状态。

对应后端接口是：

```http
DELETE /api/account
```

实现位置在 `app.py` 的 `delete_account()` 函数。因为这是本地测试版，注销只会影响你电脑上的 `data/app.db`，不会影响任何线上数据。

## 重置所有测试数据

停止 Flask 服务后，删除 `data/app.db`，再重新运行：

```bash
python app.py
```

系统会重新生成数据库和示例数据。
