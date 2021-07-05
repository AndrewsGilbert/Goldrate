const express = require('express')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const app = express()
// const nodemailer = require('nodemailer')
const cron = require('node-cron')

cron.schedule('* 9-15 * * *', function () {
  const calender = new Date()
  const hour = calender.getHours()
  const date = calender.toDateString()
  const time = calender.toTimeString()

  const content = fs.readFileSync('gold.json', 'utf8')
  const contentJson = JSON.parse(content)
  const web = contentJson.web
  const goldObject = contentJson.goldRate
  let webId = ''
  let goldRate = ''
  const detail = {}

  for (let i = 0; i < web.length; i++) {
    const id = web[i].id
    const url = web[i].url

    if (id === 1 && (hour === 9 || hour === 12 || hour === 15)) {
      webId = id
      request(url, function (err, resp, html) {
        if (!err && resp.statusCode === 200) {
          const $ = cheerio.load(html)
          const dataPath = $('.rate')
          const data = dataPath.text()
          goldRate = Number(data.replace(/,/g, '')) / 10
          process()
        }
      })
    }

    if (id === 2 && (hour === 10 || hour === 14)) {
      webId = id
      request(url, function (err, resp, html) {
        if (!err && resp.statusCode === 200) {
          const $ = cheerio.load(html)
          const dataPath = $('._cptblwrp table tbody tr:nth-child(3) td._lft')
          const data = dataPath.html()
          goldRate = Number(data.replace(/₹|,/g, '')) / 10
          process()
        }
      })
    }

    if (id === 3 && hour === 13) {
      webId = id
      request(url, function (err, resp, html) {
        if (!err && resp.statusCode === 200) {
          const $ = cheerio.load(html)
          const dataPath = $('.commodityInfoContainer > ul > li.commodityPriceCol > span.commodityPrice')
          const data = dataPath.html()
          goldRate = Number(data) / 10
          process()
        }
      })
    }

    function process () {
      detail.Rate = goldRate
      detail.DAte = date
      detail.Time = time
      detail.WebId = webId
      const index = goldObject.length

      goldObject[index] = detail

      fs.writeFileSync('gold.json', JSON.stringify(contentJson, null, 2), 'utf8')
    }
  }
})

app.listen(8586, function () {
  console.log('Node server is running 8586..')
})
