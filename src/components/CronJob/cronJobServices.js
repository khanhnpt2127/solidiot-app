import * as cron from "node-cron";
import SolidAuth from "solid-auth-client";
let listOfJob = [];
let listOfNotification = [];
function RegisterJob(deviceId, deviceUrl) {
  var task = cron.schedule("*/5 * * * * *", () => {
    //TODO: call API to fetch new Data
  });
  task.start();
  listOfJob.push({
    deviceId: deviceId,
    deviceUrl: deviceUrl,
    job: task,
    settings: {},
  });
}

function ExtractNewRequest(request) {
    //TODO: check start time is past or future 
    var requestTime = new Date(request.request.startTime);
    if(requestTime < Date.now()) {
        if(requestTime.getDate + 1 == Date.now()) {
            //TODO: trigger TD to get new Data
            console.log("nearly past")
        } else {
            //TODO: by current data check in data.json
            console.log("far past")
        }
    } else {
        //TODO: schedule to automaticall pull data
        console.log("future")
    }

}


function NewRequestObservationServiceWorker() {
  var task = cron.schedule("*/10 * * * * *", () => {

    SolidAuth.trackSession((session) => {
      if (!session) console.log("no session");
      else {
        var hostName = new URL(session.webId);
        const url = `https://${hostName.hostname}/public/solidiotNotification.json`;

        const doc = SolidAuth.fetch(url);
        doc
          .then(async (response) => {
            const text = await response.text();
            if (response.ok) {
              console.log(JSON.parse(text));
              var currNotifications = JSON.parse(text);
              currNotifications.forEach((item) => {
                var isFound = listOfNotification.some((e) => e.host === item.host && e.device[0] === item.device[0] && e.request.type === item.request.type && e.request.purpose === item.request.purpose);
                if(!isFound) {
                    listOfNotification.push(item)
                    //TODO: check request 
                    ExtractNewRequest(item)
                    console.log(listOfNotification);
                }
              })
            }
          })
          .catch(() => {});
      }
    });
  });
  task.start();
}
export { RegisterJob, listOfJob, NewRequestObservationServiceWorker };
