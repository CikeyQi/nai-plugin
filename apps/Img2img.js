import plugin from '../../../lib/plugins/plugin.js'
import Config from '../components/Config.js'
import Log from '../utils/logs.js'
import { handleParam } from '../utils/parse.js'
import { url2Base64 } from '../utils/utils.js'
import queue from '../components/Queue.js'
import sizeOf from 'image-size'

export class img2img extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'nai-以图画图',
      /** 功能描述 */
      dsc: '以图画图',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^(/|#)以图画图([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'img2img'
        }
      ]
    })
  }

  async img2img(e) {
    if (!e.img) return e.reply('请将图片连同指令一起发送')
    const data = {
      msg: e.msg,
      img: e.img,
    };
    await redis.set(`nai:again:${e.user_id}`, JSON.stringify(data));
    let msg = e.msg.replace(/^\/以图画图/, '').replace(/^#以图画图/, '')
    let param = await handleParam(e, msg)
    // e.img[0] = 'https://'+e.img[0].replace(/https:\/\//g,'')
    let buffer = Buffer.from(await url2Base64(e.img[0]), 'base64')
    let dimensions = sizeOf(buffer)
    let width = dimensions.width
    let height = dimensions.height
    if (width > 1024 || height > 1024) {
      const scale = Math.max(width / 1024, height / 1024);
      dimensions.width = Math.floor(width / scale / 64) * 64;
      dimensions.height = Math.floor(height / scale / 64) * 64;
    } else {
      dimensions.width = Math.floor(width / 64) * 64;
      dimensions.height = Math.floor(height / 64) * 64;
    }
    param.parameters.image = await url2Base64(e.img[0])
    param.parameters.width = dimensions.width
    param.parameters.height = dimensions.height
    param.parameters.extra_noise_seed = param.parameters.seed
    e.reply(`当前队列还有${queue.lock ? queue.size() + 1 : queue.size()}人，大概还需要${14 * ((queue.lock ? queue.size() + 1 : queue.size()) + 1)}秒完成`)
    queue.enqueue({
      e: e,
      param: param,
      user: e.user_id,
      type: 'img2img'
    })
    return true
  }
}