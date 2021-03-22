import React from 'react'
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
export default function DeviceSharedItemContainer() {
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
                <span style={{ marginLeft: "5px" }}> {this.props.device.name} </span>
              </Col>
              <Col sm={4}>
                <Button variant="secondary" className="float-right">
                  <FontAwesomeIcon icon="cog" />
                </Button>
              </Col>
            </Row>
        </Container>
      </ListGroup.Item>
    )
}

