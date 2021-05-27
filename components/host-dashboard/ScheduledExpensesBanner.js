import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import { create, Mode } from '@transferwise/approve-api-action-helpers';
import { FormattedMessage } from 'react-intl';

import { addAuthTokenToHeader } from '../../lib/api';
import { API_V2_CONTEXT, gqlV2 } from '../../lib/graphql/helpers';

import { expensesListAdminFieldsFragment, expensesListFieldsFragment } from '../expenses/graphql/fragments';
import { Box, Flex } from '../Grid';
import TransferwiseIcon from '../icons/TransferwiseIcon';
import MessageBox from '../MessageBox';
import StyledButton from '../StyledButton';

const scheduledExpensesQuery = gqlV2/* GraphQL */ `
  query HostDashboardScheduledExpenses(
    $hostId: String!
    $limit: Int!
    $status: ExpenseStatusFilter
    $payoutMethodType: PayoutMethodType
  ) {
    expenses(host: { id: $hostId }, limit: $limit, status: $status, payoutMethodType: $payoutMethodType) {
      totalCount
      offset
      limit
      nodes {
        ...ExpensesListFieldsFragment
        ...ExpensesListAdminFieldsFragment
      }
    }
  }

  ${expensesListFieldsFragment}
  ${expensesListAdminFieldsFragment}
`;

const ScheduledExpensesBanner = ({ host, secondButton }) => {
  const scheduledExpenses = useQuery(scheduledExpensesQuery, {
    variables: { hostId: host.id, limit: 100, status: 'SCHEDULED_FOR_PAYMENT', payoutMethodType: 'BANK_ACCOUNT' },
    context: API_V2_CONTEXT,
  });

  const request = create({ mode: process.env.WISE_ENVIRONMENT === 'production' ? Mode.PRODUCTION : Mode.SANDBOX });
  const hasScheduledExpenses = scheduledExpenses.data?.expenses?.totalCount > 0;
  const handlePayBatch = async () => {
    const expenseIds = scheduledExpenses.data.expenses.nodes.map(e => e.id);
    await request(`${process.env.WEBSITE_URL}/api/services/transferwise/pay-batch`, {
      method: 'POST',
      body: JSON.stringify({ expenseIds, hostId: host.id }),
      headers: addAuthTokenToHeader(),
    });
  };

  if (!hasScheduledExpenses) {
    return null;
  }
  return (
    <MessageBox type="success" mb={4}>
      <Flex alignItems="center" justifyContent="space-between">
        <Box>
          <TransferwiseIcon size="1em" color="#25B869" mr={2} />
          <FormattedMessage
            id="expenses.scheduled.notification"
            defaultMessage="You have {count, plural, one {# expense} other {# expenses}} scheduled for payment."
            values={{ count: scheduledExpenses.data.expenses.totalCount }}
          />
        </Box>
        <Box>
          {secondButton}
          <StyledButton buttonSize="tiny" buttonStyle="successSecondary" onClick={handlePayBatch}>
            Pay Batch
          </StyledButton>
        </Box>
      </Flex>
    </MessageBox>
  );
};

ScheduledExpensesBanner.propTypes = {
  host: PropTypes.shape({
    id: PropTypes.string,
  }).isRequired,
  secondButton: PropTypes.node,
};

export default ScheduledExpensesBanner;
