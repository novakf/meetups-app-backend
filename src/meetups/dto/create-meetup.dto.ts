import { MeetupStatusType } from "src/types";

export class CreateMeetupDto {
  id: number;
  status: MeetupStatusType;
  date: string;
  place: string;
  title: string;
}