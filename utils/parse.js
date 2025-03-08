import { translate } from "./translate.js";

const parseCoords = p => /^[A-E][1-5]$/i.test(p) ? {
    x: +(((p.charCodeAt(0) & 31) - 1) * 0.2 + 0.1).toFixed(2),
    y: +((p[1] - 1) * 0.2 + 0.1).toFixed(2)
} : { x: 0, y: 0 };

const KEY_MAP = { w: 'width', h: 'height', sa: 'sampler', st: 'steps', g: 'scale', gr: 'cfg_rescale', ns: 'noise_schedule' };

export async function handle(text) {
    const [input, ...params] = text.trim().split(/--+/g).map(p => p.trim());
    const [inputTrans, parameters] = [await translate(input), {
        v4_prompt: { caption: { base_caption: "", char_captions: [] }, use_coords: false },
        v4_negative_prompt: { caption: { char_captions: [] } },
        characterPrompts: [],
        use_coords: false
    }];
    parameters.v4_prompt.caption.base_caption = inputTrans;

    for (const param of params) {
        const tokens = (param.match(/(?:[^\s"]+|"[^"]*")/g) || []).map(v => v.replace(/^"|"$/g, '').trim());
        const [k, ...vals] = tokens;
        const key = k?.toLowerCase();

        if (!vals.length) continue;

        if (['uc', 'negative_prompt'].includes(key)) {
            const translated = await translate(vals.join(' '));
            parameters.v4_negative_prompt.caption.base_caption = parameters.negative_prompt = translated;
        } else if (['sa', 'sampler'].includes(key)) {
            const samplers = {
                'Euler Ancestral': 'k_euler_ancestral',
                'DPM++ 2S Ancestral': 'k_dpmpp_2s_ancestral',
                'DPM++ 2M SDE': 'k_dpmpp_2m_sde',
                'Euler': 'k_euler',
                'DPM++ 2M': 'k_dpmpp_2m',
                'DPM++ SDE': 'k_dpmpp_sde',
            };
            parameters.sampler = samplers[vals[0]] || vals[0];
        } else if (key === 'character') {
            const [a, b, c] = [...vals, '', '', ''];
            const isPos = /^[A-E][1-5]$/i.test(a);
            const [pos, p, n] = isPos ? [a, b, c] : ['', a, b];
            const center = parseCoords(pos);
            const [prompt, uc] = await Promise.all([p, n].map(translate));
            parameters.characterPrompts.push({ prompt, uc, center });

            [parameters.v4_prompt, parameters.v4_negative_prompt].forEach((obj, i) => {
                obj.caption.char_captions.push({
                    char_caption: i === 0 ? prompt : uc,
                    centers: [center]
                });
            });
        } else {
            const paramKey = KEY_MAP[key] || key;
            const value = vals.join(' ');

            parameters[paramKey] = value === 'true' ? true :
                value === 'false' ? false :
                    +value + 0 == value ? +value :
                        value;
        }
    }

    if (parameters.characterPrompts.length > 1) {
        const allHaveCoords = parameters.characterPrompts.every(c => c.center.x !== 0 && c.center.y !== 0);
        if (allHaveCoords) {
            parameters.use_coords = true;
            parameters.v4_prompt.use_coords = true;
        }
    }

    parameters.seed ||= Math.floor(Math.random() * 1e10);
    return { input: inputTrans, parameters };
}