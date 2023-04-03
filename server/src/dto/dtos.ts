import { IsNotEmpty } from 'class-validator';

export class SignedGodTokenDTO {
  @IsNotEmpty()
  signature: string;
}

export class RetrieveFriendDTO {
  @IsNotEmpty()
  name: string;
}

export class CreateTimerDTO {
  @IsNotEmpty()
  name: string;
}
