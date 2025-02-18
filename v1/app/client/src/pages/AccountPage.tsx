import React, { useEffect, useState } from 'react';
import AccountInfo from '../components/accountInformationPanel/index';
import TransactionInfo from '../components/transactionInformationPanel/index';
import usePostBalanceData from '../hooks/usePostBalanceData';
import Spinner from '../components/spinner';
import { AppContext, Environment } from '../context/AppContext';
import balanceMockDataUntyped from '../mockedJson/uf-balances.json';
import transactionMockDataUntyped from '../mockedJson/uf-transactions.json';
import { config } from '../config';
import { AccountType } from '../types/accountTypes';
import { TransactionType } from '../types/transactionTypes';
import useTransactionGet from '../hooks/useTransactionGet';
import { gatherPath } from '../components/utils';

const balanceMockData: AccountType[] = balanceMockDataUntyped as AccountType[];
const transactionMockData: TransactionType[] = transactionMockDataUntyped as TransactionType[];

function AccountPage() {
  const { accountsConfig } = config;
  const [selectedAccount, setSelectedAccount] = useState({});
  const { currentEnvironment } = React.useContext(AppContext);

  const balanceResults = usePostBalanceData(
    gatherPath(currentEnvironment, accountsConfig.apiDetails[0]),
    accountsConfig.apiDetails[0].cacheKey,
    accountsConfig.apiDetails[0].refreshInterval,
    JSON.stringify(accountsConfig.apiDetails[0].body),
    currentEnvironment,
  );

  const transactionResults = useTransactionGet(
    gatherPath(currentEnvironment, accountsConfig.apiDetails[1]),
    accountsConfig.apiDetails[1].cacheKey,
    accountsConfig.apiDetails[1].refreshInterval,
    currentEnvironment,
  );

  useEffect(() => {
    setSelectedAccount({});
  }, [currentEnvironment, setSelectedAccount]);

  const displayAccountPanel = (data: AccountType[]) => (
    <AccountInfo
      data={data}
      selectedAccount={selectedAccount}
      setSelectedAccount={setSelectedAccount}
    />
  );

  const displayTransactionPanel = (data: TransactionType[]) => (
    <TransactionInfo
      transactions={data}
      selectedAccount={selectedAccount}
    />
  );

  const displayPanels = () => {
    if (currentEnvironment === Environment.MOCKED) {
      return (
        <div className="flex flex-wrap">
          {displayAccountPanel(balanceMockData)}
          {displayTransactionPanel(transactionMockData)}
        </div>
      );
    }
    else {
      if (balanceResults.isError || transactionResults.isError) {
        return (
          <div className="text-center pt-24" data-cy="errorMessage">
            Error gathering information from API. Toggle on mocked data below to see example information
          </div>
        );
      } if (balanceResults.data && transactionResults.data) {
        return (
          <div className="flex flex-wrap">
            {displayAccountPanel(balanceResults?.data)}
            {displayTransactionPanel(transactionResults?.data)}
          </div>
        );
      }
      return (
        <div className="text-center pt-24">
          <Spinner />
        </div>
      );
    }
  }

  return (
    <>
      {displayPanels()}
    </>
  );
}

export default AccountPage;
