const log = require("./lib/logger")("Twitter Monitor V1");
const path = require("path");
const twit = require("twit");
const fs = require("fs");
var mongoose = require('mongoose');
const request = require("request");
const twitterSchema = require("./schema/twitter");
const notify = require("./lib/notify");
const discord = require("./lib/ocr/discord");
const ocr = require("./lib/ocr/ocr");
const config = require(path.join(__dirname, "config.json"));
//const twitternamefilepath = require(path.join(__dirname, "twittername.json"));
var Task = require('./lib/task');


let producationString =  'mongodb://brain1uMMong0User:PL5qnU9nuvX0pBa@68.183.173.21:27017/bot?authSource=admin'
var options = {useNewUrlParser: true, useUnifiedTopology: true};
var db = mongoose.connect(producationString, options, function (err) {
    if (err) {
        console.log(err + "connection failed");
    } else {
        console.log('Connected to database ');
    }
});
//mongo on connection emit
mongoose.connection.on('connected', function (err) {
    console.log("mongo Db conection successfull");
});
//mongo on error emit
mongoose.connection.on('error', function (err) {
    console.log("MongoDB Error: ", err);
});
//mongo on dissconnection emit
mongoose.connection.on('disconnected', function () {
    console.log("mongodb disconnected and trying for reconnect");
});
mongoose.set('debug', false);


// twitter configuration
// var T = new twit({
//   consumer_key: config.app.consumer.key,
//   consumer_secret: config.app.consumer.secret,
//   access_token: config.app.access.token,
//   access_token_secret: config.app.access.secret
// //  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
// //  strictSSL: true, // optional - requires SSL certificates to be valid.
// });
//console.log('config.app.consumer.key-',T)

let headers = {
  "Accept-Encoding": "gzip, deflate",
  "Accept-Language": "en-US,en;q=0.9",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Cache-Control": "max-age=0",
  Connection: "keep-alive"
};


/* Start up function */
(async function() {

           //var interval = setInterval(() => {
            //  console.log("called ");  
            let tasks = []
            // let oathToken = '569ixyNTIQpqbvGGmnlX00UBQ'
            // let oathSecret = 'hw5MYAH1caHuFq3AsZMI7bmW7CV1EZ2mRXJ4sJWDp78HLi2cdm'
           // let starttoken = twitternamefilepath.token[0];
          //  let startsecret = twitternamefilepath.secret[0];
    
            let twitterDetails = await twitterSchema.find({"webhook.0": { "$exists": true }}).sort({name:-1})
            //  console.log('twitterDetails--',twitterDetails)
                if(twitterDetails.length > 0)
                {

                  for (let index = 0; index < twitterDetails.length; index++) {

                    let username = twitterDetails[index].name;
                    let webhook = twitterDetails[index].webhook;

                    console.log('username---->',username)
                    // T.post('friendships/create', {username}, function(err, res){
                    //   if(err){
                    //     console.log(err);
                    //   } else {
                    //     console.log(screen_name, ': **FOLLOWED**');
                    //   }
                    // });
                    //if(webhook.length >0){
                        tasks.push(new Task(username));
                        tasks[index].start();
                   // }
                  }
                  //tasks[i].main();

                }

               // tasks.push(new Task('rajeevr04421638'));
               // tasks[0].loop();

           // }
          
         // await start(oathToken,oathSecret)
           //   this.startMonitor()
         // }, 500);
      
  

  const isReply = tweet => {
    return (
      tweet.retweeted_status ||
      tweet.in_reply_to_status_id ||
      tweet.in_reply_to_status_id_str ||
      tweet.in_reply_to_user_id ||
      tweet.in_reply_to_user_id_str ||
      tweet.in_reply_to_screen_name
    );
  };

})();




// let timer = setInterval(async function () {

//   let json ='{}'
//   await fs.writeFileSync('twittername.json', json, 'utf8'); // write it back 

// }, 1000 * 60 * 180);



//module.exports = 'Hello world';
