import { Router } from 'express';
import puppeteer from "puppeteer";
import * as fs from "node:fs";

import productRouter from './products.js';

const router = Router();

router.get("/pdf", async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let html = fs.readFileSync("template.html", "utf8");

    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
        format: "A4",
    });

    await browser.close();

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=example.pdf",
    });

    res.send(pdfBuffer);
});

router.use('/products', productRouter);


export default router;