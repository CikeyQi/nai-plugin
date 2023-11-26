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
    console.log(`${pluginResources}/${user}/${filename}.zip`)
    if (!fs.existsSync(`${pluginResources}/${user}`)) {
        fs.mkdirSync(`${pluginResources}/${user}`);
    }
    await fs.writeFileSync(`${pluginResources}/${user}/${filename}.zip`, data);
    // 解压zip，取出image_0.png放在同级目录，重命名为filename.png，删除zip
    const zip = new admzip(`${pluginResources}/${user}/${filename}.zip`);
    zip.extractAllTo(`${pluginResources}/${user}`, true);
    fs.unlinkSync(`${pluginResources}/${user}/${filename}.zip`);
    fs.renameSync(`${pluginResources}/${user}/image_0.png`, `${pluginResources}/${user}/${filename}.png`);
    return `${pluginResources}/${user}/${filename}.png`
}