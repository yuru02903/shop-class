<template lang="pug">
VContainer
  VRow
    VCol(cols="12")
      h1 註冊
    VDivider
    VCol(cols="12")
      VForm(:disable="isSubmitting" @submit.prevent="submit")
        VTextField(
          label="帳號"
          minlength="4" maxlength="20" counter
          v-model="account.value.value"
          :error-messages="account.errorMessage.value"
        )
        VTextField(
          label="信箱" type="email"
          v-model="email.value.value"
          :error-messages="email.errorMessage.value"
        )
        VTextField(
          label="密碼" type="password"
          minlength="4" maxlength="20" counter
          v-model="password.value.value"
          :error-messages="password.errorMessage.value"
        )
        VTextField(
          label="確認密碼" type="password"
          minlength="4" maxlength="20" counter
          v-model="passwordConfirm.value.value"
          :error-messages="passwordConfirm.errorMessage.value"
        )
        VBtn(type="submit" color="green") 註冊
</template>

<script setup>
import validator from 'validator'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
// { useRoute } => 取得此頁資訊; { useRouter } => 跳頁
import { useRouter } from 'vue-router'
import { useSnackbar } from 'vuetify-use-dialog'
import { useApi } from '@/composables/axios'

const { api } = useApi()

const router = useRouter()
const createSnackbar = useSnackbar()

// 定義註冊表單的資料格式
const schema = yup.object({
  account: yup
    .string()
    .required('帳號為必填欄位')
    .min(4, '使用者帳號長度不符')
    .max(20, '使用者帳號長度不符'),
  email: yup
    .string()
    .required('信箱為必填欄位')
    // .test(自訂驗證名稱, 錯誤訊息, 驗證function)
    .test(
      'isEmail', '信箱格式錯誤',
      (value) => {
        return validator.isEmail(value)
      }
    ),
  password: yup
    .string()
    .required('密碼為必填欄位')
    .min(4, '密碼長度不符')
    .max(20, '密碼長度不符'),
  passwordConfirm: yup
    .string()
    .required('密碼為必填欄位')
    .min(4, '密碼長度不符')
    .max(20, '密碼長度不符')
    // .oneOf 只允許符合陣列內其中一個值
    // .oneOf(陣列, 錯誤訊息)
    // .ref('password') 代表這個 schema 的 password 欄位值
    .oneOf([yup.ref('password')], '密碼不一致')
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

const account = useField('account')
const email = useField('email')
const password = useField('password')
const passwordConfirm = useField('passwordConfirm')

const submit = handleSubmit(async (values) => {
  try {
    await api.post('/users', {
      account: values.account,
      email: values.email,
      password: values.password
    })
    createSnackbar({
      text: '註冊成功',
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'green',
        location: 'bottom'
      }
    })
    router.push('/login')
  } catch (error) {
    const text = error?.response?.data?.message || '發生錯誤，請稍後再試'
    createSnackbar({
      text,
      showCloseButton: false,
      snackbarProps: {
        timeout: 2000,
        color: 'red',
        location: 'bottom'
      }
    })
  }
})
</script>
