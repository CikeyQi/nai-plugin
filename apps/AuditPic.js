import plugin from '../../../lib/plugins/plugin.js'
import { url2Base64 } from '../utils/utils.js'
import { nsfwCheck } from '../utils/nsfw.js'

export class auditPic extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'nai-审核图片',
            /** 功能描述 */
            dsc: '审核图片',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^(/|#)审核图片$',
                    /** 执行方法 */
                    fnc: 'auditPic'
                }
            ]
        })
    }

    async auditPic(e) {
        if (!e.img) return e.reply('请将图片连同指令一起发送')
        await e.reply('正在审核图片，请稍作等待~')
        let image = e.img[0]
        let base64 = await url2Base64(image)
        let json = await nsfwCheck(base64)
        e.reply(json.nsfwMsg)
    }
}
