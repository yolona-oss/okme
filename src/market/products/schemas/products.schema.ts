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
    extendedTitle: string

    @Prop({type: String, required: true})
    description: string;

    @Prop({type: {url: String, alt: String}, required: true})
    image: string;

    @Prop({type: [{ url: String, alt: String }], required: true })
    sliderImages: {
        url: string
        alt: string
    }[]

    @Prop({type: {width: Number, height: Number, depth: Number}, required: true})
    dimensions: {
        width: number
        height: number
        depth: number
    }

    @Prop({type: [{title: String, description: String}], required: true})
    details: {
        title: string
        description: string
    }[]

    @Prop({type: [{title: String, description: String}], required: false})
    caring: {
        title: string
        description: string
    }[]

    @Prop({type: [{title: String, description: String}], required: true})
    materials: {
        title: string
        description: string
        backgroundImageURL?: string
    }[][]

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
