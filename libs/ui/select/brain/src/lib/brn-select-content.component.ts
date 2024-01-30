import { CdkListbox, ListboxValueChangeEvent } from '@angular/cdk/listbox';
import { NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ContentChildren,
	ElementRef,
	QueryList,
	ViewChild,
	effect,
	inject,
	signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BrnSelectOptionDirective } from './brn-select-option.directive';
import { BrnSelectScrollDownDirective } from './brn-select-scroll-down.directive';
import { BrnSelectScrollUpDirective } from './brn-select-scroll-up.directive';
import { BrnSelectService } from './brn-select.service';

@Component({
	selector: 'brn-select-content, hlm-select-content:not(noHlm)',
	standalone: true,
	imports: [BrnSelectScrollUpDirective, BrnSelectScrollDownDirective, NgTemplateOutlet],
	hostDirectives: [CdkListbox],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[attr.aria-labelledBy]': 'labelledBy()',
		'[attr.aria-controlledBy]': "id() +'-trigger'",
	},
	styles: [
		`
			:host {
				display: flex;
				box-sizing: border-box;
				flex-direction: column;
				outline: none;
				pointer-events: auto;
			}

			[data-brn-select-viewport] {
				scrollbar-width: none;
				-ms-overflow-style: none;
				-webkit-overflow-scrolling: touch;
			}

			[data-brn-select-viewport]::-webkit-scrollbar {
				display: none;
			}
		`,
	],
	template: `
		<ng-template #scrollUp>
			<ng-content select="hlm-select-scroll-up" />
			<ng-content select="brnSelectScrollUp" />
		</ng-template>
		<ng-container *ngTemplateOutlet="canScrollUp() && scrollUpBtn ? scrollUp : null"></ng-container>
		<div
			data-brn-select-viewport
			#viewport
			(scroll)="handleScroll()"
			style="flex: 1 1 0%;
			position: relative;
			width:100%;
			overflow:auto;
			min-height: 36px;"
		>
			<ng-content />
		</div>
		<ng-template #scrollDown>
			<ng-content select="brnSelectScrollDown" />
			<ng-content select="hlm-select-scroll-down" />
		</ng-template>
		<ng-container *ngTemplateOutlet="canScrollDown() && scrollDownBtn ? scrollDown : null"></ng-container>
	`,
})
export class BrnSelectContentComponent {
	private _el: ElementRef<HTMLElement> = inject(ElementRef);
	private _cdkListbox = inject(CdkListbox, { host: true });
	private _selectService = inject(BrnSelectService);

	protected labelledBy = this._selectService.labelId;
	protected id = this._selectService.id;
	protected canScrollUp = signal(false);
	protected canScrollDown = signal(false);

	@ViewChild('viewport')
	protected viewport!: ElementRef<HTMLElement>;

	@ContentChild(BrnSelectScrollUpDirective, { static: false })
	protected scrollUpBtn!: BrnSelectScrollUpDirective;

	@ContentChild(BrnSelectScrollDownDirective, { static: false })
	protected scrollDownBtn!: BrnSelectScrollDownDirective;

	@ContentChildren(BrnSelectOptionDirective, { descendants: true })
	protected _options!: QueryList<BrnSelectOptionDirective>;

	constructor() {
		this._cdkListbox.valueChange
			.asObservable()
			.pipe(takeUntilDestroyed())
			.subscribe((val: ListboxValueChangeEvent<unknown>) => this._selectService.listBoxValueChangeEvent$.next(val));

		effect(() => {
			this._cdkListbox.multiple = this._selectService.multiple();
			this._selectService.isExpanded() && setTimeout(() => this.updateArrowDisplay());
		});
	}

	updateArrowDisplay(): void {
		this.canScrollUp.set(this.viewport.nativeElement.scrollTop > 0);
		const maxScroll = this.viewport.nativeElement.scrollHeight - this.viewport.nativeElement.clientHeight;
		this.canScrollDown.set(Math.ceil(this.viewport.nativeElement.scrollTop) < maxScroll);
	}

	handleScroll() {
		this.updateArrowDisplay();
	}

	focusList(): void {
		this._cdkListbox.focus();
	}

	moveFocusUp() {
		this.viewport.nativeElement.scrollBy({ top: -100, behavior: 'smooth' });
		if (this.viewport.nativeElement.scrollTop === 0) {
			this.scrollUpBtn.stopEmittingEvents();
		}
	}

	moveFocusDown() {
		this.viewport.nativeElement.scrollBy({ top: 100, behavior: 'smooth' });
		const viewportSize = this._el.nativeElement.scrollHeight;
		const viewportScrollPosition = this.viewport.nativeElement.scrollTop;
		if (viewportSize + viewportScrollPosition + 100 > this.viewport.nativeElement.scrollHeight + 50) {
			this.scrollDownBtn.stopEmittingEvents();
		}
	}
}
