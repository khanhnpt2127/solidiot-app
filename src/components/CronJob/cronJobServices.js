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

async function WriteToSolid(urlHostname, deviceId, requesterId, deviceData) {    
    console.log(requesterId)
    var urlData = `https://${urlHostname}/solidiot-app/${deviceId}/${requesterId}/data.json`;

    const result = await SolidAuth.fetch(urlData, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: deviceData,
    });
    if (result.ok) {
      console.log("ok");
    } else if (result.ok === false) {
      console.log(result.err);
    }
}

function extractDeviceId(deviceId) {
    if(deviceId.includes("urn:dev:ops:")) {
      var replacedHeader = deviceId.replace("urn:dev:ops:","");
      var fullRes =  replacedHeader.replace("-HueDaylight-1234","");
      var fullRes =  replacedHeader.replace("-HueLight-1","");

      console.log(fullRes)
      return fullRes;
    }
    return deviceId;
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
            
            

        SolidAuth.trackSession(async(session) => {{ console.log(request)
          if (!session) console.log("no session");
          else {
            console.log("ok")
            const url = new URL(session.webId);
            var deviceId = extractDeviceId(request.device[0]);
            var urlData = `https://${url.hostname}/solidiot-app/${deviceId}/data.json`;
            const doc = SolidAuth.fetch(urlData);
            let dData = await doc
            .then(async (response) => {
                const text = await response.text();
                if (response.ok) {
                    let deviceData = JSON.parse(text);
                    if(request.request.endTime !== null) {
                        //INFO: range checker 
                        var selectedData = [];
                        var startTime = new Date(request.request.startTime);
                        var endTime = new Date(request.request.endTime);
                        deviceData.forEach((dataItem) => {
                            var createdDate = new Date(dataItem.created);
                            if(createdDate > startTime && createdDate < endTime) selectedData.push(dataItem);
                        })

                        //INFO: create a subfile shared file
                        var requestUrl = new URL(request.host)
                        console.log(`startDate ${startTime} ; endTime: ${endTime}`)
                        WriteToSolid(url.hostname, deviceId, requestUrl.hostname, JSON.stringify(selectedData));
                        
                        //TODO: notify the requester to consume data


                    } else {
                        //TODO: single point checker 
                    }

                }
            })
            .catch(() => {}); 
            }
        }})



            console.log("far past")
        }
    } else {
        //TODO: schedule to automaticall pull data
        console.log("future")
    }

}


function NewRequestObservationServiceWorker() {
  var task = cron.schedule("*/60 * * * * *", () => {

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
