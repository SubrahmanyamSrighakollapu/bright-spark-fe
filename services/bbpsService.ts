'use client';

import { walletService } from './walletService';
import { ledgerService } from './ledgerService';

export type BbpsCategoryCode =
  | 'DTH' | 'BROADBAND' | 'BROADBAND_POSTPAID' | 'CABLE' | 'CABLE_TV'
  | 'CLUBS_ASSOCIATIONS' | 'CREDIT_CARD' | 'DATA_CARD_PREPAID' | 'DIGITAL_VOUCHER'
  | 'DONATION' | 'EDUCATION_FEES' | 'ELECTRICITY' | 'EMI_PAYMENT' | 'FASTAG'
  | 'FEE_PAYMENT' | 'GAS' | 'HOSPITAL_PATHOLOGY' | 'HOUSING_SOCIETY' | 'INSURANCE'
  | 'LANDLINE' | 'LANDLINE_POSTPAID' | 'LIC' | 'LIFE_INSURANCE' | 'LPG_BOOKING'
  | 'LPG_GAS' | 'MOBILE_POSTPAID' | 'MUNICIPAL_SERVICES' | 'MUNICIPAL_TAXES'
  | 'MUNICIPALITY' | 'NCMC_RECHARGE' | 'OTT' | 'PREPAID' | 'PREPAID_METER'
  | 'RECURRING_DEPOSIT' | 'RENTAL' | 'SUBSCRIPTION' | 'TRAFFIC_CHALLAN' | 'WATER'
  | 'WATER_SUPPLY';
export interface BbpsCategory { code: BbpsCategoryCode; name: string; description: string; icon: string; popular?: boolean; }
export interface BbpsBiller { id: string; category: BbpsCategoryCode; name: string; shortName: string; supportsFetch: boolean; minAmount: number; maxAmount: number; }
export interface BbpsBill { billerId: string; consumerId: string; customerName: string; billNumber: string; billPeriod: string; dueDate: string; billAmount: number; partialPaymentAllowed: boolean; fetchedAt: string; }
export interface BbpsPayment { id: string; retailerId: string; billerId: string; billerName: string; category: BbpsCategoryCode; consumerId: string; customerName: string; billNumber: string; amount: number; convenienceFee: number; gst: number; commission: number; totalWalletDebit: number; status: 'SUCCESS' | 'PENDING' | 'FAILED'; bbpsReference: string; transactionReference: string; createdAt: string; }

const HISTORY_KEY = 'qinstar_bbps_payments_v1';
export const BBPS_CATEGORIES: BbpsCategory[] = [
  { code: 'DTH', name: 'BBPS DTH', description: 'Direct-to-home television recharge', icon: 'Satellite', popular: true },
  { code: 'BROADBAND', name: 'Broadband', description: 'Fiber and broadband bills', icon: 'Wifi', popular: true },
  { code: 'BROADBAND_POSTPAID', name: 'Broadband Postpaid', description: 'Postpaid broadband bills', icon: 'Wifi' },
  { code: 'CABLE', name: 'Cable', description: 'Cable operator payments', icon: 'Cable' },
  { code: 'CABLE_TV', name: 'Cable TV', description: 'Cable television bills', icon: 'Tv' },
  { code: 'CLUBS_ASSOCIATIONS', name: 'Clubs and Associations', description: 'Membership and association dues', icon: 'Users' },
  { code: 'CREDIT_CARD', name: 'Credit Card', description: 'Credit-card bill payment', icon: 'CreditCard' },
  { code: 'DATA_CARD_PREPAID', name: 'Data Card Prepaid', description: 'Prepaid data-card recharge', icon: 'Router' },
  { code: 'DIGITAL_VOUCHER', name: 'Digital Voucher', description: 'Digital gift and service vouchers', icon: 'Ticket' },
  { code: 'DONATION', name: 'Donation', description: 'Payments to registered institutions', icon: 'HeartHandshake' },
  { code: 'EDUCATION_FEES', name: 'Education Fees', description: 'School and institution fees', icon: 'GraduationCap' },
  { code: 'ELECTRICITY', name: 'Electricity', description: 'State and private electricity boards', icon: 'Zap', popular: true },
  { code: 'EMI_PAYMENT', name: 'EMI Payment', description: 'Loan and finance EMI payments', icon: 'Landmark' },
  { code: 'FASTAG', name: 'FASTag', description: 'Vehicle FASTag recharge', icon: 'Car' },
  { code: 'FEE_PAYMENT', name: 'Fee Payment', description: 'Registered fee collections', icon: 'Receipt' },
  { code: 'GAS', name: 'Gas', description: 'Piped gas utility bills', icon: 'Flame' },
  { code: 'HOSPITAL_PATHOLOGY', name: 'Hospital and Pathology', description: 'Hospital and diagnostic payments', icon: 'Hospital' },
  { code: 'HOUSING_SOCIETY', name: 'Housing Society', description: 'Housing and maintenance dues', icon: 'House' },
  { code: 'INSURANCE', name: 'Insurance', description: 'Insurance premium payment', icon: 'ShieldCheck' },
  { code: 'LANDLINE', name: 'Landline', description: 'Landline and fixed-line bills', icon: 'Phone' },
  { code: 'LANDLINE_POSTPAID', name: 'Landline Postpaid', description: 'Postpaid landline bills', icon: 'PhoneCall' },
  { code: 'LIC', name: 'LIC', description: 'LIC premium collections', icon: 'BadgeIndianRupee' },
  { code: 'LIFE_INSURANCE', name: 'Life Insurance', description: 'Life insurance premiums', icon: 'ShieldPlus' },
  { code: 'LPG_BOOKING', name: 'LPG Booking', description: 'Domestic LPG cylinder booking', icon: 'Cylinder' },
  { code: 'LPG_GAS', name: 'LPG Gas', description: 'Domestic LPG booking payment', icon: 'Flame' },
  { code: 'MOBILE_POSTPAID', name: 'Mobile Postpaid', description: 'Postpaid mobile bill payment', icon: 'Smartphone', popular: true },
  { code: 'MUNICIPAL_SERVICES', name: 'Municipal Services', description: 'Local civic service payments', icon: 'Building2' },
  { code: 'MUNICIPAL_TAXES', name: 'Municipal Taxes', description: 'Property and municipal taxes', icon: 'Landmark' },
  { code: 'MUNICIPALITY', name: 'Municipality', description: 'Municipality bill payments', icon: 'Building' },
  { code: 'NCMC_RECHARGE', name: 'NCMC Recharge', description: 'National Common Mobility Card recharge', icon: 'Bus' },
  { code: 'OTT', name: 'OTT', description: 'Streaming subscription payments', icon: 'PlaySquare' },
  { code: 'PREPAID', name: 'Prepaid', description: 'Prepaid service recharge', icon: 'Smartphone' },
  { code: 'PREPAID_METER', name: 'Prepaid Meter', description: 'Prepaid utility meter recharge', icon: 'Gauge' },
  { code: 'RECURRING_DEPOSIT', name: 'Recurring Deposit', description: 'Recurring deposit instalments', icon: 'PiggyBank' },
  { code: 'RENTAL', name: 'Rental', description: 'Registered rental payments', icon: 'KeyRound' },
  { code: 'SUBSCRIPTION', name: 'Subscription', description: 'Registered subscription payments', icon: 'CalendarCheck' },
  { code: 'TRAFFIC_CHALLAN', name: 'Traffic Challan', description: 'Traffic penalty payments', icon: 'TrafficCone' },
  { code: 'WATER', name: 'Water', description: 'Municipal water utility bills', icon: 'Droplets' },
  { code: 'WATER_SUPPLY', name: 'Water Supply', description: 'Water board and supply payments', icon: 'Waves' },
];
export const BBPS_BILLERS: BbpsBiller[] = [
  { id: 'BILL_TSSPDCL', category: 'ELECTRICITY', name: 'TSSPDCL – Telangana Electricity', shortName: 'TSSPDCL', supportsFetch: true, minAmount: 10, maxAmount: 200000 },
  { id: 'BILL_APSPDCL', category: 'ELECTRICITY', name: 'APSPDCL – Andhra Pradesh Electricity', shortName: 'APSPDCL', supportsFetch: true, minAmount: 10, maxAmount: 200000 },
  { id: 'BILL_TATA_PLAY', category: 'DTH', name: 'Tata Play', shortName: 'Tata Play', supportsFetch: true, minAmount: 100, maxAmount: 10000 },
  { id: 'BILL_AIRTEL_DTH', category: 'DTH', name: 'Airtel Digital TV', shortName: 'Airtel DTH', supportsFetch: true, minAmount: 100, maxAmount: 10000 },
  { id: 'BILL_JIO_POST', category: 'MOBILE_POSTPAID', name: 'Jio Postpaid', shortName: 'Jio', supportsFetch: true, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_AIRTEL_POST', category: 'MOBILE_POSTPAID', name: 'Airtel Postpaid', shortName: 'Airtel', supportsFetch: true, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_JIO_FIBER', category: 'BROADBAND', name: 'JioFiber', shortName: 'JioFiber', supportsFetch: true, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_AIRTEL_FIBER', category: 'BROADBAND', name: 'Airtel Xstream Fiber', shortName: 'Airtel Fiber', supportsFetch: true, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_ICICI_FASTAG', category: 'FASTAG', name: 'ICICI Bank FASTag', shortName: 'ICICI FASTag', supportsFetch: false, minAmount: 100, maxAmount: 10000 },
  { id: 'BILL_IOCL_LPG', category: 'LPG_GAS', name: 'Indane Gas', shortName: 'Indane', supportsFetch: true, minAmount: 100, maxAmount: 5000 },
  { id: 'BILL_HMWSSB', category: 'WATER', name: 'Hyderabad Metropolitan Water Supply', shortName: 'HMWSSB', supportsFetch: true, minAmount: 10, maxAmount: 100000 },
  { id: 'BILL_BSNL', category: 'LANDLINE', name: 'BSNL Landline', shortName: 'BSNL', supportsFetch: true, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_LIC', category: 'INSURANCE', name: 'Life Insurance Corporation of India', shortName: 'LIC', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_SCHOOL', category: 'EDUCATION_FEES', name: 'Registered Education Institutions', shortName: 'Education Fees', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_HDFC_CC', category: 'CREDIT_CARD', name: 'HDFC Bank Credit Card', shortName: 'HDFC Card', supportsFetch: false, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_ACT_POST', category: 'BROADBAND_POSTPAID', name: 'ACT Fibernet Postpaid', shortName: 'ACT', supportsFetch: true, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_CABLE_LOCAL', category: 'CABLE', name: 'Registered Cable Operators', shortName: 'Cable', supportsFetch: true, minAmount: 50, maxAmount: 10000 },
  { id: 'BILL_HATHWAY_TV', category: 'CABLE_TV', name: 'Hathway Digital Cable TV', shortName: 'Hathway', supportsFetch: true, minAmount: 50, maxAmount: 10000 },
  { id: 'BILL_CLUBS', category: 'CLUBS_ASSOCIATIONS', name: 'Registered Clubs and Associations', shortName: 'Clubs', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_DATACARD', category: 'DATA_CARD_PREPAID', name: 'Prepaid Data Card Operators', shortName: 'Data Card', supportsFetch: false, minAmount: 10, maxAmount: 10000 },
  { id: 'BILL_VOUCHER', category: 'DIGITAL_VOUCHER', name: 'BBPS Digital Vouchers', shortName: 'Voucher', supportsFetch: false, minAmount: 10, maxAmount: 50000 },
  { id: 'BILL_DONATION', category: 'DONATION', name: 'Registered Charitable Institutions', shortName: 'Donation', supportsFetch: false, minAmount: 10, maxAmount: 200000 },
  { id: 'BILL_EMI', category: 'EMI_PAYMENT', name: 'Registered Loan and Finance Providers', shortName: 'EMI', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_FEES', category: 'FEE_PAYMENT', name: 'BBPS Registered Fee Collectors', shortName: 'Fees', supportsFetch: true, minAmount: 10, maxAmount: 200000 },
  { id: 'BILL_GAIL', category: 'GAS', name: 'GAIL Gas Limited', shortName: 'GAIL Gas', supportsFetch: true, minAmount: 10, maxAmount: 100000 },
  { id: 'BILL_HOSPITAL', category: 'HOSPITAL_PATHOLOGY', name: 'Registered Hospitals and Diagnostics', shortName: 'Hospital', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_HOUSING', category: 'HOUSING_SOCIETY', name: 'Registered Housing Societies', shortName: 'Housing', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_BSNL_POST', category: 'LANDLINE_POSTPAID', name: 'BSNL Landline Postpaid', shortName: 'BSNL Post', supportsFetch: true, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_LIC_DIRECT', category: 'LIC', name: 'Life Insurance Corporation of India', shortName: 'LIC', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_LIFE', category: 'LIFE_INSURANCE', name: 'Registered Life Insurance Providers', shortName: 'Life Cover', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_LPG_BOOK', category: 'LPG_BOOKING', name: 'Bharat Gas Cylinder Booking', shortName: 'Bharat Gas', supportsFetch: true, minAmount: 100, maxAmount: 5000 },
  { id: 'BILL_GHMC_SERVICE', category: 'MUNICIPAL_SERVICES', name: 'Greater Hyderabad Municipal Services', shortName: 'GHMC', supportsFetch: true, minAmount: 10, maxAmount: 200000 },
  { id: 'BILL_GHMC_TAX', category: 'MUNICIPAL_TAXES', name: 'Greater Hyderabad Municipal Taxes', shortName: 'GHMC Tax', supportsFetch: true, minAmount: 10, maxAmount: 200000 },
  { id: 'BILL_MUNICIPALITY', category: 'MUNICIPALITY', name: 'Registered Municipalities', shortName: 'Municipality', supportsFetch: true, minAmount: 10, maxAmount: 200000 },
  { id: 'BILL_NCMC', category: 'NCMC_RECHARGE', name: 'National Common Mobility Card', shortName: 'NCMC', supportsFetch: false, minAmount: 50, maxAmount: 10000 },
  { id: 'BILL_OTT', category: 'OTT', name: 'BBPS OTT Subscriptions', shortName: 'OTT', supportsFetch: false, minAmount: 10, maxAmount: 25000 },
  { id: 'BILL_PREPAID', category: 'PREPAID', name: 'BBPS Prepaid Services', shortName: 'Prepaid', supportsFetch: false, minAmount: 10, maxAmount: 10000 },
  { id: 'BILL_METER', category: 'PREPAID_METER', name: 'Prepaid Electricity Meter', shortName: 'Meter', supportsFetch: true, minAmount: 50, maxAmount: 50000 },
  { id: 'BILL_RD', category: 'RECURRING_DEPOSIT', name: 'Registered Recurring Deposit Providers', shortName: 'RD', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_RENT', category: 'RENTAL', name: 'BBPS Registered Rental Collection', shortName: 'Rental', supportsFetch: true, minAmount: 100, maxAmount: 200000 },
  { id: 'BILL_SUBSCRIPTION', category: 'SUBSCRIPTION', name: 'BBPS Subscription Services', shortName: 'Subscription', supportsFetch: true, minAmount: 10, maxAmount: 100000 },
  { id: 'BILL_CHALLAN', category: 'TRAFFIC_CHALLAN', name: 'Traffic Police Challan', shortName: 'Challan', supportsFetch: true, minAmount: 100, maxAmount: 100000 },
  { id: 'BILL_WATER_SUPPLY', category: 'WATER_SUPPLY', name: 'Registered Water Supply Boards', shortName: 'Water Board', supportsFetch: true, minAmount: 10, maxAmount: 100000 },
];

function readHistory(): BbpsPayment[] { if (typeof window === 'undefined') return []; try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } }
function saveHistory(items: BbpsPayment[]) { if (typeof window !== 'undefined') localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); }
function reference(prefix: string) { return `${prefix}${Date.now()}${Math.floor(Math.random() * 900 + 100)}`; }
function walletEntityId(retailerId: string) {
  const match = retailerId.match(/^(?:RET|ret_?)(\d+)$/i);
  return match ? `ent_rtl_${match[1].padStart(2, '0')}` : retailerId;
}

export const bbpsService = {
  getCategories: () => BBPS_CATEGORIES,
  getBillers: (category: BbpsCategoryCode) => BBPS_BILLERS.filter((biller) => biller.category === category),
  getWalletEntityId: walletEntityId,
  getHistory: (retailerId: string) => readHistory().filter((payment) => payment.retailerId === retailerId || retailerId === 'RET001'),
  async fetchBill(billerId: string, consumerId: string): Promise<BbpsBill> {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const biller = BBPS_BILLERS.find((item) => item.id === billerId);
    if (!biller) throw new Error('Select a valid BBPS biller.');
    const normalized = consumerId.replace(/\s+/g, '').toUpperCase();
    if (normalized.length < 6) throw new Error('Enter a valid consumer or account identifier.');
    const seed = Array.from(normalized).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const amount = Math.min(biller.maxAmount, Math.max(biller.minAmount, 350 + (seed % 4650)));
    const due = new Date(); due.setDate(due.getDate() + 7);
    return { billerId, consumerId: normalized, customerName: `BBPS CUSTOMER ${normalized.slice(-4)}`, billNumber: `BILL-${Date.now().toString().slice(-8)}`, billPeriod: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), dueDate: due.toISOString(), billAmount: amount, partialPaymentAllowed: !biller.supportsFetch, fetchedAt: new Date().toISOString() };
  },
  calculate(amount: number) { const convenienceFee = amount > 0 ? 5 : 0; const gst = +(convenienceFee * 0.18).toFixed(2); const commission = amount > 0 ? 3 : 0; return { convenienceFee, gst, commission, totalWalletDebit: +(amount + convenienceFee + gst).toFixed(2), netWalletMovement: +(amount + convenienceFee + gst - commission).toFixed(2) }; },
  async pay(retailerId: string, billerId: string, category: BbpsCategoryCode, bill: BbpsBill, amount: number): Promise<BbpsPayment> {
    const biller = BBPS_BILLERS.find((item) => item.id === billerId); if (!biller) throw new Error('Biller is unavailable.');
    if (bill.billerId !== billerId) throw new Error('The fetched bill does not match the selected biller. Please fetch it again.');
    if (Date.now() - new Date(bill.fetchedAt).getTime() > 15 * 60 * 1000) throw new Error('The fetched bill has expired. Please fetch the latest bill again.');
    if (!bill.partialPaymentAllowed && amount !== bill.billAmount) throw new Error('This biller requires the exact fetched bill amount.');
    if (amount < biller.minAmount || amount > biller.maxAmount) throw new Error(`Payment must be between ₹${biller.minAmount.toLocaleString('en-IN')} and ₹${biller.maxAmount.toLocaleString('en-IN')}.`);
    const duplicate = readHistory().some((item) => item.billNumber === bill.billNumber && item.status !== 'FAILED'); if (duplicate) throw new Error('This fetched bill has already been paid or submitted.');
    const charges = this.calculate(amount); const walletRes = await walletService.getRetailerWallet(walletEntityId(retailerId)); const wallet = walletRes.data;
    if (!wallet || wallet.availableBalance < charges.totalWalletDebit) throw new Error('Insufficient available wallet balance for this BBPS payment.');
    const txRef = reference('QSPBBPS'); const opening = wallet.availableBalance; wallet.availableBalance = +(opening - charges.totalWalletDebit + charges.commission).toFixed(2); wallet.ledgerBalance = +(wallet.ledgerBalance - charges.totalWalletDebit + charges.commission).toFixed(2); wallet.updatedAt = new Date().toISOString();
    ledgerService.addMockLedgerEntry({ walletId: wallet.walletId, entityId: retailerId, entityType: 'RETAILER', entityName: wallet.entityName, referenceId: txRef, entryType: 'PAY_OUT', openingBalance: opening, amount: charges.totalWalletDebit, closingBalance: +(opening - charges.totalWalletDebit).toFixed(2), direction: 'DEBIT', description: `BBPS ${biller.shortName} bill payment · ${bill.consumerId}`, createdBy: wallet.entityName });
    ledgerService.addMockLedgerEntry({ walletId: wallet.walletId, entityId: retailerId, entityType: 'RETAILER', entityName: wallet.entityName, referenceId: txRef, entryType: 'WALLET_CREDIT', openingBalance: +(opening - charges.totalWalletDebit).toFixed(2), amount: charges.commission, closingBalance: wallet.availableBalance, direction: 'CREDIT', description: `BBPS retailer commission · ${biller.shortName}`, createdBy: 'Qin Star BBPS Switch' });
    const payment: BbpsPayment = { id: `bbps_${Date.now()}`, retailerId, billerId, billerName: biller.name, category, consumerId: bill.consumerId, customerName: bill.customerName, billNumber: bill.billNumber, amount, ...charges, status: 'SUCCESS', bbpsReference: reference('BBPS'), transactionReference: txRef, createdAt: new Date().toISOString() };
    saveHistory([payment, ...readHistory()]); return payment;
  },
};
