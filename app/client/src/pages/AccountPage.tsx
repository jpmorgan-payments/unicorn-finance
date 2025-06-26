import React, { useEffect, useState } from "react";
import AccountInfo from "../components/accountInformationPanel/index";
import TransactionInfo from "../components/transactionInformationPanel/index";
import usePostBalanceData from "../hooks/usePostBalanceData";
import Spinner from "../components/spinner";
import { AppContext, Environment } from "../context/AppContext";
import balanceMockDataUntyped from "../mockedJson/uf-balances.json";
import transactionMockDataUntyped from "../mockedJson/uf-transactions.json";
import { config } from "../config";
import { AccountType } from "../types/accountTypes";
import { TransactionType } from "../types/transactionTypes";
import useTransactionGet from "../hooks/useTransactionGet";
import { gatherPath } from "../components/utils";

const balanceMockData: AccountType[] = balanceMockDataUntyped as AccountType[];
const transactionMockData: TransactionType[] =
  transactionMockDataUntyped as TransactionType[];

function AccountPage() {
  const { accountsConfig } = config;
  const [selectedAccount, setSelectedAccount] = useState({});
  const { currentEnvironment } = React.useContext(AppContext);

  const balanceResults = usePostBalanceData(
    gatherPath(currentEnvironment, accountsConfig.apiDetails[0]),
    accountsConfig.apiDetails[0].cacheKey,
    accountsConfig.apiDetails[0].refreshInterval,
    JSON.stringify(accountsConfig.apiDetails[0].body),
    currentEnvironment
  );

  const transactionResults = useTransactionGet(
    gatherPath(currentEnvironment, accountsConfig.apiDetails[1]),
    accountsConfig.apiDetails[1].cacheKey,
    accountsConfig.apiDetails[1].refreshInterval,
    currentEnvironment
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
    <TransactionInfo transactions={data} selectedAccount={selectedAccount} />
  );

  const displayPanels = () => {
    if (currentEnvironment === Environment.MOCKED) {
      return (
        <div className="flex flex-wrap">
          {displayAccountPanel(balanceMockData)}
          {displayTransactionPanel(transactionMockData)}
        </div>
      );
    } else {
      // If both balance and transaction data fail, show error
      if (balanceResults.isError && transactionResults.isError) {
        return (
          <div className="text-center pt-24" data-cy="errorMessage">
            Error gathering information from API. Toggle on mocked data below to
            see example information
          </div>
        );
      }

      // If we have either balance data or transaction data (or both), display what we have
      if (
        balanceResults.data ||
        transactionResults.data ||
        (!balanceResults.isLoading && !transactionResults.isLoading)
      ) {
        return (
          <div className="flex flex-wrap">
            {/* Display balance panel if data exists, otherwise show error or empty state */}
            {balanceResults.isError ? (
              <div className="p-4 text-center text-red-600">
                Unable to load balance data. Please try again later.
              </div>
            ) : balanceResults.data && balanceResults.data.length > 0 ? (
              displayAccountPanel(balanceResults.data)
            ) : balanceResults.data && balanceResults.data.length === 0 ? (
              <div className="p-4 text-center text-gray-600">
                No balance data available.
              </div>
            ) : null}

            {/* Display transaction panel if data exists, otherwise show error or loading */}
            {transactionResults.isError ? (
              <div className=" p-4 text-center text-red-600">
                Unable to load transaction data. Please try again later.
              </div>
            ) : transactionResults.data ? (
              displayTransactionPanel(transactionResults.data)
            ) : (
              <div className="text-center p-4">
                <Spinner />
                <p className="mt-2 text-gray-600">Loading transactions...</p>
              </div>
            )}
          </div>
        );
      }

      // Show loading spinner while waiting for both data sources
      return (
        <div className="text-center pt-24">
          <Spinner />
        </div>
      );
    }
  };

  return <>{displayPanels()}</>;
}

export default AccountPage;
