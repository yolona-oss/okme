import { Injectable } from '@nestjs/common';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { ProductsService } from '../market/products/products.service';
import { SiteScrapper } from '../common/misc/site-scrapper';

import { JSDOM } from 'jsdom'
import { randomInt } from 'crypto';

import { retrier } from '../common/misc/utils';
import { AIService } from '../common/AI/ai.service';
import { InputData } from './interfaces/input-data.interface';
import { Spread } from '../common/types/spread.type';
import { sleep } from 'common/misc/time';

type PreparedInputData = InputData &
        {
            translatedTitle: string,
            extendedTitle: string,
        }

@Injectable()
export class LeberMebelScraperService extends SiteScrapper {

    constructor(
        private readonly productsService: ProductsService,
        private readonly imageService: ImageUploadService,
        private readonly aiService: AIService
    ) {
        super()
    }

    private async handleImages(images: string[], baseName: string, path: string, meta: any) {
        meta
        let i = 0
        let uploaded = []
        for (const imgUrl of images) {
            const name = this.transformStringToFilename(baseName, `_${i}_${randomInt(1, 999)}.jpg`)
            await this.downloadImage(imgUrl, `${path}/${name}`)
            //await new Promise((resolve, reject) =>
            //    exec(`convert ${dir}/${name} -resize 1700x740^ -gravity center -extent 1700x740 -background black -compose copy -flatten ${dir}/${name.replace('.jpg', '_resized.jpg')}`, (e, o, se) => {
            //        if (e || se) {
            //            reject(e)
            //        }
            //        resolve(o)
            //    })
            //)
            uploaded.push(
                (await this.imageService.uploadImages([
                    {
                        path: `${path}/${name}`,
                        filename: path
                    }
                ]))[0]
            )
            i++
        }
        return uploaded
    }

    private async prepareData(inputData: InputData[]): Promise<PreparedInputData[]> {
        let originalTitles = inputData.map((p) => p.title.replaceAll(",", ""))

        // TODO add retrier for this, if parse throws
        const answer = await this.aiService.ask(
            `Answer in Russian. Shorten each product name from the list as much as possible, but do not overlap and do not use abbreviations. This list is in csv format. Give your answer in JSON array format and in the same order and do not use markdown on output. The list: "${originalTitles.join(",")}"`
        )
        const shortenTitles = JSON.parse(answer)

        let i = 0
        let ret: any = []
        for (const product of inputData) {
            const translated = await retrier<string>(
                async () => await this.translate(product.title),
                { tries: 3, wait: 700, timeout: 3500 }
            )
            const fullTitle = originalTitles[i]
            const shortedTitle = shortenTitles[i]
            let tmp = {
                ...product,
                translatedTitle: translated.replace(/\n/g, ''),
                extendedTitle: fullTitle,
                title: shortedTitle,
                // @ts-ignore
                gallery: JSON.parse(product.gallery),
                // @ts-ignore
                json: JSON.parse(product.json_options),
            }
            i++
            ret.push(tmp)
        }

        return ret
    }

    private async scrapFromHTML(product: PreparedInputData) {
        const html = await fetch(product.url)
        const dom = new JSDOM(await html.text())

        const infoElems = dom.window.document.querySelectorAll(".t-store__tabs__content.t-descr.t-descr_xxs")

        let spec:any
        let description:any
        let contacts:any

        if (infoElems.length == 3) {
            spec = infoElems[0]?.innerHTML
            description = infoElems[1]?.innerHTML
            contacts = infoElems[2]?.innerHTML
        } else {
            spec = infoElems[1]?.innerHTML
            description = product.text
            contacts = infoElems[3]?.innerHTML
        }

        const matchOrZero = (str: string, regex: RegExp) => {
            // @ts-ignore
            return str.match(regex)?.length == 2 ? str.match(regex)[1] : "0"
        }

        const dimensions = {
            depth:  parseInt(matchOrZero(spec, /Глубина:\s*(\d+) мм/)),
            height: parseInt(matchOrZero(spec, /Высота:\s*(\d+) мм/)),
            width:  parseInt(matchOrZero(spec, /Ширина:\s*(\d+) мм/))
        }

        const extractDetails = () => {
            const details: any = [];

            const dom = new JSDOM(spec);
            const document = dom.window.document;

            const sections = document.querySelectorAll("strong");
            sections.forEach((section) => {
                const title = section.outerHTML; // Save the HTML tag of the title
                const description = [];

                let sibling = section.nextSibling;
                while (sibling) {
                    if (sibling.nodeType === 3) {
                        // @ts-ignore
                        description.push(sibling.textContent.trim());
                    } else if (
                        sibling.nodeType === 1 &&
                            sibling.nodeName.toLowerCase() === "br"
                    ) {
                        description.push("\n");
                    } else {
                        break;
                    }
                    sibling = sibling.nextSibling;
                }

                details.push({
                    title,
                    description: description.join('').replace(/\n+/g, '\n').trim()
                });
            });

            return details;
        }

        const cat_match = spec.match(/Тип изделия:\s([^<]+)<br>/);
        const categories = cat_match ? cat_match[1].split(' / ') : [product.title];

        return {
            dimensions,
            description,
            contacts,
            categories,
            details: extractDetails()
        }
    }

    // BAD. reorganize
    private async handleSignleEntry(product: PreparedInputData) {
        const uploaded = await this.handleImages(
            product.gallery.map(i => i.img),
            product.translatedTitle,
            "images/",
            {}
        )

        const htmlScrap = await this.scrapFromHTML(product)

        const materials = product.json_options.map((o: any) => {
            return {
                title: o.title,
                options: o.values?.map((o: any) => {return { description: o}})
            }
        })

        const chooseBestDescription = (descriptions: {text: string, weight: number}[]) => {
            return descriptions[0].text
        }

        const chooseAvailability = (title: string) => {
            title
            return {
                indoor: true,
                outdoor: false
            }
        }

        const parseCategory = (scrapedCategories: string[]) => {
            return scrapedCategories[0]
        }

        const created = await this.productsService.create({
            title: product.title,
            extendedTitle: product.extendedTitle,
            description: chooseBestDescription([
                {
                    weight: 0,
                    text: product.text,
                },
                {
                    weight: 0,
                    text: htmlScrap.details
                },
                {
                    weight: 0,
                    text: product.descr
                }
            ]),

            image: uploaded[0],
            sliderImages: uploaded.slice(1),

            availability: chooseAvailability(product.extendedTitle),

            dimensions: htmlScrap.dimensions,

            details: htmlScrap.details,

            caring: [],

            materials: materials,

            price: parseInt(product.price ?? "0"),
            category: parseCategory(htmlScrap.categories)
        })

        return created
    }

    async scrap(_dataInput: InputData[]) {
        let ret: any = []

        const data = await this.prepareData(_dataInput)

        let current = 0
        const failed = []
        for (const product of data) {
            console.log(`[${current}/${data.length}]`, product.title)
            try { 
                ret.push(
                    await this.handleSignleEntry(product)
                )
            } catch(e) {
                failed.push({
                    entry: product,
                    error: e
                })
            } finally {
                current++
            }
        }

        return ret
    }

}
