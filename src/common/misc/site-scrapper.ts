import * as fs from 'fs'
import { exec } from 'child_process'

export abstract class SiteScrapper {

    async downloadImage(source: string, to: string) {
        const res = await fetch(source)
        const data = await res.arrayBuffer()
        fs.writeFileSync(to, Buffer.from(data))
    }

    transformStringToFilename(str: string, append?: string) {
        return str
            .trim()
            .replaceAll(' ', '_')
            .replaceAll('\'', '_')
            .replaceAll('\/', '_')
            .replaceAll('(', '_')
            .replaceAll(')', '_')
            .replaceAll('"', '_')
            .toLowerCase() + (append ? append : '')
    }

    /***
    * 
    */
    async translate(str: string): Promise<string> {
        return await new Promise((resolve, reject) =>
            exec(`trans -no-auto -b -e google -from ru -to en "${str}"`, (e, o, se) => {
                if (e || se) {
                    reject(e)
                }
                resolve(o)
            })
        )
    }

    abstract scrap(inputData: any): Promise<any>

}
