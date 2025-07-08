import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Offset must be a positive number' })
  offset: number = 0;
}
