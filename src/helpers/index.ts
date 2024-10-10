export const generateShortHash = (hash: string): string => {
  const hashToReturn =
    hash.slice(0, 3) + hash.slice(hash.length - 4, hash.length - 1);
  return hashToReturn;
};

export const AddressRegex = /^0x[a-fA-F0-9]{40}$/;
export function validate(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error(`Value is not a string: ${value}`);
  }
  if (!value.trim().length) {
    throw new Error(`Value cannot be an empty string: ${value}`);
  }
  if (!AddressRegex.test(value)) {
    throw new Error(`Value is not a valid address: ${value}`);
  }
  return value;
}

export function extractBeforeDash(input: string): string {
  return input.split("-")[0];
}
