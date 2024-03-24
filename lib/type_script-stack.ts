import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';

export class TypeScriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
 
    const table = new dynamodb.Table(this, 'DynamoDbSample', {
      partitionKey: {
        name: 'users',
        type: dynamodb.AttributeType.STRING
      }, 
      sortKey: {
        name: 'created_at',
        type: dynamodb.AttributeType.NUMBER
      },
    });
    new CfnOutput(this, 'TableName', { value: table.tableName });

  }
}
