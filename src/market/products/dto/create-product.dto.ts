//import mongoose from "mongoose"

export interface CreateProductDto {
    title: string; // Required
    extendedTitle: string; // Required
    description: string; // Required

    image: {
        url: string;
        alt: string;
    };

    sliderImages: {
        url: string;
        alt: string;
    }[];

    availability: {
        indoor: boolean
        outdoor: boolean
    };

    dimensions: {
        width: number;
        height: number;
        depth: number;
    };

    details: {
        title: string;
        description: string;
    }[];

    caring?: {
        title: string;
        description: string;
    }[];

    materials: {
        title: string;
        options: {
            description: string;
            backgroundImageURL?: string;
        }[]
    }[];

    price?: number; // Optional, default: 0
    category: string; // Required
    rating?: number; // Optional, default: 5
}
