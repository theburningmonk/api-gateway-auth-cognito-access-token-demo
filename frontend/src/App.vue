<template>
  <div id="app" style="font-size: 18px; display: flex; justify-content: center; align-items: center; height: 60vh">
    <authenticator v-if="!user"></authenticator>
    <template v-if="auth.route === 'authenticated'">
      <div>
        <button @click="signOut">Sign out</button>
        <input-form />
      </div>
    </template>
  </div>
</template>

<script>
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-vue"
import "@aws-amplify/ui-vue/styles.css"
import { Auth } from 'aws-amplify'
import { ref, onMounted } from 'vue'
import InputForm from '@/components/InputForm.vue'

export default {
  name: 'App',
  components: {
    Authenticator,
    InputForm
  },
  setup() {
    const user = ref(null)
    const auth = useAuthenticator()

    onMounted(async () => {
      try {
        user.value = await Auth.currentUserInfo()
      } catch (error) {
        console.error('Error getting current user:', error)
      }
    })

    const signOut = async () => {
      try {
        await Auth.signOut()
        user.value = null
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }

    return {
      auth,
      signOut
    }
  }
}
</script>