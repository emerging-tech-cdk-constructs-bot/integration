import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GitHubAppConstruct } from './github-app-construct';
  
export class GitHubAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new GitHubAppConstruct(this, 'github-app-construct');
  }
}
