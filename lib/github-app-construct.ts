import { Construct } from 'constructs';
import { Duration, aws_iam as iam } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, LogFormat } from 'aws-cdk-lib/aws-lambda';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import GITHUB_APP_SECRETS_MANAGER_PREFIX from './github-app-helper';
import * as path from 'path';

export class GitHubAppConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const githubAppFunction = new NodejsFunction(this, 'function', {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(20),
      handler: 'handler',
      logFormat: LogFormat.JSON,
      systemLogLevel: 'DEBUG', // 'DEBUG', 'INFO', and 'WARN'
      applicationLogLevel: 'TRACE', // plus 'TRACE', 'ERROR', and 'FATAL'
      entry: path.join(__dirname, `/github-app-construct.function.ts`),
      role: new iam.Role(this, 'functionRole', {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        description: 'Role for GitHub App',
        inlinePolicies: {
          // S3Policy: new iam.PolicyDocument({
          //   statements: [
          //     new iam.PolicyStatement({
          //       actions: ['s3:PutObject'],
          //       effect: iam.Effect.ALLOW,
          //       resources: [gitHubBucket.arnForObjects(`${GITHUB_PREFIX}/*`)]
          //     })
          //   ]
          // }),
          SecretsManagerPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ['secretsmanager:GetSecretValue'],
                effect: iam.Effect.ALLOW,
                resources: ["*"], // GITHUB_APP_SECRETS_MANAGER_PREFIX + "*"],
                sid: 'AllowGetSecretValueForGitHubApps'
              })
            ]
          }),
          KmsPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ['kms:Decrypt', 'kms:GenerateDataKey'],
                effect: iam.Effect.ALLOW,
                resources: ["*"],
                sid: 'AllowKMSKeyAccessForGitHubApps'
              })
            ]
          }),
          LogsPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ['logs:CreateLogGroup','logs:CreateLogStream','logs:PutLogEvents'],
                effect: iam.Effect.ALLOW,
                resources: ["*"],
                sid: 'AllowLogsPublicationForGitHubApps'
              })
            ]
          }),
        }
      }),
    });
    const githubAppApiGateway = new LambdaRestApi(this, 'apigateway', {
      handler: githubAppFunction,
    });
  }
}
