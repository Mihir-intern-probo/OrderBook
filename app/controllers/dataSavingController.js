const {socket} = require('../utils/socket')
const {SOCKET_CONSTANTS} = require('../utils/Constants');
const {orderBookWorker} = require('../services/orderBookWorker');
const {client} = require('../utils/redis.js');
const moment = require('moment');
const { exec } = require('child_process');

const dataController={
    saveData: async(req,res)=>{
        try{
            // CHECK FOR AUTHENTICATION
            socket.emit('echo');
            socket.on('echo_successful',(data)=>{
                console.log(data);
            })
            socket.emit('subscribe_orderbook', req.body.EVENT_ID); 
            socket.on(`event_orderbook_${req.body.EVENT_ID}`,async (response)=>{ 
            try{
                client.set(`bap_yes_price_${req.body.EVENT_ID}`, JSON.stringify((response.BUY[0].price)), 'EX', 25 * 60);
                client.set(`bap_yes_quantity_${req.body.EVENT_ID}`,JSON.stringify((response.BUY)[0].quantity), 'EX', 25 * 60);
                client.set(`bap_no_price_${req.body.EVENT_ID}`,JSON.stringify((response.SELL)[0].price), 'EX', 25 * 60);
                client.set(`bap_no_quantity_${req.body.EVENT_ID}`,JSON.stringify((response.SELL)[0].quantity), 'EX', 25 * 60);
                client.set(`end_time_${req.body.EVENT_ID}`, JSON.stringify((req.body.END_TIME)), 'EX', 15 * 60);
                const currentDate = new Date().toJSON();
		console.log(req.body.END_TIME, moment(req.body.END_TIME).unix(), currentDate, moment(currentDate).unix());
                if(moment(req.body.END_TIME).unix() <= moment(currentDate).unix()+10){
		    console.log('Terminating');
		    const command = 'pm2 restart 0';
		    exec(command, (error, stdout, stderr) => {
  			if (error) {
    			    console.error(`Error executing command: ${error.message}`);
    			    return;
  			}
  			if (stderr) {
    			    console.error(`Command execution returned an error: ${stderr}`);
    			    return;
  			}
  			console.log(`Command output:\n${stdout}`);
			});
                    socket.emit(`unsubscribe_orderbook`,req.body.EVENT_ID);
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
