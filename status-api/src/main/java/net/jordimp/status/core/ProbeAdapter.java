package net.jordimp.status.core;

/**
 * Interface for probing engine health and metadata.
 */
public interface ProbeAdapter {
    Result<EngineStatus, ProbeError> probe();
}
