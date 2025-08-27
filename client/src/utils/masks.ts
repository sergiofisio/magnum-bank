// A react-imask usa '0' para dígitos numéricos
export const cpfMask = {
  mask: "000.000.000-00",
};

export const phoneMask = {
  mask: "(00) 00000-0000",
};

export const agencyMask = {
  mask: "0000",
};

export const accountMask = {
  mask: "000000-L",
  definitions: {
    L: /^[0-9a-zA-Z]$/,
  },
  prepare: (str: string) => str.toUpperCase(),
};
