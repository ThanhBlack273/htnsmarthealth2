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
const YOUR_TOKEN = "5981121317:AAG4Kgq5NtGxX9n7UbCFOnXgZFJrSnT1K2E";
//const bot = new Telegraf(YOUR_TOKEN);
const bot = new TelegramBot(YOUR_TOKEN, {polling: true});


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
            bot.sendMessage(chatId, `Tài khoản đã đăng ký`);
          } else {
            collection.insertOne(userId)
            bot.sendMessage(chatId, `Đã đăng ký xong xong`);
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

        // collection.find({},{$limit:5}).toArray( function(err, result) {
        //   if (result!=null) {
        //     bot.sendMessage(chatId, `${JSON.stringify(result)}`);
        //     console.log("live")
        //   } else {
        //     console.log("die")
        //     bot.sendMessage(chatId, `Không có dữ liệu`);
        //   }
        // })
        
        
      });

      // bot.on('message', async (msg,match) => {
      //   const chatId = msg.chat.id;
      //   const resp = match[0]; 
        
      //   bot.sendMessage(chatId, resp);
      // });

      // bot.start((ctx) => ctx.reply("Welcome"));
      // bot.help((ctx) => ctx.reply("Send me a sticker"));
      // bot.on("sticker", (ctx) => ctx.reply("🐶"));
      // bot.on("message", async (ctx) => {
      //     //console.log(ctx.update.message.message_id)
      //     const message = ctx.update.message.text;
      //     console.log(ctx.message.from.id)
      //     if (message.match(/\hello/)) {
      //       ctx.reply(`Hello bạn có thểm bấm /hello`);
      //     } else {
      //       ctx.reply("Hong hiểu...");
      //     }
      //   });
            

      // routes
      app.post("/sendata", async (req, res) => {
        const myDb = db.db('Data')
        const collection = myDb.collection('main')
        const value = {
          spo2 : req.body.spo2,
          rate : req.body.rate,
          timestamp: new Date()
        }

        if (value.rate>100)
        {
 
          const mydb2 = db.db('Data')
          const collection2 = mydb2.collection('User')
          collection2.find({}).toArray( function(err, result) {

            for( var i in result)
            {

              bot.sendMessage(JSON.stringify(result[i].userId), `Người bệnh đang có nhịp tim cao!` );
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
        //const value = collection.find({$orderby: {$_id : -1}}).limit(5);
        //const value = collection.find();
        //,{ projection: { _id: 1, timestamp: 1 } }
        collection.find({},{$limit:5}).toArray(function(err, result) {
          if (result!=null) {
            console.log(result)
            res.status(200).send(JSON.stringify(result))
          } else {
            res.status(404).send()
            console.log("die")
          }
          })
        //console.log(value)
        //res.status(200).send(JSON.stringify(value))
      })
    }
    
  });


  const port = process.env.PORT || 8000
  app.listen(port,() => {
    console.log("Listening on port: ",port)
  })
  

