import plugin from '../../../lib/plugins/plugin.js'

export class bindArts extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'nai-绑定画风',
            /** 功能描述 */
            dsc: '绑定画风',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^(/|#)绑定画风[\\s\\S]*$',
                    /** 执行方法 */
                    fnc: 'bindArts'
                }
            ]
        })
    }

    async bindArts(e) {
        let artist = e.msg.replace(/^\/绑定画风/, '').replace(/^#绑定画风/, '').trim()
        if (!artist) {
            e.reply('已清除画风绑定')
            await redis.del(`nai:bindArts:${e.user_id}`)
            return true
        }
        if (artist.indexOf(',') > -1) {
            artist = artist.split(',')
        }
        if (typeof artist === 'string') {
            artist = [artist]
        }
        await redis.set(`nai:bindArts:${e.user_id}`, JSON.stringify(artist))
        e.reply(`您的画风已绑定为：${artist.join(',')}`)
        return true
    }
}