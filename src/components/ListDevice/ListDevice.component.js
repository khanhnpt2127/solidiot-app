import React, { Component } from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Toast from "react-bootstrap/Toast";
import {
  ListGroup,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class ListDevice extends Component {
  render() {
    return (
      <Container style={{ marginTop: "10px" }}>
        <ListGroup>
          <ListGroup.Item variant="success">
            <Container>
              <Row>
                <Col sm={8} style={{ margin: "auto" }}>
                  <OverlayTrigger
                    key="top"
                    placement="top"
                    overlay={<Tooltip id={`tooltip-top}`}> click to deactive </Tooltip>}
                  >
                    <Button
                      variant="success"
                      style={{ minHeight: "26px" }}
                    ></Button>
                  </OverlayTrigger>
                  <span style={{ marginLeft: "5px" }}> New Device # 1 </span>
                </Col>
                <Col sm={4}>
                  <Button variant="secondary" className="float-right">
                    <FontAwesomeIcon icon="cog" />
                  </Button>
                </Col>
              </Row>
            </Container>
          </ListGroup.Item>
          <ListGroup.Item variant="danger">Device #2 </ListGroup.Item>
          <ListGroup.Item variant="warning">Device #3 </ListGroup.Item>
          <ListGroup.Item variant="light"> Device #4</ListGroup.Item>
        </ListGroup>
      </Container>
    );
  }
}
