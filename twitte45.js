const log = require("./lib/logger")("Twitter Monitor V1");
const path = require("path");
const express = require("express");
const twit = require("twit");
const fs = require("fs");
var mongoose = require('mongoose');
const request = require("request");
const twitterSchema = require("./schema/twitter");
const notify = require("./lib/notify/index45");
const discord = require("./lib/ocr/discord");
const ocr = require("./lib/ocr/ocr");
const config = require(path.join(__dirname, "config.json"));

var https = require('https');
const cheerio = require('cheerio');
var separateReqPool = {maxSockets: 1};
var async = require('async');
var CronJob = require('cron').CronJob;


//const twitternamefilepath = require(path.join(__dirname, "twittername.json"));
var Task = require('./lib/task/index45');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
var server = require('http').createServer(app); 
var io = require('socket.io').listen(server);

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

io.on("connection", socket => {
  console.log("New client connected"), setInterval(
    () => getApiAndEmit(socket),
    1000
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});

let a = 0
const getApiAndEmit = async socket => {
  try {

      const res = a++
          
      let arr = [0] 

      arr.map(  async (val) => {

          let twitterDetails =  await twitterSchema.find({"webhook.0": { "$exists": true }}).sort({name:-1})
          //console.log('twitterDetails--',twitterDetails)
         if(twitterDetails.length > 0)
         {
             for (let index = 0; index < twitterDetails.length; index++) {                  
                  
                  let username = twitterDetails[index].name;
                  //console.log('user---->',username)

                  socket.emit("FromTwitAPI"+username, username);
              }
          }


      })

  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};





async function start(username) {

    console.log('started---------')
    var tweets={},apiurls=[],N=[];
  
      
    ///////////////////////////  CONFIGURE TWITTER HANDLERS /////////////////////////////////////////////////////
    var THandlers=[
      {
          name:'RajeevR04421638',
          url:"https://twitter.com/RajeevR04421638?lang=en",
          keywords:"*",
      },
      {
          name:'testing57966324',
          url:"https://twitter.com/testing57966324?lang=en",
          keywords:"*",
      }
  
    ];
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  
    //ADD TWEETS
       var uname = username
       var userurl = `https://twitter.com/${uname}?lang=en`
  
      console.log('uname---',uname)
      console.log('userurl---',userurl)
      
      tweets[userurl] = [];
     // apiurls.push(userurl);
  
    let tweetIncrement =0
    let tweetInterval =0
  
  
    //MONITOR
          let item = userurl
          request({url: item, pool: separateReqPool }, async function (error, response, body) {
              try {
  
                  let $ = cheerio.load(body);
                  var turl = item//"https://twitter.com" + response.req.path;
                  //console.log(turl)
  
                  if(tweets[turl].length == 0){
  
                      console.log('initial start--------',turl)
  
                      //FIRST LOAD
                      //str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
                      for(let i=0;i<$('div.js-tweet-text-container p').length;i++){
  
                       // let repStringo = ($('div.js-tweet-text-container p').eq(i).text()).replace(/(?:\r\n|\r|\n)/g, '\n')
                        //let repString = repStringo.replace(/\'s/g, "'s")
  
                           let textedval = $('div.js-tweet-text-container p').eq(i).text()
  
                           var prefixs = 'pic.twitter.com';
                           textedval = textedval.includes(prefixs) === true ? textedval.replace(/pic.twitter.com/g, 'https://pic.twitter.com') : textedval
  
  
                          tweets[turl].push(textedval);
                      }
                  }
                  else{
                      console.log('final start--------',turl)
  
                      //EVERY OTHER TIME
                          let stweetpush= {}
                          stweetpush[turl] = [];
                       // console.log('length', $('div.js-tweet-text-container p').length)
                          const s_tweet_pinned = $('.js-pinned-text').eq(0).text();
                         // let   s_tweet_video  = $('.js-stream-item').eq(0).text();
                        // let   s_tweet_video  = $('.js-stream-item .js-stream-tweet .js-tweet-text-container p').eq(1).text();
                        // console.log('s_tweet_video----------------->',s_tweet_video)
  
                          let s_tweet = s_tweet_pinned != '' ?  $('.js-stream-item .js-stream-tweet .js-tweet-text-container p').eq(1).text() : $('.js-stream-item .js-stream-tweet .js-tweet-text-container p').eq(0).text();
                          let s_tweetsphoto = ''
                          //let s_tweetsphoto = s_tweet_pinned != '' ? $('.AdaptiveMedia-photoContainer').eq(1).attr('data-image-url')  : $('.AdaptiveMedia-photoContainer').eq(0).attr('data-image-url');
                          
                          if(s_tweet_pinned != '')
                          {
  
                              
                              let   s_tweet_is_pinned_video  = 
                              $('.js-pinned .js-stream-tweet').find('.is-video').eq(0).html();
  
                              if(s_tweet_is_pinned_video !== null)
                              {
  
                                  let   s_tweet_is_video  = 
                                  $('.js-stream-item .js-stream-tweet').eq(1).find('.is-video').eq(0).html();
                                  //console.log('s_tweet_is_video----------------->',s_tweet_is_video)
                                  if(s_tweet_is_video !== null)
                                  {
                  
                                  //  let urlvideo =  await getFromTextToUrl(s_tweet_is_video)
                                     // s_tweetsphoto = await that.getFromTextToUrl(s_tweet_is_video)
                                  //  console.log('urlvideo----------------->',urlvideo)
  
                                  }
                              }else{
  
                                  let   s_tweet_is_video  = 
                                  $('.js-stream-item .js-stream-tweet').eq(1).find('.is-video').eq(0).html();
                                  //console.log('s_tweet_is_video----------------->',s_tweet_is_video)
                                  if(s_tweet_is_video !== null)
                                  {
                  
                                  //  let urlvideo =  await getFromTextToUrl(s_tweet_is_video)
                                     // s_tweetsphoto = await that.getFromTextToUrl(s_tweet_is_video)
                                  //  console.log('urlvideo----------------->',urlvideo)
  
                                  }
                              }
              
  
                              let   s_tweet_is_pinned_photo  = 
                              $('.js-pinned .js-stream-tweet').find('.AdaptiveMedia-photoContainer').eq(0).html();
  
                              if(s_tweet_is_pinned_photo !== null)
                              {
                                  let   s_tweet_is_photo  = 
                                  $('.js-stream-item .js-stream-tweet').eq(1).find('.AdaptiveMedia-photoContainer').eq(0).html();
                              // console.log('s_tweet_is_photo----------------->',s_tweet_is_photo)
                                  if(s_tweet_is_photo !== null)
                                  {
                  
                                      s_tweetsphoto =  $('.AdaptiveMedia-photoContainer').eq(1).attr('data-image-url')
                                  // console.log('urlphoto----------------->',s_tweetsphoto)
                  
                                  }
                              }else{
  
                                  let   s_tweet_is_photo  = 
                                  $('.js-stream-item .js-stream-tweet').eq(1).find('.AdaptiveMedia-photoContainer').eq(0).html();
                               //console.log('s_tweet_is_photo----------------->',s_tweet_is_photo)
                                  if(s_tweet_is_photo !== null)
                                  {
                  
                                      s_tweetsphoto =  $('.AdaptiveMedia-photoContainer').eq(0).attr('data-image-url')
                                  // console.log('urlphoto----------------->',s_tweetsphoto)
                  
                                  }
  
                              }
                          }
                          
                          let s_tweetsUserId = s_tweet_pinned != '' ? $('.js-original-tweet').eq(1).attr('data-tweet-id')  : $('.js-original-tweet').eq(0).attr('data-tweet-id');
                          let s_tweetsUrlLink = s_tweet_pinned != '' ? $('.twitter-timeline-link').eq(1).attr('href')  : $('.twitter-timeline-link').eq(0).attr('href');
  
  
                           if( uname =='cybersole'){
                           //console.log('s_tweetsUserId------------------>', s_tweetsUserId)
                         //  console.log('s_tweetsUrlLink------------------>', s_tweetsUrlLink)
  
  
                          // console.log('s_tweet_pinned------------------>', s_tweet_pinned)
                          // console.log('s_tweet------------------>', s_tweet)
                            }
  
                          const s_tweetsurl = $('div.ProfileHeaderCard-url').eq(0).text();
                          const s_tweetsbio = $('div.ProfileHeaderCard p').eq(0).text();
                          const s_tweetsProfilePic = $('div.ProfileCardMini a').attr('href');
                          const s_tweetsProfileLocation = $('div.ProfileHeaderCard-location span').text();
                          //let s_tweetsUrlLink = $('.twitter-timeline-link').attr('href');
                          let s_tweetsFollowers = $('.ProfileNav-item--followers a').attr('title');
  
                         // console.log('----s_tweetsFollowers----->',s_tweetsFollowers)
  
                         var prefix = 'pic.twitter.com';                       
                         
                         s_tweet = s_tweet.includes(prefix) === true ? s_tweet.replace(/pic.twitter.com/g, 'https://pic.twitter.com') : s_tweet
  
                          stweetpush[turl].push(s_tweet)
                         
                       // console.log('s_tweetsphoto-------->',s_tweetsphoto)
  
  
                          let urlMention = []// await that.checkMentionUrl(s_tweet)
                          //console.log('----urlMention----->',urlMention)
  
                          s_tweetsFollowers =  s_tweetsFollowers !== undefined ? s_tweetsFollowers :'0 Followers'
                          
                          s_tweetsUrlLink =  urlMention.length>0 ? s_tweetsUrlLink :''
                         
                          let countFollower =   parseInt((s_tweetsFollowers.replace(' Followers','')).trim())
  
                          let th_name = uname //THandlers.filter((d,i) => d.url === turl)[0].name;
  
                          let pbjectOutput =  { 
                              tweets:s_tweet, 
                              bioUrl:s_tweetsurl.trim(), 
                              latestImage:s_tweetsphoto, 
                              bioHeading:s_tweetsbio.trim(), 
                              username:th_name ,
                              profilePic:s_tweetsProfilePic,
                              location:s_tweetsProfileLocation.trim(),
                              follower:s_tweetsFollowers,
                              urlLink:s_tweetsUrlLink,
                              userId:s_tweetsUserId
                          }
  
                          let twitterDetails = await twitterSchema.findOne({name:th_name})
                           // console.log('twitterDetails--',twitterDetails)
                              if(twitterDetails !== null)
                              {
                                let webhook = twitterDetails.webhook
                                let webhook_id =twitterDetails.webhook_id
                                let webhook_secret = twitterDetails.webhook_secret
                                let twitstartbiostatus = twitterDetails.twitstartbiostatus
                                let twitstartbiourlstatus = twitterDetails.twitstartbiourlstatus
                                //check in discord for twittermonitors name in  collection for bio monitoring
                                if((s_tweetsbio.trim() != twitterDetails.twitbio) )
                                {
                                
                                  if(twitstartbiostatus === false)
                                  {
  
                                      await twitterSchema.updateOne({name:th_name}, { twitbio: s_tweetsbio.trim(), twitstartbiostatus : true});
                                      
                                  }else{
  
                                      await twitterSchema.updateOne({name:th_name}, { twitbio: s_tweetsbio.trim(), twitstartbiostatus : true});
                               
                                      notify(pbjectOutput, s_tweetsbio.trim(),null,null,null,webhook,webhook_id,webhook_secret);
                                  }
  
          
                                }
                                //twiturl
                                if(s_tweetsurl.trim() != twitterDetails.twiturl)
                                {
  
                                  if(twitstartbiourlstatus === false)
                                  {
  
                                      await twitterSchema.updateOne({name:th_name}, { twiturl: s_tweetsurl.trim() , twitstartbiourlstatus : true});
                                      
                                  }else{
  
  
                                      await twitterSchema.updateOne({name:th_name}, { twiturl: s_tweetsurl.trim() , twitstartbiourlstatus : true});
                                      notify(pbjectOutput, null, s_tweetsurl.trim(), null,null,webhook,webhook_id,webhook_secret);
  
                                  }
          
          
                                }
          
                               // console.log('userTimelineStatus[0].user.followers_count--',userTimelineStatus[0].user)
                                if(
                                  (parseInt(countFollower) > parseInt(twitterDetails.twitfollower))
                                  &&
                                  (twitterDetails.twitfollowerckeck === true)
                                  )
                                {
                                  await twitterSchema.updateOne({name:th_name}, { twitfollowerckeck: false});
                                  notify(pbjectOutput, null, null, 'twitfollower',countFollower,webhook,webhook_id,webhook_secret);
          
                                }
                              }
  
  
                           //CHECK IF TWEET IS NEWS
                           if( th_name =='cybersole'){
                                // console.log('tweets[turl]---->',tweets[turl])
                               //  console.log('s_tweet---->',stweetpush[turl])
                           }
  
                          if(tweets[turl].indexOf(stweetpush[turl][0]) === -1){
  
                            tweetIncrement ++
                          //  console.log('tweetIncrement---',tweetIncrement)
                              //tweets[turl].push(s_tweet);
  
                              //tweets[bio].push({ bioUrl:s_tweetsurl, bioHeading:s_tweetsbio });
  
                                      tweets[turl].push( s_tweet,
                                          { 
                                              tweets:s_tweet, 
                                              bioUrl:s_tweetsurl.trim(), 
                                              latestImage:s_tweetsphoto, 
                                              bioHeading:s_tweetsbio.trim(), 
                                              username:th_name ,
                                              profilePic:s_tweetsProfilePic,
                                              location:s_tweetsProfileLocation.trim(),
                                              follower:s_tweetsFollowers,
                                              urlLink:s_tweetsUrlLink,
                                              userId:s_tweetsUserId
                                          } 
                                          );
  
  
                                       let tw1 =tweets[turl].pop()
                                    
  
                                       let twitterDetails = await twitterSchema.findOne({name:th_name})
                                     // console.log('twitterDetails--',twitterDetails)
                                         if(twitterDetails !== null)
                                         {
                                                      
                                          let webhook = twitterDetails.webhook
                                          let webhook_id =twitterDetails.webhook_id
                                          let webhook_secret = twitterDetails.webhook_secret
              
                                        //   console.log('twitterDetails webhook--',webhook)
  
                                           
                                             await twitterSchema.updateOne({name:th_name}, { twitid: s_tweetsUserId });
                                             notify(tw1, null, null, null, null ,webhook,webhook_id,webhook_secret)
  
                                           
  
                                         }
  
  
                                      
                                   //   console.log('tweet 1------>',tw1)
                                    //  console.log('tweet 2----',tw2)
  
                               
                            }
                  }           
                   
              } catch (e) {
                    console.log('Error =>' + e);
              }
          });
  
      }







/* Start up function */
// (async function() {

//            //var interval = setInterval(() => {
//             //  console.log("called ");  
//             let tasks = []
//             // let oathToken = '569ixyNTIQpqbvGGmnlX00UBQ'
//             // let oathSecret = 'hw5MYAH1caHuFq3AsZMI7bmW7CV1EZ2mRXJ4sJWDp78HLi2cdm'
//            // let starttoken = twitternamefilepath.token[0];
//           //  let startsecret = twitternamefilepath.secret[0];
    
//             let twitterDetails = await twitterSchema.find({"webhook.0": { "$exists": true }}).sort({name:-1})
//             //  console.log('twitterDetails--',twitterDetails)
//                 if(twitterDetails.length > 0)
//                 {

//                   for (let index = 0; index < twitterDetails.length; index++) {

//                     let username = twitterDetails[index].name;
//                     let webhook = twitterDetails[index].webhook;

//                     console.log('username---->',username)
//                     // T.post('friendships/create', {username}, function(err, res){
//                     //   if(err){
//                     //     console.log(err);
//                     //   } else {
//                     //     console.log(screen_name, ': **FOLLOWED**');
//                     //   }
//                     // });
//                     //if(webhook.length >0){
//                    //     tasks.push(new Task(username));
//                    //     tasks[index].start();
//                    // }
//                   }
//                   //tasks[i].main();

//                 }

//                // tasks.push(new Task('rajeevr04421638'));
//                // tasks[0].loop();

//            // }
          
//          // await start(oathToken,oathSecret)
//            //   this.startMonitor()
//          // }, 500);
      
  

//   const isReply = tweet => {
//     return (
//       tweet.retweeted_status ||
//       tweet.in_reply_to_status_id ||
//       tweet.in_reply_to_status_id_str ||
//       tweet.in_reply_to_user_id ||
//       tweet.in_reply_to_user_id_str ||
//       tweet.in_reply_to_screen_name
//     );
//   };

// })();


app.set('port', 4001);
console.log('config.port',4001);
server.listen(app.get('port'), function (err) {
    if (err) {
        throw err;
    }
    else {
        console.log("Server is running at http://localhost:" + app.get('port'));
    }
});

// let timer = setInterval(async function () {

//   let json ='{}'
//   await fs.writeFileSync('twittername.json', json, 'utf8'); // write it back 

// }, 1000 * 60 * 180);



//module.exports = 'Hello world';
