const request = require("request");
const path = require("path");
const twit = require("twit");
const log = require("../logger")("Twitter Monitor V1");
const hookcord = require('hookcord');
const Tesseract = require("tesseract.js");
var QrCode = require('qrcode-reader');
var qr = new QrCode();
const fetch = require('node-fetch');

var Jimp = require("jimp");

const Hook = new hookcord.Hook()
//timestamp_ms
var appDir = path.dirname(require.main.filename);
//console.log('__dirname--',appDir)

const config = require(path.join(appDir, "config.json"));




// twitter configuration
var T = new twit({
  consumer_key: config.app.consumer.key,
  consumer_secret: config.app.consumer.secret,
  access_token: config.app.access.token,
  access_token_secret: config.app.access.secret
});

function test(user) {
 return new Promise((resolve, reject) => {

  T.get("/users/show", { screen_name: user }, (err, data, res) => {
    if (err) {
      reject();
      return log.red("ERROR" + err);
    }
   // console.log('vistocity data--',(data))
    
    
      resolve(data);
    
    });
  }).then(res=> res);

}

function convertTimestamptoTime(t) { 
  var dt = new Date(parseInt(t));
  var hr = dt.getHours();
  var m = "0" + dt.getMinutes();
  var s = "0" + dt.getSeconds();
  return hr+ ':' + m.substr(-2) + ':' + s.substr(-2);  
 }


module.exports = async function(headers, data, config, ocrData,twitbio,twitfollower,twiturl,webhook,webhook_id,webhook_secret) {

  Hook.login(webhook_id, webhook_secret);

  let detectedUrls = data.entities.urls
  let urlDetected = ''
  let opts = ''
  let inviteUrlDetected = ''
  let tweetedFields = []
  let userTweetedFields = []
  let ocrTweetedInfo = []
  var obj = {};
  var tweetTime = '';
  const date = new Date(data.created_at);

  const timestamp = date.getTime();
  
  tweetTime =  convertTimestamptoTime(timestamp)
  
 // tweetTime = timestamp_ms

  //console.log('tweetTime--->',tweetTime)

  //console.log('Got Data---->',data)


  if(detectedUrls.length > 0 )
  {
  
    for(let i = 0; i<= detectedUrls.length; i++)
    {
      //console.log('detectedUrls[i]--',detectedUrls[i])
      //https://discord.gg/XDU3ru
      if(detectedUrls[i] !== undefined){
      //  console.log('detectedUrls  --->',detectedUrls[i])
        inviteUrlDetected = detectedUrls[i].expanded_url.indexOf("discord.gg") > -1 ?
         (detectedUrls[i].expanded_url.split("https://discord.gg/"))[1] : '';

      urlDetected = urlDetected +'([t.co]('+detectedUrls[i].url+')) - ' + detectedUrls[i].expanded_url+ "\n" 
      }
    }
  }

  // console.log('inviteUrlDetected---',inviteUrlDetected)

  if(urlDetected == '')
  {
    urlDetected = 'none'
  }

  let textedData = data.text
 // console.log('data----->',data.entities.user_mentions)
  let mentionUser = data.entities.user_mentions
  if(mentionUser.length > 0 )
  {
    textedData = (textedData).replace(/@/g, '')

    for(let i = 0; i<= mentionUser.length; i++)
    {
      //console.log('mentionUser[i]--',mentionUser[i])
      if(mentionUser[i] !== undefined){

       let  screen_name = mentionUser[i].screen_name

        textedData = (textedData).replace(screen_name, '[@'+screen_name+'](https://twitter.com/'+screen_name+')')

      // console.log('textedData--',textedData)
      }
    }
  }


  tweetedFields.push({
    name: 'Detected Urls',
    value: urlDetected,
    inline: false
  },
  {
    name: "Useful Link",
    value: `[[TWEET](https://twitter.com/compose/tweet)] - [[PROFILE](https://twitter.com/${data.user.screen_name})] - [[LIKES](https://twitter.com/${data.user.screen_name}/likes)]`,
    inline: false
  });

  let allMentionedUser = [
    {
      author: {
        name: `${data.user.screen_name} - ${data.user.followers_count} Followers`,
        url: `https://twitter.com/${data.user.screen_name}`,
        icon_url: `${data.user.profile_image_url}`
      },
      title: `Tweet from @${data.user.screen_name}`,
      url: `https://twitter.com/${data.user.screen_name}/status/${
        data.id_str
      }`,
      thumbnail: {
        url: `${data.user.profile_image_url}`,
      },
      color: 1768289,
      footer: {
        text: `Twitter Monitor - ${tweetTime}`
      },
      description: textedData,
      fields: tweetedFields ,
      image: {
        url:
          data.entities.media !== undefined
            ? data.entities.media[0].media_url
            : null
      }
    }

  ]


  if(mentionUser.length > 0 )
  {
    for(let i = 0; i<= mentionUser.length; i++)
    {
      //console.log('mentionUser[i]--',mentionUser[i])
      if(mentionUser[i] !== undefined){

       let  screen_name = mentionUser[i].screen_name

      //  let textedData = (data.text).replace(screen_name, '['+screen_name+'](https://twitter.com/'+screen_name+')')

      //  console.log('textedData--',textedData)

       let testedUser =   await  test(screen_name).then(values => { 
         //   console.log('values--',values)
            if(values)
            {

            userTweetedFields = []
          //  console.log('values---',values)

            userTweetedFields.push( {
              name: 'Bio',
              value: values.description,
              inline: true
            },
            {
              name: 'Link',
              value: values.url,
              inline: true
            },
            {
              name: 'Location',
              value: values.location,
              inline: true
            },
            {
              name: "Useful Link",
              value: `[[TWEET](https://twitter.com/compose/tweet)] - [[PROFILE](https://twitter.com/${values.screen_name})] - [[LIKES](https://twitter.com/${values.screen_name}/likes)]`,
              inline: false
            });


            allMentionedUser.push(
              
              {
                author: {
                  name: `${values.screen_name} - ${values.followers_count} Followers`,
                  url: `https://twitter.com/${values.screen_name}`,
                  icon_url: `${values.profile_image_url}`
                },
                url: `https://twitter.com/${values.screen_name}/status/${
                  values.id_str
                }`,
                thumbnail: {
                  url: `${values.profile_image_url}`,
                },
                color: 1768289,
                footer: {
                  text: `Twitter Monitor - ${values.created_at}`
                },
                fields:userTweetedFields,
                image: {
                  url:
                    values.entities.media !== undefined
                      ? values.entities.media[0].media_url
                      : null
                }
              }
              
              )
             // console.log('mentionuser---->',allMentionedUser[0].fields )
            }

            }).catch(function () {
              console.log("Promise Rejected");
         }); 
          
          //  console.log('testedUser--',testedUser)
         // console.log('allMentionedUser---',allMentionedUser)
      }
    }
  }

 // console.log('ocrData--->',ocrData)
  let ocrFields = []
  if(ocrData!== null){



   await Tesseract.recognize(ocrData).then(result => {
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
            text: `Twitter Monitor - ${tweetTime}`
          },
          fields: ocrFields
        })
      //discord.sendOcr(tweet, result.text, result.confidence);
    })  

  }

  
  let twitbioFields = []
  if(twitbio!== null){

  
      twitbioFields.push( {
        name: 'Bio Changed Detected',
        value: twitbio,
        inline: true
      });

      allMentionedUser.push(
        {
          color: 1768289,
          description:'Twitter Bio Changed Detected',

          footer: {
            text: `Twitter Monitor - ${tweetTime}`
          },
          fields: twitbioFields
        })
    

  }

//  twiturl
let twiturlFields = []
if(twiturl!== null){


    twiturlFields.push( {
      name: 'Bio Changed Detected',
      value: twiturl,
      inline: true
    });

    allMentionedUser.push(
      {
        color: 1768289,
        description:'Twitter Bio Url Changed Detected',

        footer: {
          text: `Twitter Monitor - ${tweetTime}`
        },
        fields: twiturlFields
      })
  

}

// twitfollower
  


//console.log('allMentionedUser--->',allMentionedUser)
let options ={}

if(detectedUrls.length > 0 )
{
let rawtextDetected = ''
  for(let i = 0; i<= detectedUrls.length; i++)
  {
    //console.log('detectedUrls[i]--',detectedUrls[i])
    //https://discord.gg/XDU3ru
    if(detectedUrls[i] !== undefined){
    //  console.log('detectedUrls  --->',detectedUrls[i].expanded_url)
      if(detectedUrls[i].expanded_url.indexOf("pastebin.com") > -1 ){
        console.log("urldetected---",detectedUrls[i].expanded_url)
   
        
        let formatedUrlKey = detectedUrls[i].expanded_url.split('/')[3]
          
        const methodOptions = {
          method: 'GET',
          headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
          } 
        }
     // https://hastebin.com/raw/qogegutesi
       let resPaste = await fetch(`https://pastebin.com/raw/${formatedUrlKey}`, methodOptions);
       resPaste = await resPaste.text();

        //  await fetch(detectedUrls[i].expanded_url)
        //  .then( async res => res.text())
        //   .then( async json => {

           
        //      console.log('json--->',json)
        //      var str = json;
        //      var startWith = str.indexOf("<title>");
        //      var endWith = str.indexOf("</title>");
          
        //      var getValue = str.substring(startWith, endWith);
   
        //      var urlpasteBinRegex = /(https?:\/\/[^\s]+)/g;
        //      getValue.replace(urlpasteBinRegex, function(urlPasteBin) {
        //        specialUrl.push(urlPasteBin)
        //        rawtextDetected = rawtextDetected + urlPasteBin+ "\n" 

        //      })
   
        //    console.log('paste bin ------->',specialUrl)

        //    let specialUrlText = specialUrl.toString()


           options = {
            url: webhook,
            method: "POST",
            headers: headers,
            json: {
              embeds: [
                {
                  author: {
                    name: `${data.user.screen_name} - ${data.user.followers_count} Followers`,
                    url: `https://twitter.com/${data.user.screen_name}`,
                    icon_url: `${data.user.profile_image_url}`
                  },
                  title: `Twitter Message from @${data.user.screen_name}`,
                  url: `https://twitter.com/${data.user.screen_name}`,
                  thumbnail: {
                    url: `${data.user.profile_image_url}`,
                  },
                  color: 1768289,
                  footer: {
                          text: `Twitter Monitor - ${tweetTime}`
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
       }

       if(detectedUrls[i].expanded_url.indexOf("hastebin.com") > -1 ){
        console.log("urldetected---",detectedUrls[i].expanded_url)
   
        //https://hastebin.com/qogegutesi
          let formatedUrlKey = detectedUrls[i].expanded_url.split('/')[3]
          
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

           options = {
            url: webhook,
            method: "POST",
            headers: headers,
            json: {
              embeds: [
                {
                  author: {
                    name: `${data.user.screen_name} - ${data.user.followers_count} Followers`,
                    url: `https://twitter.com/${data.user.screen_name}`,
                    icon_url: `${data.user.profile_image_url}`
                  },
                  title: `Twitter Message from @${data.user.screen_name}`,
                  url: `https://twitter.com/${data.user.screen_name}/status/${
                    data.id_str
                  }`,
                  thumbnail: {
                    url: `${data.user.profile_image_url}`,
                  },
                  color: 1768289,
                  footer: {
                    text: `Twitter Monitor - ${tweetTime}`
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
    }

    if(detectedUrls[i].expanded_url.indexOf("ghostbin.co") > -1 ){
      console.log("urldetected---",detectedUrls[i].expanded_url)
 
      //https://ghostbin.co/paste/89mt3
        let formatedUrlKey = detectedUrls[i].expanded_url.split('/')[4]
        
        const methodOptions = {
          method: 'GET',
          headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36'
          } 
        }
     // https://ghostbin.co/paste/89mt3/raw
       let resGhost = await fetch(`https://ghostbin.co/paste/${formatedUrlKey}/raw`, methodOptions);
       resGhost = await resGhost.text();

         options = {
          url: webhook,
          method: "POST",
          headers: headers,
          json: {
            embeds: [
              {
                author: {
                  name: `${data.user.screen_name} - ${data.user.followers_count} Followers`,
                  url: `https://twitter.com/${data.user.screen_name}`,
                  icon_url: `${data.user.profile_image_url}`
                },
                title: `Twitter Message from @${data.user.screen_name}`,
                url: `https://twitter.com/${data.user.screen_name}/status/${
                  data.id_str
                }`,
                thumbnail: {
                  url: `${data.user.profile_image_url}`,
                },
                color: 1768289,
                footer: {
                  text: `Twitter Monitor - ${tweetTime}`
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

      }
      let rawgoogletextDetected =''
      //https://docs.google.com/document/d/1qJftys_HW0RuZjWWdiATmjAAXffLxMT-BTrTuW5qvk0/edit?usp=sharing
      if(detectedUrls[i].expanded_url.indexOf("docs.google.com") > -1 ){
       // console.log("urldetected---",detectedUrls[i].expanded_url)
   

         await fetch(detectedUrls[i].expanded_url)
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
           options = {
            url: webhook,
            method: "POST",
            headers: headers,
            json: {
              embeds: [
                {
                  author: {
                    name: `${data.user.screen_name} - ${data.user.followers_count} Followers`,
                    url: `https://twitter.com/${data.user.screen_name}`,
                    icon_url: `${data.user.profile_image_url}`
                  },
                  title: `Twitter Message from @${data.user.screen_name}`,
                  url: `https://twitter.com/${data.user.screen_name}`,
                  thumbnail: {
                    url: `${data.user.profile_image_url}`,
                  },
                  color: 1768289,
                  footer: {
                          text: `Twitter Monitor - ${tweetTime}`
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


            }
            )
   
       }

       Jimp.read(detectedUrls[i].expanded_url, async function(err, image) {

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

                options = {
                    url: webhook,
                    method: "POST",
                    headers: headers,
                    json: {
                    embeds: [
                      {
                        author: {
                          name: `${data.user.screen_name} - ${data.user.followers_count} Followers`,
                          url: `https://twitter.com/${data.user.screen_name}`,
                          icon_url: `${data.user.profile_image_url}`
                        },
                        title: `Twitter Message from @${data.user.screen_name}`,
                        url: `https://twitter.com/${data.user.screen_name}/status/${
                          data.id_str
                        }`,
                        thumbnail: {
                          url: `${data.user.profile_image_url}`,
                        },
                        color: 1768289,
                        footer: {
                          text: `Twitter Monitor - ${tweetTime}`
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
            //    console.log('options --->',options)
            
                await request(options);

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


let twitfollowerFields = []
if(twitfollower!== null){


    twitfollowerFields.push({
      name: `${data.user.screen_name} Just Hit ${data.user.followers_count} Followers`,
      value: 'Get Ready for restock' ,
      inline: false
    },
    {
      name: "Useful Link",
      value: `[[TWEET](https://twitter.com/compose/tweet)] - [[PROFILE](https://twitter.com/${data.user.screen_name})] - [[LIKES](https://twitter.com/${data.user.screen_name}/likes)]`,
      inline: false
    });

    allMentionedUser = [(
      {
        author: {
          name: `${data.user.screen_name} - ${data.user.followers_count} Followers`,
          url: `https://twitter.com/${data.user.screen_name}`,
          icon_url: `${data.user.profile_image_url}`
        },
        title: `Tweet from @${data.user.screen_name}`,
        url: `https://twitter.com/${data.user.screen_name}/status/${
          data.id_str
        }`,
        thumbnail: {
          url: `${data.user.profile_image_url}`,
        },
        color: 1768289,
        footer: {
          text: `Twitter Monitor - ${tweetTime}`
        },
        description: 'Follower Count Reached',
        fields: twitfollowerFields ,
        image: {
          url:
            data.entities.media !== undefined
              ? data.entities.media[0].media_url
              : null
        }
      }
      )]

}

 if(inviteUrlDetected != '')
  {

      //  opts = {
      //   url: webhook,
      //   method: "POST",
      //   headers: headers,
      //   json: {
      //     embeds: allMentionedUser,
      //     content : "Potential Discord Invite Found : https://discord.gg/"+inviteUrlDetected+"",
      //     "allowed_mentions": {
      //       "parse": ["users", "roles", "everyone"]
      //     }
      //   }
      // };

      Hook.setPayload({
        "embeds": allMentionedUser,
        "content" : "Potential Discord Invite Found : https://discord.gg/"+inviteUrlDetected+"",
        "allowed_mentions": {
          "parse": ["users", "roles", "everyone"]
        }
      })

  }else{

    //  opts = {
    //   url: webhook,
    //   method: "POST",
    //   headers: headers,
    //   json: {
    //     embeds: allMentionedUser
    //   }
    // };

    Hook.setPayload({
      "embeds": allMentionedUser
    })

  }

  /* Send Webhook */


  Hook.fire()
    .then(response_object => {  })
    .catch(error => {
      throw error;
    })


  // request(opts);
};
//allMentionedUser