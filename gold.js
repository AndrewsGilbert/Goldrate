const express = require('express')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const url = 'https://www.goldpricesindia.com'
const app = express()
const nodemailer = require('nodemailer')
const cron = require('node-cron')

const sender = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'andrewsgilbert95@gmail.com',
    pass: 'Waycreater@1'
  }
})

const calender = new Date()
const hour = calender.getHours()

cron.schedule('30 9,17 * * *', function(){

  request(url, function (err, resp, html) {
    if (!err && resp.statusCode === 200) {
      const $ = cheerio.load(html)
      const dataPath = $('.rate')
      const data = dataPath.text()
      const goldRate = Number(data.replace(/,/g, '')) / 10

      const content = fs.readFileSync('gold.txt', 'utf8')
      const goldObject = JSON.parse(content)
      const keys = Object.keys(goldObject)
      const keysLength = keys.length
      let nextKey = ''

      if (hour === 10) {
        nextKey = Number(keys[keysLength - 1]) + 1
        goldObject[nextKey] = goldRate
        if (keysLength === 2) {
          delete goldObject[nextKey - 2]
        }
      } else if (hour === 17) {
        nextKey = Number(keys[keysLength - 1])
        goldObject[nextKey] = goldRate
      }

      fs.writeFileSync('gold.txt', JSON.stringify(goldObject, null, 2), 'utf8')

      const oldRate = goldObject[nextKey - 1]
      const lessRate = Math.min(oldRate, goldRate)
      let result = ''

      if (lessRate === goldRate) {
        const difference = oldRate - goldRate
        result = 'Today gold rate get reduced by  ' + difference + 'rs/gm' + '\r\n' + 'You can buy gold !'
      } else if(lessRate === oldRate ) {
        const difference = goldRate - oldRate
        result = 'Today gold rate get increased by  ' + difference + 'rs/gm' + '\r\n' + 'You can sell gold !'
      }

      const composeMail = {
        from: 'andrewsgilbert95@gmail.com',
        to: 'andrewsgilbert95@gmail.com',
        subject: 'Gold rate update',
        text: result
      }
      sender.sendMail(composeMail, function (err, info) {
        if (err) {
          console.log('error')
        } else {
          console.log('mail sent')
        }
      })
    }
  })
})  


 app.listen(8587, function () {
  console.log('Node server is running..')
}) 
