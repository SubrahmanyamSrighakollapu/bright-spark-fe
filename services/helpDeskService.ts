import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/common';

export type HelpDeskTicketStatus = 'OPEN'|'ASSIGNED'|'IN_PROGRESS'|'RESOLVED'|'CLOSED'|'REOPENED';
export interface HelpDeskTicket { id:string;ticketId:string;category:string;subcategory:string;description:string;status:HelpDeskTicketStatus;
  raisedByUserId:string;raisedByPartyId?:string;raisedByName:string;raisedByEmail:string;raisedByRole:string;partyName?:string;
  assignedEmployeeId?:string;assignedEmployeeCode?:string;assignedEmployeeName?:string;assignedEmployeeEmail?:string;
  assignmentMethod?:'AUTO_WORKLOAD_ROUND_ROBIN'|'ADMIN_MANUAL'|'ADMIN_REASSIGNMENT';assignedAt?:string;createdAt:string;updatedAt:string; }
export interface OperationsEmployee { id:string;employeeCode:string;name:string;email:string;activeTicketCount:number; }
export interface TicketList { items:HelpDeskTicket[];pagination:{page:number;pageSize:number;totalItems:number;totalPages:number}; }

export const HELP_DESK_CATEGORIES = [
  { name: 'Transactions', subcategories: ['Pay-In pending','Pay-Out pending','Failed transaction','Duplicate debit','Incorrect transaction status'] },
  { name: 'Wallet & Ledger', subcategories: ['Balance not updated','Ledger mismatch','Top-up issue','Hold amount query','Commission not credited'] },
  { name: 'KYC & Account', subcategories: ['KYC status issue','Document upload issue','Account activation','Profile correction','Login or password issue'] },
  { name: 'Settlement', subcategories: ['Settlement delayed','Incorrect settlement amount','UTR not available','Bank credit not received'] },
  { name: 'Service & Technical', subcategories: ['Service unavailable','Page or button not working','API error','Slow application','Other technical issue'] },
] as const;

export const helpDeskService = {
  getTickets:(params?:{status?:string;search?:string;page?:number;pageSize?:number})=>apiClient.get<ApiResponse<TicketList>>('/help-desk/tickets',{params}),
  createTicket:(input:{category:string;subcategory:string;description:string})=>apiClient.post<ApiResponse<HelpDeskTicket>>('/help-desk/tickets',input),
  getOperationsEmployees:()=>apiClient.get<ApiResponse<OperationsEmployee[]>>('/help-desk/operations-employees'),
  assignTicket:(id:string,employeeId:string|null,reason:string)=>apiClient.patch<ApiResponse<HelpDeskTicket>>(`/help-desk/tickets/${id}/assignment`,{employeeId,reason}),
  updateStatus:(id:string,status:'IN_PROGRESS'|'RESOLVED'|'CLOSED'|'REOPENED',remarks:string)=>apiClient.patch<ApiResponse<HelpDeskTicket>>(`/help-desk/tickets/${id}/status`,{status,remarks}),
};
