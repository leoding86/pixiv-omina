<h1 style="text-align:center">
<img src="./build/icon.png" width=200><br>
Pixiv Omina
</h1>

Pixiv Omina is a software to download works on Pixiv. It's simple and easy to use. It's even better if you are a [Pixiv Toolkit](https://github.com/leoding86/webextension-pixiv-toolkit) user, you can use click-to-download feature.

Pixiv Omina is powered by [Electron](https://electronjs.org/).

Pixiv Omina 是一个用于下载Pixiv上作品的工具，简单易用。如果你正在使用 [Pixiv Toolkit](https://github.com/leoding86/webextension-pixiv-toolkit) 游览器扩展，那么你还可以使用它的一键下载功能。

Pixiv Omina 是由 [Electron](https://electronjs.org/) 驱动。

# Platforms💻

Test on Window 10(1903). In theory, it can run on Mac and Linux if you can compile it.

# 平台💻

在 Windows 10(1903) 测试。理论上可以在Mac和Linux上运行，如果你会编译的话。

# Features✨

* Easy UI
* Generate gif for ugoira work automatically and pack frame information to zip file
* Download user works (input the user profile url to the download dialog)
* Auto rename using the rename settings
* Restore downloads after application restart
* Skip downloaded works, so it can download works incrementally
* Click-to-Download (You need install [Pixiv Toolkit](https://github.com/leoding86/webextension-pixiv-toolkit) in your browser)
* Check new version automatically (No auto-update, I think auto-update could be annoying sometimes)
* Close to tray (You need to enable this feature at setting page)
* Support http/socks proxy (If you use socks proxy you need input proxy url with schemel)

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

# Downloads⚓

[Go to releases page](https://github.com/leoding86/pixiv-omina/releases)

# 下载⚓

[前往下载页面](https://github.com/leoding86/pixiv-omina/releases)

# Q & A ❓

Q: Why named it Pixiv Omina?

A: Nothing special, the name just came out my mind when I wanted to build it.

Q: Why I can't use it?

A: If you can't visit Pixiv or you don't have a Pixiv account you can't use this.

Q: Why is the completed task missing when I restart the application?

A: Application will remove completed downloads task after restarted.

Q: How to download more than 2 works at the same time?

A: No, you can't for now, because generate gif is a pretty heavy task. Maybe I'll add a setting to control how many download tasks can be performed at the same time.

# Q & A ❓

Q：为什么起 Pixiv Omina 这个名字？

A：没啥，就是在开发的时候突然想起来的。

Q：我为什么不能使用它下载作品？

A：如果你不能访问 Pixiv 或者没有一个 Pixiv 账号，那么你可能不用使用 Pixiv Omina 下载作品。

Q：为什么当我重启程序以后，看不到已完成的下载？

A：目前为了节省程序占用的内存，重启程序后，只会添加未完成的任务到程序中。

Q：怎么样同时下载2个以上的任务？

A：目前不能办到，因为生产动图作品的GIF图片会占用相当多的资源。可能以后会添加相关的设置。

# Known Issues🤔

* DO NOT add too many downloads! I have not tested the downloads limitation, too many downloads may crash the application. It's easy to add large number download tasks by downloading user works(input the user profile url to the download dialog), so be really careful to use this feature like download multiple users works at same time (Some of the users have thousands works, It's nuts!).

* The installation will not register the custom protocol on Window 10 sometimes. If you find the Pixiv Toolkit's "Pixiv Omina" button does nothing, you can try `panteras81`'s solution in [comment](https://github.com/leoding86/webextension-pixiv-toolkit/issues/27#issuecomment-605540955) from issue `#27`.

Feel free to open issue if you meet any problem or have any idea😀

# 已知问题🤔

* 不要一次同时添加过多的任务！我并没有测试同时下载多个作品的限制，但是如果同时添加很多的任务可能会使程序崩溃。而且通过下载画师所有作品的功能可能会一次性添加非常非常多的下载任务，所以使用此功能时要谨慎（有些画师有上千个作品，太猛了）。

* 有时候在Windows 10安装程序没有正确注册自定义协议。如果你发现Pixiv工具箱中的“Pixiv Omina”按钮没有作用是，可以试试`panteras81`在问题`#27`中的[评论](https://github.com/leoding86/webextension-pixiv-toolkit/issues/27#issuecomment-605540955)中的解决办法。

如果你发现了问题或有什么想法欢迎提交issue😀

# Screenshots（截图）📺

Download by input the work url（通过作品链接下载）

![screenshot](./screenshots/001.gif)

Click-to-Download（一键下载）

![screenshot](./screenshots/002.gif)

Some settings（部分设置）

![screenshot](./screenshots/003.jpg)

# Development（开发）🔧

## Install dependencies（安装依赖）
```bash
yarn
```

### Development Scripts（开发脚本）

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
