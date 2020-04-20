// ------------------------------------------------------------------------------
// name: vue.config.js
// author: 喵大斯( h5devs.com/h5devs.net )
// created: 2019/4/23 21:00
// ------------------------------------------------------------------------------

const path = require('path');
const DEBUG = process.env.NODE_ENV === 'development';

function resolve(...dir) {
  return path.join(__dirname, ...dir);
}

module.exports = {
  publicPath: DEBUG ? '/' : './',
  outputDir: 'dist',
  assetsDir: '',
  productionSourceMap: false,

  css: {
    // 强制将所有 css 内容内联
    // 对于 lib 的打包不宜输出独立的 css 文件
    extract: false
  },

  configureWebpack: {
    entry: resolve('src/main.js')
  },

  chainWebpack: (config) => {

    // 路径别名
    config.resolve.alias.set('@', resolve('src'));
    config.resolve.alias.set('@mudas/payset', resolve('packages/index.js'));

  }
};
