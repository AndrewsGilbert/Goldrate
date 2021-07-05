const express = require('express')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const app = express()
const nodemailer = require('nodemailer')
const cron = require('node-cron')

const sender = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'andrewsgilbert95@gmail.com',
    pass: ''
  }
})



cron.schedule('35,36,37 9,16 * * *', function () {

    const calender = new Date()
    const hour = calender.getHours()
    const min = calender.getMinutes()
    const date = calender.getDate()
    const month = calender.getMonth()
    const year = calender.getFullYear()

    const urlContent =  fs.readFileSync('web.json', 'utf8')
    const urlObject = JSON.parse(urlContent)
    const urlWeb = Object.keys(urlObject)
    const urlCount = urlWeb.length
    var detail = {}
    var childId = {}
    var goldRate =''
    var webId =''

    for ( web in urlObject ) {

        if( web === 'goldpricesindia' && min === 35) {

            const url = urlObject[web]
            webId = web

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
        if( web === 'gadgets' && min === 36) {

            const url = urlObject[web]
            webId = web

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
        if( web === 'economictimes' && min === 37) {

            const url = urlObject[web]
            webId = web

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
        function process(){

            detail["Rate"] = goldRate
            detail["Date"] = date
            detail["Time"] = hour
            detail["Min"] = min
            detail["Month"] = month
            detail["year"] = year

            childId[webId] = detail

            const GoldContent = fs.readFileSync('gold.json', 'utf8')
            const goldObject = JSON.parse(GoldContent)
            const keys = Object.keys(goldObject)
            const keysLength = keys.length
            const index = urlWeb.indexOf(webId)
            var nextKey = ''
                    
            if ( index === 0 && hour == 9 ) {
                nextKey = keysLength + 1
                goldObject[nextKey] = childId
            } else {
                nextKey = keysLength
                goldObject[nextKey][webId] = detail
            }   
            fs.writeFileSync('gold.json', JSON.stringify(goldObject, null, 2), 'utf8')
        }
    }    
})

app.listen(8586, function () {
  console.log('Node server is running 8586..')
})
