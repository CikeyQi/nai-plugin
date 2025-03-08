import axios from "axios";
import Config from "../components/Config.js";
import COS from 'cos-nodejs-sdk-v5';
import FormData from 'form-data';
import { promisify } from 'util';

const ERROR_MAP = {
    400: '请求参数错误，请检查请求参数是否符合要求。',
    401: '未经授权，请提供有效的身份验证信息。',
    403: '访问被拒绝，请确保有足够的权限。',
    404: '资源未找到，请检查请求的URL是否正确。',
    429: '请求过于频繁，请稍后重试。',
    500: '服务器发生错误，请稍后重试。'
};

const STRATEGIES = {
    api4ai: {
        handler: async (buffer, nsfw_check) => {
            const formData = new FormData();
            formData.append('image', buffer, 'image.jpg');

            try {
                const response = await axios.post(
                    "https://demo.api4ai.cloud/nsfw/v1/results",
                    formData,
                    { headers: formData.getHeaders() }
                );

                const nsfw = response.data.results[0].entities[0].classes.nsfw;
                logger.info(`api4ai图片审核结果：${nsfw}`);

                return nsfw > nsfw_check.api4ai.nsfw_threshold
            } catch (error) {
                logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`API4AI审核失败`), logger.red(error));
                throw new Error(ERROR_MAP[error.response?.status] || '未知错误，请检查控制台日志')
            }
        }
    },
    tencent: {
        handler: async (buffer, nsfw_check) => {
            const cos = new COS({
                SecretId: nsfw_check.tencent.SecretId,
                SecretKey: nsfw_check.tencent.SecretKey,
            });

            const params = {
                Bucket: nsfw_check.tencent.Bucket,
                Region: nsfw_check.tencent.Region,
                Method: 'POST',
                Url: `https://${nsfw_check.tencent.Bucket}.ci.${nsfw_check.tencent.Region}.myqcloud.com/image/auditing`,
                ContentType: 'application/xml',
                Body: COS.util.json2xml({
                    Request: {
                        Input: [{ Content: buffer.toString('base64') }],
                        Conf: { BizType: nsfw_check.tencent.BizType }
                    }
                })
            };

            try {
                const data = await promisify(cos.request.bind(cos))(params);
                const result = data.Response.JobsDetail.Result;
                logger.info(`腾讯云图片审核结果：${result}`);

                return result > 0
            } catch (error) {
                logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`腾讯云图片审核失败`), logger.red(error));
                throw new Error('腾讯云图片审核失败')
            }
        }
    }
};

export async function nsfwCheck(data) {
    const { nsfw_check } = Config.getConfig();
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'base64');

    if (!STRATEGIES[nsfw_check.engine]) {
        throw new Error(`不支持的审核类型: ${nsfw_check.engine}`);
    }

    return STRATEGIES[nsfw_check.engine].handler(buffer, nsfw_check);
}