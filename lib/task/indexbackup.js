
var logger = require('../logger');
const twitterSchema = require("../../schema/twitter");
var path = require('path');
var OAuth2 = require('oauth').OAuth2; 
var https = require('https');
const notify = require("../notify");

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
        // choose a random proxies per account
                
        //#region start task

        //  let oathToken = twitternamefilepath.token[index]
        //  let oathSecret = twitternamefilepath.secret[index]

        console.log('this._intervalCount--->',this._intervalCount)
        let initialStartToken = this._starttokenindex
        var that = this;

        if(this._intervalCount >30)
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

                console.log('username----',username)

                // curl --request POST 
                // --url 'https://api.twitter.com/1.1/friendships/create.json?user_id=2244994945&follow=true' 
                // --header 'authorization: OAuth oauth_consumer_key="YOUR_CONSUMER_KEY", oauth_nonce="AUTO_GENERATED_NONCE", oauth_signature="AUTO_GENERATED_SIGNATURE", oauth_signature_method="HMAC-SHA1", oauth_timestamp="AUTO_GENERATED_TIMESTAMP", oauth_token="USERS_ACCESS_TOKEN", oauth_version="1.0"' 
                // --header 'content-type: application/json'
                
                //add followers
                console.log('isstart----',isstart)
           

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
                      await that.restart(parseInt(initialStartToken)+1)
                      
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
                    console.log('hi interval4')

                    let  userTimelineStatus = tweets

                 // let twitterDetails = await twitterSchema.findOne({name:username})
          let twitterDetails =  await twitterSchema.findOne({"webhook.0": { "$exists": true },name:username}).sort({name:-1})

                //  console.log('twitterDetails--',twitterDetails)
                if(twitterDetails !== null)
                {

                  let webhook = twitterDetails.webhook
                  console.log('webhook----->',webhook)
                  let webhook_id =twitterDetails.webhook_id
                  let webhook_secret = twitterDetails.webhook_secret
                  //check in discord for twittermonitors name in  collection for bio monitoring
                  if(userTimelineStatus[0].user.description !== twitterDetails.twitbio)
                  {

                    await twitterSchema.updateOne({name:username}, { twitbio: userTimelineStatus[0].user.description});
                    notify(headers, userTimelineStatus[0], config, null,
                       userTimelineStatus[0].user.description,null,null,webhook,webhook_id,webhook_secret);

                  }
                  //twiturl
                  if(userTimelineStatus[0].user.url !== twitterDetails.twiturl)
                  {

                    await twitterSchema.updateOne({name:username}, { twiturl: userTimelineStatus[0].user.url});
                    notify(headers, userTimelineStatus[0], config, null, null,
                      null,userTimelineStatus[0].user.url,webhook,webhook_id,webhook_secret);

                  }

                 // console.log('userTimelineStatus[0].user.followers_count--',userTimelineStatus[0].user)
                  if(
                    (parseInt(userTimelineStatus[0].user.followers_count) > parseInt(twitterDetails.twitfollower))
                    &&
                    (twitterDetails.twitfollowerckeck === true)
                    )
                  {

                    await twitterSchema.updateOne({name:username}, { twitfollowerckeck: false});
                    notify(headers, userTimelineStatus[0], config, null, null,
                      'twitfollower',null,webhook,webhook_id,webhook_secret);

                  }


                  if(twitterDetails.twitid !== userTimelineStatus[0].id_str)
                  {
                  // console.log('userTimelineStatus[0]  ------',userTimelineStatus[0])

                  if (userTimelineStatus[0].entities.media) {
                    notify(headers, userTimelineStatus[0], config, userTimelineStatus[0].entities.media[0].media_url,null,
                      null,null,webhook,webhook_id,webhook_secret);

                  }else{

                      notify(headers, userTimelineStatus[0], config,null,null,null,null,webhook,webhook_id,webhook_secret);

                  }
                    await twitterSchema.updateOne({name:username}, { twitid: userTimelineStatus[0].id_str });

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
      10000
    );

    f();
  }

  async implementAccessToken(oathToken,oathSecret) {


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
