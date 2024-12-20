import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PageCompilerService } from './page-compiler.service';

@Module({
    imports: [
        ConfigModule,
    ],
    providers: [PageCompilerService],
    controllers: [],
    exports: [PageCompilerService]
})
export class PageCompilerModule {}
