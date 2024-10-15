// 引入依赖
import EventEmitter from 'events';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import _ from 'lodash';
import Log from '../utils/logs.js';
import getPicture from './Core.js';
import { nsfwCheck } from '../utils/nsfw.js';
import Config from './Config.js';

// 设置请求头参数
const headers = {
    "authority": "api.novelai.net",
    "Origin": "https://novelai.net",
    "Referer": "https://novelai.net",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    "Content-Type": "application/json",
};

// 定义任务队列类
class TaskQueue extends EventEmitter {
    constructor(token) {
        super();
        this.queue = []; // 初始化任务队列
        this.lock = false; // 锁，用于控制任务执行
        this.token = token; // Token
    }
    // 添加任务到队列
    enqueue(task) {
        this.queue.push(task);
        this.processNextTask();
    }
    // 从队列中取出任务
    dequeue() {
        return this.queue.shift();
    }
    // 获取队列第一个任务
    front() {
        return this.queue[0];
    }
    // 检查队列是否为空
    isEmpty() {
        return this.queue.length === 0;
    }
    // 获取当前队列长度
    get size() {
        return this.queue.length;
    }
    // 处理队列中的下一任务
    async processNextTask() {
        if (this.lock || this.isEmpty()) return;

        this.lock = true; // 锁定队列

        let task = this.dequeue(); // 取出任务
        try {
            let config = Config.getConfig();
            let picInfo = await getPicture(task.param, task.user, task.type, task.e, this.token);
            if (config.nsfw_check !== false) {
                let { nsfw, nsfwMsg } = await nsfwCheck(picInfo.base64, task.e);
                if (nsfw) {
                    await task.e.reply("您的图片已经生成好了，但是由于图片内容" + nsfwMsg + "，已被拦截");
                } else {
                    await this.replyImage(task.e, picInfo);
                }
            } else {
                await this.replyImage(task.e, picInfo);
            }
        } catch (error) {
            Log.e(error);
            task.e.reply('出错啦，请联系开发者');
        } finally {
            this.lock = false; // 解锁队列，处理下一个任务
            if (!this.isEmpty()) this.processNextTask();
        }
    }

    // 回复图片
    async replyImage(e, picInfo) {
        const { forward_msg } = Config.getConfig();
        const message = '您的图片已经生成好了，正在发送中，稍等一下哦~\n本次图片ID为：' + picInfo.fileName;
        const image = segment.image("base64://" + picInfo.base64);

        if (forward_msg) {
            await e.reply(Bot.makeForwardMsg([
                { message: message },
                { message: { ...image, origin: true } }
            ]))
        } else {
            await e.reply(message);
            await e.reply([{ ...image, origin: true },
            segment.button([{ text: '再来一张', callback: e.msg }])
            ]);
        }
    }
}

// 定义队列列表类
class QueueList {
    constructor() {
        this.list = []; // 初始化队列列表
        this.lastTaskQueue = 0; // 上一个处理任务的队列索引
        this.init(); // 初始化队列
    }
    // 初始化QueueList
    async init() {
        this.list = [];

        const config = await Config.getConfig();
        const url = `${config.reverse_proxy.user_url}/user/data`;
        const { novelai_token: tokenList, proxy } = config;
        const headers = {};

        let agent = proxy.enable
            ? new HttpsProxyAgent(`http://${proxy.host}:${proxy.port}`)
            : null;

        let results = await Promise.all(tokenList.map(async (token) => {
            headers['Authorization'] = `Bearer ${token}`;

            try {
                let response = await axios.get(url, { headers, httpsAgent: agent });
                let { subscription } = response.data;

                if (subscription.active || subscription.trainingStepsLeft.purchasedTrainingSteps > 0 || subscription.trainingStepsLeft.fixedTrainingStepsLeft > 0) {
                    this.list.push(new TaskQueue(token));
                    return { status: 'fulfilled', data: response.data, token };
                }
                return { status: 'rejected', reason: '账户未订阅或已过期' };
            } catch (error) {

                let errorMessage = "发生未知错误";
                if (error.response) {
                    errorMessage = `请求遇到问题，服务器返回状态码：${error.response.status}`;
                } else if (error.request) {
                    errorMessage = "网络异常或服务器没有响应，请检查您的网络连接后重试";
                } else if (error.message) {
                    errorMessage = `请求发送失败：${error.message}`;
                }
                if (error.code) {
                    errorMessage += ` 错误码：${error.code}`;
                }
                return { status: 'rejected', reason: errorMessage };
            }
        }));

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const message = `第${index + 1}个Token初始化失败，原因：${result.reason}`;
                logger.info(arguments.length)
                if (arguments.length > 0 && typeof arguments[0].reply === 'function') {
                    arguments[0].reply(message);
                }
            }
        });
    }

    // 将任务添加到最适合的队列
    async enqueue(task) {
        const use_token = Config.getConfig().use_token;
        let queue;

        if (use_token !== 0) {
            queue = this.list.find(q => q.token === Config.getConfig().novelai_token[use_token - 1]);
            if (queue) return this.addTaskToQueue(queue, task);
        }

        if (this.list.length === 1) {
            return this.addTaskToQueue(this.list[0], task);
        }

        queue = this.findAvailableQueue() || this.findQueueByLeastSize();

        return this.addTaskToQueue(queue, task);
    }

    // 查找没有锁定的队列
    findAvailableQueue() {
        const startQueue = this.lastTaskQueue;
        do {
            this.lastTaskQueue = (this.lastTaskQueue + 1) % this.list.length;
            if (!this.list[this.lastTaskQueue].lock) {
                return this.list[this.lastTaskQueue];
            }
        } while (this.lastTaskQueue !== startQueue);

        return null;
    }

    // 按队列大小顺序排序，并返回第一个队列
    findQueueByLeastSize() {
        let orderedQueue = _.orderBy(this.list, ['size', 'lock'], ['asc', 'asc']);
        return orderedQueue[0];
    }

    // 将任务添加到指定的队列，并返回剩余的任务数量
    addTaskToQueue(queue, task) {
        const restNumber = queue.lock ? queue.size + 1 : queue.size;
        queue.enqueue(task);
        return restNumber;
    }
}

// 初始化队列列表实例
const queue = new QueueList();

// 导出队列
export default queue;