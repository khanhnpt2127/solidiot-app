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

export default class DeviceRequestItem extends Component {
  async handleAcceptRequest(event, deviceId, deviceRequester) {
    event.preventDefault();
    console.log(deviceRequester);

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

        const ACLFile = await ACLFactory.createNewAcl(
          webId,
          `https://${hostName.hostname}/solidiot-app/${deviceId}/data.json`
        );
        await ACLFile.createACL(permissions);

        const ACLDescFile = await ACLFactory.createNewAcl(
          webId,
          `https://${hostName.hostname}/solidiot-app/${deviceId}/desc.jsonld`
        );

        await ACLDescFile.createACL(permissions);
        console.log("ok create acl")
        // TODO: check ACL is successful
        // 3 - notify sharedItem
        var url = new URL(deviceRequester);
        var urlSharedItem = `https://${url.hostname}/public/sharedItems.json`;

        const doc = SolidAuth.fetch(urlSharedItem);

        doc
          .then(async (response) => {
            const text = await response.text();
            var sharedItem = JSON.parse(text);
            sharedItem.forEach((item) => {
              if (item.deviceID === deviceId && item.host ===session.webId) item.isAccepted = true;
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
          .catch((e) => {console.log(e)});

      }
      // 4 - close request 
    });
  }

  render() {
    const device = this.props;
    return (
      <>
        <ListGroup.Item variant="success">
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
                    style={{ color: "#388E3C" }}
                    as={Button}
                    variant="link"
                    eventKey="0"
                  >
                    <span style={{ marginLeft: "5px" }}>
                      {" "}
                      {device.host}{" "}
                    </span>
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
                    variant="success"
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
                      {device.message} - device ID: {device.device[0]} 
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
