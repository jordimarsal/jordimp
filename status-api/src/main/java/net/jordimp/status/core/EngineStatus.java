package net.jordimp.status.core;

public record EngineStatus(
    boolean up,
    String alias,
    String modelName,
    Boolean loaded,
    Integer slots,
    Integer ctxPerSlot,
    String build
) {
    public static EngineStatus llama(String alias, int slots, int ctxPerSlot, String build) {
        return new EngineStatus(true, alias, null, null, slots, ctxPerSlot, build);
    }

    public static EngineStatus strata(String modelName, boolean loaded) {
        return new EngineStatus(true, null, modelName, loaded, null, null, null);
    }

    public static EngineStatus down() {
        return new EngineStatus(false, null, null, null, null, null, null);
    }
}
