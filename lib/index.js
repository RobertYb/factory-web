"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const fbi_1 = require("fbi");
const build_1 = tslib_1.__importDefault(require("./commands/build"));
const serve_1 = tslib_1.__importDefault(require("./commands/serve"));
const react_1 = tslib_1.__importDefault(require("./templates/react"));
const micro_1 = tslib_1.__importDefault(require("./templates/micro"));
class FactoryWeb extends fbi_1.Factory {
    constructor() {
        super(...arguments);
        this.id = 'factory-web';
        this.description = 'factory for web factory development';
        this.commands = [new build_1.default(this), new serve_1.default(this)];
        this.templates = [new micro_1.default(this), new react_1.default(this)];
        this.execOpts = {
            cwd: process.cwd(),
            localDir: path_1.join(__dirname, '../'),
            preferLocal: true
        };
    }
}
exports.default = FactoryWeb;
