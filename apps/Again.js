import plugin from '../../../lib/plugins/plugin.js'
import { txt2img } from './Txt2img.js'
import { img2img } from './Img2img.js'

export class again extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'nai-重新绘制',
            /** 功能描述 */
            dsc: '重新绘制图片',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^(/|#)重画$',
                    /** 执行方法 */
                    fnc: 'again'
                }
            ]
        })
    }

    async again(e) {
        const usageData = await redis.get(`nai:again:${e.user_id}`);
        if (!usageData) {
            e.reply("太久远了，我也忘记上一次绘的图是什么了");
            return false;
        }
        const { msg, img, istxt2img } = JSON.parse(usageData);
        if (msg) e.msg = msg;
        if (img) e.img = img;
        const againTxt2img = new txt2img();
        const againImg2img = new img2img();
        if (!istxt2img) {
            againImg2img.__proto__.img2img.call(againImg2img, e);
        } else {
            againTxt2img.__proto__.txt2img.call(againTxt2img, e);
        }
        return true
    }
}
