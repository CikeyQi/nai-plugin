import plugin from '../../../lib/plugins/plugin.js'
import queue from '../components/Queue.js';
import Config from '../components/Config.js'
import { HttpsProxyAgent } from 'https-proxy-agent';
import axios from 'axios'
import handleAxiosError from '../utils/handleAxiosError.js'

const headers = {
  "authority": "api.novelai.net",
  "Origin": "https://novelai.net",
  "Referer": "https://novelai.net",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Content-Type": "application/json",
}

export class userInfo extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'nai-账户状态',
      /** 功能描述 */
      dsc: '账户状态',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^(/|#)账户状态$',
          /** 执行方法 */
          fnc: 'userInfo'
        },
        {
          reg: '^(/|#)(nai)?刷新(T|t)oken$',
          fnc: 'refreshToken'
        }
      ]
    })
  }

  async userInfo(e) {
    let msg = '';
    let url = Config.getConfig().reverse_proxy.user_url + '/user/data';
    let agent = null;
    if (Config.getConfig().proxy.enable) {
      let proxy = 'http://' + Config.getConfig().proxy.host + ':' + Config.getConfig().proxy.port;
      agent = new HttpsProxyAgent(proxy);
    }
    let tokenList = Config.getConfig().novelai_token;
    if (!tokenList) {
      e.reply('未配置Token，请先配置Token');
      return true;
    }
    msg += '已配置' + tokenList.length + '个Token\n';

    await e.reply('正在查询中，预计10s，请稍后...');

    const requests = tokenList.map(async (token) => {
      try {
        headers['Authorization'] = 'Bearer ' + token;
        let response = await axios.get(url, {
          headers: headers,
          httpsAgent: agent
        });
        let data = response.data;

        // 订阅状态
        let subscription = data.subscription.active ? '已订阅' : '未订阅';
        // 订阅挡位，0为Paper，1为Tablet，2为Scroll，3为Opus
        let tier = data.subscription.tier == 0 ? 'Paper' : data.subscription.tier == 1 ? 'Tablet' : data.subscription.tier == 2 ? 'Scroll' : 'Opus';
        // 到期时间，需要转换为北京时间
        let expiresAt = new Date(data.subscription.expiresAt * 1000).toLocaleString('chinese', { hour12: false });
        // 固定剩余点数
        let fixedTrainingStepsLeft = data.subscription.trainingStepsLeft.fixedTrainingStepsLeft;
        // 购买的点数
        let purchasedTrainingSteps = data.subscription.trainingStepsLeft.purchasedTrainingSteps;

        // 组合消息
        msg += '\n';
        msg += '┌ 订阅状态：' + subscription + '\n';
        msg += '├ 订阅挡位：' + tier + '\n';
        msg += '├ 到期时间：' + expiresAt + '\n';
        msg += '├ 固定剩余点数：' + fixedTrainingStepsLeft + '\n';
        msg += '└ 购买的点数：' + purchasedTrainingSteps + '\n';

      } catch (error) {
        handleAxiosError(e, error)
        throw error
      }
    });

    await Promise.all(requests);

    e.reply(msg);
    return true;
  }

  async refreshToken(e) {
    e.reply('正在从配置文件中读取Token检查可用性，请稍后...');
    await queue.init(e);
    e.reply(`已刷新Token状态，当前共有${queue.list.length}个Token可用`)
    return true
  }
}  