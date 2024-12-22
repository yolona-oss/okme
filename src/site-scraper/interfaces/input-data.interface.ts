export interface InputData {
    title: string
    text: string // may empty
    price: string | null
    descr: string // may empty
    gallery: {
        img: string
    }[]
    json_options: {
        title: string
        params: any[]
        values: string[]
    }[]
    url: string
}[]
