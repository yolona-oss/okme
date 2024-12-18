import mongoose, { Document, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs'

import { ImagesDocument } from './schemas/image-upload.schema';

import { CRUDService } from './../common/misc/crud-service';
import { AppError, AppErrorTypeEnum } from './../common/app-error';
import { extractFileName } from './../common/misc/utils';

@Injectable()
export class ImageUploadService extends CRUDService<ImagesDocument> {
    constructor(
        @InjectModel('Images')
        private imagesModel: Model<ImagesDocument>,
    ) {
        super(imagesModel)
    }

    async uploadImages(files: {path: string, filename: string}[], alt: string = 'image') {
        const createImageUrl = (file: {filename: string}) => 'http://localhost:4000/images/' + file.filename

        const docs: ImagesDocument[] = []
        for (const file of files) {
            const doc = await this.imagesModel.create(
                {
                    url: createImageUrl(file),
                    alt: alt
                }
            )

            docs.push(doc)
        }

        return docs
    }

    override async removeDocumentById(id: string) {
        return await super.removeDocumentById(id)
    }

    async removeMany(ids: string[]) {
        ids
    }

    async isImageUploaded(url: string): Promise<ImagesDocument|null> {
        const docs = await super.getAllDocuments()
        if (!docs) {
            throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
        }

        for (const doc of docs) {
            if (doc.url == url) {
                return doc
            }
        }
        return null
    }

    /***
     * @deprecated Use ImageUploadService::uploadImages instead
     */
    override async createDocument(data: Omit<ImagesDocument, keyof Document>) {
        throw new Error("Use ImageUploadService::uploadImages instead")
        return super.createDocument(data)
    }
}
