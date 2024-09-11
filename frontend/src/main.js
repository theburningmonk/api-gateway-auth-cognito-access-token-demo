import { createApp } from 'vue'
import App from './App.vue'
import AmplifyVue from '@aws-amplify/ui-vue'

import { Amplify, Auth } from 'aws-amplify'
import { amplifyConfig } from './aws-exports'
Amplify.configure(amplifyConfig)
Auth.configure()

const app = createApp(App)
app.use(AmplifyVue)

app.mount('#app')