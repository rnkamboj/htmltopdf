'use strict';

const express = require('express');
const cors = require("cors");
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2048mb' }));
app.use(express.urlencoded({ extended: false , limit: '2048mb' }));

app.use(express.static("public"));

app.get('/', async(req, res) => {
	
	let browser;
    try {
        const htmlContent = "<h3><center>Sample PDF Created</center></h3>";
        
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { timeout: 0 });
        
        const pdfBuffer = await page.pdf({ format: 'A4' });
		console.log('PDF TEST : '+ new Date()); 
		res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdfBuffer.length });
        res.send(pdfBuffer);
		
    } catch (e) {
        console.error('Error creating PDF:', e);
        res.json({ success: false, message: e.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
	
});

app.post('/create-pdf', async (req, res) => {
    let browser;
    try {
        const htmlContentBuffer = req.body.content;
        const mapInclude = req.body.map;
        const htmlContent = Buffer.from(htmlContentBuffer, 'base64').toString('utf8');
        
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.setContent(htmlContent, { timeout: 0 });
        
        if(mapInclude == 'Yes') {
            await page.evaluate(() => {
                return new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (window.allTilesLoaded) {
                            clearInterval(checkInterval);
							setTimeout(() => {
                                resolve();
                            }, 10000);
                        }
                    }, 5000); 
                });
            });
		}
        
        const pdfBuffer = await page.pdf({ format: 'A4' });
		
		console.log('PDF Created : '+ new Date());
		
        res.json({
            success: true,
            message: 'PDF Created Successfully',
            data: pdfBuffer.toString('base64')
        });

    } catch (e) {
        console.error('Error creating PDF:', e);
        res.json({ success: false, message: e.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});
 
app.listen(5000);

console.info(`Server listening on http://localhost:5000`);