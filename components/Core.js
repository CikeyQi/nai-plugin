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
async function getPicture(param, user, type, e) {
  console.log("用户ID：" + user + "发起了一次请求")
  let url = Config.getConfig.base_url + '/ai/generate-image';
  let data = defaultParam[type]
  let mergeData = _.merge({}, data, param)
  let agent = null
  console.log(mergeData)
  if (Config.getConfig().proxy.enable) {
    let proxy = 'http://' + Config.getConfig().proxy.host + ':' + Config.getConfig().proxy.port
    agent = new HttpsProxyAgent(proxy)
  }
  let response = null
  try {
    headers['Authorization'] = await getToken()
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

/**
 * 获取随机Token
 * @returns
 */
async function getToken() {
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
}

const headers = {
  "authority": "api.novelai.net",
  "Origin": "https://novelai.net",
  "Referer": "https://novelai.net",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Content-Type": "application/json",
}

const defaultParam = {
  "txt2img": {
    "input": "miku", // 正向提示词
    "model": "nai-diffusion-3", // 模型
    "action": "generate", // 动作
    "parameters": {
      "width": 832, // 宽度
      "height": 1216, // 高度
      "scale": 5, // 提示词引导系数
      "sampler": "k_euler", // 采样方法
      "steps": 28, // 迭代步数
      "n_samples": 1, // 批次
      "ucPreset": 0, // 负面提示词引导系数
      "qualityToggle": true, // 是否开启质量优化
      "sm": false, // SMEA开关
      "sm_dyn": false, // SMEA动态开关
      "dynamic_thresholding": false,
      "controlnet_strength": 1,
      "legacy": false,
      "add_original_image": false,
      "uncond_scale": 1,
      "cfg_rescale": 0, // 提示引导重新缩放
      "noise_schedule": "native", // 噪点调度
      "seed": 3032217268, // 随机种子
      "negative_prompt": "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]" // 反向提示词
    }
  },
  "img2img": {
    "input": "miku",
    "model": "nai-diffusion-3",
    "action": "img2img",
    "parameters": {
      "width": 896, // 宽度
      "height": 896,  // 高度
      "scale": 5, // 提示词引导系数
      "sampler": "k_euler", // 采样方法
      "steps": 28, // 迭代步数
      "n_samples": 1, // 批次
      "strength": 0.55,
      "noise": 0,
      "ucPreset": 1, // 负面提示词引导系数
      "qualityToggle": true, // 是否开启质量优化
      "sm": false, // SMEA开关
      "sm_dyn": false, // SMEA动态开关
      "dynamic_thresholding": false,
      "controlnet_strength": 1,
      "legacy": false,
      "add_original_image": false,
      "uncond_scale": 1,
      "cfg_rescale": 0, // 提示指导重新缩放
      "noise_schedule": "native", // 噪点调度
      "image": "", // 图片 base64
      "seed": 3263049076, // 随机种子
      "extra_noise_seed": 3263049076,
      "negative_prompt": "nsfw, lowres, {bad}, error, fewer, extra, missing, worst quality, jpeg artifacts, bad quality, watermark, unfinished, displeasing, chromatic aberration, signature, extra digits, artistic error, username, scan, [abstract]" // 反向提示词
    }
  }
}

export default getPicture
