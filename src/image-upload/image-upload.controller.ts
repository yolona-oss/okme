import {
    UseInterceptors,
    UploadedFiles,
    Param,
    Res,
    Req,
    Get,
    Post,
    Delete,
    Controller,
    Body,
} from '@nestjs/common';
import { Response, Request } from 'express'
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'

import { ImageUploadService } from './image-upload.service';

import { AppError, AppErrorTypeEnum } from './../common/app-error';
import { ParseObjectIdPipe } from './../common/pipes/parse-object-id.pipe';
import { generateRandom } from './../common/misc/utils';

@Controller('images')
export class ImageUploadController {

    constructor(private readonly imageUploadService: ImageUploadService) {}

    @Post('upload')
    @UseInterceptors(FilesInterceptor("images", 20, { // TODO create constants
        storage: diskStorage({
            destination: (_, __, cb) => cb(null, './images'),
            filename: (_, file, cb) => cb(null, `${generateRandom()}_${file.originalname}`)
        })
    }))
    async upload(
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: any,
        @Res() res: Response
    ) {
        try {
            if (!files) {
                throw new AppError(AppErrorTypeEnum.CANNOT_UPLOAD_IMAGE, {
                    errorMessage: "No files attached",
                    userMessage: "No files attached"
                })
            }

            const uploaded = await this.imageUploadService.uploadImages(files, body.alt)

            res.status(200).json(uploaded)
        } catch (e) {
            console.error(e)
            throw new AppError(AppErrorTypeEnum.BAD_REQUEST)
        }
    }

    @Get('/')
    async all(@Res() response: Response) {
        response.json({foo: 'bar'}).status(200)
    }

    @Get('/get/:name')
    async get(@Param('name') name: string, @Res() response: Response) {
        try {
            response.sendFile(name, { root: './images' })
        } catch (e) {
            console.log(e)
            throw new AppError(AppErrorTypeEnum.BAD_REQUEST)
        }
    }

    @Delete('/:id')
    async remove(@Param('id', ParseObjectIdPipe) id: string, @Res() response: Response) {
        const execRes = await this.imageUploadService.removeDocumentById(id)
        if (execRes) {
            return response.status(200).json({success: true})
        }
        throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
    }
}
