import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
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

@Controller('speakers')
export class SpeakersController {
  constructor(
    private speakersService: SpeakersService,
    private readonly minioService: MinioService,
  ) {}

  @Get('')
  @Render('SpeakersPage')
  async getByStatus(@Req() request?: Request) {
    let company = request.query.company?.toString();

    let speakers = await this.speakersService.getByOrganization(company);

    return { speakers, company };
  }

  @Get(':id')
  @Render('SingleSpeakerPage')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.speakersService.getById(id);
  }

  @Post(':id')
  @Redirect('/speakers')
  changeStatus(@Param('id', ParseIntPipe) id: number) {
    return this.speakersService.changeStatus(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('UP')
    await this.minioService.createBucketIfNotExists();
    const fileName = this.minioService.uploadFile(file);
    return fileName;
  }
}
