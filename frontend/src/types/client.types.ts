// Client Types - Re-exports from Wails-generated DTOs
// Source of truth: wailsjs/go/models.ts (auto-generated from Go dto package)

import { dto } from "@/wailsjs/go/models";

// Re-export Wails DTO types with frontend-friendly aliases
export type Client = dto.ClientOutput & {
  billingCompany?: string;
  billingAddress?: string;
  billingCity?: string;
  billingProvince?: string;
  billingPostalCode?: string;
};

export type CreateClientInput = dto.CreateClientInput & {
  billingCompany?: string;
  billingAddress?: string;
  billingCity?: string;
  billingProvince?: string;
  billingPostalCode?: string;
};

export type UpdateClientInput = dto.UpdateClientInput & {
  billingCompany?: string;
  billingAddress?: string;
  billingCity?: string;
  billingProvince?: string;
  billingPostalCode?: string;
};

// Service Interface
export interface IClientService {
  list(): Promise<Client[]>;
  get(id: number): Promise<Client>;
  create(input: CreateClientInput): Promise<Client>;
  update(input: UpdateClientInput): Promise<Client>;
  delete(id: number): Promise<void>;
}
