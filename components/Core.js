import axios from "axios";
import Config from "./Config.js";
import download from "./Download.js";
import _ from "lodash";
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs'

const def = Config.getConfig().parameters;

const createPrompt = (base, isNegative = false) => ({
  caption: { base_caption: base, char_captions: [] },
  ...(!isNegative && { use_coords: false, use_order: true })
});

const commonParameters = {
  params_version: 3,
  width: def.width,
  height: def.height,
  scale: def.scale,
  sampler: def.sampler,
  steps: def.steps,
  n_samples: 1,
  ucPreset: 0,
  qualityToggle: true,
  dynamic_thresholding: false,
  controlnet_strength: 1,
  legacy: false,
  add_original_image: true,
  cfg_rescale: def.cfg_rescale,
  noise_schedule: def.noise_schedule,
  legacy_v3_extend: false,
  skip_cfg_above_sigma: null,
  use_coords: false,
  characterPrompts: [],
  v4_prompt: createPrompt(""),
  v4_negative_prompt: createPrompt(def.negative_prompt, true),
  negative_prompt: def.negative_prompt,
  reference_image_multiple: [],
  reference_information_extracted_multiple: [],
  reference_strength_multiple: []
};

const defaultParam = {
  text: {
    input: "",
    model: "nai-diffusion-4-full",
    action: "generate",
    parameters: commonParameters
  },
  image: {
    input: "",
    model: "nai-diffusion-4-full",
    action: "img2img",
    parameters: {
      ...commonParameters,
      strength: 0.7,
      noise: 0.2,
      image: "",
    }
  }
};

const headers = {
  authority: "api.novelai.net",
  Origin: "https://novelai.net",
  Referer: "https://novelai.net",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
  "Content-Type": "application/json"
};

async function getPicture(param, user, type, token) {
  const { base_url } = Config.getConfig().reverse_proxy;
  const mergeData = _.merge({}, defaultParam[type], param);

  const { free_mode, proxy } = Config.getConfig();
  const agent = proxy.enable && new HttpsProxyAgent(`http://${proxy.host}:${proxy.port}`);

  const roundTo64 = v => Math.round(v / 64) * 64 || 64;
  let width = roundTo64(mergeData.parameters.width);
  let height = roundTo64(mergeData.parameters.height);

  const maxArea = free_mode ? 1048576 : 3145728;
  let area = width * height;
  if (area > maxArea) {
    const ratio = width / height;
    const scale = Math.sqrt(maxArea / area);
    width = roundTo64(width * scale);
    height = roundTo64(width / ratio);

    while ((width * height) > maxArea) {
      width -= 64;
      height = roundTo64(width / ratio);
    }
  }
  mergeData.parameters.width = Math.max(width, 64);
  mergeData.parameters.height = Math.max(height, 64);

  if (free_mode) {
    mergeData.parameters.steps = Math.min(mergeData.parameters.steps, 28);
  }

  logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`用户 ${user} 参数：`), mergeData);

  try {
    const response = await axios.post(`${base_url}/ai/generate-image`, mergeData, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      httpsAgent: agent,
      responseType: 'arraybuffer'
    });

    const fileName = Date.now();
    return {
      base64: fs.readFileSync(await download(response.data, user, fileName), 'base64'),
      fileName
    };
  } catch (error) {
    logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`绘制图片失败`), logger.red(error));
    throw new Error('绘制图片失败');
  }
}

export default getPicture