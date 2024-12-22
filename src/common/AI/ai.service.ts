import { Injectable } from '@nestjs/common';import { ConfigService } from '@nestjs/config';
import { sleep } from '../misc/utils';

@Injectable({
    scope: 0 // Singleton for checking intervals to not spam the API
})
export class AIService {
    private lastRequest = Date.now()
    private interval = 2000

    constructor(
        private readonly configService: ConfigService
    ) {}

    /***
    * retruns first message from api AI response
    */
    async ask(msg: string): Promise<string> {
        const diff = Date.now() - this.lastRequest
        if (diff < this.interval) {
            console.log("sleeping for", this.interval - diff)
            await sleep(this.interval - diff)
        }
        const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.configService.get<string>('AI_API_KEY')}`,
            },
            body: JSON.stringify({
                "model": "mistral-small-latest",
                "messages": [
                    {
                        "role": "user",
                        "content": msg
                    }
                ],
                "response_format": 
                {
                    "type": "text"
                }
            })
        })
        const json = await res.json()
        return json.choices[0].message.content
    }
}
