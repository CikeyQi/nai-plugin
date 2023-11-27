import plugin from '../../../lib/plugins/plugin.js'
import handleAxiosError from '../utils/handleAxiosError.js'
import { url2Base64 } from '../utils/utils.js'
import Config from '../components/Config.js'
import sizeOf from 'image-size'
import axios from 'axios'

export class superResolution extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'nai-大清晰术',
            /** 功能描述 */
            dsc: '大清晰术',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^(/|#)大清晰术([\\s\\S]*)$',
                    /** 执行方法 */
                    fnc: 'superResolution'
                }
            ]
        })
    }

    async superResolution(e) {
        if (!e.img) return await e.reply('请将图片连同指令一起发送')
        else await e.reply('正在释放大清晰术，请稍作等待~')
        // e.img[0] = 'https://' + e.img[0].replace(/https:\/\//g, '')
        let image = await url2Base64(e.img[0])
        // 发送请求
        let data = await this.Resolution(e, image)
        if (data === false) return true // 请求失败, 不继续执行
        // 获取出示图片的尺寸
        let dimensions = sizeOf(Buffer.from(image, 'base64'))
        // 获取超分图片的尺寸
        let dimensions2 = sizeOf(Buffer.from(data.image, 'base64'))
        await e.reply(segment.image('base64://' + data.image))
        await e.reply(`\n=====图片超分成功=====
    原图尺寸：${dimensions.width}x${dimensions.height}
    超分尺寸：${dimensions2.width}x${dimensions2.height}`)
        return true
    }
    async Resolution(e, image) {
        let config = Config.getConfig()
        const response = await axios.post(config.sdapi.url + '/sdapi/v1/extra-single-image', {
            "upscaling_resize": 1.5,
            "upscaler_1": "ScuNET PSNR",
            "upscaler_2": "R-ESRGAN 4x+ Anime6B",
            "extras_upscaler_2_visibility": 0.6,
            "image": 'data:image/jpeg;base64,' + image
        }, {
            headers: {
                'Authorization': 'Basic ' + config.sdapi.token,
            }
        })
        if (response.status === 200) {
            return response.data
        } else {
            handleAxiosError(e, response)
            return false
        }
    }
}