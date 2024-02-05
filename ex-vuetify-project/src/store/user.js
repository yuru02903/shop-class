// Utilities
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole'
import { useApi } from '@/composables/axios'

export const useUserStore = defineStore('user', () => {
  const { apiAuth } = useApi()

  const token = ref('')
  const account = ref('')
  const email = ref('')
  const cart = ref(0)
  const role = ref(UserRole.USER)

  const login = (data) => {
    if (data.token) {
      token.value = data.token
    }
    account.value = data.account
    email.value = data.email
    cart.value = data.cart
    role.value = data.role
  }

  const isLogin = computed(() => {
    return token.value.length > 0
  })

  const isAdmin = computed(() => {
    return role.value === UserRole.ADMIN
  })

  const getProfile = async () => {
    if (token.value.length === 0) return

    try {
      const { data } = await apiAuth.get('/users/me')
      login(data.result)
    } catch (error) {
      logout()
    }
  }

  const logout = () => {
    token.value = ''
    account.value = ''
    email.value = ''
    cart.value = 0
    role.value = UserRole.USER
  }

  return {
    token,
    account,
    email,
    cart,
    role,
    login,
    logout,
    isLogin,
    isAdmin,
    getProfile
  }
}, {
  persist: {
    key: '20240103',
    paths: ['token']
  }
})
