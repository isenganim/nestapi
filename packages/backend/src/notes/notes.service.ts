import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<NoteResponseDto> {
    const { tagIds, ...noteData } = createNoteDto;
    
    // Generate unique slug from title
    const slug = await this.generateUniqueSlug(noteData.title, userId);
    
    const note = await this.prisma.note.create({
      data: {
        ...noteData,
        slug,
        user: { connect: { id: userId } },
        noteTags: tagIds?.length ? {
          create: tagIds.map(tagId => ({
            tag: { connect: { id: tagId } },
            assignedBy: userId,
          })),
        } : undefined,
      },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return this.mapToResponseDto(note);
  }

  async findAll(
    userId: string,
    options: {
      isArchived?: boolean;
      isPinned?: boolean;
      tagId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { 
      isArchived = false, 
      isPinned,
      tagId,
      search,
      page = 1,
      limit = 10,
    } = options;

    const where: any = {
      userId,
      deletedAt: null,
      isArchived,
    };

    if (typeof isPinned === 'boolean') {
      where.isPinned = isPinned;
    }

    if (tagId) {
      where.noteTags = {
        some: {
          tagId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, notes] = await Promise.all([
      this.prisma.note.count({ where }),
      this.prisma.note.findMany({
        where,
        include: {
          noteTags: {
            include: {
              tag: true,
            },
          },
          sourceLinks: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);

    return {
      data: notes.map(note => this.mapToResponseDto(note)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string): Promise<NoteResponseDto> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
        sourceLinks: {
          include: {
            targetNote: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this note');
    }

    return this.mapToResponseDto(note);
  }

  async update(
    userId: string,
    id: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    const existingNote = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      throw new NotFoundException('Note not found');
    }

    if (existingNote.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this note');
    }

    const { addTagIds = [], removeTagIds = [], ...updateData } = updateNoteDto;

    // Handle tag additions and removals in a transaction
    const [updatedNote] = await this.prisma.$transaction([
      this.prisma.note.update({
        where: { id },
        data: {
          ...updateData,
          version: { increment: 1 },
          ...(addTagIds.length > 0 && {
            noteTags: {
              create: addTagIds.map(tagId => ({
                tag: { connect: { id: tagId } },
                assignedBy: userId,
              })),
            },
          }),
        },
        include: {
          noteTags: {
            include: {
              tag: true,
            },
          },
          sourceLinks: true,
        },
      }),
      ...(removeTagIds.length > 0 ? [
        this.prisma.noteTag.deleteMany({
          where: {
            noteId: id,
            tagId: { in: removeTagIds },
          },
        }),
      ] : []),
    ]);

    return this.mapToResponseDto(updatedNote);
  }

  async remove(userId: string, id: string, hardDelete = false): Promise<void> {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this note');
    }

    if (hardDelete) {
      // Hard delete (permanent removal)
      await this.prisma.note.delete({
        where: { id },
      });
    } else {
      // Soft delete
      await this.prisma.note.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }
  }

  async archive(userId: string, id: string, archived = true): Promise<NoteResponseDto> {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this note');
    }

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: { 
        isArchived: archived,
        version: { increment: 1 },
      },
      include: {
        noteTags: {
          include: {
            tag: true,
          },
        },
        sourceLinks: true,
      },
    });

    return this.mapToResponseDto(updatedNote);
  }

  private mapToResponseDto(note: any): NoteResponseDto {
    return {
      id: note.id,
      title: note.title,
      slug: note.slug,
      content: note.content,
      summary: note.summary,
      isPublic: note.isPublic,
      isPinned: note.isPinned,
      isArchived: note.isArchived,
      userId: note.userId,
      version: note.version,
      tags: note.noteTags?.map(nt => ({
        id: nt.tag.id,
        name: nt.tag.name,
        color: nt.tag.color,
      })),
      links: note.sourceLinks?.map(link => ({
        id: link.id,
        targetId: link.targetId,
        type: link.type,
        description: link.description,
      })),
      metadata: note.metadata,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      deletedAt: note.deletedAt,
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }

  private async generateUniqueSlug(title: string, userId: string): Promise<string> {
    let baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug already exists for this user
    while (await this.prisma.note.findFirst({
      where: {
        slug,
        userId,
        deletedAt: null,
      },
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
