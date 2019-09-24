const puppeteer = require("puppeteer")
const url = 'https://77hs.net/rj241176-2.html'

const sleep = async (delay) => {
  return new Promise(resolve => setTimeout(resolve, delay))
}

!(async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const response = await page.goto(url)
    await sleep(5000)
    await page.screenshot({path: 'example.png'})
    // const html = await page.evaluate(() => {
    //   document.querySelector(".mycss-td").querySelector("a").href
    // })

    await browser.close()
  }
)()
