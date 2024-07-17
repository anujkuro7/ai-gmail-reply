import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Redis } from 'ioredis';
import { GroqAiChatService } from './groqAi.service';
import { GeminiAi } from './geminiAi.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly chatService: GroqAiChatService,
    private readonly geminiAi: GeminiAi
  ) { }

  async requestRefreshToken(code: string) {
    const refresh_token = await this.redis.get('refresh-token')
    if (!refresh_token) {
      let data = {
        'code': `${code}`,
        'client_id': `${process.env.ClientId}`,
        'client_secret': `${process.env.ClientSecret}`,
        'redirect_uri': 'http://localhost:8800/gmail/gmail-refresh-token',
        'grant_type': 'authorization_code',
        'access_type': 'offline',
        'prompt': 'consent'
      }
      const queryString = new URLSearchParams(data).toString();
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://accounts.google.com/o/oauth2/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: queryString
      };
      let response = await axios.request(config)
      const refresh_token = await this.saveRefreshToken(response.data.refresh_token)
      return refresh_token
    } else {
      return refresh_token
    }
  }

  async requestAccessToken() {
    const refresh_token = await this.getRefreshToken()
    let data = {
      'client_id': `${process.env.ClientId}`,
      'client_secret': `${process.env.ClientSecret}`,
      'refresh_token': `${refresh_token}`,
      'grant_type': 'refresh_token'
    };
    const queryString = new URLSearchParams(data).toString();
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://accounts.google.com/o/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: queryString
    };
    const response = await axios.request(config);
    const access_token = await this.saveAcessToken(response.data.access_token);
    return access_token;
  }

  async saveRefreshToken(token: string): Promise<any> {
    await this.redis.set('refresh-token', token);
    const refresh_token = await this.redis.get('refresh-token');
    if (refresh_token) {
      return (refresh_token)
    }
    else {
      return (token);
    }
  }

  async saveAcessToken(token: string): Promise<any> {
    await this.redis.set('access-token', token, 'EX', 3599);
    const access_token = await this.redis.get('access-token');
    if (access_token) {
      return (access_token)
    }
    else {
      return (token);
    }
  }

  async getAccessToken() {
    const access_token = await this.redis.get('access-token')
    if (access_token) {
      return access_token
    }
    else {
      const access_token = await this.requestAccessToken()
      const save_token = await this.saveAcessToken(access_token)
      return save_token
    }
  }

  async getRefreshToken() {
    const refresh_token = await this.redis.get("refresh-token")
    return refresh_token
  }

  async getLatestMessageId(token: string) {
    let config = {
      method: 'get',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      maxBodyLength: Infinity,
    }
    const response = await axios.request(config)
    const latestEmailMessageId: string = response.data.messages[0].id;
    return latestEmailMessageId
  }

  async decryptText(encryptedMsg: string) {
    const decrypt = Buffer.from(encryptedMsg, 'base64').toString()
    return decrypt
  }

  async getMessage(token: string, msgId: string) {
    let config = {
      method: 'get',
      url: `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      maxBodyLength: Infinity,
    }
    const getMessage = await axios.request(config);
    let Subject: string;
    let fromEmailId: string;
    let toEmailId: string;
    await getMessage.data.payload.headers.forEach((subject: { [x: string]: string; name: string; }) => {
      if (subject.name == 'Subject') {
        Subject = subject['value']
      } else if (subject.name == 'From') {
        fromEmailId = subject['value'].match('<([^<>]*)>')[1]
      } else if (subject.name == 'To') {
        toEmailId = subject['value']
      }
    })
    let encryptedmsgBody: string;
    await getMessage.data.payload.parts.forEach((msgbody: { partId: number; body: { data: string; }; }) => {
      if (msgbody.partId == 0) {
        encryptedmsgBody = (msgbody.body.data)
      }
    })
    const msgBody = await this.decryptText(encryptedmsgBody)
    const message = {
      subject: Subject,
      body: msgBody,
      from: fromEmailId,
      to: toEmailId
    }
    return message
  }

  async getGroqReply(message: any) {
    const reply = await this.chatService.getReply(message)
    return reply
  }

  async getGeminiReply(message: any) {
    const reply = await this.geminiAi.getReply(message)
    return reply
  }

  // FOR FUTURE SCOPE
  async draftMail() {
    const token = await this.getAccessToken()
    const messageId = await this.getLatestMessageId(token)
    const message = await this.getMessage(token, messageId)
    const reply = await this.getGeminiReply(message)
    const data = {
      raw: createEmail(reply.subject, reply.body, message.to, message.from)
    };

    function createEmail(subject, body, to, from) {
      const boundary = '----MyMessage----';
      const charset = 'UTF-8';

      // Create email message in MIME format
      let email = `From: ${from}\r\n`;
      email += `To: ${to}\r\n`;
      email += `Subject: ${subject}\r\n`;
      email += `\r\n`;
      email += `${body}\r\n`;

      // Base64 encode the email content
      const encodedEmail = Buffer.from(email, 'utf-8').toString('base64');

      // Create multipart message with MIME boundaries
      return `--${boundary}\r\n` +
        `Content-Type: text/plain; charset=${charset}\r\n` +
        `\r\n` +
        encodedEmail +
        `\r\n--${boundary}--`;
    }

    const config = {
      method: 'post',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/drafts',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: data
    }
    const response = await axios.request(config)
    return response
  }
}
