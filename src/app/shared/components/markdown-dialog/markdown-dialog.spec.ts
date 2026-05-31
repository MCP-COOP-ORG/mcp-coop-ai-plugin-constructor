import { ComponentFixture, TestBed } from '@angular/core/testing';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { DomSanitizer } from '@angular/platform-browser';
import { MarkdownDialog } from './markdown-dialog';

describe('MarkdownDialog', () => {
    let component: MarkdownDialog;
    let fixture: ComponentFixture<MarkdownDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MarkdownDialog],
            providers: [
                {
                    provide: POLYMORPHEUS_CONTEXT,
                    useValue: { data: '**bold text**' },
                },
                {
                    provide: DomSanitizer,
                    useValue: { bypassSecurityTrustHtml: (val: string) => val },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MarkdownDialog);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have context data', () => {
        expect(component.context.data).toBe('**bold text**');
    });
});
