<!--------------------------------------------------
  name: FormA.vue
  author: 喵大斯( mschool.tech )
  created: 2019/6/25
---------------------------------------------------->

<template>
  <el-form class="form-a" :model="innerData">
    <h2>表单A:</h2>
    <display-form-item label="商户类型:" prop="usertype"
                       :display-rule="payDisplay.usertype"
                       :rules="{ message: '请选择商户类型', trigger: ['change','blur'] }">
      <el-select v-model="innerData.usertype" placeholder="请选择">
        <el-option v-for="(item,index) in [{label:'普通用户',value:'1'},{label:'优质用户',value:'2'},{label:'金牌用户',value:'3'}]"
                   :key="index"
                   :label="item.label"
                   :value="item.value">
        </el-option>
      </el-select>
      {{payDisplay.usertype}}
    </display-form-item>

  </el-form>
</template>

<script>
import { createObClient, DisplayFormItem } from '@mudas/payset';

export default {
  name: 'FormA',
  mixins: [createObClient()],
  components: { DisplayFormItem },
  data() {
    return {
      innerData: {
        usertype: ''
      }
    };
  }
};
</script>

<style>
.form-a{}
</style>
