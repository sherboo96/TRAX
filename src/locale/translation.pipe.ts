import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { TranslationService } from './translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription = new Subscription();

  constructor(private translationService: TranslationService) {}

  transform(key: string, params?: Record<string, any>): string {
    return this.translationService.translate(key, params);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
