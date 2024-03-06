import plugin from '../../../lib/plugins/plugin.js'
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
    if (queue.list.length === 0) return e.reply('当前队列中的可用Token为空，请先添加Token/使用【#刷新Token】指令刷新已经配置的Token')
    if (!e.img) return e.reply('请将图片连同指令一起发送')
    const data = {
      msg: e.msg,
      img: e.img,
      istxt2img: false,
    };
    await redis.set(`nai:again:${e.user_id}`, JSON.stringify(data));
    let msg = e.msg.replace(/^\/以图画图/, '').replace(/^#以图画图/, '')
    let param = await handleParam(e, msg)
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
    if (e.img[1]) {
      param.parameters.reference_image = await url2Base64(e.img[1])
    }
    param.parameters.width = dimensions.width
    param.parameters.height = dimensions.height
    param.parameters.extra_noise_seed = param.parameters.seed
    let restNumbeer = await queue.enqueue({
      e: e,
      param: param,
      user: e.user_id,
      type: 'img2img'
    })
    e.reply(`${param.parameters.reference_image ? '[已上传参考图片] ' : ''}当前队列还有${restNumbeer}人，大概还需要${14 * (restNumbeer + 1)}秒完成`)
    return true
  }
}