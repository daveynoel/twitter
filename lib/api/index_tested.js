var requestp = require('request-promise');
const twit = require("twit");

/**
 *
 * @param {String} user - Username or Email for login
 * @param {String} pass - Password for login
 * 161436411624997 562529301027258
 */


const scrapeUser = async (username,token,secret,accesstoken,accesssecret) => {

        let consumer_key = token
        let consumer_secret = secret
        let access_key = accesstoken
        let access_secret = accesssecret

        
        var T = new twit({
          consumer_key: consumer_key,
          consumer_secret: consumer_secret,
          access_token: access_key,
          access_token_secret: access_secret
        });

        var params = {screen_name: username,  count: 200, tweet_mode: 'extended'};

        return new Promise( (resolve, reject) => {  
          
              T.get('statuses/user_timeline', params, function(error, tweets, response) {

                    if (!error) {

                    //  console.log('tweets-->',tweets);
                      resolve(tweets)
                      if(username == 'rajeevr04421638')
                      {
                        console.log('tweets.entities------>',tweets[0])
                        // let userUrl = ''
                        // if(tweets[0].user.url !== null)
                        // {
                        //   userUrl =tweets[0].user.entities.url.urls[0].expanded_url
                        //   console.log('tweets.entities------>',userUrl)
                        // }
                        

                        //expanded_url
                        
                      }
                      // return tweets
                    }else{
                      reject(error)

                    }
              });
            
        })

};



/**
 *
 * @param {array} body - Must be an array of body response
 */
const scrapeUserData = async tweets => {
  const data = [];

  // get user data
 
  let biourl  = ''
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
    tweets      : tweets[0].full_text, 
    bioUrl      : biourl, 
    latestImage : latestImage,//tweets[0].s_tweetsphoto, 
    bioHeading  : tweets[0].user.description, 
    username    : tweets[0].user.screen_name ,
    profilePic  : tweets[0].user.profile_image_url,
    location    : tweets[0].user.location,
    follower    : tweets[0].user.followers_count,
    urlLink     : urllink,//tweets[0].s_tweets[0]UrlLink,
    userId      : tweets[0].user.id,
    id_str      : tweets[0].id_str
    
   }

   //console.log('testuserTimelineStatus--->',testuserTimelineStatus)

  return testuserTimelineStatus;
};



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