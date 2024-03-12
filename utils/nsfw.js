import axios from "axios";
import Config from "../components/Config.js";
import COS from 'cos-nodejs-sdk-v5';
import handleAxiosError from '../utils/handleAxiosError.js';
import FormData from 'form-data';

/**
 * 检查图片是否为NSFW
 * @param {*} data 图片buffer或者base64
 * @returns {boolean} 是否为NSFW, nsfwMsg: NSFW类型
 */
export async function nsfwCheck(data, e) {
    const config = Config.getConfig()
    let buffer = null
    if (typeof data === 'string') {
        buffer = Buffer.from(data, 'base64')
    } else if (Buffer.isBuffer(data)) {
        buffer = data
    }
    if (config.nsfw_check === 'api4ai') {
        return await postApi4aiNsfw(buffer, e)
    } else if (config.nsfw_check === 'tencent') {
        return await postImagesAuditing(buffer, e)
    }
}

async function postApi4aiNsfw(buffer, e) {
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
    logger.info('api4ai图片审核结果：' + nsfw);
    return {
        nsfw: nsfw > config.api4ai.nsfw_threshold,
        nsfwMsg: nsfw > config.api4ai.nsfw_threshold ? '违规' : '合规'
    }
}

function postImagesAuditing(buffer, e) {
    return new Promise((resolve, reject) => {
        var config = Config.getConfig()
        const base64 = buffer.toString('base64');
        const cos = new COS({
            SecretId: config.tencent.SecretId,
            SecretKey: config.tencent.SecretKey,
        });
        var host = config.tencent.Bucket + '.ci.' + config.tencent.Region + '.myqcloud.com';
        var url = 'https://' + host + '/image/auditing';
        var body = COS.util.json2xml({
            Request: {
                Input: [{
                    Content: base64,
                }],
                Conf: {
                    BizType: config.tencent.BizType,
                }
            }
        });
        cos.request({
            Bucket: config.tencent.Bucket,
            Region: config.tencent.Region,
            Method: 'POST',
            Url: url,
            Key: '/image/auditing',
            ContentType: 'application/xml',
            Body: body
        }, function (err, data) {
            if (err) {
                handleAxiosError(e, err);
                reject(err);
            } else {
                let nsfw = data.Response.JobsDetail.Result;
                logger.info('腾讯云图片审核结果：' + nsfw);
                resolve({
                    nsfw: nsfw > 0,
                    nsfwMsg: nsfw === 0 ? '合规' : nsfw === 1 ? '违规' : '疑似违规'
                });
            }
        });
    });
}