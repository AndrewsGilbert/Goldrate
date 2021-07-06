const express = require('express')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const app = express()
// const nodemailer = require('nodemailer')
const cron = require('node-cron')

cron.schedule('5 9-15 * * *', function () {
  const calender = new Date()
  const hour = calender.getHours()
  const date = calender.toDateString()
  const time = calender.toTimeString()

  const content = fs.readFileSync('gold.json', 'utf8')
  const contentJson = JSON.parse(content)
  const web = contentJson.web
  const goldObject = contentJson.goldRate

  for (let i = 0; i < web.length; i++) {
    const id = web[i].id
    const url = web[i].url
    const selector = web[i].selector
    const cron = web[i].cron

    if (cron.includes(hour)) {
      const webId = id
      request(url, function (err, resp, html) {
        if (!err && resp.statusCode === 200) {
          const $ = cheerio.load(html)
          const dataPath = $(selector)
          const data = dataPath.html()
          const goldRate = Number(data.replace(/₹|,/g, '')) / 10
          const detail = {}
          detail.Rate = goldRate
          detail.DAte = date
          detail.Time = time
          detail.WebId = webId
          const index = goldObject.length

          goldObject[index] = detail

          fs.writeFileSync('gold.json', JSON.stringify(contentJson, null, 2), 'utf8')
        }
      })
    }
  }
})

app.listen(8586, function () {
  console.log('Node server is running 8586..')
})
