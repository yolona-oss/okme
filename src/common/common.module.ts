import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PageCompilerModule } from './page-compiler/page-compiler.module';

@Module({
    imports: [DatabaseModule, PageCompilerModule],
    exports: [],
})
export class CommonModule {}
