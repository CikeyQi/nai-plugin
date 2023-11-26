import Config from '../components/Config.js'
import axios from 'axios'
import crypto from 'crypto'

export async function baiduTranslate(keyword) {
    let config = await Config.getConfig()
    let salt = Math.random().toString(36).substr(2);
    let sign = crypto.createHash('md5').update(config.translate.appid + keyword + salt + config.translate.appkey).digest('hex');
    let url = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${keyword}&from=zh&to=en&appid=${config.translate.appid}&salt=${salt}&sign=${sign}`;
    try {
        let json = (await axios.get(url)).data;
        console.log(json)
        if (json.error_code) {
            return {
                status: false,
                msg: handleTranslateError(json.error_code)
            }
        } else {
            let prompt = json.trans_result[0].dst
            console.log(`【描述词翻译】${json.trans_result[0].src} ==> ${json.trans_result[0].dst}`);
            return {
                status: true,
                msg: prompt
            }
        }
    } catch (error) {
        console.error(error);
        return {
            status: false,
            msg: "翻译失败，请检查控制台输出"
        }
    }
}

function handleTranslateError(error_code) {
    console.log(error_code)
    switch (error_code) {
        case 52001:
            return "请求超时，请重试";
        case 52002:
            return "系统错误，请重试";
        case 52003:
            return "未授权用户，请检查appid是否正确或者服务是否开通";
        case 54000:
            return "必填参数为空，请检查是否少传参数";
        case 54001:
            return "签名错误，请检查您的签名生成方法";
        case 54003:
            return "访问频率受限，请降低您的调用频率，或进行身份认证后切换为高级版/尊享版";
        case 54004:
            return "账户余额不足，请前往管理控制台为账户充值";
        case 54005:
            return "长query请求频繁，请降低长query的发送频率，3s后再试";
        case 58000:
            return "客户端IP非法，检查个人资料里填写的IP地址是否正确，可前往开发者信息-基本信息修改";
        case 58001:
            return "译文语言方向不支持，检查译文语言是否在语言列表里";
        case 58002:
            return "服务当前已关闭，请前往管理控制台开启服务";
        case 90107:
            return "认证未通过或未生效，请前往我的认证查看认证进度";
        default:
            return "未知错误";
    }
}