import { CalendarDay, CalendarModalOptions, CalendarMonth, CalendarOriginal, CalendarResult, DayConfig, SlotRange } from '../calendar.types';
import * as i0 from "@angular/core";
export declare class IonRangeCalendarService {
    opts: CalendarModalOptions;
    private readonly defaultOpts;
    readonly DEFAULT_STEP = 12;
    safeOpt(calendarOptions?: Partial<CalendarModalOptions>): CalendarModalOptions;
    createOriginalCalendar(time: number): CalendarOriginal;
    findDayConfig(day: Date, opt: CalendarModalOptions): DayConfig | undefined;
    findSlotForDay(day: Date, opt: CalendarModalOptions): SlotRange | undefined;
    isDayInAnySlot(day: Date, opt: CalendarModalOptions): boolean;
    createCalendarDay(time: number, opt: CalendarModalOptions, month?: number): CalendarDay;
    createCalendarMonth(original: CalendarOriginal, opt: CalendarModalOptions): CalendarMonth;
    createMonthsByPeriod(startTime: number, monthsNum: number, opt: CalendarModalOptions): CalendarMonth[];
    wrapResult(original: CalendarDay[], pickMode: string): CalendarDay[] | CalendarResult | CalendarResult[] | {
        from: CalendarResult;
        to: CalendarResult;
    };
    multiFormat(time: number): CalendarResult;
    static ɵfac: i0.ɵɵFactoryDeclaration<IonRangeCalendarService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<IonRangeCalendarService>;
}
