import plugin from '../../../lib/plugins/plugin.js'

export class Preset extends plugin {
    constructor() {
        super({
            name: 'nai-预设',
            dsc: '预设功能',
            event: 'message',
            priority: 1009,
            rule: [
                {
                    reg: '^[/#]pset(?: --(add|find|del))?(?:\\s+([\\s\\S]*))?$',
                    fnc: 'preset'
                }
            ]
        })
    }

    async preset(e) {
        const [, action, args] = e.msg.match(this.rule[0].reg)
        const operations = {
            add: this.addPreset,
            find: this.findPreset,
            del: this.delPreset,
            undefined: this.listPresets
        }
        return operations[action]?.call(this, e, args) ?? true
    }

    async getPreset(userId) {
        const data = await redis.get(`nai:preset:${userId}`)
        return data ? JSON.parse(data) : {}
    }

    async setPreset(userId, presets) {
        await redis.set(`nai:preset:${userId}`, JSON.stringify(presets))
    }

    async addPreset(e, args) {
        if (!args) return e.reply('格式：/pset --add <名称> <内容>')

        const [key, ...rest] = args.split(' ')
        const value = rest.join(' ')
        if (!key || !value) return e.reply('格式：/pset --add <名称> <内容>')

        const presets = await this.getPreset(e.user_id)
        if (presets[key]) return e.reply(`预设 "${key}" 已存在`)

        presets[key] = value
        await this.setPreset(e.user_id, presets)
        return e.reply(Bot.makeForwardMsg([{ message: `预设名称：${key}` }, { message: value }]))
    }

    async listPresets(e) {
        const presets = await this.getPreset(e.user_id)
        if (!Object.keys(presets).length) return e.reply('你没有添加任何预设，请使用 /pset --add 添加预设')

        const messages = Object.entries(presets).flatMap(([k, v]) => [{ message: `预设名称：${k}` }, { message: v.length > 100 ? `${v.slice(0, 100)}...` : v }])
        messages.unshift({ message: '你添加的预设列表：\nTips：过长的预设将只显示前100个字符，请使用 /pset --find <名称> 命令查看完整的预设内容' })
        return e.reply(Bot.makeForwardMsg(messages))
    }

    async findPreset(e, keyword) {
        if (!keyword) return e.reply('格式：/pset --find <名称>')

        const presets = await this.getPreset(e.user_id)
        return presets[keyword]
            ? e.reply(Bot.makeForwardMsg([{ message: `预设名称：${keyword}` }, { message: presets[keyword] }]))
            : e.reply(`预设 "${keyword}" 不存在`)
    }

    async delPreset(e, keyword) {
        if (!keyword) return e.reply('格式：/pset --del <名称>')

        const presets = await this.getPreset(e.user_id)
        if (!presets[keyword]) return e.reply(`预设 "${keyword}" 不存在`)

        delete presets[keyword]
        await this.setPreset(e.user_id, presets)
        return e.reply(`已删除预设 "${keyword}"`)
    }
}