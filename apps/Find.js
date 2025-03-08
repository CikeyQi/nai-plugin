import plugin from '../../../lib/plugins/plugin.js'
import { pluginResources } from '../model/path.js'
import fs from 'fs'
import path from 'path'

export class Find extends plugin {
    constructor() {
        super({
            name: 'nai-查找图片',
            dsc: '查找图片',
            event: 'message',
            priority: 1009,
            rule: [{
                reg: '^[/#]nai --find (\\d+)$',
                fnc: 'find'
            }]
        })
    }

    async find(e) {
        const userId = e.user_id.toString().replace(/:/g, '-')
        const imgDir = path.join(pluginResources, 'userPic', userId)
        const imageId = e.msg.match(/\d+/)?.[0]

        const errors = {
            noDir: !fs.existsSync(imgDir) && '发现你未生成过图片，请先生成图片',
            noId: !imageId && '图片ID不能为空',
            noFile: imageId && !fs.existsSync(path.join(imgDir, `${imageId}.png`)) && `没有找到ID为[${imageId}]的图片`
        }

        if (Object.values(errors).some(Boolean)) {
            return await e.reply(errors.find(v => v) || '未知错误')
        }

        try {
            const base64 = fs.readFileSync(path.join(imgDir, `${imageId}.png`), 'base64')
            await e.reply([
                `找到了ID为[${imageId}]的图片，正在发送中...`,
                { ...segment.image("base64://" + base64), origin: true }
            ])
        } catch (error) {
            logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`获取本地图片失败`), logger.red(error));
            await e.reply('未知错误，请检查控制台日志')
        }

        return true
    }
}