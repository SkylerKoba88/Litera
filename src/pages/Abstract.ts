export default abstract class Abstract {
    protected params: URLSearchParams;

    constructor(params: URLSearchParams) {
        this.params = params;
    }

    setTitle(title: string):void {
        document.title = title;
    }

    abstract getHtml(): Promise<string>;

    abstract afterRender(): Promise<void>;
}