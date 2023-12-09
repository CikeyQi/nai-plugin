import axios from "axios";
import { HttpsProxyAgent } from 'https-proxy-agent';
import Config from "../components/Config.js";
import handleAxiosError from '../utils/handleAxiosError.js'

/**
 * 检查图片是否为NSFW
 * @param {*} base64 图片base64
 * @returns {nsfw: boolean, nsfwMsg: string} nsfw: 是否为NSFW, nsfwMsg: NSFW类型
 */
/* export async function nsfwCheck(base64) {
    let config = Config.getConfig()
    let response = await axios.post(
        config.wd_tagger + "/run/predict",
        {
            data: [
                "data:image/png;base64," + base64,
                "MOAT",
                0.35,
                0.85,
            ]
        },
    );
    let data = {
        nsfw: response.data.data[2].label == "explicit" || response.data.data[2].label == "questionable" ? true : false,
        nsfwMsg: response.data.data[2].label == "explicit" ? "色情/露骨内容" : response.data.data[2].label == "questionable" ? "强烈性暗示/可疑内容" : response.data.data[2].label == "sensitive" ? "轻微性暗示/敏感内容" : "大众级/普通内容",
    }
    return data;
} */
/**
 * 检查图片是否为NSFW
 * @param {*} data 图片buffer或者base64
 * @returns {boolean} 是否为NSFW, nsfwMsg: NSFW类型
 */
export async function nsfwCheck(data, e) {
    let buffer = null
    if (typeof data === 'string') {
        buffer = Buffer.from(data, 'base64')
    } else if (Buffer.isBuffer(data)) {
        buffer = data
    }
    const config = Config.getConfig()
    let agent = null
    if (config.proxy.enable) {
        let proxy = 'http://' + config.proxy.host + ':' + config.proxy.port
        agent = new HttpsProxyAgent(proxy)
    }
    let response = null
    try {
        response = await axios.post("https://api-inference.pages.dev/models/Falconsai/nsfw_image_detection",
            buffer,
            {
                headers: { "Authorization": "Bearer " + config.huggingface_token },
                httpsAgent: agent,
            })
    } catch (error) {
        handleAxiosError(e, error)
        throw error
    }
    return {
        nsfw: response.data.some(item => item.label == "nsfw" && item.score > config.nsfw_threshold),
        nsfwMsg: response.data.some(item => item.label == "nsfw" && item.score > config.nsfw_threshold) ? "违规" : "合规"
    }
}