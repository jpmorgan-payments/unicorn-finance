import {  rest } from 'msw'
import transactionsMockedResponse from '../mockedJson/uf-transactions.json';
import accountBalanceMockedResponse from '../mockedJson/uf-balances.json';
import serviceStatusMockedResponse from '../mockedJson/uf-service-status.json';


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
    return res(ctx.status(200), ctx.json({data:transactionsMockedResponse}))
  }),
  rest.get('*/api/tsapi/v1/participants', (req, res, ctx) => {
    const statusCode = req.url.searchParams.get('statusCode');
    if(statusCode === "500"){
        return res(ctx.status(500), ctx.json(errorResponse))
    }
    return res(ctx.status(200), ctx.json({bankStatus:serviceStatusMockedResponse}))
  }),
  rest.post('*/api/accessapi/balance', (req, res, ctx) => {
    const statusCode = req.url.searchParams.get('statusCode');
    if(statusCode === "500"){
        return res(ctx.status(500), ctx.json(errorResponse))
    }
    return res(ctx.status(200), ctx.json({accountList:accountBalanceMockedResponse}))
  }),




]
