#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GitHubAppStack } from '../lib/github-app-stack';

const app = new cdk.App();
new GitHubAppStack(app, 'GitHubAppStack', {
});