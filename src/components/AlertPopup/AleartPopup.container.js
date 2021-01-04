import { Container } from "react-bootstrap";
import { Alert, Button } from "react-bootstrap";
import React, { Component } from "react";

export const AleartPopupContainer = (props) => {
  let variant= "";
  let title="";
  switch (props.errCode) {
    case 1:
      title  = "Error";
      variant= "danger";
      break;
    case 2:
      title= "Warning";
      variant= "warning" ;
      break;
    default:
      break;
  }
  return (
    <>
      {props.errCode !== -1 && (
        <Container>
          <Alert variant={variant}>
            <Alert.Heading>{title}</Alert.Heading>
            <p>{props.errMessage}</p>
            <hr />
            <div className="d-flex justify-content-end">
              <Button
                variant={"outline-" + variant}
                onClick={(event) => {                    
                  event.preventDefault();
                  props.onClose();
                }}
              >
                Close me y'all!
              </Button>
            </div>
          </Alert>
        </Container>
      )}
    </>
  );
};
