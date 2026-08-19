export type LegalIdentity = {
  configured: boolean;
  operator: string;
  address: string;
  country: string;
};

export function getLegalIdentity(): LegalIdentity {
  const operator = process.env.AEX_LEGAL_OPERATOR?.trim() ?? "";
  const address = process.env.AEX_SERVICE_ADDRESS?.trim() ?? "";
  const country = process.env.AEX_OPERATOR_COUNTRY?.trim() ?? "";
  return {
    configured: Boolean(operator && address && country),
    operator,
    address,
    country,
  };
}
