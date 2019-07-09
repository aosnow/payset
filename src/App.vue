<template>
  <div id="app">
    <el-page-header title="标题" content="测试表单"></el-page-header>
    <form-a :pay-data="payData" :pay-display="payDisplay" @data-changed="dataChanged"></form-a>
    <form-b :pay-data="payData" :pay-display="payDisplay" @data-changed="dataChanged"></form-b>
  </div>
</template>

<script>

import { createModel, createObServer } from '@mudas/payset';

import FormA from './FormA';
import FormB from './FormB';

export default {
  name: 'app',

  components: {
    FormA,
    FormB
  },
  mixins: [
    createModel({
      data: {
        usertype: '1',
        nickname: '',
        address: ''
      },
      display: {
        usertype: {},
        nickname: {},
        address: {}
      }
    }),
    createObServer({
      config: {
        usertype: {
          master: true, // 初始化触发第一次响应（若页面没有任何初始响应规则执行，须依靠用户交互才能开始运行）
          value: '1',
          // 值类型规则（顶级）
          rule: ['1', 'required']
        },
        nickname: {
          // 子级依赖型规则
          rule: {
            usertype: {
              1: 'hide',
              2: ['xxx', 'custom', 'required'],
              3: 'required'
            }
          }
        },
        address: {
          // handler 类型规则（顶层）
          rule: {
            watch: ['usertype'],
            handler(value, model) {
              if (model['usertype'] === '3') return ['', 'hide'];
              return ['', 'required'];
            }
          }
        }
      },
      watchs: ['usertype']
    })
  ]
};
</script>

<style>
#app{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
