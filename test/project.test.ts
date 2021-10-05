// tslint:disable-next-line no-implicit-dependencies
import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  var env: any;

  // mocking an environment
  before(function () {
    env = process.env;
    process.env["MIGRATION"] = "1";
    process.env["DEV"] = "1";
  });

  // restoring everything back
  after(function () {
    process.env = env;
  });

  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");

    it("", async function async() {
      await this.hre.run("migrate", {
        reset: true,
      });
    });
  });
});
