// @ts-ignore
import React, { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { useMutation, useQuery } from "react-query";
import { toast } from "react-toastify";
import { PageLayout } from "../../components/base/PageLayout";
import { PaymentProcessor } from "../../api/api";
import {
  PaymentProcessorSetting,
  Source,
  PaymentProcessorImportCustomerResponse,
  TransferSub,
  UpdatePaymentProcessorSettingParams,
} from "../../types/payment-processor-type";

const TOAST_POSITION = toast.POSITION.TOP_CENTER;

// create FC component called StripeIntegration
const StripeIntegrationView: FC = () => {
  // create variable called {id} and set it to type string
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSettingValue, setIsSettingValue] = useState(false);
  const [currentPaymentProcessorSetting, setCurrentPaymentProcessorSetting] =
    useState<PaymentProcessorSetting>();

  const getPaymentProcessorSettings = async (): Promise<
    PaymentProcessorSetting[]
  > =>
    PaymentProcessor.getPaymentProcessorSettings({ setting_group: "stripe" });

  const { error, data, isLoading } = useQuery<PaymentProcessorSetting[]>(
    ["stripe_settings"],
    getPaymentProcessorSettings
  );

  useEffect(() => {
    if (!isLoading && !error && data) {
      setCurrentPaymentProcessorSetting(
        data.filter(
          (item) =>
            item.setting_name === "generate_customer_after_creating_in_lotus"
        )[0]
      );
    }
  }, [isLoading, error, data]);

  const importCustomersMutation = useMutation(
    (post: Source) => PaymentProcessor.importCustomers(post),
    {
      onSuccess: (data: PaymentProcessorImportCustomerResponse) => {
        toast.success(data.detail, {
          position: TOAST_POSITION,
        });
      },
      onError: () => {
        toast.error("Failed to Import Customers", {
          position: TOAST_POSITION,
        });
      },
    }
  );

  const importPaymentsMutation = useMutation(
    (post: Source) => PaymentProcessor.importPayments(post),
    {
      onSuccess: (data: PaymentProcessorImportCustomerResponse) => {
        toast.success(data.detail, {
          position: TOAST_POSITION,
        });
      },

      onError: () => {
        toast.error("Failed to Import Payments", {
          position: TOAST_POSITION,
        });
      },
    }
  );

  const resolveAfter3Sec = new Promise((resolve) => setTimeout(resolve, 3000));

  const transferSubscriptionsMutation = useMutation(
    (post: TransferSub) => PaymentProcessor.transferSubscriptions(post),
    {
      onSuccess: (data: PaymentProcessorImportCustomerResponse) => {
        toast.success(data.detail, {
          position: TOAST_POSITION,
        });
      },
      onError: () => {
        toast.error("Failed to transfer subscriptions", {
          position: TOAST_POSITION,
        });
      },
    }
  );

  const updatePaymentProcessorSettings = useMutation(
    (post: UpdatePaymentProcessorSettingParams) =>
      PaymentProcessor.updatePaymentProcessorSetting(post),
    {
      onSuccess: (data: PaymentProcessorSetting) => {
        setCurrentPaymentProcessorSetting(data);
        setIsSettingValue(false);
        const state =
          data.setting_values.value === true ? "Enabled" : "Disabled";
        toast.success(`${state} Create Lotus Customers In Stripe`, {
          position: TOAST_POSITION,
        });
      },
      onError: () => {
        setIsSettingValue(false);
        toast.error("Failed to Update Create Lotus Customers In Stripe", {
          position: TOAST_POSITION,
        });
      },
    }
  );

  // promises to handle toast loading messages

  // create variable called returnToDashboard and set it to type void
  const returnToDashboard = () => {
    navigate(-1);
  };

  // create return statement
  return (
    <PageLayout
      title="Stripe Integration"
      extra={<Button onClick={returnToDashboard}>Back to Integrations</Button>}
    >
      <div className="w-6/12">
        <h2 className="text-16px mb-10">
          Charge and invoice your customers through your Stripe account
        </h2>
        <div className="grid grid-cols-2 justify-start items-center gap-6 border-2 border-solid rounded border-[#EAEAEB] px-6 py-10">
          <h3>Import Stripe Customers:</h3>
          <Button
            size="large"
            className="w-4/12"
            onClick={() => {
              const promise = importCustomersMutation.mutateAsync({
                source: "stripe",
              });
              toast.promise(promise, {
                pending: "Importing Customers From Stripe",
              });
            }}
          >
            Import
          </Button>
          <h3 className="mx-0">Import Stripe Payments:</h3>
          <Button
            size="large"
            className="w-4/12"
            onClick={() => {
              const promise = importPaymentsMutation.mutateAsync({
                source: "stripe",
              });
              toast.promise(promise, {
                pending: "Importing Past Payments From Stripe",
              });
            }}
          >
            Import
          </Button>
          <h3>Transfer Subscriptions:</h3>
          <Button
            size="large"
            className="w-4/12"
            onClick={() => {
              const promise = transferSubscriptionsMutation.mutateAsync({
                source: "stripe",
                end_now: false,
              });
              toast.promise(promise, {
                pending: "Transfering Subscriptions From Stripe",
              });
            }}
          >
            Transfer
          </Button>
          <h3>Create Lotus Customers In Stripe:</h3>
          <div className="flex h-6 items-center">
            <input
              id="comments"
              aria-describedby="comments-description"
              name="comments"
              type="checkbox"
              disabled={isSettingValue || !currentPaymentProcessorSetting}
              checked={
                currentPaymentProcessorSetting?.setting_values.value === true
              }
              onChange={(value) => {
                currentPaymentProcessorSetting &&
                  updatePaymentProcessorSettings.mutate({
                    setting_values: value.target.checked,
                    setting_id: currentPaymentProcessorSetting.setting_id,
                  });
                setIsSettingValue(true);
              }}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="seperator" />
        <div />
      </div>
    </PageLayout>
  );
};

export default StripeIntegrationView;
