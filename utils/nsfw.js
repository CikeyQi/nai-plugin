import axios from "axios";
import Config from "../components/Config.js";
/**
 * 检查图片是否为NSFW
 * @param {*} base64 图片base64
 * @returns {nsfw: boolean, nsfwMsg: string} nsfw: 是否为NSFW, nsfwMsg: NSFW类型
 */
export async function nsfwCheck(base64) {
    let config = await Config.getConfig();
    let response = await axios.post(
        "http://110.41.175.145:13490/run/predict",
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
}