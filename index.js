const express = require('express');
const { ObjectId } = require('mongodb');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const mongoose = require("mongoose");
const { json } = require('express');
const path = require("path");
const fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');
const { Telegraf } = require("telegraf");

// constants
const DB_PATH = path.resolve("db.json");

//telegram
const YOUR_TOKEN = "5981121317:AAELHtHDV9M-IZUKrjY6as8OKsWa3pC2HCc";
const bot = new TelegramBot(YOUR_TOKEN, {polling: true});

//Mongodb
const url = "mongodb+srv://thanhnguyen1:thanhnguyen1@dahtnsmarthealth.6rpbgmj.mongodb.net/test"
app.use(express.json())


mongoClient.connect(url, (err, db) =>{
    if (err) {
      console.log("Error while connecting mongo client")
    }else {
            
      bot.onText(/\/echo (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const resp = match[1]; 
        bot.sendMessage(chatId, resp);
      });

      bot.onText(/\/dangky/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = {userId: chatId}
        const myDb = db.db('Data')
        const collection = myDb.collection('User')

        collection.findOne(userId, (err,result)=>{
          if (result!=null) {
            bot.sendMessage(chatId, `Tài khoản đã đăng ký rồi`);
          } else {
            collection.insertOne(userId)
            bot.sendMessage(chatId, `Đã đăng ký thành công`);
          }
        })
      });

      bot.onText(/\/kiemtra/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = {userId: chatId}

        const myDb = db.db('Data')
        const collection = myDb.collection('main')

        collection.find({}).sort( { "_id": -1 } ).limit(5).toArray( function(err, result) {
          if (result!=null) {
            //bot.sendMessage(chatId, `${JSON.stringify(result)}`);
            bot.sendMessage(chatId, `5 kết quả đo gần nhất: `)
            for(var i in result){
              bot.sendMessage(chatId, `rate: ${JSON.stringify(result[i].rate)}, spo2: ${JSON.stringify(result[i].spo2)}`);
            }
            console.log("live")
          } else {
            console.log("die")
            bot.sendMessage(chatId, `Không có dữ liệu`);
          }
        })     
      });

      // routes
      app.post("/sendata", async (req, res) => {
        const myDb = db.db('Data')
        const collection = myDb.collection('main')
        const value = {
          spo2 : req.body.spo2,
          rate : req.body.rate,
          timestamp: new Date()
        }
        if (value.rate<60 || value.rate>100)
        {
          const mydb2 = db.db('Data')
          const collection2 = mydb2.collection('User')
          collection2.find({}).toArray( function(err, result) {

            for( var i in result)
            {
              if (value.rate>100){
                bot.sendMessage(JSON.stringify(result[i].userId), `Người bệnh đang có nhịp tim cao bất thường!` );
                bot.sendMessage(JSON.stringify(result[i].userId), `Hướng dẫn chăm sóc người bệnh: \n https://medlatec.vn/tin-tuc/huong-dan-cham-soc-benh-nhan-tang-huyet-ap-tai-nha-s63-n21601` );
              }
              if (value.rate<60){
                bot.sendMessage(JSON.stringify(result[i].userId), `Người bệnh đang có nhịp tim thấp bất thường!` );
                bot.sendMessage(JSON.stringify(result[i].userId), `Hướng dẫn chăm sóc người bệnh: \n https://blog.bluecare.vn/lap-ke-hoach-cham-soc-benh-nhan-huyet-ap-thap/` );
              }
            }
          })
        }
        if (value.spo2<96)
        {
          const mydb2 = db.db('Data')
          const collection2 = mydb2.collection('User')
          collection2.find({}).toArray( function(err, result) {

            for( var i in result)
            {
              bot.sendMessage(JSON.stringify(result[i].userId), `Người bệnh đang có vấn đề về hô hấp, cần theo dõi ngay!` );
              bot.sendMessage(JSON.stringify(result[i].userId), `Hướng dẫn chăm sóc người bệnh: \n https://chamsoctaman.com.vn/cham-soc-benh-nhan-kho-tho/#:~:text=Ch%C4%83m%20s%C3%B3c%20b%E1%BB%87nh%20nh%C3%A2n%20kh%C3%B3%20th%E1%BB%9F%20trong%20t%C6%B0%20th%E1%BA%BF%20ngh%E1%BB%89%20ng%C6%A1i%20tr%E1%BB%8B%20li%E1%BB%87u,-%E2%80%93%20Sau%20khi%20th%E1%BB%B1c&text=%E2%80%93%20Theo%20d%C3%B5i%2C%20%C4%91%E1%BA%B7c%20bi%E1%BB%87t%20l%C3%A0,ch%E1%BB%91ng%20lo%C3%A9t%20cho%20b%E1%BB%87nh%20nh%C3%A2n.` );
            }
          })
        }
        collection.insertOne(value, (err, result) =>{
          res.status(200).send(JSON.stringify(value))
        })
      });
      app.get("/getdata", async (req, res) => {
        const myDb = db.db('Data')
        const collection = myDb.collection('main')
        collection.find({},{$limit:5}).toArray(function(err, result) {
          if (result!=null) {
            console.log(result)
            res.status(200).send(JSON.stringify(result))
          } else {
            res.status(404).send()
            console.log("die")
          }
          })
      })
    }
  });


  const port = process.env.PORT || 8000
  app.listen(port,() => {
    console.log("Listening on port: ",port)
  })
  

