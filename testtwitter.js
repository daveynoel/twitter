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
const twitternamefilepath = path.join(__dirname, "twittername.json");
var OAuth2 = require('oauth').OAuth2; 
var https = require('https');
//const {formatProxy} =  require('./lib/proxy');

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


//{"twitterName":["RajeevR04421638","vistocity","general"],"latestTweetId":["","",""]}

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
      this.connector().then(() =>  
      {
           //var interval = setInterval(() => {
            //  console.log("called ");  
          
              this.startMonitor()
         // }, 500);
      });
    },
    connector: function() {
      log.green("Initializing Twitter Monitor...");
      return new Promise((resolve, reject) => {
        config.app.other.twittername.forEach(name => {
          T.get("/users/show", { screen_name: name }, (err, data, res) => {
            if (err) {
              reject();
              return log.red("ERROR" + err);
            }
           // console.log('twitter data--',(data.entities.url.urls))
            this.userID.push(data.id_str);
            if (this.userID.length == config.app.other.twittername.length) {
              resolve();
            }
          });

        });
      });
    },
    startMonitor: function() {
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

      // read proxies file
      const text = fs.readFileSync('./proxy.txt', 'utf-8');
      // const proxies =
      //   text == ''
      //     ? []
      //     : formatProxy(
      //         text
      //           .replace(/\r/g, '')
      //           .trim()
      //           .split('\n') 
      //       );

      // console.log('proxies---',proxies)
     // console.log(`Loaded ${proxies.length} proxies!`);
      //const randomProxy = getRandomProxy(proxies);
     // console.log('randomProxy---',randomProxy)
//http://Cn9CcKJj:XLq54aYaYQ3NaeGA544H0oK6bUWdnqCrShw67pT6R69SYsWJVr02IFsCLy25rFxejot7c@shop1.resi.luckyaio.com:13853
      this.interval = setInterval(() => {
      console.log("called "); 

        console.log('name finished------ ')
        let countTwit = 0

        config.app.other.twittername.forEach( async name => {
          countTwit = countTwit +1
         // console.log('countTwit--',countTwit)
        //GET https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=twitterapi&count=2


        var oauth2 = new OAuth2('SfqxNaQOExzrMOmYfEspmIWrR', '5RVQacjppamkpV2v9QzAq7skcjTSZdwCk6W3YEVJ7wvsplB2NV', 'https://api.twitter.com/', null, 'oauth2/token', null);

        oauth2.getOAuthAccessToken('', {
            'grant_type': 'client_credentials'
          }, async function (e, access_token) {
              //console.log(access_token); //string that we can use to authenticate request

              let proxy = 'http://Cn9CcKJj:XLq54aYaYQ3NaeGA544H0oK6bUWdnqCrShw67pT6R69SYsWJVr02IFsCLy25rFxejot7c@shop1.resi.luckyaio.com:13853'
              let proxyHost = 'Cn9CcKJj:XLq54aYaYQ3NaeGA544H0oK6bUWdnqCrShw67pT6R69SYsWJVr02IFsCLy25rFxejot7c@shop1.resi.luckyaio.com'

                    
              // let optionp = {
              //   'method': 'GET',
              //   'url': `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${name}&count=1`,proxy,

              //   'headers': {
              //     'Content-Type': 'application/json',
              //     'Authorization': 'Bearer ' + access_token
              //   }
              // };

              //  await request(optionp, async function (error, response) { 
              //     console.log(response.body);
              // let  userTimelineStatus = response.body

              // let twitterDetails = await twitterSchema.findOne({name:name})


              // if(twitterDetails !== null)
              // {

              //   if(twitterDetails.twitid !== userTimelineStatus[0].id_str)
              //   {

              //     console.log('twitid------',twitterDetails.twitid)

              //    if (userTimelineStatus[0].entities.media) {
              //      notify(headers, userTimelineStatus[0], config, userTimelineStatus[0].entities.media[0].media_url);

              //     ocr.getImageText(userTimelineStatus[0], userTimelineStatus[0].entities.media[0].media_url);
              //    }else{

              //       notify(headers, userTimelineStatus[0], config,null);

              //    }
              //     await twitterSchema.updateOne({name:name}, { twitid: userTimelineStatus[0].id_str });

              //   }


              // }




              //   })

              try {

              var optionP = {
                hostname: 'api.twitter.com',proxyHost,
                path: '/1.1/statuses/user_timeline.json?screen_name='+name+'&count=1',
                headers: {
                    Authorization: 'Bearer ' + access_token
                }
            };


            https.get(optionP, function (result) {
              var buffer = '';
              result.setEncoding('utf8');
              result.on('data', function (data) {
                  buffer += data;
              });
              result.on('end', async function () {
                  var tweets = JSON.parse(buffer);
                 // console.log(tweets); // the tweets!

                let  userTimelineStatus = tweets

                let twitterDetails = await twitterSchema.findOne({name:name})


                if(twitterDetails !== null)
                {

                  if(twitterDetails.twitid !== userTimelineStatus[0].id_str)
                  {

                    console.log('twitid------',twitterDetails.twitid)

                   if (userTimelineStatus[0].entities.media) {
                     notify(headers, userTimelineStatus[0], config, userTimelineStatus[0].entities.media[0].media_url);

                   }else{

                      notify(headers, userTimelineStatus[0], config,null);

                   }
                    await twitterSchema.updateOne({name:name}, { twitid: userTimelineStatus[0].id_str });

                  }


                }




              });
              }).on("error", function(error) {
                console.log(error.message);
            });
            } catch(e) {
                //console.log(e);
                this.restart();
            }

        });





        // let optionp = {
        //   'method': 'GET',
        //   'url': `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${name}&count=1`,proxy,

        //   'headers': {
        //     'Content-Type': 'application/json',
        //     'Authorization': 'Bearer U2ZxeE5hUU9FeHpyTU9tWWZFc3BtSVdyUjo1UlZRYWNqcHBhbWtwVjJ2OVF6QXE3c2tjalRTWmR3Q2s2VzNZRVZKN3d2c3BsQjJOVg=='
        //   }
        // };

        // const twitter_api = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
        // const bearer_token = 'U2ZxeE5hUU9FeHpyTU9tWWZFc3BtSVdyUjo1UlZRYWNqcHBhbWtwVjJ2OVF6QXE3c2tjalRTWmR3Q2s2VzNZRVZKN3d2c3BsQjJOVg==';
        // var optionp = {
        //     method: 'GET',
        //     url: twitter_api,
        //     qs: {
        //         "screen_name": `${name}`
        //     },
        //     json: true,
        //     headers: {
        //         "Authorization": "Bearer " + bearer_token
        //     }
        // };

        //  await request(optionp, async function (error, response) { 
        //     if (error) throw new Error(error);
        //     console.log(response.body);
        //         let  userTimelineStatus = response.body

        //         let twitterDetails = await twitterSchema.findOne({name:name})


        //         // if(twitterDetails !== null)
        //         // {

        //         //   if(twitterDetails.twitid !== userTimelineStatus[0].id_str)
        //         //   {

        //         //     console.log('twitid------',twitterDetails.twitid)

        //         //    if (userTimelineStatus[0].entities.media) {
        //         //      notify(headers, userTimelineStatus[0], config, userTimelineStatus[0].entities.media[0].media_url);

        //         //     ocr.getImageText(userTimelineStatus[0], userTimelineStatus[0].entities.media[0].media_url);
        //         //    }else{

        //         //       notify(headers, userTimelineStatus[0], config,null);

        //         //    }
        //         //     await twitterSchema.updateOne({name:name}, { twitid: userTimelineStatus[0].id_str });

        //         //   }


        //         // }


        //      });


          //  let userTimelineStatus = await T.get("/statuses/user_timeline", { screen_name: name ,count: 1  } )
          // // console.log('userTimelineStatus---',userTimelineStatus.data[0].id_str)

          //   let twitterDetails = await twitterSchema.findOne({name:name})


          //   if(twitterDetails !== null)
          //   {

          //     if(twitterDetails.twitid !== userTimelineStatus.data[0].id_str)
          //     {

          //       console.log('twitid------',twitterDetails.twitid)
          //       //console.log('id_str------',userTimelineStatus.data[0])

          //       //console.log("twitterDetails--->",twitterDetails)
          //      // console.log("twitterDetails twit id--->",userTimelineStatus.data[0].id_str)
      
          //       if (userTimelineStatus.data[0].entities.media) {
          //         notify(headers, userTimelineStatus.data[0], config, userTimelineStatus.data[0].entities.media[0].media_url);
      
          //       // ocr.getImageText(userTimelineStatus.data[0], userTimelineStatus.data[0].entities.media[0].media_url);
          //       }else{
      
          //         notify(headers, userTimelineStatus.data[0], config,null);
      
          //       }
          //       await twitterSchema.updateOne({name:name}, { twitid: userTimelineStatus.data[0].id_str });
                
          //     }


          //   }


       });
      //});
   }, 2000);


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

     


      


    },
    restart:  function() {
      this._log.red('Restarting task...');
      clearInterval(this.interval);
      var that = this;
      setTimeout(function() {
        this.startMonitor();
      }, 500000);
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
