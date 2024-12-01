/**
 * HtmlTag: inline block
 */

/**
 * 防抖 执行最后一次
 * @param {number} delay 时延
 * @param {Function} fn func
 * @returns {Function} func
 */
function debounce(delay, fn) {
    let timerId = null;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            fn(...args);
            timerId = null;
        }, delay);
    }
};

/**
 * 节流 执行第一次
 * @param {number} delay 时延
 * @param {Function} fn func
 * @returns {Function} func
 */
function throttle(delay, fn) {
    let cd = false;
    return (...args) => {
        if (cd) { return; }
        cd = true;
        fn(...args);
        setTimeout(() => {
            cd = false;
        }, delay);
    }
};

/**
 * 
 * @param {string} text will render to html
 * @returns {HTMLDivElement} the RichTextEditor
 */
function renderRichTextEditor(text) {
    const box = document.createElement("div");
    const lines = text.split("\n");
    for (const line of lines) {
        if (line.startsWith("# ")) {
            let ele = document.createElement("h1");
            ele.innerText = line;
            box.appendChild(ele);
        } else if (line.startsWith("## ")) {
            let ele = document.createElement("h2");
            ele.innerText = line;
            box.appendChild(ele);
        } else if (line.startsWith("### ")) {
            let ele = document.createElement("h3");
            ele.innerText = line;
            box.appendChild(ele);
        } else {
            let ele = document.createElement("p");
            ele.innerText = line;
            box.appendChild(ele);
        }
    }
    return box;
}

/**
 * 
 * @param {string} text will render to html
 * @returns {HTMLDivElement} the ReadonlyHtml
 */
function renderReadonlyHtml(text) {
    const box = document.createElement("div");
    const lines = text.split("\n");
    const cache = { listNodes: [box] };
    mainLoop:
    for (const line of lines) {
        if (!line) continue;

        for (const item of [
            { tagM: "- ", tagH: "ul", level: 1 },
            { tagM: "-- ", tagH: "ul", level: 2 },
            { tagM: "--- ", tagH: "ul", level: 3 },
            { tagM: ". ", tagH: "ol", level: 1 },
            { tagM: ".. ", tagH: "ol", level: 2 },
            { tagM: "... ", tagH: "ol", level: 3 },
        ]) {
            if (appendList(line, item.tagM, item.tagH, item.level, cache, box)) continue mainLoop;
        }

        for (const item of [
            { tagM: "# ", tagH: "h1" },
            { tagM: "## ", tagH: "h2" },
            { tagM: "### ", tagH: "h3" },
        ]) {
            if (appendBlock(line, item.tagM, item.tagH, box)) continue mainLoop;
        }

        let ele = document.createElement("p");
        appendInline(line, ele);
        box.appendChild(ele);
    }
    return box;
}

/**
 * 
 * @param {string} line line
 * @param {string} tagM tag markdown
 * @param {string} tagH tag html
 * @param {number} listLevel list level
 * @param {{listNodes: HTMLElement[]}} cache cache
 * @param {HTMLElement} box box
 * @returns sucessful
 */
function appendList(line, tagM, tagH, listLevel, cache, box) {
    if (line.startsWith(tagM)) {
        // current 应是 cache.listNodes[listLevel] 且是最后一个元素
        let current = cache.listNodes[cache.listNodes.length - 1];
        if (current || cache.listNodes.length > listLevel + 1) {
            cache.listNodes = [box];
            current = box;
        }

        while (cache.listNodes.length < listLevel + 1) {
            let uol = document.createElement(tagH);
            current.appendChild(uol);
            current = uol;
            cache.listNodes.push(uol);
        }

        let li = document.createElement("li");
        appendInline(line.substring(tagM.length), li);
        current.appendChild(li);
        return true;
    }
    return false;
}

/**
 * 
 * @param {string} line line
 * @param {string} tagM tag markdown
 * @param {string} tagH tag html
 * @param {HTMLElement} box box
 */
function appendBlock(line, tagM, tagH, box) {
    if (line.startsWith(tagM)) {
        let ele = document.createElement(tagH);
        appendInline(line.substring(tagM.length), ele);
        box.appendChild(ele);
        return true;
    }
    return false;
}

/**
 * startWith '\ ' then will show origin
 * 
 * *Italic* **Bold** ~~Strikethrough~~
 * 
 * @param {string} text a line to html
 * @param {HTMLElement} ele the box
 */
function appendInline(text, ele) {
    ele.innerHTML = '';
    if (text.startsWith("\\ ")) {
        ele.innerText = text.substring(2);
        return;
    }

    /** @type {(string | number)[]} */
    let tree = [text];
    tree = splitTreeTag(tree, "~~", 1);
    tree = splitTreeTag(tree, "**", 2);
    tree = splitTreeTag(tree, "*", 3);

    /**@type {Map<number, string} */
    const tagMap = new Map();
    tagMap.set(1, "del");
    tagMap.set(2, "b");
    tagMap.set(3, "i");

    let currentNode = ele;
    for (const item of tree) {
        if (typeof item === "string") {
            currentNode.appendChild(document.createTextNode(item));
            continue;
        }
        let tagName = tagMap.get(item);

        if (!tagName) continue;
        if (currentNode.tagName.toLowerCase() === tagName) {
            currentNode = currentNode.parentElement || ele;
        } else {
            let next = document.createElement(tagName);
            currentNode.appendChild(next);
            currentNode = next;
        }
    }

}

/**
 * 
 * @param {(string | number)[]} tree 
 * @param {string} tag 
 * @param {number} num 
 */
function splitTreeTag(tree, tag, num) {
    const reuslt = [];
    for (const l of tree) {
        if (typeof l === "string") {
            for (const ll of l.split(tag)) {
                reuslt.push(ll);
                reuslt.push(num);
            }
            reuslt.pop();
        } else {
            reuslt.push(l);
        }
    }
    return reuslt;
}

/**
 * 
 * @param {HTMLDivElement} root the box will render
 * @param {boolean} contenteditable is contenteditable
 * @param {string} text the text will render
 */
function rootContenteditable(root, contenteditable, text) {
    if (contenteditable) {
        root.style.backgroundColor = 'gray';
        root.contentEditable = true;
        root.onblur = () => {
            let text = root.innerText;
            root.innerHTML = '';
            root.appendChild(renderRichTextEditor(text));
        };
        root.innerHTML = '';
        root.appendChild(renderRichTextEditor(text));
    } else {
        root.style.backgroundColor = 'white';
        root.contentEditable = false;
        root.onblur = () => { };
        root.innerHTML = '';
        root.appendChild(renderReadonlyHtml(text));
    }
}

(() => {
    // What You See Is What You Get (Fake and not support all nested)
    const switchBtn = document.getElementById("switchBtn");
    const root = document.getElementById("root");

    let text = "";
    let contenteditable = true;
    switchBtn.onclick = () => {
        if (contenteditable) {
            text = root.innerText;
        }
        console.log(text);
        contenteditable = !contenteditable;
        rootContenteditable(root, contenteditable, text);
    }

    rootContenteditable(root, contenteditable, text);
})();