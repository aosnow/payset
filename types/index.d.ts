// ------------------------------------------------------------------------------
// name: index.d
// author: 喵大斯( mschool.tech )
// created: 2019/6/25
// ------------------------------------------------------------------------------

import Vue, { Component } from 'vue';

type PayRuleConfig = object;
type RuleValue = string | Array<string> | RuleHandler | { watch:Array<string>, handler:RuleHandler } | object;

declare interface RuleHandler
{
  ( value:string, model:PayRuleModel ):void;
}

declare interface PayRuleModel
{
  data:any;
  display:any;
}

declare interface DisplayRule
{
  custom?:boolean;
  hide?:boolean;
  required?:boolean;
  disabled?:boolean;
}

declare interface PayRuleCallback
{
  ( this:PayRule, value:string, displayValue:DisplayRule ):void;
}

declare function createModel( options:PayRuleModel ):Component;

/**
 * 要求本地组件包含 data.innerData 属性
 * @param [dataName] 自定义本地数据字段名
 * @return {{}}
 */
declare function createObClient( dataName?:string ):Component;

declare function createObServer( options:{ config:PayRuleConfig, watchs:Array<string> } ):Component;

declare class PayRule
{
  /**
   * 构建规则对象
   * @param key 该规则所管理字段的名称
   * @param config 配置规则，如 merchant_business_type: { type: 'select', master: true, value: '1' }
   * @param model 数据集合，用于对照值进行配置规则寻址
   * @param callback 当进行新的值设置动作时触发（预留接口给非自动响应式框架使用），参数：callback(value, display){}
   */
  new( key:string, config:PayRuleConfig, model:PayRuleModel, callback?:PayRuleCallback ):void;

  /**
   * 字段名
   * @return {String}
   */
  key:string;

  /**
   * 默认值
   * @return {string}
   */
  value:string;

  /**
   * 数据源
   * @return {{}}
   */
  model:PayRuleModel;

  /**
   * 当前字段的配置集合，包含 type,value,rule,master
   * @return {{type:String, value:String, rule:{}, master:Boolean}}
   */
  config:PayRuleConfig;

  rule:object;

  master:boolean;

  /**
   * 指定规则值是否为简单配置对象
   * @param ruleValue
   * @return {boolean}
   */
  static isPlainObject( ruleValue:RuleValue ):boolean;

  /**
   * 检测规则值是否为 Function 类型
   * @param ruleValue
   * @return {boolean}
   */
  static isFunction( ruleValue:RuleValue ):boolean;

  /**
   * 检测规则值是否为 handler 类型
   * @param ruleValue
   * @return {boolean}
   */
  static isHandler( ruleValue:RuleValue ):boolean;

  /**
   * 检测指定的规则值是否为最底层值
   * <p>最底层值目前规则为：Array、String</p>
   * @param ruleValue
   * @return {boolean}
   */
  static isFinalValue( ruleValue:RuleValue ):boolean;

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
  static isValidRule( rule:RuleValue ):boolean;

  /**
   * 检测目标 handler 是否包含指定监听目标字段
   * @param key
   * @param ruleValue
   * @return {boolean}
   */
  static hasWatchKey( key:string, ruleValue:RuleValue ):boolean;

  /**
   * 检测子级中是否包含规则配置（只检测直接子级，不检测孙级）
   * @param ruleValue 如 1:{ greenstatus: { 0: ['', 'hide'], 1: 'required' } }，
   * 目的在于检测 greenstatus 是否包含子规则配置，而此例中是值列表了，不再有子规则
   * @return {boolean}
   */
  static hasChildRule( ruleValue:RuleValue ):boolean;

  static error( options:{ key:string, code:string } ):void;

  /**
   * 检测配置规则中是否包含指定的监听 key 值
   * @return {boolean}
   */
  hasKey( key:string ):boolean;

  /**
   * 设置最终值
   * @param value 值
   * @param displayValue 显示规则，如 {disabled: true}
   */
  setValue( value:string, displayValue:DisplayRule ):void;

  /**
   * 执行指定的规则值逻辑
   * <p>说明：apply 方法中的非最终值 Object 类型配置，都取对应 key 的当前值，因为经过 use 方法已经定位经过了对应的目标 key</p>
   * @param ruleValue rule 规则
   */
  apply( ruleValue:RuleValue ):void;

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
  use( key:string, value:string, rule:RuleValue );
}

declare class PayRuleManager
{
  new( config:PayRuleConfig, model:PayRuleModel, callback:PayRuleCallback ):void;

  model:PayRuleModel;

  createRules( config:PayRuleConfig ):void;

  findRuleByKey( key:string ):void;

  use( key:string, value:string, empty?:boolean ):void;

  master():void;
}

declare class DisplayFormItem extends Vue
{

}

export {
  createModel,
  createObClient,
  createObServer,
  PayRule,
  PayRuleManager,
  DisplayFormItem
};
