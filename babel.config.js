module.exports = {
  presets: [
    '@vue/app'
  ],
  // 很重要，保障 pay.common 测试时正确引用内部单元
  include: /(src|packages)/i
};