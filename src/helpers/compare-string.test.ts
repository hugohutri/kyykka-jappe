import { compare } from "./compare-string";

test("correcly compare 2 strings", () => {
  expect(compare("Kyrsä", "rsä")).toBe(true);
  expect(compare("Kyykkäkerho rsä", "rsä")).toBe(true);
  expect(compare("Kyrsä", "")).toBe(true);

  expect(compare("Rsä", "Kyrsä")).toBe(false);
  expect(compare("Rsä", "Kyrsä")).toBe(false);
  expect(compare("Rsä", "Kyykkäkerho rsä")).toBe(false);
});
