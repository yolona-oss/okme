import { Module } from '@nestjs/common';

import { APP_GUARD, RouterModule } from '@nestjs/core';

import AppConfig from './common/config/configuration'
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

import { MarketModule } from './market/market.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { ImageUploadModule } from './image-upload/image-upload.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
    imports: [
        CommonModule,
        MarketModule,
        ImageUploadModule,

        ConfigModule.forRoot({
            load: [AppConfig],
            isGlobal: true,
            cache: true
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', '..', 'images'),
            serveRoot: '/images'
        }),
        //ThrottlerModule.forRoot([{
        //    ttl: 15 * 60 * 1000,
        //    limit: 100
        //}]),
    ],
    providers: [
        //{
        //    provide: APP_GUARD,
        //    useClass: ThrottlerGuard
        //},
    ],
})
export class AppModule { }
