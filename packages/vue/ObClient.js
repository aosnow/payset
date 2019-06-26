// ------------------------------------------------------------------------------
// name: PayObClient
// author: 喵大斯( h5devs.com/h5devs.net )
// created: 2019/6/21 23:31
// ------------------------------------------------------------------------------

const ObClient = {

  props: {
    /**
     * 全量数据
     * @type {{}}
     */
    payData: Object,

    /**
     * 对应 PayData 的视觉控制数据
     * <p>
     * 目前支持属性如下：
     * <li>show: 是否显示元素（作用于 form-item）</li>
     * <li>disabled：是否禁用元素（作用于 form-item 或者 表单控件）</li>
     * <li>required：必填字段（红色星号提醒）</li>
     * <li>custom：选填字段</li>
     * </p>
     * 类型：<code>{any:{hide:Boolean, disabled:Boolean}}</code>
     */
    payDisplay: Object
  },

  methods: {
    syncPayData(payData) {
      // 若本地组件内未定义对应的数据对象，则跳过更新
      if (!this[this.dataName]) return;

      // payData 更新时，将组件内关心的数据更新到本地
      Object.keys(this[this.dataName]).forEach(key => {
        if (this[this.dataName][key] !== payData[key]) {
          this[this.dataName][key] = payData[key];
        }
      });
      this.$emit('sync');
    }
  },

  watch: {
    // 每当 payData 改变时，将数据从全局同步到本地进行视觉响应
    // 往本地同步数据时，避免同时向全局提交造成死循环
    payData: {
      immediate: true,
      deep: true,
      handler(value) {
        this.isSyncing = true;
        this.syncPayData(value);
        this.isSyncing = false;
      }
    }
  }
};

/**
 * 要求本地组件包含 data.innerData 属性
 * @param [dataName] 自定义本地数据字段名
 * @return {{}}
 */
function createObClient(dataName) {
  const inst = Object.assign({}, ObClient);

  dataName = dataName || 'innerData';

  inst.data = function data() {
    return {
      dataName,
      // 向本地同步数据时，无需监听向上提交属性修改，否则可能造成死循环
      isSyncing: false
    };
  };

  inst.watch[dataName] = {
    deep: true,
    handler(value) {
      // 向本地同步的修改无需提交
      !this.isSyncing && this.$emit('data-changed', value);
    }
  };

  return inst;
}

export default createObClient;
