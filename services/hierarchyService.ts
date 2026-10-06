import { MasterDistributor, Distributor, Retailer } from '@/types/domain';
import { UserContext } from '@/config/roles';
import { mockMasterDistributors, mockDistributors, mockRetailers } from '@/mocks/mockHierarchy';


class HierarchyService {
  private masterDistributors: MasterDistributor[] = [...mockMasterDistributors];
  private distributors: Distributor[] = [...mockDistributors];
  private retailers: Retailer[] = [...mockRetailers];

  // Master Distributor Queries
  getAllMasterDistributors(): MasterDistributor[] {
    return [...this.masterDistributors];
  }

  getMasterDistributorById(id: string): MasterDistributor | null {
    return this.masterDistributors.find((md) => md.id === id || md.code === id) || null;
  }

  // Distributor Queries
  getAllDistributors(): Distributor[] {
    return [...this.distributors];
  }

  getMasterDistributorDistributors(masterDistributorId: string): Distributor[] {
    return this.distributors.filter((d) => d.masterDistributorId === masterDistributorId);
  }

  getDistributorById(distributorId: string): Distributor | null {
    return this.distributors.find((d) => d.id === distributorId || d.code === distributorId) || null;
  }

  // Retailer Queries
  getAllRetailers(): Retailer[] {
    return [...this.retailers];
  }

  getMasterDistributorRetailers(masterDistributorId: string): Retailer[] {
    return this.retailers.filter((r) => r.masterDistributorId === masterDistributorId);
  }

  getDistributorRetailers(distributorId: string): Retailer[] {
    return this.retailers.filter((r) => r.distributorId === distributorId);
  }

  getRetailerById(retailerId: string): Retailer | null {
    return this.retailers.find((r) => r.id === retailerId || r.code === retailerId) || null;
  }

  // Hierarchy Scoping / Authorization Helpers
  canAccessDistributor(user: UserContext & { entityId?: string }, distributorId: string): boolean {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;

    const distributor = this.getDistributorById(distributorId);
    if (!distributor) return false;

    if (user.role === 'MASTER_DISTRIBUTOR') {
      return distributor.masterDistributorId === user.entityId;
    }

    if (user.role === 'DISTRIBUTOR') {
      return distributor.id === user.entityId;
    }

    return false;
  }

  canAccessRetailer(user: UserContext & { entityId?: string }, retailerId: string): boolean {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;

    const retailer = this.getRetailerById(retailerId);
    if (!retailer) return false;

    if (user.role === 'MASTER_DISTRIBUTOR') {
      return retailer.masterDistributorId === user.entityId;
    }

    if (user.role === 'DISTRIBUTOR') {
      return retailer.distributorId === user.entityId;
    }

    if (user.role === 'RETAILER') {
      return retailer.id === user.entityId;
    }

    return false;
  }

  // Master Distributor Mutation Helpers
  addMasterDistributorRecord(newMD: MasterDistributor): void {
    this.masterDistributors.unshift(newMD);
  }

  updateMasterDistributorRecord(id: string, updates: Partial<MasterDistributor>): MasterDistributor | null {
    const idx = this.masterDistributors.findIndex((md) => md.id === id || md.code === id);
    if (idx === -1) return null;
    this.masterDistributors[idx] = {
      ...this.masterDistributors[idx],
      ...updates,
    };
    return this.masterDistributors[idx];
  }

  // Distributor Mutation Helpers
  addDistributorRecord(newDistributor: Distributor): void {
    this.distributors.unshift(newDistributor);
  }

  updateDistributorRecord(distributorId: string, updates: Partial<Distributor>): Distributor | null {
    const idx = this.distributors.findIndex((d) => d.id === distributorId);
    if (idx === -1) return null;
    this.distributors[idx] = {
      ...this.distributors[idx],
      ...updates,
    };
    return this.distributors[idx];
  }

  // Retailer Mutation Helpers
  addRetailerRecord(newRetailer: Retailer): void {
    this.retailers.unshift(newRetailer);
  }

  updateRetailerRecord(retailerId: string, updates: Partial<Retailer>): Retailer | null {
    const idx = this.retailers.findIndex((r) => r.id === retailerId);
    if (idx === -1) return null;
    this.retailers[idx] = {
      ...this.retailers[idx],
      ...updates,
    };
    return this.retailers[idx];
  }

  // Daily Onboarding Summary Helper
  getDailyOnboardingCounts(): {
    masterDistributorsToday: number;
    distributorsToday: number;
    retailersToday: number;
    totalToday: number;
    masterDistributorsYesterday: number;
    distributorsYesterday: number;
    retailersYesterday: number;
  } {
    return {
      masterDistributorsToday: 10,
      distributorsToday: 20,
      retailersToday: 50,
      totalToday: 80,
      masterDistributorsYesterday: 8,
      distributorsYesterday: 16,
      retailersYesterday: 42,
    };
  }
}

export const hierarchyService = new HierarchyService();
