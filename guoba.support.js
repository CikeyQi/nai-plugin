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
          component: "SOFT_GROUP_BEGIN",
          label: "账户"
        },
        {
          field: "novelai_token",
          label: "账号列表",
          component: "GTags",
          componentProps: {
            placeholder: '请输入您的NovelAI Token',
            allowAdd: true,
            allowDel: true,
            showPrompt: true,
            promptProps: {
              content: '请填写您的 NovelAI Token',
              placeholder: 'pst-xxx...',
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
          label: "指定账号",
          component: "InputNumber",
          componentProps: {
            min: 0,
            max: Config.getConfig().novelai_token.length,
            step: 1,
          },
        },
        {
          field: "model",
          label: "模型名称",
          component: "Input",
          componentProps: {
            placeholder: '请输入要使用的模型名称',
          },
        },
        {
          field: "free_mode",
          label: "免费模式",
          component: "Switch",
        },
        {
          component: "SOFT_GROUP_BEGIN",
          label: "代理"
        },
        {
          component: "Divider",
          label: "主动代理",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "proxy.enable",
          label: "启用代理",
          component: "Switch",
        },
        {
          field: "proxy.host",
          label: "代理地址",
          component: "Input",
          componentProps: {
            placeholder: '请输入代理地址',
          },
        },
        {
          field: "proxy.port",
          label: "代理端口",
          component: "InputNumber",
          componentProps: {
            placeholder: '请输入代理端口',
            min: 1,
            max: 65535,
            step: 1,
          },
        },
        {
          component: "Divider",
          label: "反向代理",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "reverse_proxy.base_url",
          label: "图片代理",
          component: "Input",
          componentProps: {
            placeholder: '请输入 https://image.novelai.net 的反向代理地址',
          },
        },
        {
          field: "reverse_proxy.user_url",
          label: "接口代理",
          component: "Input",
          componentProps: {
            placeholder: '请输入 https://api.novelai.net 的反向代理地址',
          },
        },
        {
          component: "SOFT_GROUP_BEGIN",
          label: "翻译"
        },
        {
          field: "translate.engine",
          label: "翻译引擎",
          component: "Select",
          componentProps: {
            options: [
              { label: "不使用翻译", value: null },
              { label: "使用百度翻译", value: "baidu" },
              { label: "使用 AI 翻译", value: "openai" },
            ],
          },
        },
        {
          component: "Divider",
          label: "百度翻译",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "translate.baidu.appid",
          label: "APPID",
          component: "Input",
          componentProps: {
            placeholder: "请输入百度翻译APPID",
            maxlength: 17,
            pattern: "^[0-9]*$",
            visible: true,
          },
        },
        {
          field: "translate.baidu.appkey",
          label: "APPKEY",
          component: "InputPassword",
          componentProps: {
            placeholder: "请输入百度翻译APPKEY",
            maxlength: 20,
            visible: false,
          },
        },
        {
          component: "Divider",
          label: "AI 翻译",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "translate.openai.base_url",
          label: "反向代理",
          component: "Input",
          componentProps: {
            placeholder: "请输入 https://api.openai.com/v1 的反向代理地址"
          },
        },
        {
          field: "translate.openai.model",
          label: "模型名称",
          component: "Input",
          componentProps: {
            placeholder: "请输入模型名称"
          },
        },
        {
          field: "translate.openai.apikey",
          label: "APIKEY",
          component: "InputPassword",
          componentProps: {
            placeholder: "请输入APIKEY",
            visible: false,
          },
        },
        {
          component: "SOFT_GROUP_BEGIN",
          label: "审核"
        },
        {
          field: "nsfw_check.engine",
          label: "审核引擎",
          component: "Select",
          componentProps: {
            options: [
              { label: "不审核", value: null },
              { label: "使用 api4ai", value: "api4ai" },
              { label: "使用腾讯云", value: "tencent" },
            ],
          },
        },
        {
          component: "Divider",
          label: "API4AI 审核",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "nsfw_check.api4ai.nsfw_threshold",
          label: "审核阈值",
          component: "InputNumber",
          componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
          },
        },
        {
          component: "Divider",
          label: "腾讯云审核",
          componentProps: {
            orientation: "left",
            plain: true,
          },
        },
        {
          field: "nsfw_check.tencent.SecretId",
          label: "SecretId",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云SecretId',
          },
        },
        {
          field: "nsfw_check.tencent.SecretKey",
          label: "SecretKey",
          component: "InputPassword",
          componentProps: {
            placeholder: '请输入腾讯云SecretKey',
            visible: false,
          },
        },
        {
          field: "nsfw_check.tencent.Bucket",
          label: "Bucket",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云Bucket',
          },
        },
        {
          field: "nsfw_check.tencent.Region",
          label: "Region",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云Region',
          },
        },
        {
          field: "nsfw_check.tencent.BizType",
          label: "BizType",
          component: "Input",
          componentProps: {
            placeholder: '请输入腾讯云BizType',
          },
        },
        {
          component: "SOFT_GROUP_BEGIN",
          label: "参数"
        },
        {
          field: "parameters.width",
          label: "默认宽度",
          component: "InputNumber",
          componentProps: {
            min: 64,
            max: 49152,
            step: 64,
          },
        },
        {
          field: "parameters.height",
          label: "默认高度",
          component: "InputNumber",
          componentProps: {
            min: 64,
            max: 49152,
            step: 64,
          },
        },
        {
          field: "parameters.scale",
          label: "提示引导",
          component: "InputNumber",
          componentProps: {
            min: 0,
            max: 10,
            step: 0.1,
          },
        },
        {
          field: "parameters.sampler",
          label: "采样方法",
          component: "Select",
          componentProps: {
            options: [
              { label: "Euler Ancestral", value: "k_euler_ancestral" },
              { label: "DPM++ 2S Ancestral", value: "k_dpmpp_2s_ancestral" },
              { label: "DPM++ 2M SDE", value: "k_dpmpp_2m_sde" },
              { label: "Euler", value: "k_euler" },
              { label: "DPM++ 2M", value: "k_dpmpp_2m" },
              { label: "DPM++ SDE", value: "k_dpmpp_sde" }
            ],
          },
        },
        {
          field: "parameters.steps",
          label: "迭代步数",
          component: "InputNumber",
          componentProps: {
            min: 1,
            max: 50,
            step: 1,
          },
        },
        {
          field: "parameters.cfg_rescale",
          label: "重绘比例",
          component: "InputNumber",
          componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
          },
        },
        {
          field: "parameters.noise_schedule",
          label: "降噪方法",
          component: "Select",
          componentProps: {
            options: [
              { label: "karras", value: "karras" },
              { label: "exponential", value: "exponential" },
              { label: "polyexponential", value: "polyexponential" }
            ],
          },
        },
        {
          field: "parameters.negative_prompt",
          label: "默认负面",
          component: "Input",
          componentProps: {
            placeholder: '请输入默认负面提示词',
          },
        },
        {
          component: "SOFT_GROUP_BEGIN",
          label: "其他"
        },
        {
          field: "forward_msg",
          label: "合并转发图片",
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
