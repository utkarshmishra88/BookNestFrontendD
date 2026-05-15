import apiClient from '@/lib/axios';

/**
 * Wallet Service — wraps wallet-service REST endpoints.
 * Spring Boot: com.booknest.wallet.resource.WalletResource
 * Base path: /wallets
 * 
 * NOTE: Wallet topup now uses payment-service for Razorpay order creation.
 * Wallet service only handles balance fetch and debit operations.
 */
const walletService = {
  /**
   * GET /wallets/:userId
   * Fetch wallet balance and transaction statements.
   */
  getWallet: (userId) =>
    apiClient.get(`/wallets/${userId}`).then((r) => r.data),

  /**
   * POST /wallets/:userId/topup/create-order
   * Delegates to payment-service to create Razorpay order for wallet topup.
   * @param {number} userId
   * @param {{ amount: number }} body
   */
  createTopupOrder: (userId, body) =>
    apiClient.post(`/wallets/${userId}/topup/create-order`, body).then((r) => r.data),

  /**
   * POST /wallets/:userId/topup/verify
   * Verifies payment and credits wallet with topup amount.
   * @param {number} userId
   * @param {{ paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature }} body
   */
  verifyTopup: (userId, body) =>
    apiClient.post(`/wallets/${userId}/topup/verify`, body).then((r) => r.data),

  /**
   * POST /wallets/:userId/debit
   * Debit wallet balance (used internally by order-service for WALLET payment mode).
   * @param {number} userId
   * @param {{ amount: number, remarks?: string }} body
   */
  debitWallet: (userId, body) =>
    apiClient.post(`/wallets/${userId}/debit`, body).then((r) => r.data),
};

export default walletService;
