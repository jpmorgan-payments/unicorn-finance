/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AppContext, Environment } from '../../context/AppContext';
import { PaymentsResponse, GlobalPaymentRequest } from '../../types/globalPaymentApiTypes';
import { config } from '../../config';
import Spinner from '../spinner';
import APIDetails from '../api_details';
import FormButton from './form_button';
import { sendPostGlobalPaymentInit } from '../../hooks/usePostGlobalPaymentInit';
import SendPaymentForm from './send_payment_form';
import Banner from './banner';
import { gatherPath } from '../utils';

function MakePaymentForm() {
  const {
    displayingApiData, currentEnvironment
  } = React.useContext(AppContext);
  const { paymentConfig } = config;
  const [apiResponse, setApiResponse] = React.useState<PaymentsResponse>();
  const [apiError, setApiError] = React.useState<Error>();

  const createPaymentMutation = useMutation({
    mutationFn: (data: GlobalPaymentRequest) => sendPostGlobalPaymentInit(gatherPath(currentEnvironment, paymentConfig.apiDetails[0]), JSON.stringify(data)),
  });

  const formReset = () => {
    createPaymentMutation.reset();
    setApiResponse(undefined);
    setApiError(undefined);
  };

  useEffect(() => {
    formReset()
  }, [currentEnvironment])

  return (
    <div className=" w-full flex flex-col h-full pb-20">
      {displayingApiData && (
        <APIDetails details={paymentConfig.apiDetails[0]} absolute={false} />
      )}
      {!displayingApiData && (apiError || apiResponse?.errors) && (
        <>
          <Banner
            bannerText={`Error processing your request: ${apiError && apiError.message ? apiError.message : ''}`}
            isSuccess={false}
          />
          {apiResponse?.errors && (
            <pre
              id="json"
              className="border-2 border-dashed border-gray-200 w-full m-2 p-2 overflow-x-auto mb-10"
            >
              {JSON.stringify(apiResponse?.errors, undefined, 2)}
            </pre>
          )}
          <FormButton
            buttonText="Return"
            buttonType="button"
            onClickFunction={formReset}
          />
        </>
      )}
      {!displayingApiData && (createPaymentMutation.isLoading) && <div className="text-center pt-24"><Spinner text="Loading API Response..." /></div>}
      {((!displayingApiData && createPaymentMutation.isSuccess) || (currentEnvironment === Environment.MOCKED && apiResponse)) && (!apiError && !apiResponse?.errors) && (
        <>
          <Banner bannerText="Success! API response details:" isSuccess />
          <pre
            id="json"
            className="border-2 border-dashed border-gray-200 w-full m-2 p-2 overflow-x-auto mb-10"
          >
            {JSON.stringify(apiResponse?.paymentInitiationResponse, undefined, 2)}
          </pre>
          <FormButton
            buttonText="Make another payment"
            buttonType="button"
            onClickFunction={formReset}
          />
        </>
      )}
      {(!displayingApiData && ((createPaymentMutation.isIdle && currentEnvironment !== Environment.MOCKED) || (currentEnvironment === Environment.MOCKED && !apiResponse))) && (
        <SendPaymentForm setApiResponse={setApiResponse} setApiError={setApiError} createPaymentMutation={createPaymentMutation} />
      )}

    </div>
  );
}
export default MakePaymentForm;
