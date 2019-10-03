const puppeteer = require('puppeteer')
const fs = require('fs')
const open = require('open')

const COOKIES_PATH = './cookies.json'
const DOWNLOAD_PATH = './'
const DEEPBRID_URL = 'https://www.deepbrid.com/downloader'
const DEEPBRID_API =
  'https://www.deepbrid.com/backend-dl/index.php?page=api&action=generateLink'

const sevenUrl = process.argv[2]
const uploadSite = 'RapidGator'

!(async () => {
  const browser = await puppeteer.launch({
    width: 100,
    height: 100,
    headless: false
  })
  const page = await browser.newPage()

  await page.goto(sevenUrl)
  await page.waitFor('.mycss-td')
  const sevenLinks = await page.evaluate(() => {
    let links = []
    let node = document.querySelectorAll('.mycss-td')
    node.forEach(element => {
      if (element.innerText.includes('Uploaded')) {
        links.push(element.querySelector('a').href)
      }
    })
    return links
  })

  const getSourceLinks = async function() {
    let links = []
    for (let i in sevenLinks) {
      let response = await page.goto(sevenLinks[i])
      for (let request of response.request().redirectChain()) {
        links.push(request.response().headers().location)
      }
    }
    return links
  }

  const sourceLinks = await getSourceLinks()
  console.log(sourceLinks)

  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'))
  for (let cookie of cookies) {
    await page.setCookie(cookie)
  }

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_PATH
  })

  await page.goto(DEEPBRID_URL)
  const linksJson = await page.evaluate(
    async (sourceLinks, DEEPBRID_API) => {
      console.log(sourceLinks)
      console.log(DEEPBRID_API)
      const dataJson = []
      for (let link of sourceLinks) {
        await fetch(DEEPBRID_API, {
          method: 'POST',
          headers: new Headers({
            'Content-type': 'application/x-www-form-urlencoded'
          }),
          body: `link=${link}`
        })
          .then(res => {
            if (res.ok) {
              return res.json()
            } else {
              throw new Error()
            }
          })
          .then(json => {
            console.log(json)
            dataJson.push(json)
          })
          .catch(err => dataJson.push(err))
      }
      return dataJson
    },
    sourceLinks,
    DEEPBRID_API
  )
  console.log(linksJson)
  fs.appendFileSync('./history.json', JSON.stringify(linksJson))
  for (let linkJson of linksJson) {
    open(linkJson.link, err => {
      if (err) throw err
      console.log('The user closed the browser')
    })
  }
  await browser.close()
})()
