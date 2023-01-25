import {  rest } from 'msw'

// Mock Data
export const transactionsMockedResponse ={
    data: [
      {
        account: {
          accountId: '000000010975001',
          accountName: 'OFFICE 123 INC',
          bankId: '02100002',
          branchId: '',
          bankName: 'JPMORGAN CHASE BANK, N.A. - NEW YOR',
          currency: {
            code: 'USD',
            description: 'US DOLLAR',
            decimalLocation: 2,
            currencySequence: 0,
          },
          aba: '021000021',
        },
        asOfDateTime: '2023-01-18T15:00:12Z',
        valueDateTime: '2023-01-17T15:00:12Z',
        asOfDate: '2023-01-18',
        valueDate: '2023-01-17',
        recordTimestamp: '2022-09-30T15:00:12Z',
        lastUpdate: null,
        receivedTimestamp: '2022-09-30T15:00:12Z',
        productGroup: {
          groupCode: 'D/R',
          groupDescription: 'DEPOSIT AND REMITTANCE',
          wire: false,
        },
        debitCreditCode: 'CREDIT',
        baiType: {
          typeCode: '399',
          summaryTypeCode: '390',
          description: 'MISCELLANEOUS CREDIT',
          shortDescription: 'INDIV OTHER/MISC',
          groupCode: 'OTHER',
          groupDescription: 'OTHER',
          productGroupCode: 'MISC',
          btrsTypeCode: '399',
          germanTypeCode: '835',
          swiftTypeCode: 'MSC',
        },
        ddaTxnCode: '194',
        originalTransactionCode: null,
        fundsTypeCode: 'SAME',
        currency: {
          code: 'USD',
          description: 'US DOLLAR',
          decimalLocation: 2,
          currencySequence: 0,
        },
        amount: 3.0,
        immediateAvailable: 3.0,
        day1Available: 0.0,
        day2Available: 0.0,
        day2PlusAvailable: null,
        day3PlusAvailable: 0.0,
        bankReferenceSearchable: {
          standardValue: '1175392306PG',
          searchValue: '1175392306PG',
        },
        customerReferenceSearchable: {
          standardValue: '',
          searchValue: null,
        },
        wireReferenceSearchable: null,
        repairCode: '',
        reversal: false,
        override: false,
        transactionStatus: 'O',
        shortDescription: 'C6337025D00003C',
        wireType: 'EMPTY',
        checkNumber: 0,
        lockboxSequenceCode: '',
        lockboxItems: 0.0,
        lockboxNumber: '',
        lockboxDepositDate: null,
        lockboxDepositTime: null,
        narrativeText: {
          'YOUR REF    ': 'MISCELLANEOUS CREDIT',
          'REMARK      ': 'C6337025D00003C TCOINREDEMPTION C6337025D00003C',
          'VAL DATE    ': '08/01/2022',
        },
        narrativeTypeCode: 'T',
        addenda: null,
        floatSpreadCode: '3',
        sepaDetailsXml: null,
        postCode: 'I',
        supplementalTextSet: {},
        supplementalTextRecordList: null,
        supplementalText: null,
        thirdPartyBank: false,
        achBatchItems: null,
        sepaType: false,
        transactionId: 'TXN-C-779702312-7',
        loggedAt: '2022-09-30T11:00:12.722739',
      },
    ],
  }

 export const serviceStatusMockedResponse = {
    bankStatus: [
      {
        clearingSystem: 'TCH',
        participantId: '071000288T1',
        participantName: 'BMO Harris Bank',
        status: 'COMPLETE',
      },
      {
        clearingSystem: 'TCH',
        participantId: '200000041T1',
        participantName: 'Bankers Bank Test3',
        status: 'INTERMITTENT',
      },
      {
        clearingSystem: 'TCH',
        participantId: '200000036T1',
        participantName: 'COCC Test Bank',
        status: 'OFFLINE',
      },
    ],
  };

  export const accountBalanceMockedResponse = {
    accountList: [
      {
        accountId: '000000010900009',
        accountName: 'TEST ACCOUNT NAME',
        branchId: '',
        bankId: '02100002',
        bankName: 'JPMORGAN CHASE',
        currency: {
          code: 'USD',
          currencySequence: 0,
          decimalLocation: 2,
          description: 'US DOLLAR',
        },
        balanceList: [
          {
            asOfDate: '2022-08-31',
            recordTimestamp: '2023-01-11T15:01:26Z',
            currentDay: true,
            openingAvailableAmount: 949452989.03,
            openingLedgerAmount: 949452989.03,
            endingAvailableAmount: 949445988.80,
            endingLedgerAmount: 949445988.80,
          },
        ],
      },
    ],
  };
  const errorResponse = {
    errors: [
      {
        errorCode: 'GCA-099',
        errorMsg: 'System is Unavailable',
      },
    ],
  };

// Define handlers that catch the corresponding requests and returns the mock data.
export const handlers = [

  rest.get('*/api/tsapi/v2/transactions', (req, res, ctx) => {
    const statusCode = req.url.searchParams.get('statusCode');
    if(statusCode === "500"){
        return res(ctx.status(500), ctx.json(errorResponse))
    }
    return res(ctx.status(200), ctx.json(transactionsMockedResponse))
  }),
  rest.get('*/api/tsapi/v1/participants', (req, res, ctx) => {
    const statusCode = req.url.searchParams.get('statusCode');
    if(statusCode === "500"){
        return res(ctx.status(500), ctx.json(errorResponse))
    }
    return res(ctx.status(200), ctx.json(serviceStatusMockedResponse))
  }),
  rest.post('*/api/accessapi/balance', (req, res, ctx) => {
    const statusCode = req.url.searchParams.get('statusCode');
    if(statusCode === "500"){
        return res(ctx.status(500), ctx.json(errorResponse))
    }
    return res(ctx.status(200), ctx.json(accountBalanceMockedResponse))
  }),




]
