//import mongoose from "mongoose"

export interface CreateProductDto {
    readonly title: string
    readonly description: string
    readonly price: number
    readonly category: string
    readonly rating?: number
    readonly imageURL: string
    readonly imageAlt: string
    readonly presentageURL: string
}
