package net.jordimp.status.core;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Represents a single benchmark result for a model slug.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record FleetRow(
    String slug,
    String think,
    double global,
    Double genTps,
    String ts
) {}
