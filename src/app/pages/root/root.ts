import { Component } from "@angular/core";
import { TodoList } from "../../components/todo-list/todo-list";
import { LateralPanel } from "../../components/lateral-panel/lateral-panel";

@Component({
    selector: 'app-root',
    imports: [TodoList, LateralPanel],
    templateUrl: './root.html',
    styleUrls: ['./root.scss']
})
export class Root {

}
