import { Template } from 'fbi';
import * as ejs from 'ejs';
import Factory from '../index';
export default class TemplateReact extends Template {
    factory: Factory;
    id: string;
    description: string;
    path: string;
    renderer: typeof ejs.render;
    templates: never[];
    constructor(factory: Factory);
    protected gathering(flags: Record<string, any>): Promise<void>;
    protected writing(): Promise<void>;
    protected installing(flags: Record<string, any>): Promise<void>;
    protected ending(): Promise<void>;
}
