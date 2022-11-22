// 5623030045:AAEBfvOVfXcKmIAxtBRD_M85OoQJ994c_38

// const TelegramBot = require('node-telegram-bot-api');

// // replace the value below with the Telegram token you receive from @BotFather
// const token = '5623030045:AAEBfvOVfXcKmIAxtBRD_M85OoQJ994c_38';

// // Create a bot that uses 'polling' to fetch new updates
// const bot = new TelegramBot(token, {polling: true});

// // Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//   // 'msg' is the received Message from Telegram
//   // 'match' is the result of executing the regexp above on the text content
//   // of the message

//   const chatId = msg.chat.id;
//   const resp = match[1]; // the captured "whatever"

//   // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
// });

// // Listen for any kind of message. There are different kinds of
// // messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });



const express = require('express');
const { ObjectId } = require('mongodb');
const app = express();
const mongoClient = require('mongodb').MongoClient;
const mongoose = require("mongoose");
const { json } = require('express');
const path = require("path");
const fs = require("fs");
const { Telegraf } = require("telegraf");

// constants
const DB_PATH = path.resolve("db.json");

//telegram
const YOUR_TOKEN = "5981121317:AAG4Kgq5NtGxX9n7UbCFOnXgZFJrSnT1K2E";
const bot = new Telegraf(YOUR_TOKEN);

const url = "mongodb+srv://thanhnguyen1:thanhnguyen1@dahtnsmarthealth.6rpbgmj.mongodb.net/test"
app.use(express.json())

mongoClient.connect(url, (err, db) =>{
    if (err) {
      console.log("Error while connecting mongo client")
    }else {
            
      

      bot.start((ctx) => ctx.reply("Welcome"));
      bot.help((ctx) => ctx.reply("Send me a sticker"));

      bot.on("sticker", (ctx) => ctx.reply("🐶"));

      bot.on("message", async (ctx) => {
        const message = ctx.update.message.text;
        if (message.match(/\hello/)) {
          ctx.reply(`Hello bạn có thểm bấm /hello`);
        } else {
          ctx.reply("Hong hiểu...");
        }
      });

      bot.launch();


      // routes
      app.get("/", async (req, res) => {
        fs.readFile(DB_PATH, "utf-8", (err, jsonString) => {
          if (err) return console.log("Error in reading from db");
          let values = JSON.parse(jsonString);
          res.status(200).json({
            totalValues: values.length,
            values,
          });
        });
      });
      app.post("/", async (req, res) => {
        fs.readFile(DB_PATH, "utf-8", (err, jsonString) => {
          if (err) return console.log("Error in reading from db");
          let body = req.body;
          let valuesArr = JSON.parse(jsonString);
          
          let obj = {
            temperature: body.rate,
            humidity: body.sp02,
            timestamp: new Date(),
          };
          console.log(obj)

          valuesArr.push(obj);
          fs.writeFile(DB_PATH, JSON.stringify(valuesArr), (err) => {
            if (err) return console.log("Error in updating db");
            res.status(200).json({
              message: "Values saved",
              value: valuesArr[valuesArr.length - 1],
            });
          });
        });
      });
    }
    
  });


  const port = process.env.PORT || 8000
  app.listen(port, () => {
    console.log("Listening on port: ",port)
  })
  

