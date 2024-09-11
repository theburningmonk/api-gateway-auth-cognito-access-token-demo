const { Stack, CfnOutput } = require('aws-cdk-lib');
const { Runtime } = require('aws-cdk-lib/aws-lambda');
const { NodejsFunction } = require('aws-cdk-lib/aws-lambda-nodejs');
const { RestApi, MockIntegration, CfnAuthorizer, AuthorizationType, ResponseType } = require('aws-cdk-lib/aws-apigateway');
const { UserPool, UserPoolClient, CfnUserPoolGroup, UserPoolOperation, AdvancedSecurityMode } = require('aws-cdk-lib/aws-cognito');

class ApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const api = new RestApi(this, `${props.stageName}-AccessTokenApi`, {
      deployOptions: {
        stageName: props.stageName,
        tracingEnabled: true
      }
    });

    const userPool = new UserPool(this, 'CognitoUserPool', {
      userPoolName: `${props.serviceName}-${props.stageName}-UserPool`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      advancedSecurityMode: AdvancedSecurityMode.AUDIT
    });

    const preTokenFunction = this.createPreTokenFunction();

    userPool.addTrigger(UserPoolOperation.PRE_TOKEN_GENERATION, preTokenFunction);

    const webUserPoolClient = new UserPoolClient(this, 'WebUserPoolClient', {
      userPool,
      authFlows: {
        userSrp: true
      },
      preventUserExistenceErrors: true
    });

    new CfnUserPoolGroup(this, 'AdminGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Admin'
    });

    new CfnUserPoolGroup(this, 'ReadOnlyGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'ReadOnly'
    });

    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: webUserPoolClient.userPoolClientId });

    this.createApiEndpoints(api, userPool);
  }

  createPreTokenFunction() {
    const func = new NodejsFunction(this, 'PreTokenFunction', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'handler',
      entry: 'functions/pre-token.js',
      memorySize: 1024
    });

    return func;
  }

  /**
   * 
   * @param {RestApi} api
   * @param {UserPool} userPool
   */
  createApiEndpoints(api, userPool) {
    const authorizer = new CfnAuthorizer(this, 'CognitoAuthorizer', {
      name: 'CognitoAuthorizer',
      type: 'COGNITO_USER_POOLS',
      identitySource: 'method.request.header.Authorization',
      providerArns: [userPool.userPoolArn],
      restApiId: api.restApiId,
    });

    const mockIntegration = new MockIntegration({
      requestTemplates: {
        "application/json": JSON.stringify({
          statusCode: 200
        })
      },
      integrationResponses: [{
        statusCode: "200",
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Methods': "'GET,OPTIONS'",
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        },
        responseTemplates: {
          "application/json": JSON.stringify({
              message: "ok"
          })
        },
      }]
    })

    // GET /admin
    const adminResource = api.root.addResource('admin')
    adminResource.addMethod('GET', mockIntegration, {
      authorizer: {
        authorizationType: AuthorizationType.COGNITO,
        authorizerId: authorizer.ref,        
      },
      authorizationScopes: ['accessTokenApi/admin'],
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Headers': true,
        },
      }]
    });

    adminResource.addCorsPreflight({
      allowHeaders: ['*'],
      allowMethods: ['OPTIONS', 'GET'],
      allowCredentials: true,
      allowOrigins: ['*']
    });

    // GET /readonly
    const readonlyResource = api.root.addResource('readonly');
    readonlyResource.addMethod('GET', mockIntegration, {
      authorizer: {
        authorizationType: AuthorizationType.COGNITO,
        authorizerId: authorizer.ref
      },
      authorizationScopes: ['accessTokenApi/readonly'],
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Headers': true,
        },
      }]
    });

    readonlyResource.addCorsPreflight({
      allowHeaders: ['*'],
      allowMethods: ['OPTIONS', 'GET'],
      allowCredentials: true,
      allowOrigins: ['*']
    });

    // make sure the unauthorized response has the correct CORS headers
    api.addGatewayResponse('UnauthorizedResponse', {
      type: ResponseType.UNAUTHORIZED, // 401 response type
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Methods': "'GET,POST,OPTIONS'",
        'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      },
      templates: {
        'application/json': '{"message": "Unauthorized"}',
      },
    });
  }
}

module.exports = { ApiStack }
