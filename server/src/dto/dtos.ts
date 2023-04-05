import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateIf, Max, Min, MaxLength } from 'class-validator';

export class SignedGodTokenDTO {
  @IsNotEmpty()
  signature: string;
}

export class RetrieveFriendDTO {
  @ValidateIf((rfd) => !rfd.name || rfd.id)
  name: string;

  @ValidateIf((rfd) => !rfd.id || rfd.name)
  @Type(() => Number)
  id: number;
}

export class CreateTimerDTO {
  @IsNotEmpty()
  @MaxLength(80)
  name: string;
}

export class RetrieveTimerDTO {
  @Type(() => Number)
  id: number;
}

export class GetPageDTO {
  @Type(() => Number)
  @Max(500)
  @Min(1)
  take = 100;

  @Type(() => Number)
  skip = 0;
}
