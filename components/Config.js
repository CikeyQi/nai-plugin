import YAML from 'yaml'
import fs from 'fs'
import { pluginRoot } from '../model/path.js'
import { error } from 'console'

class Config {
  getConfig() {
    try {
      const config_yaml = YAML.parse(
        fs.readFileSync(`${pluginRoot}/config/config/config.yaml`, 'utf-8')
      )
      return config_yaml
    } catch (error) {
      logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`读取config.yaml失败`), logger.red(error));
      return false
    }
  }

  getDefConfig() {
    try {
      const config_default_yaml = YAML.parse(
        fs.readFileSync(`${pluginRoot}/config/config_default.yaml`, 'utf-8')
      )
      return config_default_yaml
    } catch (error) {
      logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`读取config_default.yaml失败`), logger.red(error));
      return false
    }
  }

  setConfig(config_data) {
    try {
      fs.writeFileSync(
        `${pluginRoot}/config/config/config.yaml`,
        YAML.stringify(config_data)
      )
      return true
    } catch (error) {
      logger.mark(logger.blue('[NAI PLUGIN]'), logger.cyan(`写入config.yaml失败`), logger.red(error));
      return false
    }
  }
}

export default new Config()
