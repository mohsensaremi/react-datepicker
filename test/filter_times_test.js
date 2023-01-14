import { mount } from "enzyme";
import React from "react";
import dateFnsProvider from "../provider/date-fns";
import { UtilsContextProvider } from "../src/context";
import { DateUtils } from "../src/date_utils";
import TimeComponent from "../src/time";

describe("TimeComponent", () => {
  const utils = DateUtils(dateFnsProvider);
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should disable times matched by filterTime prop", () => {
    const timeComponent = mount(
      <UtilsContextProvider utils={utils}>
        <TimeComponent filterTime={(time) => utils.getHours(time) !== 17} />
      </UtilsContextProvider>
    );

    expect(
      timeComponent.find(".react-datepicker__time-list-item--disabled")
    ).to.have.length(2);
  });
});
