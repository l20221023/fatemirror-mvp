import { getSupabaseAdminClient } from "../../supabase";
import { createDatabaseCommercialRepository } from "./database-commercial-repository";
import { createMemoryCommercialRepository } from "./memory-commercial-repository";
import type { CommercialRepository } from "./types";

function hasDatabase() {
  return Boolean(getSupabaseAdminClient());
}

export class DefaultCommercialRepository implements CommercialRepository {
  private readonly database = createDatabaseCommercialRepository();
  private readonly memory = createMemoryCommercialRepository();
  private readonly databaseEnabled = hasDatabase();

  async syncProducts(products: Parameters<CommercialRepository["syncProducts"]>[0]) {
    if (this.databaseEnabled) {
      await this.database.syncProducts(products);
    }
    await this.memory.syncProducts(products);
  }

  async listProducts() {
    return this.databaseEnabled ? this.database.listProducts() : this.memory.listProducts();
  }

  async createOrder(input: Parameters<CommercialRepository["createOrder"]>[0]) {
    if (this.databaseEnabled) {
      try {
        return await this.database.createOrder(input);
      } catch {
        // fall through to memory
      }
    }
    return this.memory.createOrder(input);
  }

  async getOrder(orderId: string) {
    return this.databaseEnabled ? (await this.database.getOrder(orderId)) ?? this.memory.getOrder(orderId) : this.memory.getOrder(orderId);
  }

  async getOrderByIdempotencyKey(idempotencyKey: string) {
    return this.databaseEnabled
      ? (await this.database.getOrderByIdempotencyKey(idempotencyKey)) ?? this.memory.getOrderByIdempotencyKey(idempotencyKey)
      : this.memory.getOrderByIdempotencyKey(idempotencyKey);
  }

  async updateOrder(orderId: string, patch: Parameters<CommercialRepository["updateOrder"]>[1]) {
    return this.databaseEnabled ? (await this.database.updateOrder(orderId, patch)) ?? this.memory.updateOrder(orderId, patch) : this.memory.updateOrder(orderId, patch);
  }

  async listOrders() {
    return this.databaseEnabled ? this.database.listOrders() : this.memory.listOrders();
  }

  async createEntitlement(input: Parameters<CommercialRepository["createEntitlement"]>[0]) {
    if (this.databaseEnabled) {
      try {
        return await this.database.createEntitlement(input);
      } catch {
        // fall through
      }
    }
    return this.memory.createEntitlement(input);
  }

  async getEntitlement(entitlementId: string) {
    return this.databaseEnabled
      ? (await this.database.getEntitlement(entitlementId)) ?? this.memory.getEntitlement(entitlementId)
      : this.memory.getEntitlement(entitlementId);
  }

  async findEntitlementsBySubject(subjectHash: string) {
    return this.databaseEnabled
      ? (await this.database.findEntitlementsBySubject(subjectHash)).concat(await this.memory.findEntitlementsBySubject(subjectHash))
      : this.memory.findEntitlementsBySubject(subjectHash);
  }

  async listEntitlements() {
    return this.databaseEnabled ? this.database.listEntitlements() : this.memory.listEntitlements();
  }

  async updateEntitlement(entitlementId: string, patch: Parameters<CommercialRepository["updateEntitlement"]>[1]) {
    return this.databaseEnabled
      ? (await this.database.updateEntitlement(entitlementId, patch)) ?? this.memory.updateEntitlement(entitlementId, patch)
      : this.memory.updateEntitlement(entitlementId, patch);
  }

  async recordPaymentEvent(input: Parameters<CommercialRepository["recordPaymentEvent"]>[0]) {
    if (this.databaseEnabled) {
      try {
        return await this.database.recordPaymentEvent(input);
      } catch {
        // fall through
      }
    }
    return this.memory.recordPaymentEvent(input);
  }

  async listPaymentEvents() {
    return this.databaseEnabled ? this.database.listPaymentEvents() : this.memory.listPaymentEvents();
  }
}

export function createDefaultCommercialRepository() {
  return new DefaultCommercialRepository();
}
