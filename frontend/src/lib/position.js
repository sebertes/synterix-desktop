export function positionMenu(button, menu) {
    menu.style.display = 'block';
    const buttonRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    menu.style.display = '';

    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let top;
    const spaceBelow = windowHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
        top = buttonRect.bottom;
        if (top + menuHeight > windowHeight) {
            top = windowHeight - menuHeight;
        }
    } else {
        top = buttonRect.top - menuHeight;
        if (top < 0) {
            top = 0;
        }
    }
    let left = buttonRect.left;
    if (left + menuWidth > windowWidth) {
        left = windowWidth - menuWidth - 10;
    }
    if (left < 0) {
        left = 0;
    }
    return {left, top};
}

export function positionMenuContext(clickEvent, menu) {
    menu.style.display = 'block';
    const menuRect = menu.getBoundingClientRect();
    menu.style.display = '';

    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let top = clickEvent.pageY;
    if (top + menuHeight > windowHeight) {
        top = windowHeight - menuHeight;
    }
    if (top < 0) {
        top = 0;
    }

    let left = clickEvent.pageX;
    if (left + menuWidth > windowWidth) {
        left = windowWidth - menuWidth - 10;
    }
    if (left < 0) {
        left = 0;
    }

    return {left, top};
}