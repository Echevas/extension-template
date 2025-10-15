import React from "react";
// import { EchoSignin } from "@/components/ui/echo-sign-in";
// import { Button } from "@/components/ui/button";
import { useEcho } from "@/hooks/useEcho";
import { EchoAccountButton } from "@/components/echo-account";

export const WelcomePage: React.FC = () => {
  // const { isAuthenticated, createPaymentLink } = useEcho();
  // const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  // const [paymentError, setPaymentError] = useState<string | null>(null);

  // const handleCreatePaymentLink = async () => {
  //   setIsCreatingPayment(true);
  //   setPaymentError(null);
    
  //   try {
  //     const paymentUrl = await createPaymentLink(
  //       1,
  //       "Echo Credits Purchase"
  //     );
      
  //     // Open payment link in a new tab using Chrome API
  //     chrome.tabs.create({ url: paymentUrl });
  //   } catch (error) {
  //     setPaymentError(error instanceof Error ? error.message : 'Failed to create payment link');
  //   } finally {
  //     setIsCreatingPayment(false);
  //   }
  // };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center gap-4">
      {/* <EchoSignin className="w-32 h-12 mb-4" /> */}

      <EchoAccountButton echo={useEcho()} />
      {/* {isAuthenticated && (
        <div className="flex flex-col items-center gap-2">
          <EchoAccountButton echo={useEcho()} />
          <Button 
            onClick={handleCreatePaymentLink}
            disabled={isCreatingPayment}
            variant="default"
          >
            {isCreatingPayment ? 'Creating...' : 'Buy Credits'}
          </Button>
          
          {paymentError && (
            <p className="text-sm text-red-500">{paymentError}</p>
          )}
        </div>
      )} */}
    </div>
  );
};