
var logger = require('../logger');
const twitterSchema = require("../../schema/twitter");
var path = require('path');
var OAuth2 = require('oauth').OAuth2; 
var https = require('https');
const notify = require("../notify/index45");
var fs = require('fs');

const cheerio = require('cheerio');
const request = require('request');
var separateReqPool = {maxSockets: 1};
var async = require('async');
var CronJob = require('cron').CronJob;

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


async  getFromTextToUrl(tweets)
{
    let parsedUrls = ''

    var urlRegex = /(https?:\/\/[^\s]+)/g;
    tweets.replace(urlRegex, function(url) {
        console.log('url----------------->',url)
        if(url !== null){
        console.log('url not null----------------->')

            parsedUrls = url.replace('&apos;)">','')

        }else{
            parsedUrls = ''

        }
    })
    return parsedUrls
}


async start() {

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
 // THandlers.forEach((th,i) => {
     var uname = this._user
     var userurl = `https://twitter.com/${uname}?lang=en`

    console.log('uname---',uname)
    console.log('userurl---',userurl)
    
    tweets[userurl] = [];
    apiurls.push(userurl);
 // });
  
  let tweetIncrement =0
  let tweetInterval =0

  var that = this;

  //MONITOR
  //this._intv = setInterval(async () => {

    //console.log('tweetInterval initial----',tweetInterval)
var job = new CronJob('* * * * * *', function() {
    //console.log('You will see this message every second');


    async.map(apiurls, async function(item, callback){
         const PROXY_URL =  'http://Cn9CcKJj:XLq54aYaYQ3NaeGA544H0oK6bUWdnqCrShw67pT6R69SYsWJVr02IFsCLy25rFxejot7c@shop1.resi.luckyaio.com:13853'
    
        request({url: item, pool: separateReqPool }, async function (error, response, body) {
            try {
               // tweets[item] = []
              // tweetInterval++
              // console.log("tweetInterval-->",tweetInterval)
                   if(parseInt(tweetInterval) >1500)
                    {
                        tweetInterval = 0
                       // await that.restart()
                //console.log('tweetInterval final----',tweetInterval)

                    }
                
               // console.log('item--------',item)

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
                                    s_tweetsphoto = await that.getFromTextToUrl(s_tweet_is_video)
                                //  console.log('urlvideo----------------->',urlvideo)

                                }
                            }else{

                                let   s_tweet_is_video  = 
                                $('.js-stream-item .js-stream-tweet').eq(1).find('.is-video').eq(0).html();
                                //console.log('s_tweet_is_video----------------->',s_tweet_is_video)
                                if(s_tweet_is_video !== null)
                                {
                
                                //  let urlvideo =  await getFromTextToUrl(s_tweet_is_video)
                                    s_tweetsphoto = await that.getFromTextToUrl(s_tweet_is_video)
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


                        let urlMention =  await that.checkMentionUrl(s_tweet)
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
    })
}, null, true, 'America/Los_Angeles');

job.start();

//},200);//RUNS EVERY 5 SECONDS

    }


    async restart(starttokenindex) {
        this._log.red('Restarting task...');
       // console.log('start token index', starttokenindex)
    
       // console.log('restart interval start', this._intv)
        clearInterval(this._intv);
       // console.log('restart interval end', this._intv)
    
        let token=  twitternamefilepath.token[starttokenindex]
        let secret=  twitternamefilepath.secret[starttokenindex]
    
        if(twitternamefilepath.token.length == (parseInt(starttokenindex)+1))
        {
          this._starttokenindex = 0;
        }
      
        var that = this;
        setTimeout(function() {
             console.log('start token', token)
            console.log('start secret', secret)
    
          that.start(token,secret);
        }, 1000);
      }



}



module.exports =  Task;
