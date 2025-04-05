import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const createDynamoDBConfig = () =>
  process.env.NODE_ENV === 'aws'
    ? {}
    : {
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      };

export const createDynamoDBClient = () => {
  const config = createDynamoDBConfig();
  const dbClient = new DynamoDBClient(config);
  return DynamoDBDocumentClient.from(dbClient);
};
