import plugin from '../../../lib/plugins/plugin.js'
import queue from '../components/Queue.js'
import Config from '../components/Config.js'
import { HttpsProxyAgent } from 'https-proxy-agent'
import axios from 'axios'

const baseHeaders = {
  "authority": "api.novelai.net",
  "Origin": "https://novelai.net",
  "Referer": "https://novelai.net",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Content-Type": "application/json"
}

const tierMap = ['Paper', 'Tablet', 'Scroll', 'Opus']

export class userInfo extends plugin {
  constructor() {
    super({
      name: 'nai-账户状态',
      dsc: '账户状态',
      event: 'message',
      priority: 1009,
      rule: [
        {
          reg: '^[/#]nai --info$',
          fnc: 'userInfo'
        },
        {
          reg: '^[/#]nai --reload$',
          fnc: 'refreshToken'
        }
      ]
    })
  }

  async userInfo(e) {
    const config = Config.getConfig()
    const { novelai_token: tokens, proxy: proxyConfig, reverse_proxy } = config

    if (!tokens?.length) return e.reply('未配置Token，请先配置Token')

    await e.reply('正在查询中，预计10s，请稍后...')

    const agent = proxyConfig.enable &&
      new HttpsProxyAgent(`http://${proxyConfig.host}:${proxyConfig.port}`)

    const results = await Promise.all(tokens.map(async token => {
      try {
        const { data } = await axios.get(`${reverse_proxy.user_url}/user/data`, {
          headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
          httpsAgent: agent
        })

        const { active, tier, expiresAt, trainingStepsLeft } = data.subscription
        return [
          '┌ 订阅状态：' + (active ? '已订阅' : '未订阅'),
          '├ 订阅挡位：' + (tierMap[tier] || '未知'),
          '├ 到期时间：' + new Date(expiresAt * 1000).toLocaleString('chinese', { hour12: false }),
          `├ 固定剩余点数：${trainingStepsLeft.fixedTrainingStepsLeft}`,
          `└ 购买的点数：${trainingStepsLeft.purchasedTrainingSteps}`
        ].join('\n')
      } catch (error) {
        return `第 ${tokens.indexOf(token) + 1} 个Token查询失败：${error.message}`
      }
    }))

    e.reply(`已配置${tokens.length}个Token\n\n${results.join('\n\n')}`)
    return true
  }

  async refreshToken(e) {
    await e.reply('正在从配置文件中读取Token检查可用性，请稍后...')
    await queue.init(e)
    e.reply(`已刷新Token状态，当前共有 ${queue.list.length} 个Token可用`)
    return true
  }
}