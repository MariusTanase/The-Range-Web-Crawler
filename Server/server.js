const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const getProductData = async (id) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(`https://www.therange.co.uk/search?q=${id}`, { waitUntil: 'load' });

    const data = await page.evaluate(() => {
      const title = document.querySelector('#product-dyn-title')?.innerText || null;
      const images = Array.from(document.querySelectorAll('.rsImg')).map((image) => ({
        image: image.src,
      }));
      const assortmentText = document.querySelector('.multiple_assortment_info')?.innerText || null;
      const itemDescription = document.getElementById('product-dyn-desc')?.innerText || null;
      const itemSpecifications = Array.from(document.querySelectorAll('[data-state="selectable"] span'));
      const specification = itemSpecifications.map((spec) => spec.innerText);

      if (!title) {
        return { status: 404, message: 'No data found, please check the SKU number' };
      }

      return {
        status: 200,
        title,
        itemDescription,
        specification,
        assortmentText,
        images,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.log(`Error: ${error}`);
    return { success: false, error: 'No data found, please check the SKU number' };
  } finally {
    await browser.close();
  }
};

app.get('/api/:id', async (req, res) => {
  const id = req.params.id;
  const result = await getProductData(id);

  if (result.success) {
    res.status(result.data.status).json({ data: result.data });
  } else {
    console.log(result);
    res.status(404).json({
        message: result.error });
    }
});
    
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });