import React, { useState } from 'react';
import AccountTotal from './accountCards/account_total';
import AccountList from './account_list';
import Search from '../search';
import { AccountType } from '../../types/accountTypes';
import { round } from '../utils';

function AccountInfo({ data, selectedAccount, setSelectedAccount }: {
  data: AccountType[],
  selectedAccount: AccountType | Record<string, never>,
  setSelectedAccount: (account: AccountType | Record<string, never>) => void
}) {
  const [searchInput, setSearchInput] = useState('');

  let accounts = data;
  const totalAccount = data
    .map((account) => {
      if (!account.errorCode && account.balanceList) {
        return account.balanceList[0].openingAvailableAmount;
      }
      return 'Error';
    })
    .reduce(
      (prev, next) => {
        if (prev !== 'Error' && next !== 'Error') {
          return round(prev, next);
        }
        return 'Error';
      },
    );

  if (searchInput.length > 2) {
    accounts = accounts.filter((account: AccountType) => JSON.stringify(account)
      .toLowerCase()
      .includes(searchInput.toLowerCase()));
  }

  return (
    <div className="bg-gray-50 p-8 border-r border-gray-200 sm:w-2/5">
      <h2 className="text-2xl font-medium mb-4">Accounts</h2>

      <AccountTotal
        total={totalAccount}
        currency="USD"
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
      />

      <div className="flex justify-between items-center mt-4 mb-3">
        <h3 className="text-sm font-medium">All accounts</h3>
        <Search
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          searchText="Search Accounts"
          testingId="accountSearch"
        />
      </div>
      {accounts && (
        <AccountList data={accounts} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />
      )}
      {!accounts || (accounts.length < 1 && <div> No Accounts found </div>)}
    </div>
  );
}

export default AccountInfo;
