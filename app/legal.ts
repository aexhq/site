export type LegalIdentity = {
  operator: string;
  companyNumber: string;
  companiesHouseUrl: string;
  registeredOffice: string;
  registrationJurisdiction: string;
  country: string;
};

const legalIdentity: LegalIdentity = {
  operator: "THINK SLOWLY LTD",
  companyNumber: "17224795",
  companiesHouseUrl:
    "https://find-and-update.company-information.service.gov.uk/company/17224795",
  registeredOffice:
    "71-75 Shelton Street, Covent Garden, London, England, WC2H 9JQ",
  registrationJurisdiction: "England and Wales",
  country: "United Kingdom",
};

export function getLegalIdentity(): LegalIdentity {
  return legalIdentity;
}
