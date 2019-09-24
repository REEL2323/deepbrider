const puppeteer = require("puppeteer")
const url = 'https://www.dlsite.com/maniax/work/=/product_id/RJ262759.html'

!(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const response = await page.goto(url)

    const html = await page.evaluate(() => {
      const table = document.querySelector('#work_outline')
      const ths = table.querySelectorAll('th')
      const tds = table.querySelectorAll('td')
      let obj = Object.create(null)
      for (let i = 0, l = ths.length; i < l; ++i) {
        if (tds.hasOwnProperty(i)) {
          obj[ths[i].innerText] = tds[i].innerText
        }
      }
      return obj
    })
    console.log(JSON.stringify(html))

    await browser.close()
  }
)()
