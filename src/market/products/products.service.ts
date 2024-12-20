import mongoose, { Model, FilterQuery, isValidObjectId } from 'mongoose'
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ImageUploadService } from './../../image-upload/image-upload.service';

import { AppError, AppErrorTypeEnum } from './../../common/app-error';

import { CreateProductDto } from './dto/create-product.dto';

import { ProductDocument } from './schemas/products.schema';
import { ProductEntity } from './schemas/products.schema';

import { OPQBuilder } from './../../common/misc/opq-builder';
import { FilteringOptions } from './interfaces/filtering-options.interface';
import { FiltredProducts } from './interfaces/filtred-products.interface';
import { PagesOutput } from './interfaces/pages-output.interface';

import { DeepPartial } from './../../common/types/deep-partial.type';
import { ConfigService } from '@nestjs/config';
import { PageCompilerService } from '../../common/page-compiler/page-compiler.service';

import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel('Product')
        private readonly model: Model<ProductDocument>,
        private readonly imagesService: ImageUploadService,
        private readonly configService: ConfigService,
        private readonly pageCompilerService: PageCompilerService
    ) { }

    async findAll() {
        return (await this.model.find().exec()) || []
    }

    async findById(id: string) {
        const doc = await this.model.findById(id)
        .exec()
        if (!doc) {
            throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
        }
        return doc
    }

    async findOne(query: Partial<Record<keyof ProductDocument, unknown>>) {
        return (await this.model.find(query as FilterQuery<ProductDocument>)
                .exec())
    }

    async findFiltred(opts: FilteringOptions): Promise<FiltredProducts> {
        const page: number = opts.page ? parseInt(opts.page) : 1
        const perPage = opts.perPage ? parseInt(opts.perPage) : undefined

        const totalDocuments = await this.model.countDocuments()
        const totalPages = +Math.ceil(totalDocuments / (perPage || 1))

        if (totalDocuments === 0) {
            return {
                products: [],
                totalPages: 0,
                page: 0
            }
        }

        if (page > totalPages) {
            throw new AppError(AppErrorTypeEnum.INVALID_RANGE)
        }

        const query = new OPQBuilder()
            .addToQuery("price", opts.minPrice, (v) => { return { $gte: parseInt(v) } })
            .addToQuery("price", opts.maxPrice, (v) => { return { $lte: parseInt(v) } })
            .addToQuery("rating", opts.rating)
            .addToQuery("category", opts.category)
            .build()

        const docs = await this.model.find(query, null, { skip: (page - 1) * (perPage || 0), limit: perPage })
            .exec()

        for (const doc of docs) {
            console.log(doc)
        }

        return {
            products: docs,
            totalPages: totalPages,
            page: page
        }
    }

    async getAllByPages(query: {perPage: string}) {
        const productsCount = await this.productsCount()
        const pages = Math.ceil(productsCount / parseInt(query.perPage))

        const ret: PagesOutput = {
            pages: [],
            totalPages: pages
        }
        for (let i = 1; i <= pages; i++) {
            const execRes = await this.findFiltred({page: String(i), perPage: query.perPage})
            ret.pages.push({page: i, products: execRes.products})
        }

        return ret
    }

    async productsCount() {
        return await this.model.countDocuments()
    }

    async create(newProduct: CreateProductDto) {
        try {
            return await this.model.create({
                ...newProduct
            })
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                throw new AppError(AppErrorTypeEnum.VALIDATION_ERROR, {
                    errorMessage: 'Cannot create product: invalid data submitted: ' + error.message,
                    userMessage: 'Cannot create product: invalid data submitted: ' + error.message
                })
            }
            throw error
        }
    }

    async remove(id: string) {
        try {
            const existed = await this.model.findById(id)
            if (!existed) {
                throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
            }

            //if (existed.images) {
            //    await this.imagesService.removeMany(
            //        existed.images.map(objId => objId.toString())
            //    )
            //}

            const deleted = await this.model.findByIdAndDelete(id)
            if (!deleted) {
                throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
            }
            return deleted
        } catch(e) {
            throw e
        }
    }

    async update(id: string, newData: DeepPartial<ProductEntity>) {
        const doc = await this.model.findByIdAndUpdate(id, newData, { new: true })
        if (!doc) {
            throw new AppError(AppErrorTypeEnum.DB_ENTITY_NOT_FOUND)
        }
        return doc
    }

    async compileProductHTML(id: string) {
        const data = await this.findById(id).then(p => {
            return {
                data: p.toJSON()
            }
        })

        const dir: string = this.configService.getOrThrow<string>('EJSTemplate_dir')
        const pageTemplateFilename: string = this.configService.getOrThrow<string>('EJSTemplates.productPage')

        const file = path.join(dir, pageTemplateFilename)
        const res = await this.pageCompilerService.compile(file, data)
        fs.writeFileSync("./asdf.html", res)
    }
}
