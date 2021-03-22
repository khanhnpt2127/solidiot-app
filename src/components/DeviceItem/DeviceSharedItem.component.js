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

export default class DeviceSharedItem extends Component {
  render() {
    const device = this.props;
    console.log(device);
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
                  <span style={{ marginLeft: "5px" }}>
                    {" "}
                    {device.name} - {device.owner}{" "}
                  </span>
                </Accordion.Toggle>
              </Col>
              <Col sm={4}>
                <Button variant="success" className="float-right">
                  Send Request
                </Button>
              </Col>
            </Row>

            <Accordion.Collapse eventKey="0">
              <Row>
                <Col sm={12}>
                  <h6 style={{ textTransform: "lowercase", fontSize: "12px" }}>
                    description:
                  </h6>
                  <p style={{backgroundColor : "rgb(50, 41, 49)", color: "white", padding: "10px", fontSize: "14px", borderRadius: "5px"}}> {device.desc} </p>
                </Col>
              </Row>
            </Accordion.Collapse>
          </Accordion>
        </Container>
      </ListGroup.Item>
    );
  }
}
