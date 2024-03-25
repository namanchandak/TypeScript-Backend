import * as AWS from 'aws-sdk';

const TABLE_NAME = 'DynamoDbSample'; // Use environment variable from CDK

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any): Promise<any> => {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const response = await db.scan(params).promise(); // Access DynamoDB table
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response.Items), // Return DynamoDB items
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify('An error occurred'),
    };
  }
};
