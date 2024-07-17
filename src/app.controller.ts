import { Controller, Get, HttpException, HttpStatus, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
@Controller('gmail')
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }
  @Get('gmail-oauth')
  async getOauthPermission(
    @Query() params
  ) {
    try {
      const code = params.code
      const refreshToken = await this.getRefreshToken(code)
      return "Oauth Success"
    } catch (err) {
      console.log("error", err)
      return err
    }
  }

  @Get('gmail-refresh-token')
  async getRefreshToken(@Param() code) {
    const refreshToken = await this.appService.getRefreshToken()
    return refreshToken
  }

  @Get('gmail-access-token')
  async getGmailAccessToken() {
    try {
      const access_token = await this.appService.getAccessToken();
      return access_token
    }
    catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('latest-gmail-id')
  async getLatestGmail() {
    try {
      const access_token = await this.appService.getAccessToken()
      const response = await this.appService.getLatestMessageId(access_token)
      return response
    } catch (error) {
      console.log("error", error)
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('gmail-message')
  async getMessage() {
    try {
      const token = await this.appService.getAccessToken()
      const messageId = await this.appService.getLatestMessageId(token)
      const message = await this.appService.getMessage(token, messageId)
      return message
    } catch (err) {
      console.log(err)
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('generate-reply')
  async getReply() {
    try {
      const message = await this.getMessage()
      const reply = await this.appService.getGeminiReply(message)
      return reply
    } catch (err) {
      console.log(err)
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  // Future Scope
  @Get('draft-mail')
  async draftMail() {
    try {
      const draftMail = await this.appService.draftMail()
      return draftMail
    } catch (err) {
      console.log(err)
      throw new HttpException(err, HttpStatus.BAD_REQUEST)
    }
  }

}

