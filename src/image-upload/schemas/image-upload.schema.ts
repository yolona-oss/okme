import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImagesDocument = ImagesEntity & Document;

@Schema({
    toJSON: {
        virtuals: true,
    }
})
export class ImagesEntity {
    @Prop({type: String, required: true})
    url: string;

    @Prop({type: String, required: true})
    alt: string;
}

const ImagesSchema = SchemaFactory.createForClass(ImagesEntity);

export { ImagesSchema }
