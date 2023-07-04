const {socket} = require('../utils/socket')
const {SOCKET_CONSTANTS} = require('../utils/Constants');
const {orderBookWorker} = require('../services/orderBookWorker');
const axios = require('axios');

const dataController={
    saveData: async(req,res)=>{
        try{
            // CHECK FOR AUTHENTICATION
            socket.emit('echo');
            socket.on('echo_successful',(data)=>{
                console.log(data);
            });
	    let worker = 0;
            socket.emit('subscribe_topic_event',SOCKET_CONSTANTS.CRYPTO_TOPIC_ID);
            socket.on(`new_topic_event_${SOCKET_CONSTANTS.CRYPTO_TOPIC_ID}`,async (response)=>{
                console.log(response);
		const data = {
		    EVENT_ID: response.skuDetail.event_id,
		    END_TIME: response.eventDetails.end_date,
		};
		const dataProviderData = {
		    EVENT_ID: response.skuDetail.event_id,
                    END_TIME: response.eventDetails.end_date,
		    TARGET: response.skuDetail.tracking_metadata.target,
		};
                if(worker%4 == 0) {
		    const reply = await axios.post(`http://13.235.235.62:3000/api/dataSavingOrderBook1`, data);
		    console.log(reply.data, worker);
		    const dataProviderReply = await axios.post(`http://13.200.81.116:3000/api/dataSaving1`, dataProviderData);
	    	    console.log(dataProviderReply.data, worker);
		    worker=(worker+1)%4;
		}
		else if(worker%4 == 1) {
		    const reply = await axios.post(`http://3.108.126.32:3000/api/dataSavingOrderBook1`, data);
                    console.log(reply.data, worker);
		    const dataProviderReply = await axios.post(`http://65.0.159.73:3000/api/dataSaving1`, dataProviderData);
                    console.log(dataProviderReply.data, worker);
                    worker=(worker+1)%4;
		} else if(worker%4 == 2) {
		    const reply = await axios.post(`http://43.205.45.225:3000/api/dataSavingOrderBook1`, data);
                    console.log(reply.data, worker);
		    const dataProviderReply = await axios.post(`http://13.200.59.178:3000/api/dataSaving1`, dataProviderData);
                    console.log(dataProviderReply.data, worker);
                    worker=(worker+1)%4;
		} else {
		    const reply = await axios.post(`http://65.0.11.138:3000/api/dataSavingOrderBook1`, data);
                    console.log(reply.data, worker);
		    const dataProviderReply = await axios.post(`http://13.200.56.222:3000/api/dataSaving1`, dataProviderData);
                    console.log(dataProviderReply.data, worker);
                    worker=(worker+1)%4;
		}
            })
	    console.log("Started Saving Event Details");
            res.status(200).json({status: " Working "})
        }catch(err){
	    console.log(err);
            res.status(404).json({status: "error", error: `${err}`})
        }
    },
}




module.exports = {dataController};
