const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const PORT = 3001 || process.env.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

process.on('uncaughtException', function (err) {
    console.log("Handled Error...");
    console.log(err);
});



let count = 0;
// get custom id from front end
app.get('/api/:id', async (req, res) => {
    // get the id from the request
    const id = req.params.id;
    console.log(id);
    count++;
    // get the data from the database
    console.log("API was called: ", count);
        puppeteer.launch({
            headless: false
        }).then(async browser => {
            const page = await browser.newPage();
            await page.goto(`https://www.therange.co.uk/search?q=${id}`, {
                waitUntil: 'load'
            });
            await page.click('.cookies-accept', {
                delay: 300
            });

            try {
                const data = await page.evaluate(() => {
                    let data = [];
                    
                    let title = document.querySelector('#product-dyn-title').innerText;
                    let images = document.querySelectorAll('.rsImg');
                    // If there is no .multiple_assortment_info class, then it is a single product and dont have to read it           
                    let assortment = document.querySelector('.multiple_assortment_info');
                    let assortmentText = '';
                    // if pupeteer doesn't find the item, it will throw an error
                    if (assortment){
                        assortmentText = assortment.innerText;
                    } else {
                        assortmentText = null;
                    }

                    let price = document.querySelector('#min_price').innerText;

                    let itemDescription = document.getElementById('product-dyn-desc').innerText;
                    // array of spans
                    let itemSpecifications = document.querySelectorAll('[data-state="selectable"] span');
                    // empty array to push the specifications into
                    let specification = [];
                    // loop through the array of spans and push the text into the empty array
                    for (let i = 0; i < itemSpecifications.length; i++) {
                        specification.push(itemSpecifications[i].innerText);
                    }
                    
                    // set images to an array
                    images.forEach(image => {
                        data.push({
                            image: image.src
                        });
                    });

                    // set the data to an object
                    if (title == null || title == undefined || title == "") {
                        res.status(404).json({
                            message: 'No data found'
                        });
                    }
                    let status = 200;
                    return {
                        title, itemDescription, specification, assortmentText, price ,images: data, status
                    };
                });

                res.status(200).json({
                    data
                })
            } catch (e) {
                console.log(e);
                res.status(404).json({
                    message: 'No data found, please check the SKU number',
                    status: 404,
                    error: e
                });
            }

            page.on('pageerror', function (err) {
                page.browser().close();
            });

            await page.browser().close();
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});