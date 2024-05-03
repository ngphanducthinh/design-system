import type { Page } from '@playwright/test';
import { NavigationPage } from '@/e2e/page-objects/NavigationPage';
import { CarouselPage } from '@/e2e/page-objects/CarouselPage';
import { BreadcrumbPage } from '@/e2e/page-objects/BreadcrumbPage';
import { DatePickerPage } from '@/e2e/page-objects/DatePickerPage';

export class PageManager {
  private readonly page: Page;

  private readonly navigationPage;
  private readonly carouselPage: CarouselPage;
  private readonly breadcrumbPage: BreadcrumbPage;
  private readonly datePickerPage: DatePickerPage;

  constructor(page: Page) {
    this.page = page;

    this.navigationPage = new NavigationPage(this.page);
    this.carouselPage = new CarouselPage(this.page);
    this.breadcrumbPage = new BreadcrumbPage(this.page);
    this.datePickerPage = new DatePickerPage(this.page);
  }

  navigateTo() {
    return this.navigationPage;
  }

  onCarouselPage() {
    return this.carouselPage;
  }

  onBreadcrumbPage() {
    return this.breadcrumbPage;
  }

  onDatePickerPage() {
    return this.datePickerPage;
  }
}
