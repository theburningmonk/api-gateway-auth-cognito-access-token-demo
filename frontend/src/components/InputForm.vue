<template>
  <div class="input-form" style="margin-top: 10px;">
    <button @click="callEndpoint('admin')">Test admin permission</button>
    <button @click="callEndpoint('readonly')">Test readonly permission</button>
  </div>
</template>

<script>
import axios from 'axios'
import { Auth } from 'aws-amplify'
import { apiConfig } from '@/aws-exports'

export default {
  name: 'InputForm',
  setup() {
    const callEndpoint = async (group) => {
      try {
        const session = await Auth.currentSession()
        const token = session.getAccessToken().getJwtToken()

        await axios.get(apiConfig.apiUrl + `/${group}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        alert('All good!')
      } catch (error) {
        if (error.response.status === 401) {
          alert('Unauthorized')
        } else {
          alert('HTTP error:', error.response.status)
        }
      }
    }

    return {
      callEndpoint
    }
  }
}
</script>
