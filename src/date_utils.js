export const DEFAULT_YEAR_ITEM_NUMBER = 12;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

export function DateUtils(provider) {
  let __localeData__;
  let __localeId__;

  // ** Date Constructors **

  function newDate(value) {
    const d = value
      ? typeof value === "string" || value instanceof String
        ? provider.parseISO(value)
        : provider.toDate(value)
      : new Date();
    return isValid(d) ? d : null;
  }

  function parseDate(value, dateFormat, locale, strictParsing, minDate) {
    let parsedDate = null;
    let localeObject =
      getLocaleObject(locale) || getLocaleObject(getDefaultLocale());
    let strictParsingValueMatch = true;
    if (Array.isArray(dateFormat)) {
      dateFormat.forEach((df) => {
        let tryParseDate = provider.parse(value, df, new Date(), {
          locale: localeObject,
        });
        if (strictParsing) {
          strictParsingValueMatch =
            isValid(tryParseDate, minDate) &&
            value === formatDate(tryParseDate, df, locale);
        }
        if (isValid(tryParseDate, minDate) && strictParsingValueMatch) {
          parsedDate = tryParseDate;
        }
      });
      return parsedDate;
    }

    parsedDate = provider.parse(value, dateFormat, new Date(), {
      locale: localeObject,
    });

    if (strictParsing) {
      strictParsingValueMatch =
        isValid(parsedDate) &&
        value === formatDate(parsedDate, dateFormat, locale);
    } else if (!isValid(parsedDate)) {
      dateFormat = dateFormat
        .match(longFormattingTokensRegExp)
        .map(function (substring) {
          var firstCharacter = substring[0];
          if (firstCharacter === "p" || firstCharacter === "P") {
            var longFormatter = provider.longFormatters[firstCharacter];
            return localeObject
              ? longFormatter(substring, localeObject.formatLong)
              : firstCharacter;
          }
          return substring;
        })
        .join("");

      if (value.length > 0) {
        parsedDate = provider.parse(
          value,
          dateFormat.slice(0, value.length),
          new Date()
        );
      }

      if (!isValid(parsedDate)) {
        parsedDate = new Date(value);
      }
    }

    return isValid(parsedDate) && strictParsingValueMatch ? parsedDate : null;
  }

  // ** Date "Reflection" **

  function isValid(date, minDate) {
    minDate = minDate ? minDate : new Date("1/1/1000");
    return provider.isValidDate(date) && !isBefore(date, minDate);
  }

  function isDate(date) {
    return provider.isDate(date);
  }

  // ** Date Formatting **

  function formatDate(date, formatStr, locale) {
    if (locale === "en") {
      return provider.format(date, formatStr, {
        awareOfUnicodeTokens: true,
      });
    }
    let localeObj = getLocaleObject(locale);
    if (locale && !localeObj) {
      console.warn(
        `A locale object was not found for the provided string ["${locale}"].`
      );
    }
    if (
      !localeObj &&
      !!getDefaultLocale() &&
      !!getLocaleObject(getDefaultLocale())
    ) {
      localeObj = getLocaleObject(getDefaultLocale());
    }
    return provider.format(date, formatStr, {
      locale: localeObj ? localeObj : null,
      awareOfUnicodeTokens: true,
    });
  }

  function safeDateFormat(date, { dateFormat, locale }) {
    return (
      (date &&
        formatDate(
          date,
          Array.isArray(dateFormat) ? dateFormat[0] : dateFormat,
          locale
        )) ||
      ""
    );
  }

  function safeDateRangeFormat(startDate, endDate, props) {
    if (!startDate) {
      return "";
    }

    const formattedStartDate = safeDateFormat(startDate, props);
    const formattedEndDate = endDate ? safeDateFormat(endDate, props) : "";

    return `${formattedStartDate} - ${formattedEndDate}`;
  }

  // ** Date Setters **

  function setTime(date, { hour = 0, minute = 0, second = 0 }) {
    return setHours(
      setMinutes(provider.setSeconds(date, second), minute),
      hour
    );
  }

  function setMinutes(date, minutes) {
    return provider.setMinutes(date, minutes);
  }

  function setHours(date, hours) {
    return provider.setHours(date, hours);
  }

  function setMonth(date, month) {
    return provider.setMonth(date, month);
  }

  function setQuarter(date, quarter) {
    return provider.setQuarter(date, quarter);
  }

  function setYear(date, year) {
    return provider.setYear(date, year);
  }

  // ** Date Getters **

  // getDay Returns day of week, getDate returns day of month

  const getSeconds = provider.getSeconds;
  const getMinutes = provider.getMinutes;
  const getHours = provider.getHours;
  const getMonth = provider.getMonth;
  const getQuarter = provider.getQuarter;
  const getYear = provider.getYear;
  const getDay = provider.getDay;
  const getDate = provider.getDate;
  const getTime = provider.getTime;

  function getWeek(date, locale) {
    let localeObj =
      (locale && getLocaleObject(locale)) ||
      (getDefaultLocale() && getLocaleObject(getDefaultLocale()));
    return provider.getISOWeek(date, localeObj ? { locale: localeObj } : null);
  }

  function getDayOfWeekCode(day, locale) {
    return formatDate(day, "ddd", locale);
  }

  // *** Start of ***

  function getStartOfDay(date) {
    return provider.startOfDay(date);
  }

  function getStartOfWeek(date, locale, calendarStartDay) {
    let localeObj = locale
      ? getLocaleObject(locale)
      : getLocaleObject(getDefaultLocale());
    return provider.startOfWeek(date, {
      locale: localeObj,
      weekStartsOn: calendarStartDay,
    });
  }

  const getStartOfMonth = provider.startOfMonth;
  const getStartOfYear = provider.startOfYear;
  const getStartOfQuarter = provider.startOfQuarter;
  function getStartOfToday() {
    return provider.startOfDay(newDate());
  }

  // *** End of ***

  const getEndOfWeek = provider.endOfWeek;
  const getEndOfMonth = provider.endOfMonth;

  // ** Date Math **

  // *** Addition ***

  const addMinutes = provider.addMinutes;
  const addDays = provider.addDays;
  const addWeeks = provider.addWeeks;
  const addMonths = provider.addMonths;
  const addYears = provider.addYears;
  const addHours = provider.addHours;
  const addQuarters = provider.addQuarters;

  // *** Subtraction ***

  const subMinutes = provider.subMinutes;
  const subHours = provider.subHours;
  const subDays = provider.subDays;
  const subWeeks = provider.subWeeks;
  const subMonths = provider.subMonths;
  const subYears = provider.subYears;

  // ** Date Comparison **

  const isBefore = provider.isBefore;
  const isAfter = provider.isAfter;

  function isSameYear(date1, date2) {
    if (date1 && date2) {
      return provider.isSameYear(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  function isSameMonth(date1, date2) {
    if (date1 && date2) {
      return provider.isSameMonth(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  function isSameQuarter(date1, date2) {
    if (date1 && date2) {
      return provider.isSameQuarter(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  function isSameDay(date1, date2) {
    if (date1 && date2) {
      return provider.isSameDay(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  function isEqual(date1, date2) {
    if (date1 && date2) {
      return provider.isEqual(date1, date2);
    } else {
      return !date1 && !date2;
    }
  }

  function isDayInRange(day, startDate, endDate) {
    let valid;
    const start = provider.startOfDay(startDate);
    const end = provider.endOfDay(endDate);

    try {
      valid = provider.isWithinInterval(day, { start, end });
    } catch (err) {
      valid = false;
    }
    return valid;
  }

  // *** Diffing ***

  function getDaysDiff(date1, date2) {
    return provider.differenceInCalendarDays(date1, date2);
  }

  // ** Date Localization **

  function registerLocale(localeName, localeData) {
    if (!__localeData__) {
      __localeData__ = {};
    }
    __localeData__[localeName] = localeData;
  }

  function setDefaultLocale(localeName) {
    __localeId__ = localeName;
  }

  function getDefaultLocale() {
    return __localeId__;
  }

  function getLocaleObject(localeSpec) {
    if (typeof localeSpec === "string") {
      // Treat it as a locale name registered by registerLocale
      return __localeData__ ? __localeData__[localeSpec] : null;
    } else {
      // Treat it as a raw date-fns locale object
      return localeSpec;
    }
  }

  function getFormattedWeekdayInLocale(date, formatFunc, locale) {
    return typeof formatFunc === "function"
      ? formatFunc(date, locale)
      : formatDate(date, "EEEE", locale);
  }

  function getWeekdayMinInLocale(date, locale) {
    return formatDate(date, "EEEEEE", locale);
  }

  function getWeekdayShortInLocale(date, locale) {
    return formatDate(date, "EEE", locale);
  }

  function getMonthInLocale(month, locale) {
    return formatDate(setMonth(newDate(), month), "LLLL", locale);
  }

  function getMonthShortInLocale(month, locale) {
    return formatDate(setMonth(newDate(), month), "LLL", locale);
  }

  function getQuarterShortInLocale(quarter, locale) {
    return formatDate(setQuarter(newDate(), quarter), "QQQ", locale);
  }

  // ** Utils for some components **

  function isDayDisabled(
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
      isOutOfBounds(day, { minDate, maxDate }) ||
      (excludeDates &&
        excludeDates.some((excludeDate) => isSameDay(day, excludeDate))) ||
      (excludeDateIntervals &&
        excludeDateIntervals.some(({ start, end }) =>
          provider.isWithinInterval(day, { start, end })
        )) ||
      (includeDates &&
        !includeDates.some((includeDate) => isSameDay(day, includeDate))) ||
      (includeDateIntervals &&
        !includeDateIntervals.some(({ start, end }) =>
          provider.isWithinInterval(day, { start, end })
        )) ||
      (filterDate && !filterDate(newDate(day))) ||
      false
    );
  }

  function isDayExcluded(day, { excludeDates, excludeDateIntervals } = {}) {
    if (excludeDateIntervals && excludeDateIntervals.length > 0) {
      return excludeDateIntervals.some(({ start, end }) =>
        provider.isWithinInterval(day, { start, end })
      );
    }
    return (
      (excludeDates &&
        excludeDates.some((excludeDate) => isSameDay(day, excludeDate))) ||
      false
    );
  }

  function isMonthDisabled(
    month,
    { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
  ) {
    return (
      isOutOfBounds(month, { minDate, maxDate }) ||
      (excludeDates &&
        excludeDates.some((excludeDate) => isSameMonth(month, excludeDate))) ||
      (includeDates &&
        !includeDates.some((includeDate) => isSameMonth(month, includeDate))) ||
      (filterDate && !filterDate(newDate(month))) ||
      false
    );
  }

  function isMonthinRange(startDate, endDate, m, day) {
    const startDateYear = getYear(startDate);
    const startDateMonth = getMonth(startDate);
    const endDateYear = getYear(endDate);
    const endDateMonth = getMonth(endDate);
    const dayYear = getYear(day);
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

  function isQuarterDisabled(
    quarter,
    { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
  ) {
    return (
      isOutOfBounds(quarter, { minDate, maxDate }) ||
      (excludeDates &&
        excludeDates.some((excludeDate) =>
          isSameQuarter(quarter, excludeDate)
        )) ||
      (includeDates &&
        !includeDates.some((includeDate) =>
          isSameQuarter(quarter, includeDate)
        )) ||
      (filterDate && !filterDate(newDate(quarter))) ||
      false
    );
  }

  function isYearDisabled(year, { minDate, maxDate } = {}) {
    const date = new Date(year, 0, 1);
    return isOutOfBounds(date, { minDate, maxDate }) || false;
  }

  function isQuarterInRange(startDate, endDate, q, day) {
    const startDateYear = getYear(startDate);
    const startDateQuarter = getQuarter(startDate);
    const endDateYear = getYear(endDate);
    const endDateQuarter = getQuarter(endDate);
    const dayYear = getYear(day);
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

  function isOutOfBounds(day, { minDate, maxDate } = {}) {
    return (
      (minDate && provider.differenceInCalendarDays(day, minDate) < 0) ||
      (maxDate && provider.differenceInCalendarDays(day, maxDate) > 0)
    );
  }

  function isTimeInList(time, times) {
    return times.some(
      (listTime) =>
        getHours(listTime) === getHours(time) &&
        getMinutes(listTime) === getMinutes(time)
    );
  }

  function isTimeDisabled(
    time,
    { excludeTimes, includeTimes, filterTime } = {}
  ) {
    return (
      (excludeTimes && isTimeInList(time, excludeTimes)) ||
      (includeTimes && !isTimeInList(time, includeTimes)) ||
      (filterTime && !filterTime(time)) ||
      false
    );
  }

  function isTimeInDisabledRange(time, { minTime, maxTime }) {
    if (!minTime || !maxTime) {
      throw new Error("Both minTime and maxTime props required");
    }
    const base = newDate();
    const baseTime = setHours(
      setMinutes(base, getMinutes(time)),
      getHours(time)
    );
    const min = setHours(
      setMinutes(base, getMinutes(minTime)),
      getHours(minTime)
    );
    const max = setHours(
      setMinutes(base, getMinutes(maxTime)),
      getHours(maxTime)
    );

    let valid;
    try {
      valid = !provider.isWithinInterval(baseTime, {
        start: min,
        end: max,
      });
    } catch (err) {
      valid = false;
    }
    return valid;
  }

  function monthDisabledBefore(day, { minDate, includeDates } = {}) {
    const previousMonth = subMonths(day, 1);
    return (
      (minDate &&
        provider.differenceInCalendarMonths(minDate, previousMonth) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            provider.differenceInCalendarMonths(includeDate, previousMonth) > 0
        )) ||
      false
    );
  }

  function monthDisabledAfter(day, { maxDate, includeDates } = {}) {
    const nextMonth = addMonths(day, 1);
    return (
      (maxDate &&
        provider.differenceInCalendarMonths(nextMonth, maxDate) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            provider.differenceInCalendarMonths(nextMonth, includeDate) > 0
        )) ||
      false
    );
  }

  function yearDisabledBefore(day, { minDate, includeDates } = {}) {
    const previousYear = subYears(day, 1);
    return (
      (minDate &&
        provider.differenceInCalendarYears(minDate, previousYear) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            provider.differenceInCalendarYears(includeDate, previousYear) > 0
        )) ||
      false
    );
  }

  function yearsDisabledBefore(
    day,
    { minDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}
  ) {
    const previousYear = getStartOfYear(subYears(day, yearItemNumber));
    const { endPeriod } = getYearsPeriod(previousYear, yearItemNumber);
    const minDateYear = minDate && getYear(minDate);
    return (minDateYear && minDateYear > endPeriod) || false;
  }

  function yearDisabledAfter(day, { maxDate, includeDates } = {}) {
    const nextYear = addYears(day, 1);
    return (
      (maxDate && provider.differenceInCalendarYears(nextYear, maxDate) > 0) ||
      (includeDates &&
        includeDates.every(
          (includeDate) =>
            provider.differenceInCalendarYears(nextYear, includeDate) > 0
        )) ||
      false
    );
  }

  function yearsDisabledAfter(
    day,
    { maxDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}
  ) {
    const nextYear = addYears(day, yearItemNumber);
    const { startPeriod } = getYearsPeriod(nextYear, yearItemNumber);
    const maxDateYear = maxDate && getYear(maxDate);
    return (maxDateYear && maxDateYear < startPeriod) || false;
  }

  function getEffectiveMinDate({ minDate, includeDates }) {
    if (includeDates && minDate) {
      let minDates = includeDates.filter(
        (includeDate) =>
          provider.differenceInCalendarDays(includeDate, minDate) >= 0
      );
      return provider.min(minDates);
    } else if (includeDates) {
      return provider.min(includeDates);
    } else {
      return minDate;
    }
  }

  function getEffectiveMaxDate({ maxDate, includeDates }) {
    if (includeDates && maxDate) {
      let maxDates = includeDates.filter(
        (includeDate) =>
          provider.differenceInCalendarDays(includeDate, maxDate) <= 0
      );
      return provider.max(maxDates);
    } else if (includeDates) {
      return provider.max(includeDates);
    } else {
      return maxDate;
    }
  }

  function getHightLightDaysMap(
    highlightDates = [],
    defaultClassName = "react-datepicker__day--highlighted"
  ) {
    const dateClasses = new Map();
    for (let i = 0, len = highlightDates.length; i < len; i++) {
      const obj = highlightDates[i];
      if (isDate(obj)) {
        const key = formatDate(obj, "MM.dd.yyyy");
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
            const key = formatDate(arrOfDates[k], "MM.dd.yyyy");
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

  function timesToInjectAfter(
    startOfDay,
    currentTime,
    currentMultiplier,
    intervals,
    injectedTimes
  ) {
    const l = injectedTimes.length;
    const times = [];
    for (let i = 0; i < l; i++) {
      const injectedTime = addMinutes(
        addHours(startOfDay, getHours(injectedTimes[i])),
        getMinutes(injectedTimes[i])
      );
      const nextTime = addMinutes(
        startOfDay,
        (currentMultiplier + 1) * intervals
      );

      if (
        isAfter(injectedTime, currentTime) &&
        isBefore(injectedTime, nextTime)
      ) {
        times.push(injectedTimes[i]);
      }
    }

    return times;
  }

  function addZero(i) {
    return i < 10 ? `0${i}` : `${i}`;
  }

  function getYearsPeriod(date, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER) {
    const endPeriod =
      Math.ceil(getYear(date) / yearItemNumber) * yearItemNumber;
    const startPeriod = endPeriod - (yearItemNumber - 1);
    return { startPeriod, endPeriod };
  }

  return {
    newDate,
    parseDate,
    isValid,
    isDate,
    formatDate,
    safeDateFormat,
    safeDateRangeFormat,
    setTime,
    setMinutes,
    setHours,
    setMonth,
    setQuarter,
    setYear,
    getSeconds,
    getMinutes,
    getHours,
    getMonth,
    getQuarter,
    getYear,
    getDay,
    getDate,
    getTime,
    getWeek,
    getDayOfWeekCode,
    getStartOfToday,
    getStartOfDay,
    getStartOfWeek,
    getStartOfMonth,
    getStartOfYear,
    getStartOfQuarter,
    getEndOfWeek,
    getEndOfMonth,
    addMinutes,
    addDays,
    addWeeks,
    addMonths,
    addYears,
    addQuarters,
    addHours,
    subMinutes,
    subHours,
    subDays,
    subWeeks,
    subMonths,
    subYears,
    isBefore,
    isAfter,
    isSameYear,
    isSameMonth,
    isSameQuarter,
    isSameDay,
    isEqual,
    isDayInRange,
    getDaysDiff,
    registerLocale,
    setDefaultLocale,
    getDefaultLocale,
    getLocaleObject,
    getFormattedWeekdayInLocale,
    getWeekdayMinInLocale,
    getWeekdayShortInLocale,
    getMonthInLocale,
    getMonthShortInLocale,
    getQuarterShortInLocale,
    isDayDisabled,
    isDayExcluded,
    isMonthDisabled,
    isMonthinRange,
    isQuarterDisabled,
    isYearDisabled,
    isQuarterInRange,
    isOutOfBounds,
    isTimeInList,
    isTimeDisabled,
    isTimeInDisabledRange,
    monthDisabledBefore,
    monthDisabledAfter,
    yearDisabledBefore,
    yearsDisabledBefore,
    yearDisabledAfter,
    yearsDisabledAfter,
    getEffectiveMinDate,
    getEffectiveMaxDate,
    getHightLightDaysMap,
    timesToInjectAfter,
    addZero,
    getYearsPeriod,
    startOfDay: provider.startOfDay,
    endOfDay: provider.endOfDay,
    set: provider.set,
  };
}
