import { SpeakerStatusType } from 'src/types';

export class CreateSpeakerDto {
  id: number;
  phone: string;
  email: string;
  status: SpeakerStatusType;
  name: string;
  description: string;
}
