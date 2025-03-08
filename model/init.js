import fs from 'fs';
import Config from '../components/Config.js';
import { pluginRoot } from '../model/path.js';

class Init {
  constructor() {
    this.initConfig();
  }

  initConfig() {
    const configDefaultPath = `${pluginRoot}/config/config_default.yaml`;
    const configPath = `${pluginRoot}/config/config/config.yaml`;

    if (!fs.existsSync(configDefaultPath)) {
      logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan('默认设置文件不存在，请检查或重新安装插件'));
      return;
    }

    if (!fs.existsSync(configPath)) {
      logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan('设置文件不存在，将使用默认设置文件'));
      fs.copyFileSync(configDefaultPath, configPath);
    }

    const configDefault = Config.getDefConfig();
    const config = Config.getConfig();

    const mergedConfig = this.mergeConfigs(configDefault, config);

    Config.setConfig(mergedConfig);
  }

  mergeConfigs(defaultConfig, userConfig) {
    const merged = { ...userConfig };

    Object.keys(defaultConfig).forEach((key) => {
      if (typeof defaultConfig[key] === 'object' && defaultConfig[key] !== null && !Array.isArray(defaultConfig[key])) {
        if (!merged[key]) {
          merged[key] = {};
        }
        merged[key] = this.mergeConfigs(defaultConfig[key], merged[key]);
      } else {
        if (!(key in merged)) {
          merged[key] = defaultConfig[key];
        }
      }
    });

    Object.keys(merged).forEach((key) => {
      if (!(key in defaultConfig)) {
        delete merged[key];
      }
    });

    return merged;
  }
}

export default new Init();