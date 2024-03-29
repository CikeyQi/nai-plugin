<p align="center">
  <a href="https://ap-plugin.com/"><img src="./resources/readme/header.png" width="100%" height="100%" alt="nai-plugin"></a>
</p>

<div align="center">

# NAI-PLUGIN

_🎉 基于 Yunzai-Bot 的 AI 绘图插件 🎉_
</br>
_🎉 使用 NovelAI 官方接口 🎉_

</div>

<span id="header"></span>

<p align="center">
  <img src="https://img.shields.io/badge/Nodejs-18.x+-6BA552.svg" alt="Nodejs">
  <img src="https://img.shields.io/badge/Yunzai_Bot-v3-red.svg" alt="NoneBot">
  <br>
  </a>
    <a href="https://qm.qq.com/q/RnQteOmD84">
    <img src="https://img.shields.io/badge/QQ%E7%BE%A4-%E7%8C%AB%E5%A8%98%E4%B9%90%E5%9B%AD-pink?style=flat-square" alt="QQ Chat Group">
  </a>
</p>

<p align="center">
  <a href="https://github.com/CikeyQi/nai-plugin">项目地址</a>
  ·
  <a href="#安装插件">开始使用</a>
  ·
  <a href="#配置参数">配置参数</a>
  ·
  <a href="#功能详解">功能详解</a>
</p>

## 简介

Nai-Plugin 是一款在 QQ 内快速调用[NovelAI](https://novelai.net/)最新[NAI Diffusion Anime V3]模型进行多参数便捷 AI 绘图的[Yunzai-Bot](https://github.com/Le-niao/Yunzai-Bot)插件，让你在QQ上享受与网页版一致的艺术创作体验，让你的创意在这里绽放！

<br>

## 安装插件

#### 1. 挂载至 Yunzai-Bot 目录

```
cd Yunzai-Bot
```

#### 2. 克隆本仓库至 plugins 目录

- 使用 Ghproxy（国内服务器推荐使用此方法）

```
git clone https://mirror.ghproxy.com/https://github.com/CikeyQi/nai-plugin.git ./plugins/nai-plugin
```

- 使用 Github

```
git clone https://github.com/CikeyQi/nai-plugin.git ./plugins/nai-plugin
```

#### 3. 安装依赖

```
pnpm install --filter=nai-plugin
```

#### 4. 重启 Yunzai

```
pnpm restart
```

<br><br>

## 配置参数

### 获取 token

<div align="center">请确保你的NovelAI账号已订阅绘图</div>

#### 方法一(推荐,获取一次长期使用)
 1. 登录 [NovelAI/login](https://novelai.net/login)
 2. 打开 [NovelAI/stories](https://novelai.net/stories)
 3. 复制token</br><img src="./resources/readme/tokenstep.gif" width="100%" height="100%" alt="get_token">
</br>

#### 方法二(不推荐,再次登录刷新)
 1. F12 打开控制台
 2. 控制台输入
   ```JavaScript
    copy(JSON.parse(localStorage.getItem('session')).auth_token)
    console.log('已复制到剪切板')
   ```

### 百度翻译
获取百度翻译token方法: <a href="https://ap-plugin.com/Config/docs10">百度翻译服务配置文档</a>

### Stable Diffusioin API搭建
搭建Stable Diffusioin API方法: <a href="https://ap-plugin.com/Config/docs2">绘图API部署文档</a>

</br>

---

</br></br>

## 配置文件

```yaml
# 支持配置多个token
novelai_token: 
  - please_paste_your_token_1_here
  - please_paste_your_token_2_here
# 当前绘图使用token序号,0为轮询
use_token: 0
# 链接NovelAI使用代理配置（国内机器与下方base_url选一个使用）
proxy:
  enable: false
  host: 127.0.0.1
  port: 7890
# 反向代理地址（本人搭建反向代理：`https://nai3.pages.dev`）
base_url: "https://api.novelai.net"
# Stable Diffusion绘图API,如果鉴赏图片为Stable Diffusion生成,则可解析图片绘图参数
sdapi:
  url: ""
  token: ""
# 百度翻译配置
translate:
  appid: ""
  appkey: ""
# 鉴黄设置，可选false/api4ai/tencent
nsfw_check: false
# api4ai 审核阈值 范围 0-1
api4ai:
  nsfw_threshold: 0.8
# tencent 审核相关设置
tencent:
  SecretId: ""
  SecretKey: ""
  Bucket: ""
  Region: ""
  BizType: ""
# 开启免费绘图模式,可绘制分辨率大于1024*1024,步数大于28的图片,关闭后可能快速消耗您的点数
free_mode: true
```

</br></br>

## 功能详解

 - #绘画/以图画图 可选参数
<div align="center">

|参数类型|可选参数|
|:---:|:---:|
|正面词条|girl, cat ears|
|负面词条|ntags=bad arms, extra body, low quality|
|尺寸|横突/竖图/方图/1024*512(自定义)|
|采样器|Euler/Euler a/DPM++ 2S a/DPM++ 2M/DPM++ SDE/DDIM|
|种子|seed=114514|
|步数|步数28|
|SMEA|smea|

</div>
&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;示例: #绘画 girl, cat ears, 1024*512, Euler, seed=114514, 步数28, smea, ntags=low quality


 - #重画

&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;使用上一次绘画/以图画图参数重复绘制

 - #绑定画风

&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;绑定画师画风,之后绘制可不再加上画师名,支持绑定多个,为空清除绑定

 - #查找图片

&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;使用绘制后的图片id查找绘图记录,仅支持查找本人绘图结果

 - #大清晰术

&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;使用大清晰术,提高图片分辨率,需配置Stable Diffusion API

 - #账户状态

&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;查看配置账户状态,包括订阅等级,剩余点数

 - #绘画帮助

&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;查看可使用的绘画指令

 - #nai更新

&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;插件更新

<br>

## 声明

此项目仅用于学习交流，请勿用于非法用途

### 爱发电

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力  
当然，你可以对我爱发电赞助，呜咪~❤️

<details>
<summary>展开/收起</summary>

<p>
  </a>
    <img src="./resources/readme/afdian.png">
  </a>
</p>

</details>

## 我们

<a href="https://github.com/CikeyQi/nai-plugin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CikeyQi/nai-plugin" />
</a>
