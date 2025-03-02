import axios from "axios";
import Config from "./Config.js";
import download from "./Download.js";
import _ from "lodash";
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs'
import handleAxiosError from '../utils/handleAxiosError.js'

/**
 * 获取图片
 * @param {*} param 发送的参数
 * @param {*} user 用户ID
 * @param {*} type txt2img文生图，img2img图生图
 * @param {*} e 消息对象
 */
async function getPicture(param, user, type, e, token) {
  let url = Config.getConfig().reverse_proxy.base_url + '/ai/generate-image';
  let data = defaultParam[type]
  let mergeData = _.merge({}, data, param)
  logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`用户 ${user} 发起了一次绘图请求，参数为：`));
  logger.mark(mergeData.parameters);
  let agent = null
  if (Config.getConfig().proxy.enable) {
    let proxy = 'http://' + Config.getConfig().proxy.host + ':' + Config.getConfig().proxy.port
    agent = new HttpsProxyAgent(proxy)
  }
  let response = null
  try {
    headers['Authorization'] = 'Bearer ' + token
    response = await axios.post(url, mergeData, {
      headers: headers,
      httpsAgent: agent,
      responseType: 'arraybuffer'
    })
  } catch (error) {
    handleAxiosError(e, error)
    throw error
  }
  let fileName = new Date().getTime()
  let filePath = await download(response.data, user, fileName)
  // 文件路径转base64
  let base64 = fs.readFileSync(filePath, 'base64')
  return {
    base64: base64,
    fileName: fileName
  }
}

/* *
 * 获取随机Token
 * @returns
 */
/* async function getToken() {
  let config = Config.getConfig()
  let tokenList = config.novelai_token
  let use_token = config.use_token
  let token = null
  if (use_token === 0) {
    token = tokenList[Math.floor(Math.random() * tokenList.length)]
  } else {
    token = tokenList[use_token - 1]
  }
  return 'Bearer ' + token
} */

const headers = {
  "authority": "api.novelai.net",
  "Origin": "https://novelai.net",
  "Referer": "https://novelai.net",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Content-Type": "application/json",
}

const defaultParam = {
  "txt2img": {
    "input": "[artist:ciloranko],artist:kazutake_hazano,[artist:kedama milk],[artist:ask_(askzy)],artist:wanke,artist:wlop,artist:fujiyama,",
    "model": "nai-diffusion-4-full",
    "action": "generate",
    "parameters": {
      "params_version": 3,
      "width": 832,
      "height": 1216,
      "scale": 6,
      "sampler": "k_euler_ancestral",
      "steps": 23,
      "seed": 255374418,
      "n_samples": 1,
      "ucPreset": 0,
      "qualityToggle": true,
      "dynamic_thresholding": false,
      "controlnet_strength": 1,
      "legacy": false,
      "add_original_image": true,
      "cfg_rescale": 0,
      "noise_schedule": "karras",
      "legacy_v3_extend": false,
      "skip_cfg_above_sigma": null,
      "use_coords": false,
      "characterPrompts": [],
      "v4_prompt": {
        "caption": {
          "base_caption": "[artist:ciloranko],artist:kazutake_hazano,[artist:kedama milk],[artist:ask_(askzy)],artist:wanke,artist:wlop,artist:fujiyama,",
          "char_captions": []
        },
        "use_coords": false,
        "use_order": true
      },
      "v4_negative_prompt": {
        "caption": {
          "base_caption": "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
          "char_captions": []
        }
      },
      "negative_prompt": "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
      "reference_image_multiple": [],
      "reference_information_extracted_multiple": [],
      "reference_strength_multiple": [],
      "deliberate_euler_ancestral_bug": false,
      "prefer_brownian": true
    }
  },
  "img2img": {
    "input": "[artist:ciloranko],artist:kazutake_hazano,[artist:kedama milk],[artist:ask_(askzy)],artist:wanke,artist:wlop,artist:fujiyama,",
    "model": "nai-diffusion-4-full",
    "action": "img2img",
    "parameters": {
      "params_version": 3,
      "width": 832,
      "height": 1216,
      "scale": 6,
      "sampler": "k_euler_ancestral",
      "steps": 23,
      "seed": 123816999,
      "n_samples": 1,
      "strength": 0.7,
      "noise": 0.2,
      "ucPreset": 0,
      "qualityToggle": true,
      "dynamic_thresholding": false,
      "controlnet_strength": 1,
      "legacy": false,
      "add_original_image": true,
      "cfg_rescale": 0,
      "noise_schedule": "karras",
      "legacy_v3_extend": false,
      "skip_cfg_above_sigma": null,
      "use_coords": false,
      "characterPrompts": [],
      "image": "",
      "extra_noise_seed": 123816999,
      "v4_prompt": {
        "caption": {
          "base_caption": "[artist:ciloranko],artist:kazutake_hazano,[artist:kedama milk],[artist:ask_(askzy)],artist:wanke,artist:wlop,artist:fujiyama,",
          "char_captions": []
        },
        "use_coords": false,
        "use_order": true
      },
      "v4_negative_prompt": {
        "caption": {
          "base_caption": "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
          "char_captions": []
        }
      },
      "negative_prompt": "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]",
      "reference_image_multiple": [],
      "reference_information_extracted_multiple": [],
      "reference_strength_multiple": [],
      "deliberate_euler_ancestral_bug": false,
      "prefer_brownian": true
    }
  }
}

export default getPicture
