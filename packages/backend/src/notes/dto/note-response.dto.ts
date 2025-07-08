import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
  @ApiProperty({ description: 'The unique identifier of the tag' })
  id: string;

  @ApiProperty({ description: 'The name of the tag' })
  name: string;

  @ApiProperty({ description: 'The color of the tag', required: false })
  color?: string;
}

export class NoteLinkResponseDto {
  @ApiProperty({ description: 'The unique identifier of the link' })
  id: string;

  @ApiProperty({ description: 'The ID of the target note' })
  targetId: string;

  @ApiProperty({ description: 'The type of the link' })
  type: string;

  @ApiProperty({ description: 'Description of the link', required: false })
  description?: string;
}

export class NoteResponseDto {
  @ApiProperty({ description: 'The unique identifier of the note' })
  id: string;

  @ApiProperty({ description: 'The title of the note' })
  title: string;

  @ApiProperty({ description: 'URL-friendly slug for the note' })
  slug: string;

  @ApiProperty({ description: 'The content of the note in markdown format' })
  content: string;

  @ApiProperty({ description: 'A brief summary of the note', required: false })
  summary?: string;

  @ApiProperty({ description: 'Whether the note is public' })
  isPublic: boolean;

  @ApiProperty({ description: 'Whether the note is pinned' })
  isPinned: boolean;

  @ApiProperty({ description: 'Whether the note is archived' })
  isArchived: boolean;

  @ApiProperty({ description: 'The ID of the user who owns the note' })
  userId: string;

  @ApiProperty({ description: 'The version of the note' })
  version: number;

  @ApiProperty({ 
    description: 'Tags associated with the note',
    type: [TagResponseDto],
    required: false 
  })
  tags?: TagResponseDto[];

  @ApiProperty({ 
    description: 'Links to other notes',
    type: [NoteLinkResponseDto],
    required: false 
  })
  links?: NoteLinkResponseDto[];

  @ApiProperty({ 
    description: 'Metadata for the note',
    type: 'object',
    required: false 
  })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'The date and time when the note was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date and time when the note was last updated' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'The date and time when the note was deleted (soft delete)',
    required: false 
  })
  deletedAt?: Date;
}
