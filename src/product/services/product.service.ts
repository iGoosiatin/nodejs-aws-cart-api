import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  GetCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { AvailableProduct, Stock, Product } from '../models';
import { ProductNotFound } from '../errors';
import { CartItem } from 'src/entities/entity.cartItem';
import { InsufficientStocksException } from 'src/cart/exceptions';

@Injectable()
export class ProductService {
  constructor(
    @Inject('DYNAMODB_CLIENT')
    private readonly dynamoDBClient: DynamoDBDocumentClient,
  ) {}

  async getAvailableProductById(id: string): Promise<AvailableProduct> {
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

  async getAvailableProductsByIds(ids: string[]): Promise<AvailableProduct[]> {
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

  async getStocksByIds(ids: string[]) {
    const Keys = ids.map((id) => ({
      id,
    }));
    const command = new BatchGetCommand({
      RequestItems: {
        [process.env.DYNAMO_DB_STOCKS_TABLE]: {
          Keys,
        },
      },
    });

    const response = await this.dynamoDBClient.send(command);
    return (response.Responses[process.env.DYNAMO_DB_STOCKS_TABLE] ||
      []) as Stock[];
  }

  async updateStocksFromOrderCart(orderItems: CartItem[]) {
    const ids = orderItems.map((item) => item.productId);
    const availableStocks = await this.getStocksByIds(ids);
    const availableStocksMap = availableStocks.reduce<Record<string, number>>(
      (map, stock) => {
        map[stock.id] = stock.count;
        return map;
      },
      {},
    );

    const errors = orderItems
      .filter(({ productId, count }) => count > availableStocksMap[productId])
      .map(
        ({ productId, count }) =>
          `${productId} ordered ${count} - available ${availableStocksMap[productId]}`,
      );

    if (errors.length) {
      throw new InsufficientStocksException(errors.join(', '));
    }

    const TransactItems = orderItems.map(({ productId, count }) => ({
      Update: {
        TableName: process.env.DYNAMO_DB_STOCKS_TABLE,
        Key: {
          id: productId,
        },
        UpdateExpression: 'set #count = :count',
        ExpressionAttributeNames: {
          '#count': 'count',
        },
        ExpressionAttributeValues: {
          ':count': availableStocksMap[productId] - count,
        },
      },
    }));

    const command = new TransactWriteCommand({
      TransactItems,
    });

    await this.dynamoDBClient.send(command);
  }
}
