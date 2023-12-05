import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Redirect,
  Render,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from 'src/minio/minio.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BadRequestStatusType,
  NotFoundStatusType,
  SpeakerCreateBody,
  SpeakersResponseType,
} from 'src/types';
import { Speaker } from './speakers.model';
import { Meetup } from 'src/meetups/meetups.model';

@ApiTags('Спикеры')
@Controller('speakers')
export class SpeakersController {
  constructor(
    private speakersService: SpeakersService,
    private readonly minioService: MinioService,
  ) {}

  @ApiOperation({ summary: 'Получить спикеров по компании' })
  @ApiResponse({ status: 200, type: SpeakersResponseType })
  @Get('')
  //@Render('SpeakersPage')
  async getByCompany(@Req() request?: Request) {
    const userID = 1;

    let company = request.query.company?.toString();

    let speakers = await this.speakersService.getByOrganization(
      userID,
      company,
    );

    return { ...speakers, company };
  }

  @ApiOperation({ summary: 'Получить спикера по id' })
  @ApiResponse({ status: 200, type: Speaker })
  @Get(':id')
  //@Render('SingleSpeakerPage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.speakersService.getById(id);
  }

  //  @Post(':id')
  //  @Redirect('/speakers')
  //  changeStatus(@Param('id', ParseIntPipe) id: number) {
  //    return this.speakersService.changeStatus(id);
  //  }

  @ApiOperation({ summary: 'Создать нового спикера' })
  @ApiBody({ type: SpeakerCreateBody })
  @ApiResponse({ status: 201, type: Speaker })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() speakerDto: CreateSpeakerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.minioService.createBucketIfNotExists();

    const speaker = await this.speakersService.createSpeaker(
      speakerDto,
      file && file.originalname,
    );

    if (file)
      await this.minioService.uploadFile(`/speakers/${speaker.id}/`, file);

    return speaker;
  }

  @ApiOperation({ summary: 'Изменить фотографию пользователя' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: Speaker })
  @Put('/image/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const currentSpeaker = await this.getById(id);

    await this.minioService.deleteFile(
      currentSpeaker.avatarImg.split('meetups-app')[1],
    );

    const updatedSpeaker = await this.speakersService.uploadAvatar(
      id,
      file.originalname,
    );

    this.minioService.uploadFile(`/speakers/${id}`, file);

    return updatedSpeaker;
  }

  @ApiOperation({ summary: 'Добавить спикера в митап' })
  @ApiResponse({ status: 200, type: Meetup })
  @ApiResponse({ status: 400, type: BadRequestStatusType })
  @Post(':id')
  addToMeetup(@Param('id', ParseIntPipe) id: number) {
    let userID = 1;
    return this.speakersService.addSpeakerToMeetup(id, userID);
  }

  @ApiOperation({ summary: 'Удалить спикера' })
  @ApiResponse({ status: 200, type: SpeakersResponseType })
  @ApiResponse({ status: 404, type: NotFoundStatusType })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const userID = 1;

    const speaker = await this.getById(id);

    if (speaker)
      await this.minioService.deleteFile(
        speaker.avatarImg.split('meetups-app')[1],
      );

    return this.speakersService.deleteSpeaker(userID, id);
  }

  @ApiOperation({ summary: 'Изменить информацию о спикере' })
  @ApiResponse({ status: 200, type: SpeakersResponseType })
  @ApiBody({ type: CreateSpeakerDto })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() speakerDto: CreateSpeakerDto,
  ) {
    const userID = 1;
    return this.speakersService.updateSpeaker(userID, id, speakerDto);
  }
}
