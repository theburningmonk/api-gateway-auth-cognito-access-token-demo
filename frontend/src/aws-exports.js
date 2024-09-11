const amplifyConfig = {
  // Replace with your own Cognito configuration
  Auth: {
    region: 'us-east-1',
    userPoolId: process.env.VUE_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.VUE_APP_USER_POOL_CLIENT_ID,
    signUpVerificationMethod: "code"
  }
}

const apiConfig = {
  // Replace with your own API Gateway URL
  apiUrl: process.env.VUE_APP_API_URL
}

export {
  amplifyConfig,
  apiConfig
}
