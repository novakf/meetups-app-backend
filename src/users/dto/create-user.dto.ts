import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'name@example.com' })
  readonly email: string;

  @ApiProperty({ example: 'Иван Петров' })
  readonly name: string;

  @ApiProperty({ example: 'password' })
  readonly password: string;
}
