![nai-plugin](https://socialify.git.ci/CikeyQi/nai-plugin/image?description=1&font=Raleway&forks=1&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto)

<img decoding="async" align=right src="resources/readme/girl.png" width="35%">

# NAI-PLUGIN🍓

- 一个适用于 [Yunzai 系列机器人框架](https://github.com/yhArcadia/Yunzai-Bot-plugins-index) 的 AI 绘图插件，让你在输入框中拥有便捷的 AI 绘画体验

- 使用强大的 [NovelAI](https://novelai.net) 作为后端，**付费**使用，生成的质量高，能够模仿指定画师画风生成图片

- **使用中遇到问题请加 QQ 群咨询：[707331865](https://qm.qq.com/q/TXTIS9KhO2)**

> [!TIP]
> 继 [MJ-PLUGIN](https://github.com/CikeyQi/mj-plugin) 的下一个 AI 绘图插件，这时 [枣子](https://github.com/erzaozi) 已经是开发主力啦，往后很多插件都会和他一起开发（什么复杂的事全部丢给他罢！），我也很开心的说~

## 安装插件

#### 1. 克隆仓库

```
git clone https://github.com/CikeyQi/nai-plugin.git ./plugins/nai-plugin
```

> [!NOTE]
> 如果你的网络环境较差，无法连接到 Github，可以使用 [GitHub Proxy](https://mirror.ghproxy.com/) 提供的文件代理加速下载服务
>
> ```
> git clone https://mirror.ghproxy.com/https://github.com/CikeyQi/nai-plugin.git ./plugins/nai-plugin
> ```

#### 2. 安装依赖

```
pnpm install --filter=nai-plugin
```

## 插件配置

> [!WARNING]
> 非常不建议手动修改配置文件，本插件已兼容 [Guoba-plugin](https://github.com/guoba-yunzai/guoba-plugin) ，请使用锅巴插件对配置项进行修改

<details> <summary>获取 Token</summary>

1. 登录 [NovelAI](https://novelai.net/login)

2. 打开 [NovelAI](https://novelai.net/stories)

3. 复制 Token</br><img src="./resources/readme/tokenstep.gif" width="100%" height="100%" alt="get_token">

</details>

百度翻译请自行前往 [翻译开放平台](https://api.fanyi.baidu.com/api/trans/product/desktop) 获取 `APP ID` 和 `密钥`

腾讯云审核配置文档：[Yumi 文档](https://docs.yunzai.art/plugins/nai-plugin/configuration/configuration2.html)

## 功能列表

请使用 `/nai --help` 获取完整帮助

- [x] 基本生成图片
- [x] 绑定画风
- [x] 查找历史图片
- [x] 图片超分
- [x] 查询账户余额
- [x] 队列轮询账号

## 常见问题

1. 代理怎么配置
   - 代理请在 `正向代理` 和 `反向代理` 中选择一个
   - 正向代理需要服务器有代理软件，填写代理地址和端口即可
   - 反向代理只需要填写地址即可
   - 使用作者提供反向代理请在 **图片代理** 填写`https://nai3.pages.dev/base_url`，在 **接口代理** 处填写`https://nai3.pages.dev/user_url`

## 支持与贡献

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力， 当然，你可以对我 [爱发电](https://afdian.net/a/sumoqi) 赞助，呜咪~❤️

有意见或者建议也欢迎提交 [Issues](https://github.com/CikeyQi/nai-plugin/issues) 和 [Pull requests](https://github.com/CikeyQi/nai-plugin/pulls)。

## 许可证

本项目使用 [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) 作为开源许可证。
