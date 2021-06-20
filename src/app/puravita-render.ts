export interface tagHTML {
    tag: string,
    id: string,
    attr: any|null,
    style: any|null,
    classes: Array<string|null>,
    children: Array<tagHTML|null>,
    type: string
}

export function renderFunction({
    tag, id, attr, classes, children, style, type,
}: tagHTML, parentEl: any = false): HTMLElement {
    let el: any = false;
    if (type === 'svg') {
        el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    } else {
        el = document.createElement(tag);
    }
    el.id = id;
    Object.keys(attr).forEach((key: string) => {
        el.setAttribute(key, attr[key]);
    });

    Object.keys(style).forEach((key: any) => {
        el.style[key] = style[key];
    });

    classes.forEach((cls) => {
        el.classList.add(cls);
    });

    children.forEach((child) => {
        renderFunction(child, el);
    });

    if (parentEl) {
        (parentEl as HTMLElement).appendChild(el);
    }

    return el;
}
