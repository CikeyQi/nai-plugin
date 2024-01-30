import axios from "axios";
import Config from "../components/Config.js";
import handleAxiosError from '../utils/handleAxiosError.js';
import FormData from 'form-data';

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
    let response = null
    const formData = new FormData()
    formData.append('image', buffer, 'image.jpg')
    try {
        response = await axios.post("https://demo.api4ai.cloud/nsfw/v1/results", formData, { headers: formData.getHeaders() })
    } catch (error) {
        handleAxiosError(e, error)
        throw error
    }
    let nsfw = response.data.results[0].entities[0].classes.nsfw
    return {
        nsfw: nsfw > config.nsfw_threshold,
        nsfwMsg: nsfw > config.nsfw_threshold ? '违规' : '合规'
    }
}