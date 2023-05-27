const {socket} = require('../utils/socket')
const {SOCKET_CONSTANTS} = require('../utils/Constants');
const {orderBookWorker} = require('../services/orderBookWorker');
const {client} = require('../utils/redis.js');
const moment = require('moment');

const dataController={
    saveData: async(req,res)=>{
        try{
            // CHECK FOR AUTHENTICATION
            socket.emit('echo');
            socket.on('echo_successful',(data)=>{
                console.log(data);
            })
            socket.emit('subscribe_orderbook', req.query.EVENT_ID); 
            socket.on(`event_orderbook_${req.query.EVENT_ID}`,async (response)=>{ 
            try{
                client.set(`bap_yes_price_${req.query.EVENT_ID}`, JSON.stringify((response.BUY[0].price)), 'EX', 25 * 60);
                client.set(`bap_yes_quantity_${req.query.EVENT_ID}`,JSON.stringify((response.BUY)[0].quantity), 'EX', 25 * 60);
                client.set(`bap_no_price_${req.query.EVENT_ID}`,JSON.stringify((response.SELL)[0].price), 'EX', 25 * 60);
                client.set(`bap_no_quantity_${req.query.EVENT_ID}`,JSON.stringify((response.SELL)[0].quantity), 'EX', 25 * 60);
                client.set(`end_time_${req.query.EVENT_ID}`, JSON.stringify((req.query.END_TIME)), 'EX', 15 * 60);
                const currentDate = new Date().toJSON();
                if(moment(req.query.END_TIME).unix() <= moment(currentDate).unix()-10){
                    socket.emit(`unsubscribe_orderbook_${req.query.EVENT_ID}`);
                }
	    }catch(err){
                console.log("Error: ", err);
            }
        })

	    console.log("Started Saving Event Details");
            res.status(200).json({status: " Working "})
        }catch(err){
            res.status(404).json({status: "error", error: `${err}`})
        }
    },
}




module.exports = {dataController};
