import { Router, Request, Response, json } from "express";
import { Readable } from "stream";
import readline from "readline"
import { client } from "./database/client";

import multer from "multer";

const multerConfig = multer();

const router = Router();

interface Product {
    code_bar: string;
    description: string;
    price: number;
    quantity: number;
}

router.post("/products", multerConfig.single("file"), async (request: Request, response: Response) => {

    const { file } = request;
    const products: Product[] = [];

    if (file !== undefined) {
        const { buffer } = file;
        const readableFile = new Readable();
    
        readableFile.push(buffer)
        readableFile.push(null);

        const productsLine = readline.createInterface({
            input: readableFile
        });
          
        for await(let line of productsLine) {
            const productLineSplit = line.split(",");
            products.push({
                code_bar: productLineSplit[0],
                description: productLineSplit[1],
                price: Number(productLineSplit[2]),
                quantity: Number(productLineSplit[3]),
            })
        }
    }

    for await(let { code_bar, description, price, quantity } of products) {
        await client.products.create({
            data: {
                code_bar,
                description,
                price,
                quantity,
            }
        })
    }

    return response.json(products);

});

export { router };