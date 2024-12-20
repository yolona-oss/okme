import { Document } from "mongoose";
import { ProductDocument } from "./../schemas/products.schema";


export interface PagesOutput {
    pages: {
        page: number
        products: Document<unknown, any, ProductDocument>[],
    }[]
    totalPages: number
}
