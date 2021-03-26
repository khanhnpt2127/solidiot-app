import React, { Component } from "react";
import data from "@solid/query-ldflex";
import { namedNode } from "@rdfjs/data-model";
import { successToaster, errorToaster } from "@utils";
import AddDeviceFormContainer from "../../components/AddDeviceForm/AddDeviceForm.container";
import { AleartPopupContainer } from "../../components/AlertPopup/AleartPopup.container";
import ShowDevice from "../../components/ListDevice/ListDevice.container";
import ShowSharedDevice from "../../components/ListDevice/ListSharedDevice.container";
import FindSharedDevice from "../../components/ListDevice/FindSharedDevice.container";
import { Container } from "react-bootstrap";
import SolidAuth from "solid-auth-client";
import { AccessControlList, ACLFactory } from "@inrupt/solid-react-components";
import NewRequestComponent from "../../components/ListDevice/NewRequestDevice.component";
import {createNonExistentDocument } from '../../utils/ldflex-helper'
const defaultProfilePhoto = "/img/icon/empty-profile.svg";

/**
 * Container component for the Welcome Page, containing example of how to fetch data from a POD
 */
export class WelcomeComponent extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      image: defaultProfilePhoto,
      isLoading: false,
      hasImage: false,
      errCode: -1,
      errMess: "",
      devices: [],
      sharedDevices: [],
    };
    this.init()
  }

  async init() {
    
    const { webId } = this.props;
    const url = new URL(webId);

    var urlIndex = `https://${url.hostname}/solidiot-app/index.json`;
    var urlSharedItem = `https://${url.hostname}/public/sharedItems.json`;
    var urlNotification = `https://${url.hostname}/public/solidiotNotification.json`;
    createNonExistentDocument(urlIndex, '[]');
    createNonExistentDocument(urlSharedItem, '[]');
    createNonExistentDocument(urlNotification, '[]');

    this.fetchCurrData();
    this.fetchSharedData();
    this.grantNotificationPermission();

  }




  async grantNotificationPermission() {
    const { webId } = this.props;
    var hostName = new URL(webId);

    const permissions = [
      {
        agents: null,
        modes: [AccessControlList.MODES.READ, AccessControlList.MODES.WRITE],
      },
    ];
    const ACLFile = await ACLFactory.createNewAcl(
      webId,
      `https://${hostName.hostname}/public/`
    );
    await ACLFile.createACL(permissions);
  }

  fetchSharedData() {
    const { webId } = this.props;
    const url = new URL(webId);

    var urlSharedItem = `https://${url.hostname}/public/sharedItems.json`;
    const doc = SolidAuth.fetch(urlSharedItem);
    doc
      .then(async (response) => {
        const text = await response.text();
        if (response.ok) {
          var currDevices = JSON.parse(text);
          currDevices.forEach((element) => {
            let hostname = element.host;
            let deviceId = element.deviceID;
            var urlDesc = `https://${hostname}/solidiot-app/${deviceId}/desc.jsonld`;

            const doc = SolidAuth.fetch(urlDesc);

            doc
              .then(async (response) => {
                const text = await response.text();
                if (response.ok) {
                  var currDevice = JSON.parse(text);
                  this.setState((prevState) => ({
                    sharedDevices: [
                      ...prevState.sharedDevices,
                      { id: element.deviceID, desc: currDevice.description ,name: currDevice.title, owner: element.host ,isShared: element.isAccepted },
                    ],
                  }));
                }
              })
              .catch(() => {});
          });
        }
      })
      .catch(() => {});
  }

  async fetchCurrDeviceData(hostname, deviceId) {
    var urlData = `https://${hostname}/solidiot-app/${deviceId}/data.json`;
    const doc = SolidAuth.fetch(urlData);
    let dData = await doc
      .then(async (response) => {
        const text = await response.text();
        if (response.ok) {
          let deviceData = JSON.parse(text);
          return deviceData;
        }
      })
      .catch(() => {});
    return dData;
  }

  async fetchCurrData() {
    const { webId } = this.props;
    const url = new URL(webId);

    var urlIndex = `https://${url.hostname}/solidiot-app/index.json`;
    const doc = SolidAuth.fetch(urlIndex);
    await doc
      .then(async (response) => {
        const text = await response.text();
        if (response.ok) {
          var currDevices = JSON.parse(text);
          currDevices.forEach(async (element) => {
            var urlDesc = `https://${url.hostname}/solidiot-app/${element}/desc.jsonld`;
            const doc = SolidAuth.fetch(urlDesc);

            await doc
              .then(async (response) => {
                const text = await response.text();
                if (response.ok) {
                  var currDevice = JSON.parse(text);
                  var deviceData = await this.fetchCurrDeviceData(
                    url.hostname,
                    element
                  );
                  console.log(deviceData);
                  this.setState((prevState) => ({
                    devices: [
                      ...prevState.devices,
                      { id: element, name: currDevice.title, data: deviceData },
                    ],
                  }));
                }
              })
              .catch(() => {});
          });
        }
      })
      .catch(() => {});
  }

  componentDidMount() {
    const { webId } = this.props;
    if (webId) this.getProfileData();
  }

  componentDidUpdate(prevProps) {
    const { webId } = this.props;
    if (webId && webId !== prevProps.webId) this.getProfileData();
  }

  /**
   * This function retrieves a user's card data and tries to grab both the user's name and profile photo if they exist.
   *
   * This is an example of how to use the LDFlex library to fetch different linked data fields.
   */
  getProfileData = async () => {
    this.setState({ isLoading: true });
    let hasImage;
    const { webId } = this.props;
    console.log(webId);
    /*
     * This is an example of how to use LDFlex. Here, we're loading the webID link into a user variable. This user object
     * will contain all of the data stored in the webID link, such as profile information. Then, we're grabbing the user.name property
     * from the returned user object.
     */
    const user = data[webId];
    const nameLd = await user.vcard_fn;

    const name =
      nameLd && nameLd.value.trim().length > 0
        ? nameLd.value
        : webId.toString();
    const imageLd = await user.vcard_hasPhoto;

    let image;
    if (imageLd && imageLd.value) {
      image = imageLd.value;
      hasImage = true;
    } else {
      hasImage = false;
      image = defaultProfilePhoto;
    }
    /**
     * This is where we set the state with the name and image values. The user[hasPhotoContext] line of code is an example of
     * what to do when LDFlex doesn't have the full context. LDFlex has many data contexts already in place, but in case
     * it's missing, you can manually add it like we're doing here.
     *
     * The hasPhotoContext variable stores a link to the definition of the vcard ontology and, specifically, the #hasPhoto
     * property that we're using to store and link the profile image.
     *
     * For more information please go to: https://github.com/solid/query-ldflex
     */
    this.setState({ name, image, isLoading: false, hasImage });
  };

  /**
   * updatedPhoto will update the photo url on vcard file
   * this function will check if user has image or hasPhoto node if not
   * will just update it, the idea is use image instead of hasPhoto
   * @params{String} uri photo url
   */
  updatePhoto = async (uri: String, message, title = "") => {
    const { hasImage } = this.state;
    try {
      const { user } = data;
      if (hasImage) await user.vcard_hasPhoto.set(namedNode(uri));
      else await user.vcard_hasPhoto.add(namedNode(uri));
      successToaster(message, title);
    } catch (error) {
      errorToaster(error.message, "Error");
    }
  };
  showMessage = (message) => {
    console.log(message.data);
    this.setState({ errCode: message.code, errMess: message.data });
  };
  closeMessage = () => {
    this.setState({ errCode: -1, errMessage: "" });
  };

  addNewDevice = (newDevice) => {
    console.log(newDevice);
    this.setState((prevState) => ({
      devices: [...prevState.devices, newDevice],
    }));
  };

  render() {
    const { name, image, isLoading } = this.state;
    const { webId } = this.props;
    return (
      <>
        <Container style={{ marginTop: "10px" }}>
          <AleartPopupContainer
            onClose={this.closeMessage}
            errCode={this.state.errCode}
            errMessage={this.state.errMess}
          />
          <AddDeviceFormContainer
            messages={this.showMessage}
            onNewDevice={this.addNewDevice}
          />
          <ShowDevice title="your devices" devices={this.state.devices} />
          <ShowSharedDevice
            title="shared device"
            devices={this.state.sharedDevices}
          />
          <FindSharedDevice />
          <NewRequestComponent />
        </Container>
      </>
    );
  }
}
