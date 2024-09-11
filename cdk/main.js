#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ApiStack } = require('./constructs/api-stack');

const app = new cdk.App();

let stageName = app.node.tryGetContext('stageName');
let ssmStageName = app.node.tryGetContext('ssmStageName');

if (!stageName) {
  console.log('Defaulting stage name to dev');
  stageName = 'dev';
}

if (!ssmStageName) {
  console.log(`Defaulting SSM stage name to "stageName": ${stageName}`);
  ssmStageName = stageName;
}

const serviceName = 'access-token-api';

new ApiStack(app, `ApiStack-${stageName}`, {
  serviceName,
  stageName,
  ssmStageName,
});
