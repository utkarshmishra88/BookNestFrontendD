/**
 * Razorpay Standard Checkout — payment method blocks (includes UPI).
 * @see https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/display-configuration/
 */
export function razorpayDisplayConfig() {
  return {
    display: {
      sequence: [
        'block.card',
        'block.netbanking',
        'block.wallet',
        'block.emi',
        'block.upi',
        'block.paylater',
      ],
    },
  };
}
