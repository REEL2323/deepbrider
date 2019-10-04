const puppeteer = require('puppeteer')
const fs = require('fs')

const COOKIES_PATH = './cookies.json'
const DEEP_BRID_URL = 'https://www.deepbrid.com/login'

!(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  await page.goto(DEEP_BRID_URL)
  await page.setDefaultTimeout(0)
  await page.waitFor('input[name="amember_login"]')
  await page.type('input[name="amember_login"]', '')
  await page.type('input[name="amember_pass"]', '')
  await page.click('input[name="remember_login"]')
  await page.waitForFunction(() => {
    const urlComp = window.location.href === 'https://www.deepbrid.com/downloader'
    const domComp = window.document.readyState === 'interactive' || window.document.readyState === 'complete'
    return urlComp && domComp
  })
  const saveCookie = await page.cookies()
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(saveCookie))
  console.log('get cookie')
  await browser.close()
})()
