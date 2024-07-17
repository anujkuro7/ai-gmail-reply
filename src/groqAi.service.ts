import { Injectable } from "@nestjs/common";
import Groq from "groq-sdk";

@Injectable()
export class GroqAiChatService {
    constructor() { }
    async getGroqChatCompletion(message) {
        const groq = new Groq({ apiKey: process.env.groq_api_key });
        const subject = message.subject;
        const body = message.body;
        return groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `I have received a mail with subject ${subject} and message ${body}, Can you please give me a reply along with subject which is informative and formal. Also give me reply in format subject: subject for the mail and body: email body. I only want these two part in the reply, It should look like a JSON Object so that I can extract subject and body from it`,
                },
            ],
            model: "llama3-8b-8192",
        });
    }

    async getReply(message) {
        const chatCompletion = await this.getGroqChatCompletion(message);
        return (chatCompletion.choices[0]?.message?.content || "");
    }
}


