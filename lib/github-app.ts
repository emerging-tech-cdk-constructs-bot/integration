import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';

const GITHUB_APP_ID = "GITHUB_APP_ID";
const GITHUB_APP_WEBHOOK_SECRET = "GITHUB_APP_WEBHOOK_SECRET";
const GITHUB_APP_TOKEN = "GITHUB_APP_TOKEN";

function getEnv(envName: string): string {
  let envValue = process.env[envName];
  if ((envValue === undefined) || (envValue === null)) {
    throw new Error(`Environment variable ${envName} must set`);
  }
  return String(envValue);
}
export class GitHubApp extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const githubAppFunction = new NodejsFunction(this, 'function', {
      runtime: Runtime.NODEJS_LATEST,
      environment: {
        GITHUB_APP_ID: getEnv(GITHUB_APP_ID),
        GITHUB_APP_TOKEN: getEnv(GITHUB_APP_TOKEN),
        GITHUB_APP_WEBHOOK_SECRET: getEnv(GITHUB_APP_WEBHOOK_SECRET),
      },
    });
    new LambdaRestApi(this, 'apigw', {
      handler: githubAppFunction,
    });
  }
}
