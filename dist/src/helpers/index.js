"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBeforeDash = exports.validate = exports.AddressRegex = exports.generateShortHash = void 0;
const generateShortHash = (hash) => {
    const hashToReturn = hash.slice(0, 3) + hash.slice(hash.length - 4, hash.length - 1);
    return hashToReturn;
};
exports.generateShortHash = generateShortHash;
exports.AddressRegex = /^0x[a-fA-F0-9]{40}$/;
function validate(value) {
    if (typeof value !== "string") {
        throw new Error(`Value is not a string: ${value}`);
    }
    if (!value.trim().length) {
        throw new Error(`Value cannot be an empty string: ${value}`);
    }
    if (!exports.AddressRegex.test(value)) {
        throw new Error(`Value is not a valid address: ${value}`);
    }
    return value;
}
exports.validate = validate;
function extractBeforeDash(input) {
    return input.split("-")[0];
}
exports.extractBeforeDash = extractBeforeDash;
