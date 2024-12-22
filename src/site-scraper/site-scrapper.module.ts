import { Module } from "@nestjs/common";
import { LeberMebelScraperService } from "./site-scrapper.service";

import { ProductsModule } from "../market/products/products.module";
import { ImageUploadModule } from "../image-upload/image-upload.module";
import { AIModule } from "../common/AI/ai.module";
import { SiteScrapperController } from "./site-scrapper.controller";

@Module({
    imports: [
        ProductsModule,
        ImageUploadModule,
        AIModule
    ],
    providers: [LeberMebelScraperService],
    controllers: [SiteScrapperController],
    exports: [LeberMebelScraperService]
})
export class LeberMebelScrapperModule { }
