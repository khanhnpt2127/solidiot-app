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

export default class DeviceFindSharedItem extends Component {
  checkDuplicateRequest(currDevice, newNotification) {
    var findNewInCurr = currDevice.find((x) => x.host === newNotification.host);
    if(findNewInCurr) {
      var curr = findNewInCurr.device.find((y) => y === newNotification.device[0]);
      if(curr) { 
        return true; }
    }
    return false;
  }

  checkDuplicateSharedItem(currSharedItem, newSharedItem) {

    var curr =  currSharedItem.find((x) => x.host === newSharedItem.host && x.deviceID === newSharedItem.deviceID)
    if(curr) return true;
    return false
  }


  async handleSendRequest(event, deviceId, deviceOwner) {
    event.preventDefault();
    console.log(`${deviceId} ${deviceOwner}`);

    SolidAuth.trackSession((session) => {
      if (!session) console.log("The user is not logged in");
      else {

        var url = new URL(deviceOwner);
        var urlNotification = `https://${url.hostname}/public/solidiotNotification.json`;
        const doc = SolidAuth.fetch(urlNotification);
        doc
          .then(async (response) => {
            const text = await response.text();
            console.log(text);
            if (response.ok) {
              var currDevice = JSON.parse(text);
              var newNotification = {
                host: session.webId,
                isNew: true,
                message: `A new request from ${session.webId}`,
                device: [`${deviceId}`],
              };
              if (!this.checkDuplicateRequest(currDevice, newNotification)) {
                currDevice.push(newNotification);

                const result = await SolidAuth.fetch(urlNotification, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/ld+json",
                  },
                  body: JSON.stringify(currDevice),
                });
                if (result.ok) console.log("update ok");
              }
            }
          })
          .catch((e) => { console.log(e)});


        var urlUr = new URL(session.webId)
        var urlSharedItem = `https://${urlUr.hostname}/public/sharedItems.json`;
        const docUr = SolidAuth.fetch(urlSharedItem);

        docUr
        .then(async (response) => {
          const text = await response.text();
          var sharedItem = JSON.parse(text);

          var newSharedItem = {
            "host" : deviceOwner,
            "deviceID" :deviceId,
            "isAccepted" : false 
          }
          var sharedItem = []
          if(!this.checkDuplicateSharedItem(sharedItem, newSharedItem))
            sharedItem.push(newSharedItem)

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
        .catch((e) => {console.log(e)});

      }
    });
  }

  render() {
    const device = this.props;
    return (
      <>
        <ListGroup.Item
          variant="success"
        >
          <Container>
            <Accordion defaultActiveKey="1">
              <Row>
                <Col sm={8} style={{ margin: "auto" }}>
                  <OverlayTrigger
                    key="top"
                    placement="top"
                    overlay={
                      <Tooltip id={`tooltip-top}`}> click to deactive </Tooltip>
                    }
                  >
                    <Button
                      variant="success"
                      style={{ minHeight: "26px" }}
                    ></Button>
                  </OverlayTrigger>

                  <Accordion.Toggle
                    style={{
                      color:  "#388E3C",
                    }}
                    as={Button}
                    variant="link"
                    eventKey="0"
                  >
                    <span style={{ marginLeft: "5px" }}>
                      {" "}
                      {device.name} - {device.owner}{" "}
                    </span>
                  </Accordion.Toggle>
                </Col>
                <Col sm={4}>
                    <Button
                      onClick={(e) => {
                        this.handleSendRequest(e, device.id, device.owner);
                      }}
                      variant="success"
                      className="float-right"
                    >
                      Send Request
                    </Button>
                </Col>
              </Row>

              <Accordion.Collapse eventKey="0">
                <Row>
                  {device.desc && (
                    <Col sm={12}>
                      <h6
                        style={{ textTransform: "lowercase", fontSize: "12px" }}
                      >
                        description:
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
                        {" "}
                        {device.desc}{" "}
                      </p>
                    </Col>
                  )}
                </Row>
              </Accordion.Collapse>
            </Accordion>
          </Container>
        </ListGroup.Item>
      </>
    );
  }
}
