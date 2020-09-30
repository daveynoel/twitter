var requestp = require('request-promise');
const twit = require("twit");
const request = require('request');
var separateReqPool = {maxSockets: 1};
const cheerio = require('cheerio');
const fetch = require('node-fetch');

var OAuth2 = require('oauth').OAuth2; 
var https = require('https');

/**
 *
 * @param {String} user - Username or Email for login
 * @param {String} pass - Password for login
 * 161436411624997 562529301027258
 */
//#region apitwit

const scrapeUser = async (username,token,secret,accesstoken,accesssecret) => {

        let oathToken = token
        let oathSecret = secret
        let access_key = accesstoken
        let access_secret = accesssecret

 
        var params = {screen_name: username,  count: 200, tweet_mode: 'extended'};

        return new Promise( async (resolve, reject) => {  
          
          let oauth2 = new OAuth2(oathToken, oathSecret, 'https://api.twitter.com/', null, 'oauth2/token', null);
          // console.log('hi oauth2--',oauth2)
           await oauth2.getOAuthAccessToken('', { 'grant_type': 'client_credentials'
               }, async function (e, access_token) {
              
   
                   var optionP = {
                     hostname: 'api.twitter.com',
                     path: '/1.1/statuses/user_timeline.json?screen_name=@'+username+'&count=1&tweet_mode=extended',
                     headers: {  Authorization: 'Bearer ' + access_token    }
                   };

                  // await fetch('https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name='+username+'&count=1', {
                  //       method: 'get',
                  //       headers: {  Authorization: 'Bearer ' + access_token    }
                  //     })
                  //   .then(res => res.json())
                  //   .then((json) => {

                  //     //console.log(json)
                  //     resolve(json)
                  //   });
                    
                 //  console.log('name---',optionP)
                   await https.get(optionP, async function (result) {
                     var buffer = '';
                   //  console.log("statusCode: ", result.statusCode);
   
                     if(result.statusCode !== 200)
                     {
                       //isaccess
   
                     //  await restart(oathTokenRestart,oathSecretRestart);
                        
                         
                       return false
                     }
                     result.setEncoding('utf8');
   
                     result.on('data', function (data) {
                         buffer += data;
                     });
   
                     result.on('end', async function () {
                         var tweets = JSON.parse(buffer);
                        //console.log('tweets---',tweets)
                       // console.log(tweets); // the tweets!
                      // console.log('hi interval4')
   
                       let  userTimelineStatus = tweets
                        //if(username === 'rajeevr04421638')
                        if(username === 'terabyte')
                        {

                        //console.log('tweets---',tweets)

                        }
                       resolve(tweets)
   
                     });
                     })
                 // }
             //  }
                 
   
             });


        })
};

//#endregion apitwit

//#region apitwit
// const scrapeUser = async (username,token,secret,accesstoken,accesssecret) => {

//   let consumer_key = token
//   let consumer_secret = secret
//   let access_key = accesstoken
//   let access_secret = accesssecret

//   var item = `https://twitter.com/${username}?lang=en`

//   return new Promise( (resolve, reject) => {  
    

//     request({url: item, pool: separateReqPool }, async function (error, response, body) {

//       try {

//         if( username =='cybersole'){
//       //  console.log(body);
//         }
//           let $ = cheerio.load(body);
          
//           var turl = item//"https://twitter.com" + response.req.path;
//           resolve($)

//       } catch (e) {

//         reject(e)

//         console.log('Error =>' + e);
//       }
//     });

//   })
// };

//#endregion apitwit


/**
 *
 * @param {array} body - Must be an array of body response
 */

 //#region scrape apitwit
const scrapeUserData = async tweets => {
  const data = [];
  console.log('tweets--->',tweets[0].entities.user_mentions);

  // get user data
 
  let biourl  = ''
 // console.log('tweets[0]--',tweets[0])
  if(tweets[0] !== undefined)
  {
  if(tweets[0].user.entities.url !== undefined)
  {
    biourl  = tweets[0].user.entities.url.urls[0].expanded_url
  }

 // console.log('user---->',tweets[0].user.entities.url.urls[0].expanded_url)


 let latestImage = ''
 latestImage =  tweets[0].entities.media !== undefined
                ? tweets[0].entities.media[0].media_url : ''

  let urllink = []
  if(tweets[0].entities.urls.length > 0)
  {
    tweets[0].entities.urls.map( (extendurl) => {

      urllink.push(extendurl.expanded_url)

    })
  }

  let testuserTimelineStatus =  
  { 
    tweets      : htmlEntities(tweets[0].full_text), 
    bioUrl      : biourl, 
    tweetMentionUser : tweets[0].entities.user_mentions, 
    latestImage : latestImage,//tweets[0].s_tweetsphoto, 
    bioHeading  : tweets[0].user.description, 
    username    : tweets[0].user.screen_name ,
    profilePic  : tweets[0].user.profile_image_url,
    location    : tweets[0].user.location,
    follower    : tweets[0].user.followers_count,
    urlLink     : urllink,//tweets[0].s_tweets[0]UrlLink,
    userId      : tweets[0].id_str,
    id_str      : tweets[0].id_str,
    retweeted_status:tweets[0].retweeted_status
   }

   //console.log('testuserTimelineStatus--->',testuserTimelineStatus)

  return testuserTimelineStatus;
}else{
  return false
}


};

 //#endregion scrape apitwit

 //#region scrape user data apitwit
//  const scrapeUserData = async tweets => {
//   const data = [];

//   // get user data
//   let $ = tweets
//   let stweetpush= {}
//   // console.log('length', $('div.js-tweet-text-container p').length)
//   const s_tweet_pinned = $('.js-pinned-text').eq(0).text();
//   // console.log('s_tweet_video----------------->',s_tweet_video)
//   // <div class="user-actions btn-group not-following " data-user-id="718857559403270144"
//   // data-screen-name="Cybersole" data-name="Cybersole" data-protected="false">
//    let name =  $('.user-actions').eq(0).attr('data-screen-name')



//   let s_tweet = s_tweet_pinned != '' ?  $('.js-stream-item .js-stream-tweet .js-tweet-text-container p').eq(1).text() : $('.js-stream-item .js-stream-tweet .js-tweet-text-container p').eq(0).text();
//   let s_tweetsphoto = ''
//   //let s_tweetsphoto = s_tweet_pinned != '' ? $('.AdaptiveMedia-photoContainer').eq(1).attr('data-image-url')  : $('.AdaptiveMedia-photoContainer').eq(0).attr('data-image-url');
  
//   if(s_tweet_pinned != '')
//   {

      
//       let   s_tweet_is_pinned_video  = 
//       $('.js-pinned .js-stream-tweet').find('.is-video').eq(0).html();

//       if(s_tweet_is_pinned_video !== null)
//       {

//           let   s_tweet_is_video  = 
//           $('.js-stream-item .js-stream-tweet').eq(1).find('.is-video').eq(0).html();
//           //console.log('s_tweet_is_video----------------->',s_tweet_is_video)
//           if(s_tweet_is_video !== null)
//           {

//           //  let urlvideo =  await getFromTextToUrl(s_tweet_is_video)
//               s_tweetsphoto = await getFromTextToUrl(s_tweet_is_video)
//           //  console.log('urlvideo----------------->',urlvideo)

//           }
//       }else{

//           let   s_tweet_is_video  = 
//           $('.js-stream-item .js-stream-tweet').eq(1).find('.is-video').eq(0).html();
//           //console.log('s_tweet_is_video----------------->',s_tweet_is_video)
//           if(s_tweet_is_video !== null)
//           {

//           //  let urlvideo =  await getFromTextToUrl(s_tweet_is_video)
//               s_tweetsphoto = await getFromTextToUrl(s_tweet_is_video)
//           //  console.log('urlvideo----------------->',urlvideo)

//           }
//       }


//       let   s_tweet_is_pinned_photo  = 
//       $('.js-pinned .js-stream-tweet').find('.AdaptiveMedia-photoContainer').eq(0).html();

//       if(s_tweet_is_pinned_photo !== null)
//       {
//           let   s_tweet_is_photo  = 
//           $('.js-stream-item .js-stream-tweet').eq(1).find('.AdaptiveMedia-photoContainer').eq(0).html();
//       // console.log('s_tweet_is_photo----------------->',s_tweet_is_photo)
//           if(s_tweet_is_photo !== null)
//           {

//               s_tweetsphoto =  $('.AdaptiveMedia-photoContainer').eq(1).attr('data-image-url')
//           // console.log('urlphoto----------------->',s_tweetsphoto)

//           }
//       }else{

//           let   s_tweet_is_photo  = 
//           $('.js-stream-item .js-stream-tweet').eq(1).find('.AdaptiveMedia-photoContainer').eq(0).html();
//        //console.log('s_tweet_is_photo----------------->',s_tweet_is_photo)
//           if(s_tweet_is_photo !== null)
//           {

//               s_tweetsphoto =  $('.AdaptiveMedia-photoContainer').eq(0).attr('data-image-url')
//           // console.log('urlphoto----------------->',s_tweetsphoto)

//           }

//       }
//   }
  
//   let s_tweetsUserId = s_tweet_pinned != '' ? $('.js-original-tweet').eq(1).attr('data-tweet-id')  : $('.js-original-tweet').eq(0).attr('data-tweet-id');
//   let s_tweetsUrlLink = s_tweet_pinned != '' ? $('.twitter-timeline-link').eq(1).attr('href')  : $('.twitter-timeline-link').eq(0).attr('href');


//   //  if( uname =='cybersole'){
//   //         //console.log('s_tweetsUserId------------------>', s_tweetsUserId)
//   //         //  console.log('s_tweetsUrlLink------------------>', s_tweetsUrlLink)


//   //         // console.log('s_tweet_pinned------------------>', s_tweet_pinned)
//   //         // console.log('s_tweet------------------>', s_tweet)
//   //   }

//   const s_tweetsurl = $('div.ProfileHeaderCard-url').eq(0).text();
//   const s_tweetsbio = $('div.ProfileHeaderCard p').eq(0).text();
//   const s_tweetsProfilePic = $('div.ProfileCardMini a').attr('href');
//   const s_tweetsProfileLocation = $('div.ProfileHeaderCard-location span').text();
//   //let s_tweetsUrlLink = $('.twitter-timeline-link').attr('href');
//   let s_tweetsFollowers = $('.ProfileNav-item--followers a').attr('title');

//  // console.log('----s_tweetsFollowers----->',s_tweetsFollowers)

//  var prefix = 'pic.twitter.com';                       
 
//  s_tweet = s_tweet.includes(prefix) === true ? s_tweet.replace(/pic.twitter.com/g, 'https://pic.twitter.com') : s_tweet

 
// // console.log('s_tweetsphoto-------->',s_tweetsphoto)


//   let urlMention =  await checkMentionUrl(s_tweet)
//   //console.log('----urlMention----->',urlMention)

//   s_tweetsFollowers =  s_tweetsFollowers !== undefined ? s_tweetsFollowers :'0 Followers'
  
//   s_tweetsUrlLink =  urlMention.length>0 ? s_tweetsUrlLink :''
 
//   let countFollower =   parseInt((s_tweetsFollowers.replace(' Followers','')).trim())

//   //let th_name = uname //THandlers.filter((d,i) => d.url === turl)[0].name;

//   let testuserTimelineStatus =  { 
//       tweets:s_tweet, 
//       bioUrl:s_tweetsurl.trim(), 
//       latestImage:s_tweetsphoto, 
//       bioHeading:s_tweetsbio.trim(), 
//       username:name ,
//       profilePic:s_tweetsProfilePic,
//       location:s_tweetsProfileLocation.trim(),
//       follower:s_tweetsFollowers,
//       urlLink:s_tweetsUrlLink,
//       userId:s_tweetsUserId,
//       id_str:s_tweetsUserId
//   }

//   // let testuserTimelineStatus =  
//   // { 
//   //   tweets      : tweets[0].full_text, 
//   //   bioUrl      : biourl, 
//   //   latestImage : latestImage,//tweets[0].s_tweetsphoto, 
//   //   bioHeading  : tweets[0].user.description, 
//   //   username    : tweets[0].user.screen_name ,
//   //   profilePic  : tweets[0].user.profile_image_url,
//   //   location    : tweets[0].user.location,
//   //   follower    : tweets[0].user.followers_count,
//   //   urlLink     : urllink,//tweets[0].s_tweets[0]UrlLink,
//   //   userId      : tweets[0].user.id,
//   //   id_str      : tweets[0].id_str
    
//   //  }

//    //console.log('testuserTimelineStatus--->',testuserTimelineStatus)

//   return testuserTimelineStatus;
// };

 //#endregion scrape user data apitwit

function htmlEntities(str) {
    return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}

async function checkMentionUrl(tweets)
    {
        let parsedUrlsArray = []

        var urlRegex = /(https?:\/\/[^\s]+)/g;
        tweets.replace(urlRegex, function(url) {
            parsedUrlsArray.push(url);
        })
        return parsedUrlsArray
    }


async function getFromTextToUrl(tweets)
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

/**
 *
 * @param {string} text - text string
 * @returns {Boolean} Returns null if string is not undefined
 */
const validateText = caption => {
  if (caption.length == 0) {
    return null;
  }

  return caption[0].node.text;
};


module.exports = { scrapeUser, scrapeUserData, validateText }