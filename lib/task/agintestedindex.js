
var logger = require('../logger');
const twitterSchema = require("../../schema/twitter");
var path = require('path');
var OAuth2 = require('oauth').OAuth2; 
var https = require('https');
const notify = require("../notify/index");
var { scrapeUser, scrapeUserData } =require('../api');
var CronJob = require('cron').CronJob;

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
    this._biourl = [];
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
      let that = this
      var job = new CronJob('*/4 * * * * *', async function() {

            if (!that._postsResult) 
            {

                    // get result of the user account
                    console.log('twitternamefilepath.token.length--->',twitternamefilepath.token.length)
                    console.log('that._starttokenindex--->',that._starttokenindex)

                    if(twitternamefilepath.token.length === that._starttokenindex )
                    {
                      that._starttokenindex = 0;
                    }

                    let token       =  twitternamefilepath.token[that._starttokenindex]
                    let secret      =  twitternamefilepath.secret[that._starttokenindex]
                    let accesstoken =  twitternamefilepath.accessToken[that._starttokenindex]
                    let accesssecret=  twitternamefilepath.accessSecret[that._starttokenindex]
              
                    let result = await scrapeUser(that._user,token,secret,accesstoken,accesssecret);
                  //  console.log(' scrapeUserData result initial----->',result)
                 // console.log('result--',result)

                    // check for result
                    if (result) {
                        // get post data
                        let data = await scrapeUserData(result);
                        
                        // get all postid
                        let getIds = data.id_str;
                        let bioUrl = data.bioUrl;
                        // only push ids if ids array is empty
                        if (that._ids.length === 0) that._ids.push(getIds);

                        if (that._biourl.length === 0) that._biourl.push(bioUrl);

                        

                      that._postsResult = true;
                      that._log.green('Initial Check Completed!');
                    } else if (!result) {

                      await that.restart(that._starttokenindex +1 );

                    }
                    
                    that._starttokenindex++
            }else{

                  that._log.green('final Check Completed!');
                  console.log('twitternamefilepath.token.length--->',twitternamefilepath.token.length)
                  console.log('that._starttokenindex--->',that._starttokenindex)

                  if(twitternamefilepath.token.length === that._starttokenindex)
                  {
                    that._starttokenindex = 0;
                  }else{
                  }

                  that._starttokenindex = that._starttokenindex == (twitternamefilepath.token.length +1)
                                           ? twitternamefilepath.token.length-1 : that._starttokenindex

                  let token       =  twitternamefilepath.token[that._starttokenindex]
                  let secret      =  twitternamefilepath.secret[that._starttokenindex]
                  let accesstoken =  twitternamefilepath.accessToken[that._starttokenindex]
                  let accesssecret=  twitternamefilepath.accessSecret[that._starttokenindex]
            
                  let tweets = await scrapeUser(that._user,token,secret,accesstoken,accesssecret);
                   if (!tweets) {

                    await that.restart(that._starttokenindex +1 );

                  }
                  //console.log('tweets--',tweets)
                  //if(tweets)


                  let data = await scrapeUserData(tweets);
      
                  //console.log(' scrapeUserData tweets initial----->',data)
                  let getIds = [data.id_str];

                  let getBioUrl = [data.bioUrl];

                  // filter the new ids if new ids doesn't exist in ids array
                  let newIds    = getIds.filter(id => that._ids.indexOf(id) == -1);

                  //let newBioUrl = getBioUrl.filter(biourlid => that._biourl.indexOf(biourlid) == -1);

                  let twitterDetails = await twitterSchema.findOne({name:that._user})
                  // console.log('twitterDetails--',twitterDetails)
                     if(twitterDetails !== null)
                     {
                       let webhook = twitterDetails.webhook
                       let webhook_id =twitterDetails.webhook_id
                       let webhook_secret = twitterDetails.webhook_secret
                       let twitstartbiostatus = twitterDetails.twitstartbiostatus
                       let twitstartbiourlstatus = twitterDetails.twitstartbiourlstatus
                       //check in discord for twittermonitors name in  collection for bio monitoring
                       if((data.bioHeading != twitterDetails.twitbio) )
                       {
                       
                         if(twitstartbiostatus === false)
                         {

                             await twitterSchema.updateOne({name:that._user}, { twitbio: data.bioHeading, twitstartbiostatus : true});
                             
                         }else{

                             await twitterSchema.updateOne({name:that._user}, { twitbio: data.bioHeading, twitstartbiostatus : true});
                      
                             notify(data, data.bioHeading,null,null,null,webhook,webhook_id,webhook_secret);
                         }

 
                       }
                       //twiturl
                       if(data.bioUrl != twitterDetails.twiturl)
                       {

                         if(twitstartbiourlstatus === false)
                         {

                             await twitterSchema.updateOne({name:that._user}, { twiturl: data.bioUrl , twitstartbiourlstatus : true});
                             
                         }else{


                             await twitterSchema.updateOne({name:that._user}, { twiturl: data.bioUrl , twitstartbiourlstatus : true});
                             notify(data, null, data.bioUrl, null,null,webhook,webhook_id,webhook_secret);

                         }
 
 
                       }
 
                      // console.log('userTimelineStatus[0].user.followers_count--',userTimelineStatus[0].user)
                       if(
                         (parseInt(data.follower) > parseInt(twitterDetails.twitfollower))
                         &&
                         (twitterDetails.twitfollowerckeck === true)
                         )
                       {
                         await twitterSchema.updateOne({name:that._user}, { twitfollowerckeck: false});
                         notify(data, null, null, 'twitfollower',data.follower,webhook,webhook_id,webhook_secret);
 
                       }
                     }



                 // console.log('getIds---->',getIds)
                  //console.log('that._ids---->',that._ids)
                 // console.log('newIds---->',newIds)
                  that._starttokenindex++

                  if (newIds.length > 0) {

                         that._ids = [...that._ids, ...newIds];

                        let twitterDetails = await twitterSchema.findOne({name:that._user})
                         //  console.log('twitterDetails--',twitterDetails)
                        if(twitterDetails !== null)
                        {
                          let webhook = twitterDetails.webhook
                          let webhook_id =twitterDetails.webhook_id
                          let webhook_secret = twitterDetails.webhook_secret

                          notify(data, null, null, null, null ,webhook,webhook_id,webhook_secret)

                        }

                      
                        // console.log(' Got New Tweets ----->',data)

                    }

            }


//#region
            // { created_at: 'Mon May 04 19:19:40 +0000 2020',
            // id: 1257389447169147000,
            // id_str: '1257389447169146882',
            // text: 'https://t.co/Gnc0TzYoYB',
            // truncated: false,
            // entities:
            //  { hashtags: [],
            //    symbols: [],
            //    user_mentions: [],
            //    urls: [],
            //    media: [Array] },
            // extended_entities: { media: [Array] },
            // source: '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>',
            // in_reply_to_status_id: null,
            // in_reply_to_status_id_str: null,
            // in_reply_to_user_id: null,
            // in_reply_to_user_id_str: null,
            // in_reply_to_screen_name: null,
            // user:
            //  { id: 1017564953010737200,
            //    id_str: '1017564953010737152',
            //    name: 'scottbotv1',
            //    screen_name: 'scottbotv1',
            //    location: 'Sold out / $200',
            //    description: 'The #1 quinceañera dress software, easily automating the checkout process.\n\nSupport for Windows + macOS',
            //    url: 'https://t.co/xQIP31CKoR',
            //    entities: [Object],
            //    protected: false,
            //    followers_count: 23316,
            //    friends_count: 1,
            //    listed_count: 33,
            //    created_at: 'Fri Jul 13 00:22:45 +0000 2018',
            //    favourites_count: 704,
            //    utc_offset: null,
            //    time_zone: null,
            //    geo_enabled: false,
            //    verified: false,
            //    statuses_count: 2271,
            //    lang: null,
            //    contributors_enabled: false,
            //    is_translator: false,
            //    is_translation_enabled: false,
            //    profile_background_color: '000000',
            //    profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
            //    profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
            //    profile_background_tile: false,
            //    profile_image_url: 'http://pbs.twimg.com/profile_images/1170885992359845893/t-W3wvPc_normal.jpg',
            //    profile_image_url_https: 'https://pbs.twimg.com/profile_images/1170885992359845893/t-W3wvPc_normal.jpg',
            //    profile_banner_url: 'https://pbs.twimg.com/profile_banners/1017564953010737152/1575758696',
            //  }
            // geo: null,
            // coordinates: null,
            // place: null,
            // contributors: null,
            // is_quote_status: false,
            // retweet_count: 2,
            // favorite_count: 42,
            // favorited: false,
            // retweeted: false,
            // possibly_sensitive: false,
            // lang: 'und' },
//#endregion




      }, null, true, 'America/Los_Angeles');

      job.start();

  }

  async implementAccessToken(oathToken,oathSecret) {


  }
  
  async restart(starttokenindex) {
    this._log.red('Restarting task...');
    console.log('start token index', starttokenindex)
    var that = this;
    setTimeout(function() {
      that.start();
    }, 5000);
  }
}

module.exports =  Task;
