/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AssetStatus {
  AVAILABLE = 'Available',
  BORROWED = 'Borrowed',
  MAINTENANCE = 'Maintenance',
  BROKEN = 'Broken',
}

export interface ITAsset {
  id: string;
  sn: string;
  name: string;
  category: string;
  status: AssetStatus;
  warrantyExpire: string;
  lastChecked: string;
}

export interface DashboardStats {
  totalAssets: number;
  borrowedCount: number;
  maintenanceCount: number;
  warrantyExpiringCount: number;
}
