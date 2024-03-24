#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TypeScriptStack } from '../lib/type_script-stack';

const app = new cdk.App();
new TypeScriptStack(app, 'TypeScriptStack');
