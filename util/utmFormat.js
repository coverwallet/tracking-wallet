export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

export const capitalizeUTM = (utm) => {
  const parts = utm.split("_");
  return parts.length > 1
    ? `${parts[0].toUpperCase()} ${capitalize(parts[1])}`
    : capitalize(utm);
};
