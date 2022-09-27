class OwnerError extends Error {
    constructor(message) {
        super(message);
        this.name = OwnerError;
    }
}

class MissingPermissionError extends Error {
    constructor(message) {
        super(message);
        this.name = MissingPermissionError;
    }
}

module.exports = {
    OwnerError,
    MissingPermissionError
}