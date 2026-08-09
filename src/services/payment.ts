import { Platform } from 'react-native';
import { useAppStore } from './store';

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvv: string;
}

export interface PaymentItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface PaymentDetails {
  items: PaymentItem[];
  totalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  buyerEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  errorMessage?: string;
  transactionStatus?: 'SUCCESS' | 'FAILURE' | 'THREE_D_SECURE_REQUIRED';
  threeDSecureUrl?: string; // For PayTR/Iyzico 3D secure flow redirection
}

/**
 * Payment Service for Mezatliyoruz.
 * This class abstracts the mock payment logic and prepares the foundation 
 * for direct integration with IyziCo or PayTR.
 */
export class PaymentService {
  /**
   * Processes card payments.
   * In production, this will make a HTTP POST request to your backend API,
   * which then securely communicates with PayTR or IyziCo servers.
   * 
   * NEVER call IyziCo/PayTR APIs directly from the React Native app because:
   * 1. API Keys and Secrets must NEVER be stored on the client/mobile app.
   * 2. PCI-DSS compliance requires secure server-to-server calls for card tokenization.
   */
  static async processPayment(
    card: CardDetails,
    payment: PaymentDetails
  ): Promise<PaymentResponse> {
    // 1. Simulate network request delay (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Client-side sanity checks
    const cleanCardNumber = card.cardNumber.replace(/\s/g, '');
    const cleanExpiry = card.cardExpiry.replace(/\s/g, '');
    const cleanCvv = card.cardCvv.replace(/\s/g, '');

    if (!card.cardHolder.trim()) {
      return { success: false, errorMessage: 'Kart sahibi adı geçersiz.' };
    }
    if (cleanCardNumber.length < 16) {
      return { success: false, errorMessage: 'Kredi kartı numarası 16 haneli olmalıdır.' };
    }
    if (cleanExpiry.length < 5 || !cleanExpiry.includes('/')) {
      return { success: false, errorMessage: 'Son kullanma tarihi geçersiz (AA/YY).' };
    }
    if (cleanCvv.length < 3) {
      return { success: false, errorMessage: 'CVV kodu 3 haneli olmalıdır.' };
    }

    // Security Check: Server-side validation of cart items price against DB listings
    const state = useAppStore.getState();
    const calculatedTotal = payment.items.reduce((sum, item) => {
      const dbListing = state.listings.find(l => l.id === item.id);
      if (!dbListing) return sum;

      // Check if there is an accepted chat offer for this listing
      const matchingChat = state.chats.find(c => c.listingId === item.id);
      let activePrice = dbListing.price;
      if (matchingChat) {
        const acceptedOffer = matchingChat.messages.find(m => m.type === 'offer' && m.offerStatus === 'accepted');
        if (acceptedOffer && acceptedOffer.offerAmount) {
          activePrice = acceptedOffer.offerAmount;
        }
      }

      return sum + activePrice * item.quantity;
    }, 0);

    if (Math.abs(calculatedTotal - payment.totalAmount) > 0.01) {
      return {
        success: false,
        errorMessage: 'Güvenlik Hatası: Fiyat manipülasyonu veya tutarsızlığı tespit edildi! İşlem engellendi.',
        transactionStatus: 'FAILURE'
      };
    }

    // 3. Test Cases for Mocking Payment Results
    // You can test different card numbers to trigger specific scenarios:
    
    // Insufficient Funds Case (Limit Yetersiz)
    if (cleanCardNumber.endsWith('9999')) {
      return {
        success: false,
        errorMessage: 'PayTR Hata Kodu: [100] - Kart bakiyesi/limiti yetersiz. Lütfen başka bir kart deneyin.',
        transactionStatus: 'FAILURE'
      };
    }

    // 3D Secure Redirection Mock Case
    if (cleanCardNumber.endsWith('8888')) {
      return {
        success: true,
        transactionStatus: 'THREE_D_SECURE_REQUIRED',
        threeDSecureUrl: 'https://sandbox-api.iyzipay.com/payment/threeDSecureMock',
        errorMessage: '3D Secure doğrulaması gerekiyor.'
      };
    }

    // Fraud check mockup
    if (cleanCardNumber.startsWith('4111 1111 1111 1112')) {
      return {
        success: false,
        errorMessage: 'Iyzico Hata Kodu: [5099] - Şüpheli işlem tespiti. Bankanızla iletişime geçin.',
        transactionStatus: 'FAILURE'
      };
    }

    // Default Successful Payment
    const generatedPaymentId = 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const generatedOrderId = 'MZ-' + Math.floor(100000 + Math.random() * 900000);

    // ==========================================
    // PRODUCTION INTEGRATION NOTES:
    // ==========================================
    /*
    // Example backend endpoint call for PayTR / Iyzico:
    try {
      const response = await fetch('https://your-api-endpoint.com/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          card: {
            holderName: card.cardHolder,
            number: cleanCardNumber,
            expireMonth: cleanExpiry.split('/')[0],
            expireYear: '20' + cleanExpiry.split('/')[1],
            cvv: cleanCvv
          },
          payment: {
            amount: payment.totalAmount,
            currency: 'TRY',
            buyer: {
              name: payment.shippingName,
              phone: payment.shippingPhone,
              address: payment.shippingAddress
            },
            items: payment.items.map(item => ({
              id: item.id,
              name: item.title,
              price: item.price,
              quantity: item.quantity
            }))
          }
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, errorMessage: 'Bağlantı hatası oluştu.' };
    }
    */

    return {
      success: true,
      paymentId: generatedPaymentId,
      orderId: generatedOrderId,
      transactionStatus: 'SUCCESS'
    };
  }

  /**
   * Simulates a secure PCI-DSS card tokenization request to PayTR/Iyzico.
   * In production, this would securely send card data directly to the payment gateway
   * from the client, returning a secure payment token, so the raw card numbers
   * never touch our main server veritabanı.
   */
  static async tokenizeCard(card: CardDetails): Promise<{ success: boolean; token?: string; cardSummary?: string; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Network delay

    const cleanCardNumber = card.cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 16) {
      return { success: false, error: 'Kredi kartı numarası geçersiz.' };
    }

    const last4 = cleanCardNumber.slice(-4);
    const isVisa = cleanCardNumber.startsWith('4');
    const brandName = isVisa ? 'Visa' : 'Mastercard';

    const generatedToken = 'tok_' + brandName.toLowerCase() + '_' + Math.random().toString(36).substring(2, 10);
    return {
      success: true,
      token: generatedToken,
      cardSummary: `${brandName} (**** ${last4})`
    };
  }

  /**
   * Processes card payments using a previously saved token.
   * This is extremely secure because no raw card numbers are sent across the wire.
   */
  static async processPaymentWithToken(
    token: string,
    payment: PaymentDetails
  ): Promise<PaymentResponse> {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Network delay

    // Security Check: Server-side validation of cart items price against DB listings
    const state = useAppStore.getState();
    const calculatedTotal = payment.items.reduce((sum, item) => {
      const dbListing = state.listings.find(l => l.id === item.id);
      if (!dbListing) return sum;

      // Check if there is an accepted chat offer for this listing
      const matchingChat = state.chats.find(c => c.listingId === item.id);
      let activePrice = dbListing.price;
      if (matchingChat) {
        const acceptedOffer = matchingChat.messages.find(m => m.type === 'offer' && m.offerStatus === 'accepted');
        if (acceptedOffer && acceptedOffer.offerAmount) {
          activePrice = acceptedOffer.offerAmount;
        }
      }

      return sum + activePrice * item.quantity;
    }, 0);

    if (Math.abs(calculatedTotal - payment.totalAmount) > 0.01) {
      return {
        success: false,
        errorMessage: 'Güvenlik Hatası: Fiyat manipülasyonu veya tutarsızlığı tespit edildi! İşlem engellendi.',
        transactionStatus: 'FAILURE'
      };
    }

    const generatedPaymentId = 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const generatedOrderId = 'MZ-' + Math.floor(100000 + Math.random() * 900000);

    return {
      success: true,
      paymentId: generatedPaymentId,
      orderId: generatedOrderId,
      transactionStatus: 'SUCCESS'
    };
  }
}
