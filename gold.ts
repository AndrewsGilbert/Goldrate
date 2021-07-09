
import express from 'express'
import fs from 'fs'
import request from 'request'
import cheerio, { Cheerio } from 'cheerio'
const app = express()
import cron from 'node-cron'
import bodyParser from 'body-parser'
import path from 'path'

app.use(bodyParser.urlencoded({
  extended: true
}))

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

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/home.HTML'))
})

app.post('/data', function (req, res) {
  
  const content:string = fs.readFileSync('gold.json', 'utf8')
  const contentJson:content = JSON.parse(content)
  const web:Array<web> = contentJson.web
  const goldObject: Array<gold> = contentJson.goldRate
  
  const id: number = Number(req.body.webId)
   let webName: string = ''

  for (let i: number = 0; i < web.length; i++) {

    const webId:number = web[i].id
    if (id !== webId ) { continue }
    webName = web[i].name
  }
  
  res.write('Prices from ' + webName + '\r\n')

  for (let j: number = 0; j < goldObject.length; j++){

    const webId: number = goldObject[j].WebId
    if (webId !== id) { continue }
    const gold:gold = goldObject[j]
    res.write('\r\n' + 'Gold rate per Gram is: ' + gold.Rate +  ' Rs , Date: ' + gold.DAte + ', at time of ' + gold.Time + '\r\n' )
  }
  
  res.end()
})

app.listen(8586, function () {
  console.log('Node server is running 8586..')
})
