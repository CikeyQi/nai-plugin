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
        'Euler a': 'k_euler_ancestral',
        'Euler': 'k_euler',
        'DPM++ 2S a': 'k_dpmpp_2s_a',
        'DPM++ 2M': 'k_dpmpp_2m',
        'DPM++ SDE': 'k_dpmpp_sde',
        'DDIM': 'ddim',
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
    let seed = text.match(/seed(\s)?=(\d{1,10})/)?.[2]
    if (seed) {
        parameters.seed = Number(seed)
    } else {
        parameters.seed = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 9))
    }
    text = text.replace(/seed(\s)?=(\d{1,10})/g, '')
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
function SMEAParam(text) {
    let parameters = {}
    if (text.match(/smea/i)) {
        parameters.sm = true
        parameters.sm_dyn = true
        text = text.replace(/smea/i, '')
    }
    return { parameters, text }
}
function modelParam(text) {
    let model = "nai-diffusion-3"
    if (text.match(/毛茸茸模型|nai-furry-3/i)) {
        model = "nai-diffusion-furry-3"
        text = text.replace(/毛茸茸模型|nai-furry-3/i, '')
    }
    return { model, text }
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
        console.log(wordList)
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
                throw error
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
        throw error
    }
    if (ntags) {
        parameters.negative_prompt = ntags
    }
    return (input === '') ? { parameters } : { parameters, input }
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
    // SMEA处理
    result = SMEAParam(text)
    parameters = Object.assign(parameters, result.parameters)
    text = result.text
    // Furry模型处理
    result = modelParam(text)
    let model = result.model
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
    return { parameters, input, model }
}