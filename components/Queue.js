import EventEmitter from 'events';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import _ from 'lodash';
import getPicture from './Core.js';
import { nsfwCheck } from '../utils/nsfw.js';
import Config from './Config.js';

class TaskQueue extends EventEmitter {
    constructor(token) {
        super();
        this.queue = [];
        this.lock = false;
        this.token = token;
    }

    enqueue(task) {
        this.queue.push(task);
        this.processNextTask();
    }

    async processNextTask() {
        if (this.lock || !this.queue.length) return;
        this.lock = true;
        const task = this.queue.shift();

        try {
            const config = Config.getConfig();
            const picInfo = await getPicture(task.param, task.user, task.type, this.token);

            if (config.nsfw_check.engine) {
                const nsfw = await nsfwCheck(picInfo.base64);
                if (nsfw) throw new Error('图片内容违规已被拦截');
            }
            task._callback?.resolve(picInfo)
        } catch (error) {
            logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`生成图片失败`), logger.red(error));
            task._callback?.reject(error)
        } finally {
            this.lock = false;
            if (this.queue.length) this.processNextTask();
        }
    }
}

class QueueList {
    constructor() {
        this.list = [];
        this.lastIndex = 0;
        this.init();
    }

    async init() {
        try {
            const config = await Config.getConfig();
            const { proxy, novelai_token } = config;
            const agent = proxy.enable && new HttpsProxyAgent(`http://${proxy.host}:${proxy.port}`);

            this.list = (await Promise.all(novelai_token.map(async token => {
                try {
                    const { data } = await axios.get(`${config.reverse_proxy.user_url}/user/data`, {
                        headers: { Authorization: `Bearer ${token}` },
                        httpsAgent: agent
                    });
                    const { active, trainingStepsLeft: { fixedTrainingStepsLeft, purchasedTrainingSteps } } = data.subscription;
                    return (active || purchasedTrainingSteps > 0 || fixedTrainingStepsLeft > 0) ? new TaskQueue(token) : null;
                } catch (error) {
                    logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`Token初始化失败`), logger.red(error));
                    return null;
                }
            }))).filter(Boolean);
        } catch (error) {
            logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`队列初始化失败`), logger.red(error));
        }
    }

    enqueue(task) {
        const config = Config.getConfig();
        let queue = config.use_token
            ? this.list.find(q => q.token === config.novelai_token[config.use_token - 1])
            : this.list[0] || this.findAvailableQueue() || _.orderBy(this.list, ['size'], ['asc'])[0];

        queue?.enqueue(task);
        return queue?.size ?? 0;
    }

    findAvailableQueue() {
        for (let i = 1; i <= this.list.length; i++) {
            const index = (this.lastIndex + i) % this.list.length;
            if (!this.list[index].lock) {
                this.lastIndex = index;
                return this.list[index];
            }
        }
    }
}

export default new QueueList();