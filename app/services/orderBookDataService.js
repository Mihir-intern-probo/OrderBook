
const moment = require('moment');
const { workerData } = require('worker_threads');
const {client} = require('../utils/redis')
const formatDate = require('../utils/date');
const {socket} = require('../utils/socket');
let loop;

const recordorderBookData = async(EVENT_ID, END_TIME) => {
    try {
        socket.emit('subscribe_orderbook', EVENT_ID); 
        socket.on(`event_orderbook_${EVENT_ID}`,async (response)=>{ 
            try{
                await client.set(`bap_yes_price_${EVENT_ID}`, JSON.stringify((response.BUY[0].price)), 'EX', 25 * 60);
                await client.set(`bap_yes_quantity_${EVENT_ID}`,JSON.stringify((response.BUY)[0].quantity), 'EX', 25 * 60);
                await client.set(`bap_no_price_${EVENT_ID}`,JSON.stringify((response.SELL)[0].price), 'EX', 25 * 60);
                await client.set(`bap_no_quantity_${EVENT_ID}`,JSON.stringify((response.SELL)[0].quantity), 'EX', 25 * 60);
                await client.set(`end_time_${EVENT_ID}`, JSON.stringify((END_TIME)), 'EX', 15 * 60);
                console.log(response);
	    }catch(err){
                console.log("Error: ", err);
            }
        })
    } catch(err) {
        console.log(err);
    }
}


const main = async() => {
    await recordorderBookData(workerData.event_id, workerData.end_time);
}

main()