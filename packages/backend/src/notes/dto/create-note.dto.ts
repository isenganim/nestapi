import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'The title of the note',
    example: 'My First Note',
    maxLength: 255,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The content of the note in markdown format',
    example: '# Hello World\nThis is my first note!',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Whether the note is public',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Whether the note is pinned',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @ApiProperty({
    description: 'Array of tag IDs to associate with the note',
    type: [String],
    required: false,
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiProperty({
    description: 'Metadata for the note',
    required: false,
    example: { category: 'personal', priority: 'high' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
