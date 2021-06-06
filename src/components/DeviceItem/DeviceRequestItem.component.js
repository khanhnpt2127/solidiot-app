import React, { Component } from "react";
import {
  ListGroup,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Accordion,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SolidAuth from "solid-auth-client";
import { AccessControlList, ACLFactory } from "@inrupt/solid-react-components";
import { SetAutoRevoke } from '../CronJob/cronJobServices'
export default class DeviceRequestItem extends Component {

  extractDeviceId(deviceId) {
    if(deviceId.includes("urn:dev:ops:")) {
      var replacedHeader = deviceId.replace("urn:dev:ops:","");
      var fullRes =  replacedHeader.replace("-HueDaylight-1234","");
      var fullRes =  replacedHeader.replace("-HueLight-1","");

      console.log(fullRes)
      return fullRes;
    }
    return deviceId;
}
  async handleAcceptRequest(event, deviceId, deviceRequester) {
    event.preventDefault();
    console.log(deviceRequester);
    let deviceIdExtracted = this.extractDeviceId(deviceId);
    console.log(deviceIdExtracted)
    // 2 - write permission
    SolidAuth.trackSession(async (session) => {
      if (!session) console.log("the user is not loggged in");
      else {
        var webId = session.webId;
        var hostName = new URL(webId);
        const permissions = [
          {
            agents: deviceRequester,
            modes: [AccessControlList.MODES.READ],
          },
        ];
        const requesterUrl = new URL(deviceRequester);
        const ACLFile = await ACLFactory.createNewAcl(
          webId,
          `https://${hostName.hostname}/solidiot-app/${deviceIdExtracted}/${requesterUrl.hostname}/data.json`
        );
        await ACLFile.createACL(permissions);

        const ACLDescFile = await ACLFactory.createNewAcl(
          webId,
          `https://${hostName.hostname}/solidiot-app/${deviceIdExtracted}/desc.jsonld`
        );

        await ACLDescFile.createACL(permissions);
        console.log("ok create acl");
        // TODO: check ACL is successful
        // 3 - notify sharedItem
        var url = new URL(deviceRequester);
        var urlSharedItem = `https://${url.hostname}/public/sharedItems.json`;

        const doc = SolidAuth.fetch(urlSharedItem);

        doc
          .then(async (response) => {
            const text = await response.text();
            
            var sharedItem = JSON.parse(text);
            console.log(sharedItem)
            sharedItem.forEach((item) => {
              if (item.deviceID === deviceId && item.host === session.webId)
                item.isAccepted = true;
            });
            const result = await SolidAuth.fetch(urlSharedItem, {
              method: "PUT",
              headers: {
                "Content-Type": "application/ld+json",
              },
              body: JSON.stringify(sharedItem),
            });
            if (result.ok) {
              console.log("ok");
            } else if (result.ok === false) {
              console.log(result.err);
            }
          })
          .catch((e) => {
            console.log(e);
          });
      }
      // 4 - update sharedItem List
      var urlIndexSetting = `https://${hostName.hostname}/solidiot-app/indexSettings.json`;
      const docSetting = SolidAuth.fetch(urlIndexSetting);
      await docSetting.then(async (res) => {
        var curr = await res.text();
        var currSetting = JSON.parse(curr);
        var item = currSetting.find((e) => e.id === deviceIdExtracted);

        var isExited = item.sharedPeople.find((e) => e === deviceRequester);
        if (!isExited) item.sharedPeople.push(deviceRequester);
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
      });
      //  5 - set auto revoke
      SetAutoRevoke(deviceIdExtracted,this.props.request.duration, deviceRequester)
      
      // 6 - close request
      const urlNoti = `https://${hostName.hostname}/public/solidiotNotification.json`;

      const docNoti = SolidAuth.fetch(urlNoti);
      docNoti
        .then(async (response) => {
          const text = await response.text();
          const listNotification = JSON.parse(text);

          var itemHost = listNotification.filter((e) => e.host);
          console.log(itemHost);
          itemHost.forEach((item) => {
            if (deviceId === item.device[0]) {
              listNotification.splice(listNotification.indexOf(item), 1);
            }
          });

          const result = await SolidAuth.fetch(urlNoti, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(listNotification),
          });

          if (result.ok) {
            console.log("ok");
          } else if (result.ok === false) {
            console.log(result.err);
          }

          //window.location.reload();
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }

  extractDeviceId(deviceId) {
      if(deviceId.includes("urn:dev:ops:")) {
          var replacedHeader = deviceId.replace("urn:dev:ops:","");
          var fullRes =  replacedHeader.replace("-HueDaylight-1234","");
          var fullRes =  replacedHeader.replace("-HueLight-1","");

          console.log(fullRes)
          return fullRes;
      }
      return deviceId;
  }

  secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor((seconds % (3600 * 24)) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }
  render() {
    const device = this.props;
    return (
      <>
        <ListGroup.Item variant="info">
          <Container>
            <Accordion defaultActiveKey="1">
              <Row>
                <Col sm={8} style={{ margin: "auto", marginLeft: "-17px" }}>
                  <Accordion.Toggle
                    style={{ color: "#0c5460" }}
                    as={Button}
                    variant="link"
                    eventKey="0"
                  >
                    <span style={{ marginLeft: "5px" }}> {device.host} </span>
                  </Accordion.Toggle>
                </Col>
                <Col sm={4}>
                  <Button
                    onClick={(e) => {
                      this.handleAcceptRequest(
                        e,
                        device.device[0],
                        device.host
                      );
                    }}
                    variant="info"
                    className="float-right"
                  >
                    Accept Request
                  </Button>
                </Col>
              </Row>

              <Accordion.Collapse eventKey="0">
                <Row>
                  <Col sm={12}>
                    <h6
                      style={{ textTransform: "lowercase", fontSize: "12px" }}
                    >
                      message:
                    </h6>
                    <p
                      style={{
                        backgroundColor: "rgb(50, 41, 49)",
                        color: "white",
                        padding: "10px",
                        fontSize: "14px",
                        borderRadius: "5px",
                      }}
                    >
                      {device.message} - device ID: {device.device[0]}. 
                      The data consumer would like to use it{" "}
                       {device.request.type === "fromto"
                        ? "from " +
                          new Date(device.request.startTime) +
                          "to " +
                          new Date(device.request.endTime)
                        : "at " + new Date(device.request.startTime)}
                      . He (She) uses it for {device.purpose} purpose in {this.secondsToDhms(device.request.duration)}. 
                    </p>
                  </Col>
                </Row>
              </Accordion.Collapse>
            </Accordion>
          </Container>
        </ListGroup.Item>
      </>
    );
  }
}
