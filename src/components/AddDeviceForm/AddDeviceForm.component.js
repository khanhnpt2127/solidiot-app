import React, { Component } from "react";
import axios from "axios";
import SolidAuth from "solid-auth-client";
import ldflex from "@solid/query-ldflex";
import { AccessControlList, ACLFactory } from "@inrupt/solid-react-components";

import {Form, Button, Col} from "react-bootstrap";
export default class AddDeviceForm extends Component {
  state = { host: "" };

  async handleSave(event) {
    event.preventDefault();

    // Not using LDFlex here, because this is not an RDF document.
    // const url = "https://tkngx.inrupt.net/share/some-doc.txt";
    // const result = SolidAuth.fetch(url, {
    //   method: 'PUT',
    //   body: "ok da change",
    //   headers: {
    //     'Content-Type': 'text/plain'
    //   }
    // });

    // if (result.ok) {
    //   // successToaster(t('notifications.saved'));
    // } else if (result.ok === false) {
    //   // errorToaster(t('notifications.errorSaving'));
    // }
  }

  handleLoad(event) {
    event.preventDefault();
    const url = "https://tkngx.inrupt.net/share/some-doc.txt";
    const doc = SolidAuth.fetch(url);
    doc
      .then(async (response) => {
        const text = await response.text();
        if (response.ok) {
          console.log(text);
        } else if (response.status === 404) {
          // successToaster(t('notifications.404'));
        } else {
          // errorToaster(t('notifications.errorLoading'));
        }
        // const wacAllowModes = extractWacAllow(response);
        // setEditable(wacAllowModes.user.write);
        // setSharable(wacAllowModes.user.control);
        // setLoaded(true);
      })
      .catch(() => {
        // errorToaster(t('notifications.errorFetching'));
      });
  } // assuming the logged in user doesn't change without a page refresh

  handleSubmit = async (event) => {
    event.preventDefault();
    const resp = await axios.get(this.state.host);
    console.log(resp.data);
    //this.props.onSubmit(resp.data);
    this.setState({host: ''})
  };

  handleSoIoT = async (event) => {
    event.preventDefault();
    const resp = await axios.get("https://localhost:44312/api/Devices");

    await this.props.onSubmit(resp.data,true);
  }


  render() {
    return (
      <>
      <Form onSubmit={this.handleSubmit}> 
        <Form.Row>
          <Col>
            <Form.Control value={this.state.host} 
                          placeholder="Please enter your IoT host" 
                          onChange={(event) => this.setState({host: event.target.value})}/>
          </Col>
          <Col>
            <Button variant="primary" type="submit">Add Device</Button>
            <Button variant="success" style={{"marginLeft" : "5px"}} onClick={this.handleSoIoT}>SoIoT Repository</Button>
          </Col>
        </Form.Row>
      </Form>
      </>
    );
  }
}
