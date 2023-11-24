export class ResponseDto {
  readonly success: boolean;
  readonly message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}
