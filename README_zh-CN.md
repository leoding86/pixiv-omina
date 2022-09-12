### 简体中文 | [**English**](https://github.com/leoding86/pixiv-omina) | [**Türkçe**](https://github.com/Tarik366/pixiv-omina/blob/master/README_tr-TR.md)

---

<h1 style="text-align:center">
<img src="./build/icon.png" width=200><br>
Pixiv Omina
</h1>

Pixiv Omina 是一个用于下载Pixiv上作品的工具，简单易用。如果你正在使用 [Pixiv Toolkit](https://github.com/leoding86/webextension-pixiv-toolkit) 游览器扩展，那么你还可以使用它的一键下载功能。

Pixiv Omina 是由 [Electron](https://electronjs.org/) 驱动。

# 平台💻

在 Windows 10(1903) 测试。理论上可以在Mac和Linux上运行，如果你会编译的话。

# 特色✨

* 简单易用的界面
* 自动将动图生成为GIF图片，并且可以将动图帧信息打包进动图压缩包
* 下载画师的所有作品（通过在下载链接中输入画师个人信息链接）
* 丰富的重命名设置
* 重启程序后自动恢复下载
* 能够跳过已下载好的作品（通过保存文件的名称），从而实现增量下载
* 一键下载 (你需要在你的浏览器中安装 [Pixiv Toolkit](https://github.com/leoding86/webextension-pixiv-toolkit)）
* 自动检查更新（不会自动更新，因为有时候自动更新会很恼人）
* 关闭程序到状态栏（需要在设置中开启）
* 支持http以及socks代理设置（如果使用socks代理需要输入完整的代理地址，包括协议）

# 下载⚓

[前往下载页面](https://github.com/leoding86/pixiv-omina/releases)

# Q & A ❓

Q：我为什么不能使用它下载作品？

A：如果你不能访问 Pixiv 或者没有一个 Pixiv 账号，那么你可能不用使用 Pixiv Omina 下载作品。

Q：为什么当我重启程序以后，看不到已完成的下载？

A：目前为了节省程序占用的内存，重启程序后，只会添加未完成的任务到程序中。

Q：怎么样同时下载2个以上的任务？

A：目前不能办到，因为生产动图作品的GIF图片会占用相当多的资源。可能以后会添加相关的设置。

# 已知问题🤔

* 不要一次同时添加过多的任务！我并没有测试同时下载多个作品的限制，但是如果同时添加很多的任务可能会使程序崩溃。而且通过下载画师所有作品的功能可能会一次性添加非常非常多的下载任务，所以使用此功能时要谨慎（有些画师有上千个作品，太猛了）。

* 有时候在Windows 10安装程序没有正确注册自定义协议。如果你发现Pixiv工具箱中的“Pixiv Omina”按钮没有作用是，可以试试`panteras81`在问题`#27`中的[评论](https://github.com/leoding86/webextension-pixiv-toolkit/issues/27#issuecomment-605540955)中的解决办法。

如果你发现了问题或有什么想法欢迎提交issue😀

# 截图📺

通过作品链接下载

![screenshot](./screenshots/001.gif)

一键下载

![screenshot](./screenshots/002.gif)

部分设置

![screenshot](./screenshots/003.jpg)

# 开发🔧

## 安装依赖
```bash
yarn
```

### 开发脚本

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```
