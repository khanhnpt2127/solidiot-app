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
  Form
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import JSONPretty from "react-json-pretty";
import ReactJson from "react-json-view";
import Switch from "react-switch";
export default class DeviceItem extends Component {
  constructor(){
    super();
    this.state = { checked: false };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(checked) {
    if(checked) {
      // write to solidiot 
    } else {
      // remove to solidiot
    }
    this.setState({ checked });
  }

  render() {
    const codeString = "var num = 1+1; ";
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
                <Switch className="float-right" onChange={this.handleChange} checked={this.state.checked} />
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
