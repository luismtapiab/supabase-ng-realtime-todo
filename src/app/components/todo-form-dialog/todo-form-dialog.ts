import { AsyncPipe, CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject } from "rxjs";

@Component({
    selector: 'app-todo-form-dialog',
    standalone: true,
    imports: [CommonModule, AsyncPipe, FormsModule],
    template: `
    <dialog [open]="$open | async">
        <article>
            <header>
                <a href="#close" aria-label="Close" class="close" (click)="close()"></a>
                <strong>Add New Todo</strong>
            </header>
            <form (submit)="save(); $event.preventDefault()">
                <label for="title">Title</label>
                <input type="text" [(ngModel)]="newTodoTitle" name="title" placeholder="What needs to be done?" required autofocus>
                
                <label for="content">Details (optional)</label>
                <textarea [(ngModel)]="newTodoContent" name="content" placeholder="Add more details..."></textarea>
                
                <footer>
                    <button type="button" class="secondary" (click)="close()">
                        Cancel
                    </button>
                    <button type="submit" [disabled]="!newTodoTitle.trim()">
                        Create Todo
                    </button>
                </footer>
            </form>
        </article>
    </dialog>
    `,
    styles: [`
        dialog article {
            width: 100%;
            max-width: 500px;
        }
        footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 1rem;
            padding: 0;
            background: transparent;
            border: none;
        }
        footer button {
            margin-bottom: 0;
            width: auto;
        }
    `]
})
export class TodoFormDialog {
    $open = new Subject<boolean>();
    newTodoTitle = '';
    newTodoContent = '';
    
    private saveFn: ((title: string, content: string) => void) | null = null;

    open(saveFn: (title: string, content: string) => void) {
        this.saveFn = saveFn;
        this.newTodoTitle = '';
        this.newTodoContent = '';
        this.$open.next(true);
    }

    close() {
        this.$open.next(false);
    }

    save() {
        if (this.newTodoTitle.trim() && this.saveFn) {
            this.saveFn(this.newTodoTitle, this.newTodoContent);
            this.close();
        }
    }
}
