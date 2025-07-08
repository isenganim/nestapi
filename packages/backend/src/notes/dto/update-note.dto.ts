import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsUUID } from 'class-validator';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiPropertyOptional({
    description: 'Array of tag IDs to add to the note',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  addTagIds?: string[];

  @ApiPropertyOptional({
    description: 'Array of tag IDs to remove from the note',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  removeTagIds?: string[];
}
