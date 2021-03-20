import * as cron from 'node-cron'

let listOfJob = []

function RegisterJob(deviceId,deviceUrl) {
    var task = cron.schedule('*/5 * * * * *', () => {
        //TODO: call API to fetch new Data
    });
    task.start();
    listOfJob.push({ 'deviceId': deviceId, 'deviceUrl': deviceUrl, 'job': task,'settings': {}});
}

export { RegisterJob, listOfJob};



