import { baiduTranslate } from './translate.js'
// 尺寸处理
function scaleParam(text) {
    const scale = {
        "竖图": { height: 1216, width: 832 },
        "长图": { height: 1216, width: 832 },
        "宽图": { height: 832, width: 1216 },
        "横图": { height: 832, width: 1216 },
        "方图": { height: 1024, width: 1024 },
    }
    let parameters = null
    Object.entries(scale).forEach(([size, dimensions]) => {
        if (text.includes(size)) {
            parameters = { ...Object.assign(dimensions) }
            text = text.replace(new RegExp(size, 'g'), '')
        }
    })
    const result = /(\d{2,7})\*(\d{2,7})/.exec(text)
    if (result) {
        let [width, height] = [Math.floor(Number(result[1]) / 64) * 64, Math.floor(Number(result[2]) / 64) * 64]
        let toggle = true
        while (width * height > 1048576) {
            if (toggle && width > 64) {
                width -= 64
            } else if (!toggle && height > 64) {
                height -= 64
            }
            toggle = !toggle
        }
        parameters = { height: height, width: width }
        text = text.replace(/(\d{2,4})\*(\d{2,4})/g, '')
    }
    if (!parameters) {
        // 随机抽一个尺寸
        const keys = Object.keys(scale)
        const randomKey = keys[Math.floor(Math.random() * keys.length)]
        parameters = scale[randomKey]
    }
    return { parameters, text }
}
function samplerParam(text) {
    const samplers = {
        'Euler': 'k_euler',
        'Euler a': 'k_euler_a',
        'DPM++ 2S a': 'k_dpmpp_2s_a',
        'DPM++ 2M': 'k_dpmpp_2m',
        'DPM++ SDE': 'k_dpmpp_sde',
        'DDIM': 'ddim',
    }
    let parameters = null
    Object.entries(samplers).forEach(([alias, sampler]) => {
        if (text.includes(alias)) {
            parameters = { sampler: sampler }
            text = text.replace(new RegExp(alias, 'g'), '')
        }
    })
    return { parameters, text }
}
function seedParam(text) {
    let parameters = {}
    let seed = text.match(/seed(\s)?=(\d{1,10})$/)?.[2]
    if (seed) {
        parameters.seed = Number(seed)
    } else {
        parameters.seed = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 9))
    }
    text = text.replace(/seed(\s)?=(\d{1,10})$/g, '')
    return { parameters, text }
}
async function promptParam(text) {
    let parameters = {}
    let input = ''
    let ntags = text.match(/ntags(\s)?=(.*)$/)?.[2]
    if (ntags) {
        input = text.replace(/ntags(\s)?=(.*)$/, '')
    } else {
        input = text
    }
    async function translator(wordText) {
        let wordList = wordText.split(/[,，\s]+/)
        console.log(wordList)
        for (let i = 0; i < wordList.length; i++) {
            if (!wordList[i].match(/[\u4e00-\u9fa5]/g)) continue
            try {
                wordList[i] = await baiduTranslate(wordList[i].trim())
            } catch (error) {
                throw error
            }
        }
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
    // 种子处理
    result = seedParam(text)
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