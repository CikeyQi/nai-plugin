import axios from 'axios'

/**
 * 图片URL转Base64
 * @param {*} url 图片url
 * @returns 
 */
export async function url2Base64(url) {
    let base64 = await axios.get(url, {
        responseType: 'arraybuffer'
    }).then(res => {
        return Buffer.from(res.data, 'binary').toString('base64')
    }).catch(err => {
        logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`图片转URL出现错误`), logger.red(err));
    })
    return base64
}