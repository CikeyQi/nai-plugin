import EventEmitter from 'events'
import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import _ from 'lodash'
import Log from '../utils/logs.js'
import getPicture from './Core.js'
import { nsfwCheck } from '../utils/nsfw.js'
import Config from './Config.js'

const headers = {
    "authority": "api.novelai.net",
    "Origin": "https://novelai.net",
    "Referer": "https://novelai.net",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Content-Type": "application/json",
}

class taskQueue extends EventEmitter {
    constructor(token) {
        super()
        this.queue = []
        this.lock = false
        this.token = token
    }
    // 入队
    enqueue(task) {
        this.queue.push(task)
        this.processNextTask()
    }
    // 出队
    dequeue() {
        return this.queue.shift()
    }
    // 查看队头元素
    front() {
        return this.queue[0]
    }
    // 检查队列是否为空
    isEmpty() {
        return this.queue.length == 0
    }
    // 查询当前队列长度
    get size() {
        return this.queue.length
    }
    async processNextTask() {
        if (this.lock || this.isEmpty()) {
            return
        }
        this.lock = true
        let task = this.dequeue()
        try {
            let config = Config.getConfig()
            let picInfo = await getPicture(task.param, task.user, task.type, task.e, this.token)
            if (config.nsfw_check) {
                let { nsfw, nsfwMsg } = await nsfwCheck(picInfo.base64, task.e)
                if (nsfw) {
                    await task.e.reply("您的图片已经生成好了，但是由于图片内容" + nsfwMsg + "，已被拦截")
                } else {
                    await task.e.reply('您的图片已经生成好了，正在发送中，稍等一下哦~\n本次图片ID为：' + picInfo.fileName)
                    await task.e.reply({ ...segment.image("base64://" + picInfo.base64), origin: true })
                }
            } else {
                await task.e.reply('您的图片已经生成好了，正在发送中，稍等一下哦~\n本次图片ID为：' + picInfo.fileName)
                await task.e.reply({ ...segment.image("base64://" + picInfo.base64), origin: true })
            }
        } catch (error) {
            Log.e(error)
            task.e.reply('出错啦，请联系开发者')
        } finally {
            this.lock = false
            if (!this.isEmpty()) {
                this.processNextTask()
            }
        }
    }
}

class queueList {
    constructor() {
        this.list = []
        this.init()
        this.lastTaskQueue = 0
    }
    async init() {
        this.list = []
        const config = Config.getConfig()
        const url = config.base_url + '/user/data'
        const tokenList = config.novelai_token
        let agent = null
        if (config.proxy.enable) {
            let proxy = 'http://' + Config.getConfig().proxy.host + ':' + Config.getConfig().proxy.port
            agent = new HttpsProxyAgent(proxy)
        }
        let results = await Promise.all(tokenList.map(async (token) => {
            try {
                headers['Authorization'] = 'Bearer ' + token
                let response = await axios.get(url, {
                    headers: headers,
                    httpsAgent: agent
                });
                return {
                    response: response.data,
                    token: token
                }
            } catch (err) {
                logger.error('[nai-plugin] Token初始化' + err)
            }
        }))
        results.map(async (result) => {
            if (result.response.subscription.active) {
                this.list.push(new taskQueue(result.token))
            }
        })
    }

    async enqueue(task) {
        const use_token = Config.getConfig().use_token
        if (use_token != 0) {
            let queue = this.list.filter(queue => queue.token == Config.getConfig().novelai_token[use_token - 1])[0]
            const restNumbeer = queue.lock ? queue.size + 1 : queue.size
            queue.enqueue(task)
            return restNumbeer
        }
        if (this.list.length === 1) {
            const restNumbeer = this.list[0].lock ? this.list[0].size + 1 : this.list[0].size
            this.list[0].enqueue(task)
            return restNumbeer
        }
        if (this.list.filter(queue => !queue.lock).length >= 1) {
            while (true) {
                let nextTaskQueue = (this.lastTaskQueue + 1) % this.list.length
                if (!this.list[nextTaskQueue].lock) {
                    this.lastTaskQueue = nextTaskQueue
                    const restNumbeer = this.list[nextTaskQueue].size
                    this.list[nextTaskQueue].enqueue(task)
                    return restNumbeer
                }
            }
        }
        const orderedQueue = _.orderBy(this.list, ['size', 'lock'], ['asc', 'asc'])
        const restNumbeer = orderedQueue[0].lock ? orderedQueue[0].size + 1 : orderedQueue[0].size
        orderedQueue[0].enqueue(task)
        return restNumbeer
    }
}

const queue = new queueList()
export default queue