const request = require("request");
const path = require("path");
const twit = require("twit");
const log = require("../logger")("Twitter Monitor V1");
const hookcord = require('hookcord');
const Tesseract = require("tesseract.js");

const cheerio = require('cheerio');
var separateReqPool = {maxSockets: 1};
var async = require('async');

var QrCode = require('qrcode-reader');
var qr = new QrCode();
const fetch = require('node-fetch');

var Jimp = require("jimp");

const Hook = new hookcord.Hook()
//timestamp_ms
var appDir = path.dirname(require.main.filename);
//console.log('__dirname--',appDir)

const config = require(path.join(appDir, "config.json"));


// let tasks = []
// tasks.push(new Task(config, config.app.other.twittername[0] ));
// tasks[0].main('RajeevR04421638');


// twitter configuration
var T = new twit({
  consumer_key: config.app.consumer.key,
  consumer_secret: config.app.consumer.secret,
  access_token: config.app.access.token,
  access_token_secret: config.app.access.secret
});


function getuserdetails(username) {

  let url = `https://twitter.com/${username}?lang=en`
  console.log('url--->',url)
  return new Promise(function (resolve, reject) {

      request({url: url, pool: separateReqPool}, async function (error, response, body) {
          try {
          // tweets[item] = []
             // console.log('body--------',body)
              let $ = cheerio.load(body);
              
                  //EVERY OTHER TIME
                      const s_tweet_pinned = $('.js-pinned-text').eq(0).text();

                      let s_tweet = s_tweet_pinned != '' ?  $('div.js-tweet-text-container p').eq(1).text() : $('div.js-tweet-text-container p').eq(0).text();

                      let s_tweetsphoto = $('div.js-adaptive-photo').attr('data-image-url');
                      const s_tweetsurl = $('div.ProfileHeaderCard-url').eq(0).text();
                      const s_tweetsbio = $('div.ProfileHeaderCard p').eq(0).text();
                      const s_tweetsProfilePic = $('div.ProfileCardMini a').attr('href');
                      const s_tweetsProfileLocation = $('div.ProfileHeaderCard-location span').text();
                      let s_tweetsUrlLink = $('.twitter-timeline-link').attr('href');
                      let s_tweetsFollowers = $('.ProfileNav-item--followers a').attr('title');
                      let s_tweetsUserId = $('.js-original-tweet').attr('data-tweet-id');

                     // console.log('----s_tweetsFollowers----->',s_tweetsFollowers)
                      //let urlMention =  await checkMentionUrl(s_tweet)

                      s_tweetsFollowers =  s_tweetsFollowers !== undefined ? s_tweetsFollowers :'0 Followers'

                   //   s_tweetsUrlLink =  urlMention.length>0 ? s_tweetsUrlLink :''
                     
                       var prefix = 'pic.twitter.com';
                       s_tweetsphoto = s_tweet.startsWith(prefix) === true ? s_tweetsphoto :''


                      //CHECK IF TWEET IS NEWS
                      console.log('----------incre-------',i)
                      if(i ==0){

                      let output =    { 
                              tweets:s_tweet, 
                              bioUrl:s_tweetsurl.trim(), 
                              latestImage:s_tweetsphoto, 
                              bioHeading:s_tweetsbio.trim(), 
                              username:username ,
                              profilePic:s_tweetsProfilePic,
                              location:s_tweetsProfileLocation.trim(),
                              follower:s_tweetsFollowers,
                              urlLink:'',//s_tweetsUrlLink,
                              userId:s_tweetsUserId
                          } 
                          console.log('output------',output)

                          if (!error && response.statusCode  == 200) {
                              resolve(output);
                          } else {
                              reject(error);
                          }
                          return
                          
                      }
                  
          } catch (e) {
              console.log('Error =>' + e);
          }
          });
  });


}

//console.log('hi-----------',getuserdetails('RajeevR04421638'))

function checkMentionUser(tweets)
{

  let parsedString = tweets.split(' ')
  let parsedStringArray = []

  if(parsedString.length>0)
  {
      for (let index = 0; index < parsedString.length; index++) {

        let element = parsedString[index];
        if(element.startsWith("@"))
        {
          //@sachin_rthttps://pic.twitter.com/ibeqRWTQYV
          element = element.indexOf('https://') != '-1' ? element.split('https://')[0] :element
          element = element.replace(/(?:\r\n|\r|\n)/g, '')
          parsedStringArray.push(element)
        }


      }
  }else if(tweets.startsWith("@"))
  {

    parsedStringArray.push(tweets)

  }

  return parsedStringArray
}

function checkMentionUrl(tweets)
{
      let parsedUrlsArray = []

      var urlRegex = /(https?:\/\/[^\s]+)/g;
       tweets.replace(urlRegex, function(url) {
        parsedUrlsArray.push(url);
      })
     return parsedUrlsArray
}

function convertTimestamptoTime(t) { 
  var dt = new Date(parseInt(t)); 
  var hr = dt.getHours();
  var m = "0" + dt.getMinutes();
  var s = "0" + dt.getSeconds();
  return hr+ ':' + m.substr(-2) + ':' + s.substr(-2);  
 }

module.exports = async function(userdata , bioheadingparams, biourlparams, twitfollower,countFollower ,webhookparams,webhook_idparams,webhook_secretparams) {

  let textedData = userdata.tweets
  let urlDetected = ''
  let inviteUrlDetected = ''

  console.log('userdata---->',userdata)
  //let mentionusersdetails = await getuserdetails('vistocity');

  //console.log('-------------userdetails dddd---------->',mentionusersdetails)

  let mentionurls = checkMentionUrl(textedData)
  console.log('-------------mentionurls---------->',mentionurls)

  if(mentionurls.length > 0 )
  {

    for(let i = 0; i<= mentionurls.length; i++)
    {
      if(mentionurls[i] !== undefined){

        inviteUrlDetected = mentionurls[i].indexOf("discord.gg") > -1 ?
         (mentionurls[i].split("https://discord.gg/"))[1] : '';

         urlDetected = urlDetected +'([t.co]('+mentionurls[i]+')) - ' + mentionurls[i]+ "\n" 

      }
    }
  }

  let mentionusers = checkMentionUser(textedData)
  console.log('-------------mentionusers---------->',mentionusers)

  if(mentionusers.length > 0 )
  {
    textedData = (textedData).replace(/@/g, '')

    for(let i = 0; i<= mentionusers.length; i++)
    {
      //console.log('mentionusers[i]--',mentionusers[i])
      if(mentionusers[i] !== undefined){

       let  screen_name = mentionusers[i].replace('@','')

        textedData = (textedData).replace(screen_name, '[@'+screen_name+'](https://twitter.com/'+screen_name+')')

      }
    }
  }

  //#region tweetdata
  
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
  
  // let webhook = "https://discordapp.com/api/webhooks/687262088564965426/XcssBH5Jj0X2gM_4cNGw7yAVsnt2tfALAKr_L3FkxueZ83H4Oq-HBI1I1__Z3fRuuh-f"
  // let webhook_id = "687262088564965426"
  // let webhook_secret = "XcssBH5Jj0X2gM_4cNGw7yAVsnt2tfALAKr_L3FkxueZ83H4Oq-HBI1I1__Z3fRuuh-f"

  
  let webhook = webhookparams//
   let webhook_id = webhook_idparams//
   let webhook_secret = webhook_secretparams//

   console.log('webhook---',webhook)
   console.log('webhook_id---',webhook_id)
   console.log('webhook_secret---',webhook_secret)

  Hook.login(webhook_id, webhook_secret);

  let opts = ''
  let tweetedFields = []
  let userTweetedFields = []
  let ocrTweetedInfo = []
  var obj = {};
  var tweetTime = '';
  let date = new Date();
  let timestamp = date.getTime();
  tweetTime =  convertTimestamptoTime(timestamp)


  // console.log('inviteUrlDetected---',inviteUrlDetected)

  if(urlDetected == '')
  {
    urlDetected = 'none'
  }


  tweetedFields.push({
    name: 'Detected Urls',
    value: urlDetected,
    inline: false
  },
  {
    name: "Useful Link",
    value: `[[TWEET](https://twitter.com/${userdata.username}/status/${userdata.userId})] - [[PROFILE](https://twitter.com/${userdata.username})] - [[LIKES](https://twitter.com/${userdata.username}/likes)]`,
    inline: false
  });

  let allMentionedUser = [
    {
      author: {
        name: `${userdata.username} - ${userdata.follower} Followers`,
        url: `https://twitter.com/${userdata.username}`,
        icon_url: `${userdata.profilePic}`
      },
      title: `Tweet from @${userdata.username}`,
      url: `https://twitter.com/${userdata.username}/status/${userdata.userId}`,
      thumbnail: {
        url: `${userdata.profilePic}`,
      },
      color: 1768289,
      footer: {
        text: `Twitter Monitor`
      },
      description: textedData,
      fields: tweetedFields ,
      image: {
        url:
          userdata.latestImage !== undefined
            ? userdata.latestImage
            : null
      }
    }

  ]
                          



  if(mentionusers.length > 0 )
  {
    console.log('mentionusers--',mentionusers)



     mentionusers.map( async (mentionuser) => {

      console.log('mentionusers[i]--',mentionuser)
      if(mentionuser !== undefined){

       let  screen_name = mentionuser.replace('@','')

       console.log('screen_name---->',screen_name)

       let urls = `https://twitter.com/${screen_name}?lang=en`

       return new Promise(function (resolve, reject) {

       request({url: urls, pool: separateReqPool}, async function (error, response, body) {
        try {
                  let $ = cheerio.load(body);
            
                //EVERY OTHER TIME

                // console.log('length', $('div.js-tweet-text-container p').length)
                    const s_tweet = $('div.js-tweet-text-container p').eq(0).text();
                    let s_tweetsphoto = $('div.js-adaptive-photo').attr('data-image-url');
                    const s_tweetsurl = $('div.ProfileHeaderCard-url').eq(0).text();
                    const s_tweetsbio = $('div.ProfileHeaderCard p').eq(0).text();
                    const s_tweetsProfilePic = $('div.ProfileCardMini a').attr('href');
                    const s_tweetsProfileLocation = $('div.ProfileHeaderCard-location span').text();
                    let s_tweetsUrlLink = $('.twitter-timeline-link').attr('href');
                    let s_tweetsFollowers = $('.ProfileNav-item--followers a').attr('title');
                    let s_tweetsUserId = $('.js-original-tweet').attr('data-tweet-id');

                    //let urlMention =  await checkMentionUrl(s_tweet)

                    s_tweetsFollowers =  s_tweetsFollowers !== undefined ? s_tweetsFollowers :'0 Followers'

                 //   s_tweetsUrlLink =  urlMention.length>0 ? s_tweetsUrlLink :''
                   
                     var prefix = 'pic.twitter.com';
                     s_tweetsphoto = s_tweet.startsWith(prefix) === true ? s_tweetsphoto :''


                    console.log('----s_tweet----->',s_tweet)
                    console.log('----s_tweetsphoto----->',s_tweetsphoto)
                    console.log('----s_tweetsurl----->',s_tweetsurl)
                    console.log('----s_tweetsbio----->',s_tweetsbio)
                    console.log('----s_tweetsProfilePic----->',s_tweetsProfilePic)
                    console.log('----s_tweetsProfileLocation----->',s_tweetsProfileLocation)
                    console.log('----s_tweetsUrlLink----->',s_tweetsUrlLink)
                    console.log('----s_tweetsFollowers----->',s_tweetsFollowers)
                    console.log('----s_tweetsUserId----->',s_tweetsUserId)

                    //CHECK IF TWEET IS NEWS

                           let tweets   =   s_tweet 
                           let  bioUrl   =   s_tweetsurl.trim() !='' ? s_tweetsurl.trim() : 'none' 
                           let  latestImage   =   s_tweetsphoto 
                           let  bioHeading   =   s_tweetsbio.trim() != '' ? s_tweetsbio.trim() :'none'
                           let  username   =   screen_name 
                           let  profilePic   =   s_tweetsProfilePic
                           let  location   =   s_tweetsProfileLocation.trim() !='' ? s_tweetsProfileLocation.trim():'none'
                           let  follower   =   s_tweetsFollowers
                           let  urlLink   =   ''//s_tweetsUrlLink
                           let  userId   =   s_tweetsUserId
                       

                        let userTweetedFields = []
                         userTweetedFields.push( {
                           name: 'Bio',
                           value: bioHeading,
                           inline: true
                         },
                         {
                           name: 'Link',
                           value: bioUrl != 'none' ? `[http://www.${bioUrl}](http://www.${bioUrl})`:'none',
                           inline: true
                         },
                         {
                           name: 'Location',
                           value: location,
                           inline: true
                         },
                         {
                           name: "Useful Link",
                           value: `[[TWEET](https://twitter.com/${username}/status/${userId})] - [[PROFILE](https://twitter.com/${username})] - [[LIKES](https://twitter.com/${username}/likes)]`,
                           inline: false
                         });
                 
                         date = new Date();
                         timestamp = date.getTime();
                         tweetTime =  convertTimestamptoTime(timestamp)
                        let mentionedUser = []
                        mentionedUser.push(
                           {
                             author: {
                               name: `${username} - ${follower} Followers`,
                               url: `https://twitter.com/${username}`,
                               icon_url: `${profilePic}`
                             },
                             url: `https://twitter.com/${username}/status/${
                               userId
                             }`,
                             thumbnail: {
                               url: `${profilePic}`,
                             },
                             color: 1768289,
                             footer: {
                               text: `Twitter Monitor`
                             },
                             fields:userTweetedFields,
                             image: {
                               url:
                                 latestImage != ''
                                   ? latestImage
                                   : null
                             }
                           })
                           resolve(true)
                           


                        if(webhook.length > 0)
                        {
                              webhook.map( async (weburl) => {

                                        let webhookuserurl = weburl.webhook
                                        
                                        console.log('webhookuserurl----->',webhookuserurl)
                                        console.log('allMentionedUser----->',mentionedUser)

                                        let  optionsMentioneduser = {
                                          url: webhookuserurl,
                                          method: "POST",
                                          headers: headers,
                                          json: {
                                            embeds: mentionedUser
                                          }
                                        };
                                    
                                        await request(optionsMentioneduser);

                              })
                        }


                
        } catch (e) {
            console.log('Error =>' + e);
        }
        });


      })
      }
    })
  }
console.log('allMentionedUser---->',allMentionedUser)


//.................start document reader..........
if(userdata.urlLink.length > 0 )
{

  for(let i = 0; i<= userdata.urlLink.length; i++)
  {
    if(userdata.urlLink[i] !== undefined){

      if(userdata.urlLink[i].indexOf("pastebin.com") > -1 ){ 
        
        let formatedUrlKey = userdata.urlLink[i].split('/')[3]
          
        const methodOptions = {
          method: 'GET',
          headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
          } 
        }
     // https://hastebin.com/raw/qogegutesi
       let resPaste = await fetch(`https://pastebin.com/raw/${formatedUrlKey}`, methodOptions);
       resPaste = await resPaste.text();


        if(webhook.length > 0)
        {
          webhook.map( async (weburl) => {

          let webhookpasteurl = weburl.webhook

          options = {
            url: webhookpasteurl,
            method: "POST",
            headers: headers,
            json: {
              embeds: [
                {
                  author: {
                    name: `${userdata.username} - ${userdata.follower} Followers`,
                    url: `https://twitter.com/${userdata.username}`,
                    icon_url: `${userdata.profilePic}`
                  },
                  title: `Twitter Message from @${userdata.username}`,
                  url: `https://twitter.com/${userdata.username}`,
                  thumbnail: {
                    url: `${userdata.profilePic}`,
                  },
                  color: 1768289,
                  footer: {
                          text: `Twitter Monitor`
                       },
                  description: 'Raw Text Detected',
                  fields: [
                    {
                    name: 'URL',
                    value: urlDetected,
                    inline: false
                  },
                  {
                    name: 'Raw Text',
                    value: resPaste,
                    inline: false
                  }
                ] ,
                  
                }
            
              ],
              "content" : resPaste,
              "allowed_mentions": {
                "parse": ["users", "roles", "everyone"]
              }
            }
          };
      
          await request(options);

          })
        }


       }

      if(userdata.urlLink[i].indexOf("hastebin.com") > -1 ){
        console.log("urldetected---",userdata.urlLink[i])
   
        //https://hastebin.com/qogegutesi
          let formatedUrlKey = userdata.urlLink[i].split('/')[3]
          
          const methodOptions = {
            method: 'GET',
            headers: {
              'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
            } 
          }
       // https://hastebin.com/raw/qogegutesi
         let resHaste = await fetch(`https://hastebin.com/raw/${formatedUrlKey}`, methodOptions);
         resHaste = await resHaste.text();

        console.log('resHaste----',resHaste)

        if(webhook.length > 0)
        {
          webhook.map( async (weburl) => {

          let webhookhasteurl = weburl.webhook
            options = {
            url: webhookhasteurl,
            method: "POST",
            headers: headers,
            json: {
              embeds: [
                {
                  author: {
                    name: `${userdata.username} - ${userdata.follower} Followers`,
                    url: `https://twitter.com/${userdata.username}`,
                    icon_url: `${userdata.profilePic}`
                  },
                  title: `Twitter Message from @${userdata.username}`,
                  url: `https://twitter.com/${userdata.username}/status/${
                    userdata.userId
                  }`,
                  thumbnail: {
                    url: `${userdata.profilePic}`,
                  },
                  color: 1768289,
                  footer: {
                    text: `Twitter Monitor`
                       },
                  description: 'Raw Text Detected',
                  fields: [
                    {
                    name: 'URL',
                    value: urlDetected,
                    inline: false
                  },
                  {
                    name: 'Raw Text',
                    value: resHaste,
                    inline: false
                  }
                ] ,
                  
                }
            
              ],
              "content" : resHaste,
              "allowed_mentions": {
                "parse": ["users", "roles", "everyone"]
              }
            }
          };
          console.log('options --->',options)
      
          await request(options);

          })
        }


      }

      if(userdata.urlLink[i].indexOf("ghostbin.co") > -1 ){
      console.log("urldetected---",userdata.urlLink[i])
 
      //https://ghostbin.co/paste/89mt3
        let formatedUrlKey = userdata.urlLink[i].split('/')[4]
        
        const methodOptions = {
          method: 'GET',
          headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
          } 
        }
     // https://ghostbin.co/paste/89mt3/raw
       let resGhost = await fetch(`https://ghostbin.co/paste/${formatedUrlKey}/raw`, methodOptions);
       resGhost = await resGhost.text();


        if(webhook.length > 0)
        {
          webhook.map( async (weburl) => {

          let webhookghosturl = weburl.webhook
         options = {
          url: webhookghosturl,
          method: "POST",
          headers: headers,
          json: {
            embeds: [
              {
                author: {
                  name: `${userdata.username} - ${userdata.follower} Followers`,
                  url: `https://twitter.com/${userdata.username}`,
                  icon_url: `${userdata.profilePic}`
                },
                title: `Twitter Message from @${userdata.username}`,
                url: `https://twitter.com/${userdata.username}/status/${
                  userdata.userId
                }`,
                thumbnail: {
                  url: `${userdata.profilePic}`,
                },
                color: 1768289,
                footer: {
                  text: `Twitter Monitor`
                     },
                description: 'Raw Text Detected',
                fields: [
                  {
                  name: 'URL',
                  value: urlDetected,
                  inline: false
                },
                {
                  name: 'Raw Text',
                  value: resGhost,
                  inline: false
                }
              ] ,
                
              }
          
            ],
            "content" : resGhost,
            "allowed_mentions": {
              "parse": ["users", "roles", "everyone"]
            }
          }
        };
        console.log('options --->',options)
    
        await request(options);

          })
        }





      }
      let rawgoogletextDetected =''
      //https://docs.google.com/document/d/1qJftys_HW0RuZjWWdiATmjAAXffLxMT-BTrTuW5qvk0/edit?usp=sharing
      if(userdata.urlLink[i].indexOf("docs.google.com") > -1 ){
       // console.log("urldetected---",userdata.urlLink[i])
   

         await fetch(userdata.urlLink[i])
         .then( async res => res.text())
          .then( async json => {

           
              var str = json;
              var startWith = str.indexOf('<meta property="og:description"');
             var endWith = str.indexOf('><meta name="google"');
            // console.log('startWith--->',startWith)
            // console.log('endWith--->',endWith)

             var getValue = str.substring(parseInt(startWith), parseInt(endWith));
            // console.log('getValue--->',getValue)

             var urlpasteBinRegex = /(https?:\/\/[^\s]+)/g;
             getValue.replace(urlpasteBinRegex, function(urlPasteBin) {
               rawgoogletextDetected = rawgoogletextDetected + urlPasteBin+ "\n" 

             })
   
           //console.log('paste bin ------->',rawgoogletextDetected.indexOf('"'))
           rawgoogletextDetected =  rawgoogletextDetected.indexOf('"') > -1 ? rawgoogletextDetected.replace('"',"") : rawgoogletextDetected
      

        if(webhook.length > 0)
        {
          webhook.map( async (weburl) => {

          let webhookgoogleurl = weburl.webhook

           options = {
            url: webhookgoogleurl,
            method: "POST",
            headers: headers,
            json: {
              embeds: [
                {
                  author: {
                    name: `${userdata.username} - ${userdata.follower} Followers`,
                    url: `https://twitter.com/${userdata.username}`,
                    icon_url: `${userdata.profilePic}`
                  },
                  title: `Twitter Message from @${userdata.username}`,
                  url: `https://twitter.com/${userdata.username}`,
                  thumbnail: {
                    url: `${userdata.profilePic}`,
                  },
                  color: 1768289,
                  footer: {
                          text: `Twitter Monitor`
                       },
                  description: 'Raw Text Detected',
                  fields: [
                    {
                    name: 'URL',
                    value: urlDetected,
                    inline: false
                  },
                  {
                    name: 'Raw Text',
                    value: rawgoogletextDetected,
                    inline: false
                  }
                ] ,
                  
                }
            
              ],
              "content" : rawgoogletextDetected,
              "allowed_mentions": {
                "parse": ["users", "roles", "everyone"]
              }
            }
          };
      
          await request(options);

          })
        }




            }
            )
   
       }

       Jimp.read(userdata.urlLink[i], async function(err, image) {

        try {
      
          if (err) {
             // console.error(err);
              // TODO handle error
          }
         // console.log('Jimp--',image)

           qr.callback = async function(err, value) {
              if (err) {
                  console.error(err);
                  // TODO handle error
              }

              if(value!= undefined){

              //  console.log(value.result);
                //console.log('qr value--->',value);
                if(webhook.length > 0)
                {
                  webhook.map( async (weburl) => {

                  let webhookjimpurl = weburl.webhook

                  options = {
                      url: webhookjimpurl,
                      method: "POST",
                      headers: headers,
                      json: {
                      embeds: [
                        {
                          author: {
                            name: `${userdata.username} - ${userdata.follower} Followers`,
                            url: `https://twitter.com/${userdata.username}`,
                            icon_url: `${userdata.profilePic}`
                          },
                          title: `Twitter Message from @${userdata.username}`,
                          url: `https://twitter.com/${userdata.username}/status/${
                            userdata.userId
                          }`,
                          thumbnail: {
                            url: `${userdata.profilePic}`,
                          },
                          color: 1768289,
                          footer: {
                            text: `Twitter Monitor`
                               },
                          description: 'QR Detected',
                          fields: [
                            {
                            name: 'URL',
                            value: urlDetected,
                            inline: false
                          },
                          {
                            name: 'Raw Text',
                            value: value.result,
                            inline: false
                          }
                        ] ,
                          
                        }
                    
                      ]
                    }
                  };
            
                await request(options);

                  })
                }
              }
          };
          if(image!== undefined){
            qr.decode(image.bitmap);
          }
        } catch(e) {
          //console.log(e);
          // [Error: Uh oh!]
      }
      });

    }
  }
}

//.................end document reader..........


//...................start ocr reader .......................
let ocrFields = []
if(userdata.latestImage != ''){

 await Tesseract.recognize(userdata.latestImage).then(result => {
    // Sending OCR Results to Discord
  //  console.log('result.text---->',result.text)

    ocrFields.push( {
      name: 'OCR Parsed Text',
      value: result.text,
      inline: true
    });

    allMentionedUser.push(
      {
        color: 1768289,
        footer: {
          text: `Twitter Monitor`
        },
        fields: ocrFields
      })
    //discord.sendOcr(tweet, result.text, result.confidence);
  })  

}

//...................end ocr reader .......................


//..................start bio change ........................
let twitbioFields = []
let twitbioEmbed = []
if(bioheadingparams!== null){


    twitbioFields.push( {
      name: 'Bio Changed Detected',
      value: bioheadingparams,
      inline: true
    });

    twitbioEmbed.push(
      {
        author: {
          name: `${userdata.username} - ${userdata.follower} Followers`,
          url: `https://twitter.com/${userdata.username}`,
          icon_url: `${userdata.profilePic}`
        },
        thumbnail: {
          url: `${userdata.profilePic}`,
        },
        color: 1768289,
        description:'Twitter Bio Changed Detected',

        footer: {
          text: `Twitter Monitor`
        },
        fields: twitbioFields
      })
  
      
      if(webhook.length > 0)
      {
        webhook.map( async (weburl) => {
    
        let webhookinviteurl = weburl.webhook
          let  optionsInvitedUrlMentioneduser = {
            url: webhookinviteurl,
            method: "POST",
            headers: headers,
            json: {
              embeds: twitbioEmbed
            }
          };
    
          await request(optionsInvitedUrlMentioneduser);
    
        })
      }

}
//..................end bio change ........................

//..................start bio url change ........................

//  twiturl
let biourlparamsFields = []
let biourlparamsEmbed = []
if(biourlparams!== null){


    biourlparamsFields.push( {
      name: 'Bio Changed Detected',
      value: `[${biourlparams}](${biourlparams})`,
      inline: true
    });

    biourlparamsEmbed.push(
      {
        author: {
          name: `${userdata.username} - ${userdata.follower} Followers`,
          url: `https://twitter.com/${userdata.username}`,
          icon_url: `${userdata.profilePic}`
        },
        thumbnail: {
          url: `${userdata.profilePic}`,
        },
        color: 1768289,
        description:'Twitter Bio Url Changed Detected',

        footer: {
          text: `Twitter Monitor`
        },
        fields: biourlparamsFields
      })

      if(webhook.length > 0)
      {
        webhook.map( async (weburl) => {
    
        let webhookinviteurl = weburl.webhook
          let  optionsInvitedUrlMentioneduser = {
            url: webhookinviteurl,
            method: "POST",
            headers: headers,
            json: {
              embeds: biourlparamsEmbed,
              
            }
          };
    
          await request(optionsInvitedUrlMentioneduser);
    
        })
      }


}
//..................end bio url change ........................


//..................start follower change ........................

let twitfollowerFields = []
let twitfollowerEmbed = []
if(twitfollower!== null){


    twitfollowerFields.push({
      name: `${userdata.username} Just Hit ${countFollower} Followers`,
      value: 'Get Ready for restock' ,
      inline: false
    },
    {
      name: "Useful Link",
      value: `[[TWEET](https://twitter.com/${userdata.username}/status/${userdata.userId})] - [[PROFILE](https://twitter.com/${userdata.username})] - [[LIKES](https://twitter.com/${userdata.username}/likes)]`,
      inline: false
    });

    twitfollowerEmbed.push(
      {
        author: {
          name: `${userdata.username} - ${countFollower} Followers`,
          url: `https://twitter.com/${userdata.username}`,
          icon_url: `${userdata.profilePic}`
        },
        thumbnail: {
          url: `${userdata.profilePic}`,
        },
        color: 1768289,
        footer: {
          text: `Twitter Monitor`
        },
        description: 'Follower Count Reached',
        fields: twitfollowerFields ,
      
      }
      )

      if(webhook.length > 0)
      {
        webhook.map( async (weburl) => {
    
        let webhookinviteurl = weburl.webhook
          let  optionsInvitedUrlMentioneduser = {
            url: webhookinviteurl,
            method: "POST",
            headers: headers,
            json: {
              embeds: twitfollowerEmbed
            }
          };
    
          await request(optionsInvitedUrlMentioneduser);
    
        })
      }

}

//..................end follower change ........................

//..................start InviteUrl change ........................


if(inviteUrlDetected != '')
{

  if(webhook.length > 0)
  {
    webhook.map( async (weburl) => {

    let webhookinviteurl = weburl.webhook
      let  optionsInvitedUrlMentioneduser = {
        url: webhookinviteurl,
        method: "POST",
        headers: headers,
        json: {
          embeds: allMentionedUser,
          "content" : "Potential Discord Invite Found : https://discord.gg/"+inviteUrlDetected+"",
          "allowed_mentions": {
            "parse": ["users", "roles", "everyone"]
          }
        }
      };

      await request(optionsInvitedUrlMentioneduser);


    })
  }


    // Hook.setPayload({
    //   "embeds": allMentionedUser,

    // })

//..................end InviteUrl change ........................

}
else if(twitfollower!== null || biourlparams!== null || bioheadingparams!== null){

}
else{

  if(webhook.length > 0)
  {
    webhook.map( async (weburl) => {

    let webhookurl = weburl.webhook

    console.log('weburl--->',webhookurl)
      let  optionsall = {
        url: webhookurl,
        method: "POST",
        headers: headers,
        json: {
          embeds: allMentionedUser
        }
      };

      await request(optionsall);

    })
  }
  // Hook.setPayload({
  //   "embeds": allMentionedUser
  // })

}



  /* Send Webhook */

 
  //  Hook.fire()
  //    .then(response_object => {  })
  //    .catch(error => {
  //    throw error;
  //  })
  
 
  //#endregion tweetdata
//end

};
