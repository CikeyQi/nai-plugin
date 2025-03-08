import fs from 'fs';
import { pluginResources } from '../model/path.js';
import admzip from 'adm-zip';

/**
 * @param {string} filename
 * @param {string} data
 * @returns {string} path
 */
export default async function download(data, user, filename) {
    if (typeof user === 'number') {
        user = user.toString();
    }
    user = user.replace(/:/g, "-")
    logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`图片缓存位置：${pluginResources}/userPic/${user}/${filename}.zip`));
    if (!fs.existsSync(`${pluginResources}/userPic/${user}`)) {
        fs.mkdirSync(`${pluginResources}/userPic/${user}`);
    }
    await fs.writeFileSync(`${pluginResources}/userPic/${user}/${filename}.zip`, data);
    const zip = new admzip(`${pluginResources}/userPic/${user}/${filename}.zip`);
    zip.extractAllTo(`${pluginResources}/userPic/${user}`, true);
    fs.unlinkSync(`${pluginResources}/userPic/${user}/${filename}.zip`);
    fs.renameSync(`${pluginResources}/userPic/${user}/image_0.png`, `${pluginResources}/userPic/${user}/${filename}.png`);
    return `${pluginResources}/userPic/${user}/${filename}.png`
}
