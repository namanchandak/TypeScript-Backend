import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam'; // Import IAM module
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';

export class TypeScriptStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
 
    // Create DynamoDB Table
    const table = new dynamodb.Table(this, 'DynamoDbSample', {
      tableName: "DynamoDbSample",
      partitionKey: {
        name: 'users',
        type: dynamodb.AttributeType.STRING
      }, 
      sortKey: {
        name: 'created_at',
        type: dynamodb.AttributeType.NUMBER
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    new CfnOutput(this, 'TableName', { value: table.tableName });

    // Create IAM Role for Lambda function
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    // Attach policy granting permission to invoke Lambda function
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: ['*'] // Adjust resource to target specific Lambda functions if needed
    }));

    // Attach policy granting permission to access DynamoDB table
    table.grantReadData(lambdaRole); // Grant read access to the Lambda function

    // Create Lambda function
    const getAllUsersLambda = new nodejs.NodejsFunction(this, 'GetAllUsersLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: './lambda/index.ts', // Assuming your Lambda code is in a 'lambda' directory
      environment: {
        TABLE_NAME: table.tableName
      },
      role: lambdaRole // Associate Lambda function with the IAM role
    });

    // Create API Gateway
    const api = new apigw.RestApi(this, 'MyApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS
      }
    });

    // Create resource
    const users = api.root.addResource('users');

    // Create GET method
    const getAllMethod = new apigw.LambdaIntegration(getAllUsersLambda);

    // Set up method options to not require an authorization token
    users.addMethod('GET', getAllMethod, {
      authorizationType: apigw.AuthorizationType.NONE,
    });

    // Output API Gateway endpoint
    new CfnOutput(this, 'ApiEndpoint', { value: api.url });

  }
}
