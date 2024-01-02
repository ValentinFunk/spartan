import { NgModule } from '@angular/core';
import { BrnSelectContentComponent } from './lib/brn-select-content.component';
import { BrnSelectOptionDirective } from './lib/brn-select-option.directive';
import { BrnSelectTriggerDirective } from './lib/brn-select-trigger.directive';
import { BrnSelectValueComponent } from './lib/brn-select-value.component';
import { BrnSelectComponent } from './lib/brn-select.component';

export * from './lib/brn-select-content.component';
export * from './lib/brn-select-option.directive';
export * from './lib/brn-select-trigger.directive';
export * from './lib/brn-select.component';
export * from './lib/brn-select.service';

export const BrnSelectImports = [
	BrnSelectComponent,
	BrnSelectContentComponent,
	BrnSelectTriggerDirective,
	BrnSelectOptionDirective,
	BrnSelectValueComponent,
] as const;

@NgModule({
	imports: [...BrnSelectImports],
	exports: [...BrnSelectImports],
})
export class BrnSelectModule {}
