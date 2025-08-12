import { AfterViewInit, ChangeDetectorRef, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { IonContentCustomEvent, IonInfiniteScrollCustomEvent, ScrollDetail } from '@ionic/core';
import { CalendarDay, CalendarModalOptions, CalendarMonth, DefaultDate } from '../../calendar.types';
import { IonRangeCalendarService } from '../../services/ion-range-calendar.service';
import * as i0 from "@angular/core";
export declare class CalendarModalComponent implements OnInit, AfterViewInit {
    private _renderer;
    _elementRef: ElementRef;
    modalCtrl: ModalController;
    ref: ChangeDetectorRef;
    calSvc: IonRangeCalendarService;
    readonly options: import("@angular/core").InputSignal<CalendarModalOptions>;
    readonly content: import("@angular/core").Signal<IonContent>;
    readonly monthsEle: import("@angular/core").Signal<ElementRef<any>>;
    ionPage: boolean;
    datesTemp: CalendarDay[];
    calendarMonths: CalendarMonth[];
    step: number;
    showYearPicker: boolean;
    year: number;
    years: number[];
    _scrollLock: boolean;
    _d: CalendarModalOptions;
    actualFirstTime: number;
    constructor(_renderer: Renderer2, _elementRef: ElementRef, modalCtrl: ModalController, ref: ChangeDetectorRef, calSvc: IonRangeCalendarService);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    init(): void;
    initDefaultDate(init?: boolean): void;
    findCssClass(): void;
    onChange(data: CalendarDay[]): void;
    onCancel(): void;
    done(): void;
    canDone(): boolean;
    clear(): void;
    canClear(): boolean;
    nextMonth(event: IonInfiniteScrollCustomEvent<void>): void;
    backwardsMonth(): void;
    scrollToDate(date: Date): void;
    scrollToDefaultDate(): void;
    onScroll($event: IonContentCustomEvent<ScrollDetail>): void;
    /**
     * In some older Safari versions (observed at Mac's Safari 10.0), there is an issue where style updates to
     * shadowRoot descendants don't cause a browser repaint.
     * See for more details: https://github.com/Polymer/polymer/issues/4701
     */
    repaintDOM(): Promise<void>;
    findInitMonthNumber(date: Date): number;
    _getDayTime(date: DefaultDate): number;
    _monthFormat(date: DefaultDate): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalendarModalComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CalendarModalComponent, "ion-range-calendar-modal", never, { "options": { "alias": "options"; "required": false; "isSignal": true; }; }, {}, never, ["[sub-header]"], true, never>;
}
