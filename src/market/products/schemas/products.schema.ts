import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ProductDocument = ProductEntity & Document;

@Schema({
    toJSON: {
        virtuals: true,
    },
})
export class ProductEntity {
    @Prop({type: String, required: true})
    title: string;

    @Prop({type: String, required: true})
    extendedTitle: string

    @Prop({type: String, required: true})
    description: string;

    @Prop({type: {url: String, alt: String}, required: true})
    image: {
        url: string,
        alt: string
    }

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

    @Prop({type: [{title: String, options: [{description: String, backgroundImageURL: String}]}], required: true})
    materials: {
        title: string
        options: {
            description: string
            backgroundImageURL?: string
        }[]
    }[]

    @Prop({type: {indoor: Boolean, outdoor: Boolean}, required: true})
    availability: {
        indoor: boolean
        outdoor: boolean
    }

    @Prop({type: Number, default: 0})
    price?: number;

    @Prop({type: String, required: true})
    category: string;

    @Prop({type: Number, default: 5})
    rating?: number;
}

const ProductSchema = SchemaFactory.createForClass(ProductEntity);

export { ProductSchema }
