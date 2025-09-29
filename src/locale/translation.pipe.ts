import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { TranslationService } from './translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription = new Subscription();
  private lastKey = '';
  private lastParams: Record<string, any> | undefined;
  private lastResult = '';

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('[TranslatePipe] Constructor called');
    
    // Subscribe to language changes to trigger pipe updates
    this.subscription.add(
      this.translationService.getCurrentLanguage$().subscribe(() => {
        console.log('[TranslatePipe] Language changed, marking for check');
        this.lastKey = ''; // Reset cache
        this.ngZone.run(() => {
          this.cdr.markForCheck();
        });
      })
    );
    
    // Subscribe to translations loaded to trigger pipe updates
    this.subscription.add(
      this.translationService.getTranslationsLoaded$().subscribe((loaded) => {
        console.log('[TranslatePipe] Translations loaded:', loaded);
        this.lastKey = ''; // Reset cache
        this.ngZone.run(() => {
          this.cdr.markForCheck();
        });
      })
    );
  }

  transform(key: string, params?: Record<string, any>): string {
    console.log(`[TranslatePipe] transform called with key: ${key}, params:`, params);
    
    // Check if we can use cached result
    if (this.lastKey === key && JSON.stringify(this.lastParams) === JSON.stringify(params)) {
      console.log(`[TranslatePipe] Using cached result: ${this.lastResult}`);
      return this.lastResult;
    }
    
    const result = this.translationService.translate(key, params);
    console.log(`[TranslatePipe] returning result: ${result}`);
    
    // Cache the result
    this.lastKey = key;
    this.lastParams = params;
    this.lastResult = result;
    
    return result;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
