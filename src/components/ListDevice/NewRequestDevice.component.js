import React from "react";
import {
  ListGroup,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Card,
  Form,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeviceItem from "../DeviceItem/DeviceItem.component";
import DeviceRequestItem from "../DeviceItem/DeviceRequestItem.component";
import { Component } from "react";
import SolidAuth from "solid-auth-client";

export default class NewRequestDeviceComponent extends Component {
  constructor() {
    super();
    this.fetchRequestData();
  }

  fetchRequestData() {
    SolidAuth.trackSession((session) => {
      if (!session) console.log("no session");
      else {
        var hostName = new URL(session.webId)
        const url = `https://${hostName.hostname}/public/solidiotNotification.json`;

        const doc = SolidAuth.fetch(url);
        doc
          .then(async (response) => {
            const text = await response.text();
            if (response.ok) {
                console.log(JSON.parse(text));
                this.setState({devices: JSON.parse(text)});
            }
          })
          .catch(() => {});
      }
    });
  }

  state = {
    devices: [],
  };

  render() {
    return (
      <>
        <Container>
          <h3 style={{ marginTop: "10px" }}>new request from SoLiD-IoT Community: </h3>

          <ListGroup style={{ marginTop: "10px" }}>
            {this.state.devices.map((device) => (
              
              <DeviceRequestItem key={`${device.host}+${Math.random().toString(36).substring(7)}`} {...device} />
            ))}
          </ListGroup>

          {this.state.devices.length == 0 && (
            <Card>
              <Card.Body>No request has been found</Card.Body>
            </Card>
          )}
        </Container>
      </>
    );
  }
}
