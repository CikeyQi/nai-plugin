import plugin from '../../../lib/plugins/plugin.js'
import { url2Base64 } from '../utils/utils.js'
import Config from '../components/Config.js'
import axios from 'axios'

export class appreciate extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'nai-鉴赏',
            /** 功能描述 */
            dsc: '鉴赏',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^(/|#)鉴赏图片$',
                    /** 执行方法 */
                    fnc: 'appreciate'
                }
            ]
        })
    }

    async appreciate(e) {
        if (!e.img) return e.reply('请将图片连同指令一起发送')
        let base64 = await url2Base64(e.img[0])
        let config = Config.getConfig()
        await e.reply('正在鉴赏图片，请稍作等待~')
        const response = await axios.post(config.sdapi.url + "/sdapi/v1/png-info", {
            image: "data:image/png;base64," + base64,
        }, {
            headers: {
                "Authorization": 'Basic ' + config.sdapi.token,
            },
        });
        if (response.status === 200) {
            if (response.data.info === "") {
                const result = await axios.post(config.sdapi.url + "/tagger/v1/interrogate", {
                    "image": "data:image/png;base64," + base64,
                    "model": "wd14-vit-v2-git",
                    "threshold": 0.5,
                }, {
                    headers: {
                        "Authorization": 'Basic ' + config.sdapi.token,
                    }
                });
                const attributes = Object.keys(result.data.caption);
                const resultStr = attributes.join(", ");
                e.reply(resultStr)
            } else {
                e.reply(response.data.info)
            }
        } else {
            Log.e(`无法获取该图片的解析信息，后端异常：${response.status}`);
            e.reply("无法获取该图片的解析信息，后端异常")
            return false;
        }
        return true
    }
}
