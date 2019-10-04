'use strict'
const puppeteer = require('puppeteer')
const fs = require('fs')
const open = require('open')

const cookiePath = './cookies.json'
const downloadPath = './'
const deepbridUrl = 'https://www.deepbrid.com/downloader'
const deepbridApiUrl =
  'https://www.deepbrid.com/backend-dl/index.php?page=api&action=generateLink'
const downloadUrl = process.argv[2]

!(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'))
  for (let cookie of cookies) {
    await page.setCookie(cookie)
  }

  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  })

  await page.goto(deepbridUrl)
  const json = await page.evaluate(
    (downloadUrl, deepbridApiUrl) => {
      return fetch(deepbridApiUrl, {
        method: 'POST',
        headers: new Headers({
          'Content-type': 'application/x-www-form-urlencoded'
        }),
        body: `link=${downloadUrl}`
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          } else {
            throw new Error()
          }
        })
        .then(json => json)
        .catch(err => err)
    },
    downloadUrl,
    deepbridApiUrl
  )
  if (json.error === 0) {
    open(json.link, err => {
      if (err) throw err
      console.log('The user closed the browser')
    })
    await console.log(`Original_Link: ${json.original_link}`)
    await console.log(`Hoster: ${json.hoster}`)
    await console.log(`Filename: ${json.filename}`)
    await console.log(`Size: ${json.size}`)
    await console.log(`Link: ${json.link}`)
  } else {
    await console.log(json)
  }
  browser.close()
})()
