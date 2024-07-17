import { Injectable } from '@nestjs/common';
const { GoogleGenerativeAI } = require("@google/generative-ai");

@Injectable()
export class GeminiAi {
    async getReply(msg) {
        const genAI = new GoogleGenerativeAI(process.env.gemini_api_key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const subject = msg.subject;
        const body = msg.body;
        const prompt = `Act as a professional writer and help with this, I have received a mail with subject ${subject} and message ${body}, Can you please give me a reply along with subject which is informative and formal. Provide the response in a JavaScript object format only Subject and Body, without any additional text or explanations.`;
        const result = await model.generateContent([prompt]);
        return (result.response.text());
    }
}
