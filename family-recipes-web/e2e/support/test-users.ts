// TestAuthHandler in the E2E API turns these headers into the signed-in user.
const headersFor = (id: string, name: string) => ({
  "X-Test-User-Id": id,
  "X-Test-User-Name": name,
  "X-Test-Scope": "access_as_user",
});

export const testUsers = {
  anna: headersFor("e2e-user-anna", "Anna Testsson"),
  bertil: headersFor("e2e-user-bertil", "Bertil Testsson"),
};

export const e2eApiUrl = "http://localhost:5199";
