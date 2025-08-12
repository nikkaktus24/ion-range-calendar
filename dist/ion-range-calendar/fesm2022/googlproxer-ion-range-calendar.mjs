import * as i0 from '@angular/core';
import { InjectionToken, inject, Injectable, input, computed, Component, forwardRef, output, ChangeDetectorRef, viewChild, HostBinding } from '@angular/core';
import { subDays, getDaysInMonth, isSameDay, isWithinInterval, isToday, isBefore, isAfter, addDays, addMonths, format, startOfDay, subMonths, differenceInMonths, subYears, addYears, parse } from 'date-fns';
import { NgClass } from '@angular/common';
import * as i3 from '@angular/forms';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import * as i1 from '@ionic/angular/standalone';
import { IonToolbar, IonContent, IonHeader, IonButtons, IonButton, IonLabel, IonIcon, IonTitle, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, refresh, close, chevronForwardOutline, chevronBackOutline, caretUpOutline, caretDownOutline } from 'ionicons/icons';

const defaults = {
    DATE_FORMAT: 'yyyy-MM-dd',
    COLOR: 'primary',
    WEEKS_FORMAT: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    MONTH_FORMAT: [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
    ],
};

const DEFAULT_CALENDAR_OPTIONS = new InjectionToken('DEFAULT_CALENDAR_MODAL_OPTIONS');

class IonRangeCalendarService {
    constructor() {
        this.defaultOpts = inject(DEFAULT_CALENDAR_OPTIONS, {
            optional: true,
        });
        this.DEFAULT_STEP = 12;
    }
    safeOpt(calendarOptions = {}) {
        const _disableWeeks = [];
        const _daysConfig = [];
        let { from = this.defaultOpts?.from || calendarOptions.from || new Date(), to = 0, weekStart = 0, step = this.DEFAULT_STEP, cssClass = '', closeLabel = 'Cancel', closeTitle = '', doneLabel = 'Done', doneTitle = '', clearLabel = 'Clear', clearTitle = '', monthFormat = 'MMM yyyy', title = 'Calendar', defaultTitle = '', defaultSubtitle = '', autoDone = false, canBackwardsSelected = false, closeIcon = false, doneIcon = false, clearIcon = false, pickMode = 'single', color = defaults.COLOR, weekdays = defaults.WEEKS_FORMAT, daysConfig = _daysConfig, disableWeeks = _disableWeeks, showAdjacentMonthDay = true, defaultEndDateToStartDate = true, maxRange = 0, clearResetsToDefault = false, slots = [], } = { ...this.defaultOpts, ...calendarOptions };
        //  if from is not provided, but a default range is, set from to the default range from
        if (typeof calendarOptions.from === 'undefined' &&
            calendarOptions.defaultDateRange) {
            from = subDays(new Date(calendarOptions.defaultDateRange.from), 1);
        }
        //  default scroll is either provided, inferred from the provided default date range from, the provided from, or today
        let defaultScrollTo = calendarOptions.defaultScrollTo;
        if (!defaultScrollTo) {
            if (calendarOptions.defaultDateRange) {
                defaultScrollTo = new Date(calendarOptions.defaultDateRange.from);
            }
            else {
                defaultScrollTo = from ? new Date(from) : new Date();
            }
        }
        if (clearResetsToDefault &&
            !this.defaultOpts?.clearLabel &&
            !calendarOptions.clearLabel) {
            clearLabel = 'Reset';
        }
        this.opts = {
            from,
            to,
            pickMode,
            autoDone,
            color,
            cssClass,
            weekStart,
            closeLabel,
            closeIcon,
            closeTitle,
            doneLabel,
            doneIcon,
            doneTitle,
            clearLabel,
            clearIcon,
            clearTitle,
            canBackwardsSelected,
            disableWeeks,
            monthFormat,
            title,
            weekdays,
            daysConfig,
            step,
            defaultTitle,
            defaultSubtitle,
            defaultScrollTo,
            initialDate: calendarOptions.initialDate || calendarOptions.defaultDate || null,
            initialDates: calendarOptions.initialDates || calendarOptions.defaultDates || null,
            initialDateRange: calendarOptions.initialDateRange ||
                calendarOptions.defaultDateRange ||
                null,
            defaultDate: calendarOptions.defaultDate || null,
            defaultDates: calendarOptions.defaultDates || null,
            defaultDateRange: calendarOptions.defaultDateRange || null,
            showAdjacentMonthDay,
            defaultEndDateToStartDate,
            maxRange,
            clearResetsToDefault,
            slots,
            initialSlot: calendarOptions.initialSlot || calendarOptions.defaultSlot || null,
            defaultSlot: calendarOptions.defaultSlot || null,
        };
        return this.opts;
    }
    createOriginalCalendar(time) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstWeek = new Date(year, month, 1).getDay();
        //  get the number of days in the month of the provided time
        const howManyDays = getDaysInMonth(date);
        return {
            year,
            month,
            firstWeek,
            howManyDays,
            time: new Date(year, month, 1).getTime(),
            date: new Date(time),
        };
    }
    findDayConfig(day, opt) {
        if (opt.daysConfig && opt.daysConfig.length <= 0)
            return null;
        return opt.daysConfig?.find((n) => isSameDay(day, n.date));
    }
    findSlotForDay(day, opt) {
        if (!opt.slots || opt.slots.length <= 0)
            return undefined;
        return opt.slots.find((slot) => {
            const slotStart = new Date(slot.from);
            const slotEnd = new Date(slot.to);
            return isWithinInterval(day, { start: slotStart, end: slotEnd });
        });
    }
    isDayInAnySlot(day, opt) {
        return !!this.findSlotForDay(day, opt);
    }
    createCalendarDay(time, opt, month) {
        const _time = new Date(time);
        const date = new Date(time);
        const today = isToday(date);
        const dayConfig = this.findDayConfig(_time, opt);
        const _rangeBeg = new Date(opt.from);
        const _rangeEnd = new Date(opt.to);
        const _hasBeg = !!_rangeBeg.valueOf();
        const _hasEnd = !!_rangeEnd.valueOf();
        let isInRange = true;
        const disableWeeks = opt.disableWeeks && opt.disableWeeks.indexOf(_time.getDay()) !== -1;
        if (_hasBeg && _hasEnd) {
            //  both from and to are set, check if time is in between, unless backwards selection is allowed, then check if time is before to
            if (opt.canBackwardsSelected) {
                isInRange = isBefore(_time, _rangeEnd);
            }
            else {
                isInRange = isWithinInterval(_time, {
                    start: _rangeBeg,
                    end: _rangeEnd,
                });
            }
        }
        else if (_hasBeg && !_hasEnd && !opt.canBackwardsSelected) {
            // if only from is set, check if time is after from, unless backwards selection is allowed
            isInRange = isAfter(_time, _rangeBeg);
        }
        else if (!_hasBeg && _hasEnd) {
            // if only to is set, check if time is before to
            isInRange = isBefore(_time, _rangeEnd);
        }
        //  if both from and to are not set, then all days are in range
        let _disable = false;
        if (dayConfig && typeof dayConfig.disable === 'boolean') {
            _disable = dayConfig.disable;
        }
        else {
            _disable = disableWeeks || !isInRange;
            // For slots mode, disable days that are not part of any slot
            if (opt.pickMode === 'slots' && opt.slots && opt.slots.length > 0) {
                _disable = _disable || !this.isDayInAnySlot(_time, opt);
            }
        }
        let title = new Date(time).getDate().toString();
        if (dayConfig && dayConfig.title) {
            title = dayConfig.title;
        }
        else if (opt.defaultTitle) {
            title = opt.defaultTitle;
        }
        let subTitle = '';
        if (dayConfig && dayConfig.subTitle) {
            subTitle = dayConfig.subTitle;
        }
        else if (opt.defaultSubtitle) {
            subTitle = opt.defaultSubtitle;
        }
        return {
            time,
            isToday: today,
            title,
            subTitle,
            isLastMonth: typeof month === 'number' ? date.getMonth() < month : false,
            isNextMonth: typeof month === 'number' ? date.getMonth() > month : false,
            marked: dayConfig ? dayConfig.marked || false : false,
            cssClass: dayConfig ? dayConfig.cssClass || '' : '',
            disable: _disable,
            isFirst: date.getDate() === 1,
            isLast: date.getDate() === getDaysInMonth(date),
        };
    }
    createCalendarMonth(original, opt) {
        const days = new Array(6).fill(null);
        const len = original.howManyDays;
        for (let i = original.firstWeek; i < len + original.firstWeek; i++) {
            const itemTime = new Date(original.year, original.month, i - original.firstWeek + 1).getTime();
            days[i] = this.createCalendarDay(itemTime, opt);
        }
        const weekStart = opt.weekStart;
        if (weekStart === 1) {
            if (days[0] === null) {
                days.shift();
            }
            else {
                days.unshift(...new Array(6).fill(null));
            }
        }
        if (opt.showAdjacentMonthDay) {
            const _booleanMap = days.map((e) => !!e);
            const thisMonth = new Date(original.time).getMonth();
            let startOffsetIndex = _booleanMap.indexOf(true) - 1;
            let endOffsetIndex = _booleanMap.lastIndexOf(true) + 1;
            for (startOffsetIndex; startOffsetIndex >= 0; startOffsetIndex--) {
                const dayBefore = subDays(days[startOffsetIndex + 1].time, 1);
                days[startOffsetIndex] = this.createCalendarDay(dayBefore.valueOf(), opt, thisMonth);
            }
            if (!(_booleanMap.length % 7 === 0 && _booleanMap[_booleanMap.length - 1])) {
                for (endOffsetIndex; endOffsetIndex < days.length + (endOffsetIndex % 7); endOffsetIndex++) {
                    const dayAfter = addDays(days[endOffsetIndex - 1].time, 1);
                    days[endOffsetIndex] = this.createCalendarDay(dayAfter.valueOf(), opt, thisMonth);
                }
            }
        }
        return {
            days,
            original: original,
        };
    }
    createMonthsByPeriod(startTime, monthsNum, opt) {
        const _array = [];
        const _start = new Date(startTime);
        const _startMonth = new Date(_start.getFullYear(), _start.getMonth(), 1).getTime();
        for (let i = 0; i < monthsNum; i++) {
            const time = addMonths(_startMonth, i).valueOf();
            const originalCalendar = this.createOriginalCalendar(time);
            _array.push(this.createCalendarMonth(originalCalendar, opt));
        }
        return _array;
    }
    wrapResult(original, pickMode) {
        let result;
        switch (pickMode) {
            case 'single':
                result = this.multiFormat(original[0].time);
                break;
            case 'range':
            case 'slots':
                result = {
                    from: this.multiFormat(original[0].time),
                    to: this.multiFormat((original[1] || original[0]).time),
                };
                break;
            case 'multi':
                result = original.map((e) => this.multiFormat(e.time));
                break;
            default:
                result = original;
        }
        return result;
    }
    multiFormat(time) {
        const _date = new Date(time);
        return {
            time: _date.valueOf(),
            unix: Math.floor(_date.valueOf() / 1000),
            dateObj: _date,
            string: format(_date, defaults.DATE_FORMAT),
            years: _date.getFullYear(),
            months: _date.getMonth() + 1,
            date: _date.getDate(),
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: IonRangeCalendarService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: IonRangeCalendarService, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: IonRangeCalendarService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

class CalendarWeekComponent {
    constructor() {
        this.color = input(defaults.COLOR);
        this.weekArray = input(defaults.WEEKS_FORMAT, {
            transform: this.setWeekArray,
        });
        this.weekStart = input(0, { transform: this.setWeekStart });
        this.displayWeekArray = computed(() => {
            if (this.weekStart() === 1) {
                const cacheWeekArray = [...this.weekArray()];
                cacheWeekArray.push(cacheWeekArray.shift());
                return [...cacheWeekArray];
            }
            return this.weekArray();
        });
    }
    setWeekArray(value) {
        if (value && value.length === 7) {
            return [...value];
        }
        return defaults.WEEKS_FORMAT;
    }
    setWeekStart(value) {
        // return 0 or 1, default 0
        return value === 1 ? 1 : 0;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: CalendarWeekComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.11", type: CalendarWeekComponent, isStandalone: true, selector: "ion-range-calendar-week", inputs: { color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, weekArray: { classPropertyName: "weekArray", publicName: "weekArray", isSignal: true, isRequired: false, transformFunction: null }, weekStart: { classPropertyName: "weekStart", publicName: "weekStart", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "<ion-toolbar [class]=\"'week-toolbar ' + color()\" no-border-top>\n  <ul [class]=\"'week-title ' + color()\">\n    @for (w of displayWeekArray(); track $index) {\n      <li>{{ w }}</li>\n    }\n  </ul>\n</ion-toolbar>\n", styles: [":host .toolbar-background-md,:host .toolbar-background-ios{background:transparent}:host .week-toolbar{--padding-start: 0;--padding-end: 0;--padding-bottom: 0;--padding-top: 0}:host .week-toolbar.primary{--background: var(--ion-color-primary)}:host .week-toolbar.secondary{--background: var(--ion-color-secondary)}:host .week-toolbar.danger{--background: var(--ion-color-danger)}:host .week-toolbar.dark{--background: var(--ion-color-dark)}:host .week-toolbar.light{--background: var(--ion-color-light)}:host .week-toolbar.transparent{--background: transparent}:host .week-toolbar.toolbar-md{min-height:44px}:host .week-title{margin:0;height:44px;width:100%;padding:15px 0;color:#fff;font-size:.9em}:host .week-title.light,:host .week-title.transparent{color:#9e9e9e}:host .week-title li{list-style-type:none;display:block;float:left;width:14%;text-align:center}:host .week-title li:nth-of-type(7n),:host .week-title li:nth-of-type(7n+1){width:15%}\n"], dependencies: [{ kind: "component", type: IonToolbar, selector: "ion-toolbar", inputs: ["color", "mode"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: CalendarWeekComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ion-range-calendar-week', imports: [IonToolbar], template: "<ion-toolbar [class]=\"'week-toolbar ' + color()\" no-border-top>\n  <ul [class]=\"'week-title ' + color()\">\n    @for (w of displayWeekArray(); track $index) {\n      <li>{{ w }}</li>\n    }\n  </ul>\n</ion-toolbar>\n", styles: [":host .toolbar-background-md,:host .toolbar-background-ios{background:transparent}:host .week-toolbar{--padding-start: 0;--padding-end: 0;--padding-bottom: 0;--padding-top: 0}:host .week-toolbar.primary{--background: var(--ion-color-primary)}:host .week-toolbar.secondary{--background: var(--ion-color-secondary)}:host .week-toolbar.danger{--background: var(--ion-color-danger)}:host .week-toolbar.dark{--background: var(--ion-color-dark)}:host .week-toolbar.light{--background: var(--ion-color-light)}:host .week-toolbar.transparent{--background: transparent}:host .week-toolbar.toolbar-md{min-height:44px}:host .week-title{margin:0;height:44px;width:100%;padding:15px 0;color:#fff;font-size:.9em}:host .week-title.light,:host .week-title.transparent{color:#9e9e9e}:host .week-title li{list-style-type:none;display:block;float:left;width:14%;text-align:center}:host .week-title li:nth-of-type(7n),:host .week-title li:nth-of-type(7n+1){width:15%}\n"] }]
        }] });

const MONTH_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MonthComponent),
    multi: true,
};
class MonthComponent {
    constructor() {
        this.componentMode = input(false);
        this.month = input();
        this.pickMode = input();
        this.readonly = input(false);
        this.color = input(defaults.COLOR);
        this.ionChange = output();
        this.select = output();
        this.selectStart = output();
        this.selectEnd = output();
        this._date = [null, null];
        this._isInit = false;
        this.DAY_DATE_FORMAT = 'MMMM dd, yyyy';
        this.ref = inject(ChangeDetectorRef);
        this.service = inject(IonRangeCalendarService);
    }
    get _isRange() {
        return this.pickMode() === 'range' || this.pickMode() === 'slots';
    }
    ngAfterViewInit() {
        this._isInit = true;
    }
    get value() {
        return this._date;
    }
    writeValue(obj) {
        if (Array.isArray(obj)) {
            this._date = obj;
        }
    }
    registerOnChange(fn) {
        this._onChanged = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    isEndSelection(day) {
        if (!day)
            return false;
        if ((this.pickMode() !== 'range' && this.pickMode() !== 'slots') ||
            !this._isInit ||
            this._date[1] === null) {
            return false;
        }
        return this._date[1].time === day.time;
    }
    getDayLabel(day) {
        return new Date(day.time);
    }
    isBetween(day) {
        if (!day)
            return false;
        if ((this.pickMode() !== 'range' && this.pickMode() !== 'slots') || !this._isInit) {
            return false;
        }
        if (this._date[0] === null || this._date[1] === null) {
            return false;
        }
        return day.time < this._date[1].time && day.time > this._date[0].time;
    }
    isStartSelection(day) {
        if (!day)
            return false;
        if ((this.pickMode() !== 'range' && this.pickMode() !== 'slots') ||
            !this._isInit ||
            this._date[0] === null) {
            return false;
        }
        return this._date[0].time === day.time && this._date[1] !== null;
    }
    isSelected(time) {
        if (Array.isArray(this._date)) {
            if (this.pickMode() !== 'multi') {
                if (this._date[0] !== null) {
                    return time === this._date[0].time;
                }
                if (this._date[1] !== null) {
                    return time === this._date[1].time;
                }
            }
            else {
                return (this._date.findIndex((e) => e !== null && e.time === time) !== -1);
            }
        }
        return false;
    }
    // Check if a day is the start of any slot
    isSlotStart(day) {
        if (!day || this.pickMode() !== 'slots')
            return false;
        const slot = this.service.findSlotForDay(new Date(day.time), this.service.opts);
        if (!slot)
            return false;
        const slotStart = new Date(slot.from);
        return new Date(day.time).toDateString() === slotStart.toDateString();
    }
    // Check if a day is the end of any slot
    isSlotEnd(day) {
        if (!day || this.pickMode() !== 'slots')
            return false;
        const slot = this.service.findSlotForDay(new Date(day.time), this.service.opts);
        if (!slot)
            return false;
        const slotEnd = new Date(slot.to);
        return new Date(day.time).toDateString() === slotEnd.toDateString();
    }
    // Check if a day is between slot start and end (but not start or end itself)
    isSlotBetween(day) {
        if (!day || this.pickMode() !== 'slots')
            return false;
        const slot = this.service.findSlotForDay(new Date(day.time), this.service.opts);
        if (!slot)
            return false;
        const dayTime = new Date(day.time);
        const slotStart = new Date(slot.from);
        const slotEnd = new Date(slot.to);
        return dayTime > slotStart && dayTime < slotEnd;
    }
    onSelected(item) {
        if (this.readonly())
            return;
        this.select.emit(item);
        if (this.pickMode() === 'single') {
            this._date[0] = item;
            this.ionChange.emit(this._date);
            return;
        }
        if (this.pickMode() === 'slots') {
            // For slots mode, find the slot that contains this day
            const slot = this.service.findSlotForDay(new Date(item.time), this.service.opts);
            if (slot) {
                // Select the entire slot range
                this._date[0] = this.service.createCalendarDay(new Date(slot.from).getTime(), this.service.opts);
                this._date[1] = this.service.createCalendarDay(new Date(slot.to).getTime(), this.service.opts);
                this.selectStart.emit(this._date[0]);
                this.selectEnd.emit(this._date[1]);
                this.ionChange.emit(this._date);
            }
            return;
        }
        if (this.pickMode() === 'range') {
            // max range as days in milliseconds
            const maxRange = (this.service.opts.maxRange - 1) * 86400000;
            // if start not selected, set to this day
            if (this._date[0] === null) {
                this._date[0] = Object.assign({}, item);
                this.selectStart.emit(this._date[0]);
                // if end not selected, set to this day
            }
            else if (this._date[1] === null) {
                //  if start is before this day, set end to this day
                if (this._date[0].time < item.time) {
                    this._date[1] = Object.assign({}, item);
                    this.selectEnd.emit(this._date[1]);
                    this.adjustStart(maxRange);
                    // if start is after this day, set end to start, and start to this day
                }
                else {
                    this._date[1] = this._date[0];
                    this.selectEnd.emit(this._date[0]);
                    this._date[0] = Object.assign({}, item);
                    this.selectStart.emit(this._date[0]);
                    this.adjustEnd(maxRange);
                }
                //  if start is after this day, set start to this day
            }
            else if (this._date[0].time > item.time) {
                this._date[0] = Object.assign({}, item);
                this.selectStart.emit(this._date[0]);
                this.adjustEnd(maxRange);
                // if end is before this day, set end to this day
            }
            else if (this._date[1].time < item.time) {
                this._date[1] = Object.assign({}, item);
                this.selectEnd.emit(this._date[1]);
                this.adjustStart(maxRange);
                // if start is this day, set end to this day
            }
            else if (this._date[0].time === item.time) {
                this._date[1] = Object.assign({}, item);
                this.selectEnd.emit(this._date[1]);
                this.adjustEnd(maxRange);
                // if end is this day, set start to this day
            }
            else if (this._date[1].time === item.time) {
                this._date[0] = Object.assign({}, item);
                this.selectStart.emit(this._date[0]);
                this.adjustStart(maxRange);
                //  else set end to null and start to this day
            }
            else {
                //  bump selected range to new range starting from selected to selected plus existing range
                const range = (this._date[1].time - this._date[0].time) / 86400000;
                this._date[0] = Object.assign({}, item);
                this.selectStart.emit(this._date[0]);
                let end = addDays(this._date[0].time, range);
                //  if end is after service.opts.to, set end to service.opts.to
                if (isAfter(end, this.service.opts.to))
                    end = startOfDay(this.service.opts.to);
                this._date[1].time = +end;
                this.selectEnd.emit(this._date[1]);
            }
            this.ionChange.emit(this._date);
            return;
        }
        if (this.pickMode() === 'multi') {
            const index = this._date.findIndex((e) => e !== null && e.time === item.time);
            if (index === -1) {
                this._date.push(item);
            }
            else {
                this._date.splice(index, 1);
            }
            this.ionChange.emit(this._date.filter((e) => e !== null));
        }
    }
    // if max range and end minus max range is greater than start, set start to end minus max range
    adjustStart(maxRange) {
        if (maxRange > 0 && this._date[1].time - maxRange > this._date[0].time) {
            this._date[0].time = +subDays(this._date[1].time, this.service.opts.maxRange - 1);
            this.selectStart.emit(this._date[0]);
        }
    }
    //  if max range and start plus max range is less than end, set end to start plus max range
    adjustEnd(maxRange) {
        if (maxRange > 0 && this._date[0].time + maxRange < this._date[1].time) {
            this._date[1].time = +addDays(this._date[0].time, this.service.opts.maxRange - 1);
            this.selectEnd.emit(this._date[1]);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: MonthComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.11", type: MonthComponent, isStandalone: true, selector: "ion-range-calendar-month", inputs: { componentMode: { classPropertyName: "componentMode", publicName: "componentMode", isSignal: true, isRequired: false, transformFunction: null }, month: { classPropertyName: "month", publicName: "month", isSignal: true, isRequired: false, transformFunction: null }, pickMode: { classPropertyName: "pickMode", publicName: "pickMode", isSignal: true, isRequired: false, transformFunction: null }, readonly: { classPropertyName: "readonly", publicName: "readonly", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { ionChange: "ionChange", select: "select", selectStart: "selectStart", selectEnd: "selectEnd" }, host: { properties: { "class.component-mode": "componentMode()" } }, providers: [MONTH_VALUE_ACCESSOR], ngImport: i0, template: "<div [class]=\"color()\">\n  @if (!_isRange) {\n    <div class=\"days-box\">\n      @for (day of month().days; track $index) {\n        <div class=\"days\">\n          @if (day) {\n            <button\n              type=\"button\"\n              [class]=\"'days-btn ' + day.cssClass\"\n              [class.today]=\"day.isToday\"\n              (click)=\"onSelected(day)\"\n              [class.marked]=\"day.marked\"\n              [class.last-month-day]=\"day.isLastMonth\"\n              [class.next-month-day]=\"day.isNextMonth\"\n              [class.on-selected]=\"isSelected(day ? day.time : $index)\"\n              [disabled]=\"day.disable\"\n            >\n              <p>{{ day.title }}</p>\n              @if (day.subTitle) {\n                <small>{{ day?.subTitle }}</small>\n              }\n            </button>\n          }\n        </div>\n      }\n    </div>\n  } @else {\n    <div class=\"days-box\">\n      @for (day of month().days; track $index) {\n        <div\n          class=\"days\"\n          [class.startSelection]=\"isStartSelection(day) || isSlotStart(day)\"\n          [class.endSelection]=\"isEndSelection(day) || isSlotEnd(day)\"\n          [class.is-first-wrap]=\"day?.isFirst\"\n          [class.is-last-wrap]=\"day?.isLast\"\n          [class.between]=\"isBetween(day) || isSlotBetween(day)\"\n        >\n          @if (day) {\n            <button\n              type=\"button\"\n              [class]=\"'days-btn ' + day.cssClass\"\n              [class.today]=\"day.isToday\"\n              (click)=\"onSelected(day)\"\n              [class.marked]=\"day.marked\"\n              [class.last-month-day]=\"day.isLastMonth\"\n              [class.next-month-day]=\"day.isNextMonth\"\n              [class.is-first]=\"day.isFirst\"\n              [class.is-last]=\"day.isLast\"\n              [class.on-selected]=\"isSelected(day ? day.time : $index)\"\n              [disabled]=\"day.disable\"\n            >\n              <p>{{ day.title }}</p>\n              @if (day.subTitle) {\n                <small>{{ day?.subTitle }}</small>\n              }\n            </button>\n          }\n        </div>\n      }\n    </div>\n  }\n</div>\n", styles: [":host{display:inline-block;width:100%}:host .days-box{padding:.5rem}:host .days:nth-of-type(7n),:host .days:nth-of-type(7n+1){width:15%}:host .days{width:14%;float:left;text-align:center;height:36px;margin-bottom:5px}:host .days .marked p{font-weight:500}:host .days .on-selected{border:none}:host .days .on-selected p{font-size:1.3em}:host .primary button.days-btn small,:host .primary .days .marked p,:host .primary .days .today p{color:var(--ion-color-primary)}:host .primary .days .today p{font-weight:700}:host .primary .days .last-month-day p,:host .primary .days .next-month-day p{color:#00000040}:host .primary .days .today.on-selected p,:host .primary .days .marked.on-selected p{color:#fff}:host .primary .days .on-selected,:host .primary .startSelection button.days-btn,:host .primary .endSelection button.days-btn{background-color:var(--ion-color-primary);color:#fff}:host .primary .startSelection{position:relative}:host .primary .startSelection:before,:host .primary .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .primary .startSelection:before{background-color:var(--ion-color-primary)}:host .primary .startSelection:after{background-color:#fff;opacity:.25}:host .primary .endSelection{position:relative}:host .primary .endSelection:before,:host .primary .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .primary .endSelection:before{background-color:var(--ion-color-primary)}:host .primary .endSelection:after{background-color:#fff;opacity:.25}:host .primary .startSelection.endSelection:after{background-color:transparent}:host .primary .startSelection button.days-btn{border-radius:50%}:host .primary .between button.days-btn{background-color:var(--ion-color-primary);width:100%;border-radius:0;position:relative}:host .primary .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .primary .between button.days-btn p{color:#fff}:host .primary .endSelection button.days-btn{border-radius:50%}:host .primary .endSelection button.days-btn p{color:#fff}:host .primary .days .on-selected p{color:#fff}:host .primary .startSelection button.days-btn,:host .primary .endSelection button.days-btn,:host .primary .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .primary .startSelection.endSelection:before{--ion-color-primary: transparent}:host .secondary button.days-btn small,:host .secondary .days .marked p,:host .secondary .days .today p{color:var(--ion-color-secondary)}:host .secondary .days .today p{font-weight:700}:host .secondary .days .last-month-day p,:host .secondary .days .next-month-day p{color:#00000040}:host .secondary .days .today.on-selected p,:host .secondary .days .marked.on-selected p{color:#fff}:host .secondary .days .on-selected,:host .secondary .startSelection button.days-btn,:host .secondary .endSelection button.days-btn{background-color:var(--ion-color-secondary);color:#fff}:host .secondary .startSelection{position:relative}:host .secondary .startSelection:before,:host .secondary .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .secondary .startSelection:before{background-color:var(--ion-color-secondary)}:host .secondary .startSelection:after{background-color:#fff;opacity:.25}:host .secondary .endSelection{position:relative}:host .secondary .endSelection:before,:host .secondary .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .secondary .endSelection:before{background-color:var(--ion-color-secondary)}:host .secondary .endSelection:after{background-color:#fff;opacity:.25}:host .secondary .startSelection.endSelection:after{background-color:transparent}:host .secondary .startSelection button.days-btn{border-radius:50%}:host .secondary .between button.days-btn{background-color:var(--ion-color-secondary);width:100%;border-radius:0;position:relative}:host .secondary .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .secondary .between button.days-btn p{color:#fff}:host .secondary .endSelection button.days-btn{border-radius:50%}:host .secondary .endSelection button.days-btn p{color:#fff}:host .secondary .days .on-selected p{color:#fff}:host .secondary .startSelection button.days-btn,:host .secondary .endSelection button.days-btn,:host .secondary .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .secondary .startSelection.endSelection:before{--ion-color-primary: transparent}:host .danger button.days-btn small,:host .danger .days .marked p,:host .danger .days .today p{color:var(--ion-color-danger)}:host .danger .days .today p{font-weight:700}:host .danger .days .last-month-day p,:host .danger .days .next-month-day p{color:#00000040}:host .danger .days .today.on-selected p,:host .danger .days .marked.on-selected p{color:#fff}:host .danger .days .on-selected,:host .danger .startSelection button.days-btn,:host .danger .endSelection button.days-btn{background-color:var(--ion-color-danger);color:#fff}:host .danger .startSelection{position:relative}:host .danger .startSelection:before,:host .danger .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .danger .startSelection:before{background-color:var(--ion-color-danger)}:host .danger .startSelection:after{background-color:#fff;opacity:.25}:host .danger .endSelection{position:relative}:host .danger .endSelection:before,:host .danger .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .danger .endSelection:before{background-color:var(--ion-color-danger)}:host .danger .endSelection:after{background-color:#fff;opacity:.25}:host .danger .startSelection.endSelection:after{background-color:transparent}:host .danger .startSelection button.days-btn{border-radius:50%}:host .danger .between button.days-btn{background-color:var(--ion-color-danger);width:100%;border-radius:0;position:relative}:host .danger .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .danger .between button.days-btn p{color:#fff}:host .danger .endSelection button.days-btn{border-radius:50%}:host .danger .endSelection button.days-btn p{color:#fff}:host .danger .days .on-selected p{color:#fff}:host .danger .startSelection button.days-btn,:host .danger .endSelection button.days-btn,:host .danger .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .danger .startSelection.endSelection:before{--ion-color-primary: transparent}:host .dark button.days-btn small,:host .dark .days .marked p,:host .dark .days .today p{color:var(--ion-color-dark)}:host .dark .days .today p{font-weight:700}:host .dark .days .last-month-day p,:host .dark .days .next-month-day p{color:#00000040}:host .dark .days .today.on-selected p,:host .dark .days .marked.on-selected p{color:#fff}:host .dark .days .on-selected,:host .dark .startSelection button.days-btn,:host .dark .endSelection button.days-btn{background-color:var(--ion-color-dark);color:#fff}:host .dark .startSelection{position:relative}:host .dark .startSelection:before,:host .dark .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .dark .startSelection:before{background-color:var(--ion-color-dark)}:host .dark .startSelection:after{background-color:#fff;opacity:.25}:host .dark .endSelection{position:relative}:host .dark .endSelection:before,:host .dark .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .dark .endSelection:before{background-color:var(--ion-color-dark)}:host .dark .endSelection:after{background-color:#fff;opacity:.25}:host .dark .startSelection.endSelection:after{background-color:transparent}:host .dark .startSelection button.days-btn{border-radius:50%}:host .dark .between button.days-btn{background-color:var(--ion-color-dark);width:100%;border-radius:0;position:relative}:host .dark .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .dark .between button.days-btn p{color:#fff}:host .dark .endSelection button.days-btn{border-radius:50%}:host .dark .endSelection button.days-btn p{color:#fff}:host .dark .days .on-selected p{color:#fff}:host .dark .startSelection button.days-btn,:host .dark .endSelection button.days-btn,:host .dark .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .dark .startSelection.endSelection:before{--ion-color-primary: transparent}:host .light button.days-btn small,:host .light .days .marked p,:host .light .days .today p{color:var(--ion-color-light)}:host .light .days .today p{font-weight:700}:host .light .days .last-month-day p,:host .light .days .next-month-day p{color:#00000040}:host .light .days .today.on-selected p,:host .light .days .marked.on-selected p{color:#a0a0a0}:host .light .days .on-selected,:host .light .startSelection button.days-btn,:host .light .endSelection button.days-btn{background-color:var(--ion-color-light);color:#a0a0a0}:host .light .startSelection{position:relative}:host .light .startSelection:before,:host .light .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .light .startSelection:before{background-color:var(--ion-color-light)}:host .light .startSelection:after{background-color:#fff;opacity:.25}:host .light .endSelection{position:relative}:host .light .endSelection:before,:host .light .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .light .endSelection:before{background-color:var(--ion-color-light)}:host .light .endSelection:after{background-color:#fff;opacity:.25}:host .light .startSelection.endSelection:after{background-color:transparent}:host .light .startSelection button.days-btn{border-radius:50%}:host .light .between button.days-btn{background-color:var(--ion-color-light);width:100%;border-radius:0;position:relative}:host .light .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .light .between button.days-btn p{color:#a0a0a0}:host .light .endSelection button.days-btn{border-radius:50%}:host .light .endSelection button.days-btn p{color:#a0a0a0}:host .light .days .on-selected p{color:#a0a0a0}:host .light .startSelection button.days-btn,:host .light .endSelection button.days-btn,:host .light .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .light .startSelection.endSelection:before{--ion-color-primary: transparent}:host .light .days .today p{color:#565656}:host button.days-btn{border-radius:36px;width:36px;display:block;margin:0 auto;padding:0;height:36px;background-color:transparent;position:relative;z-index:2;outline:0}:host button.days-btn p{margin:0;font-size:1.2em;color:#333;text-align:center}:host button.days-btn[disabled] p{color:#00000040}:host button.days-btn small{overflow:hidden;display:block;left:0;right:0;bottom:-5px;position:absolute;z-index:1;text-align:center;font-weight:200}:host .days.startSelection:nth-child(7n):before,:host .days.between:nth-child(7n) button.days-btn,:host .days.between button.days-btn.is-last{border-radius:0 36px 36px 0}:host .days.startSelection:nth-child(7n):before.on-selected,:host .days.between:nth-child(7n) button.days-btn.on-selected,:host .days.between button.days-btn.is-last.on-selected{border-radius:50%}:host .days.endSelection:nth-child(7n+1):before,:host .days.between:nth-child(7n+1) button.days-btn,:host .days.between.is-first-wrap button.days-btn.is-first,:host button.days-btn.is-first{border-radius:36px 0 0 36px}:host .startSelection button.days-btn.is-first,:host .endSelection button.days-btn.is-first,:host button.days-btn.is-first.on-selected,:host button.days-btn.is-last.on-selected,:host .startSelection button.days-btn.is-last,:host .endSelection button.days-btn.is-last{border-radius:50%}:host .startSelection.is-last-wrap:before,:host .startSelection.is-last-wrap:after{border-radius:0 36px 36px 0}:host .endSelection.is-first-wrap:before,:host .endSelection.is-first-wrap:after{border-radius:36px 0 0 36px}:host.component-mode .days.between button.days-btn.is-last,:host.component-mode .days.between button.days-btn.is-first{border-radius:0}:host.component-mode .days.startSelection.is-last-wrap:before,:host.component-mode .days.startSelection.is-last-wrap:after{border-radius:0}:host.component-mode .days.endSelection.is-first-wrap:before,:host.component-mode .days.endSelection.is-first-wrap:after{border-radius:0}:host .cal-color .days .today p{font-weight:700}:host .cal-color .days .last-month-day p,:host .cal-color .days .next-month-day p{color:#00000040}:host .cal-color .days .today.on-selected p,:host .cal-color .days .marked.on-selected p{color:#fff}:host .cal-color .days .on-selected,:host .cal-color .startSelection button.days-btn,:host .cal-color .endSelection button.days-btn{color:#fff}:host .cal-color .startSelection{position:relative}:host .cal-color .startSelection:before,:host .cal-color .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .cal-color .startSelection:after{background-color:#fff;opacity:.25}:host .cal-color .endSelection{position:relative}:host .cal-color .endSelection:before,:host .cal-color .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .cal-color .endSelection:after{background-color:#fff;opacity:.25}:host .cal-color .startSelection.endSelection:after{background-color:transparent}:host .cal-color .startSelection button.days-btn{border-radius:50%}:host .cal-color .between button.days-btn{width:100%;border-radius:0;position:relative}:host .cal-color .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .cal-color .between button.days-btn p{color:#fff}:host .cal-color .endSelection button.days-btn{border-radius:50%}:host .cal-color .endSelection button.days-btn p{color:#fff}:host .cal-color .days .on-selected p{color:#fff}:host .cal-color .startSelection button.days-btn,:host .cal-color .endSelection button.days-btn,:host .cal-color .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .cal-color .startSelection.endSelection:before{--ion-color-primary: transparent}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: MonthComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ion-range-calendar-month', providers: [MONTH_VALUE_ACCESSOR], host: { '[class.component-mode]': 'componentMode()' }, standalone: true, template: "<div [class]=\"color()\">\n  @if (!_isRange) {\n    <div class=\"days-box\">\n      @for (day of month().days; track $index) {\n        <div class=\"days\">\n          @if (day) {\n            <button\n              type=\"button\"\n              [class]=\"'days-btn ' + day.cssClass\"\n              [class.today]=\"day.isToday\"\n              (click)=\"onSelected(day)\"\n              [class.marked]=\"day.marked\"\n              [class.last-month-day]=\"day.isLastMonth\"\n              [class.next-month-day]=\"day.isNextMonth\"\n              [class.on-selected]=\"isSelected(day ? day.time : $index)\"\n              [disabled]=\"day.disable\"\n            >\n              <p>{{ day.title }}</p>\n              @if (day.subTitle) {\n                <small>{{ day?.subTitle }}</small>\n              }\n            </button>\n          }\n        </div>\n      }\n    </div>\n  } @else {\n    <div class=\"days-box\">\n      @for (day of month().days; track $index) {\n        <div\n          class=\"days\"\n          [class.startSelection]=\"isStartSelection(day) || isSlotStart(day)\"\n          [class.endSelection]=\"isEndSelection(day) || isSlotEnd(day)\"\n          [class.is-first-wrap]=\"day?.isFirst\"\n          [class.is-last-wrap]=\"day?.isLast\"\n          [class.between]=\"isBetween(day) || isSlotBetween(day)\"\n        >\n          @if (day) {\n            <button\n              type=\"button\"\n              [class]=\"'days-btn ' + day.cssClass\"\n              [class.today]=\"day.isToday\"\n              (click)=\"onSelected(day)\"\n              [class.marked]=\"day.marked\"\n              [class.last-month-day]=\"day.isLastMonth\"\n              [class.next-month-day]=\"day.isNextMonth\"\n              [class.is-first]=\"day.isFirst\"\n              [class.is-last]=\"day.isLast\"\n              [class.on-selected]=\"isSelected(day ? day.time : $index)\"\n              [disabled]=\"day.disable\"\n            >\n              <p>{{ day.title }}</p>\n              @if (day.subTitle) {\n                <small>{{ day?.subTitle }}</small>\n              }\n            </button>\n          }\n        </div>\n      }\n    </div>\n  }\n</div>\n", styles: [":host{display:inline-block;width:100%}:host .days-box{padding:.5rem}:host .days:nth-of-type(7n),:host .days:nth-of-type(7n+1){width:15%}:host .days{width:14%;float:left;text-align:center;height:36px;margin-bottom:5px}:host .days .marked p{font-weight:500}:host .days .on-selected{border:none}:host .days .on-selected p{font-size:1.3em}:host .primary button.days-btn small,:host .primary .days .marked p,:host .primary .days .today p{color:var(--ion-color-primary)}:host .primary .days .today p{font-weight:700}:host .primary .days .last-month-day p,:host .primary .days .next-month-day p{color:#00000040}:host .primary .days .today.on-selected p,:host .primary .days .marked.on-selected p{color:#fff}:host .primary .days .on-selected,:host .primary .startSelection button.days-btn,:host .primary .endSelection button.days-btn{background-color:var(--ion-color-primary);color:#fff}:host .primary .startSelection{position:relative}:host .primary .startSelection:before,:host .primary .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .primary .startSelection:before{background-color:var(--ion-color-primary)}:host .primary .startSelection:after{background-color:#fff;opacity:.25}:host .primary .endSelection{position:relative}:host .primary .endSelection:before,:host .primary .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .primary .endSelection:before{background-color:var(--ion-color-primary)}:host .primary .endSelection:after{background-color:#fff;opacity:.25}:host .primary .startSelection.endSelection:after{background-color:transparent}:host .primary .startSelection button.days-btn{border-radius:50%}:host .primary .between button.days-btn{background-color:var(--ion-color-primary);width:100%;border-radius:0;position:relative}:host .primary .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .primary .between button.days-btn p{color:#fff}:host .primary .endSelection button.days-btn{border-radius:50%}:host .primary .endSelection button.days-btn p{color:#fff}:host .primary .days .on-selected p{color:#fff}:host .primary .startSelection button.days-btn,:host .primary .endSelection button.days-btn,:host .primary .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .primary .startSelection.endSelection:before{--ion-color-primary: transparent}:host .secondary button.days-btn small,:host .secondary .days .marked p,:host .secondary .days .today p{color:var(--ion-color-secondary)}:host .secondary .days .today p{font-weight:700}:host .secondary .days .last-month-day p,:host .secondary .days .next-month-day p{color:#00000040}:host .secondary .days .today.on-selected p,:host .secondary .days .marked.on-selected p{color:#fff}:host .secondary .days .on-selected,:host .secondary .startSelection button.days-btn,:host .secondary .endSelection button.days-btn{background-color:var(--ion-color-secondary);color:#fff}:host .secondary .startSelection{position:relative}:host .secondary .startSelection:before,:host .secondary .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .secondary .startSelection:before{background-color:var(--ion-color-secondary)}:host .secondary .startSelection:after{background-color:#fff;opacity:.25}:host .secondary .endSelection{position:relative}:host .secondary .endSelection:before,:host .secondary .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .secondary .endSelection:before{background-color:var(--ion-color-secondary)}:host .secondary .endSelection:after{background-color:#fff;opacity:.25}:host .secondary .startSelection.endSelection:after{background-color:transparent}:host .secondary .startSelection button.days-btn{border-radius:50%}:host .secondary .between button.days-btn{background-color:var(--ion-color-secondary);width:100%;border-radius:0;position:relative}:host .secondary .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .secondary .between button.days-btn p{color:#fff}:host .secondary .endSelection button.days-btn{border-radius:50%}:host .secondary .endSelection button.days-btn p{color:#fff}:host .secondary .days .on-selected p{color:#fff}:host .secondary .startSelection button.days-btn,:host .secondary .endSelection button.days-btn,:host .secondary .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .secondary .startSelection.endSelection:before{--ion-color-primary: transparent}:host .danger button.days-btn small,:host .danger .days .marked p,:host .danger .days .today p{color:var(--ion-color-danger)}:host .danger .days .today p{font-weight:700}:host .danger .days .last-month-day p,:host .danger .days .next-month-day p{color:#00000040}:host .danger .days .today.on-selected p,:host .danger .days .marked.on-selected p{color:#fff}:host .danger .days .on-selected,:host .danger .startSelection button.days-btn,:host .danger .endSelection button.days-btn{background-color:var(--ion-color-danger);color:#fff}:host .danger .startSelection{position:relative}:host .danger .startSelection:before,:host .danger .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .danger .startSelection:before{background-color:var(--ion-color-danger)}:host .danger .startSelection:after{background-color:#fff;opacity:.25}:host .danger .endSelection{position:relative}:host .danger .endSelection:before,:host .danger .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .danger .endSelection:before{background-color:var(--ion-color-danger)}:host .danger .endSelection:after{background-color:#fff;opacity:.25}:host .danger .startSelection.endSelection:after{background-color:transparent}:host .danger .startSelection button.days-btn{border-radius:50%}:host .danger .between button.days-btn{background-color:var(--ion-color-danger);width:100%;border-radius:0;position:relative}:host .danger .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .danger .between button.days-btn p{color:#fff}:host .danger .endSelection button.days-btn{border-radius:50%}:host .danger .endSelection button.days-btn p{color:#fff}:host .danger .days .on-selected p{color:#fff}:host .danger .startSelection button.days-btn,:host .danger .endSelection button.days-btn,:host .danger .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .danger .startSelection.endSelection:before{--ion-color-primary: transparent}:host .dark button.days-btn small,:host .dark .days .marked p,:host .dark .days .today p{color:var(--ion-color-dark)}:host .dark .days .today p{font-weight:700}:host .dark .days .last-month-day p,:host .dark .days .next-month-day p{color:#00000040}:host .dark .days .today.on-selected p,:host .dark .days .marked.on-selected p{color:#fff}:host .dark .days .on-selected,:host .dark .startSelection button.days-btn,:host .dark .endSelection button.days-btn{background-color:var(--ion-color-dark);color:#fff}:host .dark .startSelection{position:relative}:host .dark .startSelection:before,:host .dark .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .dark .startSelection:before{background-color:var(--ion-color-dark)}:host .dark .startSelection:after{background-color:#fff;opacity:.25}:host .dark .endSelection{position:relative}:host .dark .endSelection:before,:host .dark .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .dark .endSelection:before{background-color:var(--ion-color-dark)}:host .dark .endSelection:after{background-color:#fff;opacity:.25}:host .dark .startSelection.endSelection:after{background-color:transparent}:host .dark .startSelection button.days-btn{border-radius:50%}:host .dark .between button.days-btn{background-color:var(--ion-color-dark);width:100%;border-radius:0;position:relative}:host .dark .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .dark .between button.days-btn p{color:#fff}:host .dark .endSelection button.days-btn{border-radius:50%}:host .dark .endSelection button.days-btn p{color:#fff}:host .dark .days .on-selected p{color:#fff}:host .dark .startSelection button.days-btn,:host .dark .endSelection button.days-btn,:host .dark .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .dark .startSelection.endSelection:before{--ion-color-primary: transparent}:host .light button.days-btn small,:host .light .days .marked p,:host .light .days .today p{color:var(--ion-color-light)}:host .light .days .today p{font-weight:700}:host .light .days .last-month-day p,:host .light .days .next-month-day p{color:#00000040}:host .light .days .today.on-selected p,:host .light .days .marked.on-selected p{color:#a0a0a0}:host .light .days .on-selected,:host .light .startSelection button.days-btn,:host .light .endSelection button.days-btn{background-color:var(--ion-color-light);color:#a0a0a0}:host .light .startSelection{position:relative}:host .light .startSelection:before,:host .light .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .light .startSelection:before{background-color:var(--ion-color-light)}:host .light .startSelection:after{background-color:#fff;opacity:.25}:host .light .endSelection{position:relative}:host .light .endSelection:before,:host .light .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .light .endSelection:before{background-color:var(--ion-color-light)}:host .light .endSelection:after{background-color:#fff;opacity:.25}:host .light .startSelection.endSelection:after{background-color:transparent}:host .light .startSelection button.days-btn{border-radius:50%}:host .light .between button.days-btn{background-color:var(--ion-color-light);width:100%;border-radius:0;position:relative}:host .light .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .light .between button.days-btn p{color:#a0a0a0}:host .light .endSelection button.days-btn{border-radius:50%}:host .light .endSelection button.days-btn p{color:#a0a0a0}:host .light .days .on-selected p{color:#a0a0a0}:host .light .startSelection button.days-btn,:host .light .endSelection button.days-btn,:host .light .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .light .startSelection.endSelection:before{--ion-color-primary: transparent}:host .light .days .today p{color:#565656}:host button.days-btn{border-radius:36px;width:36px;display:block;margin:0 auto;padding:0;height:36px;background-color:transparent;position:relative;z-index:2;outline:0}:host button.days-btn p{margin:0;font-size:1.2em;color:#333;text-align:center}:host button.days-btn[disabled] p{color:#00000040}:host button.days-btn small{overflow:hidden;display:block;left:0;right:0;bottom:-5px;position:absolute;z-index:1;text-align:center;font-weight:200}:host .days.startSelection:nth-child(7n):before,:host .days.between:nth-child(7n) button.days-btn,:host .days.between button.days-btn.is-last{border-radius:0 36px 36px 0}:host .days.startSelection:nth-child(7n):before.on-selected,:host .days.between:nth-child(7n) button.days-btn.on-selected,:host .days.between button.days-btn.is-last.on-selected{border-radius:50%}:host .days.endSelection:nth-child(7n+1):before,:host .days.between:nth-child(7n+1) button.days-btn,:host .days.between.is-first-wrap button.days-btn.is-first,:host button.days-btn.is-first{border-radius:36px 0 0 36px}:host .startSelection button.days-btn.is-first,:host .endSelection button.days-btn.is-first,:host button.days-btn.is-first.on-selected,:host button.days-btn.is-last.on-selected,:host .startSelection button.days-btn.is-last,:host .endSelection button.days-btn.is-last{border-radius:50%}:host .startSelection.is-last-wrap:before,:host .startSelection.is-last-wrap:after{border-radius:0 36px 36px 0}:host .endSelection.is-first-wrap:before,:host .endSelection.is-first-wrap:after{border-radius:36px 0 0 36px}:host.component-mode .days.between button.days-btn.is-last,:host.component-mode .days.between button.days-btn.is-first{border-radius:0}:host.component-mode .days.startSelection.is-last-wrap:before,:host.component-mode .days.startSelection.is-last-wrap:after{border-radius:0}:host.component-mode .days.endSelection.is-first-wrap:before,:host.component-mode .days.endSelection.is-first-wrap:after{border-radius:0}:host .cal-color .days .today p{font-weight:700}:host .cal-color .days .last-month-day p,:host .cal-color .days .next-month-day p{color:#00000040}:host .cal-color .days .today.on-selected p,:host .cal-color .days .marked.on-selected p{color:#fff}:host .cal-color .days .on-selected,:host .cal-color .startSelection button.days-btn,:host .cal-color .endSelection button.days-btn{color:#fff}:host .cal-color .startSelection{position:relative}:host .cal-color .startSelection:before,:host .cal-color .startSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;right:0;display:block}:host .cal-color .startSelection:after{background-color:#fff;opacity:.25}:host .cal-color .endSelection{position:relative}:host .cal-color .endSelection:before,:host .cal-color .endSelection:after{height:36px;width:50%;content:\"\";position:absolute;top:0;left:0;display:block}:host .cal-color .endSelection:after{background-color:#fff;opacity:.25}:host .cal-color .startSelection.endSelection:after{background-color:transparent}:host .cal-color .startSelection button.days-btn{border-radius:50%}:host .cal-color .between button.days-btn{width:100%;border-radius:0;position:relative}:host .cal-color .between button.days-btn:after{height:36px;width:100%;content:\"\";position:absolute;top:0;left:0;right:0;display:block;background-color:#fff;opacity:.25}:host .cal-color .between button.days-btn p{color:#fff}:host .cal-color .endSelection button.days-btn{border-radius:50%}:host .cal-color .endSelection button.days-btn p{color:#fff}:host .cal-color .days .on-selected p{color:#fff}:host .cal-color .startSelection button.days-btn,:host .cal-color .endSelection button.days-btn,:host .cal-color .between button.days-btn{-webkit-transition-property:background-color;-moz-transition-property:background-color;-ms-transition-property:background-color;-o-transition-property:background-color;transition-property:background-color;-webkit-transition-duration:.18s;-moz-transition-duration:.18s;-ms-transition-duration:.18s;-o-transition-duration:.18s;transition-duration:.18s;-webkit-transition-timing-function:ease-out;-moz-transition-timing-function:ease-out;-ms-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}:host .cal-color .startSelection.endSelection:before{--ion-color-primary: transparent}\n"] }]
        }] });

const NUM_OF_MONTHS_TO_CREATE = 3;
class CalendarModalComponent {
    constructor(_renderer, _elementRef, modalCtrl, ref, calSvc) {
        this._renderer = _renderer;
        this._elementRef = _elementRef;
        this.modalCtrl = modalCtrl;
        this.ref = ref;
        this.calSvc = calSvc;
        this.options = input({});
        this.content = viewChild(IonContent);
        this.monthsEle = viewChild('months');
        this.ionPage = true;
        this.datesTemp = [null, null];
        this._scrollLock = true;
        addIcons({
            close,
            refresh,
            checkmark,
        });
    }
    ngOnInit() {
        this.init();
        this.initDefaultDate(true);
    }
    ngAfterViewInit() {
        this.findCssClass();
        if (this._d.canBackwardsSelected)
            this.backwardsMonth();
        this.scrollToDefaultDate();
    }
    init() {
        this._d = this.calSvc.safeOpt(this.options());
        this._d.showAdjacentMonthDay = false;
        this.step = this._d.step;
        if (this.step < this.calSvc.DEFAULT_STEP) {
            this.step = this.calSvc.DEFAULT_STEP;
        }
        this.calendarMonths = this.calSvc.createMonthsByPeriod(new Date(this._d.defaultScrollTo || this._d.from).valueOf(), this.step, this._d);
    }
    initDefaultDate(init = false) {
        const { pickMode, initialDate, initialDates, initialDateRange, defaultDate, defaultDateRange, defaultDates, } = this._d;
        const date = init ? initialDate : defaultDate;
        const dateRange = init ? initialDateRange : defaultDateRange;
        const dates = init ? initialDates : defaultDates;
        switch (pickMode) {
            case 'single':
                if (date) {
                    this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(date), this._d);
                }
                break;
            case 'range':
                if (dateRange) {
                    if (dateRange.from) {
                        this.datesTemp[0] = this.calSvc.createCalendarDay(this._getDayTime(dateRange.from), this._d);
                    }
                    if (dateRange.to) {
                        this.datesTemp[1] = this.calSvc.createCalendarDay(this._getDayTime(dateRange.to), this._d);
                    }
                }
                break;
            case 'multi':
                if (dates && dates.length) {
                    this.datesTemp = dates.map((e) => this.calSvc.createCalendarDay(this._getDayTime(e), this._d));
                }
                break;
            default:
                this.datesTemp = [null, null];
        }
    }
    findCssClass() {
        const { cssClass } = this._d;
        if (cssClass) {
            cssClass.split(' ').forEach((_class) => {
                if (_class.trim() !== '')
                    this._renderer.addClass(this._elementRef.nativeElement, _class);
            });
        }
    }
    onChange(data) {
        const { pickMode, autoDone } = this._d;
        this.datesTemp = data;
        this.ref.detectChanges();
        if (pickMode !== 'multi' && autoDone && this.canDone()) {
            this.done();
        }
        this.repaintDOM();
    }
    onCancel() {
        this.modalCtrl.dismiss(null, 'cancel');
    }
    done() {
        const { pickMode } = this._d;
        this.modalCtrl.dismiss(this.calSvc.wrapResult(this.datesTemp, pickMode), 'done');
    }
    canDone() {
        if (!Array.isArray(this.datesTemp)) {
            return false;
        }
        const { pickMode, defaultEndDateToStartDate } = this._d;
        switch (pickMode) {
            case 'single':
                return !!(this.datesTemp[0] && this.datesTemp[0].time);
            case 'range':
                if (defaultEndDateToStartDate) {
                    return !!(this.datesTemp[0] && this.datesTemp[0].time);
                }
                return (!!(this.datesTemp[0] && this.datesTemp[1]) &&
                    !!(this.datesTemp[0].time && this.datesTemp[1].time));
            case 'multi':
                return (this.datesTemp.length > 0 &&
                    this.datesTemp.every((e) => !!e && !!e.time));
            default:
                return false;
        }
    }
    clear() {
        if (this._d.clearResetsToDefault) {
            this.initDefaultDate();
        }
        else {
            this.datesTemp = [null, null];
        }
        this.ref.detectChanges();
    }
    canClear() {
        return !!this.datesTemp[0];
    }
    nextMonth(event) {
        const len = this.calendarMonths.length;
        const final = this.calendarMonths[len - 1];
        const nextTime = addMonths(final.original.time, 1).valueOf();
        const rangeEnd = this._d.to ? subMonths(this._d.to, 1) : 0;
        if (len <= 0 ||
            (rangeEnd !== 0 && isAfter(final.original.time, rangeEnd))) {
            event.target.disabled = true;
            return;
        }
        this.calendarMonths.push(...this.calSvc.createMonthsByPeriod(nextTime, NUM_OF_MONTHS_TO_CREATE, this._d));
        event.target.complete();
        this.repaintDOM();
    }
    backwardsMonth() {
        const first = this.calendarMonths[0];
        if (first.original.time <= 0) {
            this._d.canBackwardsSelected = false;
            return;
        }
        const firstTime = (this.actualFirstTime = subMonths(first.original.time, NUM_OF_MONTHS_TO_CREATE).valueOf());
        this.calendarMonths.unshift(...this.calSvc.createMonthsByPeriod(firstTime, NUM_OF_MONTHS_TO_CREATE, this._d));
        this.ref.detectChanges();
        this.repaintDOM();
    }
    scrollToDate(date) {
        const defaultDateIndex = this.findInitMonthNumber(date);
        const monthElement = this.monthsEle().nativeElement.children[`month-${defaultDateIndex}`];
        const domElemReadyWaitTime = 300;
        setTimeout(() => {
            const defaultDateMonth = monthElement ? monthElement.offsetTop : 0;
            if (defaultDateIndex !== -1 && defaultDateMonth !== 0) {
                this.content().scrollByPoint(0, defaultDateMonth, 128);
            }
        }, domElemReadyWaitTime);
    }
    scrollToDefaultDate() {
        this.scrollToDate(this._d.defaultScrollTo);
    }
    onScroll($event) {
        if (!this._d.canBackwardsSelected)
            return;
        const { detail } = $event;
        if (detail.scrollTop <= 200 && detail.velocityY < 0 && this._scrollLock) {
            this.content()
                .getScrollElement()
                .then(() => {
                this._scrollLock = !1;
                // const heightBeforeMonthPrepend = scrollElem.scrollHeight;
                this.backwardsMonth();
                setTimeout(() => {
                    //  const heightAfterMonthPrepend = scrollElem.scrollHeight;
                    // this.content.scrollByPoint(0, heightAfterMonthPrepend - heightBeforeMonthPrepend, 0).then(() => {
                    this._scrollLock = !0;
                    // });
                }, 180);
            });
        }
    }
    /**
     * In some older Safari versions (observed at Mac's Safari 10.0), there is an issue where style updates to
     * shadowRoot descendants don't cause a browser repaint.
     * See for more details: https://github.com/Polymer/polymer/issues/4701
     */
    async repaintDOM() {
        const scrollElem = await this.content().getScrollElement();
        // Update scrollElem to ensure that height of the container changes as Months are appended/prepended
        scrollElem.style.zIndex = '2';
        scrollElem.style.zIndex = 'initial';
        // Update monthsEle to ensure selected state is reflected when tapping on a day
        const monthsEle = this.monthsEle();
        monthsEle.nativeElement.style.zIndex = '2';
        monthsEle.nativeElement.style.zIndex = 'initial';
    }
    findInitMonthNumber(date) {
        let startDate = this.actualFirstTime
            ? new Date(this.actualFirstTime)
            : new Date(this._d.from);
        const defaultScrollTo = new Date(date);
        const after = isAfter(defaultScrollTo, startDate);
        if (!after)
            return -1;
        if (this.showYearPicker) {
            startDate = new Date(this.year, 0, 1);
        }
        return differenceInMonths(defaultScrollTo, startDate);
    }
    _getDayTime(date) {
        return startOfDay(new Date(date)).valueOf();
    }
    _monthFormat(date) {
        return format(new Date(date), this._d.monthFormat);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: CalendarModalComponent, deps: [{ token: i0.Renderer2 }, { token: i0.ElementRef }, { token: i1.ModalController }, { token: i0.ChangeDetectorRef }, { token: IonRangeCalendarService }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.11", type: CalendarModalComponent, isStandalone: true, selector: "ion-range-calendar-modal", inputs: { options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.ion-page": "this.ionPage" } }, providers: [IonRangeCalendarService], viewQueries: [{ propertyName: "content", first: true, predicate: IonContent, descendants: true, isSignal: true }, { propertyName: "monthsEle", first: true, predicate: ["months"], descendants: true, isSignal: true }], ngImport: i0, template: "<ion-header>\n  <ion-toolbar [color]=\"_d.color\">\n    <ion-buttons slot=\"start\">\n      <ion-button\n        type=\"button\"\n        slot=\"icon-only\"\n        fill=\"clear\"\n        (click)=\"onCancel()\"\n        [title]=\"_d.closeTitle || _d.closeLabel\"\n      >\n        @if (_d.closeLabel) {\n          <ion-label>{{ _d.closeLabel }}</ion-label>\n        }\n        @if (_d.closeIcon) {\n          <ion-icon\n            [slot]=\"_d.closeLabel ? 'start' : 'icon-only'\"\n            name=\"close\"\n          ></ion-icon>\n        }\n      </ion-button>\n    </ion-buttons>\n\n    <ion-title>{{ _d.title }}</ion-title>\n\n    <ion-buttons slot=\"end\">\n      @if (!!_d.clearLabel || !!_d.clearIcon) {\n        <ion-button\n          type=\"button\"\n          slot=\"icon-only\"\n          fill=\"clear\"\n          [disabled]=\"!canClear()\"\n          (click)=\"clear()\"\n          [title]=\"_d.clearTitle || _d.clearLabel\"\n        >\n          @if (_d.clearLabel) {\n            <ion-label>{{ _d.clearLabel }}</ion-label>\n          }\n          @if (_d.clearIcon) {\n            <ion-icon\n              [slot]=\"_d.clearLabel ? 'end' : 'icon-only'\"\n              name=\"refresh\"\n            ></ion-icon>\n          }\n        </ion-button>\n      }\n      @if (!_d.autoDone) {\n        <ion-button\n          type=\"button\"\n          slot=\"icon-only\"\n          fill=\"clear\"\n          [disabled]=\"!canDone()\"\n          (click)=\"done()\"\n          [title]=\"_d.doneTitle || _d.doneLabel\"\n        >\n          @if (_d.doneLabel) {\n            <ion-label>{{ _d.doneLabel }}</ion-label>\n          }\n          @if (_d.doneIcon) {\n            <ion-icon\n              [slot]=\"_d.doneLabel ? 'end' : 'icon-only'\"\n              name=\"checkmark\"\n            ></ion-icon>\n          }\n        </ion-button>\n      }\n    </ion-buttons>\n  </ion-toolbar>\n\n  <ng-content select=\"[sub-header]\"></ng-content>\n\n  <ion-range-calendar-week\n    [color]=\"_d.color\"\n    [weekArray]=\"_d.weekdays\"\n    [weekStart]=\"_d.weekStart\"\n  >\n  </ion-range-calendar-week>\n</ion-header>\n\n<ion-content\n  (ionScroll)=\"onScroll($event)\"\n  class=\"calendar-page\"\n  [scrollEvents]=\"true\"\n  [ngClass]=\"{ 'multi-selection': _d.pickMode === 'multi' }\"\n>\n  <div #months>\n    @for (month of calendarMonths; track month.original.time; let i = $index) {\n      <div class=\"month-box\" [attr.id]=\"'month-' + i\">\n        <h4 class=\"text-center month-title\">\n          {{ _monthFormat(month.original.date) }}\n        </h4>\n        <ion-range-calendar-month\n          [month]=\"month\"\n          [pickMode]=\"_d.pickMode\"\n          [color]=\"_d.color\"\n          (ionChange)=\"onChange($event)\"\n          [(ngModel)]=\"datesTemp\"\n        >\n        </ion-range-calendar-month>\n      </div>\n    }\n  </div>\n\n  <ion-infinite-scroll threshold=\"25%\" (ionInfinite)=\"nextMonth($event)\">\n    <ion-infinite-scroll-content></ion-infinite-scroll-content>\n  </ion-infinite-scroll>\n</ion-content>\n", styles: [":host ion-select{max-width:unset}:host ion-select .select-icon>.select-icon-inner,:host ion-select .select-text{color:#fff!important}:host ion-select.select-ios{max-width:unset}:host .calendar-page{background-color:#fbfbfb}:host .month-box{display:inline-block;width:100%;padding-bottom:1em;border-bottom:1px solid #f1f1f1}:host h4{font-weight:400;font-size:1.1rem;display:block;text-align:center;margin:1rem 0 0;color:#929292}\n"], dependencies: [{ kind: "component", type: CalendarWeekComponent, selector: "ion-range-calendar-week", inputs: ["color", "weekArray", "weekStart"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "component", type: MonthComponent, selector: "ion-range-calendar-month", inputs: ["componentMode", "month", "pickMode", "readonly", "color"], outputs: ["ionChange", "select", "selectStart", "selectEnd"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: IonHeader, selector: "ion-header", inputs: ["collapse", "mode", "translucent"] }, { kind: "component", type: IonToolbar, selector: "ion-toolbar", inputs: ["color", "mode"] }, { kind: "component", type: IonButtons, selector: "ion-buttons", inputs: ["collapse"] }, { kind: "component", type: IonButton, selector: "ion-button", inputs: ["buttonType", "color", "disabled", "download", "expand", "fill", "form", "href", "mode", "rel", "routerAnimation", "routerDirection", "shape", "size", "strong", "target", "type"] }, { kind: "component", type: IonLabel, selector: "ion-label", inputs: ["color", "mode", "position"] }, { kind: "component", type: IonIcon, selector: "ion-icon", inputs: ["color", "flipRtl", "icon", "ios", "lazy", "md", "mode", "name", "sanitize", "size", "src"] }, { kind: "component", type: IonTitle, selector: "ion-title", inputs: ["color", "size"] }, { kind: "component", type: IonContent, selector: "ion-content", inputs: ["color", "fixedSlotPlacement", "forceOverscroll", "fullscreen", "scrollEvents", "scrollX", "scrollY"] }, { kind: "component", type: IonInfiniteScroll, selector: "ion-infinite-scroll", inputs: ["disabled", "position", "threshold"] }, { kind: "component", type: IonInfiniteScrollContent, selector: "ion-infinite-scroll-content", inputs: ["loadingSpinner", "loadingText"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: CalendarModalComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ion-range-calendar-modal', imports: [
                        CalendarWeekComponent,
                        NgClass,
                        MonthComponent,
                        FormsModule,
                        IonHeader,
                        IonToolbar,
                        IonButtons,
                        IonButton,
                        IonLabel,
                        IonIcon,
                        IonTitle,
                        IonContent,
                        IonInfiniteScroll,
                        IonInfiniteScrollContent,
                    ], providers: [IonRangeCalendarService], template: "<ion-header>\n  <ion-toolbar [color]=\"_d.color\">\n    <ion-buttons slot=\"start\">\n      <ion-button\n        type=\"button\"\n        slot=\"icon-only\"\n        fill=\"clear\"\n        (click)=\"onCancel()\"\n        [title]=\"_d.closeTitle || _d.closeLabel\"\n      >\n        @if (_d.closeLabel) {\n          <ion-label>{{ _d.closeLabel }}</ion-label>\n        }\n        @if (_d.closeIcon) {\n          <ion-icon\n            [slot]=\"_d.closeLabel ? 'start' : 'icon-only'\"\n            name=\"close\"\n          ></ion-icon>\n        }\n      </ion-button>\n    </ion-buttons>\n\n    <ion-title>{{ _d.title }}</ion-title>\n\n    <ion-buttons slot=\"end\">\n      @if (!!_d.clearLabel || !!_d.clearIcon) {\n        <ion-button\n          type=\"button\"\n          slot=\"icon-only\"\n          fill=\"clear\"\n          [disabled]=\"!canClear()\"\n          (click)=\"clear()\"\n          [title]=\"_d.clearTitle || _d.clearLabel\"\n        >\n          @if (_d.clearLabel) {\n            <ion-label>{{ _d.clearLabel }}</ion-label>\n          }\n          @if (_d.clearIcon) {\n            <ion-icon\n              [slot]=\"_d.clearLabel ? 'end' : 'icon-only'\"\n              name=\"refresh\"\n            ></ion-icon>\n          }\n        </ion-button>\n      }\n      @if (!_d.autoDone) {\n        <ion-button\n          type=\"button\"\n          slot=\"icon-only\"\n          fill=\"clear\"\n          [disabled]=\"!canDone()\"\n          (click)=\"done()\"\n          [title]=\"_d.doneTitle || _d.doneLabel\"\n        >\n          @if (_d.doneLabel) {\n            <ion-label>{{ _d.doneLabel }}</ion-label>\n          }\n          @if (_d.doneIcon) {\n            <ion-icon\n              [slot]=\"_d.doneLabel ? 'end' : 'icon-only'\"\n              name=\"checkmark\"\n            ></ion-icon>\n          }\n        </ion-button>\n      }\n    </ion-buttons>\n  </ion-toolbar>\n\n  <ng-content select=\"[sub-header]\"></ng-content>\n\n  <ion-range-calendar-week\n    [color]=\"_d.color\"\n    [weekArray]=\"_d.weekdays\"\n    [weekStart]=\"_d.weekStart\"\n  >\n  </ion-range-calendar-week>\n</ion-header>\n\n<ion-content\n  (ionScroll)=\"onScroll($event)\"\n  class=\"calendar-page\"\n  [scrollEvents]=\"true\"\n  [ngClass]=\"{ 'multi-selection': _d.pickMode === 'multi' }\"\n>\n  <div #months>\n    @for (month of calendarMonths; track month.original.time; let i = $index) {\n      <div class=\"month-box\" [attr.id]=\"'month-' + i\">\n        <h4 class=\"text-center month-title\">\n          {{ _monthFormat(month.original.date) }}\n        </h4>\n        <ion-range-calendar-month\n          [month]=\"month\"\n          [pickMode]=\"_d.pickMode\"\n          [color]=\"_d.color\"\n          (ionChange)=\"onChange($event)\"\n          [(ngModel)]=\"datesTemp\"\n        >\n        </ion-range-calendar-month>\n      </div>\n    }\n  </div>\n\n  <ion-infinite-scroll threshold=\"25%\" (ionInfinite)=\"nextMonth($event)\">\n    <ion-infinite-scroll-content></ion-infinite-scroll-content>\n  </ion-infinite-scroll>\n</ion-content>\n", styles: [":host ion-select{max-width:unset}:host ion-select .select-icon>.select-icon-inner,:host ion-select .select-text{color:#fff!important}:host ion-select.select-ios{max-width:unset}:host .calendar-page{background-color:#fbfbfb}:host .month-box{display:inline-block;width:100%;padding-bottom:1em;border-bottom:1px solid #f1f1f1}:host h4{font-weight:400;font-size:1.1rem;display:block;text-align:center;margin:1rem 0 0;color:#929292}\n"] }]
        }], ctorParameters: () => [{ type: i0.Renderer2 }, { type: i0.ElementRef }, { type: i1.ModalController }, { type: i0.ChangeDetectorRef }, { type: IonRangeCalendarService }], propDecorators: { ionPage: [{
                type: HostBinding,
                args: ['class.ion-page']
            }] } });

class MonthPickerComponent {
    constructor() {
        this.month = input(undefined);
        this.color = input(defaults.COLOR);
        this.monthFormat = input(defaults.MONTH_FORMAT, {
            transform: this.setMonthFormat,
        });
        this.select = output();
        this._thisMonth = new Date();
        this.MONTH_FORMAT = 'MMMM';
    }
    _onSelect(month) {
        this.select.emit(month);
    }
    getDate(month) {
        return new Date(this._thisMonth.getFullYear(), month, 1);
    }
    setMonthFormat(value) {
        if (value && value.length === 12) {
            return [...value];
        }
        return defaults.MONTH_FORMAT;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: MonthPickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.11", type: MonthPickerComponent, isStandalone: true, selector: "ion-range-calendar-month-picker", inputs: { month: { classPropertyName: "month", publicName: "month", isSignal: true, isRequired: false, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, monthFormat: { classPropertyName: "monthFormat", publicName: "monthFormat", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { select: "select" }, ngImport: i0, template: "<div [class]=\"'month-picker ' + color()\">\n  @for (item of monthFormat(); track i; let i = $index) {\n    <div\n      class=\"month-packer-item\"\n      [class.this-month]=\"\n        i === _thisMonth.getMonth() &&\n        month().original.year === _thisMonth.getFullYear()\n      \"\n    >\n      <button type=\"button\" (click)=\"_onSelect(i)\">{{ item }}</button>\n    </div>\n  }\n</div>\n", styles: [":host .month-picker{margin:20px 0;display:inline-block;width:100%}:host .month-packer-item{width:25%;box-sizing:border-box;float:left;height:50px;padding:5px}:host .month-packer-item button{border-radius:32px;width:100%;height:100%;font-size:.9em;background-color:transparent}:host .month-picker.primary .month-packer-item.this-month button{border:1px solid var(--ion-color-primary)}:host .month-picker.primary .month-packer-item.active button{background-color:var(--ion-color-primary);color:#fff}:host .month-picker.secondary .month-packer-item.this-month button{border:1px solid var(--ion-color-secondary)}:host .month-picker.secondary .month-packer-item.active button{background-color:var(--ion-color-secondary);color:#fff}:host .month-picker.danger .month-packer-item.this-month button{border:1px solid var(--ion-color-danger)}:host .month-picker.danger .month-packer-item.active button{background-color:var(--ion-color-danger);color:#fff}:host .month-picker.dark .month-packer-item.this-month button{border:1px solid var(--ion-color-dark)}:host .month-picker.dark .month-packer-item.active button{background-color:var(--ion-color-dark);color:#fff}:host .month-picker.light .month-packer-item.this-month button{border:1px solid var(--ion-color-light)}:host .month-picker.light .month-packer-item.active button{background-color:var(--ion-color-light);color:#9e9e9e}:host .month-picker.transparent{background-color:transparent}:host .month-picker.transparent .month-packer-item.this-month button{border:1px solid var(--ion-color-light)}:host .month-picker.transparent .month-packer-item.active button{background-color:var(--ion-color-light);color:#9e9e9e}:host .month-picker.cal-color .month-packer-item.this-month button{border:1px solid}:host .month-picker.cal-color .month-packer-item.active button{color:#fff}\n"] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: MonthPickerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ion-range-calendar-month-picker', template: "<div [class]=\"'month-picker ' + color()\">\n  @for (item of monthFormat(); track i; let i = $index) {\n    <div\n      class=\"month-packer-item\"\n      [class.this-month]=\"\n        i === _thisMonth.getMonth() &&\n        month().original.year === _thisMonth.getFullYear()\n      \"\n    >\n      <button type=\"button\" (click)=\"_onSelect(i)\">{{ item }}</button>\n    </div>\n  }\n</div>\n", styles: [":host .month-picker{margin:20px 0;display:inline-block;width:100%}:host .month-packer-item{width:25%;box-sizing:border-box;float:left;height:50px;padding:5px}:host .month-packer-item button{border-radius:32px;width:100%;height:100%;font-size:.9em;background-color:transparent}:host .month-picker.primary .month-packer-item.this-month button{border:1px solid var(--ion-color-primary)}:host .month-picker.primary .month-packer-item.active button{background-color:var(--ion-color-primary);color:#fff}:host .month-picker.secondary .month-packer-item.this-month button{border:1px solid var(--ion-color-secondary)}:host .month-picker.secondary .month-packer-item.active button{background-color:var(--ion-color-secondary);color:#fff}:host .month-picker.danger .month-packer-item.this-month button{border:1px solid var(--ion-color-danger)}:host .month-picker.danger .month-packer-item.active button{background-color:var(--ion-color-danger);color:#fff}:host .month-picker.dark .month-packer-item.this-month button{border:1px solid var(--ion-color-dark)}:host .month-picker.dark .month-packer-item.active button{background-color:var(--ion-color-dark);color:#fff}:host .month-picker.light .month-packer-item.this-month button{border:1px solid var(--ion-color-light)}:host .month-picker.light .month-packer-item.active button{background-color:var(--ion-color-light);color:#9e9e9e}:host .month-picker.transparent{background-color:transparent}:host .month-picker.transparent .month-packer-item.this-month button{border:1px solid var(--ion-color-light)}:host .month-picker.transparent .month-packer-item.active button{background-color:var(--ion-color-light);color:#9e9e9e}:host .month-picker.cal-color .month-packer-item.this-month button{border:1px solid}:host .month-picker.cal-color .month-packer-item.active button{color:#fff}\n"] }]
        }] });

const ION_CAL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IonRangeCalendarComponent),
    multi: true,
};
class IonRangeCalendarComponent {
    get showToggleButtons() {
        return this._showToggleButtons;
    }
    set showToggleButtons(value) {
        this._showToggleButtons = value;
    }
    get showMonthPicker() {
        return this._showMonthPicker;
    }
    set showMonthPicker(value) {
        this._showMonthPicker = value;
    }
    constructor() {
        this.format = input(defaults.DATE_FORMAT);
        this.type = input('string');
        this.readonly = input(false);
        this.options = input(undefined, { transform: this.setOptions.bind(this) });
        this._view = 'days';
        this._calendarMonthValue = [null, null];
        this._showToggleButtons = true;
        this._showMonthPicker = true;
        this.ionChange = output();
        this.monthChange = output();
        this.select = output();
        this.selectStart = output();
        this.selectEnd = output();
        this.MONTH_DATE_FORMAT = 'MMMM yyyy';
        this.calendarService = inject(IonRangeCalendarService);
        this._compatibleIcons = {
            caretDown: 'caret-down-outline',
            caretUp: 'caret-up-outline',
            chevronBack: 'chevron-back-outline',
            chevronForward: 'chevron-forward-outline',
        };
        addIcons({
            caretDownOutline,
            caretUpOutline,
            chevronBackOutline,
            chevronForwardOutline,
        });
    }
    ngOnInit() {
        this.initOpt();
        this.monthOpt = this.createMonth(new Date().getTime());
    }
    getViewDate() {
        return this._handleType(this.monthOpt.original.time);
    }
    getDate(date) {
        return new Date(date);
    }
    setViewDate(value) {
        this.monthOpt = this.createMonth(this._payloadToTimeNumber(value));
    }
    switchView() {
        this._view = this._view === 'days' ? 'month' : 'days';
    }
    prev() {
        if (this._view === 'days') {
            this.backMonth();
        }
        else {
            this.prevYear();
        }
    }
    next() {
        if (this._view === 'days') {
            this.nextMonth();
        }
        else {
            this.nextYear();
        }
    }
    prevYear() {
        if (new Date(this.monthOpt.original.time).getFullYear() === 1970) {
            return;
        }
        const backTime = subYears(this.monthOpt.original.time, 1).valueOf();
        this.monthOpt = this.createMonth(backTime);
    }
    nextYear() {
        const nextTime = addYears(this.monthOpt.original.time, 1).valueOf();
        this.monthOpt = this.createMonth(nextTime);
    }
    nextMonth() {
        const nextTime = addMonths(this.monthOpt.original.time, 1).valueOf();
        this.monthChange.emit({
            oldMonth: this.calendarService.multiFormat(this.monthOpt.original.time),
            newMonth: this.calendarService.multiFormat(nextTime),
        });
        this.monthOpt = this.createMonth(nextTime);
    }
    canNext() {
        if (!this._d.to || this._view !== 'days') {
            return true;
        }
        return this.monthOpt.original.time < new Date(this._d.to).valueOf();
    }
    backMonth() {
        const backTime = subMonths(this.monthOpt.original.time, 1).valueOf();
        this.monthChange.emit({
            oldMonth: this.calendarService.multiFormat(this.monthOpt.original.time),
            newMonth: this.calendarService.multiFormat(backTime),
        });
        this.monthOpt = this.createMonth(backTime);
    }
    canBack() {
        if (this._d.canBackwardsSelected) {
            return true;
        }
        if (!this._d.from || this._view !== 'days') {
            return true;
        }
        return this.monthOpt.original.time > new Date(this._d.from).valueOf();
    }
    monthOnSelect(month) {
        this._view = 'days';
        const newMonth = new Date(this.monthOpt.original.time)
            .setMonth(month)
            .valueOf();
        this.monthChange.emit({
            oldMonth: this.calendarService.multiFormat(this.monthOpt.original.time),
            newMonth: this.calendarService.multiFormat(newMonth),
        });
        this.monthOpt = this.createMonth(newMonth);
    }
    onChanged($event) {
        switch (this._d.pickMode) {
            case 'single':
                return this.handleSingleChange($event[0]);
            case 'range':
                return this.handleRangeChange($event);
            case 'slots':
                return this.handleSlotsChange($event);
            case 'multi':
                return this.handleMultiChange($event);
        }
    }
    handleSingleChange($event) {
        const date = this._handleType($event.time);
        this._onChanged(date);
        this.ionChange.emit(date);
    }
    handleRangeChange($event) {
        if ($event[0] && $event[1]) {
            const rangeDate = {
                from: this._handleType($event[0].time),
                to: this._handleType($event[1].time),
            };
            this._onChanged(rangeDate);
            this.ionChange.emit(rangeDate);
        }
    }
    handleSlotsChange($event) {
        if ($event[0] && $event[1]) {
            const rangeDate = {
                from: this._handleType($event[0].time),
                to: this._handleType($event[1].time),
            };
            this._onChanged(rangeDate);
            this.ionChange.emit(rangeDate);
        }
    }
    handleMultiChange($event) {
        const dates = [];
        for (const event of $event) {
            if (event && event.time) {
                dates.push(this._handleType(event.time));
            }
        }
        this._onChanged(dates);
        this.ionChange.emit(dates);
    }
    swipeEvent($event) {
        const isNext = $event.deltaX < 0;
        if (isNext && this.canNext()) {
            this.nextMonth();
        }
        else if (!isNext && this.canBack()) {
            this.backMonth();
        }
    }
    _payloadToTimeNumber(value) {
        let date;
        if (typeof value === 'string') {
            date = parse(value, this.format(), new Date());
        }
        else if (typeof value === 'number' || value instanceof Date) {
            date = new Date(value);
        }
        else {
            date = new Date(value.years, value.months - 1, value.date, value.hours, value.minutes, value.seconds, value.milliseconds);
        }
        return date.valueOf();
    }
    _monthFormat(date) {
        return format(date, this._d.monthFormat);
    }
    initOpt() {
        if (this._options && typeof this._options.showToggleButtons === 'boolean') {
            this.showToggleButtons = this._options.showToggleButtons;
        }
        if (this._options && typeof this._options.showMonthPicker === 'boolean') {
            this.showMonthPicker = this._options.showMonthPicker;
            if (this._view !== 'days' && !this.showMonthPicker) {
                this._view = 'days';
            }
        }
        this._d = this.calendarService.safeOpt(this._options || {});
    }
    createMonth(date) {
        return this.calendarService.createMonthsByPeriod(date, 1, this._d)[0];
    }
    _createCalendarDay(value) {
        if (!value)
            return null;
        return this.calendarService.createCalendarDay(this._payloadToTimeNumber(value), this._d);
    }
    _handleType(value) {
        const date = new Date(value);
        switch (this.type()) {
            case 'string':
                return format(date, this.format());
            case 'js-date':
                return date;
            case 'time':
                return date.valueOf();
            case 'object':
                return {
                    years: date.getFullYear(),
                    months: date.getMonth() + 1,
                    date: date.getDate(),
                    hours: date.getHours(),
                    minutes: date.getMinutes(),
                    seconds: date.getSeconds(),
                    milliseconds: date.getMilliseconds(),
                };
            default:
                return date;
        }
    }
    writeValue(obj) {
        this._writeValue(obj);
        if (obj) {
            if (this._calendarMonthValue[0]) {
                this.monthOpt = this.createMonth(this._calendarMonthValue[0].time);
            }
            else {
                this.monthOpt = this.createMonth(new Date().getTime());
            }
        }
    }
    registerOnChange(fn) {
        this._onChanged = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    _writeValue(value) {
        if (!value) {
            this._calendarMonthValue = [null, null];
            return;
        }
        switch (this._d.pickMode) {
            case 'single':
                this._calendarMonthValue[0] = this._createCalendarDay(value);
                break;
            case 'range':
            case 'slots':
                this._calendarMonthValue[0] = this._createCalendarDay(value.from);
                this._calendarMonthValue[1] = this._createCalendarDay(value.to);
                break;
            case 'multi':
                if (Array.isArray(value)) {
                    this._calendarMonthValue = value.map((e) => this._createCalendarDay(e));
                }
                else {
                    this._calendarMonthValue = [null, null];
                }
                break;
            default:
                break;
        }
    }
    setOptions(value) {
        this._options = value;
        this.initOpt();
        if (this.monthOpt && this.monthOpt.original) {
            this.monthOpt = this.createMonth(this.monthOpt.original.time);
        }
        return value;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: IonRangeCalendarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "19.2.11", type: IonRangeCalendarComponent, isStandalone: true, selector: "ion-range-calendar", inputs: { format: { classPropertyName: "format", publicName: "format", isSignal: true, isRequired: false, transformFunction: null }, type: { classPropertyName: "type", publicName: "type", isSignal: true, isRequired: false, transformFunction: null }, readonly: { classPropertyName: "readonly", publicName: "readonly", isSignal: true, isRequired: false, transformFunction: null }, options: { classPropertyName: "options", publicName: "options", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { ionChange: "ionChange", monthChange: "monthChange", select: "select", selectStart: "selectStart", selectEnd: "selectEnd" }, providers: [ION_CAL_VALUE_ACCESSOR, IonRangeCalendarService], ngImport: i0, template: "<div class=\"title\">\n  @if (_showToggleButtons) {\n    <ion-button\n      type=\"button\"\n      fill=\"clear\"\n      class=\"back\"\n      [disabled]=\"!canBack()\"\n      (click)=\"prev()\"\n    >\n      <ion-icon\n        slot=\"icon-only\"\n        size=\"small\"\n        [name]=\"_compatibleIcons.chevronBack\"\n      ></ion-icon>\n    </ion-button>\n  }\n  @if (_showMonthPicker) {\n    <ion-button\n      type=\"button\"\n      fill=\"clear\"\n      class=\"switch-btn\"\n      (click)=\"switchView()\"\n    >\n      {{ _monthFormat(monthOpt.original.time) }}\n      <ion-icon\n        class=\"arrow-dropdown\"\n        [name]=\"\n          _view === 'days'\n            ? _compatibleIcons.caretDown\n            : _compatibleIcons.caretUp\n        \"\n      >\n      </ion-icon>\n    </ion-button>\n  } @else {\n    <div class=\"switch-btn\">\n      {{ _monthFormat(monthOpt.original.time) }}\n    </div>\n  }\n\n  <ng-template #title>\n    <div class=\"switch-btn\">\n      {{ _monthFormat(monthOpt.original.time) }}\n    </div>\n  </ng-template>\n\n  @if (_showToggleButtons) {\n    <ion-button\n      type=\"button\"\n      fill=\"clear\"\n      class=\"forward\"\n      [disabled]=\"!canNext()\"\n      (click)=\"next()\"\n    >\n      <ion-icon\n        slot=\"icon-only\"\n        size=\"small\"\n        [name]=\"_compatibleIcons.chevronForward\"\n      ></ion-icon>\n    </ion-button>\n  }\n</div>\n\n@if (_view === 'days') {\n  <ion-range-calendar-week\n    color=\"transparent\"\n    [weekArray]=\"_d.weekdays\"\n    [weekStart]=\"_d.weekStart\"\n  >\n  </ion-range-calendar-week>\n\n  <ion-range-calendar-month\n    [componentMode]=\"true\"\n    [(ngModel)]=\"_calendarMonthValue\"\n    [month]=\"monthOpt\"\n    [readonly]=\"readonly()\"\n    (ionChange)=\"onChanged($event)\"\n    (swipe)=\"swipeEvent($event)\"\n    (select)=\"select.emit($event)\"\n    (selectStart)=\"selectStart.emit($event)\"\n    (selectEnd)=\"selectEnd.emit($event)\"\n    [pickMode]=\"_d.pickMode\"\n    [color]=\"_d.color\"\n  >\n  </ion-range-calendar-month>\n} @else {\n  <ion-range-calendar-month-picker\n    [color]=\"_d.color\"\n    [monthFormat]=\"_options?.monthPickerFormat\"\n    (select)=\"monthOnSelect($event)\"\n    [month]=\"monthOpt\"\n  >\n  </ion-range-calendar-month-picker>\n}\n", styles: [":host{padding:10px 20px;box-sizing:border-box;display:inline-block;background-color:var(--ion-color-background, #fff);width:100%}:host .title{padding:0 40px;overflow:hidden;position:relative}:host .title .back,:host .title .forward,:host .title .switch-btn{display:block;float:left;min-height:32px;margin:0;padding:0;--padding-start: 0;--padding-end: 0;font-size:15px}:host .title .back,:host .title .forward{position:absolute;color:#757575}:host .title .back{left:0}:host .title .forward{right:0}:host .title .switch-btn{--margin-top: 0;--margin-bottom: 0;--margin-start: auto;--margin-end: auto;width:100%;text-align:center;line-height:32px;color:#757575}:host .title .switch-btn .arrow-dropdown{margin-left:5px}\n"], dependencies: [{ kind: "component", type: CalendarWeekComponent, selector: "ion-range-calendar-week", inputs: ["color", "weekArray", "weekStart"] }, { kind: "component", type: MonthComponent, selector: "ion-range-calendar-month", inputs: ["componentMode", "month", "pickMode", "readonly", "color"], outputs: ["ionChange", "select", "selectStart", "selectEnd"] }, { kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "component", type: MonthPickerComponent, selector: "ion-range-calendar-month-picker", inputs: ["month", "color", "monthFormat"], outputs: ["select"] }, { kind: "component", type: IonButton, selector: "ion-button", inputs: ["buttonType", "color", "disabled", "download", "expand", "fill", "form", "href", "mode", "rel", "routerAnimation", "routerDirection", "shape", "size", "strong", "target", "type"] }, { kind: "component", type: IonIcon, selector: "ion-icon", inputs: ["color", "flipRtl", "icon", "ios", "lazy", "md", "mode", "name", "sanitize", "size", "src"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.11", ngImport: i0, type: IonRangeCalendarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ion-range-calendar', providers: [ION_CAL_VALUE_ACCESSOR, IonRangeCalendarService], imports: [
                        CalendarWeekComponent,
                        MonthComponent,
                        FormsModule,
                        MonthPickerComponent,
                        IonButton,
                        IonIcon,
                    ], template: "<div class=\"title\">\n  @if (_showToggleButtons) {\n    <ion-button\n      type=\"button\"\n      fill=\"clear\"\n      class=\"back\"\n      [disabled]=\"!canBack()\"\n      (click)=\"prev()\"\n    >\n      <ion-icon\n        slot=\"icon-only\"\n        size=\"small\"\n        [name]=\"_compatibleIcons.chevronBack\"\n      ></ion-icon>\n    </ion-button>\n  }\n  @if (_showMonthPicker) {\n    <ion-button\n      type=\"button\"\n      fill=\"clear\"\n      class=\"switch-btn\"\n      (click)=\"switchView()\"\n    >\n      {{ _monthFormat(monthOpt.original.time) }}\n      <ion-icon\n        class=\"arrow-dropdown\"\n        [name]=\"\n          _view === 'days'\n            ? _compatibleIcons.caretDown\n            : _compatibleIcons.caretUp\n        \"\n      >\n      </ion-icon>\n    </ion-button>\n  } @else {\n    <div class=\"switch-btn\">\n      {{ _monthFormat(monthOpt.original.time) }}\n    </div>\n  }\n\n  <ng-template #title>\n    <div class=\"switch-btn\">\n      {{ _monthFormat(monthOpt.original.time) }}\n    </div>\n  </ng-template>\n\n  @if (_showToggleButtons) {\n    <ion-button\n      type=\"button\"\n      fill=\"clear\"\n      class=\"forward\"\n      [disabled]=\"!canNext()\"\n      (click)=\"next()\"\n    >\n      <ion-icon\n        slot=\"icon-only\"\n        size=\"small\"\n        [name]=\"_compatibleIcons.chevronForward\"\n      ></ion-icon>\n    </ion-button>\n  }\n</div>\n\n@if (_view === 'days') {\n  <ion-range-calendar-week\n    color=\"transparent\"\n    [weekArray]=\"_d.weekdays\"\n    [weekStart]=\"_d.weekStart\"\n  >\n  </ion-range-calendar-week>\n\n  <ion-range-calendar-month\n    [componentMode]=\"true\"\n    [(ngModel)]=\"_calendarMonthValue\"\n    [month]=\"monthOpt\"\n    [readonly]=\"readonly()\"\n    (ionChange)=\"onChanged($event)\"\n    (swipe)=\"swipeEvent($event)\"\n    (select)=\"select.emit($event)\"\n    (selectStart)=\"selectStart.emit($event)\"\n    (selectEnd)=\"selectEnd.emit($event)\"\n    [pickMode]=\"_d.pickMode\"\n    [color]=\"_d.color\"\n  >\n  </ion-range-calendar-month>\n} @else {\n  <ion-range-calendar-month-picker\n    [color]=\"_d.color\"\n    [monthFormat]=\"_options?.monthPickerFormat\"\n    (select)=\"monthOnSelect($event)\"\n    [month]=\"monthOpt\"\n  >\n  </ion-range-calendar-month-picker>\n}\n", styles: [":host{padding:10px 20px;box-sizing:border-box;display:inline-block;background-color:var(--ion-color-background, #fff);width:100%}:host .title{padding:0 40px;overflow:hidden;position:relative}:host .title .back,:host .title .forward,:host .title .switch-btn{display:block;float:left;min-height:32px;margin:0;padding:0;--padding-start: 0;--padding-end: 0;font-size:15px}:host .title .back,:host .title .forward{position:absolute;color:#757575}:host .title .back{left:0}:host .title .forward{right:0}:host .title .switch-btn{--margin-top: 0;--margin-bottom: 0;--margin-start: auto;--margin-end: auto;width:100%;text-align:center;line-height:32px;color:#757575}:host .title .switch-btn .arrow-dropdown{margin-left:5px}\n"] }]
        }], ctorParameters: () => [] });

/*
 * Public API Surface of ion-range-calendar
 */

/**
 * Generated bundle index. Do not edit.
 */

export { CalendarModalComponent as CalendarModal, CalendarWeekComponent, IonRangeCalendarComponent, IonRangeCalendarService, MonthComponent, MonthPickerComponent };
//# sourceMappingURL=googlproxer-ion-range-calendar.mjs.map
