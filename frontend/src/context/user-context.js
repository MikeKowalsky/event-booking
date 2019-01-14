import React from "react";

export default React.createContext({
  token: null,
  iserId: null,
  login: (token, userId, tokenExpiration) => {},
  logout: () => {}
});
