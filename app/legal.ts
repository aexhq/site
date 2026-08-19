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
    "Flat 71 Legacy Tower, 88 Great Eastern Road, London, England, E15 1DE",
  registrationJurisdiction: "England and Wales",
  country: "United Kingdom",
};

export function getLegalIdentity(): LegalIdentity {
  return legalIdentity;
}
