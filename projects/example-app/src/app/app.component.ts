import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';

import { startOfDay, subDays } from 'date-fns';

import { ionChange } from 'projects/ion-range-calendar/src/lib/components/ion-range-calendar/ion-range-calendar.component';
import { IonRangeCalendarComponent } from '../../../ion-range-calendar/src/lib/components/ion-range-calendar/ion-range-calendar.component';

import {
  CalendarModal,
  CalendarModalOptions,
  PickMode,
  SlotRange,
} from 'projects/ion-range-calendar/src/public-api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    FormsModule,

    IonRangeCalendarComponent,

    IonApp,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
})
export class AppComponent {
  public date? = new Date();
  public dateRange: { from?: Date; to?: Date } = {
    from: new Date(),
    to: new Date(),
  };
  public dates = [new Date(), new Date()];
  public slotsRange: { from?: Date; to?: Date } = {};

  public mode: PickMode = 'slots';

  private from: Date = startOfDay(subDays(new Date(), 6));
  private to: Date = startOfDay(new Date());

  // Define some example slots for testing
  public slots: SlotRange[] = [
    {
      from: startOfDay(new Date(2024, 11, 10)), // Dec 10, 2024
      to: startOfDay(new Date(2024, 11, 12)), // Dec 12, 2024
      title: 'Weekend Slot 1',
      cssClass: 'weekend-slot'
    },
    {
      from: startOfDay(new Date(2024, 11, 15)), // Dec 15, 2024
      to: startOfDay(new Date(2024, 11, 18)), // Dec 18, 2024
      title: 'Midweek Slot',
      cssClass: 'midweek-slot'
    },
    {
      from: startOfDay(new Date(2024, 11, 20)), // Dec 20, 2024
      to: startOfDay(new Date(2024, 11, 26)), // Dec 22, 2024
      title: 'Weekend Slot 2',
      cssClass: 'weekend-slot'
    },
    {
      from: startOfDay(new Date(2024, 11, 25)), // Dec 25, 2024
      to: startOfDay(new Date(2024, 11, 28)), // Dec 28, 2024
      title: 'Holiday Slot',
      cssClass: 'holiday-slot'
    }
  ];

  public options: CalendarModalOptions = {
    pickMode: this.mode,
    title: 'Select Date Range',
    cssClass: 'calendar',
    canBackwardsSelected: true,
    to: new Date(),
    initialDateRange: { to: this.to, from: subDays(this.from, 7) },
    defaultDateRange: { to: this.to, from: this.from },
    doneIcon: true,
    clearIcon: true,
    closeIcon: true,
    defaultScrollTo: this.from,
    maxRange: 28,
    clearResetsToDefault: true,
  };

  private modalCtrl = inject(ModalController);

  constructor() {
    this.dateRange = { from: this.from, to: this.to };
  }

  public get currentOptions(): CalendarModalOptions {
    const baseOptions = { ...this.options };
    baseOptions.pickMode = this.mode;

    if (this.mode === 'slots') {
      baseOptions.slots = this.slots;
      baseOptions.title = 'Select Slot';
      baseOptions.from = new Date(2024, 11, 1); // December 1, 2024
      baseOptions.to = new Date(2024, 11, 31); // December 31, 2024
    }

    return baseOptions;
  }

  public get data() {
    switch (this.mode) {
      case 'range':
        return this.dateRange;
      case 'slots':
        return this.slotsRange;
      case 'multi':
        return this.dates;
      default:
        return this.date;
    }
  }

  public set data(value: ionChange) {
    console.info(this.mode, value);
    switch (this.mode) {
      case 'single':
        this.date = value as Date;
        break;
      case 'range':
        this.dateRange = value as { from: Date; to: Date };
        break;
      case 'slots':
        this.slotsRange = value as { from: Date; to: Date };
        break;
      case 'multi':
        this.dates = value as Date[];
        break;
    }
  }

  public async onClick() {
    const modal = await this.modalCtrl.create({
      component: CalendarModal,
      componentProps: { options: this.currentOptions },
      cssClass: ['calendar-modal'],
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.info(data);
  }

  public onChange(event: ionChange) {
    console.info(event);
  }

  public resetData() {
    switch (this.mode) {
      case 'single':
        this.date = undefined;
        break;
      case 'range':
        this.dateRange = {};
        break;
      case 'slots':
        this.slotsRange = {};
        break;
      case 'multi':
        this.dates = [];
        break;
    }
  }
}
