import React from "react";
import {
  ListGroup,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Card
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DeviceItem from "../DeviceItem/DeviceItem.component";
const ListDeviceContaner = (props) => {
  return (
    <>
      <Container style={{ marginTop: "10px" }}>
        <ListGroup>
          {props.devices.map((device) => (
            <DeviceItem key={device.id} {...device} />
          ))}
        </ListGroup>
        { props.devices.length == 0 &&
        <Card>
          <Card.Body>
            No device has been found
          </Card.Body>
        </Card>
        }
      </Container>
    </>
  );
};
export default ListDeviceContaner;
