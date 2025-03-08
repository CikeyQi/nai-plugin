import plugin from '../../../lib/plugins/plugin.js'
import Render from '../components/Render.js'
import { style } from '../resources/help/imgs/config.js'
import _ from 'lodash'

export class help extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'nai-绘画帮助',
            /** 功能描述 */
            dsc: '绘画帮助',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^[/#]nai --help$',
                    /** 执行方法 */
                    fnc: 'help'
                }
            ]
        })
    }

    async help(e) {
        const helpCfg = {
            "themeSet": false,
            "title": "NovelAI帮助",
            "subTitle": "NovelAI-Bot",
            "colWidth": 265,
            "theme": "all",
            "themeExclude": [
                "default"
            ],
            "colCount": 2,
            "bgBlur": true
        }
        const helpList = [
            {
                "group": "绘图",
                "list": [
                    {
                        "icon": 1,
                        "title": "/draw",
                        "desc": "文生图功能"
                    },
                    {
                        "icon": 2,
                        "title": "/image",
                        "desc": "图生图功能"
                    },
                    {
                        "icon": 3,
                        "title": "/re",
                        "desc": "重新执行上次绘制"
                    }
                ]
            },
            {
                "group": "参数",
                "list": [
                    {
                        "icon": 4,
                        "title": "--uc nsfw",
                        "desc": "设置本次绘制负面提示词"
                    },
                    {
                        "icon": 5,
                        "title": "--w 832",
                        "desc": "设置本次绘制宽度"
                    },
                    {
                        "icon": 6,
                        "title": "--h 1216",
                        "desc": "设置本次绘制高度"
                    },
                    {
                        "icon": 7,
                        "title": `--sa "Euler Ancestral"`,
                        "desc": "设置本次绘制采样器"
                    },
                    {
                        "icon": 8,
                        "title": "--st 28",
                        "desc": "设置本次绘制迭代步数"
                    },
                    {
                        "icon": 9,
                        "title": "--g 6",
                        "desc": "设置本次绘制提示引导"
                    },
                    {
                        "icon": 10,
                        "title": "--gr 0",
                        "desc": "设置本次绘制重绘比例"
                    },
                    {
                        "icon": 11,
                        "title": "--ns karras",
                        "desc": "设置本次绘制降噪方法"
                    },
                    {
                        "icon": 12,
                        "title": "--<key> <value>",
                        "desc": "更多<key> <value>请参考官方 API 文档"
                    }
                ]
            },
            {
                "group": "角色",
                "list": [
                    {
                        "icon": 13,
                        "title": "--character <位置> <正面> <负面>",
                        "desc": "自定义单独角色"
                    },
                    {
                        "icon": 14,
                        "title": "<位置>",
                        "desc": "非必填，同官网，格式：A1 E5 B3..."
                    },
                    {
                        "icon": 15,
                        "title": "<正面>",
                        "desc": "必填，单角色正面提示词"
                    },
                    {
                        "icon": 16,
                        "title": "<负面>",
                        "desc": "非必填，单角色负面提示词"
                    },
                ]
            },
            {
                "group": "预设",
                "list": [
                    {
                        "icon": 17,
                        "title": "/pset",
                        "desc": "查看预设"
                    },
                    {
                        "icon": 18,
                        "title": "/pset --add <名称> <内容>",
                        "desc": "添加预设"
                    },
                    {
                        "icon": 19,
                        "title": "/pset --find <名称>",
                        "desc": "检索预设"
                    },
                    {
                        "icon": 20,
                        "title": "/pset --del <名称>",
                        "desc": "删除预设"
                    }
                ]
            },
            {
                "group": "插件",
                "list": [
                    {
                        "icon": 21,
                        "title": "/nai --find <图片ID>",
                        "desc": "查找本地绘制图片"
                    },
                    {
                        "icon": 22,
                        "title": "/nai --info",
                        "desc": "查看当前账户信息"
                    },
                    {
                        "icon": 23,
                        "title": "/nai --reload",
                        "desc": "重载账户信息"
                    },
                    {
                        "icon": 24,
                        "title": "/nai --update",
                        "desc": "插件更新"
                    },
                    {
                        "icon": 25,
                        "title": "/nai --help",
                        "desc": "插件帮助列表"
                    }
                ]
            }
        ]
        let helpGroup = []
        _.forEach(helpList, (group) => {
            _.forEach(group.list, (help) => {
                let icon = help.icon * 1
                if (!icon) {
                    help.css = 'display:none'
                } else {
                    let x = (icon - 1) % 10
                    let y = (icon - x - 1) / 10
                    help.css = `background-position:-${x * 50}px -${y * 50}px`
                }
            })
            helpGroup.push(group)
        })

        let themeData = await this.getThemeData(helpCfg, helpCfg)
        return await Render.render('help/index', {
            helpCfg,
            helpGroup,
            ...themeData,
            element: 'default'
        }, { e, scale: 1.6 })
    }

    async getThemeCfg() {
        let resPath = '{{_res_path}}/help/imgs/'
        return {
            main: `${resPath}/main.png`,
            bg: `${resPath}/bg.jpg`,
            style: style
        }
    }

    async getThemeData(diyStyle, sysStyle) {
        let helpConfig = _.extend({}, sysStyle, diyStyle)
        let colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
        let colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
        let width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
        let theme = await this.getThemeCfg()
        let themeStyle = theme.style || {}
        let ret = [`
          body{background-image:url(${theme.bg});width:${width}px;}
          .container{background-image:url(${theme.main});width:${width}px;}
          .help-table .td,.help-table .th{width:${100 / colCount}%}
          `]
        let css = function (sel, css, key, def, fn) {
            let val = (function () {
                for (let idx in arguments) {
                    if (!_.isUndefined(arguments[idx])) {
                        return arguments[idx]
                    }
                }
            })(themeStyle[key], diyStyle[key], sysStyle[key], def)
            if (fn) {
                val = fn(val)
            }
            ret.push(`${sel}{${css}:${val}}`)
        }
        css('.help-title,.help-group', 'color', 'fontColor', '#ceb78b')
        css('.help-title,.help-group', 'text-shadow', 'fontShadow', 'none')
        css('.help-desc', 'color', 'descColor', '#eee')
        css('.cont-box', 'background', 'contBgColor', 'rgba(43, 52, 61, 0.8)')
        css('.cont-box', 'backdrop-filter', 'contBgBlur', 3, (n) => diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`)
        css('.help-group', 'background', 'headerBgColor', 'rgba(34, 41, 51, .4)')
        css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, .2)')
        css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, .4)')
        return {
            style: `<style>${ret.join('\n')}</style>`,
            colCount
        }
    }
}

