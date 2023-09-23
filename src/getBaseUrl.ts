const domainName = 0;

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // browser should use relative url
    return "";
  }
  if (process.env.NODE_ENV === "production") {
    // SSR
    return `https://thestreakapp.com`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};
