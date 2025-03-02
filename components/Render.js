import Version from './Version.js'
import { pluginRoot } from '../model/path.js'
import fs from 'fs'

function scale(pct = 1) {
    let scale = 100
    scale = Math.min(2, Math.max(0.5, scale / 100))
    pct = pct * scale
    return `style=transform:scale(${pct})`
}

const Render = {
    async render(path, params, cfg) {
        let { e } = cfg
        if (!e.runtime) {
            console.log('未找到e.runtime，请升级至最新版Yunzai')
        }

        let BotName = Version.isMiao ? 'Miao-Yunzai' : 'Yunzai-Bot'
        let currentVersion = null
        const package_path = `${pluginRoot}/package.json`
        try {
            const package_json = JSON.parse(fs.readFileSync(package_path, 'utf-8'))
            if (package_json.version) {
                currentVersion = package_json.version
            }
        } catch (err) {
            logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`读取package.json失败`), logger.red(err));
        }
        return e.runtime.render('nai-plugin', path, params, {
            retType: cfg.retMsgId ? 'msgId' : 'default',
            beforeRender({ data }) {
                let pluginName = ''
                if (data.pluginName !== false) {
                    pluginName = ` & ${data.pluginName || 'nai-plugin'}`
                    if (data.pluginVersion !== false) {
                        pluginName += `<span class="version">${currentVersion}`
                    }
                }
                let resPath = data.pluResPath
                const layoutPath = process.cwd() + '/plugins/nai-plugin/resources/common/layout/'
                return {
                    ...data,
                    _res_path: resPath,
                    _mc_path: resPath,
                    _layout_path: layoutPath,
                    defaultLayout: layoutPath + 'default.html',
                    elemLayout: layoutPath + 'elem.html',
                    sys: {
                        scale: scale(cfg.scale || 1)
                    },
                    copyright: `Created By ${BotName}<span class="version">${Version.yunzai}</span>${pluginName}</span>`,
                    pageGotoParams: {
                        waitUntil: 'networkidle2'
                    }
                }
            }
        })
    }
}

export default Render