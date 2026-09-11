import { Entity } from "../../../../core/entities/entity.js";
import type { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import type { Optional } from "../../../../core/types/optional.js";

export type MonitoredServiceOperationalState =
  | "unknown"
  | "operational"
  | "degraded"
  | "unavailable";

export const MONITORED_SERVICE_NAME_MAX_LENGTH = 120;
const CONTROL_CHARACTER_PATTERN = /\p{Cc}/u;

export interface MonitoredServiceProps {
  organizationId: string;
  name: string;
  active: boolean;
  operationalState: MonitoredServiceOperationalState;
  createdAt: Date;
}

export class MonitoredService extends Entity<MonitoredServiceProps> {
  static normalizeName(name: string): string | null {
    if (CONTROL_CHARACTER_PATTERN.test(name)) return null;

    const normalized = name.trim();
    if (!normalized || normalized.length > MONITORED_SERVICE_NAME_MAX_LENGTH) {
      return null;
    }

    return normalized;
  }

  get organizationId() {
    return this.props.organizationId;
  }

  get name() {
    return this.props.name;
  }

  get active() {
    return this.props.active;
  }

  get isActive() {
    return this.props.active;
  }

  get operationalState() {
    return this.props.operationalState;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<MonitoredServiceProps, "active" | "operationalState" | "createdAt">,
    id?: UniqueEntityID
  ) {
    return new MonitoredService(
      {
        ...props,
        active: props.active ?? true,
        operationalState: props.operationalState ?? "unknown",
        createdAt: props.createdAt ?? new Date()
      },
      id
    );
  }
}
