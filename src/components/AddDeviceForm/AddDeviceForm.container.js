import AddDeviceForm from "./AddDeviceForm.component";
import React, { Component } from "react";
import { Jumbotron, Container } from "react-bootstrap";
import * as rs from "../../utils/resourceMessages";
import { RegisterJob, listOfJob } from "../CronJob/cronJobServices";
import SolidAuth from "solid-auth-client";
import { ldflexHelper, errorToaster } from "@utils";
import axios from "axios";
export default class AddDeviceFormContainer extends Component {
  state = {
    devices: [],
  };

  createDeviceData = async (deviceData, deviceId, hostname) => {
    var urlData = `https://${hostname}/solidiot-app/${deviceId}/data.json`;
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
  };

  writeIndexFile = async (data, hostname) => {
    var urlIndex = `https://${hostname}/solidiot-app/index.json`;
    const result = await SolidAuth.fetch(urlIndex, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });
    if (result.ok) {
      console.log("ok");
    } else if (result.ok === false) {
      console.log(result.err);
    }
  };

  writeIndexSettingFile = async(data, hostname) => {
    var urlIndex = `https://${hostname}/solidiot-app/indexSettings.json`;
    const result = await SolidAuth.fetch(urlIndex, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    if (result.ok) {
      console.log("ok");
    } else if (result.ok === false) {
      console.log(result.err);
    }
  }


  fetchIndexFile = async (newDeviceId, hostname) => {
    var urlIndex = `https://${hostname}/solidiot-app/index.json`;

    const result = await SolidAuth.fetch(urlIndex, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.status === 404) {
      var data = [newDeviceId];
      this.writeIndexFile(JSON.stringify(data), hostname);
    } else {
      const doc = SolidAuth.fetch(urlIndex);
      await doc
        .then(async (response) => {
          const text = await response.text();
          if (response.ok) {
            var currDevices = JSON.parse(text);
            
            console.log(currDevices);

            if (!currDevices.includes(newDeviceId))
              currDevices.push(newDeviceId);

            console.log(currDevices);

            await this.writeIndexFile(
              JSON.stringify(currDevices),
              hostname
            );
            
            var urlIndexSetting =  `https://${hostname}/solidiot-app/indexSettings.json`;
            
            const docSetting = SolidAuth.fetch(urlIndexSetting);
            await docSetting.then(async (res) => {
              var curr = await res.text();
              var currSetting = JSON.parse(curr);
              var newSetting = {
                "id" : newDeviceId,
                "isSearchable" : false,
                "sharedPeople" : []
              }
              currSetting.push(newSetting);
              await this.writeIndexSettingFile(JSON.stringify(currSetting),hostname);
            })
          }
        })
        .catch(() => {});
    }
  };

  createDeviceTD = async (deviceTDString, deviceId, hostname) => {
    var urlDesc = `https://${hostname}/solidiot-app/${deviceId}/desc.jsonld`;

    const result = await SolidAuth.fetch(urlDesc, {
      method: "PUT",
      headers: {
        "Content-Type": "application/ld+json",
      },
      body: deviceTDString,
    });
    if (result.ok) {
      await this.fetchIndexFile(deviceId, hostname);
    } else if (result.ok === false) {
      console.log(result.err);
    }
  };

  addNewDevice = async (deviceData, isSoIoT) => {
    if (!isSoIoT) {
      const found = this.state.devices.some(
        (item) => deviceData.device.id == item.device.id
      );
      if (!found) {
        this.setState((prevState) => ({
          devices: [...prevState.devices, deviceData],
        }));

        SolidAuth.trackSession(async(session) => {
          if (!session) console.log("The user is not logged in");
          else {
            const url = new URL(session.webId);
            console.log(url.hostname);
            var obj = {
              "@context": "https://www.w3.org/2019/wot/td/v1",
              id: "urn:dev:ops:32473-WoTLamp-1234",
              title: "MyLampThing",
              securityDefinitions: {
                basic_sc: { scheme: "basic", in: "header" },
              },
              security: ["basic_sc"],
              properties: {
                status: {
                  type: "string",
                  forms: [{ href: "https://mylamp.example.com/status" }],
                },
              },
              actions: {
                toggle: {
                  forms: [{ href: "https://mylamp.example.com/toggle" }],
                },
              },
              events: {
                overheating: {
                  data: { type: "string" },
                  forms: [
                    {
                      href: "https://mylamp.example.com/oh",
                      subprotocol: "longpoll",
                    },
                  ],
                },
              },
            };
            this.createDeviceTD(
              JSON.stringify(obj),
              deviceData.device.id,
              url.hostname
            );
            this.createDeviceData(
              JSON.stringify(deviceData.data),
              deviceData.device.id,
              url.hostname
            );
          }
        });

        RegisterJob(deviceData.device.id, deviceData.device.id);
        this.props.onNewDevice({
          id: deviceData.device.id,
          name: deviceData.device.deviceName,
        });
      } else {
        this.props.messages(rs.DUPLICATE_INVALID);
      }
    } else {
      var devices = deviceData.lists;

      var objTemp = {
        "@context": "https://www.w3.org/2019/wot/td/v1",
        id: "urn:dev:ops:32473-WoTLamp-1234",
        title: "MyLampThing",
        securityDefinitions: {
          basic_sc: { scheme: "basic", in: "header" },
        },
        security: ["basic_sc"],
        properties: {
          status: {
            type: "string",
            forms: [{ href: "https://mylamp.example.com/status" }],
          },
        },
        actions: {
          toggle: {
            forms: [{ href: "https://mylamp.example.com/toggle" }],
          },
        },
        events: {
          overheating: {
            data: { type: "string" },
            forms: [
              {
                href: "https://mylamp.example.com/oh",
                subprotocol: "longpoll",
              },
            ],
          },
        },
      };

      SolidAuth.trackSession(async (session) => {
        if (!session) console.log("The user is not logged in");
        else {
          const url = new URL(session.webId);

          var urlIndex = `https://${url.hostname}/solidiot-app/index.json`;
          const doc = SolidAuth.fetch(urlIndex);

          await doc.then(async (response) => {
            const text = await response.text();
            if (response.ok) {
              var currDevices = JSON.parse(text);

              for(let dev of devices) {

                const deviceTd = await axios.get(`https://localhost:44312/api/Devices/${dev.id}/thingdesc`)
                var itemInTD = deviceTd.data;
               
                const found = currDevices.some((i) => dev.id === i)

                if(!found) {
                  await this.createDeviceTD(
                    JSON.stringify(itemInTD),
                    dev.id,
                    url.hostname
                  );
                  // 2 - fetch data 
                  const resp = await axios.get(`https://localhost:44312/api/Devices/${dev.id}`);
                  
                  resp.data.data.value = JSON.parse(resp.data.data.value);
                  var cpData = resp.data.data;
                  resp.data.data = [];
                  resp.data.data.push(cpData);

                  await this.createDeviceData(
                    JSON.stringify(resp.data.data),
                    dev.id,
                    url.hostname
                  )
                  //RegisterJob(deviceData.device.id, deviceData.device.id);
                  this.props.onNewDevice({
                    id: dev.id,
                    name: dev.name,
                  });
                  window.location.reload();
                  break;
                }
              }




            }
          });
        }
      });
    }
  };

  render() {
    return (
      <Container>
        <Jumbotron>
          <h1>Solidiot App</h1>
          <p>
            This is a simple hero unit, a simple jumbotron-style component for
            calling extra attention to featured content or information.
          </p>
          <AddDeviceForm onSubmit={this.addNewDevice} />
        </Jumbotron>
      </Container>
    );
  }
}
