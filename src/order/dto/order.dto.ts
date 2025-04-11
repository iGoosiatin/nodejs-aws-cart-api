import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  ValidateNested,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';

class AddressDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  comment: string;
}

export class OrderDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

export class UuidParams {
  @IsUUID()
  id: string;
}
