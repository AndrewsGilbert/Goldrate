
import express from 'express'
import fs from 'fs'
import request from 'request'
import cheerio, { Cheerio } from 'cheerio'
const app = express()
import cron from 'node-cron'

type web = {
    id:number
    name:string
    url:string
    selector:string
    cron:Array<number>
}

type gold = {
    Rate:number
    DAte:string
    Time:string
    WebId:number
}

type content = {
    web:Array<web>
    goldRate:Array<gold>
}
cron.schedule('5 9-15 * * *', function () {
  const calender:Date = new Date()
  const hour:number = calender.getHours()
  const date:string = calender.toDateString()
  const time:string = calender.toTimeString()

  const content:string = fs.readFileSync('gold.json', 'utf8')
  const contentJson:content = JSON.parse(content)
  const web:Array<web> = contentJson.web
  const goldObject:Array<gold> = contentJson.goldRate

    for (let i:number = 0; i < web.length; i++) {
    const id:number = web[i].id
    const url:string = web[i].url
    const selector:string = web[i].selector
    const cron:Array<number> = web[i].cron

    if (cron.includes(hour)) {
      const webId:number = id
      request(url, function (err ,resp, html) {
        if (!err && resp.statusCode === 200) {
          const $ = cheerio.load(html)
          const dataPath = $(selector)
          const data: any = dataPath.html()
          
          const goldRate: number = Number(data.replace(/₹|,/g, '')) / 10
          let detail = <gold>{}
          detail.Rate = goldRate
          detail.DAte = date
          detail.Time = time
          detail.WebId = webId
          const index: number = goldObject.length

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
