import React from "react";
import { mount } from "enzyme";
import DatePicker from "../src/index.jsx";
import TimeComponent from "../src/time";
import * as dateFnsProvider from "../provider/date-fns";
import { UtilsContextProvider } from "../src/context";
import { DateUtils } from "../src/date_utils";

describe("DatePicker", () => {
  const utils = DateUtils(dateFnsProvider);
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should show time component when showTimeSelect prop is present", () => {
    var datePicker = mount(
      <UtilsContextProvider utils={utils}>
        <DatePicker showTimeSelect />
      </UtilsContextProvider>
    );
    var timeComponent = datePicker.find(TimeComponent);
    expect(timeComponent).to.exist;
  });

  it("should have custom time caption", () => {
    const timeComponent = mount(
      <UtilsContextProvider utils={utils}>
        <TimeComponent timeCaption="Custom time" />
      </UtilsContextProvider>
    );

    const caption = timeComponent.find(".react-datepicker-time__header");
    expect(caption.text()).to.equal("Custom time");
  });

  describe("Time Select Only", () => {
    let datePicker;
    before(() => {
      datePicker = mount(
        <UtilsContextProvider utils={utils}>
          <DatePicker showTimeSelect showTimeSelectOnly todayButton="Today" />
        </UtilsContextProvider>
      );
      datePicker.find("input").simulate("click");
    });

    it("should not show month container when showTimeSelectOnly prop is present", () => {
      var elem = datePicker.find(".react-datepicker__month-container");
      expect(elem).to.have.length(0);
    });

    it("should not show previous month button when showTimeSelectOnly prop is present", () => {
      var elem = datePicker.find(".react-datepicker__navigation--previous");
      expect(elem).to.have.length(0);
    });

    it("should not show next month button when showTimeSelectOnly prop is present", () => {
      var elem = datePicker.find(".react-datepicker__navigation--next");
      expect(elem).to.have.length(0);
    });

    it("should not show today button when showTimeSelectOnly prop is present", () => {
      var elem = datePicker.find(".react-datepicker__today-button");
      expect(elem).to.have.length(0);
    });
  });
});
