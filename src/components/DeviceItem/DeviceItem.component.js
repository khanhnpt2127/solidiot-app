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
import DeviceSharedWhom from "./DeviceSharedWhom.component";
import { AccessControlList, ACLFactory } from "@inrupt/solid-react-components";
import axios from "axios";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
export default class DeviceItem extends Component<Props> {
  constructor(props) {
    super(props);
    this.props.settings.sharedPeople.map((e) => console.log(e));
    this.state = {
      checked:
        this.props.settings.isSearchable === undefined
          ? false
          : this.props.settings.isSearchable,
    };
    this.handleChange = this.handleChange.bind(this);
  }
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
  async writeToPublic(data) {
    const urlPublic = "https://solidiot.inrupt.net/public/solidiotPublic.json";
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
      console.log(url);
      const doc = SolidAuth.fetch(urlPublic);
      doc
        .then(async (response) => {
          const text = await response.text();
          var currSharedItems = JSON.parse(text);

          var deviceOwner = currSharedItems.find(
            (e) => e.owner === session.webId
          );
          console.log(deviceOwner);
          if (deviceOwner !== undefined && deviceOwner.owner !== "") {
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
        .catch((e) => {
          console.log(e);
        });
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

          console.log(deviceOwner.devices);
          deviceOwner.devices.splice(
            deviceOwner.devices.find((e) => e.id === this.props.id),
            1
          );
          await this.writeToPublic(currSharedItems);
        })
        .catch((e) => {
          console.log(e);
        });
    });
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
  handleRevoke(e, userId, deviceId) {
    e.preventDefault();
    console.log(userId);
    console.log(deviceId);
    // 1 - call api to revoke

    SolidAuth.trackSession(async (session) => {
      if (!session) console.log("the user is not loggged in");
      else {
        var webId = session.webId;
        var hostName = new URL(webId);
        var requesterUrl = new URL(userId);
        let deviceIdExtracted = this.extractDeviceId(deviceId)
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
          window.location.reload();
          // 3 - set waiting message
        });
      }
    });

    // 2 - remove sharedItem
    // 3 - noti?
  }

  async handleFetchNewData(e) {
    e.preventDefault();

    console.log("fetch data....");

    SolidAuth.trackSession(async (session) => {
      if (!session) console.log("The user is not logged in");
      else {
        const url = new URL(session.webId);
        const resp = await axios.get(
          `https://localhost:44312/api/Devices/${this.props.id}`
        );
        var dev = this.props;
        console.log(dev.data);
        const found = dev.data.some((i) => i.id === resp.data.data.id);
        if (!found) {
          resp.data.data.value = JSON.parse(resp.data.data.value);
          this.props.data.push(resp.data.data);
          await this.createDeviceData(
            JSON.stringify(this.props.data),
            dev.id,
            url.hostname
          );
        }
      }
    });
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
                    <Tooltip id={`tooltip-top}`}>
                      {" "}
                      click to fetch new data{" "}
                    </Tooltip>
                  }
                >
                  <Button
                    variant="success"
                    style={{ minHeight: "26px" }}
                    onClick={(e) => this.handleFetchNewData(e)}
                  >
                    {" "}
                    <FontAwesomeIcon icon={faDownload} className="fa-sm" />{" "}
                  </Button>
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
              <Container>
                <Row>
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
                </Row>
                <Row>
                  <Col sm={12} style={{ marginTop: "10px" }}>
                    <h6
                      style={{ textTransform: "lowercase", fontSize: "12px" }}
                    >
                      Share with:
                    </h6>

                    <ListGroup>
                      {this.props.settings.sharedPeople.map((ppl) => (
                        <ListGroup.Item key={ppl} variant="warning">
                          <Container>
                            <Row>
                              <Col sm={8} style={{ margin: "auto" }}>
                                <a style={{ color: "#856404" }} href={ppl}>
                                  {ppl}
                                </a>
                              </Col>
                              <Col sm={4}>
                                <Button
                                  variant="danger"
                                  className="float-right"
                                  onClick={(e) =>
                                    this.handleRevoke(e, ppl, device.id)
                                  }
                                >
                                  Revoke
                                </Button>
                              </Col>
                            </Row>
                          </Container>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Col>
                </Row>
              </Container>
            </Accordion.Collapse>
          </Accordion>
        </Container>
      </ListGroup.Item>
    );
  }
}
