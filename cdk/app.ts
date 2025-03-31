import * as cdk from 'aws-cdk-lib';
import { CartApiStack } from './lib/cartApiStack';

const app = new cdk.App();
new CartApiStack(app, 'CartApiStack');
app.synth();
