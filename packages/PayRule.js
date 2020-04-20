// ------------------------------------------------------------------------------
// name: PayRule
// author: 喵大斯( h5devs.com/h5devs.net )
// created: 2019/6/21 18:18
// ------------------------------------------------------------------------------

import { isPlainObject } from 'lodash-es';

class PayRule {

  // --------------------------------------------------------------------------
  //
  // Class variables
  //
  // --------------------------------------------------------------------------

  /**
   * 字段名
   * @type {String}
   * @private
   */
  _key = null;

  /**
   * 数据模型
   * @type {{}}
   * @private
   */
  _model = null;

  /**
   * 配置集合
   * @type {{type:String, value:String, rule:{}, master:Boolean}|null}
   * @private
   */
  _config = null;

  /**
   * 控件类型，如 text、select
   * @type {String}
   * @private
   */
  _type = null;

  /**
   * 默认值
   * @type {string}
   * @private
   */
  _value = '';

  /**
   * config.rule 规则配置
   * @type {{}|String|String[]}
   * @private
   */
  _rule = null;

  /**
   * 是否初始化值
   * @type {boolean}
   * @private
   */
  _master = false;

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
   * 构建规则对象
   * @param key 该规则所管理字段的名称
   * @param config 配置规则，如 merchant_business_type: { type: 'select', master: true, value: '1' }
   * @param model 数据集合，用于对照值进行配置规则寻址
   * @param callback 当进行新的值设置动作时触发（预留接口给非自动响应式框架使用），参数：callback(value, display){}
   */
  constructor(key, config, model, callback = null) {
    this._key = key;
    this._model = model;
    this._config = config;
    this._callback = callback;

    this._parse(config);
    this._simpleUse(this._rule);
  }

  // --------------------------------------------------------------------------
  //
  // Class properties
  //
  // --------------------------------------------------------------------------

  /**
   * 字段名
   * @return {String}
   */
  get key() {
    return this._key;
  }

  /**
   * 默认值
   * @return {string}
   */
  get value() {
    return this._value;
  }

  /**
   * 数据源
   * @return {{}}
   */
  get model() {
    return this._model;
  }

  /**
   * 当前字段的配置集合，包含 type,value,rule,master
   * @return {{type:String, value:String, rule:{}, master:Boolean}}
   */
  get config() {
    return this._config;
  }

  get rule() {
    return this._rule;
  }

  get master() {
    return this._master;
  }

  // --------------------------------------------------------------------------
  //
  // Static methods
  //
  // --------------------------------------------------------------------------

  /**
   * 指定规则值是否为简单配置对象
   * @param ruleValue
   * @return {boolean}
   */
  static isPlainObject(ruleValue) {
    return isPlainObject(ruleValue);
  }

  /**
   * 检测规则值是否为 Function 类型
   * @param ruleValue
   * @return {boolean}
   */
  static isFunction(ruleValue) {
    return typeof ruleValue === 'function';
  }

  /**
   * 检测规则值是否为 handler 类型
   * @param ruleValue
   * @return {boolean}
   */
  static isHandler(ruleValue) {
    return PayRule.isPlainObject(ruleValue) &&
           Array.isArray(ruleValue.watch) &&
           typeof ruleValue.handler === 'function';
  }

  /**
   * 检测指定的规则值是否为最底层值
   * <p>最底层值目前规则为：Array、String</p>
   * @param ruleValue
   * @return {boolean}
   */
  static isFinalValue(ruleValue) {
    return Array.isArray(ruleValue) || typeof ruleValue === 'string';
  }

  /**
   * 是否为有效的规则配置（即值的上一级）
   * <p>支持的有效规则类型如下：</p>
   * <ol>
   *   <li>函数类型，如 <code>function(value, model){}</code></li>
   *   <li>handler 类型，如 <code>{watch:[], handler:function(value, model){}}</code></li>
   *   <li>值配置类型，如 <code>{ 0: ['', 'hide'], 1: 'required' }</code></li>
   * </ol>
   * @param rule 如 <code>1:{ greenstatus: { 0: ['', 'hide'], 1: 'required' } }</code> 中
   * <code>greenstatus</code> 的值 <code>{ 0: ['', 'hide'], 1: 'required' }</code> 为有效配置，而 <code>['', 'hide']</code>
   * 及 <code>'required'</code> 皆非配置
   * @return {boolean}
   */
  static isValidRule(rule) {
    return typeof rule === 'function' || PayRule.isPlainObject(rule);
  }

  /**
   * 检测目标 handler 是否包含指定监听目标字段
   * @param key
   * @param ruleValue
   * @return {boolean}
   */
  static hasWatchKey(key, ruleValue) {
    // {key:'', watch:['',''], handler:Function}
    if (PayRule.isHandler(ruleValue)) {
      return ruleValue.watch.indexOf(key) !== -1;
    }
    return false;
  }

  /**
   * 检测子级中是否包含规则配置（只检测直接子级，不检测孙级）
   * @param ruleValue 如 1:{ greenstatus: { 0: ['', 'hide'], 1: 'required' } }，
   * 目的在于检测 greenstatus 是否包含子规则配置，而此例中是值列表了，不再有子规则
   * @return {boolean}
   */
  static hasChildRule(ruleValue) {
    if (typeof ruleValue !== 'object') return false;

    const childRules = Object.keys(ruleValue);// ['greenstatus']
    const curKey = childRules[0];// greenstatus
    if (PayRule.isValidRule(ruleValue[curKey])) return true;

    // 同级多规则，暂时不支持（使用 handler 类型解决该需求）
    // for (let i = 0; i < childRules.length; i++) {
    //   const curKey = childRules[i];// greenstatus
    //   if (PayRule.isValidRule(ruleValue[curKey])) return true;
    // }

    return false;
  }

  static error({ key, code }) {
    console.group(`${key} 取值异常提醒`);
    switch (code) {
      case 'invalid config': {
        console.log(`无效配置：根级配置项值只能是 String 或 String[] 类型`);
        break;
      }
      default: {
        console.log(`1、请确认 ${key} 是否拼写正确，并且在 model 中已定义`);
        console.log(`2、'rule:规则' 中的'规则'只能是 String 或 String[] 类型`);
        console.log(`3、非底层取值项配置，取值不能为空，如select必须依赖某个值来决定所取分支规则`);
        console.log(`4、若未设置默认值，则相应的将响应规则设置为 ['0','anytype'] 等具体的值`);
        console.log(`5、若设置默认值，则需要将默认值改成值列表之一，比如下拉菜单的选项之一的值，也可删除默认值使用方案 3`);
      }
    }
    console.groupEnd();
  }

  // --------------------------------------------------------------------------
  //
  // Class methods
  //
  // --------------------------------------------------------------------------

  /**
   * 解析配置
   * @param type
   * @param value
   * @param rule
   * @param master
   * @private
   */
  _parse({ type, value, rule, master }) {
    this._type = type || null;
    this._value = value || '';
    this._rule = rule || null;
    this._master = master || false;
  }

  /**
   * 应用简单规则
   * <p>即不依赖于任何字段的自主规则，如 {rule:'required'}</p>
   * @param {String|Array} ruleValue 单向无依赖规则
   * @private
   */
  _simpleUse(ruleValue) {
    // 不执行非简单规则
    if (!PayRule.isFinalValue(ruleValue)) return;

    // 字符串模式不支持复合视觉
    if (typeof ruleValue === 'string') {
      const { value, display } = this._parseSingleValue({}, ruleValue);
      this.setValue(value, display);
    }
    else {
      const display = this._parseArrayValue({}, ruleValue.slice(1));
      this.setValue(ruleValue[0], display);
    }
  }

  /**
   * 解析最终值与表现值
   * @param final 是否使用该参数来存储表现结果值
   * @param ruleValue 最终规则值，如 'required'、'disabled' 等
   * @return {{display: *, value: *}}
   * @private
   */
  _parseSingleValue(final, ruleValue) {
    let finalValue = '';
    let finalDisplay = final || {};
    const defaultValue = this._value;

    // 用户自主选择
    if (ruleValue === 'custom') {
      finalValue = defaultValue || '';
      finalDisplay.hide = false;
    }
    else if (ruleValue === 'hide') {
      finalValue = null;
      finalDisplay.hide = true;
    }
    else if (ruleValue === 'required') {
      finalValue = null;
      finalDisplay.required = true;
    }
    else if (ruleValue === 'disabled') {
      finalValue = null;
      finalDisplay.disabled = true;
    }
    // 普通值
    else {
      finalValue = ruleValue;
      finalDisplay = null;
    }

    return {
      value: finalValue,
      display: finalDisplay
    };
  }

  /**
   * 解析数组类型的配置规则
   * @param final
   * @param {String[]} ruleValue
   * @return {*|{}}
   * @private
   */
  _parseArrayValue(final, ruleValue) {
    const finalDisplay = final || {};

    // 支持多个视觉属性
    ruleValue.forEach(propName => {
      this._parseSingleValue(finalDisplay, propName);
    });

    return finalDisplay;
  }

  /**
   * 检测配置规则中是否包含指定的监听 key 值
   * @return {boolean}
   */
  hasKey(key) {
    return this._rule ? this._findKey(key, this._rule) : false;
  }

  /**
   * 检测指定规则是否包含对指定字段 key 的监听
   * @param key
   * @param rule
   * @return {boolean}
   * @private
   */
  _findKey(key, rule) {
    let finded = false;

    // 单纯规则，不依赖于任何字段，如字符串及数组类型：
    // rule: 'required'
    // rule: ['', 'required']
    // rule: function()
    if (typeof rule === 'string' || Array.isArray(rule)) return false;

    // 正确性检测
    // 函数类型配置不能作为顶级配置，其依赖于目标字段来取值
    if (PayRule.isFunction(rule)) {
      PayRule.error({
        key: this.key,
        code: 'invalid config'
      });
    }

    // 当前层级中查找对应 key 字段
    // 忽略值类型（可以是任意类型规则）
    if (rule[key]) {
      finded = true;
    }
    // 若当前找不到，则往子层级中查找 key 对应字段
    else {
      // 顶层 handler 规则检测
      if (PayRule.isHandler(rule)) {
        return PayRule.hasWatchKey(key, rule);
      }
      // 子级规则检测
      else {
        const childRules = Object.keys(rule);// ['greenstatus']

        for (let i = 0; i < childRules.length; i++) {
          const curKey = childRules[i];// greenstatus
          // curRule = merchant_business_type: {...} | greenstatus: { 0: ['', 'hide'], 1: 'required' }
          // childRule = 1:{ greenstatus: { 0: ['', 'hide'], 1: 'required' } }
          // childRule = 1:{ greenstatus(value, model){} }
          const curValue = this._model.data[curKey];// 1 | 0
          const curRule = rule[curKey];
          const childRule = curRule[curValue];

          // 被依赖项值异常，无法取得当前配置项中对应的子规则
          if (['', undefined, null].indexOf(curValue) !== -1 && !PayRule.isValidRule(childRule)) {
            PayRule.error({ key: curKey });
          }
          // handler 类型函数监听器
          else if (PayRule.isHandler(curRule)) {
            finded = PayRule.hasWatchKey(key, curRule);
            if (finded) break;
          }
          // 寻址到函数配置时，不需要再往下继续检测
          else if (PayRule.isFunction(curRule)) {
            finded = false;
          }
          else {
            // 若规则中没有任何子级配置，即已经到达底层则直接返回 失败
            finded = PayRule.hasChildRule(childRule) ? this._findKey(key, childRule) : false;
            if (finded) break;// 若已找到匹配的规则，则终止后续的查找
          }
        }
      }
    }

    return finded;
  }

  /**
   * 设置最终值
   * @param value 值
   * @param displayValue 显示规则，如 {disabled: true}
   */
  setValue(value, displayValue) {
    const { data, display } = this._model;
    value !== null && (data[this._key] = value);
    displayValue !== null && (display[this._key] = displayValue);

    // 值 change 事件
    if (typeof this._callback === 'function') this._callback.call(this, value, displayValue);
  }

  /**
   * 取得对应规则中首个配置项的当前值
   * @param rule
   * @private
   */
  _getKeyValue(rule) {
    if (PayRule.isPlainObject(rule)) {
      const keys = Object.keys(rule);
      return this._model.data[keys[0]];
    }

    return null;
  }

  /**
   * 执行指定的规则值逻辑
   * <p>说明：apply 方法中的非最终值 Object 类型配置，都取对应 key 的当前值，因为经过 use 方法已经定位经过了对应的目标 key</p>
   * @param ruleValue rule 规则
   */
  apply(ruleValue) {
    // 最终值：值组模式支持以逗号分隔的多个视觉属性
    if (Array.isArray(ruleValue)) {
      const display = this._parseArrayValue({}, ruleValue.slice(1));
      this.setValue(ruleValue[0], display);
    }
    // 最终值：字符串模式不支持复合视觉
    else if (typeof ruleValue === 'string') {
      const final = this._parseSingleValue({}, ruleValue);
      this.setValue(final.value, final.display);
    }
    // handler 类型配置：watch 监听目标检索
    else if (PayRule.isHandler(ruleValue)) {
      const final = ruleValue.handler.call(this, this._getKeyValue(ruleValue), this._model.data);
      this.apply(final);
    }
    // 函数类型配置
    else if (PayRule.isFunction(ruleValue)) {
      const final = ruleValue.call(this, this._getKeyValue(ruleValue), this._model.data);
      this.apply(final);
    }
    // 其它 Object 类型配置（往下延伸仍然可能是 function、handler、object 任意配置类型）
    else if (PayRule.isPlainObject(ruleValue)) {
      // 继续向下递归首个规则
      const keys = Object.keys(ruleValue);
      const curValue = this._model.data[keys[0]];
      const curRule = ruleValue[keys[0]];

      if (PayRule.isHandler(curRule) || PayRule.isFunction(curRule)) {
        this.apply(curRule);
      }
      else {
        // 只有普通 Object 类型才需要依赖值定位当前分支
        this.apply(curRule[curValue]);
      }
    }
    // 普通值
    else {
      this.setValue(ruleValue, null);
    }
  }

  /**
   * 若规则中任何层级包含指定 key 对象的监听，则在 value 发生变化时调用该方法设置管理字段的值
   * <p>
   * key 存在情况列表说明：
   * <li>key 位于顶层：直接按值取分支，后续若有子规则按当前值递归取得最底层值</li>
   * <li>key 位于中层：前置按对应字段当前值取分支，定位到当前 key 后，按 value 取分支，后续若有子规则按当前值递归取得最底层值</li>
   * <li>key 位于底层：前置按对应字段当前值取分支，定位到当前 key 后，使用 value 进行应用到管理字段</li>
   * </p>
   * @param key
   * @param value
   * @param rule
   */
  use(key, value, rule) {
    rule = rule || this._rule;

    let curRule = null;

    // 节点存在于根结点
    if (rule[key]) {
      curRule = rule[key];
      let applyValue = '';
      if (PayRule.isHandler(curRule)) {
        applyValue = curRule.handler.call(this, value, this._model.data);
      }
      else if (PayRule.isFunction(curRule)) {
        applyValue = curRule.call(this, value, this._model.data);
      }
      else {
        // 只有普通 Object 类型才需要依赖值定位当前分支
        applyValue = curRule[value];
      }
      this.apply(applyValue);
    }
    // 以下分支处理场景：
    // 1、根节点不匹配
    // 2、存在于子节点
    // 3、根节点不匹配，但其是 handler 类型，存在于 watch 列表中
    else {
      // 顶层 handler 规则取值
      if (PayRule.isHandler(rule) && PayRule.hasWatchKey(key, rule)) {
        this.apply(rule.handler.call(this, value, this._model.data));
      }
      // 子级规则取值
      else {
        const childRules = Object.keys(rule);

        for (let i = 0; i < childRules.length; i++) {
          const curKey = childRules[i];
          curRule = rule[curKey];
          const curValue = this._model.data[curKey];
          const childRule = curRule[curValue];

          // 定位到非顶层节点
          if (PayRule.isHandler(curRule) && PayRule.hasWatchKey(key, curRule)) {
            this.apply(curRule.handler.call(this, value, this._model.data));
            break;
          }
          else if (PayRule.isFunction(curRule)) {
            this.apply(curRule.call(this, value, this._model.data));
            break;
          }
          // 确定合适的分支，再交由 use 去匹配 rule[key] 直到定位到 key 对应的节点停止（后续节点交给 apply 根据当前值定位到最底层）
          else if (this._findKey(key, childRule)) {
            this.use(key, value, childRule);
            break;
          }
        }
      }

    }
  }

}

export default PayRule;
