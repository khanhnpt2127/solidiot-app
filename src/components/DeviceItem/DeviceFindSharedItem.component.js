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
import moment from 'moment';
import Helmet from 'react-helmet';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

import { formatDate, parseDate } from 'react-day-picker/moment';

export default class DeviceFindSharedItem extends Component {
  constructor() {
    super();
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);
    this.state = {
      isOneTimeVisible: false,
      isFromToVisible: false,
      requestPurpose: null,
      duration: null,
      isTypeOfRequestErr: false,
      isRequestPurposeErr: false,
      isDurationErr: false,
      isSelectedDateErr: false,
      startTime: null,
      endTime: null,
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

  validateAllRequestInput() {
    if (this.state.isFromToVisible && this.state.isOneTimeVisible) return false;
    if (this.state.requestPurpose === null) return false;
    if (this.state.duration === null) return false;
    return true;
  }

  async handleSendRequest(event, deviceId, deviceOwner) {
    event.preventDefault();
    console.log(`${deviceId} ${deviceOwner}`);
    //TODO: validate input
    if (this.validateAllRequestInput()) {
      var requestType;
      if (this.state.isOneTimeVisible) requestType = "onetime";
      if (this.state.isFromToVisible) requestType = "fromto";
      // TODO: request setting builder
      var requestSetting = {
        type: requestType,
        purpose: this.state.requestPurpose,
        duration: this.state.duration,
        startTime: this.state.startTime,
        endTime: this.state.endTime
      };

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
                  request: requestSetting,
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
    } else {
      console.log("not ok");
    }
  }

  async handleTypeOfRequestChange(e) {
    e.preventDefault();
    if (e.target.value == 0) {
      this.setState({ isOneTimeVisible: true, isFromToVisible: false });
    }
    if (e.target.value == 1)
      this.setState({ isOneTimeVisible: false, isFromToVisible: true });

    console.log(e.target.value);
  }
  handleDateChange(date) {
    this.setState({ TypeOfRequestDate: date, startTime: date, endTime: null });
  }

  handlePurposeChange(e) {
    e.preventDefault();
    if (e.target.value == 0) this.setState({ requestPurpose: "research" });
    if (e.target.value == 1) this.setState({ requestPurpose: "business" });
    if (e.target.value == 2) this.setState({ requestPurpose: "commercial" });
  }

  handleDurationChange(e) {
    e.preventDefault();
    if (e.target.value == 0) this.setState({ duration: 604800 });
    if (e.target.value == 1) this.setState({ duration: 2592000 });
    if (e.target.value == 2) this.setState({ duration: 7776000 });
    if (e.target.value == 3) this.setState({ duration: 15552000 });
    if (e.target.value == 4) this.setState({ duration: 10 });
  }

  showFromMonth() {
    const { from, to } = this.state;
    if (!from) {
      return;
    }
    if (moment(to).diff(moment(from), 'months') < 2) {
      this.to.getDayPicker().showMonth(from);
    }
  }

  handleFromChange(from) {
    // Change the from date and focus the "to" input field
    this.setState({ startTime : from});
  }

  handleToChange(to) {
    this.setState({ endTime: to }, this.showFromMonth);
  }

  render() {
    const device = this.props;
    const { from, to } = this.state;
    const modifiers = { start: from, end: to };
    return (
      <>
        <ListGroup.Item variant="secondary">
          <Container>
            <Accordion defaultActiveKey="1">
              <Row>
                <Col sm={12} style={{ margin: "auto", marginLeft: "-17px" }}>
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
                    {this.state.isOneTimeVisible ? (
                      <Col sm={5}>
                        <DatePicker
                          onChange={(date) => this.handleDateChange(date)}
                          selected={this.state.startTime}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          timeCaption="time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          style={{ display: "none" }}
                          className="form-control"
                        />
                      </Col>
                    ) : (
                      <></>
                    )}

                    {this.state.isFromToVisible ? (
                      <Col sm={5}>
                        <div className="InputFromTo">
                          <DayPickerInput
                            value={from}
                            placeholder="From"
                            format="LL"
                            formatDate={formatDate}
                            parseDate={parseDate}
                            dayPickerProps={{
                              selectedDays: [from, { from, to }],
                              disabledDays: { after: to },
                              toMonth: to,
                              modifiers,
                              numberOfMonths: 2,
                              onDayClick: () => this.to.getInput().focus(),
                            }}
                            onDayChange={this.handleFromChange}
                          />{" "}
                          —{" "}
                          <span className="InputFromTo-to">
                            <DayPickerInput
                              ref={(el) => (this.to = el)}
                              value={to}
                              placeholder="To"
                              format="LL"
                              formatDate={formatDate}
                              parseDate={parseDate}
                              dayPickerProps={{
                                selectedDays: [from, { from, to }],
                                disabledDays: { before: from },
                                modifiers,
                                month: from,
                                fromMonth: from,
                                numberOfMonths: 2,
                              }}
                              onDayChange={this.handleToChange}
                            />
                          </span>
                          <Helmet>
                            <style>{`
  .InputFromTo .DayPicker-Day--selected:not(.DayPicker-Day--start):not(.DayPicker-Day--end):not(.DayPicker-Day--outside) {
    background-color: #f0f8ff !important;
    color: #4a90e2;
  }
  .InputFromTo .DayPicker-Day {
    border-radius: 0 !important;
  }
  .InputFromTo .DayPicker-Day--start {
    border-top-left-radius: 50% !important;
    border-bottom-left-radius: 50% !important;
  }
  .InputFromTo .DayPicker-Day--end {
    border-top-right-radius: 50% !important;
    border-bottom-right-radius: 50% !important;
  }
  .InputFromTo .DayPickerInput-Overlay {
    width: 550px;
  }
  .InputFromTo-to .DayPickerInput-Overlay {
    margin-left: -198px;
  }
`}</style>
                          </Helmet>
                        </div>
                      </Col>
                    ) : (
                      <> </>
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
                        Terms and Conditions:
                      </h6>
                    </Col>
                    <Col sm={5}>
                      <Form.Group controlId="formGridState">
                        <Form.Control
                          as="select"
                          defaultValue="Choose..."
                          onChange={(e) => this.handlePurposeChange(e)}
                        >
                          <option>choose a purpose of usage</option>
                          <option value="0">research</option>
                          <option value="1">business</option>
                          <option value="2">commercial</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col sm={5}>
                      <Form.Group controlId="formGridState">
                        <Form.Control
                          as="select"
                          defaultValue="Choose..."
                          onChange={(e) => this.handleDurationChange(e)}
                        >
                          <option>how long the data is shared?</option>
                          <option value="0">7 days</option>
                          <option value="1">30 days</option>
                          <option value="2"> 90 days</option>
                          <option value="3"> 180 days</option>
                          <option value="4">10 seconds</option>
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
