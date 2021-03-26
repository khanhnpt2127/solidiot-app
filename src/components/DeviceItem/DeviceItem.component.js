import React, { Component } from "react";
import {
  ListGroup,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Accordion,
  AccordionCollapse,
  Card,
  Form,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import JSONPretty from "react-json-pretty";
import ReactJson from "react-json-view";
import Switch from "react-switch";
import SolidAuth from "solid-auth-client";
import { session } from "rdf-namespaces/dist/link";
export default class DeviceItem extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      checked:
        this.props.settings.isSearchable === undefined
          ? false
          : this.props.settings.isSearchable,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  async writeToPublic(data) {
    const urlPublic =
        "https://solidiot.inrupt.net/public/solidiotPublic.json";
    const result = await SolidAuth.fetch(urlPublic, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async addToPublic(deviceId) {
    SolidAuth.trackSession(async (session) => {
      const urlPublic =
        "https://solidiot.inrupt.net/public/solidiotPublic.json";
      const url = new URL(session.webId);
      const doc = SolidAuth.fetch(urlPublic);
      doc
        .then(async (response) => {
          const text = await response.text();
          var currSharedItems = JSON.parse(text);

          var deviceOwner = currSharedItems.find(
            (e) => e.owner === session.webId
          );
          if (deviceOwner.owner !== "") {
            deviceOwner.devices.push(this.props.rawDesc);
            await this.writeToPublic(currSharedItems);
          } else {
            var devices = [];
            devices.push(this.props.rawDesc);
            var newOwner = {
              owner: session.webId,
              devices: devices,
            };
            currSharedItems.push(newOwner);
            await this.writeToPublic(currSharedItems);
            console.log(newOwner);
          }
        })
        .catch((e) => {console.log(e)});
    });
  }

  async removeToPublic(deviceId) {
    SolidAuth.trackSession(async (session) => {
      const urlPublic =
        "https://solidiot.inrupt.net/public/solidiotPublic.json";
      const url = new URL(session.webId);
      const doc = SolidAuth.fetch(urlPublic);
      doc
        .then(async (response) => {
          const text = await response.text();
          var currSharedItems = JSON.parse(text);
          var deviceOwner = currSharedItems.find(
            (e) => e.owner === session.webId
          );

          console.log(deviceOwner.devices)
          deviceOwner.devices.splice(deviceOwner.devices.find((e) => e.id === this.props.id),1)
          await this.writeToPublic(currSharedItems);
        })
        .catch((e) => {console.log(e)});
    })
  }

  async writeToSetting(checked) {
    SolidAuth.trackSession(async (session) => {
      if (!session) console.log("not login");
      else {
        const url = new URL(session.webId);
        var urlIndexSetting = `https://${url.hostname}/solidiot-app/indexSettings.json`;

        const doc = SolidAuth.fetch(urlIndexSetting);

        await doc.then(async (res) => {
          const text = await res.text();
          if (res.ok) {
            var currSettings = JSON.parse(text);

            currSettings.forEach((e) => {
              if (e.id === this.props.id) {
                e.isSearchable = checked;
                console.log(e);
              }
            });

            const result = await SolidAuth.fetch(urlIndexSetting, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(currSettings),
            });
          }
        });
      }
    });
  }

  async handleChange(checked) {
    if (checked) {
      // write to solidiot
      this.writeToSetting(checked);
      this.addToPublic(this.props.id);
    } else {
      // remove to solidiot
      this.writeToSetting(checked);
      this.removeToPublic(this.props.id);
    }
    this.setState({ checked });
  }

  render() {
    const device = this.props;
    return (
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
                  <span style={{ marginLeft: "5px" }}> {device.name} </span>
                </Accordion.Toggle>
              </Col>
              <Col sm={4}>
                <Switch
                  className="float-right"
                  onChange={this.handleChange}
                  checked={this.state.checked}
                />
              </Col>
            </Row>

            <Accordion.Collapse eventKey="0">
              <Row>
                <Col sm={12}>
                  <h6 style={{ textTransform: "lowercase", fontSize: "12px" }}>
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
              </Row>
            </Accordion.Collapse>
          </Accordion>
        </Container>
      </ListGroup.Item>
    );
  }
}
