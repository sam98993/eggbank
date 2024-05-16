import ErrorOptions from '../error_options';
import HttpHeader from './http_header';
export default class HttpErrorOptions extends ErrorOptions {
    status: number;
    headers?: HttpHeader;
}
