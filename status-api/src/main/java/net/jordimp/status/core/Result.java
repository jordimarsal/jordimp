package net.jordimp.status.core;

public sealed interface Result<T, E> permits Ok, Err {
    boolean isOk();
    boolean isErr();

    static <T, E> Result<T, E> ok(T value) {
        return new Ok<>(value);
    }

    static <T, E> Result<T, E> err(E error) {
        return new Err<>(error);
    }

    /** The wrapped value when ok, null when err. */
    default T getValue() {
        return this instanceof Ok<T, E> ok ? ok.value() : null;
    }

    /** The wrapped error when err, null when ok. */
    default E getError() {
        return this instanceof Err<T, E> err ? err.error() : null;
    }
}

record Ok<T, E>(T value) implements Result<T, E> {
    @Override public boolean isOk() { return true; }
    @Override public boolean isErr() { return false; }
    public T getValue() { return value; }
}

record Err<T, E>(E error) implements Result<T, E> {
    @Override public boolean isOk() { return false; }
    @Override public boolean isErr() { return true; }
    public E getError() { return error; }
}
