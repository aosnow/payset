<!--------------------------------------------------
  name: FormA.vue
  author: 喵大斯( mschool.tech )
  created: 2019/6/25
---------------------------------------------------->

<template>
  <el-form class="form-b" :model="innerData">
    <h2>表单B:</h2>
    <el-alert title="payData 属性：" type="success">
      {{payData.nickname}} - {{payData.address}}
    </el-alert>
    <el-alert title="payDisplay 属性：" type="info">
      {{payDisplay.nickname}} - {{payDisplay.address}}
    </el-alert>

    <display-form-item label="名称:" prop="nickname"
                       :display-rule="payDisplay.nickname"
                       :rules="{ message:'请填写名称', trigger: ['change','blur'] }">
      <el-row class="input-control">
        <el-input v-model="innerData.nickname" placeholder="请输入" clearable maxlength="15"></el-input>
      </el-row>
    </display-form-item>
    <display-form-item label="地址:" prop="address"
                       :display-rule="payDisplay.address"
                       :rules="{ message:'请填写地址', trigger: ['change','blur'] }">
      <el-row class="input-control">
        <el-input v-model="innerData.address" placeholder="请输入" clearable maxlength="15"></el-input>
      </el-row>
    </display-form-item>
  </el-form>
</template>

<script>
import { createObClient, DisplayFormItem } from '@yinhe/payset';

export default {
  name: 'FormA',
  mixins: [createObClient()],
  components: { DisplayFormItem },
  data() {
    return {
      innerData: {
        nickname: '',
        address: ''
      }
    };
  }
};
</script>

<style>
.form-b{}
</style>
