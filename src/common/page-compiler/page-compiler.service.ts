import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs'
import ejs from 'ejs';

@Injectable()
export class PageCompilerService {
    constructor(
        private readonly configService: ConfigService
    ) {}

    async compile(file_path: fs.PathLike, data: any): Promise<string> {
        return await new Promise((resolve, reject) => {
            ejs.renderFile(file_path.toString(), data, { beautify: true }, (err, str) => {
                if (err) reject(err)
                resolve(str)
            })
        })
    }
}
