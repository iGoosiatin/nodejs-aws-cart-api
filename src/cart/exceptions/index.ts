import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidProductException extends HttpException {
  constructor(productId: string) {
    super(
      `Product with id ${productId} does not exist`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InsufficientStockException extends HttpException {
  constructor(stockAvailable: number) {
    super(
      `Cannot purchase more than available: ${stockAvailable}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
