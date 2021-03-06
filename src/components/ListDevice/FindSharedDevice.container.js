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
import DeviceFindShared from "../DeviceItem/DeviceFindSharedItem.component";
import { Component } from "react";
import SolidAuth from "solid-auth-client";

export default class FindSharedDeviceContaner extends Component {
  constructor() {
    super();
    this.fetchSearchData();
  }

  fetchSearchData() {
    const url = "https://solidiot.inrupt.net/public/solidiotPublic.json";
    const doc = SolidAuth.fetch(url);
    doc
      .then(async (response) => {
        const text = await response.text();
        if (response.ok) {
            this.setState({searchData: JSON.parse(text)});
        } 
      })
      .catch(() => {
      });
  }

  state = {
    searchString: "",
    devices: [],
    searchData: [],
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    var searchedDivices = []
    SolidAuth.trackSession(async (session) => {

    this.state.searchData.forEach((element) => {
        if(element.owner !== session.webId)
        element.devices.forEach((el) => {
            console.log(el);
            if(el.title.toLowerCase().includes(this.state.searchString.toLowerCase())) {

                var existedOwnerInSearchDevice = searchedDivices.find((d) => d.owner === element.owner);
                if(existedOwnerInSearchDevice){
                  existedOwnerInSearchDevice.devices.push(el);
                } else {
                  var newOwner = {
                    "owner": element.owner,
                    "devices": []
                  }
                  newOwner.devices.push(el);
                  searchedDivices.push(newOwner);

                }

                console.log(searchedDivices);
            }
        });
    });
    var transformedDevices = []
    searchedDivices.forEach((el) =>{
        el.devices.forEach((d) => {
            transformedDevices.push({ "name" : d.title,"id": d.id ,"owner": el.owner, "desc" : d.description })
        });
    });
    console.log(transformedDevices)
    this.setState({devices: transformedDevices}); });
  };

  render() {
    return (
      <>
        <Container>
          <h3 style={{ marginTop: "10px" }}>find resource(s) from community: </h3>
          <Form
            onSubmit={this.handleSubmit}
            inline
            style={{ marginTop: "10px" }}
          >
            <Form.Row className="align-items-center w-100">
              <Col>
                <Form.Control
                  size="md"
                  className="w-100"
                  placeholder="Search"
                  onChange={(event) =>
                    this.setState({ searchString: event.target.value })
                  }
                />
              </Col>
              <Col xs="auto">
                <Button variant="light" type="submit">
                  Submit
                </Button>
              </Col>
            </Form.Row>
          </Form>

          <ListGroup style={{ marginTop: "10px" }}>
            {this.state.devices.map((device) => (
               <DeviceFindShared key={device.id + device.owner}  {...device} />
            ))}
          </ListGroup>
          {this.state.devices.length == 0 && (
            <Card>
              <Card.Body>No device has been found</Card.Body>
            </Card>
          )}
        </Container>
      </>
    );
  }
}
