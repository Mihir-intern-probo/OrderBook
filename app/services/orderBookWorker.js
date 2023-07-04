const { Worker } = require('worker_threads');
const moment = require('moment');
const orderBookWorker = async (event_id, end_time) => {
    try {
        return new Promise((resolve,reject)=>{
            const worker = new Worker('/home/ubuntu/OrderBook/app/services/orderBookDataService.js',{
                workerData:{
                    event_id: event_id,
                    end_time: end_time
                }
            });
            worker.on('message' ,(data)=>{
                console.log(data);
                if (data.terminate) {
                    worker.terminate();
                    console.log("Worker Thread terminated", event_id);
                    resolve();
                  } else {
                    resolve(data);
                  }
            });
            worker.on('error',(data)=>{
                reject(data);
            })
            worker.on('exit',(code)=>{
                console.log("Worker Thread successfully Terminated", event_id);
                if(code!=0){
                    reject(new Error(`Worker file stopped working with code ${code}`))
                }
            })
        })
} catch(err) {
    console.log(err);
}
}
module.exports = {orderBookWorker}   
