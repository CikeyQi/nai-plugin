import Config from "./components/Config.js";
import lodash from "lodash";
import path from "path";
import { pluginRoot } from "./model/path.js";

export function supportGuoba() {
  return {
    pluginInfo: {
      name: 'nai-plugin',
      title: 'AI绘画插件',
      author: ['@CikeyQi', '@erzaozi'],
      authorLink: ['https://github.com/CikeyQi', 'https://github.com/erzaozi'],
      link: 'https://github.com/CikeyQi/nai-plugin',
      isV3: true,
      isV2: false,
      showInMenu: true,
      description: '基于 Yunzai 的 AI 绘图插件，使用 NovelAI 接口',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'fluent-emoji-flat:artist-palette',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: '#000000',
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      iconPath: path.join(pluginRoot, 'resources/readme/girl.png'),
    },
    configInfo: {
      schemas: [
        {
          component: "Divider",
          label: "NovelAI 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "novelai_token",
          label: "账号池",
          bottomHelpMessage: "用于调用NovelAI的绘画接口",
          component: "GTags",
          componentProps: {
            placeholder: '请输入您的NovelAI Token',
            allowAdd: true,
            allowDel: true,
            showPrompt: true,
            promptProps: {
              content: '请填写您的NovelAI Token',
              placeholder: 'pst-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
              okText: '添加',
              rules: [
                { required: true, message: 'NovelAI Token不能为空' },
                { pattern: '^pst-[a-zA-Z0-9]{64}$', message: 'NovelAI Token格式不正确' },
              ],
            },
            valueParser: ((value) => value.split(',') || []),
          },
        },
        {
          field: "use_token",
          label: "指定Token",
          bottomHelpMessage: "使用指定的Token，当值为0时轮询",
          component: "InputNumber",
          componentProps: {
            min: 0,
            max: Config.getConfig().novelai_token.length,
            step: 1,
          },
        },
        {
          field: "free_mode",
          label: "启用免费模式",
          bottomHelpMessage: "免费模式下，不使用点数",
          component: "Switch",
        },
        {
          component: "Divider",
          label: "代理 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "proxy.enable",
          label: "启用代理",
          bottomHelpMessage: "代理开关",
          component: "Switch",
        },
        {
          field: "proxy.host",
          label: "代理地址",
          bottomHelpMessage: "代理服务器地址",
          component: "Input",
          componentProps: {
            placeholder: '请输入代理地址',
          },
        },
        {
          field: "proxy.port",
          label: "代理端口",
          bottomHelpMessage: "代理服务器端口",
          component: "InputNumber",
          componentProps: {
            placeholder: '请输入代理端口',
            min: 1,
            max: 65535,
            step: 1,
          },
        },
        {
          field: "reverse_proxy.base_url",
          label: "反向代理",
          bottomHelpMessage: "用于生成图片的反向代理的地址",
          component: "Input",
          componentProps: {
            placeholder: '请输入https://image.novelai.net的反向代理地址',
          },
        },
        {
          field: "reverse_proxy.user_url",
          label: "反向代理",
          bottomHelpMessage: "用于查询Token的反向代理的地址",
          component: "Input",
          componentProps: {
            placeholder: '请输入https://api.novelai.net的反向代理地址',
          },
        },
        {
          component: "Divider",
          label: "鉴赏 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "sdapi.url",
          label: "接口地址",
          bottomHelpMessage: "用于鉴赏的接口地址",
          component: "Input",
          componentProps: {
            placeholder: '请输入Stable Diffusion接口地址',
          },
        },
        {
          field: "sdapi.token",
          label: "接口Token",
          bottomHelpMessage: "用于鉴赏的接口Token",
          component: "InputPassword",
          componentProps: {
            placeholder: '请输入Stable Diffusion接口Token',
            visible: false,
          },
        },
        {
          component: "Divider",
          label: "翻译 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "translate.appid",
          label: "APPID",
          bottomHelpMessage: "用于翻译中文提示词",
          component: "Input",
          componentProps: {
            placeholder: "请输入百度翻译APPID",
            maxlength: 17,
            pattern: "^[0-9]*$",
            visible: true,
          },
        },
        {
          field: "translate.appkey",
          label: "APPKEY",
          bottomHelpMessage: "用于翻译中文提示词",
          component: "InputPassword",
          componentProps: {
            placeholder: "请输入百度翻译APPKEY",
            maxlength: 20,
            visible: false,
          },
        },
        {
          component: "Divider",
          label: "审核 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "nsfw_check",
          label: "审核方式",
          bottomHelpMessage: "选择图片审核方式",
          component: "Select",
          componentProps: {
            options: [
              { label: "不审核", value: false },
              { label: "使用api4ai", value: "api4ai" },
              { label: "使用腾讯云（需配置）", value: "tencent" },
            ],
          },
        },
        {
          field: "api4ai.nsfw_threshold",
          label: "api4ai审核阈值",
          bottomHelpMessage: "审核阈值，0-1之间",
          component: "InputNumber",
          componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
          },
        },
        {
          field: "tencent.SecretId",
          label: "SecretId",
          bottomHelpMessage: "腾讯云SecretId",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云SecretId',
          },
        },
        {
          field: "tencent.SecretKey",
          label: "SecretKey",
          bottomHelpMessage: "腾讯云SecretKey",
          component: "InputPassword",
          componentProps: {
            placeholder: '请输入腾讯云SecretKey',
            visible: false,
          },
        },
        {
          field: "tencent.Bucket",
          label: "Bucket",
          bottomHelpMessage: "腾讯云存储桶（如：example-1250000000）",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云Bucket',
          },
        },
        {
          field: "tencent.Region",
          label: "Region",
          bottomHelpMessage: "腾讯云存储桶所在地域（如：ap-guangzhou）",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云Region',
          },
        },
        {
          field: "tencent.BizType",
          label: "BizType",
          bottomHelpMessage: "腾讯云审核策略（空为默认）",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云BizType',
          },
        },
        {
          component: "Divider",
          label: "其他 相关配置",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "forward_msg",
          label: "合并转发图片",
          bottomHelpMessage: "以合并转发方式发送图片",
          component: "Switch",
        },
      ],
      getConfigData() {
        let config = Config.getConfig()
        return config
      },

      setConfigData(data, { Result }) {
        let config = {}
        for (let [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value)
        }
        config = lodash.merge({}, Config.getConfig(), config)
        config.novelai_token = data['novelai_token']
        config.reverse_proxy.base_url = config.reverse_proxy.base_url.replace(/\/$/, '')
        config.reverse_proxy.user_url = config.reverse_proxy.user_url.replace(/\/$/, '')
        Config.setConfig(config)
        return Result.ok({}, '保存成功~')
      },
    },
  }
}
