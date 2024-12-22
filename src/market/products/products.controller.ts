import {
    Put,
    Delete,
    Param,
    Query,
    Body,
    Get,
    Res,
    Controller,
    Post,
} from '@nestjs/common';
import { ParseObjectIdPipe } from './../../common/pipes/parse-object-id.pipe';
import { Response } from 'express'

import { ProductsService } from './products.service';

import { CreateProductDto } from './dto/create-product.dto';
import { ProductEntity } from './schemas/products.schema';
import { FiltredProducts } from './interfaces/filtred-products.interface';
import { PagesOutput } from './interfaces/pages-output.interface';

import { ImageUploadService } from 'image-upload/image-upload.service';

@Controller()
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly imageuploadService: ImageUploadService
    ) {}

    @Get("/tmp2")
    async compileAllProducts() {
        const products = await this.productsService.findAll()
        console.log(products.length)
        for (const product of products) {
            let edited = {
                ...product.toJSON(),
                image: {
                    ...product.image,
                    url: "http://localhost:4000/" + product.image.url
                },
                sliderImages: product.sliderImages.map((i) => {
                    return {
                        ...i,
                        url: "http://localhost:4000/" + i.url
                    }
                }),
                materials: product.materials.map((m) => {
                    return {
                        ...m,
                        options: m.options.map((o) => {
                            return {
                                ...o,
                                backgroundImageURL: o.backgroundImageURL ? "http://localhost:4000/" + o.backgroundImageURL : null
                            }
                        })
                    }
                })
            }

            //const data = await this.findById(id).then(p => {
            //    return {
            //        data: p.toJSON()
            //    }
            //})
            // @ts-ignore
            await this.productsService.compileProductHTML(edited)
        }
    }

    //@Get('/compile-product/:id')
    //async compilePage(@Param('id', ParseObjectIdPipe) id: string, @Res() response: Response) {
    //    const execRes = await this.productsService.compileProductHTML(id)
    //    return response.status(200).json(execRes)
    //}

    @Get('/')
    async findSome(@Query() query: any, @Res() response: Response) {
        const execRes = await this.productsService.findFiltred(query)
        return response.status(200).json(execRes)
    }

    @Get('/get-all-by-pages')
    async getAllByPages(@Query() query: {perPage: string}, @Res() response: Response) {
        const ret = await this.productsService.getAllByPages(query)
        return response.status(200).json(ret)
    }

    @Get('/count')
    async productsCount(@Res() response: Response) {
        const count = await this.productsService.productsCount()
        response.status(200).json(count)
    }

    @Post('/create')
    async create(@Body() data: CreateProductDto, @Res() response: Response) {
        const execRes = await this.productsService.create(data)
        response.status(200).json(execRes)
    }

    @Get('/by-id/:id')
    async productById(@Param('id', ParseObjectIdPipe) id: string, @Res() response: Response) {
        const doc = await this.productsService.findById(id)
        response.status(200).send(doc)
    }

    @Delete('/:id/delete')
    async removeProductById(@Param('id', ParseObjectIdPipe) id: string, @Res() response: Response) {
        const deleted = await this.productsService.remove(id)
        response.status(200).json(deleted)
    }

    @Put('/:id/update')
    async updateProductById(
        @Param('id', ParseObjectIdPipe) id: string,
        @Body() newData: Partial<ProductEntity>,
        @Res() response: Response
    ) {
        const execRes = await this.productsService.update(id, newData)
        response.status(200).json(execRes)
    }

    @Get('/categories')
    async getCategories(@Res() response: Response) {
        const categories = await this.productsService.getCategories()
        response.status(200).json(categories)
    }
}
