import React, { useEffect, useState } from 'react';
import { graphql } from '@apollo/client/react/hoc';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import MemberForm from './MemberForm';

import { H1, H4, P } from '../../Text';
import { Flex, Box } from '../../Grid';
import Modal, { ModalBody, ModalHeader, ModalFooter } from '../../StyledModal';
import StyledButton from '../../StyledButton';

import { API_V2_CONTEXT, gqlV2 } from '../../../lib/graphql/helpers';

const EditMemberModal = props => {
  const { intl, member, index, editMember, show: showModal } = props;

  const [show, setShow] = React.useState(showModal);
  return (
    <React.Fragment>
      <Modal show onClose={() => setShow(false)}>
        <ModalHeader>
          <FormattedMessage id="editTeam.member.edit" defaultMessage="Edit Team Member" />
        </ModalHeader>
        <ModalBody>
          <MemberForm intl={intl} member={member} index={index} editMember={editMember} />
        </ModalBody>
        <ModalFooter>
          <StyledButton mx={20} onClick={() => setShow(false)}>
            Cancel
          </StyledButton>
          <StyledButton
            buttonStyle="primary"
            onClick={() => {
              alert('ok!');
              setShow(false);
            }}
          >
            Go with this version
          </StyledButton>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default EditMemberModal;
