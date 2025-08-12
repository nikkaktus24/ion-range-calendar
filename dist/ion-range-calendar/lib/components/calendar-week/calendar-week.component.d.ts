import * as i0 from "@angular/core";
export declare class CalendarWeekComponent {
    readonly color: import("@angular/core").InputSignal<string>;
    readonly weekArray: import("@angular/core").InputSignalWithTransform<string[], string[]>;
    readonly weekStart: import("@angular/core").InputSignalWithTransform<number, number>;
    readonly displayWeekArray: import("@angular/core").Signal<string[]>;
    private setWeekArray;
    private setWeekStart;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarWeekComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarWeekComponent, "ion-range-calendar-week", never, { "color": { "alias": "color"; "required": false; "isSignal": true; }; "weekArray": { "alias": "weekArray"; "required": false; "isSignal": true; }; "weekStart": { "alias": "weekStart"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
