import { Module } from '@nestjs/common';
import { ProductService } from './services';
import { DynamoDBModule } from 'src/dynamoDb/dynamoDb.module';

@Module({
  imports: [DynamoDBModule],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
