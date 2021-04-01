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
  Form,
} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import JSONPretty from "react-json-pretty";
import ReactJson from "react-json-view";
import Switch from "react-switch";
import SolidAuth from "solid-auth-client";
import { session } from "rdf-namespaces/dist/link";



export default class DeviceSharedWhom extends Component {
    constructor() {
        super();
        console.log(this.props)
    }
    render() {
        const ppl = this.props
        return (
            <>
                <h2>{ppl}</h2>
            </>
        );
    }
}