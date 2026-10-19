"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
  id: string; // B-Connect Txn ID starting with CC01
  agentId: string;
  billerId: string;
  billerName: string;
  category: string;
  customerName: string;
  customerNumber: string;
  billNumber: string;
  billDate: string;
  billPeriod: string;
  dueDate: string;
  billAmount: number;
  lateFee: number;
  additionalCharges: number;
  fixedCharges: number;
  convenienceFee: number;
  totalAmount: number;
  paymentMode: string;
  date: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  approvalNumber: string;
  channel: string;
}

export interface Complaint {
  complaintId: string;
  agentId: string;
  transactionId?: string;
  mobileNumber?: string;
  complaintType: string;
  disposition: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  assignedTo: string;
  currentStage: "Submitted" | "Assigned to Nodal Officer" | "Under Investigation" | "Resolution Pending" | "Resolved";
  createdDate: string;
  lastUpdatedDate: string;
}

export interface BillFetchParams {
  category: string;
  billerId: string;
  billerName: string;
  mobileNumber: string;
  customerNumber: string;
  caNumber: string;
  customerName: string;
  email: string;
  additionalParams: Record<string, string>;
}

export interface BillDetails {
  billerId: string;
  billerName: string;
  category: string;
  customerName: string;
  customerNumber: string;
  caNumber: string;
  billDate: string;
  billPeriod: string;
  billNumber: string;
  dueDate: string;
  baseAmount: number;
  latePaymentFee: number;
  additionalCharges: number;
  fixedCharges: number;
  convenienceFee: number;
  selectedOptions: {
    baseAmount: boolean;
    latePaymentFee: boolean;
    additionalCharges: boolean;
    fixedCharges: boolean;
  };
  paymentMode: string;
}

interface BBPSState {
  isAuthenticated: boolean;
  agentInfo: {
    agentId: string;
    retailerName: string;
    agencyName: string;
    mobile: string;
    email: string;
    terminalId: string;
    walletBalance: number;
    settlementBank: string;
    settlementAccount: string;
    ifscCode: string;
    bbpsLicenseNo: string;
  };

  // Active payment workflow state
  currentFetchParams: Partial<BillFetchParams>;
  currentBillDetails: BillDetails | null;
  lastTransaction: Transaction | null;

  // History & registry
  transactions: Transaction[];
  complaints: Complaint[];

  // Actions
  login: () => void;
  logout: () => void;
  setFetchParams: (params: Partial<BillFetchParams>) => void;
  setBillDetails: (details: BillDetails) => void;
  toggleAmountOption: (optionKey: keyof BillDetails["selectedOptions"]) => void;
  setPaymentMode: (mode: string) => void;
  processPayment: () => Transaction;
  addComplaint: (complaint: Omit<Complaint, "complaintId" | "createdDate" | "lastUpdatedDate" | "assignedTo" | "currentStage" | "status" | "agentId">) => Complaint;
  getComplaintById: (id: string) => Complaint | undefined;
  getTransactionById: (id: string) => Transaction | undefined;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "CC01982374910234",
    agentId: "AG-883920",
    billerId: "OTME00005XXZ43",
    billerName: "Adani Electricity Mumbai Ltd",
    category: "Electricity",
    customerName: "Rajesh Sharma",
    customerNumber: "9898990084",
    billNumber: "EL-2026-99201",
    billDate: "2026-07-28",
    billPeriod: "JUL-2026",
    dueDate: "2026-08-15",
    billAmount: 1850,
    lateFee: 0,
    additionalCharges: 25,
    fixedCharges: 15,
    convenienceFee: 10,
    totalAmount: 1900,
    paymentMode: "Agent Wallet",
    date: "2026-08-07 14:32:10",
    status: "SUCCESS",
    approvalNumber: "APPR-992810",
    channel: "Retailer Web Portal",
  },
  {
    id: "CC01882194019284",
    agentId: "AG-883920",
    billerId: "OTNS00005XXZ43",
    billerName: "Airtel Postpaid & Broadband",
    category: "Mobile Postpaid",
    customerName: "Priya Sundaram",
    customerNumber: "9898990083",
    billNumber: "MB-2026-88124",
    billDate: "2026-07-25",
    billPeriod: "JUL-2026",
    dueDate: "2026-08-10",
    billAmount: 899,
    lateFee: 50,
    additionalCharges: 0,
    fixedCharges: 0,
    convenienceFee: 10,
    totalAmount: 959,
    paymentMode: "Cash",
    date: "2026-08-07 11:15:42",
    status: "SUCCESS",
    approvalNumber: "APPR-881923",
    channel: "Retailer Web Portal",
  },
  {
    id: "CC01773920194821",
    agentId: "AG-883920",
    billerId: "IGL000001IND01",
    billerName: "Indraprastha Gas Limited (IGL)",
    category: "Gas",
    customerName: "Amit Kumar",
    customerNumber: "9876543210",
    billNumber: "GAS-2026-44120",
    billDate: "2026-07-15",
    billPeriod: "JUN-JUL 2026",
    dueDate: "2026-08-05",
    billAmount: 1240,
    lateFee: 0,
    additionalCharges: 0,
    fixedCharges: 10,
    convenienceFee: 10,
    totalAmount: 1260,
    paymentMode: "UPI",
    date: "2026-08-06 16:45:00",
    status: "SUCCESS",
    approvalNumber: "APPR-771239",
    channel: "Retailer Web Portal",
  },
  {
    id: "CC01662910482910",
    agentId: "AG-883920",
    billerId: "MCD000001DEL01",
    billerName: "Municipal Corporation of Delhi",
    category: "Municipal Taxes",
    customerName: "Sunita Verma",
    customerNumber: "9811223344",
    billNumber: "MCD-2026-11029",
    billDate: "2026-07-01",
    billPeriod: "Q2 2026",
    dueDate: "2026-08-01",
    billAmount: 3400,
    lateFee: 150,
    additionalCharges: 0,
    fixedCharges: 0,
    convenienceFee: 10,
    totalAmount: 3560,
    paymentMode: "Agent Wallet",
    date: "2026-08-05 09:20:18",
    status: "FAILED",
    approvalNumber: "N/A",
    channel: "Retailer Web Portal",
  },
];

const INITIAL_COMPLAINTS: Complaint[] = [
  {
    complaintId: "CMP-2026-99201",
    agentId: "AG-883920",
    transactionId: "CC01662910482910",
    mobileNumber: "9811223344",
    complaintType: "Transaction",
    disposition: "Amount Debited but Service not received",
    description: "Amount ₹3,560 was deducted from wallet balance but tax receipt was not generated by MCD server.",
    status: "IN_PROGRESS",
    assignedTo: "Nodal Officer - Delhi North Circle (Officer Code: NO-4402)",
    currentStage: "Under Investigation",
    createdDate: "2026-08-05 10:15:00",
    lastUpdatedDate: "2026-08-06 14:00:00",
  },
  {
    complaintId: "CMP-2026-88102",
    agentId: "AG-883920",
    transactionId: "CC01773920194821",
    mobileNumber: "9876543210",
    complaintType: "Transaction",
    disposition: "Bill still showing unpaid",
    description: "Customer paid IGL gas bill via UPI on 6th Aug, but IGL mobile app still reflects unpaid status.",
    status: "OPEN",
    assignedTo: "BBPS Dispute Operations Team (Queue: BBPS-GAS-OPS)",
    currentStage: "Assigned to Nodal Officer",
    createdDate: "2026-08-06 17:30:00",
    lastUpdatedDate: "2026-08-07 09:00:00",
  },
];

export const useBBPSStore = create<BBPSState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true, // Default true for instant review, accessible login toggle
      agentInfo: {
        agentId: "AG-883920",
        retailerName: "Subrahmanyam Sharma",
        agencyName: "Bharat Telecom & Travel Hub",
        mobile: "+91 98989 90084",
        email: "retailer.agency@bharatconnect.in",
        terminalId: "TRM-440192",
        walletBalance: 0.0,
        settlementBank: "State Bank of India",
        settlementAccount: "XXXX-XXXX-8821",
        ifscCode: "SBIN0001429",
        bbpsLicenseNo: "BBPS-RET-2026-884920",
      },

      currentFetchParams: {
        category: "Electricity",
        billerId: "OTME00005XXZ43",
        billerName: "Adani Electricity Mumbai Ltd",
        mobileNumber: "9898990084",
        customerNumber: "9898990084",
        caNumber: "102938475",
        customerName: "Rajesh Sharma",
        email: "rajesh.sharma@example.com",
        additionalParams: { a: "10" },
      },

      currentBillDetails: {
        billerId: "OTME00005XXZ43",
        billerName: "Adani Electricity Mumbai Ltd",
        category: "Electricity",
        customerName: "Rajesh Sharma",
        customerNumber: "9898990084",
        caNumber: "102938475",
        billDate: "2026-07-28",
        billPeriod: "JUL-2026",
        billNumber: "EL-2026-99201",
        dueDate: "2026-08-20",
        baseAmount: 1450,
        latePaymentFee: 50,
        additionalCharges: 25,
        fixedCharges: 15,
        convenienceFee: 10,
        selectedOptions: {
          baseAmount: true,
          latePaymentFee: true,
          additionalCharges: true,
          fixedCharges: true,
        },
        paymentMode: "Agent Wallet",
      },

      lastTransaction: INITIAL_TRANSACTIONS[0],
      transactions: INITIAL_TRANSACTIONS,
      complaints: INITIAL_COMPLAINTS,

      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false }),

      setFetchParams: (params) =>
        set((state) => ({
          currentFetchParams: { ...state.currentFetchParams, ...params },
        })),

      setBillDetails: (details) => set({ currentBillDetails: details }),

      toggleAmountOption: (optionKey) =>
        set((state) => {
          if (!state.currentBillDetails) return state;
          const updatedOptions = {
            ...state.currentBillDetails.selectedOptions,
            [optionKey]: !state.currentBillDetails.selectedOptions[optionKey],
          };
          return {
            currentBillDetails: {
              ...state.currentBillDetails,
              selectedOptions: updatedOptions,
            },
          };
        }),

      setPaymentMode: (mode) =>
        set((state) => {
          if (!state.currentBillDetails) return state;
          return {
            currentBillDetails: {
              ...state.currentBillDetails,
              paymentMode: mode,
            },
          };
        }),

      processPayment: () => {
        const state = get();
        const details = state.currentBillDetails;

        const base = details?.selectedOptions.baseAmount ? details.baseAmount : 0;
        const late = details?.selectedOptions.latePaymentFee ? details.latePaymentFee : 0;
        const add = details?.selectedOptions.additionalCharges ? details.additionalCharges : 0;
        const fixed = details?.selectedOptions.fixedCharges ? details.fixedCharges : 0;
        const conv = details?.convenienceFee || 10;
        const total = base + late + add + fixed + conv;

        const randomTxnId = `CC01${Math.floor(100000000000 + Math.random() * 900000000000)}`;
        const randomAppr = `APPR-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date();
        const formattedDate = `${now.toISOString().split("T")[0]} ${now.toTimeString().split(" ")[0]}`;

        const newTxn: Transaction = {
          id: randomTxnId,
          agentId: state.agentInfo.agentId,
          billerId: details?.billerId || "OTME00005XXZ43",
          billerName: details?.billerName || "Adani Electricity Mumbai Ltd",
          category: details?.category || "Electricity",
          customerName: details?.customerName || "Rajesh Sharma",
          customerNumber: details?.customerNumber || "9898990084",
          billNumber: details?.billNumber || `BILL-${Math.floor(10000 + Math.random() * 90000)}`,
          billDate: details?.billDate || "2026-07-28",
          billPeriod: details?.billPeriod || "JUL-2026",
          dueDate: details?.dueDate || "2026-08-20",
          billAmount: base,
          lateFee: late,
          additionalCharges: add,
          fixedCharges: fixed,
          convenienceFee: conv,
          totalAmount: total,
          paymentMode: details?.paymentMode || "Agent Wallet",
          date: formattedDate,
          status: "SUCCESS",
          approvalNumber: randomAppr,
          channel: "Retailer Web Portal",
        };

        const updatedWallet = state.agentInfo.walletBalance - total;

        set((prev) => ({
          lastTransaction: newTxn,
          transactions: [newTxn, ...prev.transactions],
          agentInfo: {
            ...prev.agentInfo,
            walletBalance: updatedWallet > 0 ? updatedWallet : prev.agentInfo.walletBalance,
          },
        }));

        return newTxn;
      },

      addComplaint: (data) => {
        const state = get();
        const randomCmpId = `CMP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
        const now = new Date();
        const formattedDate = `${now.toISOString().split("T")[0]} ${now.toTimeString().split(" ")[0]}`;

        const newComplaint: Complaint = {
          complaintId: randomCmpId,
          agentId: state.agentInfo.agentId,
          transactionId: data.transactionId,
          mobileNumber: data.mobileNumber,
          complaintType: data.complaintType || "Transaction",
          disposition: data.disposition,
          description: data.description,
          status: "IN_PROGRESS",
          assignedTo: "BBPS Grievance Redressal Nodal Cell",
          currentStage: "Assigned to Nodal Officer",
          createdDate: formattedDate,
          lastUpdatedDate: formattedDate,
        };

        set((prev) => ({
          complaints: [newComplaint, ...prev.complaints],
        }));

        return newComplaint;
      },

      getComplaintById: (id) => {
        return get().complaints.find(
          (c) => c.complaintId.toLowerCase().trim() === id.toLowerCase().trim()
        );
      },

      getTransactionById: (id) => {
        return get().transactions.find(
          (t) => t.id.toLowerCase().trim() === id.toLowerCase().trim()
        );
      },
    }),
    {
      name: "bright-spark-retailer-bbps-portal-v1",
    }
  )
);
