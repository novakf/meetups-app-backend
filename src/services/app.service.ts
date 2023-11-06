import { Injectable, Param, ParseIntPipe, Req } from '@nestjs/common';
import { Request } from 'express';
import { data } from 'src/meetups';

@Injectable()
export class AppService {
  getMeetups() {
    let meetups = data;
    return { meetups };
  }

  getByStatus(@Req() request?: Request) {
    if (!request.query.title) {
      let meetups = data;
      return { meetups };
    }
    let filteredMeetups = [];
    let searchTitle = request.query.title.toString();
    data.forEach(
      (meetup) =>
        meetup.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
        filteredMeetups.push(meetup),
    );
    let meetups = filteredMeetups;
    return { meetups, searchTitle };
  }

  getById(@Param('id', ParseIntPipe) id: number) {
    return data.find((meetup) => meetup.id === id);
  }
}
