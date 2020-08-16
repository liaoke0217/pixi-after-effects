"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ElementFinder {
    findByName(name, node) {
        return this.__findByName(name, node);
    }
    __findByName(name, node) {
        const foundNodes = [];
        if (node.name === name)
            foundNodes.push(node);
        node.children.forEach((child) => {
            if (child.name === name)
                foundNodes.push(child);
            this.__findByName(name, child).forEach((subnode) => {
                foundNodes.push(subnode);
            });
        });
        return foundNodes;
    }
}
exports.default = ElementFinder;
