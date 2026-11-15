package net.jordimp.status.core;

public sealed interface ProbeError permits 
    ProbeError.ProbeTimeout, 
    ProbeError.EngineUnreachable, 
    ProbeError.ProbeParseError {
    
    String message();

    record ProbeTimeout(String message) implements ProbeError {}
    record EngineUnreachable(String message) implements ProbeError {}
    record ProbeParseError(String message) implements ProbeError {}
}
