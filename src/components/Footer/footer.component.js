import React from 'react';
import { IconLookup, IconDefinition, findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { withTranslation } from 'react-i18next';

type Props = {
  t: Function
};

const Footer = (props: Props) => {
  const { t } = props;
  const githubIcon: IconLookup = { prefix: 'fab', iconName: 'github' };
  const githubIconDef: IconDefinition = findIconDefinition(githubIcon);

  return (
    <footer className="solid-footer footer">
    </footer>
  );
};

export default withTranslation()(Footer);
