import plugin from '../../../lib/plugins/plugin.js'
import { pluginResources } from '../model/path.js'
import fs from 'fs'

export class find extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'nai-查找图片',
            /** 功能描述 */
            dsc: '查找图片',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^(/|#)查找图片.*$',
                    /** 执行方法 */
                    fnc: 'find'
                }
            ]
        })
    }

    async find(e) {
        let user = e.user_id.toString().replace(/:/g, "-")
        if (!fs.existsSync(pluginResources + '/userPic/' + user)) {
            e.reply('发现你未生成过图片，请先生成图片')
            return true
        }
        let files = fs.readdirSync(pluginResources + '/userPic/' + user)
        let num = e.msg.match(/\d+/g)
        if (files.indexOf(num + '.png') == -1) {
            e.reply('没有找到ID为[' + num + ']的图片')
            return true
        }
        let base64 = fs.readFileSync(pluginResources + '/userPic/' + user + '/' + num + '.png', 'base64')
        await e.reply('找到了ID为[' + num + ']的图片，正在发送中，请稍等')
        await e.reply({...segment.image("base64://" + base64), origin: true})
        return true
    }
}
