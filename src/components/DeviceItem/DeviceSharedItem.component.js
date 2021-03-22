import React, { Component } from "react";
import {
  ListGroup,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class DeviceSharedItem extends Component {
  render() {
    const device = this.props;
    console.log(device)
    return (
      <ListGroup.Item variant="success">
        <Container>
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
                <span style={{ marginLeft: "5px" }}> {device.name} </span>
              </Col>
              <Col sm={4}>
                <Button variant="success" className="float-right">
                    Send Request
                </Button>
              </Col>
            </Row>
        </Container>
      </ListGroup.Item>
    );
  }
}
