import { RouterModule } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageUploadModule } from './../../image-upload/image-upload.module';
import { ProductsController } from './products.controller';
import { ProductSchema } from './schemas/products.schema';
import { ProductsService } from './products.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Product', schema: ProductSchema }
        ]),
        RouterModule.register([
            {
                path: 'products',
                module: ProductsModule,
            }
        ]),
        ImageUploadModule,
    ],
    providers: [ProductsService],
    controllers: [ProductsController],
    exports: [ProductsService]
})
export class ProductsModule {}
