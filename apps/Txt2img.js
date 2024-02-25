import plugin from '../../../lib/plugins/plugin.js'
import { handleParam } from '../utils/parse.js'
import { url2Base64 } from '../utils/utils.js'
import queue from '../components/Queue.js'

export class txt2img extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'nai-绘画',
      /** 功能描述 */
      dsc: '绘画',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^(/|#)(绘画|画图)([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'txt2img'
        }
      ]
    })
  }

  async txt2img(e) {
    let msg = e.msg.replace(/^\/绘画|^\/画图|^#绘画|^#画图/, '')
    if (msg === '帮助') {
      return false
    }
    const data = {
      msg: e.msg,
      img: e.img ? e.img : null,
    };
    await redis.set(`nai:again:${e.user_id}`, JSON.stringify(data));
    let param = await handleParam(e, msg)
    if (e.img[0]) {
      param.parameters.reference_image = await url2Base64(e.img[0])
    }
    e.reply(`${param.parameters.reference_image ? '[已上传参考图片] ' : ''}当前队列还有${queue.lock ? queue.size() + 1 : queue.size()}人，大概还需要${14 * ((queue.lock ? queue.size() + 1 : queue.size()) + 1)}秒完成`)
    queue.enqueue({
      e: e,
      param: param,
      user: e.user_id,
      type: 'txt2img'
    })
    return true
  }
}