import { Module } from '@nestjs/common';
import { createDynamoDBClient } from '../config/dynamoDb.config';

@Module({
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useFactory: createDynamoDBClient,
    },
  ],
  exports: ['DYNAMODB_CLIENT'],
})
export class DynamoDBModule {}
