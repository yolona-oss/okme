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

    /***
     * Upload images to cloudinary and save them to db
     */
    async uploadImages(files: {path: string, filename: string}[]) {
        files
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
            if (doc.imageUrl == url) {
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
