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

@Controller('speakers')
export class SpeakersController {
  constructor(
    private speakersService: SpeakersService,
    private readonly minioService: MinioService,
  ) {}

  @Get('')
  //@Render('SpeakersPage')
  async getByStatus(@Req() request?: Request) {
    const userID = 1;

    let company = request.query.company?.toString();

    let speakers = await this.speakersService.getByOrganization(
      userID,
      company,
    );

    return { speakers, company };
  }

  @Get(':id')
  @Render('SingleSpeakerPage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.speakersService.getById(id);
  }

  //  @Post(':id')
  //  @Redirect('/speakers')
  //  changeStatus(@Param('id', ParseIntPipe) id: number) {
  //    return this.speakersService.changeStatus(id);
  //  }

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

    await this.speakersService.uploadAvatar(id, file.originalname);

    const fileName = await this.minioService.uploadFile(
      `/speakers/${id}`,
      file,
    );

    return `Изображение изменено на ${fileName}`;
  }

  @Post(':id')
  addToMeetup(@Param('id', ParseIntPipe) id: number) {
    let userID = 1;
    return this.speakersService.addSpeakerToMeetup(id, userID);
  }

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

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() speakerDto: CreateSpeakerDto,
  ) {
    return this.speakersService.updateSpeaker(id, speakerDto);
  }
}
