import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GitHubApp } from './github-app';
  
export class GitHubAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new GitHubApp(this, 'github-app');
  }
}
