import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { OrderDto, UuidParams } from './dto/order.dto';

@Controller('api/order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async checkout(@Req() req: AppRequest, @Body() body: OrderDto) {
    const userId = getUserIdFromRequest(req);

    const order = await this.orderService.create({
      userId,
      delivery: body.address,
    });

    return {
      order,
    };
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async getOrders() {
    return await this.orderService.getOrdersWithItems();
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrder(@Param() { id }: UuidParams) {
    return await this.orderService.deleteById(id);
  }
}
