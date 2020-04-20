// ------------------------------------------------------------------------------
// name: PayObServer
// author: 喵大斯( h5devs.com/h5devs.net )
// created: 2019/6/21 23:30
// ------------------------------------------------------------------------------

import PayRuleManager from '../PayRuleManager';

const ObServer = {
  data() {
    return {
      payRuleManager: null
    };
  },

  methods: {
    uploadData(innerData) {
      Object.keys(innerData)
            .forEach(key => {
              // 过滤未修改的数据
              // 数据一旦修改，将立即通过 props 下放到所有步骤数据中
              if (this.payData[key] !== innerData[key]) {
                this.payData[key] = innerData[key];
              }
            });
    },

    dataChanged(value) {
      this.uploadData(value);
    }

  }
};

function createObServer({ config, watchs }) {
  const inst = { ...ObServer };

  // PayRuleManager
  inst.created = function created() {
    this.payRuleManager = new PayRuleManager(config, {
      data: this.payData,
      display: this.payDisplay
    });
  };

  inst.mounted = function mounted() {
    // 首次触发 master 为 true 的值
    this.$nextTick(() => {
      this.payRuleManager.master();
    });
  };

  // watch
  const watch = {};
  watchs.forEach(key => {
    watch[`payData.${key}`] = {
      handler(value) {
        this.$nextTick(() => {
          this.payRuleManager.use(key, value);
        });
      }
    };
  });

  inst.watch = watch;

  return inst;
}

export default createObServer;
