
var logger = require('../logger');
const twitterSchema = require("../../schema/twitter");
var path = require('path');
var OAuth2 = require('OAuth').OAuth2; 
var https = require('https');
const notify = require("../notify/index45");

console.log('__dirname--->',__dirname)
var appDir = path.dirname(require.main.filename);
const config = require(path.join(appDir, "config.json"));
console.log('config--->',config)
const twitternamefilepath = require(path.join(appDir, "backuptwittername.json"));
//const querystring = require('querystring');

// var postData = querystring.stringify({
//     'msg' : 'Hello World!'
// });




class Task {
  constructor(config, user, proxies) {
    this._config = config;
    this._proxies = proxies;
    this._user = user;
    this._log = logger(user);
    this._ids = [];
    this._intv = null;
    this._intervalCount = 0;
    this._starttokenindex = 0;
    this._postsResult = false;
  }

  async start(starttoken,startsecret,isstart) {
    this._log.green(`Started task!`);

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

    let f;
    this._intv = setInterval(
      (f = async () => {
        let initialStartToken = this._starttokenindex
        var that = this;

        console.log('this._intervalCount--->',this._intervalCount)
        if(this._intervalCount >10)
        {
            this._intervalCount = 0
            if(isstart === true){
              this._starttokenindex = 1
            }

            await this.restart(this._starttokenindex)

            this._starttokenindex++

        }

        let oathToken = starttoken//'569ixyNTIQpqbvGGmnlX00UBQ'
        let oathSecret = startsecret//'hw5MYAH1caHuFq3AsZMI7bmW7CV1EZ2mRXJ4sJWDp78HLi2cdm'
        //console.log('this._user----',this._user)
        let username  = this._user

        //console.log('hi oathToken--',oathToken)
        // console.log('hi oathSecret--',oathSecret)

        let oauth2 = new OAuth2(oathToken, oathSecret, 'https://api.twitter.com/', null, 'oauth2/token', null);
       // console.log('hi oauth2--',oauth2)
        await oauth2.getOAuthAccessToken('', { 'grant_type': 'client_credentials'
            }, async function (e, access_token) {
                console.log('access_token--->',access_token); //string that we can use to authenticate request

                var optionP = {
                  hostname: 'api.twitter.com',
                  path: '/1.1/statuses/user_timeline.json?screen_name='+username+'&count=1',
                  headers: {  Authorization: 'Bearer ' + access_token    }
                };
              //  console.log('name---',optionP)
                await https.get(optionP, async function (result) {
                  var buffer = '';
                  console.log("statusCode: ", result.statusCode);

                  if(result.statusCode !== 200)
                  {
                    //isaccess

                  //  await restart(oathTokenRestart,oathSecretRestart);
                      await that.restart(parseInt(that._starttokenindex)+1)
                      
                    return false
                  }
                  result.setEncoding('utf8');

                  result.on('data', function (data) {
                      buffer += data;
                  });

                  result.on('end', async function () {
                      var tweets = JSON.parse(buffer);
                    // console.log('tweets---',tweets)
                    // console.log(tweets); // the tweets!
                   // console.log('tweets data----------->',tweets)

                    let  userTimelineStatus = tweets
                    //console.log('user ---->',tweets[0].entities.user_mentions)
                    // user_mentions: [],
                    // urls: [ [Object] ] },
                    //console.log('user url---->',tweets[0].user.entities.url)
                    let biourl  = ''
                    if(tweets[0].user.entities.url !== undefined)
                    {
                      biourl  = tweets[0].user.entities.url.urls[0].expanded_url
                    }
                   // console.log('user---->',tweets[0].user.entities.url.urls[0].expanded_url)

                    let testuserTimelineStatus =  
                    { 
                      tweets      : tweets[0].text, 
                      bioUrl      : biourl, 
                      latestImage : '',//tweets[0].s_tweetsphoto, 
                      bioHeading  : tweets[0].user.description, 
                      username    : tweets[0].user.screen_name ,
                      profilePic  : tweets[0].user.profile_image_url,
                      location    : tweets[0].user.location,
                      follower    : tweets[0].user.followers_count,
                      urlLink     : '',//tweets[0].s_tweets[0]UrlLink,
                      userId      : tweets[0].user.id
                     }

                    console.log('username---->',username)


                  let twitterDetails = await twitterSchema.findOne({name:username})
                //  console.log('twitterDetails--',twitterDetails)
                    if(twitterDetails !== null)
                    {
                      let webhook = twitterDetails.webhook
                      let webhook_id =twitterDetails.webhook_id
                      let webhook_secret = twitterDetails.webhook_secret
                      //check in discord for twittermonitors name in  collection for bio monitoring
                      // if(userTimelineStatus[0].user.description !== twitterDetails.twitbio)
                      // {

                      //   await twitterSchema.updateOne({name:username}, { twitbio: userTimelineStatus[0].user.description});
                      //   notify(headers, userTimelineStatus[0], config, null,
                      //      userTimelineStatus[0].user.description,null,null,webhook,webhook_id,webhook_secret);

                      // }
                      //twiturl
                      // if(userTimelineStatus[0].user.url !== twitterDetails.twiturl)
                      // {

                      //  // await twitterSchema.updateOne({name:username}, { twiturl: userTimelineStatus[0].user.url});
                      //   await twitterSchema.updateOne({name:th_name}, { twiturl: userTimelineStatus[0].user.url , twitstartbiourlstatus : true});
                     
                      //   notify(testuserTimelineStatus, null, userTimelineStatus[0].user.url, null,null,webhook,webhook_id,webhook_secret);


                      // }

                     // console.log('userTimelineStatus[0].user.followers_count--',userTimelineStatus[0].user)
                      // if(
                      //   (parseInt(userTimelineStatus[0].user.followers_count) > parseInt(twitterDetails.twitfollower))
                      //   &&
                      //   (twitterDetails.twitfollowerckeck === true)
                      //   )
                      // {

                      //   await twitterSchema.updateOne({name:username}, { twitfollowerckeck: false});
                      //   notify(headers, userTimelineStatus[0], config, null, null,
                      //     'twitfollower',null,webhook,webhook_id,webhook_secret);

                      // }


                      if(twitterDetails.twitid !== userTimelineStatus[0].id_str)
                      {
                      // console.log('userTimelineStatus[0]  ------',userTimelineStatus[0])

                      // if (userTimelineStatus[0].entities.media) {
                      //   notify(headers, userTimelineStatus[0], config, userTimelineStatus[0].entities.media[0].media_url,null,
                      //     null,null,webhook,webhook_id,webhook_secret);

                      // }else{

                      //     notify(headers, userTimelineStatus[0], config,null,null,null,null,webhook,webhook_id,webhook_secret);

                      // }
                      //   await twitterSchema.updateOne({name:username}, { twitid: userTimelineStatus[0].id_str });


                        await twitterSchema.updateOne({name:username}, { twitid: userTimelineStatus[0].id_str });
                        notify(testuserTimelineStatus, null, null, null, null ,webhook,webhook_id,webhook_secret)


                      }
                    }
                  });
                  })
              //  }
            // }
              

          });


        //#endregion stop task
        this._intervalCount++;

      }),
      3000
    );

    f();
  }

  async implementAccessToken(oathToken,oathSecret) {


  }
  
  async restart(starttokenindex) {
    this._log.red('Restarting task...');
    console.log('start token index', starttokenindex)

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
