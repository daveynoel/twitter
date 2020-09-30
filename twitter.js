const log = require("./lib/logger")("Twitter Monitor V1");
const path = require("path");
const twit = require("twit");
const fs = require("fs");
var mongoose = require('mongoose');
const request = require("request");
const twitterSchema = require("./schema/twitter");
const notify = require("./lib/notify/index");
const discord = require("./lib/ocr/discord");
const ocr = require("./lib/ocr/ocr");
const config = require(path.join(__dirname, "config.json"));
const twitternamefilepath = require(path.join(__dirname, "backuptwittername.json"));
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
var T = new twit({
  consumer_key: config.app.consumer.key,
  consumer_secret: config.app.consumer.secret,
  access_token: config.app.access.token,
  access_token_secret: config.app.access.secret
//  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
//  strictSSL: true, // optional - requires SSL certificates to be valid.
});
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
(function() {
  const Twitter = {
    userID: [],
    tweetID: [],
    interval: null, 
    init: function() {
      this.connector().then(async () =>  
      {
           //var interval = setInterval(() => {
            //  console.log("called ");  
            let tasks = []
            // let oathToken = '569ixyNTIQpqbvGGmnlX00UBQ'
            // let oathSecret = 'hw5MYAH1caHuFq3AsZMI7bmW7CV1EZ2mRXJ4sJWDp78HLi2cdm'
            let starttoken = twitternamefilepath.token[0];
            let startsecret = twitternamefilepath.secret[0];
//name:'rajeevr04421638'
          //let twitterDetails =  await twitterSchema.find({"webhook.0": { "$exists": true }})
          let twitterDetails =  await twitterSchema.find({name:'rajeevr04421638'})
          .sort({_id:1})
            //  console.log('twitterDetails--',twitterDetails)
                if(twitterDetails.length > 0)
                {
                    //let index = 0
                   for (let index = 0; index < twitterDetails.length; index++) {
                 // config.app.other.twittername.forEach(name => {
                    //let username = name;
                    let username = twitterDetails[index].name;
                    let webhook = twitterDetails[index].webhook;

                    //console.log('username---->',username)
                    // T.post('friendships/create', {username}, function(err, res){
                    //   if(err){
                    //     console.log(err);
                    //   } else {
                    //     console.log(screen_name, ': **FOLLOWED**');
                    //   }
                    // });
                    //if(webhook.length >0){
                      console.log(username)

                      tasks.push(new Task(config, username ));
                      tasks[index].start(starttoken,startsecret,true);
                      //index++
                      //  tasks.push(new Task(username));
                      //  tasks[index].start();
                   // }
                  }
                  //tasks[i].main();
                  //})
                }


            // for (let i = 0; i < config.app.other.twittername.length; i++) {

            //   if(config.app.other.twittername[i] != config.app.consumer.screenname)
            //   {
            //     let screen_name = config.app.other.twittername[i]

            //     T.post('friendships/create', {screen_name}, function(err, res){
            //       if(err){
            //         console.log(err);
            //       } else {
            //         console.log(screen_name, ': **FOLLOWED**');
            //       }
            //     });
                
            //   }



            //   console.log('config.app.other.twittername[i]-->',config.app.other.twittername[i])
            //   tasks.push(new Task(config, config.app.other.twittername[i] ));
            //   tasks[i].start(starttoken,startsecret,true);
            //   //tasks[i].main();


            // }
          
         // await start(oathToken,oathSecret)
           //   this.startMonitor()
         // }, 500);
      });
    },
    connector: function() {
      log.green("Initializing Twitter Monitor...");
      return new Promise(async (resolve, reject) => {
       // config.app.other.twittername.forEach(name => {

        //let twitterDetails =  await twitterSchema.find({"webhook.0": { "$exists": true }})
         let twitterDetails =  await twitterSchema.find({name:'rajeevr04421638'})
        .sort({_id:1})
        //  console.log('twitterDetails--',twitterDetails)
            if(twitterDetails.length > 0)
            {
                //let index = 0
               for (let index = 0; index < twitterDetails.length; index++) {

                      let name = twitterDetails[index].name

                      // var params = {screen_name: name};

                      // T.get('statuses/user_timeline', params, function(error, tweets, response) {
                      //   if (!error) {
                      //     console.log('tweets-->',tweets);
                      //   }

                      // });

                      T.get("/users/show", { screen_name: name }, (err, data, res) => {
                        if (err) {
                         // reject();
                         // return log.red("ERROR" + err+'   '+name);
                         return false
                        }
                      // console.log('twitter data--',(data.entities.url.urls))
                        this.userID.push(data.id_str);
                        //if (this.userID.length == config.app.other.twittername.length) {
                          resolve();
                        //}
                      });
        }
      }
    
       // });
      });
    },
    startMonitor: async function() {
     // console.log('this.userID----',this.userID)
      // var stream = T.stream("statuses/filter", {
      //   follow: this.userID
      // });
      // console.log('start momitoring')

      // stream.on("connected", res => {
      //   log.green(
      //     "Twitter Monitor is connected... ~ Currently monitoring " +
      //       config.app.other.twittername.length +
      //       " profiles"
      //   );
      // });

      //   stream.on("tweet", tweet => {
      //     if (
      //       !this.tweetID.includes(tweet.id_str) &&
      //       this.userID.includes(tweet.user.id_str)
      //     ) {
  
      //       if (!isReply(tweet) === true) {
      //       console.log('twitted info --',tweet.entities)
      //       this.tweetID.push(tweet.id_str);
      //       log.green("****** TWEET DETECTED ******");
      //       log.blue(`[USER: ${tweet.user.screen_name}] - Just tweeted!`);
      //       log.blue(`[TIMESTAMP] - ${tweet.timestamp_ms}`);
      //       log.yellow("Sent discord webhook!");
      //       // notify user
      //       if (tweet.entities.media) {
      //         notify(headers, tweet, config, tweet.entities.media[0].media_url);
  
      //       // ocr.getImageText(tweet, tweet.entities.media[0].media_url);
      //       }else{
  
      //         notify(headers, tweet, config,null);
  
      //       }
  
      //     } else {
  
  
      //       log.red("Bad Tweet");
  
      //     }
  
      //     }
      //   });


    }

  };



  Twitter.init();
  

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

//module.exports = 'Hello world';
