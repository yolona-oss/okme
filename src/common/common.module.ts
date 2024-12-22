import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PageCompilerModule } from './page-compiler/page-compiler.module';
import { AIModule } from './AI/ai.module';

@Module({
    imports: [DatabaseModule, PageCompilerModule, AIModule],
    exports: [],
})
export class CommonModule {}
