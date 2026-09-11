import { Entity } from "../../../../core/entities/entity.js";
import type { UniqueEntityID } from "../../../../core/entities/unique-entity-id.js";
import type { Optional } from "../../../../core/types/optional.js";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentOperationalImpact = "none" | "unknown" | "degraded" | "unavailable";

export interface IncidentProps {
  organizationId: string;
  serviceId: string;
  origin: "manual";
  state: "open";
  severity: IncidentSeverity;
  operationalImpact: IncidentOperationalImpact;
  visibility: "private";
  version: number;
  openedAt: Date;
  openedBy: string;
}

export class Incident extends Entity<IncidentProps> {
  get organizationId() { return this.props.organizationId; }
  get serviceId() { return this.props.serviceId; }
  get origin() { return this.props.origin; }
  get state() { return this.props.state; }
  get severity() { return this.props.severity; }
  get operationalImpact() { return this.props.operationalImpact; }
  get visibility() { return this.props.visibility; }
  get version() { return this.props.version; }
  get openedAt() { return this.props.openedAt; }
  get openedBy() { return this.props.openedBy; }

  static create(props: Optional<IncidentProps, "origin" | "state" | "visibility" | "version">, id?: UniqueEntityID) {
    return new Incident({
      ...props,
      origin: props.origin ?? "manual",
      state: props.state ?? "open",
      visibility: props.visibility ?? "private",
      version: props.version ?? 1
    }, id);
  }
}
