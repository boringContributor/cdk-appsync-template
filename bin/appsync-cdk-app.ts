#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { AppsyncCdkAppStack } from '../lib/appsync-cdk-app-stack';

const app = new App();

const context: string = app.node.tryGetContext('stage');

if (context === 'testing') {
  new AppsyncCdkAppStack(app, 'test');
} else if (context === 'prod') {
  new AppsyncCdkAppStack(app, 'prod');
} else {
  // default to dev
  new AppsyncCdkAppStack(app, 'dev');
}
