function createMyUl() {
    const ul = document.createElement('ul');
    return ul;
}

function createMyLi(text) {
    const li = document.createElement('li');
    li.textContent = text;

    li.style.userSelect = 'none';
    li.draggable = true;
    li.ondragstart = (ev) => {
        
    }
    return li;
}

/**
 * 
 * @param {HTMLUListElement} outer ul outer node
 * @param {string[]} list 列表内容
 */
function setListInner(outer, list) {
    outer.innerHTML = '';
    list.forEach(line => outer.appendChild(createMyLi(line)));
}

(() => {
    // init
    const theList = createMyUl();
    setListInner(theList, ['qwe', 'asd', 'zxc']);
    document.body.appendChild(theList);
})();