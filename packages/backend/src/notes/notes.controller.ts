import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../types/express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../generated/client';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';

@ApiTags('notes')
@ApiBearerAuth()
@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'The note has been successfully created.', type: NoteResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<NoteResponseDto> {
    return this.notesService.create(req.user.id, createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes for the authenticated user' })
  @ApiQuery({ name: 'isArchived', required: false, type: Boolean, description: 'Filter by archived status' })
  @ApiQuery({ name: 'isPinned', required: false, type: Boolean, description: 'Filter by pinned status' })
  @ApiQuery({ name: 'tagId', required: false, type: String, description: 'Filter by tag ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in title and content' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Return all notes.', type: [NoteResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('isArchived') isArchived?: boolean,
    @Query('isPinned') isPinned?: boolean,
    @Query('tagId') tagId?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.notesService.findAll(req.user.id, {
      isArchived,
      isPinned,
      tagId,
      search,
      page: Number(page),
      limit: Number(limit) > 100 ? 100 : Number(limit), // Limit max page size
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({ status: 200, description: 'Return the note.', type: NoteResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    return this.notesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, description: 'The note has been successfully updated.', type: NoteResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    return this.notesService.update(req.user.id, id, updateNoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 204, description: 'The note has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.notesService.remove(req.user.id, id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a note' })
  @ApiResponse({ status: 200, description: 'The note has been archived.', type: NoteResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async archive(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    return this.notesService.archive(req.user.id, id, true);
  }

  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a note' })
  @ApiResponse({ status: 200, description: 'The note has been unarchived.', type: NoteResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async unarchive(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    return this.notesService.archive(req.user.id, id, false);
  }

  @Post(':id/pin')
  @ApiOperation({ summary: 'Pin a note' })
  @ApiResponse({ status: 200, description: 'The note has been pinned.', type: NoteResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async pin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    return this.notesService.update(req.user.id, id, { isPinned: true } as UpdateNoteDto);
  }

  @Post(':id/unpin')
  @ApiOperation({ summary: 'Unpin a note' })
  @ApiResponse({ status: 200, description: 'The note has been unpinned.', type: NoteResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async unpin(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    return this.notesService.update(req.user.id, id, { isPinned: false } as UpdateNoteDto);
  }
}
