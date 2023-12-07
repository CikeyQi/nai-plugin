import plugin from '../../../lib/plugins/plugin.js'
import { url2Base64 } from '../utils/utils.js'
import { nsfwCheck } from '../utils/nsfw.js'

export class test extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'nai-测试',
      /** 功能描述 */
      dsc: '测试功能响应',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^(/|#)测试[\\s\\S]*$',
          /** 执行方法 */
          fnc: 'test'
        }
      ]
    })
  }

  async test(e) {
    let image = e.img[0]
    let base64 = await url2Base64(image)
    let json = await nsfwCheck(base64, e)
    e.reply(json.nsfwMsg)
  }
}
