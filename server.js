var io = require('socket.io-client')
var mongoose = require('mongoose')
const twitterSchema = require("./schema/twitter");

mongoose.Promise = global.Promise;
var socket = io.connect('http://localhost:4001')


    let arr = [0] 

    arr.map(  async (val) => {

           let twitterDetails =  await twitterSchema.find({"webhook.0": { "$exists": true }}).sort({name:-1})
            //console.log('twitterDetails--',twitterDetails)
           if(twitterDetails.length > 0)
           {
               for (let index = 0; index < twitterDetails.length; index++) {                  
                    
                    let username = twitterDetails[index].name;

                    socket.on('FromTwitAPI'+username, (data) => {
                            
                        console.log('Received data:--',data)
                    
                    })
                }
            }
    })


//     class Task
//     {

//         constructor(user)
//         {
//             this.user = user
//         }

//         async twit()
//         {
       
//            let twitterDetails =  await twitterSchema.find({"webhook.0": { "$exists": true }}).sort({name:-1})
//             //console.log('twitterDetails--',twitterDetails)
//            if(twitterDetails.length > 0)
//            {
//                for (let index = 0; index < twitterDetails.length; index++) {                  
                    
//                     let username = twitterDetails[index].name;
//                     //console.log('Received username:--',username)
            
//                     socket.on('welcome'+username, (data) => {
            
//                         console.log('Received data:--',data)
            
//                     }
//                     )
//             }
       
//            }
//        }

//     }

// module.exports = Task