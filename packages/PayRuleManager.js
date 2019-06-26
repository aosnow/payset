// ------------------------------------------------------------------------------
// name: PayRuleManager
// author: 喵大斯( h5devs.com/h5devs.net )
// created: 2019/6/21 18:19
// ------------------------------------------------------------------------------

import PayRule from './PayRule';

class PayRuleManager {

  // --------------------------------------------------------------------------
  //
  // Class variables
  //
  // --------------------------------------------------------------------------

  /**
   * 是否已经执行过 master 初始响应 Rules
   * @type {boolean}
   * @private
   */
  _mastered = false;

  /**
   * 数据集合
   * @type {{}}
   * @private
   */
  _model = null;

  /**
   * 配置集合
   * @type {{}}
   * @private
   */
  _rules = null;

  /**
   * 值 change 时的回调方法
   * @type {Function}
   * @private
   */
  _callback = null;

  // --------------------------------------------------------------------------
  //
  // Class constructor
  //
  // --------------------------------------------------------------------------

  /**
   * 构建管理器
   * @param config 总配置表
   * @param {{data,display}} model 数据集合，用于对照值进行配置规则寻址
   * @param callback 当进行新的值设置动作时触发（预留接口给非自动响应式框架使用），参数：callback(value, display){}
   */
  constructor(config, model, callback) {
    this._model = model;
    this._callback = callback;
    this.createRules(config);
  }

  // --------------------------------------------------------------------------
  //
  // Class properties
  //
  // --------------------------------------------------------------------------

  get model() {
    return this._model;
  }

  // --------------------------------------------------------------------------
  //
  // Class methods
  //
  // --------------------------------------------------------------------------

  /**
   * 根据规则配置表，生成 PayRule 对象
   * @param config
   */
  createRules(config) {
    this._rules = Object.create(null);

    Object.keys(config)
    .forEach(key => {
      this._rules[key] = new PayRule(key, config[key], this._model, this._callback);
    });
  }

  /**
   * 查找所有 rule 任意层级包含指定监听目标的配置
   * 主要用于在指定监听目标发生变化时，进行多目标响应
   * 若 rule 在子级（非顶级），则自身往顶级之间的目标，以其当前值进行定位
   * @param key
   * @return {Array}
   */
  findRuleByKey(key) {
    const rules = [];

    Object.values(this._rules)
    .forEach(payRule => {
      if (payRule.hasKey(key)) rules.push(payRule);
    });

    return rules;
  }

  /**
   * 执行符合规则的所有 PayRule
   * <p>rule 中任意层级包含 key 监听</p>
   * @param key
   * @param value
   * @param [empty] 是否对空值做相对应的值响应及表现层规则响应（默认忽略对空值的响应处理）
   */
  use(key, value, empty = false) {
    if (!empty && value === '') return;

    const rules = this.findRuleByKey(key);

    rules.forEach(payRule => {
      payRule.use(key, value);
    });
  }

  /**
   * 页面加载完成后，初始执行相应默认规则
   */
  master() {
    if (!this._mastered) {
      Object.values(this._rules)
      .forEach(payRule => {
        if (payRule.master) {
          this.use(payRule.key, payRule.value);
        }
      });
    }

    this._mastered = true;
  }
}

export default PayRuleManager;
