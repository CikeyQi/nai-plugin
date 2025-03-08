import plugin from '../../../lib/plugins/plugin.js'

export class Again extends plugin {
    constructor() {
        super({
            name: 'nai-重新绘制',
            dsc: '重新绘制图片',
            event: 'message',
            priority: 1009,
            rule: [{
                reg: '^[/#]re$',
                fnc: 'again'
            }]
        })

        this.handlers = {
            text: () => import('./Text.js').then(m => new m.Text()),
            image: () => import('./Image.js').then(m => new m.Image())
        }
    }

    async again(e) {
        try {
            const usageData = await redis.get(`nai:again:${e.user_id}`)
            if (!usageData) return e.reply("未能查询到上次绘制的信息，请使用/draw 命令进行新的绘制")

            const { msg, img, type } = JSON.parse(usageData)
            Object.assign(e, { msg, img })

            if (this.handlers[type]) {
                const handler = await this.handlers[type]()
                return handler[type](e)
            }

            return e.reply("上次绘制信息异常，请使用/draw 命令进行新的绘制")
        } catch (error) {
            return e.reply(error.message || '未知错误，请检查控制台日志')
        }
    }
}