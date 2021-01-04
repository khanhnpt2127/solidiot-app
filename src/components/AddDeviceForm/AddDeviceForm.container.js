import AddDeviceForm from "./AddDeviceForm.component";
import React, { Component } from "react";
import { Jumbotron, Container } from "react-bootstrap";
import * as rs from '../../utils/resourceMessages'
export default class AddDeviceFormContainer extends Component {
  state = {
    devices: [],
  };

  addNewDevice = (deviceData) => {
    const found = this.state.devices.some((item) => deviceData.device.id == item.device.id)
    if(!found){
      this.setState(prevState => ({
        devices: [...prevState.devices, deviceData],
      }));
      //TODO: create config file, ACL an save json to storage

      // TODO: add name later
      this.props.onNewDevice({ id: deviceData.device.id, name: deviceData.device.deviceName });
    } else {
      console.log(rs.DUPLICATE_INVALID);
      this.props.messages(rs.DUPLICATE_INVALID);
    }
  };

  render() {
    return (
      <Container>
        <Jumbotron>
          <h1>Solidiot App</h1>
          <p>
            This is a simple hero unit, a simple jumbotron-style component for
            calling extra attention to featured content or information.
          </p>
          <AddDeviceForm onSubmit={this.addNewDevice} />
        </Jumbotron>
      </Container>
    );
  }
}
