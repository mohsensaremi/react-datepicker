export const DEFAULT_YEAR_ITEM_NUMBER = 12;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

export class DateUtils {
  provider;
  constructor(provider) {
    this.provider = provider;
  }

  // ** Date Constructors **

  newDate(value) {
    const d = value
      ? typeof value === "string" || value instanceof String
        ? this.provider.parseISO(value)
        : this.provider.toDate(value)
      : new Date();
    return isValid(d) ? d : null;
  }

  parseDate(value, dateFormat, locale, strictParsing, minDate) {
    let parsedDate = null;
    let localeObject =
      this.getLocaleObject(locale) ||
      this.getLocaleObject(this.getDefaultLocale());
    let strictParsingValueMatch = true;
    if (Array.isArray(dateFormat)) {
      dateFormat.forEach((df) => {
        let tryParseDate = this.provider.parse(value, df, new Date(), {
          locale: localeObject,
        });
        if (strictParsing) {
          strictParsingValueMatch =
            this.isValid(tryParseDate, minDate) &&
            value === this.formatDate(tryParseDate, df, locale);
        }
        if (this.isValid(tryParseDate, minDate) && strictParsingValueMatch) {
          parsedDate = tryParseDate;
        }
      });
      return parsedDate;
    }

    parsedDate = this.provider.parse(value, dateFormat, new Date(), {
      locale: localeObject,
    });

    if (strictParsing) {
      strictParsingValueMatch =
        this.isValid(parsedDate) &&
        value === this.formatDate(parsedDate, dateFormat, locale);
    } else if (!this.isValid(parsedDate)) {
      dateFormat = dateFormat
        .match(longFormattingTokensRegExp)
        .map(function (substring) {
          var firstCharacter = substring[0];
          if (firstCharacter === "p" || firstCharacter === "P") {
            var longFormatter = this.provider.longFormatters[firstCharacter];
            return localeObject
              ? longFormatter(substring, localeObject.formatLong)
              : firstCharacter;
          }
          return substring;
        })
        .join("");

      if (value.length > 0) {
        parsedDate = this.provider.parse(
          value,
          dateFormat.slice(0, value.length),
          new Date()
        );
      }

      if (!this.isValid(parsedDate)) {
        parsedDate = new Date(value);
      }
    }

    return this.isValid(parsedDate) && strictParsingValueMatch
      ? parsedDate
      : null;
  }

  // ** Date "Reflection" **

  isValid(date, minDate) {
    minDate = minDate ? minDate : new Date("1/1/1000");
    return this.provider.isValidDate(date) && !this.isBefore(date, minDate);
  }

  isDate(date) {
    return this.provider.isDate(date);
  }

  // ** Date Formatting **

  formatDate(date, formatStr, locale) {
    if (locale === "en") {
      return this.provider.format(date, formatStr, {
        awareOfUnicodeTokens: true,
      });
    }
    let localeObj = this.getLocaleObject(locale);
    if (locale && !localeObj) {
      console.warn(
        `A locale object was not found for the provided string ["${locale}"].`
      );
    }
    if (
      !localeObj &&
      !!this.getDefaultLocale() &&
      !!this.getLocaleObject(this.getDefaultLocale())
    ) {
      localeObj = this.getLocaleObject(this.getDefaultLocale());
    }
    return this.provider.format(date, formatStr, {
      locale: localeObj ? localeObj : null,
      awareOfUnicodeTokens: true,
    });
  }

  safeDateFormat(date, { dateFormat, locale }) {
    return (
      (date &&
        this.formatDate(
          date,
          Array.isArray(dateFormat) ? dateFormat[0] : dateFormat,
          locale
        )) ||
      ""
    );
  }

  safeDateRangeFormat(startDate, endDate, props) {
    if (!startDate) {
      return "";
    }

    const formattedStartDate = this.safeDateFormat(startDate, props);
    const formattedEndDate = endDate ? this.safeDateFormat(endDate, props) : "";

    return `${formattedStartDate} - ${formattedEndDate}`;
  }

  // ** Date Setters **

  setTime(date, { hour = 0, minute = 0, second = 0 }) {
    return this.setHours(
      this.setMinutes(this.setSeconds(date, second), minute),
      hour
    );
  }

  setMinutes(date, minutes) {
    return this.provider.setMinutes(date, minutes);
  }

  setHours(date, hours) {
    return this.provider.setHours(date, hours);
  }

  setMonth(date, month) {
    return this.provider.setMonth(date, month);
  }

  setQuarter(date, quarter) {
    return this.provider.setQuarter(date, quarter);
  }

  setYear(date, year) {
    return this.provider.setYear(date, year);
  }

  // ** Date Getters **

  // getDay Returns day of week, getDate returns day of month

  getSeconds(date) {
    return this.provider.getSeconds(date);
  }

  getMinutes(date) {
    return this.provider.getMinutes(date);
  }

  getHours(date) {
    return this.provider.getHours(date);
  }

  getMonth(date) {
    return this.provider.getMonth(date);
  }

  getQuarter(date) {
    return this.provider.getQuarter(date);
  }

  getYear(date) {
    return this.provider.getYear(date);
  }

  getDay(date) {
    return this.provider.getDay(date);
  }

  getDate(date) {
    return this.provider.getDate(date);
  }

  getTime(date) {
    return this.provider.getTime(date);
  }

  getWeek(date, locale) {
    let localeObj =
      (locale && this.getLocaleObject(locale)) ||
      (this.getDefaultLocale() &&
        this.getLocaleObject(this.getDefaultLocale()));
    return this.provider.getISOWeek(
      date,
      localeObj ? { locale: localeObj } : null
    );
  }

  getDayOfWeekCode(day, locale) {
    return this.formatDate(day, "ddd", locale);
  }

  // *** Start of ***

  getStartOfDay(date) {
    return this.provider.startOfDay(date);
  }

  getStartOfWeek(date, locale, calendarStartDay) {
    let localeObj = locale
      ? this.getLocaleObject(locale)
      : this.getLocaleObject(this.getDefaultLocale());
    return this.provider.startOfWeek(date, {
      locale: localeObj,
      weekStartsOn: calendarStartDay,
    });
  }

  getStartOfMonth(date) {
    return this.provider.startOfMonth(date);
  }

  getStartOfYear(date) {
    return this.provider.startOfYear(date);
  }

  getStartOfQuarter(date) {
    return this.provider.startOfQuarter(date);
  }

  getStartOfToday() {
    return this.provider.startOfDay(this.newDate());
  }

  // *** End of ***

  getEndOfWeek(date) {
    return this.provider.endOfWeek(date);
  }

  getEndOfMonth(date) {
    return this.provider.endOfMonth(date);
  }

  // ** Date Math **

  // *** Addition ***

  addMinutes(date, amount) {
    this.provider.addMinutes(date, amount);
  }

  addDays(date, amount) {
    this.provider.addDays(date, amount);
  }

  addWeeks(date, amount) {
    this.provider.addWeeks(date, amount);
  }

  addMonths(date, amount) {
    this.provider.addMonths(date, amount);
  }

  addYears(date, amount) {
    this.provider.addYears(date, amount);
  }

  addHours(date, amount) {
    this.provider.addHours(date, amount);
  }

  // *** Subtraction ***

  subMinutes(date, amount) {
    return this.provider.subMinutes(date, amount);
  }

  subHours(date, amount) {
    return this.provider.subHours(date, amount);
  }

  subDays(date, amount) {
    return this.provider.subDays(date, amount);
  }

  subWeeks(date, amount) {
    return this.provider.subWeeks(date, amount);
  }

  subMonths(date, amount) {
    return this.provider.subMonths(date, amount);
  }

  subYears(date, amount) {
    return this.provider.subYears(date, amount);
  }

  // ** Date Comparison **

  isBefore(date, dateToCompare) {
    return this.provider.isBefore(date, dateToCompare);
  }

  isAfter(date, dateToCompare) {
    return this.provider.isAfter(date, dateToCompare);
  }

  isSameYear(date1, date2) {
    if (date1 && date2) {
      return this.provider.isSameYear(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  isSameMonth(date1, date2) {
    if (date1 && date2) {
      return this.provider.isSameMonth(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  isSameQuarter(date1, date2) {
    if (date1 && date2) {
      return this.provider.isSameQuarter(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  isSameDay(date1, date2) {
    if (date1 && date2) {
      return this.provider.isSameDay(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  isEqual(date1, date2) {
    if (date1 && date2) {
      return this.provider.isEqual(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  isDayInRange(day, startDate, endDate) {
    let valid;
    const start = this.provider.startOfDay(startDate);
    const end = this.provider.endOfDay(endDate);

    try {
      valid = this.provider.isWithinInterval(day, { start, end });
    } catch (err) {
      valid = false;
    }
    return valid;
  }

  // *** Diffing ***

  getDaysDiff(date1, date2) {
    return this.provider.differenceInCalendarDays(date1, date2);
  }

  // ** Date Localization **

  registerLocale(localeName, localeData) {
    if (!this.__localeData__) {
      this.__localeData__ = {};
    }
    this.__localeData__[localeName] = localeData;
  }

  setDefaultLocale(localeName) {
    this.__localeId__ = localeName;
  }

  getDefaultLocale() {
    return this.__localeId__;
  }

  getLocaleObject(localeSpec) {
    if (typeof localeSpec === "string") {
      // Treat it as a locale name registered by registerLocale
      return this.__localeData__ ? this.__localeData__[localeSpec] : null;
    } else {
      // Treat it as a raw date-fns locale object
      return localeSpec;
    }
  }

  getFormattedWeekdayInLocale(date, formatFunc, locale) {
    return typeof formatFunc === "function"
      ? formatFunc(date, locale)
      : this.formatDate(date, "EEEE", locale);
  }

  getWeekdayMinInLocale(date, locale) {
    return this.formatDate(date, "EEEEEE", locale);
  }

  getWeekdayShortInLocale(date, locale) {
    return this.formatDate(date, "EEE", locale);
  }

  getMonthInLocale(month, locale) {
    return this.formatDate(
      this.setMonth(this.newDate(), month),
      "LLLL",
      locale
    );
  }

  getMonthShortInLocale(month, locale) {
    return this.formatDate(this.setMonth(this.newDate(), month), "LLL", locale);
  }

  getQuarterShortInLocale(quarter, locale) {
    return this.formatDate(
      this.setQuarter(this.newDate(), quarter),
      "QQQ",
      locale
    );
  }

  // ** Utils for some components **

  isDayDisabled(
    day,
    {
      minDate,
      maxDate,
      excludeDates,
      excludeDateIntervals,
      includeDates,
      includeDateIntervals,
      filterDate,
    } = {}
  ) {
    return (
      this.isOutOfBounds(day, { minDate, maxDate }) ||
      (excludeDates &&
        excludeDates.some((excludeDate) => this.isSameDay(day, excludeDate))) ||
      (excludeDateIntervals &&
        excludeDateIntervals.some(({ start, end }) =>
          this.provider.isWithinInterval(day, { start, end })
        )) ||
      (includeDates &&
        !includeDates.some((includeDate) =>
          this.isSameDay(day, includeDate)
        )) ||
      (includeDateIntervals &&
        !includeDateIntervals.some(({ start, end }) =>
          this.provider.isWithinInterval(day, { start, end })
        )) ||
      (filterDate && !filterDate(this.newDate(day))) ||
      false
    );
  }

  isDayExcluded(day, { excludeDates, excludeDateIntervals } = {}) {
    if (excludeDateIntervals && excludeDateIntervals.length > 0) {
      return excludeDateIntervals.some(({ start, end }) =>
        this.provider.isWithinInterval(day, { start, end })
      );
    }
    return (
      (excludeDates &&
        excludeDates.some((excludeDate) => this.isSameDay(day, excludeDate))) ||
      false
    );
  }

  isMonthDisabled(
    month,
    { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
  ) {
    return (
      this.isOutOfBounds(month, { minDate, maxDate }) ||
      (excludeDates &&
        excludeDates.some((excludeDate) =>
          this.isSameMonth(month, excludeDate)
        )) ||
      (includeDates &&
        !includeDates.some((includeDate) =>
          this.isSameMonth(month, includeDate)
        )) ||
      (filterDate && !this.filterDate(this.newDate(month))) ||
      false
    );
  }

  isMonthinRange(startDate, endDate, m, day) {
    const startDateYear = this.getYear(startDate);
    const startDateMonth = this.getMonth(startDate);
    const endDateYear = this.getYear(endDate);
    const endDateMonth = this.getMonth(endDate);
    const dayYear = this.getYear(day);
    if (startDateYear === endDateYear && startDateYear === dayYear) {
      return startDateMonth <= m && m <= endDateMonth;
    } else if (startDateYear < endDateYear) {
      return (
        (dayYear === startDateYear && startDateMonth <= m) ||
        (dayYear === endDateYear && endDateMonth >= m) ||
        (dayYear < endDateYear && dayYear > startDateYear)
      );
    }
  }

  isQuarterDisabled(
    quarter,
    { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
  ) {
    return (
      this.isOutOfBounds(quarter, { minDate, maxDate }) ||
      (excludeDates &&
        excludeDates.some((excludeDate) =>
          this.isSameQuarter(quarter, excludeDate)
        )) ||
      (includeDates &&
        !includeDates.some((includeDate) =>
          this.isSameQuarter(quarter, includeDate)
        )) ||
      (filterDate && !this.filterDate(this.newDate(quarter))) ||
      false
    );
  }

  isYearDisabled(year, { minDate, maxDate } = {}) {
    const date = new Date(year, 0, 1);
    return this.isOutOfBounds(date, { minDate, maxDate }) || false;
  }

  isQuarterInRange(startDate, endDate, q, day) {
    const startDateYear = this.getYear(startDate);
    const startDateQuarter = this.getQuarter(startDate);
    const endDateYear = this.getYear(endDate);
    const endDateQuarter = this.getQuarter(endDate);
    const dayYear = this.getYear(day);
    if (startDateYear === endDateYear && startDateYear === dayYear) {
      return startDateQuarter <= q && q <= endDateQuarter;
    } else if (startDateYear < endDateYear) {
      return (
        (dayYear === startDateYear && startDateQuarter <= q) ||
        (dayYear === endDateYear && endDateQuarter >= q) ||
        (dayYear < endDateYear && dayYear > startDateYear)
      );
    }
  }

  isOutOfBounds(day, { minDate, maxDate } = {}) {
    return (
      (minDate && this.provider.differenceInCalendarDays(day, minDate) < 0) ||
      (maxDate && this.provider.differenceInCalendarDays(day, maxDate) > 0)
    );
  }

  isTimeInList(time, times) {
    return times.some(
      (listTime) =>
        this.getHours(listTime) === this.getHours(time) &&
        this.getMinutes(listTime) === this.getMinutes(time)
    );
  }

  isTimeDisabled(time, { excludeTimes, includeTimes, filterTime } = {}) {
    return (
      (excludeTimes && this.isTimeInList(time, excludeTimes)) ||
      (includeTimes && !this.isTimeInList(time, includeTimes)) ||
      (filterTime && !filterTime(time)) ||
      false
    );
  }

  isTimeInDisabledRange(time, { minTime, maxTime }) {
    if (!minTime || !maxTime) {
      throw new Error("Both minTime and maxTime props required");
    }
    const base = this.newDate();
    const baseTime = this.setHours(
      this.setMinutes(base, this.getMinutes(time)),
      this.getHours(time)
    );
    const min = this.setHours(
      this.setMinutes(base, this.getMinutes(minTime)),
      this.getHours(minTime)
    );
    const max = this.setHours(
      this.setMinutes(base, this.getMinutes(maxTime)),
      this.getHours(maxTime)
    );

    let valid;
    try {
      valid = !this.provider.isWithinInterval(baseTime, {
        start: min,
        end: max,
      });
    } catch (err) {
      valid = false;
    }
    return valid;
  }

  monthDisabledBefore(day, { minDate, includeDates } = {}) {
    const previousMonth = this.subMonths(day, 1);
    return (
      (minDate &&
        this.provider.differenceInCalendarMonths(minDate, previousMonth) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            this.provider.differenceInCalendarMonths(
              includeDate,
              previousMonth
            ) > 0
        )) ||
      false
    );
  }

  monthDisabledAfter(day, { maxDate, includeDates } = {}) {
    const nextMonth = this.addMonths(day, 1);
    return (
      (maxDate &&
        this.provider.differenceInCalendarMonths(nextMonth, maxDate) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            this.provider.differenceInCalendarMonths(nextMonth, includeDate) > 0
        )) ||
      false
    );
  }

  yearDisabledBefore(day, { minDate, includeDates } = {}) {
    const previousYear = this.subYears(day, 1);
    return (
      (minDate &&
        this.provider.differenceInCalendarYears(minDate, previousYear) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            this.provider.differenceInCalendarYears(includeDate, previousYear) >
            0
        )) ||
      false
    );
  }

  yearsDisabledBefore(
    day,
    { minDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}
  ) {
    const previousYear = this.getStartOfYear(
      this.subYears(day, yearItemNumber)
    );
    const { endPeriod } = this.provider.getYearsPeriod(
      previousYear,
      yearItemNumber
    );
    const minDateYear = minDate && this.getYear(minDate);
    return (minDateYear && minDateYear > endPeriod) || false;
  }

  yearDisabledAfter(day, { maxDate, includeDates } = {}) {
    const nextYear = this.addYears(day, 1);
    return (
      (maxDate &&
        this.provider.differenceInCalendarYears(nextYear, maxDate) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            this.provider.differenceInCalendarYears(nextYear, includeDate) > 0
        )) ||
      false
    );
  }

  yearsDisabledAfter(
    day,
    { maxDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}
  ) {
    const nextYear = this.addYears(day, yearItemNumber);
    const { startPeriod } = this.provider.getYearsPeriod(
      nextYear,
      yearItemNumber
    );
    const maxDateYear = maxDate && this.getYear(maxDate);
    return (maxDateYear && maxDateYear < startPeriod) || false;
  }

  getEffectiveMinDate({ minDate, includeDates }) {
    if (includeDates && minDate) {
      let minDates = includeDates.filter(
        (includeDate) =>
          this.provider.differenceInCalendarDays(includeDate, minDate) >= 0
      );
      return this.provider.min(minDates);
    } else if (includeDates) {
      return this.provider.min(includeDates);
    } else {
      return minDate;
    }
  }

  getEffectiveMaxDate({ maxDate, includeDates }) {
    if (includeDates && maxDate) {
      let maxDates = includeDates.filter(
        (includeDate) =>
          this.provider.differenceInCalendarDays(includeDate, maxDate) <= 0
      );
      return this.provider.max(maxDates);
    } else if (includeDates) {
      return this.provider.max(includeDates);
    } else {
      return maxDate;
    }
  }

  getHightLightDaysMap(
    highlightDates = [],
    defaultClassName = "react-datepicker__day--highlighted"
  ) {
    const dateClasses = new Map();
    for (let i = 0, len = highlightDates.length; i < len; i++) {
      const obj = highlightDates[i];
      if (this.isDate(obj)) {
        const key = this.formatDate(obj, "MM.dd.yyyy");
        const classNamesArr = dateClasses.get(key) || [];
        if (!classNamesArr.includes(defaultClassName)) {
          classNamesArr.push(defaultClassName);
          dateClasses.set(key, classNamesArr);
        }
      } else if (typeof obj === "object") {
        const keys = Object.keys(obj);
        const className = keys[0];
        const arrOfDates = obj[keys[0]];
        if (typeof className === "string" && arrOfDates.constructor === Array) {
          for (let k = 0, len = arrOfDates.length; k < len; k++) {
            const key = this.formatDate(arrOfDates[k], "MM.dd.yyyy");
            const classNamesArr = dateClasses.get(key) || [];
            if (!classNamesArr.includes(className)) {
              classNamesArr.push(className);
              dateClasses.set(key, classNamesArr);
            }
          }
        }
      }
    }

    return dateClasses;
  }

  timesToInjectAfter(
    startOfDay,
    currentTime,
    currentMultiplier,
    intervals,
    injectedTimes
  ) {
    const l = injectedTimes.length;
    const times = [];
    for (let i = 0; i < l; i++) {
      const injectedTime = this.addMinutes(
        this.addHours(startOfDay, this.getHours(injectedTimes[i])),
        this.getMinutes(injectedTimes[i])
      );
      const nextTime = this.addMinutes(
        startOfDay,
        (currentMultiplier + 1) * intervals
      );

      if (
        this.isAfter(injectedTime, currentTime) &&
        this.isBefore(injectedTime, nextTime)
      ) {
        times.push(injectedTimes[i]);
      }
    }

    return times;
  }

  addZero(i) {
    return i < 10 ? `0${i}` : `${i}`;
  }

  getYearsPeriod(date, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER) {
    const endPeriod =
      Math.ceil(this.getYear(date) / yearItemNumber) * yearItemNumber;
    const startPeriod = endPeriod - (yearItemNumber - 1);
    return { startPeriod, endPeriod };
  }
}
