import {
    Controller,
    Get,
    Param,
    Query,
    Res,
} from '@nestjs/common';

import { Response } from 'express'
import { LeberMebelScraperService } from './site-scrapper.service'
import { readFileSync } from 'fs'

@Controller('/site-scrapper')
export class SiteScrapperController {
    constructor(
        private readonly leberScraper: LeberMebelScraperService
    ) {}

    // todo by param select scraper
    @Get('/scrap/leber')
    async scrape(@Res() response: Response) {
        const data = JSON.parse(
            readFileSync('/home/data/projects/web/oakame/okme/data2.json', 'utf8')
        )

        const execRes = await this.leberScraper.scrap(data.products)
        return response.status(200).json(execRes)
    }

}
