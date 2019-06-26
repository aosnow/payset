// ------------------------------------------------------------------------------
// name: DataModel
// author: 喵大斯( h5devs.com/h5devs.net )
// created: 2019/6/22 0:13
// ------------------------------------------------------------------------------

// vue 支持函数类型的 mixin
export default ({ data, display }) => {
  return {
    data() {
      return {
        /**
         * 全量数据
         * @type {{}}
         */
        payData: data,

        /**
         * 对应 payData 的视觉控制数据
         * <p>字段对应 payData 的字段配置</p>
         */
        payDisplay: display
      };
    }
  };
};
