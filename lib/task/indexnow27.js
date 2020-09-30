
var logger = require('../logger');
const twitterSchema = require("../../schema/twitter");
var path = require('path');
var OAuth2 = require('oauth').OAuth2; 
var https = require('https');
const notify = require("../../lib/notify");

const cheerio = require('cheerio');
const request = require('request');
var separateReqPool = {maxSockets: 1};
var async = require('async');
var fetch = require('node-fetch');

console.log('__dirname--->',__dirname)
var appDir = path.dirname(require.main.filename);
const config = require(path.join(appDir, "config.json"));
console.log('config--->',config)
const twitternamefilepath = require(path.join(appDir, "twittername.json"));
//const querystring = require('querystring');

// var postData = querystring.stringify({
//     'msg' : 'Hello World!'
// });




class Task {
  constructor( user, proxies) {
    this._proxies = proxies;
    this._user = user;
    this._log = logger(user);
    this._ids = [];
    this.tweets = {};
    this.tweets[`https://twitter.com/${this._user}?lang=en`] = [];

    this._intv = null;
    this._intervalCount = 0;
    this._starttokenindex = 0;
    this._postsResult = false;
  }

async  checkMentionUrl(tweets)
    {
        let parsedUrlsArray = []

        var urlRegex = /(https?:\/\/[^\s]+)/g;
        tweets.replace(urlRegex, function(url) {
            parsedUrlsArray.push(url);
        })

     return parsedUrlsArray
    }
async start() {

  console.log('started---------')
  var apiurls=[],N=[];

    
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
 // THandlers.forEach((th,i) => {
     var uname = this._user
     var userurl = `https://twitter.com/${uname}?lang=en`

    console.log('uname---',uname)
    console.log('userurl---',userurl)
    
    
    apiurls.push(userurl);
 // });
  
  let tweetIncrement =0
  let tweetInterval =0

  var that = this;

  //MONITOR
 // this._intv = setInterval(async () => {

console.log('tweetInterval initial----',tweetInterval)

    async.map(apiurls, async function(item, callback){
         const PROXY_URL =  'http://Cn9CcKJj:XLq54aYaYQ3NaeGA544H0oK6bUWdnqCrShw67pT6R69SYsWJVr02IFsCLy25rFxejot7c@shop1.resi.luckyaio.com:13853'
         console.log('proxy----',PROXY_URL)

       let twitdata = await that.fetchtwit(item,tweetInterval,that.tweets,uname)

       console.log('twitdata------->',twitdata.s_tweetsphoto)

      
    });


//},100);//RUNS EVERY 5 SECONDS

    }

async fetchtwit(item,tweetInterval,tweets,uname) {
    let that = this
    return new Promise( (resolve,reject) => {
        
        request({url: item, pool: separateReqPool }, async function (error, response, body) {


                let $ = cheerio.load(body);
                let s_tweetsUserId = $('.js-original-tweet').attr('data-tweet-id');

                 console.log('LINK-------------------------------->',`https://twitter.com/${uname}/status/${s_tweetsUserId}`)


                let s_tweet_pinned = $('.js-pinned-text').eq(0).text();

                let s_tweetsphoto = s_tweet_pinned != '' ? $('.AdaptiveMedia-photoContainer').eq(1).attr('data-image-url')  : $('.AdaptiveMedia-photoContainer').eq(0).attr('data-image-url');
               
               if(s_tweetsphoto !== undefined)
               {

                  console.log('TWEET PHOTO-------------------------------->',s_tweetsphoto)

                  let imageUrl =   await that.fetchImageUrl(`https://twitter.com/${uname}/status/${s_tweetsUserId}`)
                
                 let chi = cheerio.load(imageUrl);
                 s_tweet_pinned = chi('.js-pinned-text').eq(0).text();

                 s_tweetsphoto = s_tweet_pinned != '' ? chi('.AdaptiveMedia-photoContainer').eq(1).attr('data-image-url')  : chi('.AdaptiveMedia-photoContainer').eq(0).attr('data-image-url');
               
               }


     
               // tweets[item] = []
          
                //console.log('body--------',tweets)
                var turl = item//"https://twitter.com" + response.req.path;
                if(tweets[turl].length == 0){
                    //FIRST LOAD
                    //str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
                    for(let i=0;i< 2 ;i++){

                     // let repStringo = ($('div.js-tweet-text-container p').eq(i).text()).replace(/(?:\r\n|\r|\n)/g, '\n')
                      //let repString = repStringo.replace(/\'s/g, "'s")

                         let textedval = $('div.js-tweet-text-container p').eq(i).text()

                         var prefixs = 'pic.twitter.com';
                         textedval = textedval.includes(prefixs) === true ? textedval.replace(/pic.twitter.com/g, 'https://pic.twitter.com') : textedval


                         tweets[turl].push(textedval);
                       
                    }
                   // console.log('tweets[turl]---------->',tweets[turl])
                }
                else{
                    //EVERY OTHER TIME
                        let stweetpush= {}
                        stweetpush[turl] = [];
                     // console.log('length', $('div.js-tweet-text-container p').length)

                        let s_tweet = s_tweet_pinned != '' ?  $('div.js-tweet-text-container p').eq(1).text() : $('div.js-tweet-text-container p').eq(0).text();
                       // let s_tweetsphoto = s_tweet_pinned != '' ? $('.AdaptiveMedia-photoContainer').eq(1).attr('data-image-url')  : $('.AdaptiveMedia-photoContainer').eq(0).attr('data-image-url');


                        const s_tweetsurl = $('div.ProfileHeaderCard-url').eq(0).text();
                        const s_tweetsbio = $('div.ProfileHeaderCard p').eq(0).text();
                        const s_tweetsProfilePic = $('div.ProfileCardMini a').attr('href');
                        const s_tweetsProfileLocation = $('div.ProfileHeaderCard-location span').text();
                        let s_tweetsUrlLink = $('.twitter-timeline-link').attr('href');
                        let s_tweetsFollowers = $('.ProfileNav-item--followers a').attr('title');
                        let s_tweetsUserId = $('.js-original-tweet').attr('data-tweet-id');
                       // console.log('----s_tweetsFollowers----->',s_tweetsFollowers)

                       var prefix = 'pic.twitter.com';
                       s_tweetsphoto = s_tweet.includes(prefix) === true ? s_tweetsphoto :''
                       s_tweet = s_tweet.includes(prefix) === true ? s_tweet.replace(/pic.twitter.com/g, 'https://pic.twitter.com') : s_tweet

                        stweetpush[turl].push(s_tweet)
                       
                     // console.log('s_tweetsphoto-------->',s_tweetsphoto)


                        let urlMention =  await that.checkMentionUrl(s_tweet)
                        //console.log('----urlMention----->',urlMention)

                        s_tweetsFollowers =  s_tweetsFollowers !== undefined ? s_tweetsFollowers :'0 Followers'
                        
                        s_tweetsUrlLink =  urlMention.length>0 ? s_tweetsUrlLink :''
                       
                        let countFollower =   parseInt((s_tweetsFollowers.replace(' Followers','')).trim())

                        let th_name = uname //THandlers.filter((d,i) => d.url === turl)[0].name;

                          // s_tweetsphoto = imageUrl !== undefined ? imageUrl:''

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
                        console.log('tweets[turl]---->',tweets[turl])
                        console.log('s_tweet---->',stweetpush[turl])

                        if(tweets[turl].indexOf(stweetpush[turl][0]) === -1){

                         // tweetIncrement ++
                         //console.log('tweetIncrement---',tweetIncrement)


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
                                    console.log('twitterDetails--',twitterDetails)
                                       if(twitterDetails !== null)
                                       {
                                                    
                                        let webhook = twitterDetails.webhook
                                        let webhook_id =twitterDetails.webhook_id
                                        let webhook_secret = twitterDetails.webhook_secret
            
                                         console.log('twitterDetails webhook--',webhook)

                                         
                                           await twitterSchema.updateOne({name:th_name}, { twitid: s_tweetsUserId });
                                           notify(tw1, null, null, null, null ,webhook,webhook_id,webhook_secret)

                                         

                                       }

                             
                          }
                }           
      
     // }


                 


              //  console.log('IMAGEURL------------------------------------------------->',imageUrl)
                resolve({body:body, s_tweetsphoto:s_tweetsphoto})

              //  second(newParamters, data); //call second function         
        });
    
        })
}


async restart() {
    this._log.red('Restarting task...');
    //console.log('this._intv----initial---',this._intv)
    //clearInterval(this._intv);
    this._intv = null;
   // console.log('this._intv----final---',this._intv)

    var that = this;
    setTimeout(function() {    
        that.start();
    }, 1000);
    }


  async fetchImageUrl(url){

    let [imageurl] = await Promise.all([

        fetch(url)
            .then((res) => {
             return res.text()
           })

    ]);
   // console.log('----------------------------fetchimageurl---->',imageurl)
    return imageurl
 
 }   


async loop() {
    let tasks = []
    var that = this;
    
   // var rand = Math.round(Math.random() * (3000 - 2950)) + 50;
   // console.log('rand----->',rand)

    that.start(true);

    setTimeout( function() {

            that.loop();  

    }, 10);

    }

}



module.exports =  Task;
