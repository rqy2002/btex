import { Context } from '../Context';
import { ContainerElement, RenderElement, RenderOptions } from '../Element';
import { ParagraphElement } from './ParagraphElement';

export class ListElement implements ContainerElement {
  name: 'list' = 'list';
  children: {
    label: RenderElement[];
    content: RenderElement[];
  }[] = [];

  // This first paragraph element will not be rendered; rendering starts after the first \item.
  paragraph: ParagraphElement = new ParagraphElement();

  contentMode: boolean = true;

  normalise() {
    for (let child of this.children) {
      for (let e of child.label) e.normalise();
      child.label = child.label.filter((e) => !e.isEmpty());
      for (let e of child.content) e.normalise();
      child.content = child.content.filter((e) => !e.isEmpty());
    }
    this.children = this.children.filter(
      (child) => child.label.length > 0 || child.content.length > 0
    );
  }

  isEmpty(): boolean {
    return this.children.length === 0;
  }

  event(arg: string, context: Context): boolean {
    // TODO: errors when returning false
    switch (arg) {
      case '+':
        if (!this.contentMode) return false;
        this.paragraph = new ParagraphElement();
        this.children.push({ label: [this.paragraph], content: [] });
        this.contentMode = false;
        return true;
      case '.':
        if (this.children.length === 0 || this.contentMode) return false;
        this.contentMode = true;
        this.paragraph = new ParagraphElement(context);
        this.children[this.children.length - 1].content.push(this.paragraph);
        return true;
      case 'par':
        let child = this.children[this.children.length - 1];
        if (!child) return false;
        let list = this.contentMode ? child.content : child.label;
        this.paragraph = new ParagraphElement(context);
        list.push(this.paragraph);
        return true;
    }
    return false;
  }

  render(options?: RenderOptions): HTMLTableElement[] {
    if (this.isEmpty()) return [];

    let table = document.createElement('table');
    table.classList.add('list');
    for (let child of this.children) {
      let tr = document.createElement('tr');
      tr.classList.add('list-item');
      table.append(tr);

      let td = document.createElement('td');
      td.classList.add('list-item-label');
      tr.append(td);
      for (let e of child.label) td.append(...e.render(options));

      td = document.createElement('td');
      td.classList.add('list-item-content');
      tr.append(td);
      for (let e of child.content) td.append(...e.render(options));
    }

    return [table];
  }
}
