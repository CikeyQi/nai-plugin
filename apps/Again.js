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
                    reg: '^(/|#)重画.*$',
                    /** 执行方法 */
                    fnc: 'again'
                }
            ]
        })
    }

    async again(e) {
        let user_id = e.msg.replace(/^\/重画|^#重画/, '').trim() || e.user_id;
    
        const usageData = await redis.get(`nai:again:${user_id}`);
        if (!usageData) {
            e.reply("太久远了，我也忘记上一次绘的图是什么了");
            return false;
        }
    
        const { msg, img, type } = JSON.parse(usageData);
        if (msg) e.msg = msg;
        if (img) e.img = img;
    
        if (type === 'txt2img') {
            const againTxt2img = new txt2img();
            await againTxt2img.txt2img(e);
        } else {
            const againImg2img = new img2img();
            await againImg2img.img2img(e);
        }
        return true;
    }
}
