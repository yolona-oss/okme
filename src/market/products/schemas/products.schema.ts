import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductDocument = ProductEntity & Document;

@Schema({
    toJSON: {
        virtuals: true,
    },
})
export class ProductEntity {
    //id?: string;

    @Prop({type: String, required: true})
    title: string;

    @Prop({type: String, required: true})
    description: string;

    @Prop({type: {url: String, alt: String}, required: true})
    image: string;

    @Prop({type: Number, default: 0})
    price?: number;

    @Prop({type: String, required: true})
    category: string;

    @Prop({type: Number, default: 5})
    rating?: number;

    @Prop({type: String, required: true})
    presentageURL: string;
}

const ProductSchema = SchemaFactory.createForClass(ProductEntity);

export { ProductSchema }
