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

@Controller()
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
    ) {}

    @Get('/compile-page/:id')
    async compilePage(@Param('id', ParseObjectIdPipe) id: string, @Res() response: Response) {
        const execRes = await this.productsService.compileProductHTML(id)
        return response.status(200).json(execRes)
    }

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

    @Get('/:id')
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
}
