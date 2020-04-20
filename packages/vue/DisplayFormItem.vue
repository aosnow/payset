<!--------------------------------------------------
  name: DisplayFormItem.vue
  author: 喵大斯( mschool.tech )
  created: 2019/06/24
---------------------------------------------------->

<template>
  <el-form-item :rules="truthyRules"
                :required="isRequired"
                v-bind="$attrs"
                v-on="$listeners"
                v-show="isVisibled">
    <template slot="label">
      <slot name="label"></slot>
    </template>

    <!--目前 form-item 不支持向下传递 disabled，只能从 slot 外部对各组件单独设置 disabled-->
    <slot></slot>

  </el-form-item>
</template>

<script>
export default {
  name: 'DisplayFormItem',
  inheritAttrs: false,

  inject: {
    elForm: {
      default: ''
    }
  },

  props: {

    rules: {
      type: Object,
      default() {
        return {};
      }
    },

    /**
     * 显示规则
     * @type {{disabled:Boolean,hide:Boolean,custom:Boolean,required:Boolean}}
     */
    displayRule: {
      type: Object,
      default() {
        return {};
      }
    }
  },

  computed: {
    truthyRules() {
      return this.rules ? { ...this.rules, ...{ required: this.isRequired } } : null;
    },

    isDisabled() {
      return this.displayRule.disabled;
    },

    isVisibled() {
      return this.displayRule.hide !== undefined ? !this.displayRule.hide : true;
    },

    isRequired() {
      return this.displayRule.required || this.$attrs.required || this.rules.required;
    }
  },

  methods: {}
};
</script>

<style>
.display-form-item .inner-form{
  margin: 0 !important;
}
</style>
