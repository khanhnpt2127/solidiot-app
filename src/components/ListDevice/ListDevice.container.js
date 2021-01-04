import React from "react";
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
import  DeviceItem  from '../DeviceItem/DeviceItem.component'
const ListDeviceContaner = (props) => {
  return (
    <>
      <Container style={{ marginTop: "10px" }}>
        <ListGroup>
           {props.devices.map((device) =>  <DeviceItem key={device.id} {...device}/>)}
        </ListGroup>
      </Container>
    </>
  );
}
 export default ListDeviceContaner;