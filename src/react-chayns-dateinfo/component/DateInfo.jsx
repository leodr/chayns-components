import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import text from '../constants/text';

export default class DateInfo extends PureComponent {
    static propTypes = {
        children: PropTypes.node,
        language: PropTypes.string,
        date: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]).isRequired,
        date2: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
        showTime: PropTypes.bool,
        showDate: PropTypes.bool,
        writeDay: PropTypes.bool,
        writeMonth: PropTypes.bool,
        noTitle: PropTypes.bool,
        useToday: PropTypes.bool,
        useTomorrowYesterday: PropTypes.bool,
    };

    static defaultProps = {
        children: <div />,
        language: (chayns.env.language || navigator.language || 'de').substring(0, 2).toLowerCase(),
        date2: null,
        showTime: null,
        showDate: null,
        writeDay: false,
        writeMonth: false,
        noTitle: false,
        useToday: null,
        useTomorrowYesterday: null,
    };

    static getRelativeDateString = (date, options = { language: 'de' }) => {
        const dateObj = new Date(date);
        const now = new Date();
        let timeBetween = now.getTime() - dateObj.getTime();
        const dateObj2 = new Date(date);
        const now2 = new Date();
        dateObj2.setHours(0);
        dateObj2.setMinutes(0);
        dateObj2.setSeconds(0);
        dateObj2.setMilliseconds(0);
        now2.setHours(0);
        now2.setMinutes(0);
        now2.setSeconds(0);
        now2.setMilliseconds(0);
        let timeBetween2 = now2.getTime() - dateObj2.getTime();
        let tense;
        if (timeBetween < 0) {
            tense = 'future';
            timeBetween *= -1;
            timeBetween2 *= -1;
        } else if (timeBetween > 0) {
            tense = 'past';
        } else {
            tense = 'now';
        }
        let unit = 'now';
        if (timeBetween < 1000 * 60) {
            unit = 'seconds';
        } else if (timeBetween < 1000 * 60 * 60) {
            unit = 'minutes';
        } else if (timeBetween < 1000 * 60 * 60 * 24) {
            unit = 'hours';
        } else if (timeBetween2 < 1000 * 60 * 60 * 24 * 30) {
            unit = 'days';
        } else if (timeBetween < 1000 * 60 * 60 * 24 * 365) {
            unit = 'months';
        } else if ((timeBetween >= 1000 * 60 * 60 * 24 * 365)) {
            unit = 'years';
        }
        const relativeValues = {
            seconds: Math.floor((timeBetween /= 1000) % 60),
            minutes: Math.floor((timeBetween /= 60) % 60),
            hours: Math.floor((timeBetween /= 60) % 24),
            wrongDays: Math.floor((timeBetween /= 24) % 30),
            days: Math.floor((timeBetween2 / 1000 / 60 / 60 / 24) % 30),
            months: Math.floor(timeBetween / 30),
            years: Math.floor(timeBetween / 365),
        };
        const absoluteValues = {
            seconds: dateObj.getSeconds(),
            minutes: dateObj.getMinutes(),
            hours: dateObj.getHours(),
            days: dateObj.getDate(),
            month: dateObj.getMonth() + 1,
            monthWritten: text[options.language].MONTHS[dateObj.getMonth()],
            years: dateObj.getFullYear(),
        };

        if (options.showTime === !!options.showTime && (unit === 'seconds' || unit === 'minutes' || unit === 'hours')) {
            unit = 'days';
        }

        if ((relativeValues[unit] === 1 || (relativeValues.days === 0 && dateObj.toISOString().substring(0, 10) !== now.toISOString().substring(0, 10))) && options.useTomorrowYesterday !== false) { // if value of unit is only 1...
            unit = unit.substring(0, unit.length - 1); // ...use singular of unit
        } else if (relativeValues[unit] === 0 && dateObj.toISOString().substring(0, 10) === now.toISOString().substring(0, 10) && options.useToday !== false) {
            unit += '0';
        }

        if (options.showDate === false && !(unit === 'seconds' || unit === 'now' || unit === 'minutes' || unit === 'hours') && options.showTime === null) {
            unit = 'hours';
        }

        let txt = text[options.language].RELATIVE_TEXT[tense][unit];

        if (options.showDate === false && options.showTime === true && !options.useToday && !options.useTomorrowYesterday) {
            txt = '';
        } else if ((options.showDate || options.writeMonth) && (!(options.useTomorrowYesterday && unit === 'day') && !(options.useToday && (unit.charAt(unit.length - 1) === '0' || unit === 'now')))) {
            if (options.writeMonth) {
                txt = text[options.language].ABSOLUTE_TEXT.dateMW;
            } else {
                txt = text[options.language].ABSOLUTE_TEXT.date;
            }
        }

        if (options.writeDay) {
            if (options.showDate || options.writeMonth) {
                txt = `${text[options.language].WEEKDAYS[dateObj.getDay()]}, ${txt}`;
            } else {
                txt = `${text[options.language].WEEKDAYS[dateObj.getDay()]} `;
            }
        }

        if (options.showTime) {
            if (txt) {
                txt += ` ${text[options.language].ABSOLUTE_TEXT.at} `;
            }
            txt += `${text[options.language].ABSOLUTE_TEXT.time}`;
        }

        return DateInfo.replace(txt, relativeValues, absoluteValues);
    };

    static getAbsoluteDateString = (date, options = { language: 'de' }) => {
        const dateObj = new Date(date);
        const txt = text[options.language].ABSOLUTE_TEXT.datetime;
        const absoluteValues = {
            seconds: dateObj.getSeconds(),
            minutes: dateObj.getMinutes(),
            hours: dateObj.getHours(),
            days: dateObj.getDate(),
            month: dateObj.getMonth() + 1,
            years: dateObj.getFullYear(),
        };
        return DateInfo.replace(txt, {}, absoluteValues);
    };

    static replace = (string, relativeValues, absoluteValues) => {
        const localeConfig = { minimumIntegerDigits: 2, maximumFractionDigits: 0 };

        return string
            .replace('##rMINUTES##', relativeValues.minutes)
            .replace('##rHOURS##', relativeValues.hours)
            .replace('##rDAYS##', relativeValues.days)
            .replace('##rMONTHS##', relativeValues.months)
            .replace('##rYEARS##', relativeValues.years)
            .replace('##aSECONDS##', absoluteValues.seconds)
            .replace('##aMINUTES##', absoluteValues.minutes.toString().padStart(2, '0'))
            .replace('##aHOURS##', absoluteValues.hours.toString().padStart(2, '0'))
            .replace('##aDAYS##', absoluteValues.days)
            .replace('##aMONTH##', absoluteValues.month)
            .replace('##aMONTHw##', absoluteValues.monthWritten)
            .replace('##aYEARS##', absoluteValues.years)
            .replace(/^\s*|\s*$/g, '');// Matches whitespace at the start and end of the string
    };

    render() {
        const {
            date, language, noTitle, children, showDate, showTime, writeMonth, writeDay, date2, useToday, useTomorrowYesterday,
        } = this.props;

        let txt = DateInfo.getRelativeDateString(date, {
            language, showDate, showTime, writeDay, writeMonth, useToday, useTomorrowYesterday,
        });
        if (date2) {
            txt += ' - ';
            if (new Date(date).toISOString().substring(0, 10) === new Date(date2).toISOString().substring(0, 10)) {
                txt += DateInfo.getRelativeDateString(date2, {
                    language, showDate: false, showTime, writeDay, writeMonth, useToday, useTomorrowYesterday,
                });
            } else {
                txt += DateInfo.getRelativeDateString(date2, {
                    language, showDate, showTime, writeDay, writeMonth, useToday, useTomorrowYesterday,
                });
            }
        }
        if (date2 && date > date2) {
            // eslint-disable-next-line no-console
            console.warn('[chayns components]: date2 is smaller than date');
        }

        return React.cloneElement(
            children,
            noTitle || { title: DateInfo.getAbsoluteDateString(date, { language }) },
            txt,
        );
    }
}
