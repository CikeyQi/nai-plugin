import EventEmitter from 'events'
import Log from '../utils/logs.js'
import getPicture from './Core.js'
import { nsfwCheck } from '../utils/nsfw.js'
import Config from './Config.js'

class taskQueue extends EventEmitter {
    // length为队列最大长度
    constructor() {
        super()
        this.queue = []
        this.lock = false
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
    size() {
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
            let picInfo = await getPicture(task.param, task.user, task.type, task.e)
            if (config.nsfw_check) {
                let { nsfw, nsfwMsg } = await nsfwCheck(picInfo.base64, task.e)
                if (nsfw) {
                    await task.e.reply("您的图片已经生成好了，但是由于图片内容" + nsfwMsg + "，已被拦截")
                } else {
                    await task.e.reply('您的图片已经生成好了，正在发送中，稍等一下哦~\n本次图片ID为：' + picInfo.fileName)
                    await task.e.reply({...segment.image("base64://" + picInfo.base64), origin: true})
                }
            } else {
                await task.e.reply('您的图片已经生成好了，正在发送中，稍等一下哦~\n本次图片ID为：' + picInfo.fileName)
                await task.e.reply({...segment.image("base64://" + picInfo.base64), origin: true})
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
let queue = new taskQueue()

/* let queue = new taskQueue()
queue.on('taskEnqueue', async () => {
    // 如果上锁或队列非空则延迟100ms检查,避免占用CPU
    if (queue.lock || queue.isEmpty()) {
        return
        // setTimeout(() => queue.emit('taskEnqueue'), 100)
    }
    // 队列非空且未上锁则处理下一个任务
    queue.lock = true
    let task = queue.dequeue()
    try {
        let picInfo = await getPicture(task.param, task.user, task.type)
        await task.e.reply('您的图片已经生成好了，正在发送中，稍等一下哦~\n本次图片ID为：' + picInfo.fileName)
        await task.e.reply({...segment.image("base64://" + picInfo.base64), origin: true})
    } catch (error) {
        Log.e(error)
        task.e.reply('出错啦,请联系开发者')
    } finally {
        queue.lock = false
        if (!queue.isEmpty()) {
            queue.emit('taskEnqueue')
        }
    }
}) */

export default queue