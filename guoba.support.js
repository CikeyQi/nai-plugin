import Config from "./components/Config.js";
import lodash from "lodash";
import path from "path";
import { pluginRoot } from "./model/path.js";

export function supportGuoba() {
  return {
    pluginInfo: {
      name: 'nai-plugin',
      title: 'nai-plugin',
      author: ['@CikeyQi', '@erzaozi'],
      authorLink: ['https://github.com/CikeyQi', 'https://github.com/erzaozi'],
      link: 'https://github.com/CikeyQi/nai-plugin',
      isV3: true,
      isV2: false,
      description: '基于Yunzai-Bot的AI绘图插件，使用NovelAI接口',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'mdi:stove',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: '#d19f56',
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      iconPath: path.join(pluginRoot, 'resources/icon.png'),
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
          field: "base_url",
          label: "反向代理",
          bottomHelpMessage: "用于反向代理的地址",
          component: "Input",
          componentProps: {
            placeholder: '请输入代理地址',
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
          label: "启用审核",
          bottomHelpMessage: "启用审核拦截违规内容",
          component: "Switch",
        },
        {
          field: "nsfw_threshold",
          label: "审核阈值",
          bottomHelpMessage: "审核阈值，0-1之间",
          component: "InputNumber",
          componentProps: {
            min: 0,
            max: 1,
            step: 0.01,
          },
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
        config.base_url = config.base_url.replace(/\/$/, '')
        Config.setConfig(config)
        return Result.ok({}, '保存成功~')
      },
    },
  }
}
