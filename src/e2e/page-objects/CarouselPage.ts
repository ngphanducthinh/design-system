import type { Page } from '@playwright/test';
import { HelperBase } from '@/e2e/page-objects/HelperBase';

export class CarouselPage extends HelperBase {
  constructor(page: Page) {
    super(page);
  }
}
