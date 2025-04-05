import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { AvailableProduct, Stock, Product } from '../models';
import { ProductNotFound } from '../errors';

@Injectable()
export class ProductService {
  constructor(
    @Inject('DYNAMODB_CLIENT')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async getById(id: string): Promise<AvailableProduct> {
    const productGetCommand = new GetCommand({
      TableName: process.env.DYNAMO_DB_PRODUCTS_TABLE,
      Key: {
        id,
      },
    });

    const stockGetCommand = new GetCommand({
      TableName: process.env.DYNAMO_DB_STOCKS_TABLE,
      Key: {
        id,
      },
    });

    const [product, stock] = await Promise.all([
      this.dynamoDBClient.send(productGetCommand),
      this.dynamoDBClient.send(stockGetCommand),
    ]);

    const productItem = product.Item as Product;

    if (!productItem) {
      throw new ProductNotFound();
    }

    return {
      ...(product.Item as Product),
      count: stock.Item?.count ?? 0,
    };
  }

  async getByIds(ids: string[]): Promise<AvailableProduct[]> {
    const Keys = ids.map((id) => ({
      id,
    }));
    const command = new BatchGetCommand({
      RequestItems: {
        [process.env.DYNAMO_DB_PRODUCTS_TABLE]: {
          Keys,
        },
        [process.env.DYNAMO_DB_STOCKS_TABLE]: {
          Keys,
        },
      },
    });

    const response = await this.dynamoDBClient.send(command);

    const products: Product[] = (response.Responses[
      process.env.DYNAMO_DB_PRODUCTS_TABLE
    ] || []) as Product[];
    const stocks = (response.Responses[process.env.DYNAMO_DB_STOCKS_TABLE] ||
      []) as Stock[];

    const stocksMap = stocks.reduce<Record<string, number>>((map, stock) => {
      map[stock.id] = stock.count;
      return map;
    }, {});

    return products.map((product) => ({
      ...product,
      count: stocksMap[product.id] ?? 0,
    }));
  }
}
