import { v4 as uuid } from 'uuid';
import { AWSError, DynamoDB } from 'aws-sdk';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

const TABLE_NAME = process.env.TABLE_NAME;

const dbClient = new DynamoDB.DocumentClient();

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const isAWSError = (x: any): x is AWSError => {
    return typeof x.message === 'string';
  };

  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: 'Hello from DynamoDb',
  };

  const item =
    typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  item.spaceId = uuid();

  try {
    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise();
  } catch (error) {
    if (isAWSError(error)) {
      result.body = error.message;
    }
  }

  result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);

  return result;
}

export { handler };
