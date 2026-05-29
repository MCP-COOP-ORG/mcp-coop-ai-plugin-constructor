import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TextFormatPipe } from '@shared/pipes';

@Component({
    selector: 'app-step-header',
    imports: [TextFormatPipe],
    templateUrl: './step-header.html',
    styleUrl: './step-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepHeader {
    title = input.required<string>();
    description = input.required<string>();
    highlights = input<readonly string[]>([]);
}
