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
import DeviceSharedItem from "../DeviceItem/DeviceSharedItem.component";
const ListSharedDeviceContaner = (props) => {
  return (
    <>
      <Container style={{ marginTop: "10px" }}>
        <h3>{props.title}: </h3>

        <ListGroup>
          {props.devices.map((device) => (
            <DeviceItem key={device.id} {...device} />
          ))}
        </ListGroup>
        {props.devices.length == 0 && (
          <Card>
            <Card.Body>No device has been found</Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
};
export default ListSharedDeviceContaner;
