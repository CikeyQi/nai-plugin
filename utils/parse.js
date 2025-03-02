import { baiduTranslate } from './translate.js'
import Config from '../components/Config.js'
// 尺寸处理
function scaleParam(text) {
    let config = Config.getConfig()
    const scale = {
        "竖图": { height: 1216, width: 832 },
        "长图": { height: 1216, width: 832 },
        "宽图": { height: 832, width: 1216 },
        "横图": { height: 832, width: 1216 },
        "方图": { height: 1024, width: 1024 }
    };

    let parameters = null;

    Object.entries(scale).forEach(([size, dimensions]) => {
        if (text.includes(size)) {
            parameters = { ...dimensions };
            text = text.replace(new RegExp(size, 'g'), '');
        }
    });

    const result = /(\d{2,7})[\*×](\d{2,7})/.exec(text);
    if (result) {
        let [width, height] = [Math.floor(Number(result[1]) / 64) * 64, Math.floor(Number(result[2]) / 64) * 64];
        const maxArea = config.free_mode ? 1048576 : 3145728;

        while (width * height > maxArea && (width > 64 || height > 64)) {
            width -= width > 64 ? 64 : 0;
            height -= height > 64 ? 64 : 0;
        }

        parameters = { height, width };
        text = text.replace(/(\d{2,4})[\*×](\d{2,4})/g, '');
    }

    return { parameters, text };
}
function samplerParam(text) {
    const samplers = {
        'Euler Ancestral': 'k_euler_ancestral',
        'DPM++ 2S Ancestral': 'k_dpmpp_2s_ancestral',
        'DPM++ 2M SDE': 'k_dpmpp_2m_sde',
        'Euler': 'k_euler',
        'DPM++ 2M': 'k_dpmpp_2m',
        'DPM++ SDE': 'k_dpmpp_sde',
    }
    let parameters = null
    Object.entries(samplers).forEach(([alias, sampler]) => {
        if (text.includes(alias)) {
            parameters = { sampler: sampler }
            text = text.replace(new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '')
        }
    })
    return { parameters, text }
}
function seedParam(text) {
    let parameters = {}
    let seed = text.match(/种子\s?(\d{9})/)?.[1]
    if (seed) {
        parameters.seed = Number(seed)
    } else {
        parameters.seed = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 9))
    }
    text = text.replace(/种子\s?\d+/g, '')
    return { parameters, text }
}
function stepsParam(text) {
    let config = Config.getConfig()
    let parameters = {}
    let steps = text.match(/步数\s?(\d+)/)?.[1]
    const maxStep = config.free_mode ? 28 : 50
    parameters.steps = steps ? Math.min(Math.max(1, Number(steps)), maxStep) : 28
    text = text.replace(/步数\s?\d+/g, '')
    return { parameters, text }
}

async function advancedParam(text) {
    const parameters = {};
    const regex = /(?:\s+)?--([a-zA-Z0-9_\.]+)\s+([^\s]+)/g;

    text = text.replace(regex, (match, key, value) => {
        const keys = key.split('.');
        let current = parameters;

        for (let i = 0; i < keys.length - 1; i++) {
            const part = keys[i];
            current[part] = current[part] || {};
            current = current[part];
        }

        let finalValue = value.trim();
        if (finalValue === 'true' || finalValue === 'false') {
            finalValue = finalValue === 'true' ? true : false;
        } else if (!isNaN(Number(finalValue))) {
            finalValue = Number(finalValue);
        }

        current[keys[keys.length - 1]] = finalValue;

        return '';
    });

    return { parameters, text };
}
async function promptParam(text) {
    let parameters = {}
    let input = ''
    let ntags = text.match(/ntags(\s)?=(.*)$/s)?.[2]
    if (ntags) {
        input = text.replace(/ntags(\s)?=(.*)$/s, '')
    } else {
        input = text
    }
    async function translator(wordText) {
        let wordList = wordText.split(/[,，]+/)
        for (let i = 0; i < wordList.length; i++) {
            if (!wordList[i].match(/[\u4e00-\u9fa5]/g)) continue
            try {
                let result = await baiduTranslate(wordList[i].trim())
                if (result.status) {
                    wordList[i] = result.msg
                } else {
                    wordList[i] = null
                }
            } catch (error) {
                throw new Error("翻译服务出错", { cause: error });
            }
        }
        wordList = wordList.filter(item => item !== null)
        return wordList.join(',')
    }
    try {
        input = await translator(input)
        if (ntags) {
            ntags = await translator(ntags)
        }
    } catch (error) {
        throw new Error(`处理输入时出错: ${error.message}`, { cause: error });
    }

    input = input.trim();

    if (ntags) {
        parameters.negative_prompt = ntags;
        parameters.v4_negative_prompt = { caption: { base_caption: ntags } };
    }

    const result = { parameters };
    if (input) {
        result.input = input;
        parameters.v4_prompt = { caption: { base_caption: input } };
    }

    return result;
}
export async function handleParam(e, text) {
    let parameters = {}
    let result = null
    // 尺寸处理
    result = scaleParam(text)
    parameters = Object.assign(parameters, result.parameters)
    text = result.text
    // 采样处理
    result = samplerParam(text)
    parameters = Object.assign(parameters, result.parameters)
    text = result.text
    // 步数处理
    result = stepsParam(text)
    parameters = Object.assign(parameters, result.parameters)
    text = result.text
    // 种子处理
    result = seedParam(text)
    parameters = Object.assign(parameters, result.parameters)
    text = result.text
    // 处理高级传参方法
    result = await advancedParam(text)
    parameters = Object.assign(parameters, result.parameters)
    text = result.text
    // 正负词条处理及翻译
    try {
        result = await promptParam(text)
    } catch (error) {
        throw error
    }
    // 处理绑定画风
    let artist = await redis.get(`nai:bindArts:${e.user_id}`)
    if (artist) {
        artist = JSON.parse(artist)
        let artistInput = ''
        artist.forEach((item) => {
            artistInput += `[artist:${item}], `
        })
        result.input = artistInput + result.input
    }
    parameters = Object.assign(parameters, result.parameters)
    let input = result.input || undefined
    return { parameters, input }
}