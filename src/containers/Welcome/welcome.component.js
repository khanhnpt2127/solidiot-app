import React from "react";
import { Uploader } from "@inrupt/solid-react-components";
import { Trans, useTranslation } from "react-i18next";
import AddDeviceFormContainer from "../../components/AddDeviceForm/AddDeviceForm.container";
import AlertPopup from '../../components/AlertPopup/index'
import ShowDevice from "../../components/ListDevice/ListDevice.container";
import { ImageProfile } from "@components";
import { errorToaster } from "@utils";
import { Container } from "react-bootstrap";
/**
 * Welcome Page UI component, containing the styled components for the Welcome Page
 * Image component will get theimage context and resolve the value to render.
 * @param props
 */
export const WelcomePageContent = (props) => {
  const { webId, image, updatePhoto, name, messages } = props;
  const { t } = useTranslation();
  const limit = 2100000;
  return (
    <>
      <Container style={{marginTop: "10px"}}>
        <AlertPopup />
        <AddDeviceFormContainer  />
        <ShowDevice />
      </Container>
    </>
  );
};
