import * as cron from "node-cron";
import SolidAuth from "solid-auth-client";
import { AccessControlList, ACLFactory } from "@inrupt/solid-react-components";
import Cookies from "universal-cookie";
let listOfJob = [];
let listOfNotification = [];
let removeListOfTimerRevoke = [];
let isReload = false;
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
  console.log(requesterId);
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
  if (deviceId.includes("urn:dev:ops:")) {
    var replacedHeader = deviceId.replace("urn:dev:ops:", "");
    var fullRes = replacedHeader.replace("-HueDaylight-1234", "");
    var fullRes = replacedHeader.replace("-HueLight-1", "");

    console.log(fullRes);
    return fullRes;
  }
  return deviceId;
}

function ExtractNewRequest(request) {
  //TODO: check start time is past or future
  var requestTime = new Date(request.request.startTime);
  if (requestTime < Date.now()) {
    if (requestTime.getDate + 1 == Date.now()) {
      //TODO: trigger TD to get new Data
      console.log("nearly past");
    } else {
      //TODO: by current data check in data.json

      SolidAuth.trackSession(async (session) => {
        {
          console.log(request);
          if (!session) console.log("no session");
          else {
            console.log("ok");
            const url = new URL(session.webId);
            var deviceId = extractDeviceId(request.device[0]);
            var urlData = `https://${url.hostname}/solidiot-app/${deviceId}/data.json`;
            const doc = SolidAuth.fetch(urlData);
            let dData = await doc
              .then(async (response) => {
                const text = await response.text();
                if (response.ok) {
                  let deviceData = JSON.parse(text);
                  if (request.request.endTime !== null) {
                    //INFO: range checker
                    var selectedData = [];
                    var startTime = new Date(request.request.startTime);
                    var endTime = new Date(request.request.endTime);
                    deviceData.forEach((dataItem) => {
                      var createdDate = new Date(dataItem.created);
                      if (createdDate > startTime && createdDate < endTime)
                        selectedData.push(dataItem);
                    });

                    //INFO: create a subfile shared file
                    var requestUrl = new URL(request.host);
                    console.log(`startDate ${startTime} ; endTime: ${endTime}`);
                    WriteToSolid(
                      url.hostname,
                      deviceId,
                      requestUrl.hostname,
                      JSON.stringify(selectedData)
                    );

                    //TODO: notify the requester to consume data
                  } else {
                    //TODO: single point checker
                  }
                }
              })
              .catch(() => {});
          }
        }
      });

      console.log("far past");
    }
  } else {
    //TODO: schedule to automaticall pull data
    console.log("future");
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
                var isFound = listOfNotification.some(
                  (e) =>
                    e.host === item.host &&
                    e.device[0] === item.device[0] &&
                    e.request.type === item.request.type &&
                    e.request.purpose === item.request.purpose
                );
                if (!isFound) {
                  listOfNotification.push(item);
                  //TODO: check request
                  ExtractNewRequest(item);
                  console.log(listOfNotification);
                }
              });
            }
          })
          .catch(() => {});
      }
    });
  });
  task.start();
}
async function RevokePermission(deviceId, userId) {
  SolidAuth.trackSession(async (session) => {
    if (!session) console.log("the user is not loggged in");
    else {
      var webId = session.webId;
      var hostName = new URL(webId);
      var requesterUrl = new URL(userId);
      let deviceIdExtracted = extractDeviceId(deviceId);

      const permissions = [
        {
          agents: userId,
          modes: [],
        },
      ];

      const ACLFile = await ACLFactory.createNewAcl(
        webId,
        `https://${hostName.hostname}/solidiot-app/${deviceIdExtracted}/${requesterUrl.hostname}/data.json`
      );

      await ACLFile.createACL(permissions);

      // 2 - remove sharedItem
      var urlIndexSetting = `https://${hostName.hostname}/solidiot-app/indexSettings.json`;
      const docSetting = SolidAuth.fetch(urlIndexSetting);
      await docSetting.then(async (res) => {
        var curr = await res.text();
        var currSetting = JSON.parse(curr);
        var item = currSetting.find((e) => e.id === deviceId);
        if (item) {
          var user = item.sharedPeople.find((e) => e === userId);
          item.sharedPeople.splice(item.sharedPeople.indexOf(user), 1);
        }

        var urlIndex = `https://${hostName.hostname}/solidiot-app/indexSettings.json`;
        const result = await SolidAuth.fetch(urlIndex, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currSetting),
        });

        if (result.ok) {
          console.log("ok");
        } else if (result.ok === false) {
          console.log(result.err);
        }
        // 3 - set waiting message
      });
    }
  });
}
async function SetAutoRevoke(deviceId, duration, userId) {
  console.log(deviceId);
  console.log(duration);
  console.log(userId);
  console.log(Date.now());

  const cookies = new Cookies();
  let listOfTimerRevoke = [];
  listOfTimerRevoke = cookies.get("listOfTimerRevoke");
  var timerRevoke = {
    acceptedDate: Date.now(),
    deviceId: deviceId,
    userId: userId,
    duration: duration,
  };
  //TODO: check before add

  if (Array.isArray(listOfTimerRevoke)) {
    var isFound = listOfTimerRevoke.some(
      (e) =>
        e.deviceId === timerRevoke.deviceId &&
        e.acceptedDate === timerRevoke.acceptedDate
    );
    if (!isFound) listOfTimerRevoke.push(timerRevoke);
  } else {
    listOfTimerRevoke = [];
    listOfTimerRevoke.push(timerRevoke);
  }

  console.log(timerRevoke);
  //TODO: save to cookie
  cookies.set("listOfTimerRevoke", JSON.stringify(listOfTimerRevoke), {
    path: "/",
  });

  console.log(cookies.get("listOfTimerRevoke"));
}

function StartAutoRevokeBackgroundTask() {
  let listOfTimerRevoke = [];
  const cookies = new Cookies();

  listOfTimerRevoke = cookies.get("listOfTimerRevoke");

  var task = cron.schedule("*/60 * * * * *", () => {
    if (Array.isArray(listOfTimerRevoke)) {

      console.log("1")
      listOfTimerRevoke.forEach((item) => {
        var acceptedDate = new Date(item.acceptedDate);

        console.log(acceptedDate.getTime() + item.duration);
        console.log(Date.now());
        if (acceptedDate.getTime() + item.duration < Date.now()) {
          RevokePermission(item.deviceId, item.userId);
          removeListOfTimerRevoke.push(item); 
          isReload = true;
        }
      });
      
      removeListOfTimerRevoke.forEach((e) => {
        listOfTimerRevoke.splice(listOfTimerRevoke.find((l) => l.deviceId === e.deviceId && l.acceptedDate === e.acceptedDate),1);
      })
      removeListOfTimerRevoke = [];
      const cookies = new Cookies();
      cookies.set("listOfTimerRevoke", JSON.stringify(listOfTimerRevoke), {
        path: "/",
      });
      if(isReload) { isReload = false;  
        setTimeout(() => {  window.location.reload()}, 5000);
      }; 
    } else { 
      console.log("2")
      if(listOfTimerRevoke.deviceId !== "") {
        if (listOfTimerRevoke.getTime() + listOfTimerRevoke.duration < Date.now()) {
          RevokePermission(listOfTimerRevoke.deviceId, listOfTimerRevoke.userId);
          
          const cookies = new Cookies();
          cookies.remove("listOfTimerRevoke");
          window.location.reload();
        }
      }
     }
  });

  task.start();
}

export {
  RegisterJob,
  listOfJob,
  NewRequestObservationServiceWorker,
  SetAutoRevoke,
  StartAutoRevokeBackgroundTask,
};
