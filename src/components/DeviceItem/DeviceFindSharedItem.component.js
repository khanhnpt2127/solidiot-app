import React, { Component, useState } from "react";
import {
  ListGroup,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Accordion,
  Form,
  Alert,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SolidAuth from "solid-auth-client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Example from "./DatePicker"
export default class DeviceFindSharedItem extends Component {
  constructor() {
    super();
    this.state = {
      TypeOfRequestDate: Date.now(),
      isOneTimeVisible: false,
      isFromToVisible: false 
    };
  }

  checkDuplicateRequest(currDevice, newNotification) {
    var findNewInCurr = currDevice.find((x) => x.host === newNotification.host);
    if (findNewInCurr) {
      var curr = findNewInCurr.device.find(
        (y) => y === newNotification.device[0]
      );
      if (curr) {
        return true;
      }
    }
    return false;
  }

  checkDuplicateSharedItem(currSharedItem, newSharedItem) {
    var curr = currSharedItem.find(
      (x) =>
        x.host === newSharedItem.host && x.deviceID === newSharedItem.deviceID
    );
    if (curr) return true;
    return false;
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
          .catch((e) => {
            console.log(e);
          });

        var urlUr = new URL(session.webId);
        var urlSharedItem = `https://${urlUr.hostname}/public/sharedItems.json`;
        const docUr = SolidAuth.fetch(urlSharedItem);

        docUr
          .then(async (response) => {
            const text = await response.text();
            var sharedItem = JSON.parse(text);

            var newSharedItem = {
              host: deviceOwner,
              deviceID: deviceId,
              isAccepted: false,
            };

            if (!this.checkDuplicateSharedItem(sharedItem, newSharedItem))
              sharedItem.push(newSharedItem);

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
    });
  }

  async handleTypeOfRequestChange(e) {
    e.preventDefault();
    if(e.target.value == 0) { 
      this.setState({ isOneTimeVisible: true, isFromToVisible: false });
    }
    if (e.target.value == 1) 
      this.setState({ isOneTimeVisible: false , isFromToVisible: true });

      console.log(e.target.value)
  }
  handleDateChange(date) {
    console.log(date);
    this.setState({ TypeOfRequestDate: date });
  }
  render() {
    const device = this.props;
    return (
      <>
        <ListGroup.Item variant="secondary">
          <Container>
            <Accordion defaultActiveKey="1">
              <Row>
                <Col sm={8} style={{ margin: "auto", marginLeft: "-17px" }}>
                  <Accordion.Toggle
                    style={{
                      color: "#383d41",
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
                <Col sm={4}></Col>
              </Row>

              <Accordion.Collapse eventKey="0">
                <>
                  <Row>
                    {device.desc && (
                      <Col sm={12}>
                        <h6
                          style={{
                            textTransform: "lowercase",
                            fontSize: "12px",
                          }}
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
                  <Row>
                    <Col sm={12}>
                      <h6
                        style={{
                          textTransform: "lowercase",
                          fontSize: "12px",
                          color: "#383d41",
                        }}
                      >
                        Requested type:
                      </h6>
                    </Col>
                    <Col sm={5}>
                      <Form.Group controlId="formGridState">
                        <Form.Control
                          name="frmTypeOfRequest"
                          as="select"
                          defaultValue="Choose..."
                          onChange={(e) => this.handleTypeOfRequestChange(e)}
                        >
                          <option>choose type of request </option>
                          <option value="0">one time</option>
                          <option value="1">from - to </option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    { this.state.isOneTimeVisible ? 
                    <Col sm={5} >
                      <DatePicker
                        onChange={(date) => this.handleDateChange(date)}
                        selected={this.state.TypeOfRequestDate}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        timeCaption="time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        style={{ display: "none" }}
                        className="form-control"
                      />
                    </Col> : <></>
                    }

                    { this.state.isFromToVisible ? 
                    <Col sm={5}>
                      <Example />
                    </Col> : <> </>
                    }
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <h6
                        style={{
                          textTransform: "lowercase",
                          fontSize: "12px",
                          color: "#383d41",
                        }}
                      >
                        Terms and Conditions:
                      </h6>
                    </Col>
                    <Col sm={5}>
                      <Form.Group controlId="formGridState">
                        <Form.Control as="select" defaultValue="Choose...">
                          <option>choose a purpose of usage</option>
                          <option>research</option>
                          <option>business</option>
                          <option>commercial</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col sm={5}>
                      <Form.Group controlId="formGridState">
                        <Form.Control as="select" defaultValue="Choose...">
                          <option>how long the data is shared?</option>
                          <option>7 days</option>
                          <option>30 days</option>
                          <option> 90 days</option>
                          <option> 180 days</option>
                          <option>10 seconds</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>

                    <Col sm={2}>
                      <Button
                        onClick={(e) => {
                          this.handleSendRequest(e, device.id, device.owner);
                        }}
                        variant="dark"
                        className="float-right"
                      >
                        Send Request
                      </Button>
                    </Col>
                  </Row>
                </>
              </Accordion.Collapse>
            </Accordion>
          </Container>
        </ListGroup.Item>
      </>
    );
  }
}
