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
import ReactJson from "react-json-view";
export default class DeviceSharedItem extends Component {
  checkDuplicateRequest(currDevice, newNotification) {
    var i;
    for (i = 0; i < currDevice.length; i++) {
      if (currDevice[i].host === newNotification.host) {
        newNotification.device.foreach((item) => {
          if (item === newNotification.device[0]) return true;
        });
        return true;
      }
    }
    return false;
  }

  async handleSendRequest(event, deviceId, deviceOwner) {
    event.preventDefault();
    console.log(`${deviceId} ${deviceOwner}`);

    SolidAuth.trackSession((session) => {
      if (!session) console.log("The user is not logged in");
      else {
        var urlNotification = `${deviceOwner}public/solidiotNotification.json`;

        const doc = SolidAuth.fetch(urlNotification);

        doc
          .then(async (response) => {
            const text = await response.text();
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
          .catch(() => {});

        /*
        // create SharedItem 
        var url = new URL(session.webId)
        var urlSharedItem = `https://${url.hostname}/public/sharedItems.json`;
        const doc = SolidAuth.fetch(urlSharedItem);

        doc
        .then(async (response) => {
          const text = await response.text();
          var sharedItem = JSON.parse(text);

          var newSharedItem = {
            "host" : 
          }

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
        */
      }
    });
  }

  render() {
    const device = this.props;
    return (
      <>
        <ListGroup.Item
          variant={device.isShared == true ? "success" : "warning"}
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
                      variant={device.isShared == true ? "success" : "warning"}
                      style={{ minHeight: "26px" }}
                    ></Button>
                  </OverlayTrigger>

                  <Accordion.Toggle
                    style={{
                      color: device.isShared == true ? "#388E3C" : "#856404",
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
                  {device.isShared == false ? (
                    <Button
                      onClick={(e) => {
                        this.handleSendRequest(e, device.id, device.owner);
                      }}
                      variant={device.isShared == true ? "success" : "warning"}
                      className="float-right"
                      disabled
                    >
                      Send Request
                    </Button>
                  ) : (
                    <Button variant="success" disabled className="float-right">
                      Accepted Request
                    </Button>
                  )}
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

              <Accordion.Collapse eventKey="0">
                <Row>
                  {device.data && (
                    <Col sm={12}>
                      <h6
                        style={{ textTransform: "lowercase", fontSize: "12px" }}
                      >
                        data:
                      </h6>
                      <ReactJson
                        src={device.data}
                        iconStyle="circle"
                        collapsed="1"
                        onAdd="false"
                        displayDataTypes="false"
                        onDelete="false"
                        name={device.name}
                        theme="hopscotch"
                      />
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
