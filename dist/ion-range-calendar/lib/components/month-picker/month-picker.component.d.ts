import { CalendarMonth } from '../../calendar.types';
import * as i0 from "@angular/core";
export declare class MonthPickerComponent {
    readonly month: import("@angular/core").InputSignal<CalendarMonth>;
    readonly color: import("@angular/core").InputSignal<string>;
    readonly monthFormat: import("@angular/core").InputSignalWithTransform<string[], string[]>;
    select: import("@angular/core").OutputEmitterRef<number>;
    _thisMonth: Date;
    MONTH_FORMAT: string;
    _onSelect(month: number): void;
    getDate(month: number): Date;
    private setMonthFormat;
    static ɵfac: i0.ɵɵFactoryDeclaration<MonthPickerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MonthPickerComponent, "ion-range-calendar-month-picker", never, { "month": { "alias": "month"; "required": false; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "monthFormat": { "alias": "monthFormat"; "required": false; "isSignal": true; }; }, { "select": "select"; }, never, never, true, never>;
}
