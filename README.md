# api-gateway-auth-cognito-access-token-demo

Demo to show how to implement API Gateway authorization with Cognito access tokens

## To deploy the backend

1. run `npm ci` to restore project dependencies.

2. run `npx cdk deploy` to deploy the application.
*Note: This uses the version of CDK that's installed as dev dependency in the project, so to avoid any version incompatibility with the version of CDK you have installed on your machine.*

After the deployment finishes, you should see something like this:

```
Outputs:
ApiStack-dev.UserPoolClientId = xxxxxxxxxxxxx
ApiStack-dev.UserPoolId = us-east-1_xxxxxx
ApiStack-dev.devAccessTokenApiEndpointD4C7888A = https://xxxxxx.execute-api.us-east-1.amazonaws.com/dev/
```

Take note of these outputs, we need them for the frontend

3. After the deployment is done, go to the Cognito User Pool console, find the user pool, go to `User pool properties`, choose the `Pre token generation Lambda trigger` trigger, click `Edit`, change the `Trigger event version` to `Basic features + access token customization - Recommended`.
This is required to customize access tokens, but unfortunately, it's not possible to set the event trigger version through CloudFormation (and by extension, CDK).

## To run the frontend

1. To run the frontend application, first add a `.env` file in the `frontend` folder and put the CloudFormation output above into it, like this:

```
VUE_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxx
VUE_APP_USER_POOL_ID=us-east-1_xxxxxxx
VUE_APP_API_URL=https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

2. Run `cd frontend`, then `npm ci`, then `npm run serve`. This should compile and run the frontend app on port 8080.

3. Visit `localhost:8080`

## To test different cases

1. Go to `localhost:8080` and create a new user.

2. You should be automatically signed in after you enter the correct verification code. You should see two buttons to `Test admin permission` and `Test readonly permission`. Both of these should tell you "Unauthorized" because your user does not belong to any Cognito groups.

3. Go back to the Cognito User Pool console and find the user pool again. Go to the `Users` tab, and find your user. Try adding the user to either the `Admin` or `ReadOnly` group.

4. Go back to `localhost:8080`, sign out and sign back in, and try the buttons again.
