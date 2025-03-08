import Config from '../components/Config.js'
import axios from 'axios'
import crypto from 'crypto'
import { HttpsProxyAgent } from 'https-proxy-agent'

const SYSTEM = `
你是专业的中文到英文NovelAI提示词翻译专家。
任务：将用户提供的中文描述翻译为英文关键词，并为重要元素添加权重标记。

输出格式要求：
- 仅输出英文关键词，用逗号分隔
- 不要添加任何解释、注释或其他文字
- 对重要元素使用{tag}增加权重，次要元素使用[tag]降低权重

翻译原则：
- 只需要翻译中文部分，英文部分不要更改，原样返回即可
- 不要更改文字排列顺序，翻译后应放回原文中，不应该放在末尾或最前面
- 准确翻译原文描述的视觉元素和场景
- 为主体和重要特征添加{}权重增强
- 为次要或背景元素添加[]权重降低
- 不要添加原文未提及的元素
- 若存在角色名称，需同时给出角色名和所属作品名，例如：纳西妲=>nahida, genshin impact

注意事项：
- 不要自行添加画风标签、质量标签
- 这些特殊标签将由系统另行处理
- 专注于内容翻译和权重分配
`

const ERROR_MAP = {
    52001: '请求超时，请重试',
    52002: '系统错误，请重试',
    52003: '未授权用户，请检查appid或服务状态',
    54000: '必填参数为空',
    54001: '签名错误',
    54003: '访问频率受限，请认证后切换高级版',
    54004: '账户余额不足',
    54005: '长query请求频繁，请3秒后再试',
    58000: '客户端IP非法',
    58001: '译文语言不支持',
    58002: '服务已关闭',
    90107: '认证未通过'
}

const TRANSLATE_STRATEGIES = {
    baidu: {
        handler: async (keyword, config) => {
            const { appid, appkey } = config.translate
            const salt = crypto.randomBytes(16).toString('hex').slice(0, 16)
            const sign = crypto
                .createHash('md5')
                .update(`${appid}${keyword}${salt}${appkey}`)
                .digest('hex')

            const { data } = await axios.get('http://api.fanyi.baidu.com/api/trans/vip/translate', {
                params: { q: keyword, from: 'zh', to: 'en', appid, salt, sign }
            })

            if (data.error_code) {
                logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`Baidu翻译功能出现问题`), logger.red(data.error_code));
                throw new Error(ERROR_MAP[data.error_code] || '未知错误，请检查控制台日志')
            }
            return data.trans_result[0].dst
        }
    },
    gemini: {
        handler: async (keyword, config) => {
            const { proxy: { enable, host, port }, translate: { gemini: { base_url, model, apikey } } } = config
            const agent = enable && new HttpsProxyAgent(`http://${host}:${port}`)
            const response = await axios.post(
                `${base_url}/v1beta/models/${model}:generateContent`,
                {
                    system_instruction: {
                        parts: {
                            text: SYSTEM
                        }
                    },
                    contents: {
                        parts: {
                            text: `请将以下中文描述翻译为英文关键词，并为重要元素添加权重标记：${keyword}`
                        }
                    }
                },
                {
                    params: { key: apikey },
                    headers: { 'Content-Type': 'application/json' },
                    httpsAgent: agent
                }
            )

            const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
            if (!text) throw new Error('Gemini翻译功能出现问题')
                console.log(text)
            return text
        }
    }
}

export async function translate(keyword) {
    if (!/[\u4e00-\u9fa5]/.test(keyword)) {
        return keyword
    }
    try {
        const config = await Config.getConfig()
        const engine = config.translate?.engine || ''

        if (!engine) {
            return keyword
        }

        if (!TRANSLATE_STRATEGIES[engine]) {
            throw new Error(`翻译引擎配置错误`)
        }

        return await TRANSLATE_STRATEGIES[engine].handler(keyword, config)

    } catch (error) {
        logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`翻译功能出现问题`), logger.red(error));
        const errorMsg = error.response?.data?.error?.message || error.message
        throw new Error(errorMsg || `未知错误，请检查控制台日志`)
    }
}