const MIND_MAP_ID = 'root';
const SVG_CANVAS_ID = 'canv';
const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * @typedef {Object} FamilyTree
 * @property {?string} identity
 * @property {string} parent
 * @property {?FamilyTree[]} children
 */

/**
 *  
 * @param {number} round 
 * @param {string} familyPrefix 
 * @param {FamilyTree} family 
 */
function genEleIter(round, familyPrefix, family) {
    const box = document.createElement('div');
    box.className = 'family-box';

    const parent = document.createElement('div');
    parent.className = `parent-box parent-${round}`;
    parent.innerText = `${familyPrefix} ${family.parent}`;
    box.appendChild(parent);

    if (family.children) {
        const children = document.createElement('div');
        children.className = 'children-box';
        box.appendChild(children);
        for (let i = 0; i < family.children.length; i++) {
            const element = family.children[i];
            children.appendChild(genEleIter(round + 1, `${familyPrefix}${i + 1}.`, element));
        }
    }

    return box;
}

/**
 * 将数据生成文档对象以渲染
 * @param {FamilyTree} family 需渲染的数据
 * @returns {HTMLElement}
 */
function genEle(family) {
    return genEleIter(0, '', family);
}

/**
 * 
 * @param {HTMLElement} base 对其基准元素
 * @returns 
 */
function genSvgCanvas(base) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', `${base.offsetLeft + base.offsetWidth}`);
    svg.setAttribute('height', `${base.offsetTop + base.offsetHeight}`);

    const familyBoxs = document.querySelectorAll('.family-box');
    for (let i = 0; i < familyBoxs.length; i++) {
        /** @type {HTMLElement} */
        const familyBox = familyBoxs[i];

        /** @type {HTMLElement} */
        const parentBox = familyBox.querySelector('.parent-box');

        /** @type {HTMLElement} */
        const childrenBox = familyBox.querySelector('.children-box');

        for (let j = 0; j < childrenBox?.children.length; j++) {
            /** @type {HTMLElement} */
            // const child = childrenBox.children[j];
            const child = childrenBox.children[j].querySelector('.parent-box');

            let path = document.createElementNS(SVG_NS, 'path');

            let sourceX = parentBox.offsetLeft + parentBox.offsetWidth;
            // let sourceY = parentBox.offsetTop + parentBox.offsetHeight / 2;
            let sourceY = parentBox.offsetTop + parentBox.offsetHeight;
            let targetX = child.offsetLeft;
            // let targetY = child.offsetTop + child.offsetHeight / 2;
            let targetY = child.offsetTop + child.offsetHeight;
            path.setAttribute('d', `M ${sourceX} ${sourceY} ` +
                `Q ${(sourceX + targetX) / 2} ${sourceY} ${(sourceX + targetX) / 2} ${(sourceY + targetY) / 2} ` +
                `T ${targetX} ${targetY}`);
            path.setAttribute('stroke-width', '1');
            path.setAttribute('stroke', 'black');
            path.setAttribute('fill', 'none');

            svg.appendChild(path);
        }
    }

    return svg;
}

(() => {
    // todo 格式化存储 动态修改交互
    const exampleData = {
        parent: "主题啊打开数据库的",
        children: [
            { parent: "xx" },
            { parent: "xxx" },
            { parent: "xxxx" },
            {
                parent: "阿三大苏打撒旦",
                children: [
                    { parent: "a" },
                    { parent: "aa" },
                    { parent: "aa" },
                    {
                        parent: "aaaa",
                        children: [
                            { parent: "qwe" },
                            { parent: "asd" },
                            { parent: "xzc" },
                            {
                                parent: "sdsdsdsdsdsdsdsdsdsdsdsdsdsdsd",
                                children: [
                                    { parent: "asdsada" },
                                    {
                                        parent: "sdsdsdsdsdsdsdsdsdsdsdsdsdsdsd",
                                        children: [
                                            { parent: "asdsada" },
                                            {
                                                parent: "sdsdsdsdsdsdsdsdsdsdsdsdsdsdsd",
                                                children: [
                                                    { parent: "asdsada" },
                                                    {
                                                        parent: "sdsdsdsdsdsdsdsdsdsdsdsdsdsdsd",
                                                        children: [
                                                            { parent: "asdsada" },
                                                            {
                                                                parent: "sdsdsdsdsdsdsdsdsdssssssssssssssdsdsdsdsdsd",
                                                                children: [
                                                                    { parent: "asdsada" },
                                                                    { parent: "asdsada" },
                                                                ]
                                                            },
                                                            { parent: "asdsada" },
                                                        ]
                                                    },
                                                ]
                                            },
                                        ]
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
        ]
    };

    const mindMap = document.getElementById(MIND_MAP_ID);
    mindMap?.appendChild(genEle(exampleData));

    setInterval(() => {
        const canv = document.getElementById(SVG_CANVAS_ID);
        canv.innerHTML = '';
        const svgCanvas = genSvgCanvas(document.getElementById(MIND_MAP_ID));
        canv.appendChild(svgCanvas);
    }, 200);
})();
