import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateIf } from 'class-validator';

export class SignedGodTokenDTO {
  @IsNotEmpty()
  signature: string;
}

export class RetrieveFriendDTO {
  @ValidateIf((rfd) => !rfd.name || rfd.id)
  name: string;

  @ValidateIf((rfd) => !rfd.id || rfd.name)
  id: number;
}

export class CreateTimerDTO {
  @IsNotEmpty()
  name: string;
}

export class RefreshTimerDTO {
  @Type(() => Number)
  id: number;
}
